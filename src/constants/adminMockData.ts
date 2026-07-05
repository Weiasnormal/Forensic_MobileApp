// Placeholder data for the Admin Home screen's "Member Requests" and
// "Pending Reviews" cards — mirrors the INITIAL_CASES seed pattern already
// used in caseStore.ts.
//
// Swap these out once the real endpoints exist:
//   - Member Requests -> GET /admin/team (filter status === 'pending'), see adminStore.ts
//   - Pending Reviews  -> a real "cases awaiting admin sign-off" queue endpoint
//     (no equivalent exists yet; Case.Status only has Processing/Completed/Suspect/Genuine)

export interface MockMemberRequest {
	id: string;
	firstName: string;
	lastName: string;
	timeAgo: string;
}

export const MOCK_MEMBER_REQUESTS: MockMemberRequest[] = [
	{ id: 'member-request-1', firstName: 'Samuel', lastName: 'Plates', timeAgo: '3 days ago' },
	{ id: 'member-request-2', firstName: 'Samuel', lastName: 'Plates', timeAgo: '3 days ago' },
];

export interface MockPendingReview {
	id: string;
	caseCode: string;
	examiner: string;
	dateLabel: string;
	verdictLabel: string;
	confidence: number;
}

export const MOCK_PENDING_REVIEWS: MockPendingReview[] = [
	{ id: 'pending-review-1', caseCode: '0429-2026-002', examiner: 'Anita Giones', dateLabel: 'Mar 29', verdictLabel: 'Suspect', confidence: 91.6 },
	{ id: 'pending-review-2', caseCode: '0429-2026-002', examiner: 'Anita Giones', dateLabel: 'Mar 29', verdictLabel: 'Suspect', confidence: 91.6 },
	{ id: 'pending-review-3', caseCode: '0429-2026-002', examiner: 'Anita Giones', dateLabel: 'Mar 29', verdictLabel: 'Suspect', confidence: 91.6 },
	{ id: 'pending-review-4', caseCode: '0429-2026-002', examiner: 'Anita Giones', dateLabel: 'Mar 29', verdictLabel: 'Suspect', confidence: 91.6 },
	{ id: 'pending-review-5', caseCode: '0429-2026-002', examiner: 'Anita Giones', dateLabel: 'Mar 29', verdictLabel: 'Suspect', confidence: 91.6 },
];

// Used as a stat-card fallback while /admin/team isn't implemented yet.
export const MOCK_ACTIVE_ANALYSTS_COUNT = 10;