// Placeholder data for the Admin Home screen's "Member Requests" and
// "Pending Reviews" cards — mirrors the INITIAL_CASES seed pattern already
// used in caseStore.ts.
//
// Swap these out once the real endpoints exist:
//   - Member Requests -> GET /admin/team (filter status === 'pending'), see adminStore.ts
//   - Pending Reviews  -> a real "cases awaiting admin sign-off" queue endpoint
//     (no equivalent exists yet; Case.Status only has Processing/Completed/Suspect/Genuine)

// type-only import — erased at compile time, so this does not create a
// runtime circular dependency with adminStore.ts (which imports the
// value below).
import type { TeamMember } from '@/store/adminStore';

function daysAgoIso(days: number) {
	return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

// Full mock roster — backs both the "Member Requests" and "Team Overview"
// sections on Home and Team Management until GET /admin/team is real.
// Names/case counts match the Team Management design directly.
export const MOCK_TEAM_MEMBERS: TeamMember[] = [
	{ id: 'member-request-1', firstName: 'Samuel', lastName: 'Plates', email: 'samuel.plates@pnp.gov.ph', role: 'Analyst', status: 'pending', casesHandled: 0, joinedAt: daysAgoIso(3) },
	{ id: 'member-request-2', firstName: 'Samuel', lastName: 'Plates', email: 'samuel.plates2@pnp.gov.ph', role: 'Analyst', status: 'pending', casesHandled: 0, joinedAt: daysAgoIso(3) },
	{ id: 'team-anita-giones', firstName: 'Anita', lastName: 'Giones', email: 'anita.giones@pnp.gov.ph', role: 'Analyst', status: 'active', casesHandled: 11, joinedAt: daysAgoIso(180) },
	{ id: 'team-becky-nueman', firstName: 'Becky', lastName: 'Nueman', email: 'becky.nueman@pnp.gov.ph', role: 'Analyst', status: 'active', casesHandled: 3, joinedAt: daysAgoIso(140) },
	{ id: 'team-diana-zaldy', firstName: 'Diana', lastName: 'Zaldy', email: 'diana.zaldy@pnp.gov.ph', role: 'Analyst', status: 'active', casesHandled: 3, joinedAt: daysAgoIso(120) },
	{ id: 'team-john-delacruz', firstName: 'John', lastName: 'de la Cruz', email: 'john.delacruz@pnp.gov.ph', role: 'Analyst', status: 'active', casesHandled: 45, joinedAt: daysAgoIso(300) },
	{ id: 'team-justin-martinez', firstName: 'Justin', lastName: 'Martinez', email: 'justin.martinez@pnp.gov.ph', role: 'Analyst', status: 'active', casesHandled: 8, joinedAt: daysAgoIso(210) },
	{ id: 'team-marie-santos', firstName: 'Marie', lastName: 'Santos', email: 'marie.santos@pnp.gov.ph', role: 'Analyst', status: 'active', casesHandled: 34, joinedAt: daysAgoIso(260) },
	{ id: 'team-patrick-zomuales', firstName: 'Patrick', lastName: 'Zomuales', email: 'patrick.zomuales@pnp.gov.ph', role: 'Analyst', status: 'active', casesHandled: 17, joinedAt: daysAgoIso(230) },
];

// Derived, not hardcoded, so Home's stat card and Team's roster can never
// silently drift apart the way two independent mock lists would.
export const MOCK_ACTIVE_ANALYSTS_COUNT = MOCK_TEAM_MEMBERS.filter((member) => member.status === 'active').length;

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