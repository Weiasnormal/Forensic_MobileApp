export const FONT_FAMILY_SORA = {
	regular: 'Sora_400Regular',
	medium: 'Sora_500Medium',
	semiBold: 'Sora_600SemiBold',
	bold: 'Sora_700Bold',
} as const;

export type SoraWeight = keyof typeof FONT_FAMILY_SORA;

export const typography = {
	largeTitle: { fontSize: 38, weight: 'bold' as SoraWeight },
	t1Title: { fontSize: 24, weight: 'bold' as SoraWeight },
	t2Title: { fontSize: 22, weight: 'bold' as SoraWeight },
	t3Title: { fontSize: 17, weight: 'bold' as SoraWeight },
	headline: { fontSize: 14, weight: 'bold' as SoraWeight },
	body: { fontSize: 15, lineHeight: 22, weight: 'regular' as SoraWeight },
	l1List: { fontSize: 13, weight: 'bold' as SoraWeight },
	l2List: { fontSize: 11, weight: 'bold' as SoraWeight },
	c1Caption: { fontSize: 13, weight: 'semiBold' as SoraWeight },
	c2Caption: { fontSize: 11, weight: 'semiBold' as SoraWeight },
	c3Caption: { fontSize: 10, weight: 'semiBold' as SoraWeight },
	b1Button: { fontSize: 15, weight: 'bold' as SoraWeight },
	b2Button: { fontSize: 14, weight: 'bold' as SoraWeight },
	b3Button: { fontSize: 12, weight: 'bold' as SoraWeight },
} as const;

export type TypographyToken = keyof typeof typography;

/**
 * Resolves a typography token into a ready-to-use text style.
 * Pass `weightOverride` to use a different weight than the token's default.
 */
export function getTypographyStyle(token: TypographyToken, weightOverride?: SoraWeight) {
	const { weight, ...rest } = typography[token];
	return {
		...rest,
		fontFamily: FONT_FAMILY_SORA[weightOverride ?? weight],
	};
}