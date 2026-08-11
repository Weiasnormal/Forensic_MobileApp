export const DEFAULT_API_BASE_URL = process.env.EXPO_PUBLIC_AVERA_API_BASE_URL;
export const API_BASE_URL = process.env.EXPO_PUBLIC_AVERA_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;

export const API_KEY = process.env.EXPO_PUBLIC_AVERA_API_KEY;

export function buildApiUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalizedPath, API_BASE_URL).toString();
}

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    changePassword: '/auth/change-password',

    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',

    google: '/auth/google',
    verifySignupCode: '/auth/verify-email',

    //wala sa backend
    joinInviteCode: '/auth/join-invite-code',
    sendInviteCode: '/auth/send-invite-code',

    //wala sa backend
    resendSignupCode: '/auth/refresh',
    verifyResetCode: '/auth/password/verify-code',
    verifyEmail: '/auth/verify-email',
    refresh: '/auth/refresh',
    validateInviteCode: (code: string) => `/auth/validate-invite-code/${code}`,
    registerAdmin: '/auth/register-admin',
    
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

    // wala sa backend
    markResultViewed: (caseId: string) => `/cases/${caseId}/result-viewed`,
  },
  signatures: {
    uploadReference: (caseId: string) => `/cases/${caseId}/signatures/reference`,
    uploadSuspected: (caseId: string) => `/cases/${caseId}/signatures/suspected`,
    getReference: (caseId: string, index: number) => `/cases/${caseId}/signatures/reference/${index}`,
    getSuspected: (caseId: string, index: number) => `/cases/${caseId}/signatures/suspected/${index}`,

    getAll: (caseId: string) => `/cases/${caseId}/signatures`, // wala sa backend

    deleteReference: (caseId: string, index: number) => `/cases/${caseId}/signatures/reference/${index}`,
    deleteSuspected: (caseId: string, index: number) => `/cases/${caseId}/signatures/suspected/${index}`,
  },
  analysis: {
    start: (caseId: string) => `/cases/${caseId}/analysis`,
    getStatus: () => `/ml/health`,
    getResults: (caseId: string) => `/cases/${caseId}/results`
    //updateResults: (caseId: string) => `/cases/${caseId}/analysis/results`,
  },
  ml: {
    getBlobImage: (caseId: string, imageId: string) =>
      `/cases/${caseId}/images/${imageId}`,
  },
} as const;
