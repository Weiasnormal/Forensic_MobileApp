import { API_KEY } from "@/constants/api";
import { colors } from "@/constants/colors";
import { getTypographyStyle } from "@/constants/typography";
import { getAuthHeader } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Animated,
    Modal,
    PanResponder,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

interface ZoomableImageModalProps {
  visible: boolean;
  uri: string | null;
  title: string;
  onClose: () => void;
}

export default function ZoomableImageModal({
  visible,
  uri,
  title,
  onClose,
}: ZoomableImageModalProps) {
  const [scaleValue, setScaleValue] = useState(1);
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef({ x: 0, y: 0 });

  const resetZoom = useCallback(() => {
    setScaleValue(1);
    lastOffset.current = { x: 0, y: 0 };
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
    ]).start();
  }, [scale, translateX, translateY]);

  useEffect(() => {
    if (visible) resetZoom();
  }, [resetZoom, uri, visible]);

  const updateScale = (nextScale: number) => {
    const boundedScale = Math.min(4, Math.max(1, nextScale));
    setScaleValue(boundedScale);
    Animated.spring(scale, {
      toValue: boundedScale,
      useNativeDriver: true,
    }).start();
    if (boundedScale === 1) {
      lastOffset.current = { x: 0, y: 0 };
      Animated.parallel([
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
      ]).start();
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => scaleValue > 1,
      onMoveShouldSetPanResponder: () => scaleValue > 1,
      onPanResponderGrant: () => {
        translateX.setOffset(lastOffset.current.x);
        translateY.setOffset(lastOffset.current.y);
        translateX.setValue(0);
        translateY.setValue(0);
      },
      onPanResponderMove: Animated.event(
        [null, { dx: translateX, dy: translateY }],
        { useNativeDriver: false },
      ),
      onPanResponderRelease: (_, gestureState) => {
        lastOffset.current = {
          x: lastOffset.current.x + gestureState.dx,
          y: lastOffset.current.y + gestureState.dy,
        };
        translateX.flattenOffset();
        translateY.flattenOffset();
      },
    }),
  ).current;

  if (!uri) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            <Pressable
              accessibilityLabel="Close image preview"
              onPress={onClose}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={22} color={colors.textPrimary} />
            </Pressable>
          </View>

          <View style={styles.imageViewport}>
            <Animated.View
              {...panResponder.panHandlers}
              style={[
                styles.imageTransform,
                {
                  transform: [{ translateX }, { translateY }, { scale }],
                },
              ]}
            >
              <ExpoImage
                source={{
                  uri: uri.split("?")[0],
                  headers: { "X-Api-Key": API_KEY || "", ...getAuthHeader() },
                }}
                style={styles.image}
                contentFit="contain"
              />
            </Animated.View>
          </View>

          <View style={styles.controls}>
            <Pressable
              accessibilityLabel="Zoom out"
              onPress={() => updateScale(scaleValue - 0.5)}
              style={styles.controlButton}
            >
              <Ionicons name="remove" size={20} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.zoomLabel}>
              {Math.round(scaleValue * 100)}%
            </Text>
            <Pressable
              accessibilityLabel="Zoom in"
              onPress={() => updateScale(scaleValue + 0.5)}
              style={styles.controlButton}
            >
              <Ionicons name="add" size={20} color={colors.textPrimary} />
            </Pressable>
            <Pressable
              accessibilityLabel="Reset zoom"
              onPress={resetZoom}
              style={styles.resetButton}
            >
              <Text style={styles.resetText}>Reset</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.88)",
    justifyContent: "center",
    padding: 12,
  },
  sheet: {
    backgroundColor: colors.cardBackground,
    borderRadius: 18,
    padding: 10,
    maxHeight: "88%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  title: {
    ...getTypographyStyle("l1List"),
    flex: 1,
    color: colors.textPrimary,
    paddingRight: 10,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.statsBackground,
  },
  imageViewport: {
    height: 420,
    overflow: "hidden",
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  imageTransform: {
    width: "100%",
    height: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingTop: 10,
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.statsBackground,
  },
  zoomLabel: {
    ...getTypographyStyle("c1Caption", "semiBold"),
    color: colors.textPrimary,
    minWidth: 48,
    textAlign: "center",
  },
  resetButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  resetText: {
    ...getTypographyStyle("c1Caption", "semiBold"),
    color: colors.primary,
  },
});
