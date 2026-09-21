import { API_ENDPOINTS, API_KEY, buildApiUrl } from "@/constants/api";
import {
  getAuthHeader,
  handleUnauthorizedResponse,
  useAuthStore,
} from "@/store/authStore";
import type { AnalysisPriority, DocumentType } from "@/store/caseStore";
import { getServerErrorMessage } from "@/utils/networkError";

/** Mirrors Avera.Domain/Cases/FinalVerdict.cs — do not reorder, values match backend exactly. */
export enum FinalVerdict {
  None = 0,
  Genuine = 1,
  Forged = 2,
}

/**
 * Mirrors Avera.Domain/Cases/Status.cs.
 * NOTE: this is the case's WORKFLOW state (has it been reviewed?), NOT the
 * ML/verdict outcome. Don't confuse this with the local caseStore.ts
 * `CaseStatus` type ('Processing' | 'Genuine' | 'Suspected'), which predates
 * this backend contract and still conflates the two. The actual verdict now
 * lives in FinalVerdict / MLResponse.Verdict below.
 */
export type CaseWorkflowStatus = "Processing" | "PendingReview" | "Reviewed";

/** Mirrors Avera.Application/Cases/MLResponseDto.cs */
export interface MLResponseDto {
  confidenceForged: number;
  confidenceGenuine: number;
  distance: number;
  gradCamResults: GradCamDto[];
  threshold: number;
  /** Raw ML service verdict string, e.g. "GENUINE" | "FORGED". */
  verdict: string;
}

export interface GradCamDto {
  slot: string;
  variant: string;
  imageId: string;
}

function normalizeOverlaySlot(value: unknown): string {
  if (value === 0 || value === "0") return "Reference1";
  if (value === 1 || value === "1") return "Reference2";
  if (value === 2 || value === "2") return "Reference3";
  if (value === 3 || value === "3") return "Reference4";
  if (value === 4 || value === "4") return "Suspected";

  const normalized = String(value ?? "")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();

  if (normalized === "suspect" || normalized === "suspected") {
    return "Suspected";
  }

  const referenceMatch = normalized.match(/^reference([1-4])$/);
  return referenceMatch ? `Reference${referenceMatch[1]}` : "";
}

function normalizeOverlayVariant(value: unknown): string {
  if (value === 0 || value === "0") return "Original";
  if (value === 1 || value === "1") return "Heatmap";
  if (value === 2 || value === "2") return "Overlay";
  if (value === 3 || value === "3") return "BoundingBox";
  if (value === 4 || value === "4") return "StrokeDiff";

  const normalized = String(value ?? "")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();

  if (normalized === "original") return "Original";
  if (normalized === "heatmap") return "Heatmap";
  if (normalized === "overlay") return "Overlay";
  if (normalized === "boundingbox") return "BoundingBox";
  if (normalized === "strokediff" || normalized === "strokedifference") {
    return "StrokeDiff";
  }
  return "";
}

function normalizeBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.trim().toLowerCase() === "true";
  return Boolean(value);
}

function parseGradCamResults(raw: unknown): GradCamDto[] {
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((item: any) => {
    const imageId = String(
      item?.imageId ??
        item?.ImageId ??
        item?.image_id ??
        item?.blobId ??
        item?.BlobId ??
        item?.id ??
        item?.Id ??
        "",
    ).trim();
    const slot = normalizeOverlaySlot(
      item?.slot ?? item?.Slot ?? item?.overlaySlot ?? item?.OverlaySlot,
    );
    const variant = normalizeOverlayVariant(
      item?.variant ??
        item?.Variant ??
        item?.overlayVariant ??
        item?.OverlayVariant,
    );

    return imageId && slot && variant ? [{ imageId, slot, variant }] : [];
  });
}

/** Mirrors Avera.Application/Cases/CaseDto.cs */
export interface AdminCaseDetail {
  id: string;
  caseCode: string;
  subjectName: string;
  ownerUserId: string | null;
  examiner: string;
  priority: AnalysisPriority;
  createdAt: string;
  caseStatus: CaseWorkflowStatus;
  documentType: DocumentType;
  otherDocumentType: string;
  isDeleted: boolean;
  mlResponse: MLResponseDto | null;
  reviewedByUserId: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  finalVerdict: FinalVerdict | null;
  isPdfExportAllowed: boolean;
  isFlaggedForInternalReview: boolean;
}

export class CaseReviewApiError extends Error {
  constructor(
    public status: number,
    public code: string | undefined,
    message: string,
  ) {
    super(message);
  }
}

function headers() {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Api-Key": API_KEY || "",
    ...getAuthHeader(),
  };
}

