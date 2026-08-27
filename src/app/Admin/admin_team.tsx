import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { formatRelativeTime, useAdminStore } from '@/store/adminStore';
import { MemberRequestCard, TeamOverviewCard, type MemberRequestData, type TeamOverviewData } from './cards';
import { ScreenStatusBar } from '@/_components/common/ScreenStatusBar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { router } from 'expo-router';

const sortOptions = ['Alphabetical (A-Z)', 'Most Cases', 'Least Cases'] as const;
type SortOption = (typeof sortOptions)[number];

export default function AdminTeamScreen() {
	const [query, setQuery] = useState('');
	const [sortBy, setSortBy] = useState<SortOption>('Alphabetical (A-Z)');

	const teamMembers = useAdminStore((state) => state.teamMembers);
	const pendingApprovals = useAdminStore((state) => state.pendingApprovals);
	const isLoadingTeam = useAdminStore((state) => state.isLoadingTeam);
	const fetchTeamMembers = useAdminStore((state) => state.fetchTeamMembers);
	const approveTeamMember = useAdminStore((state) => state.approveTeamMember);
	const rejectTeamMember = useAdminStore((state) => state.rejectTeamMember);

	useEffect(() => {
		fetchTeamMembers();
	}, []);

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

	const roster: TeamOverviewData[] = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		const activeMembers = teamMembers
			.filter((member) => member.status === 'active')
			.filter((member) => {
				if (!normalizedQuery) return true;
				return `${member.firstName} ${member.lastName}`.toLowerCase().includes(normalizedQuery);
			});

		const sorted = [...activeMembers].sort((left, right) => {
			if (sortBy === 'Most Cases') return right.casesHandled - left.casesHandled;
			if (sortBy === 'Least Cases') return left.casesHandled - right.casesHandled;
			return `${left.firstName}${left.lastName}`.localeCompare(`${right.firstName}${right.lastName}`);
		});

		return sorted.map((member) => ({
			id: member.id,
			firstName: member.firstName,
			lastName: member.lastName,
			casesHandled: member.casesHandled,
		}));
	}, [teamMembers, query, sortBy]);

	return (
		<SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
			<ScreenStatusBar variant="onLight" />

			<View style={styles.header}>
				<Text style={styles.pageTitle}>Team Management</Text>

				<View style={styles.searchBox}>
					<Ionicons name="search" size={18} color={colors.label} />
					<TextInput
						value={query}
						onChangeText={setQuery}
						placeholder="Search by name..."
						placeholderTextColor={colors.label}
						style={styles.searchInput}
					/>
				</View>

				<View style={styles.chipsRow}>
					{sortOptions.map((option) => {
						const active = sortBy === option;
						return (
							<TouchableOpacity
								key={option}
								style={[styles.chip, active && styles.chipActive]}
								onPress={() => setSortBy(option)}
								activeOpacity={0.86}
							>
								<Text style={[styles.chipText, active && styles.chipTextActive]}>{option}</Text>
							</TouchableOpacity>
						);
					})}
				</View>
			</View>

			<ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
				<Text style={styles.sectionLabel}>Member Requests</Text>

				{isLoadingTeam ? (
					<View style={styles.loadingRow}>
						<ActivityIndicator color={colors.primary} />
					</View>
				) : memberRequests.length > 0 ? (
					<View style={styles.listGroup}>
						{memberRequests.map((request) => (
							<MemberRequestCard
								key={request.id}
								request={request}
								onApprove={approveTeamMember}
								onReject={rejectTeamMember}
							/>
						))}
					</View>
				) : (
					<View style={styles.emptyMini}>
						<Text style={styles.emptyMiniText}>No pending member requests.</Text>
					</View>
				)}

				<Text style={styles.sectionLabel}>Team Overview</Text>

				{isLoadingTeam ? (
					<View style={styles.loadingRow}>
						<ActivityIndicator color={colors.primary} />
					</View>
				) : roster.length > 0 ? (
					<View style={styles.rosterCard}>
						{roster.map((member, index) => (
							<TeamOverviewCard 
							key={member.id}
							member={member}
							showDivider={index < roster.length - 1}
							onPress={() => router.push({ pathname: '/Admin/profileScreens/MemberDetailsScreen', params: { memberId: member.id } })}
							/>
						))}
					</View>
				) : (
					<View style={styles.emptyMini}>
						<Text style={styles.emptyMiniText}>No analysts match your search.</Text>
					</View>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: colors.background,
		top: 30,
	  },
	header: {
		backgroundColor: colors.background2,
		paddingTop: 10,
		paddingHorizontal: 16,
		paddingBottom: 12,
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
	},
	pageTitle: {
		color: colors.textPrimary,
		fontSize: 24,
		fontWeight: '900',
		letterSpacing: -0.6,
		marginBottom: 12,
	},
	searchBox: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		minHeight: 44,
		paddingHorizontal: 14,
		borderRadius: 12,
		backgroundColor: colors.background,
		borderWidth: 1,
		borderColor: colors.border,
		marginBottom: 12,
	},
	searchInput: {
		flex: 1,
		color: '#757575',
		fontSize: 14,
		fontWeight: '500',
	},
	chipsRow: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	chip: {
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: colors.border,
		backgroundColor: colors.background2,
	},
	chipActive: {
		backgroundColor: colors.primary,
		borderColor: colors.primary,
	},
	chipText: {
		color: '#64748B',
		fontSize: 12,
		fontWeight: '700',
	},
	chipTextActive: {
		color: colors.primaryText,
	},
	content: {
		paddingHorizontal: 16,
		paddingTop: 16,
		paddingBottom: 120,
	},
	sectionLabel: {
		color: colors.label,
		fontSize: 13,
		fontWeight: '800',
		letterSpacing: 0.3,
		marginBottom: 10,
	},
	listGroup: {
		gap: 10,
		marginBottom: 22,
	},
	rosterCard: {
		backgroundColor: colors.background2,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: colors.border,
		marginBottom: 22,
		overflow: 'hidden',
	},
	emptyMini: {
		backgroundColor: colors.background2,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: colors.border,
		padding: 16,
		alignItems: 'center',
		marginBottom: 22,
	},
	emptyMiniText: {
		color: colors.label,
		fontSize: 12,
		fontWeight: '600',
	},
	loadingRow: {
		paddingVertical: 20,
		alignItems: 'center',
		marginBottom: 22,
	},
});