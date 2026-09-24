import { API_ENDPOINTS, API_KEY, buildApiUrl } from "@/constants/api";
import {
    getServerErrorMessage,
    NETWORK_ERROR_MESSAGE,
} from "@/utils/networkError";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "User" | "Admin";
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangeNameRequest {
  newName: string;
  newLastName: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresAt: string;
}

export interface UserProfileResponse {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  organization?: string;
  dailyCaseLimit?: number | null;
  avatarUri?: string | null;
}

class ApiError extends Error {
  constructor(
    public status: number,
    public title: string,
    message: string,
  ) {
    super(message);
  }
}

export function isEmailVerificationRequired(error: unknown) {
  if (!(error instanceof ApiError)) {
    return false;
  }

  return (
    (error.status === 400 || error.status === 401 || error.status === 403) &&
    /email.*(verify|verified|confirm|confirmed|activation)|(verify|verified|confirm|confirmed|activation).*email/i.test(
      error.message,
    )
  );
}

export function normalizeAuthErrorMessage(
  message: unknown,
  email?: string,
): string {
  const rawMessage =
    typeof message === "string" ? message : String(message ?? "");
  const trimmed = rawMessage.trim();

  if (!trimmed) {
    return NETWORK_ERROR_MESSAGE;
  }

  const emailValue = email?.trim();
  const emailLabel = emailValue ? ` (${emailValue})` : "";

  if (
    /(username|user name)/i.test(trimmed) &&
    /(already|taken|exists|registered)/i.test(trimmed)
  ) {
    return `Email${emailLabel} is already taken`;
  }

  if (
    /email/i.test(trimmed) &&
    /(already|taken|exists|registered)/i.test(trimmed)
  ) {
    return `Email${emailLabel} is already taken`;
  }

  return trimmed;
}

export function normalizeInviteCodeErrorMessage(message: unknown): string {
  const rawMessage =
    typeof message === "string" ? message : String(message ?? "");
  const trimmed = rawMessage.trim();

  if (!trimmed) {
    return "Unable to verify invite code. Please try again.";
  }

  if (
    /(expired|expiration|has expired|expired code|code expired)/i.test(trimmed)
  ) {
    return "This invite code has expired. Please request a new one.";
  }

  if (
    /(invalid|not valid|not recognized|does not exist|wrong code|incorrect code|bad code)/i.test(
      trimmed,
    )
  ) {
    return "Invite code is invalid. Please check the code and try again.";
  }

  if (/(already used|used up|already been used)/i.test(trimmed)) {
    return "This invite code has already been used.";
  }

  if (
    /(already.*(pending|request|member|organization|tenant)|pending.*request|request.*already)/i.test(
      trimmed,
    )
  ) {
    return "You already have a pending request for this organization.";
  }

  if (
    /(organization.*(not found|missing)|tenant.*(not found|missing))/i.test(
      trimmed,
    )
  ) {
    return "The organization tied to this invite code could not be found.";
  }

  return "Unable to verify invite code. Please try again.";
}

async function parseProblem(response: Response) {
  try {
    const json = await response.json();
    return normalizeAuthErrorMessage(
      getServerErrorMessage(response.status, json?.detail || json?.title),
    );
  } catch {
    return getServerErrorMessage(response.status);
  }
}

function baseHeaders(extra?: Record<string, string>) {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Api-Key": API_KEY || "",
    ...extra,
  };
}

function authHeaders(token: string) {
  return baseHeaders({ Authorization: `Bearer ${token}` });
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const res = await fetch(buildApiUrl(API_ENDPOINTS.auth.login), {
    method: "POST",
    headers: baseHeaders(),
    body: JSON.stringify({ email: request.email, password: request.password }),
  });

  if (!res.ok) {
    throw new ApiError(res.status, "Login failed", await parseProblem(res));
  }

  const json = await res.json();
  return {
    accessToken: json.accessToken ?? json.AccessToken,
    expiresAt:
      json.expiresAt ?? json.ExpiresAt ?? json.expireAt ?? json.ExpireAt,
  };
}

