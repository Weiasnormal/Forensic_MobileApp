import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface FAQAccordionItemProps {
  question: string;
  /** Controlled from the parent — no internal open/close state here. */
  expanded?: boolean;
  onPress?: () => void;
  /** Optional answer content, only rendered when expanded is true. */
  children?: React.ReactNode;
}

const FAQAccordionItem: React.FC<FAQAccordionItemProps> = ({
  question,
  expanded = false,
  onPress,
  children,
}) => {
  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.header} onPress={onPress} activeOpacity={0.7}>
        <Text style={styles.question}>{question}</Text>
        <ChevronDown
          size={18}
          color={colors.textTertiary}
          style={expanded ? styles.chevronExpanded : undefined}
        />
      </TouchableOpacity>
      {expanded && children ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  question: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '600',
    color: colors.textPrimary,
    marginRight: 12,
  },
  chevronExpanded: {
    transform: [{ rotate: '180deg' }],
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});

export default FAQAccordionItem;
