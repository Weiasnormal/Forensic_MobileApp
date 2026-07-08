import { StatusBar } from 'react-native';
import { colors } from '@/constants/colors';
import AdminNavbar, { type AdminTabKey } from '@/_components/admin/AdminNavbar';

type StatusBarVariant = 'onBrand' | 'onLight' | 'onDark';

const TAB_KEYS: AdminTabKey[] = ['home', 'cases', 'team', 'stats', 'profile'];

export function ScreenStatusBar({ variant }: { variant: StatusBarVariant }) {
  const config = {
    onBrand: { style: 'light' as const, backgroundColor: colors.primary, translucent: false },
    onLight: { style: 'dark' as const, backgroundColor: '#ffffff', translucent: false },
    onDark:  { style: 'light' as const, backgroundColor: '#000000', translucent: false },
  }[variant];

  return <StatusBar {...config} />;
}