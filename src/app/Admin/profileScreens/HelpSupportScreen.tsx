import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '@/_components/common/ScreenHeader';
import SectionLabel from '@/_components/common/SectionLabel';
import FAQAccordionItem from '@/_components/admin/FAQAccordionItem';
import PrimaryButton from '@/_components/common/PrimaryButton';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

interface FAQEntry {
	question: string;
	answer: string;
}

const FAQ_ITEMS: FAQEntry[] = [
	{
		question: 'How do I add analysts to my org?',
		answer:
			'Go to Manage Team & Approvals from your profile, then tap Invite Analyst. Share the generated org invite code with the person you want to add — they\'ll enter it during sign up to join your organization.',
	},
	{
		question: 'What does Suspected mean?',
		answer:
			'A case is marked Suspected when the signature verification model detects significant deviation from the reference signature beyond the configured confidence threshold. It flags the case for closer manual review, not a final determination.',
	},
	{
		question: "Can I restrict an analyst's workload?",
		answer:
			'Yes. From Manage Team & Approvals, open an analyst\'s profile and set a maximum active case limit. New cases won\'t be auto-assigned to them once that limit is reached.',
	},
	{
		question: 'How do I export a case report?',
		answer:
			'Open the case, then tap the export icon in the top right of the case detail screen. Reports export as PDF and include the comparison images, confidence score, and analyst notes.',
	},
	{
		question: 'How is analyst accuracy calculated?',
		answer:
			'Accuracy is calculated as the percentage of an analyst\'s case decisions that match the final verified outcome, tracked over their last 90 days of closed cases.',
	},
];

interface HelpSupportScreenProps {
	onBackPress?: () => void;
	onContactSupportPress?: () => void;
}

const HelpSupportScreen: React.FC<HelpSupportScreenProps> = ({
	onBackPress,
	onContactSupportPress,
}) => {
	const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

	const toggleQuestion = (question: string) => {
		setExpandedQuestion((current) => (current === question ? null : question));
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<ScreenHeader title="Help & Support" onBackPress={onBackPress} />

			<ScrollView contentContainerStyle={styles.content}>
				<SectionLabel label="Frequently Asked Questions" />

				{FAQ_ITEMS.map(({ question, answer }) => (
					<FAQAccordionItem
						key={question}
						question={question}
						expanded={expandedQuestion === question}
						onPress={() => toggleQuestion(question)}
					>
						<Text allowFontScaling={false} style={styles.answerText}>
							{answer}
						</Text>
					</FAQAccordionItem>
				))}

				<Text allowFontScaling={false} style={styles.stillNeedHelp}>Still need help?</Text>

				<PrimaryButton label="Contact Support" onPress={onContactSupportPress} size="large" />
			</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: colors.background,
	},
	content: {
		padding: 16,
	},
	answerText: {
		...getTypographyStyle('body'),
		fontSize: 13.5,
		lineHeight: 20,
		color: colors.textSecondary,
	},
	stillNeedHelp: {
		...getTypographyStyle('c1Caption'),
		textAlign: 'center',
		color: colors.textTertiary,
		marginTop: 4,
		marginBottom: 14,
	},
});

export default HelpSupportScreen;