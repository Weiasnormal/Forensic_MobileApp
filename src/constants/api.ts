export const API_ENDPOINTS = {
  auth: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    verifySignupCode: '/auth/sign-up/verify-code',
    resendSignupCode: '/auth/sign-up/resend-code',
    forgotPassword: '/auth/password/forgot',
    verifyResetCode: '/auth/password/verify-code',
    resetPassword: '/auth/password/reset',
  },
} as const;
