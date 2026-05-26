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

// Optional richer fields supplied for some templates (e.g., user-provided JSON)
export interface MockSignatureAnalysisExtra {
  avg_distance?: number;
  key_findings?: Record<string, string>;
}

export type FrontendCaseStatus = 'Processing' | 'Genuine' | 'Suspected';

export interface MockSignatureAnalysisAssets {
  references: [number, number, number, number];
  suspect: number;
}

export type SignatureAnalysisViewMode = 'Heatmap' | 'Bounding box' | 'Stroke diff';

export interface SignatureAnalysisViewAssets {
  references: [number, number, number, number];
  suspect: number;
}

export function getMockSignatureAnalysisCaseName(templateNumber: number) {
  return `Case${String(templateNumber).padStart(3, '0')}`;
}

const SAMPLE_SIGNATURE_ANALYSIS_ASSET_MAP: Record<number, Record<SignatureAnalysisViewMode, SignatureAnalysisViewAssets>> = {
  1: {
    Heatmap: {
      references: [
        require('../../assets/expo.icon/Assets/SampleTest/heatmap/Case001_sig01.png'),
        require('../../assets/expo.icon/Assets/SampleTest/heatmap/Case001_sig02.png'),
        require('../../assets/expo.icon/Assets/SampleTest/heatmap/Case001_sig03.png'),
        require('../../assets/expo.icon/Assets/SampleTest/heatmap/Case001_sig04.png'),
      ],
      suspect: require('../../assets/expo.icon/Assets/SampleTest/heatmap/Case001_suspect01.png'),
    },
    'Bounding box': {
      references: [
        require('../../assets/expo.icon/Assets/SampleTest/boundingbox/Case001_sig01.png'),
        require('../../assets/expo.icon/Assets/SampleTest/boundingbox/Case001_sig02.png'),
        require('../../assets/expo.icon/Assets/SampleTest/boundingbox/Case001_sig03.png'),
        require('../../assets/expo.icon/Assets/SampleTest/boundingbox/Case001_sig04.png'),
      ],
      suspect: require('../../assets/expo.icon/Assets/SampleTest/boundingbox/Case001_suspect01.png'),
    },
    'Stroke diff': {
      references: [
        require('../../assets/expo.icon/Assets/SampleTest/strokediff/Case001_sig01.png'),
        require('../../assets/expo.icon/Assets/SampleTest/strokediff/Case001_sig02.png'),
        require('../../assets/expo.icon/Assets/SampleTest/strokediff/Case001_sig03.png'),
        require('../../assets/expo.icon/Assets/SampleTest/strokediff/Case001_sig04.png'),
      ],
      suspect: require('../../assets/expo.icon/Assets/SampleTest/strokediff/Case001_suspect01.png'),
    },
  },
  2: {
    Heatmap: {
      references: [
        require('../../assets/expo.icon/Assets/SampleTest/heatmap/Case002_sig01.png'),
        require('../../assets/expo.icon/Assets/SampleTest/heatmap/Case002_sig02.png'),
        require('../../assets/expo.icon/Assets/SampleTest/heatmap/Case002_sig03.png'),
        require('../../assets/expo.icon/Assets/SampleTest/heatmap/Case002_sig04.png'),
      ],
      suspect: require('../../assets/expo.icon/Assets/SampleTest/heatmap/Case002_suspect01.png'),
    },
    'Bounding box': {
      references: [
        require('../../assets/expo.icon/Assets/SampleTest/boundingbox/Case002_sig01.png'),
        require('../../assets/expo.icon/Assets/SampleTest/boundingbox/Case002_sig02.png'),
        require('../../assets/expo.icon/Assets/SampleTest/boundingbox/Case002_sig03.png'),
        require('../../assets/expo.icon/Assets/SampleTest/boundingbox/Case002_sig04.png'),
      ],
      suspect: require('../../assets/expo.icon/Assets/SampleTest/boundingbox/Case002_suspect01.png'),
    },
    'Stroke diff': {
      references: [
        require('../../assets/expo.icon/Assets/SampleTest/strokediff/Case002_sig01.png'),
        require('../../assets/expo.icon/Assets/SampleTest/strokediff/Case002_sig02.png'),
        require('../../assets/expo.icon/Assets/SampleTest/strokediff/Case002_sig03.png'),
        require('../../assets/expo.icon/Assets/SampleTest/strokediff/Case002_sig04.png'),
      ],
      suspect: require('../../assets/expo.icon/Assets/SampleTest/strokediff/Case002_suspect01.png'),
    },
  },
  3: {
    Heatmap: {
      references: [
        require('../../assets/expo.icon/Assets/SampleTest/heatmap/Case003_sig01.png'),
        require('../../assets/expo.icon/Assets/SampleTest/heatmap/Case003_sig02.png'),
        require('../../assets/expo.icon/Assets/SampleTest/heatmap/Case003_sig03.png'),
        require('../../assets/expo.icon/Assets/SampleTest/heatmap/Case003_sig04.png'),
      ],
      suspect: require('../../assets/expo.icon/Assets/SampleTest/heatmap/Case003_suspect01.png'),
    },
    'Bounding box': {
      references: [
        require('../../assets/expo.icon/Assets/SampleTest/boundingbox/Case003_sig01.png'),
        require('../../assets/expo.icon/Assets/SampleTest/boundingbox/Case003_sig02.png'),
        require('../../assets/expo.icon/Assets/SampleTest/boundingbox/Case003_sig03.png'),
        require('../../assets/expo.icon/Assets/SampleTest/boundingbox/Case003_sig04.png'),
      ],
      suspect: require('../../assets/expo.icon/Assets/SampleTest/boundingbox/Case003_suspect01.png'),
    },
    'Stroke diff': {
      references: [
        require('../../assets/expo.icon/Assets/SampleTest/strokediff/Case003_sig01.png'),
        require('../../assets/expo.icon/Assets/SampleTest/strokediff/Case003_sig02.png'),
        require('../../assets/expo.icon/Assets/SampleTest/strokediff/Case003_sig03.png'),
        require('../../assets/expo.icon/Assets/SampleTest/strokediff/Case003_sig04.png'),
      ],
      suspect: require('../../assets/expo.icon/Assets/SampleTest/strokediff/Case003_suspect01.png'),
    },
  },
};

