import PrimaryButton from '@/_components/common/PrimaryButton';
import SecondaryButton from '@/_components/common/SecondaryButton';
import { useBottomSheetTransition } from '@/_components/transition';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MemberLimitModalProps {
  visible: boolean;
  /** Current saved limit, or null when no limit has been set. */
  currentLimit: number | null;
  /** Members already in the organization. The limit can never go below this. */
  memberCount: number;
  /** Optional upper bound (for example a plan cap). No upper bound when omitted. */
  maxLimit?: number;
  onClose: () => void;
  /** Resolve true when saved. Resolve false to keep the sheet open with an error. */
  onSave: (limit: number) => Promise<boolean>;
}

const SAVE_ERROR = "Couldn't save the limit. Check your connection and try again.";
const MAX_LIMIT = 99;

export default function MemberLimitModal({
  visible,
  currentLimit,
  memberCount,
  maxLimit,
  onClose,
  onSave,
}: MemberLimitModalProps) {
  const insets = useSafeAreaInsets();
  const effectiveMaxLimit = Math.min(maxLimit ?? MAX_LIMIT, MAX_LIMIT);
  const getInitialDraft = () =>
    String(Math.min(effectiveMaxLimit, Math.max(currentLimit ?? memberCount, memberCount)));
  const [draft, setDraft] = useState(getInitialDraft);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  const { isMounted, sheetY, backdropOpacity, dragHandlePanHandlers } = useBottomSheetTransition({
    visible,
    onClose,
  });

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillChangeFrame' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardOffset(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardOffset(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Reset the draft each time the sheet opens, not when props refresh underneath it.
  useEffect(() => {
    if (!visible) return;
    setDraft(getInitialDraft());
    setErrorMessage(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!isMounted) return null;

  const numericDraft = Number(draft);
  const hasValidDraft =
    draft.trim() !== '' &&
    Number.isInteger(numericDraft) &&
    numericDraft <= effectiveMaxLimit;
  const canDecrease = hasValidDraft && numericDraft > memberCount;
  const canIncrease =
    hasValidDraft && numericDraft < effectiveMaxLimit;
  const canSave = hasValidDraft && numericDraft !== currentLimit && !isSaving;

  const hint =
    `Minimum ${memberCount} (current members). Maximum ${effectiveMaxLimit}.`;

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const saved = await onSave(numericDraft);
      if (!saved) setErrorMessage(SAVE_ERROR);
    } catch {
      setErrorMessage(SAVE_ERROR);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={isMounted} transparent onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <Animated.View pointerEvents="none" style={[styles.backdrop, { opacity: backdropOpacity }]} />
        </Pressable>

        <Animated.View
          style={[
            styles.sheet,
            {
              paddingBottom: 22 + insets.bottom,
              transform: [
                { translateY: sheetY },
                { translateY: -keyboardOffset },
              ],
            },
          ]}
        >
          <View style={styles.dragHandleWrap} {...dragHandlePanHandlers}>
            <View style={styles.dragHandle} />
          </View>

          <Text style={styles.title}>Member limit</Text>
          <Text style={styles.subtitle}>
            The most people who can be members of your organization at once.
          </Text>

          <View style={styles.stepperRow}>
            <SecondaryButton
              label="−"
              onPress={() =>
                setDraft((value) =>
                  String(Math.max(memberCount, Number(value) - 1)),
                )
              }
              disabled={!canDecrease || isSaving}
              size="small"
              textStyle={styles.stepGlyph}
              style={styles.stepButton}
            />
            <TextInput
              value={draft}
              onChangeText={(value) => {
                const digits = value.replace(/[^0-9]/g, '').slice(0, 2);
                setDraft(
                  digits === ''
                    ? ''
                    : String(Math.min(MAX_LIMIT, Number(digits))),
                );
              }}
              keyboardType="number-pad"
              maxLength={2}
              selectTextOnFocus
              style={styles.draftValue}
            />
            <SecondaryButton
              label="+"
              onPress={() =>
                setDraft((value) =>
                  String(
                    Math.min(effectiveMaxLimit, Number(value) + 1),
                  ),
                )
              }
              disabled={!canIncrease || isSaving}
              size="small"
              textStyle={styles.stepGlyph}
              style={styles.stepButton}
            />
          </View>

          <Text style={styles.hint}>{hint}</Text>
          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

          <View style={styles.buttonRow}>
            <SecondaryButton
              label="Cancel"
              onPress={onClose}
              disabled={isSaving}
              size="medium"
              style={styles.flexButton}
            />
            <PrimaryButton
              label="Save"
              onPress={() => void handleSave()}
              disabled={!canSave}
              loading={isSaving}
              size="medium"
              style={styles.flexButton}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.background2,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 22,
    borderWidth: 1,
    borderColor: colors.sheetBorder,
  },
  dragHandleWrap: { alignItems: 'center', paddingBottom: 8 },
  dragHandle: { width: 44, height: 5, borderRadius: 999, backgroundColor: colors.sheetHandle, marginBottom: 6 },
  title: {
    ...getTypographyStyle('t2Title'),
    color: colors.textPrimary,
  },
  subtitle: {
    ...getTypographyStyle('c1Caption', 'regular'),
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 20,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 10,
  },
  stepButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  stepGlyph: {
    fontSize: 22,
  },
  draftValue: {
    ...getTypographyStyle('largeTitle'),
    minWidth: 96,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  hint: {
    ...getTypographyStyle('c2Caption'),
    textAlign: 'center',
    color: colors.label,
    marginBottom: 20,
  },
  error: {
    ...getTypographyStyle('c2Caption'),
    textAlign: 'center',
    color: colors.danger,
    marginTop: -10,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  flexButton: {
    flex: 1,
  },
});