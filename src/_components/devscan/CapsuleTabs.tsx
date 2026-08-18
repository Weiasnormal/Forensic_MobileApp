import React, { useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

interface CapsuleTab<T extends string> {
  key: T;
  label: string;
}

interface CapsuleTabsProps<T extends string> {
  tabs: CapsuleTab<T>[];
  activeKey: T;
  onChange: (key: T) => void;
}

export default function CapsuleTabs<T extends string>({ tabs, activeKey, onChange }: CapsuleTabsProps<T>) {
  const [tabsWidth, setTabsWidth] = useState(0);
  const activeIndex = Math.max(0, tabs.findIndex((tab) => tab.key === activeKey));
  const slideAnim = useRef(new Animated.Value(activeIndex)).current;

  const handleLayout = (event: LayoutChangeEvent) => setTabsWidth(event.nativeEvent.layout.width);

  const selectTab = (index: number, key: T) => {
    onChange(key);
    Animated.timing(slideAnim, { toValue: index, duration: 220, useNativeDriver: true }).start();
  };

  const pillWidth = tabsWidth > 0 ? (tabsWidth - 8) / tabs.length : 0;
  const pillTranslateX = slideAnim.interpolate({
    inputRange: tabs.map((_, index) => index),
    outputRange: tabs.map((_, index) => index * pillWidth),
  });

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {tabsWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.pill, { width: pillWidth, transform: [{ translateX: pillTranslateX }] }]}
        />
      ) : null}

      {tabs.map((tab, index) => {
        const isActive = tab.key === activeKey;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            activeOpacity={0.85}
            onPress={() => selectTab(index, tab.key)}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 18,
    padding: 4,
    position: 'relative',
  },
  pill: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    backgroundColor: colors.primary,
    borderRadius: 14,
  },
  tab: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    zIndex: 1,
  },
  tabText: {
    ...getTypographyStyle('b3Button'),
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primaryText,
  },
});