import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { fetchBackendCases } from '@/services/backendCases';
import { API_ENDPOINTS, buildApiUrl } from '@/constants/api';
import {
    createMockSignatureAnalysisResult,
    getSignatureAnalysisCaseStatus,
    type MockSignatureAnalysisResult,
} from '@/services/mockSignatureAnalysis';

const caseLog = {
  info: (tag: string, message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${tag} | ${message}`, data ? data : '');
  },
  error: (tag: string, message: string, error?: any) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ${tag} | ❌ ${message}`, error ? { error: error.message, stack: error.stack } : '');
  },
  warn: (tag: string, message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] ${tag} | ⚠️  ${message}`, data ? data : '');
  },
};

export type AnalysisPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type AnalysisType = 'SIG' | 'HW' | 'DOC';
export type CaseStatus = 'Processing' | 'Genuine' | 'Suspected';
export type DraftUploadType = 'reference' | 'suspect';
export type PendingCardStatus = 'draft' | 'processing' | 'result-ready';

const DEFAULT_ANALYSIS_TYPE: AnalysisType = 'SIG';

export interface DraftUploads {
  references: Array<string | null>;
  suspect: string | null;
}

export interface DraftCase {
  caseId: string;
  subjectName: string;
  examiner: string;
  documentType: string;
  priority: AnalysisPriority;
  mockTemplateNumber?: number;
  uploads: DraftUploads;
}

export interface SavedCase extends DraftCase {
  createdAt: string;
  status: CaseStatus;
  analysisType: AnalysisType;
  resultViewed?: boolean;
}

type DraftEditableField = 'subjectName' | 'examiner' | 'documentType' | 'priority';

interface CaseStore {
  cases: SavedCase[];
  draftSignatureCase: DraftCase;
  isSubmitting: boolean;
  nextCaseNumber: number;
  nextMockTemplateNumber: number;
  activeSignatureCaseId: string | null;
  hiddenSavedCases: SavedCase[] | null;
  signatureAnalysisResults: Record<string, MockSignatureAnalysisResult>;
  markCaseResultViewed: (caseId: string) => void;
  updateCaseStatus: (caseId: string, status: CaseStatus) => void;
  setSignatureAnalysisResult: (caseId: string, result: MockSignatureAnalysisResult) => void;
  setActiveSignatureCaseId: (caseId: string | null) => void;
  refreshCasesFromBackend: () => Promise<boolean>;
  stashSavedCases: () => void;
  restoreSavedCases: () => void;
  startNewSignatureDraft: () => void;
  discardSignatureDraft: () => void;
  updateDraftCase: <K extends DraftEditableField>(field: K, value: DraftCase[K]) => void;
  setDraftUpload: (type: DraftUploadType, index: number, uri: string | null) => void;
  submitNewCase: () => Promise<SavedCase>;
  resetMockDatabase: () => void;
}

const DEFAULT_DOCUMENT_TYPE = 'Bank cheque';
const DEFAULT_PRIORITY: AnalysisPriority = 'Medium';
const STORAGE_KEY = 'avera_mock_case_store';

function buildCaseId(sequence: number) {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const year = now.getFullYear();
  const counter = String(sequence).padStart(3, '0');
  return `${month}-${day}-${year}-${counter}`;
}

function createDraftCase(caseId: string): DraftCase {
  return {
    caseId,
    subjectName: '',
    examiner: '',
    documentType: DEFAULT_DOCUMENT_TYPE,
    priority: DEFAULT_PRIORITY,
    mockTemplateNumber: undefined,
    uploads: {
      references: [null, null, null, null],
      suspect: null,
    },
  };
}

function createSavedCase(seed: Omit<SavedCase, 'uploads'> & { uploads?: DraftUploads }): SavedCase {
  return {
    ...createDraftCase(seed.caseId),
    ...seed,
    uploads: seed.uploads ?? createDraftCase(seed.caseId).uploads,
  };
}

function getNextCaseNumberFromCases(cases: SavedCase[]) {
  const highestSequence = cases.reduce((highest, item) => {
    const match = item.caseId.match(/-(\d{3})$/);

    if (!match) {
      return highest;
    }

    return Math.max(highest, Number(match[1]));
  }, 0);

  return highestSequence + 1;
}

function mergeCasesById(existingCases: SavedCase[], incomingCases: SavedCase[]) {
  const mergedCases = new Map<string, SavedCase>();

  existingCases.forEach((item) => {
    mergedCases.set(item.caseId, item);
  });

  incomingCases.forEach((item) => {
    mergedCases.set(item.caseId, item);
  });

  return Array.from(mergedCases.values());
}

const INITIAL_CASES: SavedCase[] = [
  createSavedCase({
    caseId: '04-27-2026-001',
    mockTemplateNumber: 4,
    subjectName: 'Juan dela Cruz',
    examiner: 'Ana Rivera',
    documentType: 'Bank cheque',
    priority: 'High',
    createdAt: '2026-04-27T09:30:00.000Z',
    status: 'Genuine',
    analysisType: 'SIG',
  }),
  createSavedCase({
    caseId: '04-28-2026-002',
    mockTemplateNumber: 5,
    subjectName: 'Maria Santos',
    examiner: 'Ana Rivera',
    documentType: 'Legal contract',
    priority: 'Urgent',
    createdAt: '2026-04-28T13:15:00.000Z',
    status: 'Suspected',
    analysisType: 'SIG',
  }),
  createSavedCase({
    caseId: '04-29-2026-003',
    mockTemplateNumber: 6,
    subjectName: 'Pedro Reyes',
    examiner: 'Ana Rivera',
    documentType: 'Government form',
    priority: 'Medium',
    createdAt: '2026-04-29T17:45:00.000Z',
    status: 'Processing',
    analysisType: 'SIG',
    resultViewed: false,
  }),
  createSavedCase({
    caseId: '04-30-2026-004',
    mockTemplateNumber: 7,
    subjectName: 'Elena Garcia',
    examiner: 'Ana Rivera',
    documentType: 'Passport copy',
    priority: 'Low',
    createdAt: '2026-04-30T08:20:00.000Z',
    status: 'Genuine',
    analysisType: 'SIG',
    resultViewed: false,
  }),
  createSavedCase({
    caseId: '05-01-2026-005',
    mockTemplateNumber: 8,
    subjectName: 'Ricardo Mendez',
    examiner: 'Ana Rivera',
    documentType: 'Employment record',
    priority: 'High',
    createdAt: '2026-05-01T11:05:00.000Z',
    status: 'Genuine',
    analysisType: 'SIG',
  }),
];

const INITIAL_CASE_SEQUENCE = getNextCaseNumberFromCases(INITIAL_CASES);

function createInitialDraft(nextCaseNumber: number) {
  return createDraftCase(buildCaseId(nextCaseNumber));
}

function createMockError(message: string) {
  caseLog.error('CaseStore:Error', message);
  return new Error(message);
}

export const useCaseStore = create<CaseStore>()(
  persist(
    (set, get) => {
      caseLog.info('CaseStore', '🚀 Store initializing');
      
      return {
        cases: INITIAL_CASES,
        draftSignatureCase: createInitialDraft(INITIAL_CASE_SEQUENCE),
        isSubmitting: false,
        nextCaseNumber: INITIAL_CASE_SEQUENCE + 1,
        nextMockTemplateNumber: 1,
        activeSignatureCaseId: null,
        hiddenSavedCases: null,
        signatureAnalysisResults: {},

        markCaseResultViewed: (caseId) => {
          set((state) => ({
            cases: state.cases.map((item) =>
              item.caseId === caseId ? { ...item, resultViewed: true } : item,
            ),
          }));
        },

        updateCaseStatus: (caseId, status) => {
          caseLog.info('CaseStore:Action', `Updating case ${caseId} status to ${status}`);
          set((state) => ({
            cases: state.cases.map((item) =>
              item.caseId === caseId ? { ...item, status } : item,
            ),
          }));
        },

        setSignatureAnalysisResult: (caseId, result) => {
          caseLog.info('CaseStore:Result', 'Saving mock signature analysis result', { caseId, verdict: result.verdict });
          set((state) => ({
            signatureAnalysisResults: {
              ...state.signatureAnalysisResults,
              [caseId]: result,
            },
            cases: state.cases.map((item) =>
              item.caseId === caseId ? { ...item, status: getSignatureAnalysisCaseStatus(result) } : item,
            ),
          }));
        },

        setActiveSignatureCaseId: (caseId) => {
          caseLog.info('CaseStore:Action', `Setting active signature case id: ${caseId}`);
          set({ activeSignatureCaseId: caseId });
        },

        refreshCasesFromBackend: async () => {
          caseLog.info('CaseStore:Sync', 'Loading cases from backend');

          try {
            const backendCases = await fetchBackendCases();

            if (backendCases.length === 0) {
              caseLog.warn('CaseStore:Sync', 'Backend returned no case records');
              return false;
            }

            set((state) => {
              const mergedCases = mergeCasesById(state.cases, backendCases);

              return {
                cases: mergedCases,
                nextCaseNumber: Math.max(state.nextCaseNumber, getNextCaseNumberFromCases(mergedCases)),
              };
            });

            caseLog.info('CaseStore:Sync', '✓ Backend cases synced', { count: backendCases.length });
            return true;
          } catch (error) {
            caseLog.warn('CaseStore:Sync', 'Backend cases sync failed', error);
            return false;
          }
        },

        stashSavedCases: () => {
          caseLog.info('CaseStore:Action', 'Stashing saved cases (hide from UI)');
          set((state) => {
            if (!state.cases || state.cases.length === 0) return state;
            return {
              hiddenSavedCases: state.cases,
              cases: [],
            } as Partial<CaseStore> as CaseStore;
          });
        },

        restoreSavedCases: () => {
          caseLog.info('CaseStore:Action', 'Restoring stashed saved cases');
          set((state) => {
            if (!state.hiddenSavedCases || state.hiddenSavedCases.length === 0) return state;
            return {
              cases: state.hiddenSavedCases,
              hiddenSavedCases: null,
            } as Partial<CaseStore> as CaseStore;
          });
        },

        startNewSignatureDraft: () => {
          caseLog.info('CaseStore:Action', 'Starting new signature draft');
          set((state) => {
            const nextCaseNumber = state.nextCaseNumber;
            caseLog.info('CaseStore:Action', 'New draft created', { caseId: buildCaseId(nextCaseNumber) });

            return {
              draftSignatureCase: createInitialDraft(nextCaseNumber),
              nextCaseNumber: nextCaseNumber + 1,
            };
          });
        },

        discardSignatureDraft: () => {
          caseLog.info('CaseStore:Action', 'Discarding current signature draft');
          set((state) => ({
            draftSignatureCase: createDraftCase(state.draftSignatureCase.caseId),
          }));
        },

        updateDraftCase: (field, value) => {
          caseLog.info('CaseStore:Draft', `Updating draft field: ${field}`, { value });
          set((state) => ({
            draftSignatureCase: {
              ...state.draftSignatureCase,
              [field]: value,
            },
          }));
        },

        setDraftUpload: (type, index, uri) => {
          caseLog.info('CaseStore:Upload', 'Setting draft upload', { type, index, uri: uri?.substring(0, 50) });
          set((state) => {
            const nextUploads: DraftUploads = {
              ...state.draftSignatureCase.uploads,
              references: [...state.draftSignatureCase.uploads.references],
              suspect: state.draftSignatureCase.uploads.suspect,
            };

            if (type === 'reference') {
              if (index < 0 || index > 3) {
                caseLog.warn('CaseStore:Upload', 'Invalid reference index', { index });
                return state;
              }

              nextUploads.references[index] = uri;
            } else {
              nextUploads.suspect = uri;
            }

            return {
              draftSignatureCase: {
                ...state.draftSignatureCase,
                uploads: nextUploads,
              },
            };
          });
        },

        submitNewCase: async () => {
          const startTime = performance.now();
          caseLog.info('CaseStore:Submit', 'Submitting new case (networked)');

          const currentDraft = get().draftSignatureCase;

          if (!currentDraft.subjectName.trim() || !currentDraft.examiner.trim()) {
            throw createMockError('Subject name and examiner are required before submission.');
          }

          if (currentDraft.uploads.references.some((uri) => !uri) || !currentDraft.uploads.suspect) {
            throw createMockError('All reference uploads and the suspect upload must be completed before submission.');
          }

          set({ isSubmitting: true });

          // helper to generate a random GUID (v4)
          function generateGuid() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
              const r = (Math.random() * 16) | 0;
              const v = c === 'x' ? r : (r & 0x3) | 0x8;
              return v.toString(16);
            });
          }

          try {
            // Use a random GUID for Examiner (no auth available)
            const examinerGuid = generateGuid();

            const createRequest = {
              SubjectName: currentDraft.subjectName,
              Examiner: examinerGuid,
              Priority: currentDraft.priority,
              AnalysisType: DEFAULT_ANALYSIS_TYPE,
            } as any;

            caseLog.info('CaseStore:Submit', 'Creating case on backend', { SubjectName: createRequest.SubjectName });

            const createRes = await fetch(buildApiUrl(API_ENDPOINTS.cases.create), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
              body: JSON.stringify(createRequest),
            });

            if (!createRes.ok) {
              throw new Error(`Create case failed (${createRes.status})`);
            }

            // Try to read returned id from JSON body, otherwise from Location header
            let caseId: string | null = null;
            try {
              const json = await createRes.json();
              if (json && (json.id || json)) {
                caseId = (json.id ?? json).toString();
              }
            } catch (_) {
              // ignore
            }

            if (!caseId) {
              const loc = createRes.headers.get('Location') || createRes.headers.get('location');
              if (loc) {
                const parts = loc.split('/');
                caseId = parts[parts.length - 1];
              }
            }

            if (!caseId) {
              throw new Error('Unable to determine created case id from response');
            }

            caseLog.info('CaseStore:Submit', 'Uploading images for case', { caseId });

            // Upload reference images sequentially
            for (let i = 0; i < currentDraft.uploads.references.length; i++) {
              const uri = currentDraft.uploads.references[i];
              if (!uri) continue;

              const fd = new FormData();
              // @ts-ignore - React Native FormData file object
              fd.append('file', { uri, name: `reference-${i + 1}.jpg`, type: 'image/jpeg' } as any);
              fd.append('index', String(i));

              const uploadPath = buildApiUrl(API_ENDPOINTS.signatures.uploadReference(caseId));

              const upRes = await fetch(uploadPath, {
                method: 'POST',
                headers: {
                  Accept: 'application/json',
                },
                body: fd as any,
              });

              if (!upRes.ok) {
                throw new Error(`Reference upload failed (${upRes.status})`);
              }
            }

            // Upload suspected image
            if (currentDraft.uploads.suspect) {
              const fd = new FormData();
              // @ts-ignore
              fd.append('file', { uri: currentDraft.uploads.suspect, name: 'suspect.jpg', type: 'image/jpeg' } as any);
              fd.append('index', '0');

              const upPath = buildApiUrl(API_ENDPOINTS.signatures.uploadSuspected(caseId));
              const upRes = await fetch(upPath, {
                method: 'POST',
                headers: {
                  Accept: 'application/json',
                },
                body: fd as any,
              });

              if (!upRes.ok) {
                throw new Error(`Suspect upload failed (${upRes.status})`);
              }
            }

            caseLog.info('CaseStore:Submit', 'Triggering analysis', { caseId });
            await fetch(buildApiUrl(API_ENDPOINTS.analysis.start(caseId)), { method: 'GET' });

            caseLog.info('CaseStore:Submit', 'Fetching analysis results', { caseId });
            const resultsRes = await fetch(buildApiUrl(API_ENDPOINTS.analysis.getResults(caseId)), { method: 'GET' });
            let analysisResult: any = null;
            if (resultsRes.ok) {
              try { analysisResult = await resultsRes.json(); } catch (_) { analysisResult = null; }
            }

            // update local store with created case
            const savedCase: SavedCase = {
              ...currentDraft,
              createdAt: new Date().toISOString(),
              status: 'Processing',
              analysisType: DEFAULT_ANALYSIS_TYPE,
              resultViewed: false,
              mockTemplateNumber: get().nextMockTemplateNumber,
            };

            set((state) => {
              const nextCases: SavedCase[] = mergeCasesById([savedCase], state.cases);
              const nextCaseNumber = getNextCaseNumberFromCases(nextCases);

              return {
                cases: nextCases,
                draftSignatureCase: createInitialDraft(nextCaseNumber),
                nextCaseNumber,
                nextMockTemplateNumber: state.nextMockTemplateNumber + 1,
                activeSignatureCaseId: savedCase.caseId,
              };
            });

            caseLog.info('CaseStore:Submit', `✓ Case submitted successfully`, { caseId, analysisResult });

            return savedCase;
          } catch (e) {
            const error = e as Error;
            caseLog.error('CaseStore:Submit', 'Submission failed', error);
            throw e;
          } finally {
            set({ isSubmitting: false });
          }
        },

        resetMockDatabase: () => {
          caseLog.warn('CaseStore:Reset', 'Resetting mock database to initial state');
          set({
            cases: INITIAL_CASES,
            draftSignatureCase: createInitialDraft(INITIAL_CASE_SEQUENCE),
            isSubmitting: false,
            nextCaseNumber: INITIAL_CASE_SEQUENCE + 1,
            activeSignatureCaseId: null,
            signatureAnalysisResults: {},
          });
        },
      };
    },
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => {
        caseLog.info('CaseStore:Storage', 'Initializing AsyncStorage adapter');
        if (!AsyncStorage) {
          caseLog.error('CaseStore:Storage', 'AsyncStorage is null - native module not available');
        }
        return AsyncStorage;
      }),
      partialize: (state) => ({
        cases: state.cases,
        draftSignatureCase: state.draftSignatureCase,
        nextCaseNumber: state.nextCaseNumber,
        activeSignatureCaseId: state.activeSignatureCaseId,
        hiddenSavedCases: state.hiddenSavedCases,
        signatureAnalysisResults: state.signatureAnalysisResults,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<CaseStore> | undefined;

        if (!persisted?.cases) {
          return currentState;
        }

        const mergedCases = [
          ...INITIAL_CASES,
          ...persisted.cases.filter((item) => !INITIAL_CASES.some((seed) => seed.caseId === item.caseId)),
        ];

        return {
          ...currentState,
          ...persisted,
          cases: mergedCases,
          signatureAnalysisResults: persisted.signatureAnalysisResults ?? currentState.signatureAnalysisResults,
        };
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          caseLog.error('CaseStore:Rehydrate', 'Failed to rehydrate from storage', error);
        } else {
          caseLog.info('CaseStore:Rehydrate', '✓ Successfully rehydrated store from storage', { casesCount: state?.cases.length });
        }
      },
    },
  ),
);

export function hasCompleteUploads(uploads: DraftUploads) {
  return uploads.references.every(Boolean) && Boolean(uploads.suspect);
}

export function formatCaseDateLabel(createdAt: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(createdAt));
}

export function formatAnalysisTypeLabel(analysisType: AnalysisType) {
  if (analysisType === 'SIG') return 'Signature';
  if (analysisType === 'HW') return 'Handwriting';
  return 'Document';
}

export function getCaseSummary(cases: SavedCase[]) {
  const totalCases = cases.length;
  const genuineCount = cases.filter((item) => item.status === 'Genuine').length;
  const suspectCount = cases.filter((item) => item.status === 'Suspected').length;

  return {
    totalCases,
    genuineCount,
    suspectCount,
  };
}

export interface PendingCardEntry {
  id: string;
  name: string;
  status: PendingCardStatus;
  sortKey: number;
}

const MAX_PENDING_CARDS = 3;

function hasDraftProgress(draft: DraftCase) {
  return Boolean(
    draft.subjectName.trim() ||
      draft.examiner.trim() ||
      draft.documentType.trim() !== DEFAULT_DOCUMENT_TYPE ||
      draft.priority !== DEFAULT_PRIORITY ||
      draft.uploads.references.some(Boolean) ||
      draft.uploads.suspect,
  );
}

export function getPendingCards(cases: SavedCase[], draft: DraftCase): PendingCardEntry[] {
  const pendingCards: PendingCardEntry[] = [];

  if (hasDraftProgress(draft)) {
    pendingCards.push({
      id: draft.caseId,
      name: draft.subjectName.trim() || 'Draft in progress',
      status: 'draft',
      sortKey: Number.MAX_SAFE_INTEGER,
    });
  }

  cases.forEach((item) => {
    if (item.status === 'Processing') {
      pendingCards.push({
        id: item.caseId,
        name: item.subjectName,
        status: 'processing',
        sortKey: new Date(item.createdAt).getTime(),
      });
    }

    if (item.status !== 'Processing' && !item.resultViewed) {
      pendingCards.push({
        id: item.caseId,
        name: item.subjectName,
        status: 'result-ready',
        sortKey: new Date(item.createdAt).getTime(),
      });
    }
  });

  return pendingCards.sort((left, right) => right.sortKey - left.sortKey).slice(0, MAX_PENDING_CARDS);
}
