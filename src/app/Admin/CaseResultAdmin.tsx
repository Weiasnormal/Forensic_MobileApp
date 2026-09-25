import PrimaryButton from "@/_components/common/PrimaryButton";
import SecondaryButton from "@/_components/common/SecondaryButton";
import ToggleSwitch from "@/_components/common/ToggleSwitch";
import VerdictCard from "@/_components/common/VerdIctCard";
import ZoomableImageModal from "@/_components/common/ZoomableImageModal";
import ErrorModal from "@/_components/modals/error_modal";
import SuccessModal from "@/_components/modals/success_modal";
import { API_ENDPOINTS, API_KEY, buildApiUrl } from "@/constants/api";
import { colors } from "@/constants/colors";
import { getTypographyStyle } from "@/constants/typography";
import {
  CaseReviewApiError,
  fetchCaseForReview,
  FinalVerdict,
  submitCaseReview,
  toggleCaseInternalReviewFlag,
  type AdminCaseDetail,
} from "@/services/caseReviewApi";
import {
  findOverlayImage,
  REFERENCE_SLOTS,
  type OverlayImageRef,
} from "@/services/signatureAnalysis";
import { getAuthHeader } from "@/store/authStore";
import { useCaseStore } from "@/store/caseStore";
import { useFeedbackStore } from "@/store/feedbackStore";
import { normalizePersonDisplay } from "@/utils/validation";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const viewModes = ["Heatmap", "Bounding Box", "Stroke Diff"] as const;
type ViewMode = (typeof viewModes)[number];
const DEFAULT_PDF_EXPORT_ALLOWED = true;

const WORKFLOW_STATUS_LABEL: Record<AdminCaseDetail["caseStatus"], string> = {
  Processing: "Processing",
  PendingReview: "Pending Review",
  Reviewed: "Reviewed",
};

