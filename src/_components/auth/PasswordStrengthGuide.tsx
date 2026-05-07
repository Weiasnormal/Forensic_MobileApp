import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { usePasswordStrength } from '../../hooks/usePasswordStrength';

interface PasswordStrengthGuideProps {
	password: string;
	isVisible: boolean;
	showError: boolean;
	errorMessage?: string;
}

export function PasswordStrengthGuide({ password, isVisible, showError, errorMessage = 'Password does not meet requirements.' }: PasswordStrengthGuideProps) {
	const { filledBars, requirements, missingRules, strengthColor, strengthLabel } = usePasswordStrength(password);

	if (showError) {
		return (
			<Text allowFontScaling={false} style={styles.errorText}>
				{errorMessage}
				{missingRules.length > 0 ? `: ${missingRules.join(', ')}` : ''}
			</Text>
		);
	}

	if (!isVisible) {
		return null;
	}

	return (
		<View style={styles.container}>
			<View style={styles.strengthRow}>
				<View style={[styles.strengthBar, filledBars >= 1 && { backgroundColor: strengthColor }]} />
				<View style={[styles.strengthBar, filledBars >= 2 && { backgroundColor: strengthColor }]} />
				<View style={[styles.strengthBar, filledBars >= 3 && { backgroundColor: strengthColor }]} />
				<View style={[styles.strengthBar, filledBars >= 4 && { backgroundColor: strengthColor }]} />
			</View>

			<Text allowFontScaling={false} style={[styles.strengthLabel, { color: strengthColor }]}>{strengthLabel}</Text>

			<View style={styles.card}>
				<View style={styles.rulesGrid}>
					{requirements.map((rule) => (
						<View key={rule.label} style={styles.ruleItem}>
							<Ionicons
								name={rule.met ? 'checkmark-circle' : 'ellipse-outline'}
								size={18}
								color={rule.met ? '#2E9F5C' : '#C8D2E1'}
							/>
							<Text allowFontScaling={false} style={[styles.ruleText, rule.met && styles.ruleTextMet]}>{rule.label}</Text>
						</View>
					))}
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginTop: 10,
	},
	strengthRow: {
		flexDirection: 'row',
		gap: 8,
	},
	strengthBar: {
		flex: 1,
		height: 4,
		borderRadius: 999,
		backgroundColor: '#E1E7F0',
	},
	strengthLabel: {
		marginTop: 8,
		fontSize: 12,
		fontWeight: '800',
	},
	card: {
		marginTop: 10,
		borderWidth: 1,
		borderColor: '#DCE4F0',
		borderRadius: 14,
		backgroundColor: '#F8FAFD',
		paddingVertical: 12,
		paddingHorizontal: 12,
	},
	rulesGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
	ruleItem: {
		width: '50%',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		paddingVertical: 6,
		paddingRight: 8,
	},
	ruleText: {
		flex: 1,
		color: '#7D8EA5',
		fontSize: 12,
		fontWeight: '700',
	},
	ruleTextMet: {
		color: '#2E9F5C',
	},
	errorText: {
		marginTop: 10,
		color: '#E24B4A',
		fontSize: 12,
		fontWeight: '700',
	},
});