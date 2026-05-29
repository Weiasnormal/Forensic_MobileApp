export const DEFAULT_API_BASE_URL = process.env.EXPO_PUBLIC_AVERA_API_BASE_URL;
export const API_BASE_URL = process.env.EXPO_PUBLIC_AVERA_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;

export function buildApiUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalizedPath, API_BASE_URL).toString();
}

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
  cases: {
    list: '/cases',
    create: '/cases',
    get: (caseId: string) => `/cases/${caseId}`,
    update: (caseId: string) => `/cases/${caseId}`,
    updateStatus: (caseId: string) => `/cases/${caseId}/status`,
    delete: (caseId: string) => `/cases/${caseId}`,
    listDrafts: '/cases/drafts',
    createDraft: '/cases/drafts',
    updateDraft: (caseId: string) => `/cases/drafts/${caseId}`,
    deleteDraft: (caseId: string) => `/cases/drafts/${caseId}`,
    markResultViewed: (caseId: string) => `/cases/${caseId}/result-viewed`,
  },
  signatures: {
    uploadReference: (caseId: string) => `/cases/${caseId}/signatures/reference`,
    uploadSuspect: (caseId: string) => `/cases/${caseId}/signatures/suspect`,
    getReference: (caseId: string, index: number) => `/cases/${caseId}/signatures/reference/${index}`,
    getSuspect: (caseId: string) => `/cases/${caseId}/signatures/suspect`,
    getAll: (caseId: string) => `/cases/${caseId}/signatures`,
    deleteReference: (caseId: string, index: number) => `/cases/${caseId}/signatures/reference/${index}`,
    deleteSuspect: (caseId: string) => `/cases/${caseId}/signatures/suspect`,
  },
  analysis: {
    start: (caseId: string) => `/cases/${caseId}/analysis`,
    getStatus: (caseId: string) => `/cases/${caseId}/analysis/status`,
    getResults: (caseId: string) => `/cases/${caseId}/analysis/results`,
    updateResults: (caseId: string) => `/cases/${caseId}/analysis/results`,
  },
} as const;
