import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

interface TertiaryButtonProps {
	label: string;
	onPress?: () => void;
	style?: ViewStyle;
	textVariant?: 'b1Button' | 'b2Button' | 'b3Button';
	textStyle?: TextStyle;
	disabled?: boolean;
}

const TertiaryButton: React.FC<TertiaryButtonProps> = ({
	label,
	onPress,
	style,
	textVariant = 'b1Button',
	textStyle,
	disabled = false,
}) => {
	return (
		<TouchableOpacity
			style={[styles.button, disabled && styles.disabledButton, style]}
			onPress={onPress}
			activeOpacity={0.75}
			disabled={disabled}
		>
			<Text style={[styles.label, getTypographyStyle(textVariant), textStyle, disabled && styles.disabledLabel]}>
				{label}
			</Text>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	button: {
		backgroundColor: 'transparent',
		borderRadius: 12,
		paddingVertical: 10,
		paddingHorizontal: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	disabledButton: {
		opacity: 0.45,
	},
	label: {
		color: colors.textSecondary,
	},
	disabledLabel: {
		color: colors.textTertiary,
	},
});

export default TertiaryButton;
