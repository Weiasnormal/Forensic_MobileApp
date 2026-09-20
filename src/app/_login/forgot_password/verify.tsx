import PrimaryButton from "@/_components/common/PrimaryButton";
import { colors } from "@/constants/colors";
import { getTypographyStyle } from "@/constants/typography";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { API_ENDPOINTS, API_KEY, buildApiUrl } from "@/constants/api";
import { resolveRole, ROLE_SETTINGS } from "../../../constants/roles";
import {
    type VerificationCodeFormValues,
    verificationCodeSchema,
} from "../../../utils/validation";

export default function VerifyPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ role?: string; email?: string }>();
  const activeRole = resolveRole(params.role);
  const roleConfig = ROLE_SETTINGS[activeRole].forgotPassword;
  const email = params.email ?? roleConfig.verificationEmail;

  const [codeValues, setCodeValues] = useState(Array(6).fill(""));
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const codeRefs = useRef<(TextInput | null)[]>([]);
  const {
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<VerificationCodeFormValues>({
    resolver: zodResolver(verificationCodeSchema),
    defaultValues: { code: "" },
  });

  const handleCodeChange = (index: number, value: string) => {
    const nextValue = value.replace(/\D/g, "").slice(-1);
    const nextValues = [...codeValues];
    nextValues[index] = nextValue;
    setCodeValues(nextValues);
    setValue("code", nextValues.join(""), {
      shouldValidate: true,
      shouldDirty: true,
    });

    if (nextValue && index < 5) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyPress = (index: number, key: string) => {
    if (key === "Backspace" && !codeValues[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (values: VerificationCodeFormValues) => {
    setVerifyError(null);
    setIsVerifying(true);
    try {
      const res = await fetch(buildApiUrl(API_ENDPOINTS.auth.verifyResetCode), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Api-Key": API_KEY || "",
        },
        body: JSON.stringify({ email, code: values.code }),
      });

      if (!res.ok) {
        setVerifyError(
          "That code is invalid or has expired. Please try again.",
        );
        return;
      }

      router.push({
        pathname: "/_login/forgot_password/reset",
        params: { role: activeRole, email, code: values.code },
      });
    } catch {
      setVerifyError("Unable to verify the code right now. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style="light" translucent backgroundColor={colors.primary} />

      <View style={styles.hero}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.85}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color={colors.primaryText} />
        </TouchableOpacity>

        <View style={styles.heroCopy}>
          <Text allowFontScaling={false} style={styles.title}>
            Check Your Email
          </Text>
          <Text allowFontScaling={false} style={styles.subtitle}>
            We sent a 6-digit code to{"\n"}
            {email}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text allowFontScaling={false} style={styles.sectionLabel}>
            Enter verification code
          </Text>

          <View style={styles.codeRow}>
            {codeValues.map((value, index) => (
              <View
                key={index}
                style={[
                  styles.codeBox,
                  (errors.code || verifyError) && styles.codeBoxError,
                ]}
              >
                <TextInput
                  ref={(ref): void => {
                    codeRefs.current[index] = ref;
                  }}
                  style={styles.codeInput}
                  keyboardType="number-pad"
                  maxLength={1}
                  textContentType="oneTimeCode"
                  autoComplete="one-time-code"
                  value={value}
                  onChangeText={(text) => handleCodeChange(index, text)}
                  onKeyPress={(e) =>
                    handleCodeKeyPress(index, e.nativeEvent.key)
                  }
                  placeholder=""
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
            ))}
          </View>

          {errors.code?.message ? (
            <Text allowFontScaling={false} style={styles.errorText}>
              {errors.code.message}
            </Text>
          ) : verifyError ? (
            <Text allowFontScaling={false} style={styles.errorText}>
              {verifyError}
            </Text>
          ) : null}

          <View style={styles.metaColumn}>
            <Text allowFontScaling={false} style={styles.metaText}>
              Code expiration is managed by the server.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View
        style={[styles.bottomActions, { paddingBottom: insets.bottom + 35 }]}
      >
        <PrimaryButton
          label={isVerifying ? "Verifying…" : "Verify"}
          onPress={handleSubmit(handleVerify)}
          loading={isVerifying}
          size="large"
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background2,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: colors.background2,
  },
  scrollView: {
    flex: 1,
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
  title: {
    ...getTypographyStyle("t1Title"),
    color: colors.primaryText,
  },
  subtitle: {
    ...getTypographyStyle("c1Caption", "regular"),
    color: colors.heroSubtitleText,
    marginTop: 4,
  },
  heroCopy: {
    marginTop: 20,
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionLabel: {
    ...getTypographyStyle("c1Caption"),
    alignSelf: "center",
    color: colors.textSecondary,
    marginBottom: 18,
  },
  codeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
  },
  codeBox: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  codeBoxError: {
    borderColor: colors.danger,
  },
  codeInput: {
    width: "100%",
    height: "100%",
    textAlign: "center",
    ...getTypographyStyle("t3Title"),
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  errorText: {
    ...getTypographyStyle("c2Caption"),
    marginTop: 10,
    color: colors.danger,
    textAlign: "center",
  },
  metaColumn: {
    alignItems: "center",
    gap: 6,
    marginTop: 14,
  },
  metaText: {
    ...getTypographyStyle("c2Caption"),
    color: colors.textSecondary,
  },
  metaAction: {
    ...getTypographyStyle("c2Caption", "bold"),
    color: colors.primary,
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: colors.background2,
  },
});
