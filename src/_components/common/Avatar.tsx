import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Pencil } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

interface AvatarProps {
  initials: string;
  size?: number;
  /** 'light' = pale blue bg + blue text (Member Details header)
   *  'solid' = solid blue bg + white text (Edit Profile header)
   *  'onDark' = translucent white bg + white text (used on top of a blue background, e.g. Profile header) */
  variant?: 'light' | 'solid' | 'onDark';
  editable?: boolean;
  onEditPress?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({
  initials,
  size = 80,
  variant = 'light',
  editable = false,
  onEditPress,
}) => {
  const backgroundColor =
    variant === 'solid'
      ? colors.primary
      : variant === 'onDark'
      ? 'rgba(255, 255, 255, 0.25)'
      : colors.primaryLight;

  const textColor = variant === 'light' ? colors.primary : colors.primaryText;
  const borderColor = variant === 'onDark' ? 'rgba(255, 255, 255, 0.18)' : 'transparent';

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor,
            borderWidth: variant === 'onDark' ? 2 : 0,
            borderColor,
          },
        ]}
      >
        <Text style={[styles.initials, {color: textColor }]}>
          {initials}
        </Text>
      </View>

      {editable && (
        <TouchableOpacity style={styles.editBadge} onPress={onEditPress} activeOpacity={0.8}>
          <Pencil size={12} color={colors.primaryText} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'center',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    ...getTypographyStyle('t3Title'),
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Avatar;