export async function register(request: RegisterRequest): Promise<void> {
  const res = await fetch(buildApiUrl(API_ENDPOINTS.auth.register), {
    method: "POST",
    headers: baseHeaders(),
    body: JSON.stringify({
      firstName: request.firstName,
      lastName: request.lastName,
      email: request.email,
      password: request.password,
      role: request.role,
    }),
  });

  if (!res.ok) {
    throw new ApiError(
      res.status,
      "Registration failed",
      await parseProblem(res),
    );
  }
}

function isRegistrationConflict(error: unknown) {
  if (!(error instanceof ApiError)) return false;

  const isKnownConflict =
    (error.status === 400 || error.status === 409) &&
    /already|taken|exists|registered/i.test(error.message);

  const isLikelyPostCreateServerFailure =
    (error.status === 500 || error.status === 502 || error.status === 503) &&
    /already|taken|exists|registered|email|verification|created/i.test(
      error.message,
    );

  return isKnownConflict || isLikelyPostCreateServerFailure;
}

function isUnverifiedLoginError(error: unknown) {
  if (!(error instanceof ApiError)) return false;

  const matchesVerificationError =
    /not verified|unverified|verify your email|email verification|activation|confirm your email|confirm email/i.test(
      error.message,
    );

  const matchesTenantFlow =
    /tenant|organization.*required|member.*required|account.*not.*active/i.test(
      error.message,
    );

  return (
    (error.status === 401 || error.status === 403 || error.status === 400) &&
    (matchesVerificationError || matchesTenantFlow)
  );
}

export async function resumeUnverifiedRegistration(
  request: RegisterRequest,
  registrationError: unknown,
): Promise<boolean> {
  const canResumeForAccountAlreadyCreated =
    isRegistrationConflict(registrationError) ||
    (registrationError instanceof Error &&
      /already|taken|exists|registered|email|verification|created/i.test(
        registrationError.message,
      ));

  if (!canResumeForAccountAlreadyCreated) {
    throw registrationError;
  }

  try {
    await login({ email: request.email, password: request.password });
  } catch (loginError) {
    if (!isUnverifiedLoginError(loginError)) {
      // The account may still be created even if the login call didn't return the
      // expected "unverified" signal. The safest next step is to resend the
      // verification email and continue the user to the verification screen.
      const resendResponse = await fetch(
        buildApiUrl(API_ENDPOINTS.auth.resendVerificationEmail),
        {
          method: "POST",
          headers: baseHeaders(),
          body: JSON.stringify({ email: request.email.trim().toLowerCase() }),
        },
      );

      return resendResponse.ok;
    }
  }

  const resendResponse = await fetch(
    buildApiUrl(API_ENDPOINTS.auth.resendVerificationEmail),
    {
      method: "POST",
      headers: baseHeaders(),
      body: JSON.stringify({ email: request.email.trim().toLowerCase() }),
    },
  );

  return resendResponse.ok;
}

export async function fetchCurrentUser(
  token: string,
): Promise<UserProfileResponse> {
  const res = await fetch(buildApiUrl(API_ENDPOINTS.auth.profile), {
    method: "GET",
    headers: authHeaders(token),
  });

  if (!res.ok) {
    throw new ApiError(
      res.status,
      "Profile fetch failed",
      await parseProblem(res),
    );
  }

  return res.json();
}

export async function logout(token: string): Promise<void> {
  const res = await fetch(buildApiUrl(API_ENDPOINTS.auth.logout), {
    method: "POST",
    headers: authHeaders(token),
  });

  if (!res.ok && res.status !== 401) {
    // 401 here just means the token was already invalid — treat as already logged out
    throw new ApiError(res.status, "Logout failed", await parseProblem(res));
  }
}

export async function changePassword(
  token: string,
  request: ChangePasswordRequest,
): Promise<void> {
  const res = await fetch(buildApiUrl(API_ENDPOINTS.auth.changePassword), {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      currentPassword: request.currentPassword,
      newPassword: request.newPassword,
    }),
  });

  if (!res.ok) {
    throw new ApiError(
      res.status,
      "Change password failed",
      await parseProblem(res),
    );
  }
}

export async function changeName(
  token: string,
  request: ChangeNameRequest,
): Promise<void> {
  const res = await fetch(buildApiUrl(API_ENDPOINTS.auth.changeName), {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      NewName: request.newName,
      NewLastName: request.newLastName,
    }),
  });

  if (!res.ok) {
    throw new ApiError(
      res.status,
      "Change name failed",
      await parseProblem(res),
    );
  }
}

