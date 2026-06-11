export type SignatureAnalysisVerdict = 'GENUINE' | 'FORGED';

export interface SignatureAnalysisResult {
  case_name?: string;
  confidence_forged: number;
  confidence_genuine: number;
  distance: number;
  gradcam_blob_id?: string;
  
  threshold?: number;
  Threshold?: number; 
  verdict?: SignatureAnalysisVerdict;
  Verdict?: SignatureAnalysisVerdict;
}

export type FrontendCaseStatus = 'Processing' | 'Genuine' | 'Suspected';

export type SignatureAnalysisViewMode = 'Heatmap' | 'Bounding box' | 'Stroke diff';

export function getSignatureAnalysisVerdictLabel(verdict: SignatureAnalysisVerdict) {
  return verdict === 'FORGED' ? 'SUSPECTED' : 'GENUINE';
}

export function getSignatureAnalysisConfidence(result: SignatureAnalysisResult) {
  const verdict = result.Verdict || result.verdict;
  return verdict === 'FORGED' ? result.confidence_forged : result.confidence_genuine;
}

export function getSignatureAnalysisCaseStatus(result: SignatureAnalysisResult): FrontendCaseStatus {
  const verdict = result.Verdict || result.verdict;
  return verdict === 'FORGED' ? 'Suspected' : 'Genuine';
}