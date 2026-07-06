import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../common/Avatar';
import { colors } from '../../constants/colors';

interface ProfileHeaderProps {
  initials: string;
  name: string;
  role: string;
  organization: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ initials, name, role, organization }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: 20}]}>
      <Avatar initials={initials} size={56} variant="onDark" />
      <View style={styles.textWrapper}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.subtitle}>
          {role} • {organization}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  textWrapper: {
    marginLeft: 14,
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primaryText,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
});

export default ProfileHeader;
