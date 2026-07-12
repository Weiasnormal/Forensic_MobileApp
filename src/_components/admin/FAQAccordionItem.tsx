import React, { useEffect, useRef, useState } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Animated, LayoutChangeEvent } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

interface FAQAccordionItemProps {
  question: string;
  /** Controlled from the parent — no internal open/close state here. */
  expanded?: boolean;
  onPress?: () => void;
  /** Optional answer content, only rendered when expanded is true. */
  children?: React.ReactNode;
}

const FAQAccordionItem: React.FC<FAQAccordionItemProps> = ({
  question,
  expanded = false,
  onPress,
  children,
}) => {
  const expansion = useRef(new Animated.Value(expanded ? 1 : 0)).current;
  const [contentHeight, setContentHeight] = useState(0);
  const hasMeasured = useRef(false);

  useEffect(() => {
    Animated.timing(expansion, {
      toValue: expanded ? 1 : 0,
      duration: 220,
      useNativeDriver: false, // height animation can't use the native driver
    }).start();
  }, [expanded, expansion]);

  const handleContentLayout = (event: LayoutChangeEvent) => {
    const measuredHeight = event.nativeEvent.layout.height;
    if (measuredHeight > 0 && measuredHeight !== contentHeight) {
      setContentHeight(measuredHeight);
      // Snap to the correct height immediately on first measurement so an
      // already-expanded item (or the very first open) doesn't animate from 0.
      if (!hasMeasured.current) {
        hasMeasured.current = true;
        expansion.setValue(expanded ? 1 : 0);
      }
    }
  };

  const animatedChevronStyle = {
    transform: [
      {
        rotate: expansion.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
          extrapolate: 'clamp' as const,
        }),
      },
    ],
  };

  const animatedBodyStyle = {
    height: expansion.interpolate({
      inputRange: [0, 1],
      outputRange: [0, contentHeight],
      extrapolate: 'clamp' as const,
    }),
    opacity: expansion,
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.header} onPress={onPress} activeOpacity={0.7}>
        <Text allowFontScaling={false} style={styles.question}>{question}</Text>
        <Animated.View style={animatedChevronStyle}>
          <ChevronDown size={18} color={colors.textTertiary} />
        </Animated.View>
      </TouchableOpacity>

      {children ? (
        <Animated.View style={[styles.bodyWrap, animatedBodyStyle]}>
          <View style={styles.body} onLayout={handleContentLayout}>
            {children}
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  question: {
    ...getTypographyStyle('headline'),
    flex: 1,
    color: colors.textPrimary,
    marginRight: 12,
  },
  bodyWrap: {
    overflow: 'hidden',
  },
  body: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});

export default FAQAccordionItem;