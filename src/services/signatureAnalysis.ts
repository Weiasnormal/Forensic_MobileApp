export type SignatureAnalysisVerdict = 'GENUINE' | 'FORGED';

export interface SignatureAnalysisResult {
  case_name?: string;
  confidence_forged: number;
  confidence_genuine: number;
  distance: number;
  gradcam_blob_ids: string[];

  threshold?: number;
  Threshold?: number;
  verdict?: SignatureAnalysisVerdict;
  Verdict?: SignatureAnalysisVerdict;

  report_filename?: string; 
  analysisTimeMs?: number;
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

export type OverlayVariant = 'original' | 'heatmap' | 'overlay' | 'bbox' | 'stroke_diff';

export interface BlobImageRef {
  folder: string;
  fileName: string;
}

export interface ParsedGradcamSlots {
  references: Record<OverlayVariant, BlobImageRef | null>[];
  suspect: Record<OverlayVariant, BlobImageRef | null>;
}

export function parseGradcamBlobIds(blobIds: string[]): ParsedGradcamSlots {
  const empty = (): Record<OverlayVariant, BlobImageRef | null> => ({
    original: null, heatmap: null, overlay: null, bbox: null, stroke_diff: null,
  });

  const references = [empty(), empty(), empty(), empty()];
  const suspect = empty();

  for (const path of blobIds) {
    if (!path.endsWith('.png')) continue;
    const segments = path.split('/');
    const folder = segments[segments.length - 2];
    const fileName = segments[segments.length - 1];

    const variantMatch = fileName.match(/_(original|heatmap|overlay|bbox|stroke_diff)\.png$/i);
    if (!variantMatch) continue;
    const variant = variantMatch[1] as OverlayVariant;

    const ref: BlobImageRef = { folder, fileName };

    if (folder === 'suspected') {
      suspect[variant] = ref;
    } else {
      const idx = Number(folder.replace('genuine_', '')) - 1;
      if (idx >= 0 && idx <= 3) references[idx][variant] = ref;
    }
  }

  return { references, suspect };
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