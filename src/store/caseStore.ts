import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { fetchBackendCases } from '@/services/backendCases';
import { API_ENDPOINTS, buildApiUrl, API_KEY } from '@/constants/api';
import { OverlayImageRef, OverlaySlot, OverlayVariant, getSignatureAnalysisCaseStatus, type SignatureAnalysisResult } from '@/services/signatureAnalysis';

const VALID_SLOTS: OverlaySlot[] = ['Reference1', 'Reference2', 'Reference3', 'Reference4', 'Suspected'];
const VALID_VARIANTS: OverlayVariant[] = ['Original', 'Heatmap', 'Overlay', 'BoundingBox', 'StrokeDiff'];

function parseOverlayImages(raw: unknown): OverlayImageRef[] {
  if (!Array.isArray(raw)) return [];
  const result: OverlayImageRef[] = [];

  for (const entry of raw) {
    if (typeof entry !== 'object' || entry === null) continue;

    const id =
      (entry as any).image_id ?? (entry as any).ImageId ??
      (entry as any).id ?? (entry as any).Id;
    const slot = (entry as any).slot ?? (entry as any).Slot;
    const variant = (entry as any).variant ?? (entry as any).Variant;

    if (typeof id !== 'string' || !id.trim()) continue;
    if (!VALID_SLOTS.includes(slot)) continue;
    if (!VALID_VARIANTS.includes(variant)) continue;

    result.push({ id, slot, variant });
  }
  return result;
}

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

function stripFingerprintSuffix(uri: string): string {
  const idPattern = /([?&])id=[^&#]*/;
  return uri.replace(idPattern, '').replace(/[?&]$/, '');
}

export type AnalysisPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type AnalysisType = 'SIG' | 'HW' | 'DOC';
export type CaseStatus = 'Processing' | 'Genuine' | 'Suspected';
export type DraftUploadType = 'reference' | 'suspect';
export type PendingCardStatus = 'draft' | 'processing' | 'result-ready';

const DEFAULT_ANALYSIS_TYPE: AnalysisType = 'SIG';

export interface DraftUploads {
  references: (string | null)[];
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
  caseCode?: string; 
  verdict?: string;
  Verdict?: string;
  confidence?: number;
  Confidence?: number;
  examiner: string;
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
  allowUploadSourceChoice: boolean;
  signatureAnalysisResults: Record<string, SignatureAnalysisResult>;
  markCaseResultViewed: (caseId: string) => void;
  updateCaseStatus: (caseId: string, status: CaseStatus) => void;
  setSignatureAnalysisResult: (caseId: string, result: SignatureAnalysisResult) => void;
  setActiveSignatureCaseId: (caseId: string | null) => void;
  refreshCasesFromBackend: () => Promise<boolean>;
  stashSavedCases: () => void;
  restoreSavedCases: () => void;
  setAllowUploadSourceChoice: (value: boolean) => void;
  startNewSignatureDraft: () => void;
  discardSignatureDraft: () => void;
  updateDraftCase: <K extends DraftEditableField>(field: K, value: DraftCase[K]) => void;
  setDraftUpload: (type: DraftUploadType, index: number, uri: string | null) => void;
  submitNewCase: () => Promise<SavedCase>;
  resetMockDatabase: () => void;

  submissionStatus: 'idle' | 'submitting' | 'success' | 'error';
  submissionStep: string;
  submissionProgress: number; 
  submissionError: string | null;
  resetSubmissionState: () => void;
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
    const existing = mergedCases.get(item.caseId);
    if (existing && existing.uploads && existing.uploads.suspect) {
      item.uploads = existing.uploads;
    }
    mergedCases.set(item.caseId, item); 
  });

  return Array.from(mergedCases.values());
}

