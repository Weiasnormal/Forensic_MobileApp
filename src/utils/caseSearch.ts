import { formatAnalysisTypeLabel, type SavedCase } from '../store/caseStore';

export function normalizeCaseSearchQuery(query: string) {
	return query.trim().toLowerCase();
}

export function caseMatchesSearch(item: SavedCase, normalizedQuery: string) {
	if (!normalizedQuery) {
		return true;
	}

	return [
		item.caseId,
		item.subjectName,
		item.examiner,
		item.documentType,
		item.priority,
		formatAnalysisTypeLabel(item.analysisType),
	].some((value) => value.toLowerCase().includes(normalizedQuery));
}
