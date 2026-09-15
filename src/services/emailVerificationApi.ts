import { buildApiUrl, API_KEY, API_ENDPOINTS } from '@/constants/api';
import { getAuthHeader } from '@/store/authStore';

interface VerificationRequestResult {
  ok: boolean;
  message?: string;
}

export async function sendVerificationEmail(email: string): Promise<{ ok: boolean }> {
  try {
    const res = await fetch(buildApiUrl(API_ENDPOINTS.auth.resendVerificationEmail), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Api-Key': API_KEY || '',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}


export async function verifyEmailToken(userId: string, token: string): Promise<{ ok: boolean }> {
  try {
    const res = await fetch(buildApiUrl(API_ENDPOINTS.auth.verifySignupCode), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Api-Key': API_KEY || '',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ userId, token }),
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}

/**
 * BACKEND TODO: no GET /auth/verification-status endpoint exists yet.
 * This always resolves false until that route ships — the UI treats it
 * as "still pending" rather than fabricating a success state.
 */
export async function checkEmailVerified(): Promise<boolean> {
  return false;
}

/**
 * Requests a password-authenticated email change verification link.
 */
export async function requestEmailChange(newEmail: string, currentPassword: string): Promise<{ ok: boolean }> {
  try {
    const res = await fetch(buildApiUrl(API_ENDPOINTS.auth.changeEmail), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Api-Key': API_KEY || '',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ newEmail, currentPassword }),
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}

export async function resendVerificationEmail(email: string): Promise<VerificationRequestResult> {
  try {
    const res = await fetch(buildApiUrl(API_ENDPOINTS.auth.resendVerificationEmail), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Api-Key': API_KEY || '',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
    if (res.ok) return { ok: true };

    try {
      const body = await res.json();
      return {
        ok: false,
        message: body?.detail ?? body?.message ?? body?.title,
      };
    } catch {
      return { ok: false, message: `Request failed (${res.status})` };
    }
  } catch {
    return { ok: false, message: 'Unable to reach the verification service.' };
  }
}