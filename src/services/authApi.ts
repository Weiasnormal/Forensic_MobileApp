import { API_ENDPOINTS, buildApiUrl, API_KEY } from '@/constants/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'User' | 'Admin';
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
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
  avatarUri?: string | null;
}

class ApiError extends Error {
  constructor(public status: number, public title: string, message: string) {
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

async function parseProblem(response: Response) {
  try {
    const json = await response.json();
    return json?.detail || json?.title || `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
}

function baseHeaders(extra?: Record<string, string>) {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Api-Key': API_KEY || '',
    ...extra,
  };
}

function authHeaders(token: string) {
  return baseHeaders({ Authorization: `Bearer ${token}` });
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const res = await fetch(buildApiUrl(API_ENDPOINTS.auth.login), {
    method: 'POST',
    headers: baseHeaders(),
    body: JSON.stringify({ email: request.email, password: request.password }),
  });

  if (!res.ok) {
    throw new ApiError(res.status, 'Login failed', await parseProblem(res));
  }

  const json = await res.json();
  return {
    accessToken: json.accessToken ?? json.AccessToken,
    expiresAt: json.expiresAt ?? json.ExpiresAt ?? json.expireAt ?? json.ExpireAt,
  };
}

export async function register(request: RegisterRequest): Promise<void> {
  const res = await fetch(buildApiUrl(API_ENDPOINTS.auth.register), {
    method: 'POST',
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
    throw new ApiError(res.status, 'Registration failed', await parseProblem(res));
  }
}

function isRegistrationConflict(error: unknown) {
  return (
    error instanceof ApiError &&
    (error.status === 400 || error.status === 409) &&
    /already|taken|exists|registered/i.test(error.message)
  );
}

function isUnverifiedLoginError(error: unknown) {
  return (
    error instanceof ApiError &&
    (error.status === 401 || error.status === 403) &&
    /not verified|unverified|verify your email|email verification/i.test(error.message)
  );
}

export async function resumeUnverifiedRegistration(
  request: RegisterRequest,
  registrationError: unknown,
): Promise<boolean> {
  if (!isRegistrationConflict(registrationError) && !(registrationError instanceof Error)) {
    throw registrationError;
  }

  try {
    await login({ email: request.email, password: request.password });
  } catch (loginError) {
    if (!isUnverifiedLoginError(loginError)) {
      return false;
    }
  }

  const resendResponse = await fetch(buildApiUrl(API_ENDPOINTS.auth.resendVerificationEmail), {
    method: 'POST',
    headers: baseHeaders(),
    body: JSON.stringify({ email: request.email.trim().toLowerCase() }),
  });

  return resendResponse.ok;
}

export async function fetchCurrentUser(token: string): Promise<UserProfileResponse> {
  const res = await fetch(buildApiUrl(API_ENDPOINTS.auth.profile), {
    method: 'GET',
    headers: authHeaders(token),
  });

  if (!res.ok) {
    throw new ApiError(res.status, 'Profile fetch failed', await parseProblem(res));
  }

  return res.json();
}

export async function logout(token: string): Promise<void> {
  const res = await fetch(buildApiUrl(API_ENDPOINTS.auth.logout), {
    method: 'POST',
    headers: authHeaders(token),
  });

  if (!res.ok && res.status !== 401) {
    // 401 here just means the token was already invalid — treat as already logged out
    throw new ApiError(res.status, 'Logout failed', await parseProblem(res));
  }
}

export async function changePassword(token: string, request: ChangePasswordRequest): Promise<void> {
  const res = await fetch(buildApiUrl(API_ENDPOINTS.auth.changePassword), {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      currentPassword: request.currentPassword,
      newPassword: request.newPassword,
    }),
  });

  if (!res.ok) {
    throw new ApiError(res.status, 'Change password failed', await parseProblem(res));
  }
}

export async function resetPassword(request: ResetPasswordRequest): Promise<void> {
  const res = await fetch(buildApiUrl(API_ENDPOINTS.auth.resetPassword), {
    method: 'POST',
    headers: baseHeaders(),
    body: JSON.stringify({
      email: request.email,
      token: request.token,
      password: request.password,
    }),
  });

  if (!res.ok) {
    throw new ApiError(res.status, 'Reset password failed', await parseProblem(res));
  }
}

export async function joinInviteCode(token: string, inviteCode: string): Promise<LoginResponse | null> {
  const res = await fetch(buildApiUrl(API_ENDPOINTS.auth.joinInviteCode), {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ inviteCode: inviteCode.trim().toUpperCase() }),
  });

  if (!res.ok && res.status !== 201) {
    throw new ApiError(res.status, 'Join invite code failed', await parseProblem(res));
  }

  if (res.status === 204) return null;
  try {
    const json = await res.json();
    const accessToken = json.accessToken ?? json.AccessToken;
    if (!accessToken) return null;
    return {
      accessToken,
      expiresAt: json.expiresAt ?? json.ExpiresAt ?? json.expireAt ?? json.ExpireAt,
    };
  } catch {
    return null;
  }
}
export async function forgotPassword(email: string): Promise<{ implemented: boolean }> {
  try {
    const res = await fetch(buildApiUrl(API_ENDPOINTS.auth.forgotPassword), {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({ email }),
    });
    return { implemented: res.ok };
  } catch {
    return { implemented: false };
  }
}

export async function deleteAccount(token: string): Promise<void> {
  const res = await fetch(buildApiUrl('/auth/delete'), {
    method: 'DELETE',
    headers: authHeaders(token),
  });

  if (!res.ok && res.status !== 204) {
    throw new ApiError(res.status, 'Delete account failed', await parseProblem(res));
  }
}

export { ApiError };