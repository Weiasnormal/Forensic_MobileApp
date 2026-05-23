import React from 'react';

import { UserProvider } from '@/store/userStore';
import { Sora_400Regular, Sora_500Medium, Sora_600SemiBold, Sora_700Bold, Sora_800ExtraBold, useFonts } from '@expo-google-fonts/sora';
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync().catch(() => {});

let fontsApplied = false;

const soraFamilies = {
  regular: 'Sora_400Regular',
  medium: 'Sora_500Medium',
  semiBold: 'Sora_600SemiBold',
  bold: 'Sora_700Bold',
  extraBold: 'Sora_800ExtraBold',
} as const;

function resolveSoraFamily(fontWeight?: string | number) {
  const normalizedWeight = typeof fontWeight === 'number' ? String(fontWeight) : fontWeight;

  if (normalizedWeight === '500') return soraFamilies.medium;
  if (normalizedWeight === '600') return soraFamilies.semiBold;
  if (normalizedWeight === '700' || normalizedWeight === 'bold') return soraFamilies.bold;
  if (normalizedWeight === '800' || normalizedWeight === '900') return soraFamilies.extraBold;

  return soraFamilies.regular;
}

function mergeSoraStyle(style: unknown, defaultWeight: string | number = '400') {
  const flattened = StyleSheet.flatten(style) ?? {};
  const fontFamily = resolveSoraFamily(flattened.fontWeight ?? defaultWeight);

  return [style, { fontFamily }];
}

function applyGlobalFontDefaults() {
  if (fontsApplied) {
    return;
  }
  // Set defaultProps.style for Text and TextInput so all usages receive Sora by default.
  // Overriding React.createElement doesn't work with the automatic JSX runtime, so
  // using defaultProps is more reliable across the app.
  const textAny = Text as any;
  const inputAny = TextInput as any;

  textAny.defaultProps = textAny.defaultProps || {};
  inputAny.defaultProps = inputAny.defaultProps || {};

  const originalTextDefaultStyle = textAny.defaultProps.style;
  const originalInputDefaultStyle = inputAny.defaultProps.style;

  textAny.defaultProps.style = mergeSoraStyle(originalTextDefaultStyle);
  inputAny.defaultProps.style = mergeSoraStyle(originalInputDefaultStyle);

  fontsApplied = true;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Sora_400Regular,
    Sora_500Medium,
    Sora_600SemiBold,
    Sora_700Bold,
    Sora_800ExtraBold,
  });

  React.useEffect(() => {
    if (fontsLoaded) {
      applyGlobalFontDefaults();
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <UserProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </UserProvider>
    </SafeAreaProvider>
  );
}
