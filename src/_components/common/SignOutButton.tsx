import React from 'react';
import { ViewStyle } from 'react-native';
import { colors } from '../../constants/colors';
import SecondaryButton from './SecondaryButton';

interface SignOutButtonProps {
  onPress?: () => void;
  style?: ViewStyle;
}

const SignOutButton: React.FC<SignOutButtonProps> = ({ onPress, style }) => {
  return (
    <SecondaryButton
      label="Sign out"
      onPress={onPress}
      style={style}
      backgroundColor={colors.dangerLight}
      borderColor={colors.dangerBorder}
      textColor={colors.danger}
      textVariant="b1Button"
    />
  );
};

export default SignOutButton;
