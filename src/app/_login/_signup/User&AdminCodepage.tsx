import PrimaryButton from "@/_components/common/PrimaryButton";
import { colors } from "@/constants/colors";
import { getTypographyStyle } from "@/constants/typography";
import { useAuthStore } from "@/store/authStore";
import { useFeedbackStore } from "@/store/feedbackStore";
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

  const handleVerify = async (values: InviteCodeFormValues) => {
    setSubmitError(null);

    const raw = values.code.toUpperCase();
    const formattedCode = `${raw.slice(0, 3)}-${raw.slice(3, 7)}`;

    setIsSubmitting(true);
    try {
      await joinInviteCode(formattedCode);
      useFeedbackStore.getState().showToast("Invite code submitted", "success");
      router.replace({
        pathname: "/_login/_signup/PendingUser&Admin",
        params: { role: activeRole },
      });
    } catch {
      setSubmitError(null);
      useFeedbackStore
        .getState()
        .showToast("Organization not found", "infoLight");
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
});
