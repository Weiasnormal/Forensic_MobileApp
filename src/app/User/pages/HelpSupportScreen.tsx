import FAQAccordionItem from '@/_components/admin/FAQAccordionItem';
import ScreenHeader from '@/_components/common/ScreenHeader';
import SectionLabel from '@/_components/common/SectionLabel';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FAQEntry {
    question: string;
    answer: string;
}

const FAQ_ITEMS: FAQEntry[] = [
    {
        question: 'How does the AI signature analysis work?',
        answer:
            'Avera compares stroke patterns, pressure curves, and spatial features using a deep learning model, then returns a confidence score and heatmap.',
    },
    {
        question: 'What file formats are accepted?',
        answer:
            'PNG and JPEG are supported. Images are scanned on device using Google ML Kit and automatically flagged if quality is too low before analysis begins.',
    },
    {
        question: "How do I read the confidence score?",
        answer:
            'The percentage shows how confident the model is in its verdict, whether Genuine or Suspected. The higher the score, the more certain the result. The heatmap shows where divergence was detected.',
    },
    {
        question: 'Can results be used as court evidence?',
        answer:
            'Avera is a decision-support tool. Results must be reviewed and attested by a certified forensic examiner before any legal submission.',
    },
    {
        question: 'How is my case data secured?',
        answer:
            'All data is encrypted at rest and in transit. Case data is scoped to your organization only.',
    },
    {
        question: 'How does the approval process work?',
        answer:
            'After registration, your account is pending until your organization supervisor approves your request. You will be notified once access is granted.',
    },
];

interface HelpSupportScreenProps {
    onBackPress?: () => void;
}

const HelpSupportScreen: React.FC<HelpSupportScreenProps> = ({
    onBackPress,
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
});

export default HelpSupportScreen;