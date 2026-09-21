import * as NavigationBar from 'expo-navigation-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';

type NavigationBarVariant = 'onBrand' | 'onLight' | 'onDark';

const CONFIG: Record<NavigationBarVariant, { buttonStyle: 'light' | 'dark' }> = {
  onBrand: { buttonStyle: 'light' },
  onLight: { buttonStyle: 'dark' },
  onDark: { buttonStyle: 'light' },
};

export function ScreenNavigationBar({ variant }: { variant: NavigationBarVariant }) {
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const { buttonStyle } = CONFIG[variant];
    NavigationBar.setButtonStyleAsync(buttonStyle);
  }, [variant]);

  return null;
}