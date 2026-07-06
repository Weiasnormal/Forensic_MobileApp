import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
	ActivityIndicator,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { formatRelativeTime, useAdminStore } from '@/store/adminStore';
import { MemberRequestCard, TeamOverviewCard, type MemberRequestData, type TeamOverviewData } from './cards';

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
		<View style={styles.screen}>
			<StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

			<View style={styles.header}>
				<Text style={styles.pageTitle}>Team Management</Text>

				<View style={styles.searchBox}>
					<Ionicons name="search" size={18} color="#94A3B8" />
					<TextInput
						value={query}
						onChangeText={setQuery}
						placeholder="Search by name..."
						placeholderTextColor="#94A3B8"
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
						<ActivityIndicator color="#1E6FD9" />
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
						<ActivityIndicator color="#1E6FD9" />
					</View>
				) : roster.length > 0 ? (
					<View style={styles.rosterCard}>
						{roster.map((member, index) => (
							<TeamOverviewCard key={member.id} member={member} showDivider={index < roster.length - 1} />
						))}
					</View>
				) : (
					<View style={styles.emptyMini}>
						<Text style={styles.emptyMiniText}>No analysts match your search.</Text>
					</View>
				)}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: '#F8FAFC',
	},
	header: {
		backgroundColor: '#FFFFFF',
		paddingTop: 10,
		paddingHorizontal: 16,
		paddingBottom: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#E2E8F0',
	},
	pageTitle: {
		color: '#0F172A',
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
		backgroundColor: '#F8FAFC',
		borderWidth: 1,
		borderColor: '#E6EEF9',
		marginBottom: 12,
	},
	searchInput: {
		flex: 1,
		color: '#0F172A',
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
		borderColor: '#E6EEF9',
		backgroundColor: '#FFFFFF',
	},
	chipActive: {
		backgroundColor: '#1E6FD9',
		borderColor: '#1E6FD9',
	},
	chipText: {
		color: '#475569',
		fontSize: 12,
		fontWeight: '700',
	},
	chipTextActive: {
		color: '#FFFFFF',
	},
	content: {
		paddingHorizontal: 16,
		paddingTop: 16,
		paddingBottom: 120,
	},
	sectionLabel: {
		color: '#A3B0C4',
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
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		borderWidth: 1,
		borderColor: '#E3EAF3',
		marginBottom: 22,
		overflow: 'hidden',
	},
	emptyMini: {
		backgroundColor: '#FFFFFF',
		borderRadius: 14,
		borderWidth: 1,
		borderColor: '#E3EAF3',
		padding: 16,
		alignItems: 'center',
		marginBottom: 22,
	},
	emptyMiniText: {
		color: '#94A3B8',
		fontSize: 12,
		fontWeight: '600',
	},
	loadingRow: {
		paddingVertical: 20,
		alignItems: 'center',
		marginBottom: 22,
	},
});