const INITIAL_CASES: SavedCase[] = [
  createSavedCase({
    caseId: 'CASE-04-27-2026-001',
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
    caseId: 'CASE-04-28-2026-002',
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
    caseId: 'CASE-04-29-2026-003',
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
    caseId: 'CASE-04-30-2026-004',
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
    caseId: 'CASE-05-01-2026-005',
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

const PRIORITY_MAP: Record<AnalysisPriority, number> = {
  Low: 0, Medium: 1, High: 2, Urgent: 3,
};

const ANALYSIS_TYPE_MAP: Record<AnalysisType, number> = {
  SIG: 0, HW: 1, DOC: 2,
};

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
        allowUploadSourceChoice: false,
        signatureAnalysisResults: {},

        submissionStatus: 'idle',
        submissionStep: '',
        submissionProgress: 0,
        submissionError: null,

        resetSubmissionState: () => {
          set({
            submissionStatus: 'idle',
            submissionStep: '',
            submissionProgress: 0,
            submissionError: null,
          });
        },

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

        setAllowUploadSourceChoice: (value) => {
          caseLog.info('CaseStore:Action', 'Setting upload source choice preference', { value });
          set({ allowUploadSourceChoice: value });
        },

        startNewSignatureDraft: () => {
          caseLog.info('CaseStore:Action', 'Starting new signature draft');
          set((state) => {
            const nextCaseNumber = state.nextCaseNumber;
            caseLog.info('CaseStore:Action', 'New draft created', { caseId: buildCaseId(nextCaseNumber) });

            return {
              draftSignatureCase: createInitialDraft(nextCaseNumber),
              nextCaseNumber: nextCaseNumber + 1,
              submissionStatus: 'idle',
              submissionStep: '',
              submissionProgress: 0,
              submissionError: null,
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
          caseLog.info('CaseStore:Submit', 'Submitting new case (networked)');

          const startTime = Date.now();
          const currentDraft = get().draftSignatureCase;

          if (!currentDraft.subjectName.trim() || !currentDraft.examiner.trim()) {
            const message = 'Subject name and examiner are required before submission.';
            caseLog.error('CaseStore:Error', message);
            set({ submissionStatus: 'error', submissionError: message });
            throw new Error(message);
          }

          if (currentDraft.uploads.references.some((uri) => !uri) || !currentDraft.uploads.suspect) {
            throw createMockError('All reference uploads and the suspect upload must be completed before submission.');
          }

          set({
            isSubmitting: true,
            submissionStatus: 'submitting',
            submissionStep: 'Creating case',
            submissionProgress: 2,
            submissionError: null,
          });

          function generateGuid() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
              const r = (Math.random() * 16) | 0;
              const v = c === 'x' ? r : (r & 0x3) | 0x8;
              return v.toString(16);
            });
          }

          try {
            const examinerGuid = generateGuid();

            const createRequest = {
              SubjectName: currentDraft.subjectName,
              Examiner: examinerGuid,
              Priority: PRIORITY_MAP[currentDraft.priority],
              AnalysisType: ANALYSIS_TYPE_MAP[DEFAULT_ANALYSIS_TYPE],
            };

            caseLog.info('CaseStore:Submit', 'Creating case on backend', { SubjectName: createRequest.SubjectName });

            const createRes = await fetch(buildApiUrl(API_ENDPOINTS.cases.create), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-Api-Key': API_KEY || '',
              },
              body: JSON.stringify(createRequest),
            });

            if (!createRes.ok) {
              throw new Error(`Create case failed (${createRes.status})`);
            }

            

            let rawCaseId: string | null = null;
            let caseCode: string | null = null;
            try {
              const json = await createRes.json();
              if (json) {
                rawCaseId = (json.id ?? json).toString();
                caseCode = json.caseCode ?? json.CaseCode ?? null;
              }
            } catch {
              // intentionally ignore malformed/non-JSON responses
            }

            if (!rawCaseId) {
              const loc = createRes.headers.get('Location') || createRes.headers.get('location');
              if (loc) {
                const parts = loc.split('/');
                rawCaseId = parts[parts.length - 1];
              }
            }

            if (!rawCaseId) {
              throw new Error('Unable to determine created case id from response');
            }
            const caseId: string = rawCaseId;
            
            set((state) => {
              const placeholderCase: SavedCase = {
                ...currentDraft,
                caseId,
                caseCode: caseCode ?? caseId,
                createdAt: new Date().toISOString(),
                status: 'Processing',
                analysisType: DEFAULT_ANALYSIS_TYPE,
                resultViewed: false,
                mockTemplateNumber: state.nextMockTemplateNumber,
              };

              const filteredCases = state.cases.filter((c) => c.caseId !== currentDraft.caseId);
              const nextCases = [...filteredCases, placeholderCase];
              const nextCaseNumber = getNextCaseNumberFromCases(nextCases);

              return {
                cases: nextCases,
                draftSignatureCase: createInitialDraft(nextCaseNumber),
                nextCaseNumber,
                activeSignatureCaseId: caseId,
              };
            });
            

            caseLog.info('CaseStore:Submit', 'Uploading images for case', { caseId });
            set({ submissionStep: 'Uploading reference signatures', submissionProgress: 10 });

            async function normalizeToPng(uri: string): Promise<string> {
              let fileInfo;

              try {
                fileInfo = await FileSystem.getInfoAsync(uri);
              } catch (error) {
                caseLog.warn('CaseStore:Upload', 'Unable to stat selected image URI before normalization', {
                  uri,
                  error,
                });
              }

              if (fileInfo && !fileInfo.exists) {
                throw new Error('One of the selected images is no longer available. Please reselect your uploads and try again.');
              }

              let result;
              try {
                result = await ImageManipulator.manipulateAsync(
                  uri,
                  [],
                  { format: ImageManipulator.SaveFormat.PNG },
                );
              } catch (error) {
                caseLog.error('CaseStore:Upload', 'Image normalization failed', {
                  uri,
                  error,
                });
                throw new Error('Failed to process one of the selected images. Please choose a different image and try again.');
              }

              caseLog.info('CaseStore:Upload', 'Normalized image to PNG', {
                from: uri,
                to: result.uri,
              });
              return result.uri;
            }

            const totalRefs = currentDraft.uploads.references.length;

            for (let i = 0; i < totalRefs; i++) {
              const uri = currentDraft.uploads.references[i];
              if (!uri) continue;

              const cleanUri = stripFingerprintSuffix(uri);
              const pngUri = await normalizeToPng(cleanUri);

              const fd = new FormData();
              fd.append('file', { uri: pngUri, name: `reference-${i + 1}.png`, type: 'image/png' } as any);
              const uploadPath = buildApiUrl(`${API_ENDPOINTS.signatures.uploadReference(caseId)}?index=${i + 1}`);
              caseLog.info('CaseStore:Submit', 'Uploading reference', { caseId, backendIndex: i + 1, localSlot: i });

              const upRes = await fetch(uploadPath, {
                method: 'POST',
                headers: { 
                  Accept: 'application/json',
                  'X-Api-Key': API_KEY || '',
                },
                body: fd as any,
              });

              if (!upRes.ok) {
                throw new Error(`Reference upload failed (${upRes.status})`);
              }

              set({
                submissionStep: `Uploading reference ${i + 1} of ${totalRefs}`,
                submissionProgress: 10 + Math.round(((i + 1) / totalRefs) * 40),
              });
            }

            set({ submissionStep: 'Uploading suspected signature', submissionProgress: 55 });

            if (currentDraft.uploads.suspect) {
              const cleanSuspect = stripFingerprintSuffix(currentDraft.uploads.suspect);
              const pngSuspect = await normalizeToPng(cleanSuspect);

              const fd = new FormData();
              fd.append('file', { uri: pngSuspect, name: 'suspect.png', type: 'image/png' } as any);
              const upPath = buildApiUrl(`${API_ENDPOINTS.signatures.uploadSuspected(caseId)}?index=1`);
              const upRes = await fetch(upPath, {
                method: 'POST',
                headers: { 
                  Accept: 'application/json',
                  'X-Api-Key': API_KEY || '',
                },
                body: fd as any,
              });

              if (!upRes.ok) {
                throw new Error(`Suspect upload failed (${upRes.status})`);
              }
            }

            caseLog.info('CaseStore:Submit', 'Triggering analysis', { caseId });
            set({ submissionStep: 'Running AI forensic comparison', submissionProgress: 65 });
            set({ submissionStep: 'Analyzing forensic features', submissionProgress: 72 });

            const analysisRes = await fetch(buildApiUrl(API_ENDPOINTS.analysis.start(caseId)), { 
              method: 'GET',
              headers: {
                Accept: 'application/json',
                'X-Api-Key': API_KEY || '',
              },
            });
            const timeTakenMs = Date.now() - startTime;

            let analysisResult: any = null;
            let finalStatus: CaseStatus = 'Processing';

            if (analysisRes.ok) {
              try {
                const processResponse = await analysisRes.json();
                caseLog.info('CaseStore:Submit', 'ProcessResponse received', processResponse);

                const verdict = processResponse?.Verdict ?? processResponse?.verdict;
                const confidenceForged = processResponse?.ConfidenceForged ?? processResponse?.confidence_forged ?? 0;
                const confidenceGenuine = processResponse?.ConfidenceGenuine ?? processResponse?.confidence_genuine ?? 0;
                const distance = processResponse?.Distance ?? processResponse?.distance ?? 0;
                const threshold = processResponse?.Threshold ?? processResponse?.threshold ?? 0;
                const rawOverlayImages = processResponse?.GradcamImages ??processResponse?.gradcam_images ??
                processResponse?.OverlayImages ?? processResponse?.overlay_images ??[];
              const overlayImages = parseOverlayImages(rawOverlayImages);

                if (rawOverlayImages.length > 0 && overlayImages.length === 0) {
                  caseLog.warn('CaseStore:Submit', 'All overlay image entries failed validation and were dropped', {
                    caseId,
                    rawCount: rawOverlayImages.length,
                  });
                }

                if (verdict) {
                  finalStatus = verdict === 'FORGED' ? 'Suspected' : 'Genuine';
                }

                analysisResult = {
                  case_name: processResponse?.CaseName ?? processResponse?.case_name ?? caseId,
                  confidence_forged: confidenceForged,
                  confidence_genuine: confidenceGenuine,
                  distance,
                  overlay_images: overlayImages,
                  threshold,
                  verdict: verdict as any,
                  Verdict: verdict as any,
                  analysisTimeMs: timeTakenMs,
                };
              } catch (error) {
                caseLog.error('CaseStore:Submit', 'Failed to parse analysis response', error);
                analysisResult = null;
              }
            }

            set({ submissionStep: 'Finalizing report', submissionProgress: 90 });

            const savedCase: SavedCase = {
              ...currentDraft,
              caseId,
              caseCode: caseCode ?? caseId,
              createdAt: new Date().toISOString(),
              status: finalStatus,
              analysisType: DEFAULT_ANALYSIS_TYPE,
              resultViewed: false,
              mockTemplateNumber: get().nextMockTemplateNumber,
            };

            caseLog.info('CaseStore:Submit', 'Saving case to store', {
              draftId: currentDraft.caseId,
              backendId: caseId,
              hasUploads: !!savedCase.uploads,
              hasSuspect: !!savedCase.uploads?.suspect,
            });

            const hasVerdict = Boolean(analysisResult?.verdict);

            set((state) => ({
              cases: state.cases.map((item) =>
                item.caseId === caseId
                  ? { ...item, status: finalStatus, mockTemplateNumber: state.nextMockTemplateNumber }
                  : item,
              ),
              nextMockTemplateNumber: state.nextMockTemplateNumber + 1,
              signatureAnalysisResults: {
                ...state.signatureAnalysisResults,
                [caseId]: analysisResult,
              },
              submissionStatus: hasVerdict ? 'success' : 'error',
              submissionStep: hasVerdict ? 'Complete' : '',
              submissionProgress: hasVerdict ? 100 : state.submissionProgress,
              submissionError: hasVerdict ? null : 'Analysis did not return a valid verdict.',
            }));
            caseLog.info('CaseStore:Submit', '✓ Case submitted successfully', { caseId, analysisResult });

            const finalCase = get().cases.find((c) => c.caseId === caseId)!;
            return finalCase;
          } catch (e) {
            const error = e as Error;
            caseLog.error('CaseStore:Submit', 'Submission failed', error);
            set({
              submissionStatus: 'error',
              submissionError: error.message || 'Something went wrong while submitting the case.',
            });
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
            submissionStatus: 'idle',
            submissionStep: '',
            submissionProgress: 0,
            submissionError: null,
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
        allowUploadSourceChoice: state.allowUploadSourceChoice,
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
  caseCode?: string;
  name: string;
  type: string;
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
      caseCode: draft.caseId,
      name: draft.examiner.trim() || 'Draft in progress',
      type:draft.documentType,
      status: 'draft',
      sortKey: Number.MAX_SAFE_INTEGER,
    });
  }

  cases.forEach((item) => {
    if (item.status === 'Processing') {
      pendingCards.push({
        id: item.caseId,
        caseCode: item.caseCode ?? item.caseId,
        name: item.examiner,
        type:item.documentType,
        status: 'processing',
        sortKey: new Date(item.createdAt).getTime(),
      });
    }

    if (item.status !== 'Processing' && !item.resultViewed) {
      pendingCards.push({
        id: item.caseId,
        caseCode: item.caseCode ?? item.caseId,
        name: item.examiner,
        type:item.documentType,
        status: 'result-ready',
        sortKey: new Date(item.createdAt).getTime(),
      });
    }
  });

  return pendingCards.sort((left, right) => right.sortKey - left.sortKey).slice(0, MAX_PENDING_CARDS);
}
