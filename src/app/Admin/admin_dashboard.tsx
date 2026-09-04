import { getCaseSummary, useCaseStore } from '@/store/caseStore';
import { formatRelativeTime, getTeamSummary, useAdminStore } from '@/store/adminStore';
import { useUser } from '@/store/userStore';
import { MOCK_PENDING_REVIEWS, type MockPendingReview } from '@/constants/adminMockData';
import { Ionicons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AdminNavbar, { type AdminTabKey } from '@/_components/admin/AdminNavbar';
import { colors } from '@/constants/colors';
import { MemberRequestCard, PendingReviewCard, type MemberRequestData } from './cards';
import AdminCasesScreen from './admin_cases';
import AdminTeamScreen from './admin_team';
import AdminStatsScreen from './admin_stats';
import ProfileScreen from './ProfileScreen';
import { ScreenStatusBar } from '@/_components/common/ScreenStatusBar';
import { useAuthStore } from '@/store/authStore';
import { useFeedbackStore } from '@/store/feedbackStore';

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
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const [activeTab, setActiveTab] = useState<AdminTabKey>(resolveTabValue(params.tab));
	const [notificationsEnabled, setNotificationsEnabled] = useState(true);
	const [autoExportEnabled, setAutoExportEnabled] = useState(false);

	const { user, load } = useUser();
	const cases = useCaseStore((state) => state.cases);
	const refreshCasesFromBackend = useCaseStore((state) => state.refreshCasesFromBackend);

	const teamMembers = useAdminStore((state) => state.teamMembers);
	const pendingApprovals = useAdminStore((state) => state.pendingApprovals);
	const fetchTeamMembers = useAdminStore((state) => state.fetchTeamMembers);
	const approveTeamMember = useAdminStore((state) => state.approveTeamMember);
	const rejectTeamMember = useAdminStore((state) => state.rejectTeamMember);

	useEffect(() => {
		setActiveTab(resolveTabValue(params.tab));
	}, [params.tab]);

	useEffect(() => {
		load();
		refreshCasesFromBackend();
		fetchTeamMembers();
	},);

	useEffect(() => {
		if (Platform.OS !== 'android') return;
		NavigationBar.setBackgroundColorAsync(colors.background2).catch(() => {});
		NavigationBar.setButtonStyleAsync('dark').catch(() => {});
	}, [activeTab]);

	const { totalCases, suspectCount } = getCaseSummary(cases);
	const { activeCount } = getTeamSummary(teamMembers);

	const memberRequests: MemberRequestData[] = useMemo(
		() =>
			pendingApprovals.map((member) => ({
				id: member.id,
				firstName: member.firstName,
				lastName: member.lastName,
				timeAgo: formatRelativeTime(member.joinedAt),
			})),
		[pendingApprovals],
	);

	const handleToggleNotifications = (value: boolean) => {
	setNotificationsEnabled(value);
	useFeedbackStore.getState().showToast(
		value ? 'Notifications enabled' : 'Notifications disabled',
		'successLight',
	);
	};

	const handleToggleAutoExport = (value: boolean) => {
	setAutoExportEnabled(value);
	useFeedbackStore.getState().showToast(
		value ? 'Auto-export reports enabled' : 'Auto-export reports disabled',
		'successLight',
	);
	};
	return (
		<SafeAreaView edges={['left', 'right']} style={styles.screen}>
			<ScreenStatusBar variant="onLight" />

			{activeTab === 'home' ? (
				<View style={[styles.homeHeader, { paddingTop: insets.top + 18 }]}>
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
						activeAnalysts={activeCount}
						memberRequests={memberRequests}
						onApproveRequest={approveTeamMember}
						onRejectRequest={rejectTeamMember}
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
				<ProfileScreen
					initials={getInitials(user?.firstName || '', user?.lastName || '')}
					name={`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Admin'}
					role="Admin"
					organization={user?.organization || 'PNP Crime Laboratory'}
					appVersion="v1.0.0"
					notificationsEnabled={notificationsEnabled}
					autoExportEnabled={autoExportEnabled}
					onEditProfilePress={() => router.push('/Admin/profileScreens/EditProfileScreen')}
					onChangePasswordPress={() => router.push('/User/pages/ChangePasswordScreen')}
					onOrganizationPress={() => router.push('/Admin/profileScreens/OrganizationScreen')}
					onOrgInviteCodePress={() => router.push('/Admin/profileScreens/OrgInviteCodeScreen')}
					onManageTeamPress={() => setActiveTab('team')}
					onOrganizationStatsPress={() => setActiveTab('stats')}
					onToggleNotifications={handleToggleNotifications}
					onToggleAutoExport={handleToggleAutoExport}
					onHelpSupportPress={() => router.push('/Admin/profileScreens/HelpSupportScreen')}
					onSignOutPress={async () => {
						await useAuthStore.getState().logout();
						router.replace('/_login/SignInPage');
					}}
				/>
			)}

			<AdminNavbar activeTab={activeTab} onTabChange={setActiveTab} />
		</SafeAreaView>
	);
}

function AdminHomeTab({
	totalCases,
	suspectCount,
	activeAnalysts,
	memberRequests,
	onApproveRequest,
	onRejectRequest,
	onViewTeam,
	onViewAllCases,
}: {
	totalCases: number;
	suspectCount: number;
	activeAnalysts: number;
	memberRequests: MemberRequestData[];
	onApproveRequest: (id: string) => void;
	onRejectRequest: (id: string) => void;
	onViewTeam: () => void;
	onViewAllCases: () => void;
}) {
	const [pendingReviews] = useState<MockPendingReview[]>(MOCK_PENDING_REVIEWS);

	return (
		<View style={styles.paddedSection}>
			<View style={styles.statsGrid}>
				<View style={styles.statsGridRow}>
					<StatCard label="Active Analysts" value={String(activeAnalysts)} icon="people-outline" tint="#1E6FD9" />
					<StatCard label="Total Cases" value={String(totalCases)} icon="folder-open-outline" tint="#1E6FD9" />
				</View>
				<View style={styles.statsGridRow}>
					<StatCard label="Pending Review" value={String(pendingReviews.length)} icon="shield-checkmark-outline" tint="#D97706" />
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
						<MemberRequestCard
							key={member.id}
							request={member}
							onApprove={onApproveRequest}
							onReject={onRejectRequest}
						/>
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
						<PendingReviewCard key={review.id} review={review} onReview={() => onViewAllCases()} />
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
	tint = colors.primary,
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
		backgroundColor: colors.background2,
	},
	homeHeader: {
		backgroundColor: colors.background2,
		paddingHorizontal: 16,
		paddingBottom: 12,
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
	},
	homeHeaderTop: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	homeGreeting: {
		color: colors.textPrimary,
		fontSize: 22,
		fontWeight: '900',
		letterSpacing: -0.5,
	},
	homeAvatarCircle: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: colors.primary,
		alignItems: 'center',
		justifyContent: 'center',
	},
	homeAvatarText: {
		color: '#E7F2FF',
		fontSize: 18,
		fontWeight: '800',
	},
	homeOrgText: {
		color: colors.textSecondary,
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
		backgroundColor: colors.background,
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
		backgroundColor: colors.cardBackground,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: colors.border,
		padding: 14,
		width: 175,
		height: 137,
	},
	statIconWrap: {
		width: 45,
		height: 45,
		borderRadius: 11,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 10,
	},
	statValue: {
		color: colors.textPrimary,
		fontSize: 22,
		fontWeight: '900',
		letterSpacing: -0.5,
	},
	statLabel: {
		marginTop: 2,
		color: colors.label,
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
		color: colors.label,
	},
	sectionLink: {
		fontSize: 12,
		color: colors.primary,
		fontWeight: '700',
	},
	listGroup: {
		gap: 10,
		marginBottom: 18,
	},
	emptyMini: {
		backgroundColor: colors.background2,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: colors.border,
		padding: 16,
		alignItems: 'center',
		marginBottom: 18,
	},
	emptyMiniText: {
		color: colors.textSecondary,
		fontSize: 12,
		fontWeight: '600',
	},
});