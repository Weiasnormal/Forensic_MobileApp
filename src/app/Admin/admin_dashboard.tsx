import { getCaseSummary, useCaseStore } from '@/store/caseStore';
import { getTeamSummary, useAdminStore } from '@/store/adminStore';
import { useUser } from '@/store/userStore';
import { MOCK_ACTIVE_ANALYSTS_COUNT, MOCK_MEMBER_REQUESTS, MOCK_PENDING_REVIEWS, type MockMemberRequest, type MockPendingReview } from '@/constants/adminMockData';
import { Ionicons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdminNavbar, { type AdminTabKey } from './_navbar/admin_nav_bar';
import AdminCasesScreen from './admin_cases';
import AdminTeamScreen from './admin_team';
import AdminStatsScreen from './admin_stats';
import AdminProfileScreen from './admin_profile';

const TAB_KEYS: AdminTabKey[] = ['home', 'cases', 'team', 'stats', 'profile'];

function resolveTabValue(value: string | string[] | undefined): AdminTabKey {
	const candidate = Array.isArray(value) ? value[0] : value;
	if (candidate && TAB_KEYS.includes(candidate as AdminTabKey)) {
		return candidate as AdminTabKey;
	}
	return 'home';
}

function getInitials(first = '', last = '') {
	return ((first[0] || '') + (last[0] || '')).toUpperCase();
}

export default function AdminDashboard() {
	const params = useLocalSearchParams<{ tab?: string | string[] }>();
	const [activeTab, setActiveTab] = useState<AdminTabKey>(resolveTabValue(params.tab));

	const { user, load } = useUser();
	const cases = useCaseStore((state) => state.cases);
	const refreshCasesFromBackend = useCaseStore((state) => state.refreshCasesFromBackend);

	const teamMembers = useAdminStore((state) => state.teamMembers);
	const fetchTeamMembers = useAdminStore((state) => state.fetchTeamMembers);

	useEffect(() => {
		setActiveTab(resolveTabValue(params.tab));
	}, [params.tab]);

	useEffect(() => {
		load();
		refreshCasesFromBackend();
		fetchTeamMembers();
	}, []);

	useEffect(() => {
		if (Platform.OS !== 'android') return;
		NavigationBar.setBackgroundColorAsync('#FFFFFF').catch(() => {});
		NavigationBar.setButtonStyleAsync('dark').catch(() => {});
	}, [activeTab]);

	const { totalCases, suspectCount } = getCaseSummary(cases);
	const { activeCount } = getTeamSummary(teamMembers);
	const activeAnalystsValue = teamMembers.length > 0 ? activeCount : MOCK_ACTIVE_ANALYSTS_COUNT;

	return (
		<SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
			<StatusBar style="dark" backgroundColor="#ffffff" />

			{activeTab === 'home' ? (
				<View style={styles.homeHeader}>
					<View style={styles.homeHeaderTop}>
						<View>
							<Text style={styles.homeOrgText}>{user?.organization || 'PNP Crime Laboratory'}</Text>
							<Text style={styles.homeGreeting}>Hello, Admin {user?.lastName}</Text>
						</View>
						<View style={styles.homeAvatarCircle}>
							{user && user.avatarUri ? (
								<Image source={{ uri: user.avatarUri }} style={{ width: 44, height: 44, borderRadius: 22 }} />
							) : (
								<Text style={styles.homeAvatarText}>{getInitials(user?.firstName || '', user?.lastName || '')}</Text>
							)}
						</View>
					</View>
				</View>
			) : null}

			{activeTab === 'home' ? (
				<ScrollView
					style={styles.scrollView}
					contentContainerStyle={[styles.scrollArea, styles.homeScrollArea]}
					showsVerticalScrollIndicator={false}
				>
					<AdminHomeTab
						totalCases={totalCases}
						suspectCount={suspectCount}
						activeAnalysts={activeAnalystsValue}
						pendingReviewCount={MOCK_PENDING_REVIEWS.length}
						onViewTeam={() => setActiveTab('team')}
						onViewAllCases={() => setActiveTab('cases')}
					/>
				</ScrollView>
			) : activeTab === 'cases' ? (
				<AdminCasesScreen />
			) : activeTab === 'team' ? (
				<AdminTeamScreen />
			) : activeTab === 'stats' ? (
				<AdminStatsScreen />
			) : (
				<AdminProfileScreen onNavigateTab={setActiveTab} />
			)}

			<AdminNavbar activeTab={activeTab} onTabChange={setActiveTab} />
		</SafeAreaView>
	);
}

function AdminHomeTab({
	totalCases,
	suspectCount,
	activeAnalysts,
	pendingReviewCount,
	onViewTeam,
	onViewAllCases,
}: {
	totalCases: number;
	suspectCount: number;
	activeAnalysts: number;
	pendingReviewCount: number;
	onViewTeam: () => void;
	onViewAllCases: () => void;
}) {
	const [memberRequests, setMemberRequests] = useState<MockMemberRequest[]>(MOCK_MEMBER_REQUESTS);
	const [pendingReviews, setPendingReviews] = useState<MockPendingReview[]>(MOCK_PENDING_REVIEWS);

	const handleApproveRequest = (id: string) => {
		setMemberRequests((current) => current.filter((item) => item.id !== id));
	};

	const handleRejectRequest = (id: string) => {
		setMemberRequests((current) => current.filter((item) => item.id !== id));
	};

	return (
		<View style={styles.paddedSection}>
			<View style={styles.statsGrid}>
				<View style={styles.statsGridRow}>
					<StatCard label="Active Analysts" value={String(activeAnalysts)} icon="people-outline" tint="#1E6FD9" />
					<StatCard label="Total Cases" value={String(totalCases)} icon="folder-open-outline" tint="#1E6FD9" />
				</View>
				<View style={styles.statsGridRow}>
					<StatCard label="Pending Review" value={String(pendingReviewCount)} icon="shield-checkmark-outline" tint="#D97706" />
					<StatCard label="Suspected Cases" value={String(suspectCount)} icon="reader-outline" tint="#E24B4A" />
				</View>
			</View>

			<View style={styles.sectionHeader}>
				<Text style={styles.sectionTitle}>Member Requests</Text>
				<TouchableOpacity onPress={onViewTeam}>
					<Text style={styles.sectionLink}>View all</Text>
				</TouchableOpacity>
			</View>

			{memberRequests.length > 0 ? (
				<View style={styles.listGroup}>
					{memberRequests.map((member) => (
						<View key={member.id} style={styles.requestRow}>
							<View style={styles.requestAvatar}>
								<Text style={styles.requestAvatarText}>{getInitials(member.firstName, member.lastName)}</Text>
							</View>
							<View style={{ flex: 1 }}>
								<Text style={styles.requestName}>{member.firstName} {member.lastName}</Text>
								<Text style={styles.requestTimeAgo}>{member.timeAgo}</Text>
							</View>
							<View style={styles.requestActions}>
								<TouchableOpacity
									style={[styles.iconButton, styles.iconButtonAccept]}
									onPress={() => handleApproveRequest(member.id)}
								>
									<Ionicons name="checkmark" size={18} color="#16A34A" />
								</TouchableOpacity>
								<TouchableOpacity
									style={[styles.iconButton, styles.iconButtonReject]}
									onPress={() => handleRejectRequest(member.id)}
								>
									<Ionicons name="close" size={18} color="#EF4444" />
								</TouchableOpacity>
							</View>
						</View>
					))}
				</View>
			) : (
				<View style={styles.emptyMini}>
					<Text style={styles.emptyMiniText}>No pending member requests.</Text>
				</View>
			)}

			<View style={styles.sectionHeader}>
				<Text style={styles.sectionTitle}>Pending Reviews</Text>
				<TouchableOpacity onPress={onViewAllCases}>
					<Text style={styles.sectionLink}>Manage</Text>
				</TouchableOpacity>
			</View>

			{pendingReviews.length > 0 ? (
				<View style={styles.listGroup}>
					{pendingReviews.map((review) => (
						<View key={review.id} style={styles.reviewRow}>
							<View style={styles.reviewAccent} />
							<View style={styles.reviewInfo}>
								<Text style={styles.reviewCaseCode}>{review.caseCode}</Text>
								<Text style={styles.reviewMeta}>{review.examiner} · {review.dateLabel}</Text>
								<Text style={styles.reviewVerdict}>{review.verdictLabel} · {review.confidence.toFixed(1)}%</Text>
							</View>
							<TouchableOpacity style={styles.reviewButton} onPress={onViewAllCases}>
								<Text style={styles.reviewButtonText}>Review</Text>
							</TouchableOpacity>
						</View>
					))}
				</View>
			) : (
				<View style={styles.emptyMini}>
					<Text style={styles.emptyMiniText}>No cases waiting for review.</Text>
				</View>
			)}
		</View>
	);
}

function StatCard({
	label,
	value,
	icon,
	tint = '#1E6FD9',
}: {
	label: string;
	value: string;
	icon: keyof typeof Ionicons.glyphMap;
	tint?: string;
}) {
	return (
		<View style={styles.statCard}>
			<View style={[styles.statIconWrap, { backgroundColor: `${tint}1A` }]}>
				<Ionicons name={icon} size={18} color={tint} />
			</View>
			<Text style={styles.statValue}>{value}</Text>
			<Text style={styles.statLabel}>{label}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: '#F8FAFC',
	},
	homeHeader: {
		backgroundColor: '#ffffff',
		paddingTop: Platform.OS === 'android' ? 18 : 20,
		paddingHorizontal: 16,
		paddingBottom: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#E2E8F0',
	},
	homeHeaderTop: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	homeGreeting: {
		color: '#0F172A',
		fontSize: 22,
		fontWeight: '900',
		letterSpacing: -0.5,
	},
	homeAvatarCircle: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: '#1E6FD9',
		alignItems: 'center',
		justifyContent: 'center',
	},
	homeAvatarText: {
		color: '#E7F2FF',
		fontSize: 18,
		fontWeight: '800',
	},
	homeOrgText: {
		color: '#64748B',
		fontSize: 13,
		fontWeight: '700',
	},
	scrollView: {
		flex: 1,
	},
	scrollArea: {
		paddingHorizontal: 0,
		paddingTop: 0,
		paddingBottom: 18,
		backgroundColor: '#F8FAFC',
	},
	homeScrollArea: {
		paddingTop: 14,
	},
	paddedSection: {
		paddingHorizontal: 16,
	},
	statsGrid: {
		gap: 10,
		marginBottom: 18,
	},
	statsGridRow: {
		flexDirection: 'row',
		gap: 10,
	},
	statCard: {
		flex: 1,
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		borderWidth: 1,
		borderColor: '#DDE6F2',
		padding: 14,
	},
	statIconWrap: {
		width: 34,
		height: 34,
		borderRadius: 11,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 10,
	},
	statValue: {
		color: '#111827',
		fontSize: 22,
		fontWeight: '900',
		letterSpacing: -0.5,
	},
	statLabel: {
		marginTop: 2,
		color: '#94A3B8',
		fontSize: 11,
		fontWeight: '700',
	},
	sectionHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 10,
	},
	sectionTitle: {
		fontSize: 14,
		fontWeight: '800',
		color: '#0F172A',
	},
	sectionLink: {
		fontSize: 12,
		color: '#185FA5',
		fontWeight: '700',
	},
	listGroup: {
		gap: 10,
		marginBottom: 18,
	},
	requestRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		backgroundColor: '#FFFFFF',
		borderRadius: 14,
		borderWidth: 1,
		borderColor: '#E3EAF3',
		padding: 12,
	},
	requestAvatar: {
		width: 38,
		height: 38,
		borderRadius: 19,
		backgroundColor: '#EAF3FF',
		alignItems: 'center',
		justifyContent: 'center',
	},
	requestAvatarText: {
		color: '#1E6FD9',
		fontWeight: '800',
		fontSize: 13,
	},
	requestName: {
		color: '#0F172A',
		fontSize: 13,
		fontWeight: '800',
	},
	requestTimeAgo: {
		color: '#94A3B8',
		fontSize: 11,
		fontWeight: '600',
		marginTop: 1,
	},
	requestActions: {
		flexDirection: 'row',
		gap: 8,
	},
	iconButton: {
		width: 34,
		height: 34,
		borderRadius: 17,
		alignItems: 'center',
		justifyContent: 'center',
	},
	iconButtonAccept: {
		backgroundColor: '#ECFDF3',
	},
	iconButtonReject: {
		backgroundColor: '#FEF1F1',
	},
	reviewRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		backgroundColor: '#FFFFFF',
		borderRadius: 14,
		borderWidth: 1,
		borderColor: '#E3EAF3',
		paddingVertical: 12,
		paddingHorizontal: 14,
		overflow: 'hidden',
	},
	reviewAccent: {
		position: 'absolute',
		left: 13,
		top: 12,
		bottom: 12,
		width: 3,
		borderRadius: 999,
		backgroundColor: '#1E6FD9',
	},
	reviewInfo: {
		flex: 1,
		paddingLeft: 6,
	},
	reviewCaseCode: {
		color: '#0F172A',
		fontSize: 13,
		fontWeight: '800',
		left: 6,
	},
	reviewMeta: {
		color: '#94A3B8',
		fontSize: 11,
		fontWeight: '600',
		marginTop: 2,
		left: 6,
	},
	reviewVerdict: {
		color: '#1E6FD9',
		fontSize: 11,
		fontWeight: '700',
		marginTop: 2,
		left: 6,
	},
	reviewButton: {
		backgroundColor: '#EAF3FF',
		borderRadius: 999,
		paddingHorizontal: 14,
		paddingVertical: 8,
	},
	reviewButtonText: {
		color: '#1E6FD9',
		fontSize: 12,
		fontWeight: '800',
	},
	emptyMini: {
		backgroundColor: '#FFFFFF',
		borderRadius: 14,
		borderWidth: 1,
		borderColor: '#E3EAF3',
		padding: 16,
		alignItems: 'center',
		marginBottom: 18,
	},
	emptyMiniText: {
		color: '#94A3B8',
		fontSize: 12,
		fontWeight: '600',
	},
});