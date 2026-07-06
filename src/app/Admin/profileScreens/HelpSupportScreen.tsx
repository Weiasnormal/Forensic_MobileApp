import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '@/_components/common/ScreenHeader';
import SectionLabel from '@/_components/common/SectionLabel';
import FAQAccordionItem from '@/_components/admin/FAQAccordionItem';
import PrimaryButton from '@/_components/common/PrimaryButton';
import { colors } from '@/constants/colors';

const FAQ_ITEMS: string[] = [
  'How do I add analysts to my org?',
  'What does Suspected mean?',
  "Can I restrict an analyst's workload?",
  'How do I export a case report?',
  'How is analyst accuracy calculated?',
];

interface HelpSupportScreenProps {
  onBackPress?: () => void;
  onContactSupportPress?: () => void;
}

const HelpSupportScreen: React.FC<HelpSupportScreenProps> = ({
  onBackPress,
  onContactSupportPress,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Help & Support" onBackPress={onBackPress} />

      <ScrollView contentContainerStyle={styles.content}>
        <SectionLabel label="Frequently Asked Questions" />

        {FAQ_ITEMS.map((question) => (
          <FAQAccordionItem key={question} question={question} />
        ))}

        <Text style={styles.stillNeedHelp}>Still need help?</Text>

        <PrimaryButton label="Contact Support" onPress={onContactSupportPress} />
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
  stillNeedHelp: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: 4,
    marginBottom: 14,
  },
});

export default HelpSupportScreen;
