import { API_ENDPOINTS, API_KEY, buildApiUrl } from "@/constants/api";
import { getAuthHeader, handleUnauthorizedResponse } from "@/store/authStore";

import type {
  AnalysisPriority,
  AnalysisType,
  CaseStatus,
  CaseWorkflowStatus,
  DocumentType,
  SavedCase,
} from "@/store/caseStore";

type BackendCaseRecord = {
  id?: string;
  caseCode?: string;
  subjectName?: string;
  createdByUser?: unknown;
  CreatedByUser?: unknown;
  documentType?: unknown;
  DocumentType?: unknown;
  optionalDocumentType?: string;
  OptionalDocumentType?: string;
  priority?: AnalysisPriority;
  createdAt?: string;
  caseStatus?: unknown;
  analysisType?: AnalysisType;
  isDeleted?: boolean;
  mlResponse?: unknown;
  finalVerdict?: unknown;
};

const DEFAULT_DOCUMENT_TYPE = "Bank cheque";
export const CASES_PAGE_SIZE = 5;

export interface FetchCasesOptions {
  page?: number;
  pageSize?: number;
  status?: string | null;
  priority?: string | null;
  type?: string | null;
}

export interface FetchCasesResult {
  cases: SavedCase[];
  totalCount: number;
  page: number;
  pageSize: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeCreatedByUser(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (!isRecord(value)) return "Unknown";

  const displayName =
    value.name ??
    value.fullName ??
    value.userName ??
    value.username ??
    value.email;
  return typeof displayName === "string" && displayName.trim()
    ? displayName.trim()
    : "Unknown";
}

function normalizeWorkflowStatus(value: unknown): CaseWorkflowStatus {
  if (value === 0 || value === "0") {
    return "Processing";
  }

  if (value === 1 || value === "1") {
    return "PendingReview";
  }

  if (value === 2 || value === "2") {
    return "Reviewed";
  }

  if (
    value === "Processing" ||
    value === "PendingReview" ||
    value === "Reviewed"
  ) {
    return value;
  }

  return "Processing";
}

function normalizeVerdict(record: BackendCaseRecord): CaseStatus {
  const mlResponse = isRecord(record.mlResponse) ? record.mlResponse : null;
  const rawVerdict = mlResponse?.verdict ?? mlResponse?.Verdict;
  const finalVerdict = record.finalVerdict;

  // A supervisor's final verdict is the only value allowed to override the ML verdict.
  if (finalVerdict === 2 || finalVerdict === "2" || finalVerdict === "Forged") {
    return "Suspected";
  }

  if (
    finalVerdict === 1 ||
    finalVerdict === "1" ||
    finalVerdict === "Genuine"
  ) {
    return "Genuine";
  }

  if (rawVerdict === "FORGED" || rawVerdict === "Forged") return "Suspected";
  if (rawVerdict === "GENUINE" || rawVerdict === "Genuine") return "Genuine";

  return "Processing";
}

function normalizeAnalysisType(value: unknown): AnalysisType {
  return value === "HW" ? "HW" : value === "DOC" ? "DOC" : "SIG";
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
  if (value === 0 || value === "0") {
    return "Low";
  }

  if (value === 1 || value === "1") {
    return "Medium";
  }

  if (value === 2 || value === "2") {
    return "High";
  }

  if (value === 3 || value === "3") {
    return "Urgent";
  }

  if (
    value === "Low" ||
    value === "Medium" ||
    value === "High" ||
    value === "Urgent"
  ) {
    return value;
  }

  return "Medium";
}

function normalizeCaseRecord(record: BackendCaseRecord): SavedCase | null {
  const caseId = record.id?.trim();
  const caseCode = record.caseCode?.trim();
  const documentType = normalizeDocumentType(
    record.documentType ?? record.DocumentType ?? record.analysisType,
  );
  const otherDocumentType = (
    record.optionalDocumentType ??
    record.OptionalDocumentType ??
    ""
  ).trim();

  if (!caseId || !record.createdAt) {
    return null;
  }

  const workflowStatus = normalizeWorkflowStatus(record.caseStatus);
  const mlResponse = isRecord(record.mlResponse) ? record.mlResponse : null;
  const rawConfidence =
    mlResponse?.confidence ??
    mlResponse?.Confidence ??
    Math.max(
      Number(
        mlResponse?.confidenceGenuine ?? mlResponse?.ConfidenceGenuine ?? 0,
      ),
      Number(mlResponse?.confidenceForged ?? mlResponse?.ConfidenceForged ?? 0),
    );
  const confidence = Number(rawConfidence);
  const rawVerdict = mlResponse?.verdict ?? mlResponse?.Verdict;

  return {
    caseId,
    caseCode: caseCode || caseId,
    subjectName: record.subjectName?.trim() || "No Subject",
    examiner: normalizeCreatedByUser(
      record.createdByUser ?? record.CreatedByUser,
    ),
    documentType: documentType || DEFAULT_DOCUMENT_TYPE,
    otherDocumentType,
    priority: normalizePriority(record.priority),
    uploads: {
      references: [null, null, null, null],
      suspect: null,
    },
    createdAt: record.createdAt,
    status:
      workflowStatus === "Processing" ? "Processing" : normalizeVerdict(record),
    workflowStatus,
    analysisType: normalizeAnalysisType(record.analysisType),
    verdict: typeof rawVerdict === "string" ? rawVerdict : undefined,
    confidence: Number.isFinite(confidence) ? confidence : undefined,
    resultViewed: workflowStatus !== "Processing" ? false : undefined,
  };
}

export async function fetchBackendCases({
  page = 1,
  pageSize = CASES_PAGE_SIZE,
  status,
  priority,
  type,
}: FetchCasesOptions = {}): Promise<FetchCasesResult> {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (status) query.set("status", status);
  if (priority) query.set("priority", priority);
  if (type) query.set("type", type);

  const response = await fetch(
    buildApiUrl(`${API_ENDPOINTS.cases.list}?${query.toString()}`),
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-Api-Key": API_KEY || "",
        ...getAuthHeader(),
      },
    },
  );

  if (!response.ok) {
    if (await handleUnauthorizedResponse(response)) {
      throw new Error("Session expired. Please sign in again.");
    }
    throw new Error(`Unable to load cases from backend (${response.status})`);
  }

  const rawText = await response.text();

  if (!rawText.trim()) {
    return { cases: [], totalCount: 0, page, pageSize };
  }

  let payload: unknown;

  try {
    payload = JSON.parse(rawText) as unknown;
  } catch {
    return { cases: [], totalCount: 0, page, pageSize };
  }

  const responseObject = isRecord(payload) ? payload : null;
  const rawCases = Array.isArray(payload)
    ? payload
    : (responseObject?.cases ?? responseObject?.Cases);
  const records: BackendCaseRecord[] = Array.isArray(rawCases)
    ? (rawCases as BackendCaseRecord[])
    : [];
  const rawTotalCount =
    responseObject?.totalCount ?? responseObject?.TotalCount;
  const totalCount =
    typeof rawTotalCount === "number" ? rawTotalCount : records.length;

  return {
    cases: records
      .map(normalizeCaseRecord)
      .filter((item): item is SavedCase => Boolean(item)),
    totalCount,
    page,
    pageSize,
  };
}
