import { colors } from "@/constants/colors";
import { getTypographyStyle } from "@/constants/typography";
import { AlertCircle, CheckCircle2, Info, LucideIcon } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type ToastVariant =
  | "neutral"
  | "success"
  | "successLight"
  | "infoLight"
  | "error";

interface ToastProps {
  visible: boolean;
  message: string;
  /** Overrides the default for the variant (errors stay longer). */
  duration?: number;
  onDismiss?: () => void;
  style?: ViewStyle;
  variant?: ToastVariant;
  /** Change this to restart the timer when the same message is shown again. */
  replayKey?: number;
}

interface ToastVariantConfig {
  backgroundColor: string;
  textColor: string;
  Icon: LucideIcon | null;
  iconColor: string;
  /** Tinted variants get a softer shadow than the solid ones. */
  isLight: boolean;
}

// Solid variants: white text on brand blue.
// Tinted variants: one fill only (no border), dark text, colored icon. Dark
// text keeps contrast readable at 13px and the icon carries the state color.
const VARIANT_CONFIG: Record<ToastVariant, ToastVariantConfig> = {
  neutral: {
    backgroundColor: colors.primary,
    textColor: colors.primaryText,
    Icon: null,
    iconColor: colors.primaryText,
    isLight: false,
  },
  success: {
    backgroundColor: colors.primary,
    textColor: colors.primaryText,
    Icon: CheckCircle2,
    iconColor: colors.primaryText,
    isLight: false,
  },
  successLight: {
    backgroundColor: colors.statusGenuineBg,
    textColor: colors.textPrimary,
    Icon: CheckCircle2,
    iconColor: colors.statusGenuine,
    isLight: true,
  },
  infoLight: {
    backgroundColor: colors.primaryLight,
    textColor: colors.textPrimary,
    Icon: Info,
    iconColor: colors.primary,
    isLight: true,
  },
  error: {
    backgroundColor: colors.dangerLight,
    textColor: colors.textPrimary,
    Icon: AlertCircle,
    iconColor: colors.danger,
    isLight: true,
  },
};

// Errors need more reading time than confirmations.
const DEFAULT_DURATION: Record<ToastVariant, number> = {
  neutral: 2400,
  success: 2400,
  successLight: 2400,
  infoLight: 2800,
  error: 4000,
};

const HIDDEN_OFFSET = 12;
const ENTER_MS = 200;
const EXIT_MS = 150;

const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  duration,
  onDismiss,
  style,
  variant = "neutral",
  replayKey,
}) => {
  const insets = useSafeAreaInsets();
  const [isMounted, setIsMounted] = useState(visible);
  // Last content that was actually shown. The exit animation keeps rendering
  // it even if the parent clears the message or variant when it hides the toast.
  const [content, setContent] = useState({ message, variant });
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(HIDDEN_OFFSET)).current;
  const reduceMotionRef = useRef(false);

  // Latest onDismiss in a ref so an inline arrow function from the parent does
  // not restart the auto-dismiss timer on every parent render.
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        reduceMotionRef.current = enabled;
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (visible) setContent({ message, variant });
  }, [visible, message, variant]);

  // Enter and exit. Depends on `visible` only, so showing a new message while
  // a toast is already up does not replay the slide.
  useEffect(() => {
    const offset = reduceMotionRef.current ? 0 : HIDDEN_OFFSET;

    if (visible) {
      setIsMounted(true);
      translateY.setValue(offset);
      const enter = Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: ENTER_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: ENTER_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]);
      enter.start();
      return () => enter.stop();
    }

    const exit = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: EXIT_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: offset,
        duration: EXIT_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);
    // Stopping (a new toast interrupts, or unmount) reports finished = false,
    // so the toast is never unmounted out from under a newer show.
    exit.start(({ finished }) => {
      if (finished) setIsMounted(false);
    });
    return () => exit.stop();
  }, [visible, opacity, translateY]);

  const resolvedDuration = duration ?? DEFAULT_DURATION[variant];

  // Auto-dismiss. A new message or replayKey restarts the countdown.
  useEffect(() => {
    if (!visible) return;
    const timeout = setTimeout(() => onDismissRef.current?.(), resolvedDuration);
    return () => clearTimeout(timeout);
  }, [visible, resolvedDuration, message, replayKey]);

  if (!isMounted) {
    return null;
  }

  const config = VARIANT_CONFIG[content.variant];
  const Icon = config.Icon;

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityRole="alert"
      accessibilityLiveRegion={content.variant === "error" ? "assertive" : "polite"}
      style={[
        styles.wrap,
        { bottom: Math.max(18, insets.bottom + 12) },
        { opacity, transform: [{ translateY }] },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.toast,
          { backgroundColor: config.backgroundColor },
          config.isLight ? styles.toastLight : null,
        ]}
      >
        {Icon ? (
          <Icon
            size={18}
            color={config.iconColor}
            strokeWidth={2.2}
            style={styles.icon}
          />
        ) : null}
        <Text
          numberOfLines={3}
          style={[styles.text, { color: config.textColor }]}
        >
          {content.message}
        </Text>
      </Animated.View>
    </Animated.View>
  );
};

interface ToastState {
  visible: boolean;
  message: string;
  variant: ToastVariant;
  replayKey: number;
}

/**
 * Owns the toast state so screens do not repeat the useState boilerplate.
 * Spread `toastProps` onto <Toast /> and call `show(message, variant?)`.
 * Showing the same message twice works because replayKey changes each call.
 */
export function useToast(defaultVariant: ToastVariant = "success") {
  const [state, setState] = useState<ToastState>({
    visible: false,
    message: "",
    variant: defaultVariant,
    replayKey: 0,
  });

  const show = useCallback(
    (message: string, variant: ToastVariant = defaultVariant) => {
      setState((prev) => ({
        visible: true,
        message,
        variant,
        replayKey: prev.replayKey + 1,
      }));
    },
    [defaultVariant],
  );

  const hide = useCallback(() => {
    setState((prev) => ({ ...prev, visible: false }));
  }, []);

  return {
    show,
    hide,
    toastProps: {
      visible: state.visible,
      message: state.message,
      variant: state.variant,
      replayKey: state.replayKey,
      onDismiss: hide,
    },
  };
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 18,
    alignItems: "center",
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: 420,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16, // matches GroupedCard and the other cards
    shadowColor: "#000", // FLAG: no black token exists in colors.ts, left as is
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  toastLight: {
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  icon: {
    marginRight: 10,
  },
  text: {
    ...getTypographyStyle("c1Caption"),
    flexShrink: 1,
    lineHeight: 18,
  },
});

export default Toast;