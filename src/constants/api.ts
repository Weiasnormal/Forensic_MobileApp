export const DEFAULT_API_BASE_URL = process.env.EXPO_PUBLIC_AVERA_API_BASE_URL?.trim() || 'https://avera-api.lemonwave-c38ebe4d.southeastasia.azurecontainerapps.io';
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
    login: '/auth/login',
    register: '/auth/register',
    verifySignupCode: '/auth/verify-email',
    resendSignupCode: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    verifyResetCode: '/auth/password/verify-code',
    resetPassword: '/auth/reset-password',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    validateInviteCode: (code: string) => `/auth/validate-invite-code/${code}`,
    registerAdmin: '/auth/register-admin',
    google: '/auth/google',
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
    uploadSuspected: (caseId: string) => `/cases/${caseId}/signatures/suspected`,
    getReference: (caseId: string, index: number) => `/cases/${caseId}/signatures/reference/${index}`,
    getSuspected: (caseId: string, index: number) => `/cases/${caseId}/signatures/suspected/${index}`,
    getAll: (caseId: string) => `/cases/${caseId}/signatures`,
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
  getBlobImage: (caseId: string, folder: string, fileName: string) =>
    `/cases/${caseId}/blob/${folder}/${fileName}`,
},
} as const;
