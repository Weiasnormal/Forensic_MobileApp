import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface UploadSlotProps {
  label: string;
  uri: string | null;
  accentColor: string;
  onPress: () => void;
  onClear?: () => void;
}

export default function UploadSlot({
  label,
  uri,
  accentColor,
  onPress,
  onClear,
}: UploadSlotProps) {
  const isFilled = Boolean(uri);

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        { borderColor: isFilled ? accentColor : '#D5E0EC' },
        isFilled && styles.filledContainer,
      ]}
    >
      {isFilled ? (
        <>
          <Image source={{ uri: uri ?? undefined }} style={styles.image} />
          <View style={[styles.checkPill, { backgroundColor: accentColor }]}>
            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
          </View>
          {onClear ? (
            <Pressable
              onPress={onClear}
              style={styles.clearButton}
              hitSlop={10}
            >
              <Ionicons name="close" size={14} color="#0F172A" />
            </Pressable>
          ) : null}
        </>
      ) : (
        <View style={styles.placeholderWrap}>
          <View style={[styles.plusCircle, { borderColor: accentColor }]}> 
            <Ionicons name="add" size={22} color={accentColor} />
          </View>
          <Text style={styles.placeholderLabel}>{label}</Text>
          <Text style={styles.placeholderHint}>Tap to attach image</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1.3,
    borderStyle: 'dashed',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    minHeight: 138,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  filledContainer: {
    borderStyle: 'solid',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  placeholderWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  plusCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  placeholderLabel: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  placeholderHint: {
    marginTop: 2,
    fontSize: 11,
    color: '#8A9AAF',
    textAlign: 'center',
  },
  checkPill: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: 999,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});
