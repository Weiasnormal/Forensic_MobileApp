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
 * BACKEND TODO: Avera.WebApi/Endpoints/Auth/VerifyEmail.cs is currently an
 * empty stub (MapPost("/auth/verify-email", () => {})). It does not read the
 * token, does not touch the DB, and always returns 200. This function is
 * wired up so the deep-link -> verify -> unlock-Continue pipeline can be
 * built/tested now, but it is NOT a real security gate until the backend:
 *   1. Generates a token + sends a magic-link email on signup (no template
 *      exists for this yet — forgot-password.cshtml sends a 6-digit code,
 *      not a link).
 *   2. Validates the token server-side and sets EmailConfirmed via
 *      UserManager<User>, rejecting invalid/expired/reused tokens.
 * Do not treat a 200 here as proof of anything until that ships.
 */
export async function verifyEmailToken(token: string): Promise<{ ok: boolean }> {
  try {
    const res = await fetch(buildApiUrl(API_ENDPOINTS.auth.verifySignupCode), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Api-Key': API_KEY || '',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ token }),
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