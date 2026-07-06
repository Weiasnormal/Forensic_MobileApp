import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

interface GroupedCardProps {
  children: React.ReactNode;
}

/**
 * White rounded card used to group related rows together (Account, Workspace,
 * Preferences, About sections). Insert <Divider /> manually between children,
 * matching the pattern already used in MemberDetailsScreen.
 */
const GroupedCard: React.FC<GroupedCardProps> = ({ children }) => {
  return <View style={styles.card}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
});

export default GroupedCard;
