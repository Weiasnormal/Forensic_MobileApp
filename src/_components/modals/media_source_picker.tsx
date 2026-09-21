import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import DocumentScanner, {
  ResponseType,
  ScanDocumentResponseStatus,
} from "react-native-document-scanner-plugin";

interface Props {
  visible: boolean;
  onSelect: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
}

export const scanForensicDocument = async (
  onImageScanned: (uri: string) => void,
  onError?: (title: string, message: string) => void,
): Promise<boolean> => {
  try {
    const { scannedImages, status } = await DocumentScanner.scanDocument({
      croppedImageQuality: 100,
      responseType: ResponseType.ImageFilePath,
    });

    console.log(
      "[scanForensicDocument] status:",
      status,
      "count:",
      scannedImages?.length ?? 0,
    );

    if (
      status === ScanDocumentResponseStatus.Cancel ||
      !scannedImages?.length
    ) {
      const message =
        "Try again without the clean-up tool.";
      if (onError) {
        onError("Scan not completed", message);
      } else {
        Alert.alert("Scan not completed", message);
      }
      return false;
    }

    onImageScanned(scannedImages[0]);
    return true;
  } catch (error) {
    console.error("[scanForensicDocument] threw:", error);
    const message = "Failed to initialize the document scanner.";
    if (onError) {
      onError("Scanner Error", message);
    } else {
      Alert.alert("Scanner Error", message);
    }
    return false;
  }
};

export default function MediaSourcePicker({
  visible,
  onSelect,
  onCancel,
  title = "Upload",
  message = "Choose image source",
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.iconWrap}>
              <Ionicons name="images" size={22} color="#1E6FD9" />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
            </View>
          </View>

          <Pressable
            style={[styles.optionButton, styles.primaryOption]}
            onPress={onSelect}
          >
            <View style={styles.boxContent}>
              <Ionicons name="camera" size={28} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Camera</Text>
            </View>
          </Pressable>

          <Pressable style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.48)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 18,
    alignItems: "stretch",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#E8F1FF",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextWrap: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  message: {
    marginTop: 2,
    fontSize: 13,
    color: "#64748B",
  },
  primaryButton: {
    marginTop: 6,
    borderRadius: 12,
    backgroundColor: "#1E6FD9",
    paddingVertical: 12,
    alignItems: "center",
  },
  rowContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryButton: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D8E3EF",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    alignItems: "center",
  },
  optionButton: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryOption: {
    backgroundColor: "#1E6FD9",
  },
  boxContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  cancelButton: {
    marginTop: 12,
    alignItems: "center",
    paddingVertical: 8,
  },
  cancelText: {
    color: "#64748B",
    fontSize: 15,
    fontWeight: "700",
  },
});