async function parseProblem(res: Response) {
  try {
    const json = await res.json();
    return {
      code: json?.title as string | undefined,
      message: getServerErrorMessage(res.status, json?.detail || json?.title),
    };
  } catch {
    return { code: undefined, message: getServerErrorMessage(res.status) };
  }
}

// --- Normalizers: tolerate the response coming back as either the enum's
// numeric value or its string name, since we can't be 100% sure how
// System.Text.Json is configured for every field on this DTO. ---

function normalizeWorkflowStatus(value: unknown): CaseWorkflowStatus {
  if (value === 0 || value === "0" || value === "Processing")
    return "Processing";
  if (value === 1 || value === "1" || value === "PendingReview")
    return "PendingReview";
  if (value === 2 || value === "2" || value === "Reviewed") return "Reviewed";
  return "Processing";
}

function normalizeFinalVerdict(value: unknown): FinalVerdict | null {
  if (value === null || value === undefined) return null;
  if (value === 0 || value === "0" || value === "None")
    return FinalVerdict.None;
  if (value === 1 || value === "1" || value === "Genuine")
    return FinalVerdict.Genuine;
  if (value === 2 || value === "2" || value === "Forged")
    return FinalVerdict.Forged;
  return null;
}

function normalizeDocumentType(value: unknown): DocumentType {
  if (
    value === 0 ||
    value === "0" ||
    value === "BankCheque" ||
    value === "Bank cheque"
  )
    return "Bank cheque";
  if (
    value === 1 ||
    value === "1" ||
    value === "PropertyDeed" ||
    value === "Property deed"
  )
    return "Property deed";
  if (
    value === 2 ||
    value === "2" ||
    value === "LastWill" ||
    value === "Last will"
  )
    return "Last will";
  if (value === 3 || value === "3" || value === "Contract") return "Contract";
  if (value === 4 || value === "4" || value === "Affidavit") return "Affidavit";
  return "Other";
}

function normalizePriority(value: unknown): AnalysisPriority {
  if (value === 1 || value === "1" || value === "Medium") return "Medium";
  if (value === 2 || value === "2" || value === "High") return "High";
  if (value === 3 || value === "3" || value === "Urgent") return "Urgent";
  return "Low";
}

function normalizeCreatedByUser(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object") return "Unknown";

  const user = value as Record<string, unknown>;
  const displayName =
    user.name ?? user.fullName ?? user.userName ?? user.username ?? user.email;
  return typeof displayName === "string" && displayName.trim()
    ? displayName.trim()
    : "Unknown";
}

function normalizeCaseDetail(raw: any): AdminCaseDetail {
  const rootGradCamResults =
    raw?.gradCamResults ??
    raw?.GradCamResults ??
    raw?.gradcamImages ??
    raw?.GradcamImages;
  const mlRaw =
    raw?.mlResponse ??
    raw?.MLResponse ??
    raw?.ml_response ??
    (Array.isArray(rootGradCamResults) ? raw : null);

  return {
    id: String(raw?.id ?? raw?.Id ?? ""),
    caseCode: raw?.caseCode ?? raw?.CaseCode ?? "",
    subjectName: raw?.subjectName ?? raw?.SubjectName ?? "",
    ownerUserId: raw?.createdByUserId ?? raw?.CreatedByUserId ?? null,
    examiner: normalizeCreatedByUser(
      raw?.createdByUser ??
        raw?.CreatedByUser ??
        raw?.examiner ??
        raw?.Examiner ??
        raw?.createdByUserName ??
        raw?.CreatedByUserName,
    ),
    priority: normalizePriority(raw?.priority ?? raw?.Priority),
    createdAt: raw?.createdAt ?? raw?.CreatedAt ?? "",
    caseStatus: normalizeWorkflowStatus(raw?.caseStatus ?? raw?.CaseStatus),
    documentType: normalizeDocumentType(
      raw?.documentType ??
        raw?.DocumentType ??
        raw?.analysisType ??
        raw?.AnalysisType,
    ),
    otherDocumentType: String(
      raw?.optionalDocumentType ?? raw?.OptionalDocumentType ?? "",
    ),
    isDeleted: Boolean(raw?.isDeleted ?? raw?.IsDeleted),
    mlResponse: mlRaw
      ? {
          confidenceForged: Number(
            mlRaw.confidenceForged ??
              mlRaw.ConfidenceForged ??
              mlRaw.confidence_forged ??
              0,
          ),
          confidenceGenuine: Number(
            mlRaw.confidenceGenuine ??
              mlRaw.ConfidenceGenuine ??
              mlRaw.confidence_genuine ??
              0,
          ),
          distance: Number(
            mlRaw.distance ?? mlRaw.Distance ?? mlRaw.distance_metric ?? 0,
          ),
          gradCamResults: parseGradCamResults(
            mlRaw.gradCamResults ??
              mlRaw.GradCamResults ??
              mlRaw.gradcamResults ??
              mlRaw.gradcamImages ??
              mlRaw.GradcamImages ??
              mlRaw.gradcam_images ??
              raw?.gradCamResults ??
              raw?.GradCamResults ??
              raw?.gradcamImages ??
              raw?.GradcamImages,
          ),
          threshold: Number(
            mlRaw.threshold ?? mlRaw.Threshold ?? mlRaw.threshold_value ?? 0,
          ),
          verdict: String(
            mlRaw.verdict ?? mlRaw.Verdict ?? mlRaw.verdict_label ?? "",
          ),
        }
      : null,
    reviewedByUserId: raw?.reviewedByUserId ?? raw?.ReviewedByUserId ?? null,
    reviewedAt: raw?.reviewedAt ?? raw?.ReviewedAt ?? null,
    reviewNote: raw?.reviewNote ?? raw?.ReviewNote ?? null,
    finalVerdict: normalizeFinalVerdict(raw?.finalVerdict ?? raw?.FinalVerdict),
    isPdfExportAllowed: normalizeBoolean(
      raw?.isPdfExportAllowed ?? raw?.IsPdfExportAllowed,
    ),
    isFlaggedForInternalReview: normalizeBoolean(
      raw?.isFlaggedForInternalReview ?? raw?.IsFlaggedForInternalReview,
    ),
  };
}

