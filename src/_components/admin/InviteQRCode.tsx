import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { colors } from '@/constants/colors';

interface InviteQRCodeProps {
  value: string | null;
  size?: number;
}

export default function InviteQRCode({ value, size = 180 }: InviteQRCodeProps) {
  if (!value) {
    return (
      <View style={[styles.loading, { width: size, height: size }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return <QRCode value={value} size={size} color={colors.textPrimary} backgroundColor="transparent" />;
}

const styles = StyleSheet.create({
  loading: { alignItems: 'center', justifyContent: 'center' },
});