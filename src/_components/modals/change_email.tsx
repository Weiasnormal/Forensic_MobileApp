import React, { useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useBottomSheetTransition } from '@/_components/transition';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import FormField from '@/_components/common/FormField';
import PrimaryButton from '@/_components/common/PrimaryButton';
import SecondaryButton from '@/_components/common/SecondaryButton';

interface ChangeEmailModalProps {
	visible: boolean;
	currentEmail: string;
	onClose: () => void;
	onSent: (newEmail: string) => void;
}

export default function ChangeEmailModal({ visible, currentEmail, onClose, onSent }: ChangeEmailModalProps) {
	const { isMounted, sheetY, backdropOpacity, dragHandlePanHandlers } = useBottomSheetTransition({
		visible,
		onClose,
	});
	const [newEmail, setNewEmail] = useState('');
	const [isSending, setIsSending] = useState(false);
	const [error, setError] = useState<string | null>(null);

	if (!isMounted) return null;

	const canSend = /\S+@\S+\.\S+/.test(newEmail) && newEmail.trim() !== currentEmail.trim();

	const handleSend = async () => {
		if (!canSend) return;
		setIsSending(true);
		setError(null);
		try {
			const { requestEmailChange } = await import('@/services/emailVerificationApi');
			const { ok } = await requestEmailChange(newEmail.trim());
			if (!ok) {
				setError('This isn\u2019t available yet — email change requires a backend update.');
				return;
			}
			onSent(newEmail.trim());
			setNewEmail('');
		} finally {
			setIsSending(false);
		}
	};

	return (
		<Modal visible={isMounted} transparent onRequestClose={onClose} statusBarTranslucent>
			<View style={styles.root}>
				<Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
					<Animated.View pointerEvents="none" style={[styles.backdrop, { opacity: backdropOpacity }]} />
				</Pressable>

				<Animated.View style={[styles.sheet, { transform: [{ translateY: sheetY }] }]}>
					<View style={styles.dragHandleWrap} {...dragHandlePanHandlers}>
						<View style={styles.dragHandle} />
					</View>

					<Text allowFontScaling={false} style={styles.title}>Change Email</Text>
					<Text allowFontScaling={false} style={styles.subtitle}>Login stays the same until confirmed</Text>

					<FormField
						label="Current email"
						value={currentEmail}
						disabled
						style={styles.field}
					/>

					<FormField
						label="New email"
						value={newEmail}
						onChangeText={setNewEmail}
						placeholder="new@institution.gov.ph"
						keyboardType="email-address"
						autoCapitalize="none"
						style={styles.field}
						error={error ?? undefined}
					/>

					<Text allowFontScaling={false} style={styles.footnote}>
						Current email is also notified of this change.
					</Text>

					<View style={styles.buttonRow}>
						<SecondaryButton label="Cancel" onPress={onClose} size="medium" style={styles.halfButton} />
						<PrimaryButton
							label={isSending ? 'Sending…' : 'Send Link'}
							onPress={handleSend}
							disabled={!canSend || isSending}
							loading={isSending}
							size="medium"
							style={styles.halfButton}
						/>
					</View>
				</Animated.View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	root: { flex: 1, justifyContent: 'flex-end' },
	backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay },
	sheet: {
		backgroundColor: colors.background2,
		borderTopLeftRadius: 22,
		borderTopRightRadius: 22,
		paddingHorizontal: 20,
		paddingTop: 10,
		paddingBottom: 28,
		borderWidth: 1,
		borderColor: colors.sheetBorder,
	},
	dragHandleWrap: { alignItems: 'center', paddingBottom: 10 },
	dragHandle: { width: 44, height: 5, borderRadius: 999, backgroundColor: colors.sheetHandle },
	title: { ...getTypographyStyle('t2Title'), color: colors.textPrimary },
	subtitle: { ...getTypographyStyle('c1Caption', 'regular'), color: colors.textSecondary, marginTop: 4, marginBottom: 18 },
	field: { marginBottom: 14 },
	footnote: { ...getTypographyStyle('c2Caption', 'regular'), color: colors.textTertiary, marginBottom: 18 },
	buttonRow: { flexDirection: 'row', gap: 10 },
	halfButton: { flex: 1 },
});