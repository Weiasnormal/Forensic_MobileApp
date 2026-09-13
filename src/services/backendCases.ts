import { API_ENDPOINTS, buildApiUrl, API_KEY } from '@/constants/api';
import { getAuthHeader, handleUnauthorizedResponse } from '@/store/authStore';

import type {
  AnalysisPriority,
  AnalysisType,
  CaseStatus,
  CaseWorkflowStatus,
  SavedCase,
} from '@/store/caseStore';

type BackendCaseRecord = {
  id?: string;
  caseCode?: string;
  subjectName?: string;
  examiner?: string;
  documentType?: string;
  DocumentType?: string;
  priority?: AnalysisPriority;
  createdAt?: string;
  caseStatus?: unknown;
  analysisType?: AnalysisType;
  isDeleted?: boolean;
  mlResponse?: unknown;
  finalVerdict?: unknown;
};

const DEFAULT_DOCUMENT_TYPE = 'Bank cheque';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeWorkflowStatus(value: unknown): CaseWorkflowStatus {
  if (value === 0 || value === '0') {
    return 'Processing';
  }

  if (value === 1 || value === '1') {
    return 'PendingReview';
  }

  if (value === 2 || value === '2') {
    return 'Reviewed';
  }

  if (value === 'Processing' || value === 'PendingReview' || value === 'Reviewed') {
    return value;
  }

  return 'Processing';
}

function normalizeVerdict(record: BackendCaseRecord): CaseStatus {
  const mlResponse = isRecord(record.mlResponse) ? record.mlResponse : null;
  const rawVerdict = mlResponse?.verdict ?? mlResponse?.Verdict;
  const finalVerdict = record.finalVerdict;

  // A supervisor's final verdict is the only value allowed to override the ML verdict.
  if (finalVerdict === 2 || finalVerdict === '2' || finalVerdict === 'Forged') {
    return 'Suspected';
  }

  if (finalVerdict === 1 || finalVerdict === '1' || finalVerdict === 'Genuine') {
    return 'Genuine';
  }

  if (rawVerdict === 'FORGED' || rawVerdict === 'Forged') return 'Suspected';
  if (rawVerdict === 'GENUINE' || rawVerdict === 'Genuine') return 'Genuine';

  return 'Processing';
}

function normalizeAnalysisType(value: unknown): AnalysisType {
  if (value === 0 || value === '0') {
    return 'SIG';
  }

  if (value === 1 || value === '1') {
    return 'HW';
  }

  if (value === 2 || value === '2') {
    return 'DOC';
  }

  if (value === 'SIG' || value === 'HW' || value === 'DOC') {
    return value;
  }

  return 'SIG';
}

function normalizePriority(value: unknown): AnalysisPriority {
  if (value === 0 || value === '0') {
    return 'Low';
  }

  if (value === 1 || value === '1') {
    return 'Medium';
  }

  if (value === 2 || value === '2') {
    return 'High';
  }

  if (value === 3 || value === '3') {
    return 'Urgent';
  }

  if (value === 'Low' || value === 'Medium' || value === 'High' || value === 'Urgent') {
    return value;
  }

  return 'Medium';
}

function normalizeCaseRecord(record: BackendCaseRecord): SavedCase | null {
  const caseId = record.id?.trim();
  const caseCode = record.caseCode?.trim();
  const documentType = (record.documentType ?? record.DocumentType)?.trim();

  if (!caseId || !record.createdAt) {
    return null;
  }

  const workflowStatus = normalizeWorkflowStatus(record.caseStatus);

  return {
    caseId,
    caseCode: caseCode || caseId,
    subjectName: record.subjectName?.trim() || 'No Subject',
    examiner: record.examiner?.trim() || 'Unknown',
    documentType: documentType || DEFAULT_DOCUMENT_TYPE,
    priority: normalizePriority(record.priority),
    uploads: {
      references: [null, null, null, null],
      suspect: null,
    },
    createdAt: record.createdAt,
    status: workflowStatus === 'Processing' ? 'Processing' : normalizeVerdict(record),
    workflowStatus,
    analysisType: normalizeAnalysisType(record.analysisType),
    resultViewed: workflowStatus !== 'Processing' ? false : undefined,
  };
}

export async function fetchBackendCases() {
  const response = await fetch(
    buildApiUrl(`${API_ENDPOINTS.cases.list}?page=1&pageSize=200`), 
    {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'X-Api-Key': API_KEY || '',
      ...getAuthHeader(),
    },
  });

  if (!response.ok) {
    if (await handleUnauthorizedResponse(response)) {
      throw new Error('Session expired. Please sign in again.');
    }
    throw new Error(`Unable to load cases from backend (${response.status})`);
  }

  const rawText = await response.text();

  if (!rawText.trim()) {
    return [] as SavedCase[];
  }

  let payload: unknown;

  try {
    payload = JSON.parse(rawText) as unknown;
  } catch {
    return [] as SavedCase[];
  }

  const records: BackendCaseRecord[] = Array.isArray(payload)
    ? (payload as BackendCaseRecord[])
    : isRecord(payload) && Array.isArray(payload.cases)
      ? (payload.cases as BackendCaseRecord[])
      : [];

  return records.map(normalizeCaseRecord).filter((item): item is SavedCase => Boolean(item));
}