# API Contract: Cases and 4+1 Signature Pictures

This document defines the endpoints and data types for:
- Case management
- Signature uploads (4 references + 1 suspect)
- Analysis lifecycle and results

## Type Definitions

```ts
export type AnalysisPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type AnalysisType = 'SIG' | 'HW' | 'DOC';
export type CaseStatus = 'Processing' | 'Completed' | 'Suspect' | 'Genuine';

export type UploadKind = 'reference' | 'suspect';

export interface DraftUploads {
  // Exactly 4 slots for reference signatures. Missing slots are null.
  references: Array<string | null>; // length = 4
  // Single suspect signature file URI/path/URL
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
  createdAt: string; // ISO 8601 date-time string
  status: CaseStatus;
  analysisType: AnalysisType;
  resultViewed?: boolean;
}

export interface SignatureItem {
  index?: number; // 0..3 for references, omitted for suspect
  uri: string;
  uploadedAt: string; // ISO 8601 date-time string
  size: number; // bytes
  mimeType?: string; // e.g. image/jpeg, image/png
}

export interface AnalysisResult {
  conclusion: 'Genuine' | 'Suspect' | 'Inconclusive';
  confidence: number; // 0..100
  details: string;
  processedAt: string; // ISO 8601 date-time string
}
```

## Endpoints

## Cases

### GET /api/cases
List cases with optional filters.

Query params:
- `status?: CaseStatus`
- `priority?: AnalysisPriority`
- `analysisType?: AnalysisType`
- `page?: number`
- `pageSize?: number`

Response:

```ts
{
  cases: SavedCase[];
  total: number;
  page: number;
  pageSize: number;
}
```

### GET /api/cases/:caseId
Get one case by ID.

Response:

```ts
{ case: SavedCase }
```

### POST /api/cases
Create a case.

Request body:

```ts
{
  subjectName: string;
  examiner: string;
  documentType: string;
  priority: AnalysisPriority;
  analysisType: AnalysisType;
}
```

Response:

```ts
{ case: SavedCase }
```

### PUT /api/cases/:caseId
Update case metadata.

Request body:

```ts
{
  subjectName?: string;
  examiner?: string;
  documentType?: string;
  priority?: AnalysisPriority;
}
```

Response:

```ts
{ case: SavedCase }
```

### PATCH /api/cases/:caseId/status
Update processing status.

Request body:

```ts
{ status: CaseStatus }
```

Response:

```ts
{ caseId: string; status: CaseStatus }
```

### PATCH /api/cases/:caseId/result-viewed
Mark result as viewed.

Request body:

```ts
{ resultViewed: boolean }
```

Response:

```ts
{ caseId: string; resultViewed: boolean }
```

### DELETE /api/cases/:caseId
Delete (or archive) case.

Response:

```ts
{ caseId: string; deleted: boolean }
```

## Draft Cases

### GET /api/cases/drafts
Response:

```ts
{ drafts: DraftCase[] }
```

### POST /api/cases/drafts
Request body:

```ts
DraftCase
```

Response:

```ts
{ draft: DraftCase }
```

### PUT /api/cases/drafts/:caseId
Request body:

```ts
Partial<DraftCase>
```

Response:

```ts
{ draft: DraftCase }
```

### DELETE /api/cases/drafts/:caseId
Response:

```ts
{ caseId: string; deleted: boolean }
```

## Signature Uploads (4+1)

## References (4)

### POST /api/cases/:caseId/signatures/reference
Upload one reference image.

Request body (multipart/form-data):
- `file: File`
- `index: number` (0..3)

Response:

```ts
{
  caseId: string;
  type: 'reference';
  signature: SignatureItem; // includes index
}
```

### GET /api/cases/:caseId/signatures/reference/:index
Response:

```ts
{
  caseId: string;
  type: 'reference';
  signature: SignatureItem;
}
```

### DELETE /api/cases/:caseId/signatures/reference/:index
Response:

```ts
{ caseId: string; type: 'reference'; index: number; deleted: boolean }
```

## Suspect (1)

### POST /api/cases/:caseId/signatures/suspect
Upload suspect image.

Request body (multipart/form-data):
- `file: File`

Response:

```ts
{
  caseId: string;
  type: 'suspect';
  signature: SignatureItem;
}
```

### GET /api/cases/:caseId/signatures/suspect
Response:

```ts
{
  caseId: string;
  type: 'suspect';
  signature: SignatureItem | null;
}
```

### DELETE /api/cases/:caseId/signatures/suspect
Response:

```ts
{ caseId: string; type: 'suspect'; deleted: boolean }
```

## Combined Signatures

### GET /api/cases/:caseId/signatures
Response:

```ts
{
  caseId: string;
  references: Array<SignatureItem | null>; // length = 4
  suspect: SignatureItem | null;
}
```

## Analysis

### POST /api/cases/:caseId/analysis
Start analysis.

Request body:

```ts
{
  mode: 'signature' | 'handwriting';
}
```

Response:

```ts
{ caseId: string; status: 'Processing' }
```

### GET /api/cases/:caseId/analysis/status
Response:

```ts
{ caseId: string; status: CaseStatus }
```

### GET /api/cases/:caseId/analysis/results
Response:

```ts
{
  caseId: string;
  analysisType: AnalysisType;
  result: AnalysisResult;
}
```

### PUT /api/cases/:caseId/analysis/results
Request body:

```ts
{
  result: AnalysisResult;
}
```

Response:

```ts
{
  caseId: string;
  updated: boolean;
}
```
