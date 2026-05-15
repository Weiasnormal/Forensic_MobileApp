import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Debug logger for case store
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
export type CaseStatus = 'Processing' | 'Completed' | 'Suspect' | 'Genuine';
export type DraftUploadType = 'reference' | 'suspect';
export type PendingCardStatus = 'draft' | 'processing' | 'result-ready';

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
  markCaseResultViewed: (caseId: string) => void;
  startNewSignatureDraft: () => void;
  updateDraftCase: <K extends DraftEditableField>(field: K, value: DraftCase[K]) => void;
  setDraftUpload: (type: DraftUploadType, index: number, uri: string | null) => void;
  submitNewCase: () => Promise<SavedCase>;
  resetMockDatabase: () => void;
}

const DEFAULT_DOCUMENT_TYPE = 'Bank cheque';
const DEFAULT_PRIORITY: AnalysisPriority = 'Medium';
const INITIAL_CASE_SEQUENCE = 4;
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

const INITIAL_CASES: SavedCase[] = [
  createSavedCase({
    caseId: '04-27-2026-001',
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
    subjectName: 'Maria Santos',
    examiner: 'Ana Rivera',
    documentType: 'Legal contract',
    priority: 'Urgent',
    createdAt: '2026-04-28T13:15:00.000Z',
    status: 'Suspect',
    analysisType: 'SIG',
  }),
  createSavedCase({
    caseId: '04-29-2026-003',
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
    subjectName: 'Elena Garcia',
    examiner: 'Ana Rivera',
    documentType: 'Passport copy',
    priority: 'Low',
    createdAt: '2026-04-30T08:20:00.000Z',
    status: 'Completed',
    analysisType: 'HW',
    resultViewed: false,
  }),
  createSavedCase({
    caseId: '05-01-2026-005',
    subjectName: 'Ricardo Mendez',
    examiner: 'Ana Rivera',
    documentType: 'Employment record',
    priority: 'High',
    createdAt: '2026-05-01T11:05:00.000Z',
    status: 'Genuine',
    analysisType: 'DOC',
  }),
];

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

        markCaseResultViewed: (caseId) => {
          set((state) => ({
            cases: state.cases.map((item) =>
              item.caseId === caseId ? { ...item, resultViewed: true } : item,
            ),
          }));
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
          caseLog.info('CaseStore:Submit', 'Submitting new case');
          
          const currentDraft = get().draftSignatureCase;

          if (!currentDraft.subjectName.trim() || !currentDraft.examiner.trim()) {
            throw createMockError('Subject name and examiner are required before submission.');
          }

          if (currentDraft.uploads.references.some((uri) => !uri) || !currentDraft.uploads.suspect) {
            throw createMockError('All reference uploads and the suspect upload must be completed before submission.');
          }

          set({ isSubmitting: true });
          caseLog.info('CaseStore:Submit', 'Validation passed, starting submission simulation');

          try {
            await new Promise((resolve) => setTimeout(resolve, 1500));

            const savedCase: SavedCase = {
              ...currentDraft,
              createdAt: new Date().toISOString(),
              status: 'Processing',
              analysisType: 'SIG',
              resultViewed: false,
            };

            caseLog.info('CaseStore:Submit', 'Case created, updating store');
            set((state) => ({
              cases: [savedCase, ...state.cases],
              draftSignatureCase: createInitialDraft(state.nextCaseNumber),
              nextCaseNumber: state.nextCaseNumber + 1,
            }));

            const submitTime = (performance.now() - startTime).toFixed(2);
            caseLog.info('CaseStore:Submit', `✓ Case submitted successfully (${submitTime}ms)`, { caseId: savedCase.caseId });
            
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
  const suspectCount = cases.filter((item) => item.status === 'Suspect').length;

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
    });
  }

  cases.forEach((item) => {
    if (item.status === 'Processing') {
      pendingCards.push({
        id: item.caseId,
        name: item.subjectName,
        status: 'processing',
      });
    }

    if (item.status === 'Completed' && !item.resultViewed) {
      pendingCards.push({
        id: item.caseId,
        name: item.subjectName,
        status: 'result-ready',
      });
    }
  });

  const statusOrder: Record<PendingCardStatus, number> = {
    draft: 0,
    processing: 1,
    'result-ready': 2,
  };

  return pendingCards.sort((left, right) => statusOrder[left.status] - statusOrder[right.status]).slice(0, MAX_PENDING_CARDS);
}
