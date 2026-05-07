import { useMemo } from 'react';

export interface PasswordStrengthRequirement {
	label: string;
	met: boolean;
}

export interface PasswordStrengthResult {
	metChecks: number;
	filledBars: number;
	strengthLabel: string;
	strengthColor: string;
	missingRules: string[];
	requirements: PasswordStrengthRequirement[];
	isValid: boolean;
	passwordChecks: {
		minLength: boolean;
		upper: boolean;
		lower: boolean;
		number: boolean;
		special: boolean;
	};
}

export function usePasswordStrength(password: string): PasswordStrengthResult {
	const result = useMemo(() => {
		const passwordChecks = {
			minLength: password.trim().length >= 8,
			upper: /[A-Z]/.test(password),
			lower: /[a-z]/.test(password),
			number: /[0-9]/.test(password),
			special: /[^a-zA-Z0-9]/.test(password),
		};

		const metChecks = Object.values(passwordChecks).filter(Boolean).length;
		const filledBars = metChecks === 0 ? 1 : Math.min(metChecks, 4);

		const strengthLabel =
			metChecks <= 1 ? 'Poor' : metChecks === 2 ? 'Fair' : metChecks === 3 ? 'Good' : 'Strong';

		const strengthColor =
			metChecks <= 1
				? '#F05B57'
				: metChecks === 2
					? '#F2903D'
					: metChecks === 3
						? '#F2C94C'
						: metChecks === 4
							? '#82C365'
							: '#2E9F5C';

		const missingRules = [
			!passwordChecks.minLength ? 'at least 8 characters' : null,
			!passwordChecks.upper ? 'an uppercase letter' : null,
			!passwordChecks.lower ? 'a lowercase letter' : null,
			!passwordChecks.number ? 'a number' : null,
			!passwordChecks.special ? 'a special character' : null,
		].filter(Boolean) as string[];

		const requirements: PasswordStrengthRequirement[] = [
			{ label: 'At least 8 characters', met: passwordChecks.minLength },
			{ label: 'Uppercase letter', met: passwordChecks.upper },
			{ label: 'Lowercase letter', met: passwordChecks.lower },
			{ label: 'Number', met: passwordChecks.number },
			{ label: 'Special character', met: passwordChecks.special },
		];

		return {
			metChecks,
			filledBars,
			strengthLabel,
			strengthColor,
			passwordChecks,
			missingRules,
			requirements,
			isValid: missingRules.length === 0,
		};
	}, [password]);

	return result;
}
