import { buildApiUrl, API_KEY, API_ENDPOINTS } from '@/constants/api';
import { getAuthHeader } from '@/store/authStore';

/**
 * BACKEND TODO: Avera.WebApi/Endpoints/Auth/VerifyEmail.cs is currently an
 * empty stub (`routeBuilder.MapPost("/auth/verify-email", () => {})`).
 * There is no CommandHandler, no email template, and no token generation.
 * Until that's implemented, this function hits the real route (so nothing
 * is invented) but the backend does not actually send anything.
 * Replace with POST /auth/send-verification-email once it exists.
 */
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

/**
 * BACKEND TODO: no GET /auth/verification-status endpoint exists yet.
 * This always resolves false until that route ships — the UI treats it
 * as "still pending" rather than fabricating a success state.
 */
export async function checkEmailVerified(): Promise<boolean> {
  return false;
}

/**
 * BACKEND TODO: no /auth/change-email endpoint exists yet. Calling this
 * will 404. Kept isolated here so swapping in the real endpoint later is
 * a one-line change in one file.
 */
export async function requestEmailChange(newEmail: string): Promise<{ ok: boolean }> {
  try {
    const res = await fetch(buildApiUrl('/auth/change-email'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Api-Key': API_KEY || '',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ newEmail }),
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}