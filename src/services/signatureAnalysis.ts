export type SignatureAnalysisVerdict = 'GENUINE' | 'FORGED';

// export interface SignatureBoundingBox {
//   x: number;      
//   y: number;
//   width: number;
//   height: number;
//   label?: string;
// }

export interface SignatureAnalysisResult {
  case_name?: string;
  confidence_forged: number;
  confidence_genuine: number;
  distance: number;
  gradcam_blob_ids: string[];

  //cam_grid?: number[][];
  //ink_bbox?: SignatureBoundingBox | SignatureBoundingBox[];
  //stroke_markers?: any[];

  //boxes?: SignatureBoundingBox[];
  //reference_boxes?: SignatureBoundingBox[][];

  threshold?: number;
  Threshold?: number;
  verdict?: SignatureAnalysisVerdict;
  Verdict?: SignatureAnalysisVerdict;
}

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

export interface ParsedGradcamSlots {
  references: Record<OverlayVariant, string | null>[]; // index 0-3
  suspect: Record<OverlayVariant, string | null>;
}

export function parseGradcamBlobIds(blobIds: string[]): ParsedGradcamSlots {
  const empty = (): Record<OverlayVariant, string | null> => ({
    original: null, heatmap: null, overlay: null, bbox: null, stroke_diff: null,
  });

  const references = [empty(), empty(), empty(), empty()];
  const suspect = empty();

  for (const path of blobIds) {
    if (!path.endsWith('.png')) continue; // skip the pdf entry
    const segments = path.split('/');
    const folder = segments[segments.length - 2]; // genuine_1 | suspected
    const filename = segments[segments.length - 1]; // G1_heatmap.png

    const variantMatch = filename.match(/_(original|heatmap|overlay|bbox|stroke_diff)\.png$/i);
    if (!variantMatch) continue;
    const variant = variantMatch[1] as OverlayVariant;

    if (folder === 'suspected') {
      suspect[variant] = path;
    } else {
      const idx = Number(folder.replace('genuine_', '')) - 1;
      if (idx >= 0 && idx <= 3) references[idx][variant] = path;
    }
  }

  return { references, suspect };
}