export default function CaseResultAdmin() {
  const router = useRouter();
  const nav = router as any;
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ caseId?: string }>();
  const caseId = params.caseId ?? "";

  const [activeView, setActiveView] = useState<ViewMode>("Heatmap");
  const [caseDetail, setCaseDetail] = useState<AdminCaseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [reviewDecision, setReviewDecision] = useState<
    "suspected" | "genuine" | null
  >(null);
  const [isPdfExportAllowed, setIsPdfExportAllowed] = useState(
    DEFAULT_PDF_EXPORT_ALLOWED,
  );
  const [isFlaggedForInternalReview, setIsFlaggedForInternalReview] =
    useState(false);
  const [isTogglingFlag, setIsTogglingFlag] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");

  const localCase = useCaseStore((s) =>
    s.cases.find((c) => String(c.caseId) === caseId),
  );
  const localAnalysisResult = useCaseStore((s) =>
    caseId ? s.signatureAnalysisResults[caseId] : undefined,
  );

  const loadCase = useCallback(async () => {
    if (!caseId) {
      setIsLoading(false);
      setLoadError("No case selected.");
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    try {
      const detail = await fetchCaseForReview(caseId);
      setCaseDetail(detail);
      const isReviewComplete =
        detail.finalVerdict !== null && detail.finalVerdict !== FinalVerdict.None;
      setIsPdfExportAllowed(
        isReviewComplete
          ? (detail.isPdfExportAllowed ?? DEFAULT_PDF_EXPORT_ALLOWED)
          : DEFAULT_PDF_EXPORT_ALLOWED,
      );
      setIsFlaggedForInternalReview(detail.isFlaggedForInternalReview);
      setReviewNote(detail.reviewNote ?? "");
      if (detail.finalVerdict === FinalVerdict.Genuine)
        setReviewDecision("genuine");
      else if (detail.finalVerdict === FinalVerdict.Forged)
        setReviewDecision("suspected");
      else setReviewDecision(null);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Unable to load this case.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    loadCase();
  }, [loadCase]);

  const mlVerdictRaw = caseDetail?.mlResponse?.verdict?.toUpperCase() ?? null;
  const isMlSuspected = mlVerdictRaw === "FORGED";
  const mlConfidence = caseDetail?.mlResponse
    ? isMlSuspected
      ? caseDetail.mlResponse.confidenceForged
      : caseDetail.mlResponse.confidenceGenuine
    : 0;
  const mlVerdictLabel = mlVerdictRaw
    ? isMlSuspected
      ? "SUSPECTED"
      : "GENUINE"
    : "PENDING";
  const processingDurationMs =
    caseDetail?.timeElapsedMs ?? localAnalysisResult?.analysisTimeMs;
  const processingTime = processingDurationMs
    ? `${(processingDurationMs / 1000).toFixed(2)}s`
    : "—";

  const isAlreadyReviewed = Boolean(
    caseDetail &&
    caseDetail.finalVerdict !== null &&
    caseDetail.finalVerdict !== FinalVerdict.None,
  );

  const isOverridden =
    reviewDecision !== null &&
    ((isMlSuspected && reviewDecision === "genuine") ||
      (!isMlSuspected && reviewDecision === "suspected"));

  const finalDecisionLabel = reviewDecision
    ? reviewDecision.toUpperCase()
    : mlVerdictLabel;

  const overlayVariant =
    activeView === "Heatmap"
      ? "Heatmap"
      : activeView === "Bounding Box"
        ? "BoundingBox"
        : "StrokeDiff";

  const backendOverlayImages = useMemo<OverlayImageRef[]>(
    () =>
      (caseDetail?.mlResponse?.gradCamResults ?? []).map((item) => ({
        id: item.imageId,
        slot: item.slot as OverlayImageRef["slot"],
        variant: item.variant as OverlayImageRef["variant"],
      })),
    [caseDetail],
  );

  const referenceOverlayUris = useMemo(() => {
    return REFERENCE_SLOTS.map((slot) => {
      const ref =
        findOverlayImage(backendOverlayImages, slot, overlayVariant) ??
        findOverlayImage(
          localAnalysisResult?.overlay_images,
          slot,
          overlayVariant,
        );
      return caseId && ref
        ? buildApiUrl(API_ENDPOINTS.ml.getBlobImage(caseId, ref.id))
        : null;
    });
  }, [backendOverlayImages, localAnalysisResult, overlayVariant, caseId]);

  const suspectOverlayUri = useMemo(() => {
    const ref =
      findOverlayImage(backendOverlayImages, "Suspected", overlayVariant) ??
      findOverlayImage(
        localAnalysisResult?.overlay_images,
        "Suspected",
        overlayVariant,
      );
    return caseId && ref
      ? buildApiUrl(API_ENDPOINTS.ml.getBlobImage(caseId, ref.id))
      : null;
  }, [backendOverlayImages, localAnalysisResult, overlayVariant, caseId]);

  const referenceImageUris = useMemo(
    () =>
      REFERENCE_SLOTS.map((_, index) =>
        caseId
          ? buildApiUrl(
              API_ENDPOINTS.signatures.getReference(caseId, index + 1),
            )
          : null,
      ),
    [caseId],
  );

  const suspectedImageUri = useMemo(
    () =>
      caseId
        ? buildApiUrl(API_ENDPOINTS.signatures.getSuspected(caseId, 1))
        : null,
    [caseId],
  );

  const handleSaveReview = async () => {
    if (!caseId || !reviewDecision) return;

    setIsSaving(true);
    setSaveError(null);
    try {
      await submitCaseReview(caseId, {
        finalVerdict:
          reviewDecision === "genuine"
            ? FinalVerdict.Genuine
            : FinalVerdict.Forged,
        reviewNote: reviewNote.trim() ? reviewNote.trim() : null,
        isPdfExportAllowed,
      });
      useFeedbackStore.getState().showToast("Review saved", "success");
      await loadCase();
    } catch (error) {
      if (error instanceof CaseReviewApiError && error.status === 409) {
        setSaveError(
          "This case has already been reviewed. Pull to refresh to see the latest status.",
        );
      } else if (error instanceof CaseReviewApiError && error.status === 403) {
        setSaveError("Only Org Admins can submit a supervisor review.");
      } else {
        setSaveError(
          error instanceof Error
            ? error.message
            : "Unable to save this review.",
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleInternalReviewFlag = async (value: boolean) => {
    setIsTogglingFlag(true);
    try {
      await toggleCaseInternalReviewFlag(caseId, value);
      setIsFlaggedForInternalReview(value);
      useFeedbackStore
        .getState()
        .showToast(
          value
            ? "Case flagged for internal review"
            : "Internal review flag removed",
          "success",
        );
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Unable to update the internal review flag.",
      );
    } finally {
      setIsTogglingFlag(false);
    }
  };

  const handleExportReport = async () => {
    if (isExportingPdf) return;

    if (!caseId) {
      setExportError("Case ID is missing.");
      return;
    }

    setIsExportingPdf(true);
    try {
      const FileSystem = await import("expo-file-system/legacy");
      const Sharing = await import("expo-sharing");
      const reportPdfUrl = buildApiUrl(
        API_ENDPOINTS.analysis.getResults(caseId),
      );
      const localUri =
        FileSystem.documentDirectory + `AVERA_Forensic_Report_${caseId}.pdf`;
      const download = await FileSystem.downloadAsync(reportPdfUrl, localUri, {
        headers: { "X-Api-Key": API_KEY || "", ...getAuthHeader() },
      });
      const fileInfo = await FileSystem.getInfoAsync(download.uri);

      if (
        download.status < 200 ||
        download.status >= 300 ||
        !fileInfo.exists ||
        fileInfo.size === 0
      ) {
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(download.uri, { idempotent: true });
        }
        throw new Error(
          caseDetail?.isPdfExportAllowed
            ? "The PDF report is not ready yet. Please try again."
            : "PDF export is not enabled for this case. Save the review with PDF export enabled first.",
        );
      }

      if (Platform.OS === "android") {
        const directoryPermission =
          await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(
            FileSystem.StorageAccessFramework.getUriForDirectoryInRoot(
              "Download",
            ),
          );

        if (!directoryPermission.granted) {
          setExportError("Choose a folder to save the PDF report.");
          return;
        }

        const savedFileUri =
          await FileSystem.StorageAccessFramework.createFileAsync(
            directoryPermission.directoryUri,
            `AVERA_Forensic_Report_${caseId}.pdf`,
            "application/pdf",
          );
        const pdfBase64 = await FileSystem.readAsStringAsync(download.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await FileSystem.writeAsStringAsync(savedFileUri, pdfBase64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        setExportSuccess("PDF report saved to your selected phone folder.");
        return;
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(download.uri, {
          mimeType: "application/pdf",
          dialogTitle: "Export Forensic PDF Report",
          UTI: "com.adobe.pdf",
        });
        setExportSuccess("PDF report exported successfully.");
      } else {
        setExportError(`File saved to: ${download.uri}`);
      }
    } catch (error) {
      console.warn("Failed to download PDF report:", error);
      setExportError(
        "The PDF report is either still generating or unavailable.",
      );
    } finally {
      setIsExportingPdf(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.screen}>
        <TopBar title="Loading…" onBackPress={() => nav.back()} />
        <View style={styles.centerFill}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (loadError || !caseDetail) {
    return (
      <SafeAreaView style={styles.screen}>
        <TopBar title="Case" onBackPress={() => nav.back()} />
        <View style={styles.centerFill}>
          <Ionicons name="warning-outline" size={40} color={colors.danger} />
          <Text style={styles.errorTitle}>
            {loadError ?? "Unable to load this case."}
          </Text>
          <PrimaryButton
            label="Retry"
            onPress={loadCase}
            size="medium"
            style={{ marginTop: 16 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <TopBar
        title={caseDetail.caseCode || caseId}
        onBackPress={() => nav.back()}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(160, insets.bottom + 120) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.heroResultWrap,
            {
              backgroundColor: isMlSuspected
                ? colors.dangerLight
                : colors.statusGenuineBg,
            },
          ]}
        >
          <View
            style={[
              styles.heroBadge,
              {
                backgroundColor: isMlSuspected
                  ? colors.danger
                  : colors.statusGenuine,
              },
            ]}
          >
            <Ionicons
              name={isMlSuspected ? "alert-circle" : "checkmark-circle"}
              size={28}
              color={colors.primaryText}
            />
          </View>
          <View style={styles.heroTextWrap}>
            <Text
              style={[
                styles.heroPercent,
                { color: isMlSuspected ? colors.danger : colors.statusGenuine },
              ]}
            >
              {mlConfidence.toFixed(1)}%{" "}
              <Text style={styles.heroLabel}>{mlVerdictLabel}</Text>
            </Text>
            <Text style={styles.heroCase}>VERDICT · {caseDetail.caseCode}</Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Analyst</Text>
            <Text style={styles.infoValue}>
              {caseDetail.examiner
                ? normalizePersonDisplay(caseDetail.examiner)
                : "—"}
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>
              {caseDetail.createdAt
                ? new Date(caseDetail.createdAt).toLocaleDateString()
                : "—"}
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Document Type</Text>
            <Text style={styles.infoValue}>
              {caseDetail.documentType === "Other" &&
              caseDetail.otherDocumentType
                ? caseDetail.otherDocumentType
                : caseDetail.documentType}
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Admin Status</Text>
            <Text style={styles.infoValue}>
              {WORKFLOW_STATUS_LABEL[caseDetail.caseStatus]}
            </Text>
          </View>
        </View>

        <View style={styles.viewTabsRow}>
          {viewModes.map((mode) => {
            const selected = mode === activeView;
            return (
              <Pressable
                key={mode}
                onPress={() => setActiveView(mode)}
                style={[styles.viewTab, selected && styles.viewTabActive]}
              >
                <Text
                  style={[
                    styles.viewTabText,
                    selected && styles.viewTabTextActive,
                  ]}
                >
                  {mode}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.thumbsGrid}>
          <View style={styles.smallThumbsGrid}>
            {REFERENCE_SLOTS.map((slot, idx) => {
              const localUri = localCase?.uploads?.references?.[idx];
              const backendUri = referenceOverlayUris[idx];
              const uri = backendUri ?? localUri ?? referenceImageUris[idx];
              if (!uri) {
                return (
                  <View
                    key={`ref-${idx}`}
                    style={[styles.thumbCardSmall, styles.thumbPlaceholder]}
                  >
                    <Ionicons
                      name="image-outline"
                      size={24}
                      color={colors.label}
                    />
                  </View>
                );
              }
              return (
                <Pressable
                  key={`ref-${idx}`}
                  style={styles.thumbCardSmall}
                  onPress={() => {
                    setPreviewUri(uri);
                    setPreviewTitle(
                      `SIG ${String(idx + 1).padStart(2, "0")} — ${activeView}`,
                    );
                  }}
                >
                  <View style={styles.thumbImageWrap}>
                    <ExpoImage
                      source={{
                        uri: uri.split("?")[0],
                        headers: {
                          "X-Api-Key": API_KEY || "",
                          ...getAuthHeader(),
                        },
                      }}
                      style={StyleSheet.absoluteFill}
                      contentFit="cover"
                    />
                  </View>
                  <Text style={styles.thumbLabel}>
                    SIG {String(idx + 1).padStart(2, "0")}
                  </Text>
                  <Text style={styles.thumbTag}>Reference</Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={styles.largeThumbWrap}
            disabled={
              !localCase?.uploads?.suspect &&
              !suspectOverlayUri &&
              !suspectedImageUri
            }
            onPress={() => {
              const uri =
                suspectOverlayUri ??
                localCase?.uploads?.suspect ??
                suspectedImageUri;
              if (!uri) return;
              setPreviewUri(uri);
              setPreviewTitle(`Suspected Signature — ${activeView}`);
            }}
          >
            {localCase?.uploads?.suspect ||
            suspectOverlayUri ||
            suspectedImageUri ? (
              <ExpoImage
                source={
                  suspectOverlayUri
                    ? {
                        uri: suspectOverlayUri,
                        headers: {
                          "X-Api-Key": API_KEY || "",
                          ...getAuthHeader(),
                        },
                      }
                    : {
                        uri: String(
                          localCase?.uploads?.suspect ??
                            suspectedImageUri ??
                            "",
                        ).split("?")[0],
                        headers: {
                          "X-Api-Key": API_KEY || "",
                          ...getAuthHeader(),
                        },
                      }
                }
                style={styles.largeThumbImage}
                contentFit="contain"
              />
            ) : (
              <View style={styles.largeThumbPlaceholder}>
                <Ionicons name="scan-outline" size={28} color={colors.label} />
                <Text style={styles.largeThumbText}>No suspect image</Text>
              </View>
            )}
            <Text style={styles.suspectLabel}>QUESTIONED</Text>
          </Pressable>
        </View>

        <View style={styles.reviewSection}>
          <View style={styles.reviewHeaderRow}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Text style={styles.findingsTitle}>Supervisor Review</Text>
            </View>
            <View
              style={[
                styles.reviewPendingBadge,
                isAlreadyReviewed && styles.reviewDoneBadge,
              ]}
            >
              <Text
                style={[
                  styles.reviewPendingText,
                  isAlreadyReviewed && styles.reviewDoneText,
                ]}
              >
                {WORKFLOW_STATUS_LABEL[caseDetail.caseStatus]}
              </Text>
            </View>
          </View>

          <View style={styles.modelAssessmentRow}>
            <Text style={styles.modelAssessmentLabel}>Model Assessment</Text>
            <Text
              style={[
                styles.modelAssessmentVerdict,
                { color: isMlSuspected ? colors.danger : colors.statusGenuine },
              ]}
            >
              {mlConfidence.toFixed(1)}% {mlVerdictLabel}
            </Text>
          </View>

          <View style={styles.modelAssessmentRow}>
            <Text style={styles.modelAssessmentLabel}>Time</Text>
            <Text style={styles.modelAssessmentVerdict}>{processingTime}</Text>
          </View>

          <View style={styles.divider} />

          {isAlreadyReviewed ? (
            <VerdictCard
              status="updated"
              supervisorName="Admin"
              originalVerdict={mlVerdictLabel}
              newVerdict={
                caseDetail.finalVerdict === FinalVerdict.Genuine
                  ? "GENUINE"
                  : "SUSPECTED"
              }
              date={
                caseDetail.reviewedAt
                  ? new Date(caseDetail.reviewedAt).toLocaleDateString()
                  : "—"
              }
              reviewNote={caseDetail.reviewNote ?? undefined}
            />
          ) : (
            <View style={styles.reviewDecisionBlock}>
              <Text style={styles.findingsTitle}>Review Decision</Text>
              <Text style={styles.reviewDecisionSub}>
                Confirm or override the model assessment based on your review of
                the evidence.
              </Text>

              {reviewDecision && (
                <View
                  style={[
                    styles.finalDecisionBanner,
                    isOverridden ? styles.overrideBanner : styles.confirmBanner,
                  ]}
                >
                  <Text style={[styles.finalDecisionText]}>
                    Your decision changes the result to:{" "}
                    <Text
                      style={[
                        styles.finalDecisionValue,
                        {
                          color:
                            finalDecisionLabel === "SUSPECTED"
                              ? colors.statusSuspected
                              : colors.statusGenuine,
                        },
                      ]}
                    >
                      {finalDecisionLabel}
                    </Text>
                  </Text>
                </View>
              )}

              <Pressable
                style={styles.radioOption}
                onPress={() => setReviewDecision("suspected")}
              >
                <View style={styles.radioIconWrap}>
                  <Ionicons
                    name="close-circle-outline"
                    size={24}
                    color={colors.danger}
                  />
                </View>
                <View style={styles.radioTextWrap}>
                  <Text style={styles.radioTitle}>Confirm Suspected</Text>
                  <Text style={styles.radioDesc}>
                    {isMlSuspected
                      ? "Matches model prediction"
                      : "Overrides model prediction"}
                  </Text>
                </View>
                <Ionicons
                  name={
                    reviewDecision === "suspected"
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={24}
                  color={
                    reviewDecision === "suspected"
                      ? colors.primary
                      : colors.inputBorder
                  }
                />
              </Pressable>

              <Pressable
                style={styles.radioOption}
                onPress={() => setReviewDecision("genuine")}
              >
                <View style={styles.radioIconWrap}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={24}
                    color={colors.statusGenuine}
                  />
                </View>
                <View style={styles.radioTextWrap}>
                  <Text style={styles.radioTitle}>Confirm Genuine</Text>
                  <Text style={styles.radioDesc}>
                    {!isMlSuspected
                      ? "Matches model prediction"
                      : "Overrides model prediction"}
                  </Text>
                </View>
                <Ionicons
                  name={
                    reviewDecision === "genuine"
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={24}
                  color={
                    reviewDecision === "genuine"
                      ? colors.primary
                      : colors.inputBorder
                  }
                />
              </Pressable>

              <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
                <View style={styles.radioIconWrap}>
                  <Ionicons
                    name="document-text-outline"
                    size={24}
                    color={colors.textSecondary}
                  />
                </View>
                <View style={styles.radioTextWrap}>
                  <Text style={styles.radioTitle}>Enable PDF Export</Text>
                  <Text style={styles.radioDesc}>
                    Allow this report to be exported as a PDF
                  </Text>
                </View>
                <ToggleSwitch
                  value={isPdfExportAllowed}
                  onValueChange={setIsPdfExportAllowed}
                />
              </View>
              <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
                <View style={styles.radioIconWrap}>
                  <Ionicons
                    name="flag-outline"
                    size={24}
                    color={colors.suspectSubtext}
                  />
                </View>
                <View style={styles.radioTextWrap}>
                  <Text style={styles.radioTitle}>
                    Flag for Internal Review
                  </Text>
                  <Text style={styles.radioDesc}>
                    Show this case as flagged to admins
                  </Text>
                </View>
                <ToggleSwitch
                  value={isFlaggedForInternalReview}
                  onValueChange={handleToggleInternalReviewFlag}
                  disabled={isTogglingFlag}
                />
              </View>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.noteSection}>
            <Text style={styles.findingsTitle}>
              Review Note <Text style={styles.optionalText}>(Optional)</Text>
            </Text>
            <View style={styles.textAreaContainer}>
              <TextInput
                style={styles.textArea}
                placeholder="Add observations, evidence references, or rationale for this review decision..."
                placeholderTextColor={colors.label}
                multiline
                maxLength={500}
                value={reviewNote}
                onChangeText={setReviewNote}
                editable={!isAlreadyReviewed}
              />
              <Text style={styles.charCounter}>{reviewNote.length}/500</Text>
            </View>

            <View style={styles.infoBanner}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={colors.label}
              />
              <Text style={styles.infoBannerText}>
                Notes are internally visible and logged with the final audit
                report.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <ZoomableImageModal
        visible={previewUri !== null}
        uri={previewUri}
        title={previewTitle}
        onClose={() => {
          setPreviewUri(null);
          setPreviewTitle("");
        }}
      />

      <ErrorModal
        visible={!!saveError}
        title="Review Not Saved"
        message={saveError ?? ""}
        onPrimaryPress={() => setSaveError(null)}
      />

      <ErrorModal
        visible={!!exportError}
        title="Export Failed"
        message={exportError ?? ""}
        onPrimaryPress={() => setExportError(null)}
      />

      <SuccessModal
        visible={!!exportSuccess}
        title="Export Complete"
        message={exportSuccess ?? ""}
        onPrimaryPress={() => setExportSuccess(null)}
      />

      <View style={[styles.buttonContainer, { bottom: insets.bottom }]}>
        {!isAlreadyReviewed && (
          <PrimaryButton
            label={isSaving ? "Saving…" : "Save Review"}
            onPress={handleSaveReview}
            disabled={!reviewDecision || isSaving}
            loading={isSaving}
            size="medium"
          />
        )}
        <SecondaryButton
          label={isExportingPdf ? "Exporting PDF..." : "Export PDF Report"}
          onPress={handleExportReport}
          disabled={isExportingPdf}
          loading={isExportingPdf}
          size="medium"
          style={isAlreadyReviewed ? undefined : styles.secondaryButtonSpacing}
        />
      </View>
    </SafeAreaView>
  );
}

function TopBar({
  title,
  onBackPress,
}: {
  title: string;
  onBackPress: () => void;
}) {
  return (
    <View style={styles.topBarWrapper}>
      <View style={styles.topBar}>
        <Pressable onPress={onBackPress} style={styles.backButton}>
          <View style={styles.backButtonBox}>
            <Ionicons
              name="chevron-back"
              size={20}
              color={colors.textPrimary}
            />
          </View>
        </Pressable>
        <Text style={styles.topBarTitle}>{title}</Text>
        <View style={{ width: 36 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background2 },
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 16 },
  centerFill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  errorTitle: {
    ...getTypographyStyle("body", "semiBold"),
    color: colors.textPrimary,
    textAlign: "center",
  },

  heroResultWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  heroBadge: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTextWrap: { flex: 1 },
  heroPercent: { ...getTypographyStyle("t2Title"), letterSpacing: -0.3 },
  heroLabel: {
    ...getTypographyStyle("t2Title"),
    letterSpacing: -0.3,
    textTransform: "uppercase",
  },
  heroCase: {
    ...getTypographyStyle("l2List"),
    marginTop: 6,
    letterSpacing: 0.4,
    color: colors.textSecondary,
  },

  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  infoCard: {
    width: "48%",
    backgroundColor: colors.cardBackground,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.dividerLight,
  },
  infoLabel: {
    ...getTypographyStyle("c2Caption", "regular"),
    color: colors.label,
    marginBottom: 4,
  },
  infoValue: { ...getTypographyStyle("b3Button"), color: colors.textPrimary },

  viewTabsRow: { flexDirection: "row", gap: 8 },
  viewTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.dividerLight,
    backgroundColor: colors.cardBackground,
  },
  viewTabActive: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.statsBackground,
  },
  viewTabText: {
    ...getTypographyStyle("b3Button"),
    color: colors.textSecondary,
  },
  viewTabTextActive: { color: colors.textPrimary },

  thumbsGrid: { flexDirection: "column", gap: 12 },
  smallThumbsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  thumbCardSmall: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.dividerLight,
    padding: 10,
    backgroundColor: colors.cardBackground,
    width: "48%",
    marginBottom: 8,
  },
  thumbPlaceholder: {
    minHeight: 118,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbImageWrap: {
    width: "100%",
    height: 56,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
    backgroundColor: colors.background,
  },
  thumbLabel: { ...getTypographyStyle("b3Button"), color: colors.textPrimary },
  thumbTag: {
    ...getTypographyStyle("c2Caption", "regular"),
    color: colors.statusGenuine,
    marginTop: 4,
  },

  largeThumbWrap: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.statsBackground,
    backgroundColor: colors.cardBackground,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  largeThumbImage: { width: "100%", height: 140, borderRadius: 8 },
  largeThumbPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28,
  },
  largeThumbText: { marginTop: 8, color: colors.label },
  suspectLabel: {
    ...getTypographyStyle("b3Button"),
    color: colors.textPrimary,
    marginTop: 8,
  },

  findingsTitle: {
    ...getTypographyStyle("t3Title"),
    color: colors.textPrimary,
  },

  reviewSection: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.dividerLight,
    backgroundColor: colors.cardBackground,
    padding: 16,
    marginTop: 8,
  },
  reviewHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  reviewPendingBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  reviewPendingText: {
    ...getTypographyStyle("c2Caption", "bold"),
    color: colors.textSecondary,
  },
  reviewDoneBadge: { backgroundColor: colors.statusGenuineBg },
  reviewDoneText: { color: colors.statusGenuine },

  modelAssessmentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modelAssessmentLabel: {
    ...getTypographyStyle("b3Button"),
    color: colors.textPrimary,
  },
  modelAssessmentVerdict: {
    ...getTypographyStyle("b3Button"),
    fontWeight: "bold",
  },

  divider: {
    height: 1,
    backgroundColor: colors.dividerLight,
    marginVertical: 16,
  },

  reviewDecisionBlock: { gap: 12 },
  reviewDecisionSub: {
    ...getTypographyStyle("c1Caption", "regular"),
    color: colors.textSecondary,
    marginBottom: 8,
  },

  finalDecisionBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
  },
  overrideBanner: {
    backgroundColor: colors.background2,
    borderColor: colors.border,
  },
  confirmBanner: {
    backgroundColor: colors.background2,
    borderColor: colors.border,
  },
  finalDecisionIcon: {
    marginTop: 1,
  },
  finalDecisionText: {
    ...getTypographyStyle("c1Caption", "regular"),
    color: colors.textPrimary,
    flex: 1,
    minWidth: 0,
    lineHeight: 18,
  },
  finalDecisionValue: {
    fontWeight: "bold",
  },

  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.dividerLight,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.dividerLight,
  },
  radioIconWrap: { width: 32, alignItems: "center" },
  radioTextWrap: { flex: 1 },
  radioTitle: { ...getTypographyStyle("b3Button"), color: colors.textPrimary },
  radioDesc: {
    ...getTypographyStyle("c2Caption", "regular"),
    color: colors.label,
    marginTop: 4,
  },

  noteSection: { gap: 12 },
  optionalText: { color: colors.label, fontWeight: "normal" },
  textAreaContainer: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    padding: 12,
    backgroundColor: colors.background,
    minHeight: 120,
  },
  textArea: {
    flex: 1,
    ...getTypographyStyle("c1Caption", "regular"),
    color: colors.textPrimary,
    textAlignVertical: "top",
  },
  charCounter: {
    textAlign: "right",
    ...getTypographyStyle("c2Caption", "regular"),
    color: colors.label,
    marginTop: 8,
  },

  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.dividerLight,
  },
  infoBannerText: {
    flex: 1,
    ...getTypographyStyle("c2Caption", "regular"),
    color: colors.label,
  },

  buttonContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: colors.background2,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  secondaryButtonSpacing: { marginTop: 12 },
  topBarWrapper: {
    backgroundColor: colors.background2,
    borderBottomWidth: 1,
    borderBottomColor: colors.inputBorder,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  backButton: { padding: 4 },
  backButtonBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  topBarTitle: {
    ...getTypographyStyle("t3Title"),
    color: colors.textPrimary,
    textAlign: "center",
  },
});
