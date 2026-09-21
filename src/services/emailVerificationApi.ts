import { API_ENDPOINTS, API_KEY, buildApiUrl } from '@/constants/api';
import { getAuthHeader } from '@/store/authStore';
import { getServerErrorMessage, NETWORK_ERROR_MESSAGE } from '@/utils/networkError';

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
    const query = new URLSearchParams({ userId, token });
    const res = await fetch(
      `${buildApiUrl(API_ENDPOINTS.auth.verifySignupCode)}?${query.toString()}`,
      {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-Api-Key': API_KEY || '',
        ...getAuthHeader(),
      },
      },
    );
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}

export async function checkEmailVerified(): Promise<boolean> {
  try {
    const res = await fetch(
      buildApiUrl(API_ENDPOINTS.auth.emailVerificationStatus),
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'X-Api-Key': API_KEY || '',
          ...getAuthHeader(),
        },
      },
    );
    if (!res.ok) return false;

    const body = await res.json();
    return Boolean(
      body?.isVerified ??
        body?.IsVerified ??
      body?.emailConfirmed ??
      body?.EmailConfirmed ??
        body?.emailVerified ??
        body?.EmailVerified ??
        body?.value ??
        body?.Value,
    );
  } catch {
    return false;
  }
}

/**
 * Requests a password-authenticated email change verification link.
 */
export async function requestEmailChange(
  newEmail: string,
  currentPassword: string,
): Promise<{ ok: boolean; message?: string }> {
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
    if (res.ok) return { ok: true };

    try {
      const body = await res.json();
      return {
        ok: false,
        message: getServerErrorMessage(
          res.status,
          body?.detail ?? body?.message ?? body?.title,
        ),
      };
    } catch {
      return { ok: false, message: getServerErrorMessage(res.status) };
    }
  } catch {
    return { ok: false, message: NETWORK_ERROR_MESSAGE };
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
        message: getServerErrorMessage(
          res.status,
          body?.detail ?? body?.message ?? body?.title,
        ),
      };
    } catch {
      return { ok: false, message: getServerErrorMessage(res.status) };
    }
  } catch {
    return { ok: false, message: NETWORK_ERROR_MESSAGE };
  }
}

export async function resendEmailChangeVerification(
  currentEmail: string,
  newEmail: string,
): Promise<VerificationRequestResult> {
  try {
    const res = await fetch(
      buildApiUrl(API_ENDPOINTS.auth.resendVerificationEmail),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Api-Key': API_KEY || '',
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          email: currentEmail.trim().toLowerCase(),
          type: 'change-email',
          newEmail: newEmail.trim().toLowerCase(),
        }),
      },
    );
    if (res.ok) return { ok: true };

    try {
      const body = await res.json();
      return {
        ok: false,
        message: getServerErrorMessage(
          res.status,
          body?.detail ?? body?.message ?? body?.title,
        ),
      };
    } catch {
      return { ok: false, message: getServerErrorMessage(res.status) };
    }
  } catch {
    return { ok: false, message: NETWORK_ERROR_MESSAGE };
  }
}