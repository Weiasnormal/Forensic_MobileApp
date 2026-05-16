import { create } from 'zustand';

export type AnalysisFlowType = 'signature' | 'handwriting';
export type AnalysisPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface AnalysisCaseDetails {
  caseId: string;
  subjectName: string;
  examinerName: string;
  documentType: string;
  priority: AnalysisPriority;
}

export interface AnalysisUploads {
  references: Array<string | null>;
  suspect: string | null;
}

interface AnalysisFlowState {
  caseDetails: AnalysisCaseDetails;
  uploads: AnalysisUploads;
}

interface AnalysisFlowStore {
  signature: AnalysisFlowState;
  handwriting: AnalysisFlowState;
  nextCaseNumber: number;
  currentAnalysisType: AnalysisFlowType | null;
  initializeFlow: (type: AnalysisFlowType) => void;
  setSubjectName: (type: AnalysisFlowType, value: string) => void;
  setExaminerName: (type: AnalysisFlowType, value: string) => void;
  setDocumentType: (type: AnalysisFlowType, value: string) => void;
  setPriority: (type: AnalysisFlowType, value: AnalysisPriority) => void;
  setReference: (type: AnalysisFlowType, index: number, uri: string | null) => void;
  setSuspect: (type: AnalysisFlowType, uri: string | null) => void;
  resetUploads: (type: AnalysisFlowType) => void;
  setCurrentAnalysisType: (type: AnalysisFlowType | null) => void;
}

const INITIAL_PRIORITY: AnalysisPriority = 'Medium';

function buildCaseId(caseNumber: number) {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const year = now.getFullYear();
  const counter = String(caseNumber).padStart(3, '0');
  return `${month}-${day}-${year}-${counter}`;
}

function createInitialFlow(caseId: string): AnalysisFlowState {
  return {
    caseDetails: {
      caseId,
      subjectName: '',
      examinerName: '',
      documentType: '',
      priority: INITIAL_PRIORITY,
    },
    uploads: {
      references: [null, null, null, null],
      suspect: null,
    },
  };
}

function withUpdatedFlow(
  state: AnalysisFlowStore,
  type: AnalysisFlowType,
  updater: (flow: AnalysisFlowState) => AnalysisFlowState,
) {
  const nextFlow = updater(state[type]);
  return {
    ...(type === 'signature' ? { signature: nextFlow } : { handwriting: nextFlow }),
  };
}

const initialSignatureId = buildCaseId(1);
const initialHandwritingId = buildCaseId(2);

export const useAnalysisFlowStore = create<AnalysisFlowStore>((set) => ({
  signature: createInitialFlow(initialSignatureId),
  handwriting: createInitialFlow(initialHandwritingId),
  nextCaseNumber: 3,
  currentAnalysisType: null,

  initializeFlow: (type) =>
    set((state) => {
      const caseId = buildCaseId(state.nextCaseNumber);
      return {
        ...withUpdatedFlow(state, type, () => createInitialFlow(caseId)),
        nextCaseNumber: state.nextCaseNumber + 1,
        currentAnalysisType: type,
      };
    }),

  setSubjectName: (type, value) =>
    set((state) =>
      withUpdatedFlow(state, type, (flow) => ({
        ...flow,
        caseDetails: {
          ...flow.caseDetails,
          subjectName: value,
        },
      })),
    ),

  setExaminerName: (type, value) =>
    set((state) =>
      withUpdatedFlow(state, type, (flow) => ({
        ...flow,
        caseDetails: {
          ...flow.caseDetails,
          examinerName: value,
        },
      })),
    ),

  setDocumentType: (type, value) =>
    set((state) =>
      withUpdatedFlow(state, type, (flow) => ({
        ...flow,
        caseDetails: {
          ...flow.caseDetails,
          documentType: value,
        },
      })),
    ),

  setPriority: (type, value) =>
    set((state) =>
      withUpdatedFlow(state, type, (flow) => ({
        ...flow,
        caseDetails: {
          ...flow.caseDetails,
          priority: value,
        },
      })),
    ),

  setReference: (type, index, uri) =>
    set((state) =>
      withUpdatedFlow(state, type, (flow) => ({
        ...flow,
        uploads: {
          ...flow.uploads,
          references: flow.uploads.references.map((item, itemIndex) =>
            itemIndex === index ? uri : item,
          ),
        },
      })),
    ),

  setSuspect: (type, uri) =>
    set((state) =>
      withUpdatedFlow(state, type, (flow) => ({
        ...flow,
        uploads: {
          ...flow.uploads,
          suspect: uri,
        },
      })),
    ),

  resetUploads: (type) =>
    set((state) =>
      withUpdatedFlow(state, type, (flow) => ({
        ...flow,
        uploads: {
          references: [null, null, null, null],
          suspect: null,
        },
      })),
    ),

  setCurrentAnalysisType: (type) =>
    set({
      currentAnalysisType: type,
    }),
}));

export function hasCompleteUploads(uploads: AnalysisUploads) {
  return uploads.references.every(Boolean) && Boolean(uploads.suspect);
}
