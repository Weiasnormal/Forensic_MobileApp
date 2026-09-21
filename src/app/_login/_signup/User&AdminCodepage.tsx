import PrimaryButton from "@/_components/common/PrimaryButton";
import { colors } from "@/constants/colors";
import { getTypographyStyle } from "@/constants/typography";
import { normalizeInviteCodeErrorMessage } from "@/services/authApi";
import { useAuthStore } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { resolveRole, ROLE_SETTINGS } from "../../../constants/roles";
import {
    type InviteCodeFormValues,
    inviteCodeSchema,
} from "../../../utils/validation";

export default function UserAndAdminCodePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ role?: string }>();
  const activeRole = resolveRole(params.role);
  const roleConfig = ROLE_SETTINGS[activeRole].signUpCode;

  const joinInviteCode = useAuthStore((state) => state.joinInviteCode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const hasScannedRef = useRef(false);

  const [codeValues, setCodeValues] = useState(Array(7).fill(""));
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const {
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<InviteCodeFormValues>({
    resolver: zodResolver(inviteCodeSchema),
    defaultValues: {
      code: "",
    },
  });

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[value.length - 1];
    }

    const allowedPattern = index < 3 ? /[A-Za-z]/ : /[A-Za-z0-9]/;
    if (value && !allowedPattern.test(value)) {
      return;
    }
    value = value.toUpperCase();

    const newValues = [...codeValues];
    newValues[index] = value;
    setCodeValues(newValues);
    setValue("code", newValues.join(""), {
      shouldValidate: true,
      shouldDirty: true,
    });

    if (value && index < 6) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyPress = (index: number, key: string) => {
    if (key === "Backspace" && !codeValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOpenScanner = async () => {
    setSubmitError(null);

    if (!cameraPermission?.granted) {
      const permission = await requestCameraPermission();
      if (!permission.granted) {
        setSubmitError("Camera access is required to scan the invite QR code.");
        return;
      }
    }

    hasScannedRef.current = false;
    setIsScannerVisible(true);
  };

  const handleBarcodeScanned = (data: string) => {
    if (hasScannedRef.current) return;

    const normalizedCode = data.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    if (!/^[A-Z]{3}[A-Z0-9]{4}$/.test(normalizedCode)) {
      setSubmitError("That QR code does not contain a valid invite code.");
      return;
    }

    hasScannedRef.current = true;
    setCodeValues(normalizedCode.split(""));
    setValue("code", normalizedCode, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setIsScannerVisible(false);
  };

  const handleVerify = async (values: InviteCodeFormValues) => {
    setSubmitError(null);

    const raw = values.code.toUpperCase();
    const formattedCode = `${raw.slice(0, 3)}-${raw.slice(3, 7)}`;

    setIsSubmitting(true);
    try {
      await joinInviteCode(formattedCode);
      router.replace({
        pathname: "/_login/_signup/PendingUser&Admin",
        params: { role: activeRole },
      });
    } catch (error) {
      const friendlyMessage = normalizeInviteCodeErrorMessage(
        error instanceof Error ? error.message : error,
      );

      setSubmitError(friendlyMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCodeComplete = codeValues.join("").length === 7;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style="light" translucent backgroundColor={colors.primary} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={colors.primaryText}
            />
          </TouchableOpacity>

          <Text allowFontScaling={false} style={styles.title}>
            {roleConfig.title}
          </Text>
          <Text allowFontScaling={false} style={styles.subtitle}>
            {roleConfig.subtitle}
          </Text>
        </View>

        <View style={[styles.formArea, { paddingBottom: insets.bottom + 35 }]}>
          <Text allowFontScaling={false} style={styles.label}>
            Invite code
          </Text>

          <View style={styles.codeInputContainer}>
            {codeValues.map((value, index) => (
              <React.Fragment key={index}>
                {index === 3 && (
                  <Text allowFontScaling={false} style={styles.codeHyphen}>
                    -
                  </Text>
                )}
                <TextInput
                  ref={(ref): void => {
                    inputRefs.current[index] = ref;
                  }}
                  style={[
                    styles.codeInput,
                    errors.code && styles.codeInputError,
                  ]}
                  keyboardType="default"
                  autoCapitalize="characters"
                  maxLength={1}
                  value={value}
                  onChangeText={(text) => handleCodeChange(index, text)}
                  onKeyPress={(e) =>
                    handleCodeKeyPress(index, e.nativeEvent.key)
                  }
                  placeholder=""
                  placeholderTextColor={colors.textTertiary}
                />
              </React.Fragment>
            ))}
          </View>

          <TouchableOpacity
            style={styles.scanButton}
            activeOpacity={0.8}
            onPress={() => void handleOpenScanner()}
            disabled={isSubmitting}
          >
            <Ionicons name="scan-outline" size={20} color={colors.primary} />
            <Text allowFontScaling={false} style={styles.scanButtonText}>
              Scan QR code 
            </Text>
          </TouchableOpacity>

          {submitError ? (
            <Text allowFontScaling={false} style={styles.errorText}>
              {submitError}
            </Text>
          ) : null}

          <Text allowFontScaling={false} style={styles.helperText}>
            {roleConfig.noCodeText}
          </Text>

          <PrimaryButton
            label={isSubmitting ? "Verifying…" : "Verify & continue"}
            onPress={handleSubmit(handleVerify)}
            loading={isSubmitting}
            disabled={!isCodeComplete || isSubmitting}
            size="large"
            style={styles.primaryButtonSpacing}
          />
        </View>
      </ScrollView>

      <Modal
        visible={isScannerVisible}
        animationType="slide"
        onRequestClose={() => setIsScannerVisible(false)}
      >
        <View style={styles.scannerScreen}>
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={({ data }) => handleBarcodeScanned(data)}
          />
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerHeader}>
              <Text allowFontScaling={false} style={styles.scannerTitle}>
                Scan invite QR code
              </Text>
              <TouchableOpacity
                style={styles.closeScannerButton}
                onPress={() => setIsScannerVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.primaryText} />
              </TouchableOpacity>
            </View>
            <View style={styles.scanFrame} />
            <Text allowFontScaling={false} style={styles.scannerHint}>
              Point your camera at the QR code shared by the administrator.
            </Text>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background2,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background2,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: colors.background2,
  },
  hero: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: 44,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.heroIconButtonBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...getTypographyStyle("t1Title"),
    color: colors.primaryText,
    marginTop: 20,
  },
  subtitle: {
    ...getTypographyStyle("body"),
    color: colors.heroSubtitleText,
    marginTop: 4,
  },
  formArea: {
    flex: 1,
    backgroundColor: colors.background2,
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  label: {
    ...getTypographyStyle("c1Caption", "regular"),
    color: colors.textSecondary,
    marginBottom: 8,
    textAlign: "center",
  },
  codeInputContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  codeInput: {
    width: 35,
    height: 45,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.background2,
    textAlign: "center",
    ...getTypographyStyle("t3Title"),
    color: colors.textPrimary,
  },
  codeInputError: {
    borderColor: colors.danger,
  },
  codeHyphen: {
    ...getTypographyStyle("t3Title"),
    color: colors.textSecondary,
  },
  scanButton: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  scanButtonText: {
    ...getTypographyStyle("c1Caption", "medium"),
    color: colors.primary,
  },
  helperText: {
    ...getTypographyStyle("c2Caption"),
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  errorText: {
    ...getTypographyStyle("c2Caption"),
    color: colors.danger,
    textAlign: "center",
    marginBottom: 10,
  },
  primaryButtonSpacing: {
    marginTop: "auto",
  },
  scannerScreen: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "space-between",
    padding: 24,
    paddingTop: 60,
    paddingBottom: 48,
  },
  scannerHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scannerTitle: {
    ...getTypographyStyle("t3Title"),
    color: colors.primaryText,
  },
  closeScannerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: colors.primaryText,
    borderRadius: 18,
  },
  scannerHint: {
    ...getTypographyStyle("body"),
    color: colors.primaryText,
    textAlign: "center",
  },
});
