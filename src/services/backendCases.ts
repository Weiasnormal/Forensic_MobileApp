import { API_ENDPOINTS, buildApiUrl } from '@/constants/api';

import type { AnalysisPriority, AnalysisType, CaseStatus, SavedCase } from '@/store/caseStore';

type BackendCaseRecord = {
  id?: string;
  caseCode?: string;
  subjectName?: string;
  examiner?: string;
  priority?: AnalysisPriority;
  createdAt?: string;
  caseStatus?: CaseStatus;
  analysisType?: AnalysisType;
  isDeleted?: boolean;
};

const DEFAULT_DOCUMENT_TYPE = 'Bank cheque';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeCaseStatus(value: unknown): CaseStatus {
  if (value === 0 || value === '0') {
    return 'Processing';
  }

  if (value === 1 || value === '1') {
    return 'Genuine';
  }

  if (value === 2 || value === '2') {
    return 'Suspected';
  }

  if (value === 3 || value === '3') {
    return 'Genuine';
  }

  if (value === 'Processing' || value === 'Genuine' || value === 'Suspected' || value === 'Genuine') {
    return value as CaseStatus;
  }

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

  if (!caseId || !record.createdAt) {
    return null;
  }

  return {
    caseId,
    caseCode: caseCode || caseId,
    subjectName: record.subjectName?.trim() || 'No Subject',
    examiner: record.examiner?.trim() || 'Unknown',
    documentType: DEFAULT_DOCUMENT_TYPE,
    priority: normalizePriority(record.priority),
    uploads: {
      references: [null, null, null, null],
      suspect: null,
    },
    createdAt: record.createdAt,
    status: normalizeCaseStatus(record.caseStatus),
    analysisType: normalizeAnalysisType(record.analysisType),
    resultViewed: normalizeCaseStatus(record.caseStatus) !== 'Processing' ? false : undefined,
  };
}

export async function fetchBackendCases() {
  const response = await fetch(buildApiUrl(API_ENDPOINTS.cases.list), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
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