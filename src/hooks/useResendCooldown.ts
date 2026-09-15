import { useEffect, useState } from 'react';

const RESEND_COOLDOWN_SECONDS = 5;

export function useResendCooldown() {
	const [secondsRemaining, setSecondsRemaining] = useState(0);

	useEffect(() => {
		if (secondsRemaining === 0) return;

		const timer = setTimeout(() => {
			setSecondsRemaining((current) => Math.max(current - 1, 0));
		}, 1000);

		return () => clearTimeout(timer);
	}, [secondsRemaining]);

	return {
		secondsRemaining,
		isCoolingDown: secondsRemaining > 0,
		startCooldown: () => setSecondsRemaining(RESEND_COOLDOWN_SECONDS),
	};
}
