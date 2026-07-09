import { StatusBar } from 'expo-status-bar';
import { colors } from '@/constants/colors';

type StatusBarVariant = 'onBrand' | 'onLight' | 'onDark';

export function ScreenStatusBar({ variant }: { variant: StatusBarVariant }) {
  const config = {
    onBrand: { style: 'light' as const, backgroundColor: colors.primary, translucent: false },
    onLight: { style: 'dark' as const, backgroundColor: '#ffffff', translucent: false },
    onDark:  { style: 'light' as const, backgroundColor: '#000000', translucent: false },
  }[variant];

  return <StatusBar {...config} />;
}