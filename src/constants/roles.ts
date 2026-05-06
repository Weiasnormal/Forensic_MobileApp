export type AppRole = 'analyst' | 'admin';

export const DEFAULT_ROLE: AppRole = 'analyst';

export const ROLE_LABEL: Record<AppRole, string> = {
  analyst: 'Forensic Analyst',
  admin: 'Org Admin',
};

export const ROLE_SETTINGS = {
  analyst: {
    signIn: {
      emailPlaceholder: 'admin@institution.gov.ph',
      redirectTo: '/User/user_dashboard' as const,
    },
    signUp: {
      subtitle: 'Almost there. Joining as a Forensic Analyst',
      emailPlaceholder: 'user@institution.gov.ph',
    },
    signUpCode: {
      title: 'Join Your Organization',
      subtitle: 'Enter the code your admin gave you',
      noCodeText: 'No code yet? Ask your organization admin',
    },
    pendingApproval: {
      description:
        "Your registration is under review.\nYou'll receive an email once approved by your Admin.",
      steps: [
        'Admin reviews your request',
        'You receive an approval email',
        'Sign in to access your dashboard',
      ],
    },
    forgotPassword: {
      emailPlaceholder: 'admin@institution.gov.ph',
      verificationEmail: 'admin@institution.gov.ph',
      successMessage: 'Your password has been updated successfully.',
    },
  },
  admin: {
    signIn: {
      emailPlaceholder: 'user@institution.gov.ph',
      redirectTo: '/Admin/admin_dashboard' as const,
    },
    signUp: {
      subtitle: 'Almost there. Joining as an Admin',
      emailPlaceholder: 'admin@institution.gov.ph',
    },
    signUpCode: {
      title: 'Activate Your Account',
      subtitle: 'Enter the code your Super Admin gave you',
      noCodeText: 'No code yet? Reach out to your Super Admin',
    },
    pendingApproval: {
      description:
        "Your registration is under review.\nYou'll receive an email once approved by your Super Admin.",
      steps: [
        'Super Admin reviews your request',
        'You receive an approval email',
        'Sign in to access your dashboard',
      ],
    },
    forgotPassword: {
      emailPlaceholder: 'user@institution.gov.ph',
      verificationEmail: 'user@institution.gov.ph',
      successMessage: 'Your password has been updated successfully.',
    },
  },
} as const;

export function resolveRole(role?: string): AppRole {
  return role === 'admin' ? 'admin' : DEFAULT_ROLE;
}
