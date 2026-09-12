import { buildApiUrl, API_KEY, API_ENDPOINTS } from '@/constants/api';
import { getAuthHeader } from '@/store/authStore';

export async function sendVerificationEmail(): Promise<{ ok: boolean }> {
  try {
    const res = await fetch(buildApiUrl(API_ENDPOINTS.auth.verifySignupCode), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Api-Key': API_KEY || '',
        ...getAuthHeader(),
      },
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

export async function resendVerificationEmail(email: string): Promise<{ ok: boolean }> {
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