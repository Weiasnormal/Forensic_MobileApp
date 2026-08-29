import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text,  View, Alert} from 'react-native';
import DocumentScanner, { ResponseType, ScanDocumentResponseStatus  } from 'react-native-document-scanner-plugin';

interface Props {
  visible: boolean;
  onSelect: (choice: 'camera' | 'gallery') => void;
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

    console.log('[scanForensicDocument] status:', status, 'count:', scannedImages?.length ?? 0);

    if (status === ScanDocumentResponseStatus.Cancel || !scannedImages?.length) {
      const message =
        'The scan didn\u2019t finish. If you used the clean-up tool in the scanner, try again without it \u2014 some devices fail to apply it. Otherwise just retry the scan.';
      if (onError) {
        onError('Scan not completed', message);
      } else {
        Alert.alert('Scan not completed', message);
      }
      return false;
    }

    onImageScanned(scannedImages[0]);
    return true;
  } catch (error) {
    console.error('[scanForensicDocument] threw:', error);
    const message = 'Failed to initialize the document scanner.';
    if (onError) {
      onError('Scanner Error', message);
    } else {
      Alert.alert('Scanner Error', message);
    }
    return false;
  }
};

export default function MediaSourcePicker({ visible, onSelect, onCancel, title = 'Upload', message = 'Choose image source' }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
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

          {__DEV__ && (
            <Text style={styles.devBadge}>⚠ DEV ONLY — Production uses camera only</Text>
          )}

          <View style={styles.twoColumnRow}>
            <Pressable style={[styles.optionButton, styles.primaryOption]} onPress={() => onSelect('camera')}>
              <View style={styles.boxContent}>
                <Ionicons name="camera" size={28} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Camera</Text>
              </View>
            </Pressable>

            <Pressable style={[styles.optionButton, styles.secondaryOption]} onPress={() => onSelect('gallery')}>
              <View style={styles.boxContent}>
                <Ionicons name="images" size={28} color="#1E6FD9" />
                <Text style={styles.secondaryButtonText}>Gallery</Text>
              </View>
            </Pressable>
          </View>

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
    backgroundColor: 'rgba(15, 23, 42, 0.48)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 18,
    alignItems: 'stretch',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E8F1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  message: {
    marginTop: 2,
    fontSize: 13,
    color: '#64748B',
  },
  primaryButton: {
    marginTop: 6,
    borderRadius: 12,
    backgroundColor: '#1E6FD9',
    paddingVertical: 12,
    alignItems: 'center',
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D8E3EF',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    alignItems: 'center',
  },
  twoColumnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  optionButton: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryOption: {
    backgroundColor: '#1E6FD9',
  },
  secondaryOption: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8E3EF',
  },
  boxContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#1E6FD9',
    fontSize: 15,
    fontWeight: '800',
  },
  cancelButton: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '700',
  },
  devBadge: {
  fontSize: 11,
  fontWeight: '800',
  color: '#D97706',
  backgroundColor: '#FEF3C7',
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 6,
  alignSelf: 'flex-start',
  marginBottom: 10,
},
});
