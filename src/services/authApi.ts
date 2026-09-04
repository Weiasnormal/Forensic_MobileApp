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

export interface LoginResponse {
  accessToken: string;
  expiresAt: string;
}

class ApiError extends Error {
  constructor(public status: number, public title: string, message: string) {
    super(message);
  }
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
    expiresAt: json.expiresAt ?? json.ExpiresAt,
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

export async function joinInviteCode(token: string, inviteCode: string): Promise<void> {
  const url = buildApiUrl(
    `${API_ENDPOINTS.auth.joinInviteCode}?InviteCode=${encodeURIComponent(inviteCode)}`,
  );

  const res = await fetch(url, {
    method: 'POST',
    headers: authHeaders(token),
  });

  if (!res.ok && res.status !== 201) {
    throw new ApiError(res.status, 'Join invite code failed', await parseProblem(res));
  }
}
/**
 * NOT READY: backend ForgotPasswordCommandHandler.ForgotPasswordAsync
 * throws NotImplementedException unconditionally. Calling this will always
 * fail with a 500. Kept here so the UI can call it and show a friendly
 * "not available yet" message instead of a raw network error, but do not
 * build a working reset flow around it until backend ships email sending.
 */
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