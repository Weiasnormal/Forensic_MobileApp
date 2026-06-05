export type MockSignatureAnalysisVerdict = 'GENUINE' | 'FORGED';

export interface MockSignatureAnalysisResult {
  case_name: string;
  confidence_forged: number;
  confidence_genuine: number;
  distance: number;
  gradcam_blob_id: string;
  threshold: number;
  verdict: MockSignatureAnalysisVerdict;
}

export type FrontendCaseStatus = 'Processing' | 'Genuine' | 'Suspected';

export type SignatureAnalysisViewMode = 'Heatmap' | 'Bounding box' | 'Stroke diff';

export function getMockSignatureAnalysisCaseName(templateNumber: number) {
  return `Case${String(templateNumber).padStart(3, '0')}`;
}

function resolveVerdict(templateNumber: number, forcedVerdict?: MockSignatureAnalysisVerdict) {
  if (forcedVerdict) {
    return forcedVerdict;
  }

  return templateNumber % 2 === 0 ? 'FORGED' : 'GENUINE';
}

export function createMockSignatureAnalysisResult(templateNumber: number, forcedVerdict?: MockSignatureAnalysisVerdict): MockSignatureAnalysisResult {
  const caseName = getMockSignatureAnalysisCaseName(templateNumber);
  const verdict = resolveVerdict(templateNumber, forcedVerdict);
  const isForged = verdict === 'FORGED';
  const variation = (templateNumber - 1) % 5;

  const confidenceForged = isForged ? 78 + variation * 4.25 : 6 + variation * 1.75;
  const confidenceGenuine = 100 - confidenceForged;
  const distance = isForged ? 0.41 + variation * 0.036 : 0.12 + variation * 0.014;

  return {
    case_name: caseName,
    confidence_forged: Number(confidenceForged.toFixed(4)),
    confidence_genuine: Number(confidenceGenuine.toFixed(4)),
    distance: Number(distance.toFixed(7)),
    gradcam_blob_id: `analysis-report-${String(templateNumber).padStart(3, '0')}`,
    threshold: 0.4063,
    verdict,
  };
}

export function getSignatureAnalysisVerdictLabel(verdict: MockSignatureAnalysisVerdict) {
  return verdict === 'FORGED' ? 'SUSPECTED' : 'GENUINE';
}

export function getSignatureAnalysisConfidence(result: MockSignatureAnalysisResult) {
  return result.verdict === 'FORGED' ? result.confidence_forged : result.confidence_genuine;
}

export function getSignatureAnalysisCaseStatus(result: MockSignatureAnalysisResult): FrontendCaseStatus {
  return result.verdict === 'FORGED' ? 'Suspected' : 'Genuine';
}
