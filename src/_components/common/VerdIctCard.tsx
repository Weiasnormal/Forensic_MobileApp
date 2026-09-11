import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

export interface VerdictCardProps {
  /** The current review state of the card */
  status: 'pending' | 'updated';
  /** Name of the supervisor who made the change (required if status is 'updated') */
  supervisorName?: string;
  /** The original ML verdict (e.g., 'Suspected' or 'Genuine') */
  originalVerdict?: string;
  /** The new verdict decided by the supervisor */
  newVerdict?: string;
  /** Date the verdict was updated */
  date?: string;
  /** Optional review notes left by the supervisor */
  reviewNote?: string;
}

export default function VerdictCard({
  status,
  supervisorName = 'Admin',
  originalVerdict,
  newVerdict,
  date,
  reviewNote,
}: VerdictCardProps) {
  
  if (status === 'pending') {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={[styles.dot, { backgroundColor: colors.primary }]} />
          <Text style={styles.title}>Pending Supervisor Review</Text>
        </View>
        <Text style={styles.description}>
          This result is awaiting review. The final verdict may be updated by your supervisor.
        </Text>
      </View>
    );
  }

  // Determine dot color based on the updated verdict
  const isGenuine = newVerdict?.toLowerCase() === 'genuine';
  const dotColor = isGenuine ? colors.statusGenuine : colors.danger;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
        <Text style={styles.title}>Verdict Updated by Supervisor</Text>
      </View>
      
      <Text style={styles.description}>
        Supervisor {supervisorName} changed this verdict from{' '}
        <Text style={styles.boldText}>{originalVerdict}</Text> to{' '}
        <Text style={styles.boldText}>{newVerdict}</Text> on {date}.
      </Text>

      {reviewNote && (
        <View style={styles.quoteContainer}>
          <Text style={styles.quoteText}>{reviewNote}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.dividerLight,
    padding: 16,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  title: {
    ...getTypographyStyle('t3Title'),
    color: colors.textPrimary,
  },
  description: {
    ...getTypographyStyle('b3Button'),
    color: colors.textSecondary,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: 'bold',
    color: colors.textSecondary, // Match description color but bolder
  },
  quoteContainer: {
    marginTop: 12,
    backgroundColor: colors.background, // Light gray/blue background
    borderLeftWidth: 3,
    borderLeftColor: colors.textSecondary,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
    padding: 12,
  },
  quoteText: {
    ...getTypographyStyle('c1Caption', 'regular'),
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 20,
  },
});