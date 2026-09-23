import type { SavedCase } from "../store/caseStore";

export function normalizeCaseSearchQuery(query: string) {
  return query.trim().toLowerCase();
}

type CaseSearchRole = "admin" | "user";

export function caseMatchesSearch(
  item: SavedCase,
  normalizedQuery: string,
  role: CaseSearchRole,
) {
  if (!normalizedQuery) {
    return true;
  }

  const date = new Date(item.createdAt);
  const dateValues = [
    item.createdAt,
    Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString(),
    Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10),
  ];
  const verdictValues = [
    item.status === "Genuine" ? "genuine" : "",
    item.status === "Suspected" ? "suspected" : "",
    item.verdict,
    item.Verdict,
  ];
  const workflowValues =
    role === "admin"
      ? [item.workflowStatus === "PendingReview" ? "pending" : ""]
      : [item.workflowStatus === "Processing" ? "processing" : ""];

  return [
    item.caseId,
    item.caseCode,
    item.subjectName,
    item.examiner,
    item.documentType,
    item.priority,
    ...dateValues,
    ...verdictValues,
    ...workflowValues,
  ].some(
    (value): value is string =>
      typeof value === "string" &&
      value.toLowerCase().includes(normalizedQuery),
  );
}