const GENERIC_SIGNATURE_ANALYSIS_ASSETS: SignatureAnalysisViewAssets = {
  references: [
    require('../../assets/expo.icon/Assets/SampleTest/ref_sample01.webp'),
    require('../../assets/expo.icon/Assets/SampleTest/ref_sample02.webp'),
    require('../../assets/expo.icon/Assets/SampleTest/ref_sample03.webp'),
    require('../../assets/expo.icon/Assets/SampleTest/ref_sample04.webp'),
  ],
  suspect: require('../../assets/expo.icon/Assets/SampleTest/sample_suspect01.webp'),
};

export function createMockSignatureAnalysisResult(templateNumber: number, forcedVerdict?: MockSignatureAnalysisVerdict): MockSignatureAnalysisResult {
  const caseName = getMockSignatureAnalysisCaseName(templateNumber);

  // Special-case: template 1 uses the user-provided Case 001 payload
  if (templateNumber === 1) {
    return {
      case_name: caseName,
      confidence_forged: 78.76,
      confidence_genuine: 21.24,
      distance: 0.5373,
      avg_distance: 0.5373 as any, // kept for compatibility with user JSON
      gradcam_blob_id: 'Case001-gradcam.json',
      threshold: 0.4063,
      verdict: 'FORGED',
      // @ts-ignore - include key_findings for richer payload consumption in UI if needed
      key_findings: {
        f1_label: 'Simulated Writing',
        f2_label: 'Inconsistent',
        f3_label: 'Tremor detected',
        f4_label: 'Proportional (x3)',
        f5_label: 'Beyond controlling pattern',
      },
    } as unknown as MockSignatureAnalysisResult;
  }
  
  // Special-case: template 2 (CASE002) - user-provided JSON
  if (templateNumber === 2) {
    return {
      case_name: caseName,
      confidence_forged: 10.93,
      confidence_genuine: 89.07,
      distance: 0.1965,
      avg_distance: 0.1965 as any,
      gradcam_blob_id: 'Case002-gradcam.json',
      threshold: 0.4063,
      verdict: 'GENUINE',
      // @ts-ignore include key_findings for richer payload
      key_findings: {
        f1_label: 'Habitual Writing',
        f2_label: 'Inconsistent',
        f3_label: 'Tremor detected',
        f4_label: 'Irregular (x7)',
        f5_label: 'Within normal variation',
      },
    } as unknown as MockSignatureAnalysisResult;
  }

  // Special-case: template 3 (CASE003) - user-provided JSON
  if (templateNumber === 3) {
    return {
      case_name: caseName,
      confidence_forged: 96.0,
      confidence_genuine: 4.0,
      distance: 0.724,
      avg_distance: 0.724 as any,
      gradcam_blob_id: 'Case003-gradcam.json',
      threshold: 0.4063,
      verdict: 'FORGED',
      // @ts-ignore include key_findings for richer payload
      key_findings: {
        f1_label: 'Simulated Writing',
        f2_label: 'Descending',
        f3_label: 'Tremor detected',
        f4_label: 'Proportional (x4)',
        f5_label: 'Beyond controlling pattern',
      },
    } as unknown as MockSignatureAnalysisResult;
  }
  if (forcedVerdict === 'FORGED') {
    return {
      case_name: caseName,
      confidence_forged: 92.34,
      confidence_genuine: 7.66,
      distance: 0.5234217,
      gradcam_blob_id: 'forged-testcase.json',
      threshold: 0.4063,
      verdict: 'FORGED',
    };
  }

  if (forcedVerdict === 'GENUINE') {
    return {
      case_name: caseName,
      confidence_forged: 1.7526,
      confidence_genuine: 98.2474,
      distance: 0.1336454,
      gradcam_blob_id: 'genuine-testcase.json',
      threshold: 0.4063,
      verdict: 'GENUINE',
    };
  }

  // Fallback deterministic derivation when no forced verdict was supplied.
  const isForged = templateNumber % 2 === 0;

  if (isForged) {
    return {
      case_name: caseName,
      confidence_forged: 92.34,
      confidence_genuine: 7.66,
      distance: 0.5234217,
      gradcam_blob_id: 'forged-testcase.json',
      threshold: 0.4063,
      verdict: 'FORGED',
    };
  }

  return {
    case_name: caseName,
    confidence_forged: 1.7526,
    confidence_genuine: 98.2474,
    distance: 0.1336454,
    gradcam_blob_id: 'genuine-testcase.json',
    threshold: 0.4063,
    verdict: 'GENUINE',
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

export function getMockSignatureAnalysisAssets(templateNumber: number, viewMode: SignatureAnalysisViewMode = 'Heatmap'): SignatureAnalysisViewAssets {
  if (templateNumber >= 1 && templateNumber <= 3) {
    return SAMPLE_SIGNATURE_ANALYSIS_ASSET_MAP[templateNumber][viewMode];
  }

  return GENERIC_SIGNATURE_ANALYSIS_ASSETS;
}

export function getMockSignatureAnalysisPdf(templateNumber: number): any | null {
  // Map mock templates to the bundled PDF sequence Case001 -> Case003.
  const pdfMap: Record<number, any> = {
    1: require('../../assets/expo.icon/Assets/SampleTest/pdf/Case001.pdf'),
    2: require('../../assets/expo.icon/Assets/SampleTest/pdf/Case002.pdf'),
    3: require('../../assets/expo.icon/Assets/SampleTest/pdf/Case003.pdf'),
  };

  const normalizedTemplateNumber = ((templateNumber - 1) % 3 + 3) % 3 + 1;

  try {
    return pdfMap[normalizedTemplateNumber] ?? pdfMap[1] ?? null;
  } catch (e) {
    return null;
  }
}