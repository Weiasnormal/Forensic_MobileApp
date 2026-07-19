export type SignatureAnalysisVerdict = 'GENUINE' | 'FORGED';

export interface SignatureAnalysisResult {
  case_name?: string;
  confidence_forged: number;
  confidence_genuine: number;
  distance: number;
  
  overlay_images: OverlayImageRef[];

  threshold?: number;
  Threshold?: number;
  verdict?: SignatureAnalysisVerdict;
  Verdict?: SignatureAnalysisVerdict;

  report_filename?: string; 
  analysisTimeMs?: number;
}

export type OverlaySlot = 'Reference1' | 'Reference2' | 'Reference3' | 'Reference4' | 'Suspected';
export type OverlayVariant = 'Original' | 'Heatmap' | 'Overlay' | 'Bbox' | 'StrokeDiff';

export interface OverlayImageRef {
  id: string;        
  slot: OverlaySlot;
  variant: OverlayVariant;
}

export const REFERENCE_SLOTS: OverlaySlot[] = ['Reference1', 'Reference2', 'Reference3', 'Reference4'];

export function findOverlayImage(
  overlayImages: OverlayImageRef[] | undefined,
  slot: OverlaySlot,
  variant: OverlayVariant,
): OverlayImageRef | undefined {
  return overlayImages?.find((item) => item.slot === slot && item.variant === variant);
}

export interface ResolvedCaseVerdict {
  verdict: SignatureAnalysisVerdict | 'UNKNOWN';
  verdictLabel: string;
  isSuspected: boolean;
  confidence: number;
}

type VerdictSource = {
  verdict?: string;
  Verdict?: string;
  confidence?: number;
  Confidence?: number;
} | null | undefined;


export type FrontendCaseStatus = 'Processing' | 'Genuine' | 'Suspected';

export type SignatureAnalysisViewMode = 'Heatmap' | 'Bounding Box' | 'Stroke Diff';

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


export function resolveCaseVerdict(
  currentCase: VerdictSource,
  result: SignatureAnalysisResult | null | undefined,
): ResolvedCaseVerdict {
  const verdict = (currentCase?.verdict ??
    currentCase?.Verdict ??
    result?.Verdict ??
    result?.verdict ??
    'UNKNOWN') as SignatureAnalysisVerdict | 'UNKNOWN';

  if (verdict === 'UNKNOWN') {
    return {
      verdict: 'UNKNOWN',
      verdictLabel: 'UNKNOWN',
      isSuspected: false,
      confidence: currentCase?.confidence ?? currentCase?.Confidence ?? 0,
    };
  }

  const verdictLabel = getSignatureAnalysisVerdictLabel(verdict);
  const isSuspected = verdictLabel === 'SUSPECTED';

  const confidence =
    currentCase?.confidence ??
    currentCase?.Confidence ??
    (result
      ? getSignatureAnalysisConfidence({ ...result, verdict, Verdict: verdict })
      : 0);

  return { verdict, verdictLabel, isSuspected, confidence };
}