/** GET /cases/{id} — Avera.WebApi/Endpoints/Cases/GetById.cs */
export async function fetchCaseForReview(
  caseId: string,
): Promise<AdminCaseDetail> {
  const res = await fetch(buildApiUrl(API_ENDPOINTS.cases.get(caseId)), {
    method: "GET",
    headers: headers(),
  });

  if (!res.ok) {
    if (await handleUnauthorizedResponse(res)) {
      throw new CaseReviewApiError(
        res.status,
        "Unauthorized",
        "Session expired. Please sign in again.",
      );
    }
    const { code, message } = await parseProblem(res);
    throw new CaseReviewApiError(res.status, code, message);
  }

  const json = await res.json();
  // GetCaseByIdQueryResult wraps the DTO: { case: {...} } (camelCase) or { Case: {...} }.
  const dto = json?.case ?? json?.Case ?? json;
  const currentTenantId = useAuthStore.getState().user?.tenantId?.trim();
  const caseTenantId =
    dto?.tenantId ??
    dto?.TenantId ??
    dto?.organizationId ??
    dto?.OrganizationId;
  if (
    currentTenantId &&
    caseTenantId &&
    String(caseTenantId).trim() !== currentTenantId
  ) {
    throw new CaseReviewApiError(
      403,
      "WrongTenant",
      "This case is outside your organization.",
    );
  }
  return normalizeCaseDetail(dto);
}

export interface SubmitReviewPayload {
  finalVerdict: FinalVerdict;
  reviewNote: string | null;
  isPdfExportAllowed: boolean;
}

/**
 * POST /cases/{id}/review — Avera.WebApi/Endpoints/Cases/Review.cs (Admin only).
 * Backend rejects with 409 (CaseErrors.CaseAlreadyReviewed) if the case's
 * FinalVerdict is already set — review is one-shot, not editable after save.
 */
export async function submitCaseReview(
  caseId: string,
  payload: SubmitReviewPayload,
): Promise<void> {
  const res = await fetch(buildApiUrl(API_ENDPOINTS.cases.review(caseId)), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      finalVerdict: payload.finalVerdict,
      reviewNote: payload.reviewNote,
      isPdfExportAllowed: payload.isPdfExportAllowed,
    }),
  });

  if (!res.ok && res.status !== 204) {
    if (await handleUnauthorizedResponse(res)) {
      throw new CaseReviewApiError(
        res.status,
        "Unauthorized",
        "Session expired. Please sign in again.",
      );
    }
    const { code, message } = await parseProblem(res);
    throw new CaseReviewApiError(res.status, code, message);
  }
}

/** POST /cases/{id}/flag — Avera.WebApi/Endpoints/Cases/ToggleFlag.cs (Admin only). */
export async function toggleCaseInternalReviewFlag(
  caseId: string,
  isFlagged: boolean,
): Promise<void> {
  const res = await fetch(
    buildApiUrl(API_ENDPOINTS.cases.toggleInternalReviewFlag(caseId)),
    {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ isFlagged }),
    },
  );

  if (!res.ok && res.status !== 204) {
    if (await handleUnauthorizedResponse(res)) {
      throw new CaseReviewApiError(
        res.status,
        "Unauthorized",
        "Session expired. Please sign in again.",
      );
    }
    const { code, message } = await parseProblem(res);
    throw new CaseReviewApiError(res.status, code, message);
  }
}