export async function resetPassword(
  request: ResetPasswordRequest,
): Promise<void> {
  const res = await fetch(buildApiUrl(API_ENDPOINTS.auth.resetPassword), {
    method: "POST",
    headers: baseHeaders(),
    body: JSON.stringify({
      email: request.email,
      token: request.token,
      password: request.password,
    }),
  });

  if (!res.ok) {
    throw new ApiError(
      res.status,
      "Reset password failed",
      await parseProblem(res),
    );
  }
}

export async function joinInviteCode(
  token: string,
  inviteCode: string,
): Promise<LoginResponse | null> {
  const normalizedInviteCode = inviteCode.trim().toUpperCase();
  const requestBody = JSON.stringify({
    inviteCode: normalizedInviteCode,
    code: normalizedInviteCode,
  });
  const requestUrl = buildApiUrl(API_ENDPOINTS.auth.joinInviteCode);
  const requestHeaders = authHeaders(token);

  console.log("[AuthApi] Sending organization invite code request", {
    method: "POST",
    url: requestUrl,
    headers: Object.fromEntries(
      Object.entries(requestHeaders).map(([key, value]) => [
        key,
        key.toLowerCase() === "authorization" ? "[REDACTED]" : value,
      ]),
    ),
    inviteCode: normalizedInviteCode,
    requestBody,
  });

  const res = await fetch(requestUrl, {
    method: "POST",
    headers: requestHeaders,
    body: requestBody,
  });

  if (!res.ok && res.status !== 201) {
    throw new ApiError(
      res.status,
      "Join invite code failed",
      await parseProblem(res),
    );
  }

  if (res.status === 204) return null;
  try {
    const json = await res.json();
    const accessToken = json.accessToken ?? json.AccessToken;
    if (!accessToken) return null;
    return {
      accessToken,
      expiresAt:
        json.expiresAt ?? json.ExpiresAt ?? json.expireAt ?? json.ExpireAt,
    };
  } catch {
    return null;
  }
}
export async function forgotPassword(
  email: string,
): Promise<{ implemented: boolean; expiresAt?: string }> {
  try {
    const res = await fetch(buildApiUrl(API_ENDPOINTS.auth.forgotPassword), {
      method: "POST",
      headers: baseHeaders(),
      body: JSON.stringify({ email }),
    });

    if (!res.ok) return { implemented: false };

    const expiresAtHeader = res.headers.get("x-code-expires-at");
    const retryAfter = Number(res.headers.get("retry-after"));

    try {
      const body = await res.json();
      const bodyExpiresAt =
        body?.expiresAt ??
        body?.ExpiresAt ??
        body?.codeExpiresAt ??
        body?.CodeExpiresAt ??
        body?.expiration ??
        body?.Expiration;
      const expiresInSeconds = Number(
        body?.expiresInSeconds ?? body?.ExpiresInSeconds ?? body?.expiresIn,
      );

      return {
        implemented: true,
        expiresAt:
          typeof bodyExpiresAt === "string"
            ? bodyExpiresAt
            : Number.isFinite(expiresInSeconds) && expiresInSeconds > 0
              ? new Date(Date.now() + expiresInSeconds * 1000).toISOString()
              : (expiresAtHeader ??
                (Number.isFinite(retryAfter) && retryAfter > 0
                  ? new Date(Date.now() + retryAfter * 1000).toISOString()
                  : undefined)),
      };
    } catch {
      return {
        implemented: true,
        expiresAt:
          expiresAtHeader ??
          (Number.isFinite(retryAfter) && retryAfter > 0
            ? new Date(Date.now() + retryAfter * 1000).toISOString()
            : undefined),
      };
    }
  } catch {
    return { implemented: false };
  }
}

export async function deleteAccount(token: string): Promise<void> {
  const res = await fetch(buildApiUrl("/auth/delete"), {
    method: "DELETE",
    headers: authHeaders(token),
  });

  if (!res.ok && res.status !== 204) {
    throw new ApiError(
      res.status,
      "Delete account failed",
      await parseProblem(res),
    );
  }
}

export { ApiError };

