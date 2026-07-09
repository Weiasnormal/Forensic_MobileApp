import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { colors } from '@/constants/colors';

type NavigationBarVariant = 'onBrand' | 'onLight' | 'onDark';

const CONFIG: Record<NavigationBarVariant, { backgroundColor: string; buttonStyle: 'light' | 'dark' }> = {
  onBrand: { backgroundColor: colors.primary, buttonStyle: 'light' },
  onLight: { backgroundColor: '#ffffff', buttonStyle: 'dark' },
  onDark: { backgroundColor: '#000000', buttonStyle: 'light' },
};

export function ScreenNavigationBar({ variant }: { variant: NavigationBarVariant }) {
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const { backgroundColor, buttonStyle } = CONFIG[variant];
    NavigationBar.setBackgroundColorAsync(backgroundColor);
    NavigationBar.setButtonStyleAsync(buttonStyle);
  }, [variant]);

  return null;
}