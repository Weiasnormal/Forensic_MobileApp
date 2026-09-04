import { type SavedCase, useCaseStore } from '@/store/caseStore';
import { getTeamSummary, useAdminStore } from '@/store/adminStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';
import { AdminStatCard, TeamOverviewCard, type TeamOverviewData } from './cards';
import { colors } from '@/constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';

const TIME_RANGE_OPTIONS = ['Today', 'This Week', 'This Month', 'This Quarter', 'This Year'] as const;
type TimeRange = (typeof TIME_RANGE_OPTIONS)[number];

const DEFAULT_TIME_RANGE: TimeRange = 'This Year';

const GRANULARITY_OPTIONS = ['Hourly', 'Daily', 'Weekly', 'Monthly'] as const;
type ChartGranularity = (typeof GRANULARITY_OPTIONS)[number];
const DEFAULT_GRANULARITY: ChartGranularity = 'Weekly';

interface TrendBucket {
	label: string;
	start: Date;
	end: Date;
	genuine: number;
	suspected: number;
}

function getRangeStart(range: TimeRange, now: Date): Date {
	const start = new Date(now);

	switch (range) {
		case 'Today':
			start.setHours(0, 0, 0, 0);
			return start;
		case 'This Week':
			start.setDate(now.getDate() - 6);
			start.setHours(0, 0, 0, 0);
			return start;
		case 'This Month':
			return new Date(now.getFullYear(), now.getMonth(), 1);
		case 'This Quarter': {
			const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
			return new Date(now.getFullYear(), quarterStartMonth, 1);
		}
		case 'This Year':
		default:
			return new Date(now.getFullYear(), 0, 1);
	}
}

function filterCasesByRange(cases: SavedCase[], range: TimeRange): SavedCase[] {
	const start = getRangeStart(range, new Date());
	return cases.filter((item) => new Date(item.createdAt) >= start);
}

function buildTrendBuckets(cases: SavedCase[], granularity: ChartGranularity): TrendBucket[] {
	const now = new Date();
	const buckets: TrendBucket[] = [];

	if (granularity === 'Monthly') {
		for (let i = 5; i >= 0; i--) {
			const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
			const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
			buckets.push({ label: start.toLocaleDateString('en-US', { month: 'short' }), start, end, genuine: 0, suspected: 0 });
		}
	} else {
		const config: Record<'Hourly' | 'Daily' | 'Weekly', { count: number; stepHours: number }> = {
			Hourly: { count: 6, stepHours: 4 },
			Daily: { count: 7, stepHours: 24 },
			Weekly: { count: 5, stepHours: 24 * 7 },
		};
		const { count, stepHours } = config[granularity];
		const stepMs = stepHours * 60 * 60 * 1000;

		for (let i = count - 1; i >= 0; i--) {
			const end = new Date(now.getTime() - i * stepMs);
			const start = new Date(end.getTime() - stepMs + 1000);
			const label =
				granularity === 'Hourly'
					? end.toLocaleTimeString('en-US', { hour: 'numeric' })
					: granularity === 'Daily'
						? end.toLocaleDateString('en-US', { weekday: 'short' })
						: end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
			buckets.push({ label, start, end, genuine: 0, suspected: 0 });
		}
	}

	cases.forEach((item) => {
		const createdAt = new Date(item.createdAt).getTime();
		const bucket = buckets.find((entry) => createdAt >= entry.start.getTime() && createdAt <= entry.end.getTime());
		if (!bucket) return;
		if (item.status === 'Genuine') bucket.genuine += 1;
		else if (item.status === 'Suspected') bucket.suspected += 1;
	});

	return buckets;
}

export default function AdminStatsScreen() {
	const cases = useCaseStore((state) => state.cases);
	const refreshCasesFromBackend = useCaseStore((state) => state.refreshCasesFromBackend);
	const teamMembers = useAdminStore((state) => state.teamMembers);
	const fetchTeamMembers = useAdminStore((state) => state.fetchTeamMembers);

	const [timeRange, setTimeRange] = useState<TimeRange>(DEFAULT_TIME_RANGE);
	const [chartGranularity, setChartGranularity] = useState<ChartGranularity>(DEFAULT_GRANULARITY);

	const skeletonOpacity = useRef(new Animated.Value(0.5)).current;

	useEffect(() => {
		refreshCasesFromBackend();
		fetchTeamMembers();
	}, );

	const filteredCases = useMemo(() => filterCasesByRange(cases, timeRange), [cases, timeRange]);

	const summary = useMemo(() => {
		const totals = filteredCases.reduce(
			(accumulator, item) => {
				accumulator.total += 1;
				accumulator.genuine += item.status === 'Genuine' ? 1 : 0;
				accumulator.suspected += item.status === 'Suspected' ? 1 : 0;
				accumulator.documentTypeCounts[item.documentType] =
					(accumulator.documentTypeCounts[item.documentType] || 0) + 1;
				return accumulator;
			},
			{ total: 0, genuine: 0, suspected: 0, documentTypeCounts: {} as Record<string, number> },
		);

		const largestDocumentCount = Math.max(...Object.values(totals.documentTypeCounts), 1);

		const documentTypes = Object.entries(totals.documentTypeCounts)
			.sort((left, right) => right[1] - left[1])
			.map(([label, count]) => ({ label, count, width: Math.max(0.15, count / largestDocumentCount) }));

		return {
			...totals,
			documentTypes,
			genuinePercent: totals.total > 0 ? Math.round((totals.genuine / totals.total) * 100) : 0,
			suspectedPercent: totals.total > 0 ? Math.round((totals.suspected / totals.total) * 100) : 0,
		};
	}, [filteredCases]);

	const casesThisWeek = useMemo(() => {
		const weekAgo = new Date();
		weekAgo.setDate(weekAgo.getDate() - 7);
		return cases.filter((item) => new Date(item.createdAt) >= weekAgo).length;
	}, [cases]);

	const trendBuckets = useMemo(() => buildTrendBuckets(cases, chartGranularity), [cases, chartGranularity]);

	const { activeCount } = getTeamSummary(teamMembers);
	const totalRosterCount = teamMembers.length;

	const topAnalysts: TeamOverviewData[] = useMemo(
		() =>
			[...teamMembers]
				.filter((member) => member.status === 'active')
				.sort((left, right) => right.casesHandled - left.casesHandled)
				.map((member) => ({
					id: member.id,
					firstName: member.firstName,
					lastName: member.lastName,
					casesHandled: member.casesHandled,
				})),
		[teamMembers],
	);

	useEffect(() => {
		if (cases.length > 0) {
			skeletonOpacity.setValue(1);
			return;
		}

		const animation = Animated.loop(
			Animated.sequence([
				Animated.timing(skeletonOpacity, { toValue: 0.35, duration: 900, useNativeDriver: true }),
				Animated.timing(skeletonOpacity, { toValue: 0.9, duration: 900, useNativeDriver: true }),
			]),
		);

		animation.start();
		return () => animation.stop();
	}, [cases.length, skeletonOpacity]);

	if (cases.length === 0) {
		return (
			<SafeAreaView style={styles.screen}>
				<View style={styles.header}>
					<Text style={styles.title}>Org Statistics</Text>
				</View>

				<ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
					<View style={styles.skeletonInfoCard}>
						<Ionicons name="information-circle-outline" size={24} color={colors.textSecondary} />
						<Text style={styles.skeletonInfoTextLabel}>
							Once your team submits cases, organization-wide analytics will appear here.
						</Text>
					</View>

					<View style={styles.skeletonCardLarge}>
						<Animated.View style={[styles.skeletonTitlePill, { opacity: skeletonOpacity }]} />
						<Animated.View style={[styles.skeletonLineMd, { opacity: skeletonOpacity }]} />
						<Animated.View style={[styles.skeletonLineLg, { opacity: skeletonOpacity }]} />
						<Animated.View style={[styles.skeletonLineLg, { opacity: skeletonOpacity }]} />
					</View>
				</ScrollView>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView edges={['left', 'right']} style={styles.screen}>
			<View style={styles.header}>
				<View style={styles.headerRow}>
					<Text style={styles.title}>Org Statistics</Text>
					<DropdownPill value={timeRange} options={TIME_RANGE_OPTIONS} onChange={setTimeRange} />
				</View>
			</View>

			<ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
				<View style={styles.statsGrid}>
					<View style={styles.statsGridRow}>
						<AdminStatCard
							label="Active Analysts"
							value={String(activeCount)}
							icon="people-outline"
							tint= {colors.primary}	
							subtext={`${activeCount} of ${totalRosterCount} total analysts`}
							subtextColor="#94A3B8"
						/>
						<AdminStatCard
							label="Total Cases"
							value={String(summary.total)}
							icon="folder-open-outline"
							tint={colors.primary}
							subtext={casesThisWeek > 0 ? `↑ ${casesThisWeek} this week` : 'No new cases this week'}
							subtextColor= {colors.labelsuccess}
						/>
					</View>
					<View style={styles.statsGridRow}>
						<AdminStatCard
							label="Genuine Cases"
							value={String(summary.genuine)}
							icon="checkmark-done-outline"
							tint={colors.labelsuccess}
							subtext={`${summary.genuinePercent}% of total`}
							subtextColor={colors.labelsuccess}
						/>
						<AdminStatCard
							label="Suspected Cases"
							value={String(summary.suspected)}
							icon="alert-circle-outline"
							tint={colors.danger}
							subtext={`${summary.suspectedPercent}% rate`}
							subtextColor={colors.danger}
						/>
					</View>
				</View>

				<View style={styles.sectionHeaderRow}>
					<Text style={styles.sectionHeader}>Case Over Time</Text>
					<DropdownPill value={chartGranularity} options={GRANULARITY_OPTIONS} onChange={setChartGranularity} />
				</View>

				<View style={styles.chartCard}>
					<View style={styles.legendRow}>
						<LegendItem color={colors.labelsuccess} label="Genuine" />
						<LegendItem color={colors.danger} label="Suspected" />
					</View>
					<TrendLineChart buckets={trendBuckets} />
				</View>

				<Text style={styles.sectionHeader}>Document Types</Text>

				<View style={styles.chartCard}>
					{summary.documentTypes.length > 0 ? (
						summary.documentTypes.map((item) => (
							<View key={item.label} style={styles.docRow}>
								<Text style={styles.docLabel}>{item.label}</Text>
								<View style={styles.progressWrap}>
									<View style={styles.progressTrack}>
										<View style={[styles.progressFill, { width: `${item.width * 100}%` }]} />
									</View>
								</View>
								<Text style={styles.docCount}>{item.count}</Text>
							</View>
						))
					) : (
						<Text style={styles.emptyState}>No cases in this period</Text>
					)}
				</View>

				<Text style={styles.sectionHeader}>Top Analysts</Text>

				{topAnalysts.length > 0 ? (
					<View style={styles.rosterCard}>
						{topAnalysts.map((member, index) => (
							<TeamOverviewCard key={member.id} member={member} showDivider={index < topAnalysts.length - 1} />
						))}
					</View>
				) : (
					<View style={styles.emptyMini}>
						<Text style={styles.emptyMiniText}>No analyst data yet</Text>
					</View>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}

function LegendItem({ color, label }: { color: string; label: string }) {
	return (
		<View style={styles.legendItem}>
			<View style={[styles.legendDot, { backgroundColor: color }]} />
			<Text style={styles.legendText}>{label}</Text>
		</View>
	);
}

function DropdownPill<T extends string>({
	value,
	options,
	onChange,
}: {
	value: T;
	options: readonly T[];
	onChange: (value: T) => void;
}) {
	const [open, setOpen] = useState(false);
	const [anchor, setAnchor] = useState<{ top: number; right: number; width: number } | null>(null);
	const pillRef = useRef<View>(null);

	const openDropdown = () => {
		pillRef.current?.measureInWindow((x, y, width, height) => {
			const windowWidth = Dimensions.get('window').width;
			setAnchor({
				top: y + height + 30,
				right: windowWidth - (x + width),
				width: Math.max(width, 140),
			});
			setOpen(true);
		});
	};

	return (
		<>
			<View ref={pillRef} collapsable={false}>
				<TouchableOpacity style={styles.pill} onPress={openDropdown} activeOpacity={0.85}>
					<Text style={styles.pillText}>{value}</Text>
					<Ionicons name="chevron-up" size={14} color={colors.label} />
				</TouchableOpacity>
			</View>

				<Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
				<Pressable style={StyleSheet.absoluteFillObject} onPress={() => setOpen(false)}>
					{anchor ? (
						<Pressable
							style={[styles.dropdownMenu, { top: anchor.top, right: anchor.right, minWidth: anchor.width }]}
							onPress={() => {}}
						>
							{options.map((option) => (
								<Pressable
									key={option}
									style={({ pressed }) => [
										styles.dropdownOption,
										pressed && { backgroundColor: '#F2F6FE' },
									]}
									onPress={() => {
										onChange(option);
										setOpen(false);
									}}
								>
									<Text style={styles.dropdownOptionText}>{option}</Text>
								</Pressable>
							))}
						</Pressable>
					) : null}
				</Pressable>
			</Modal>
		</>
	);
}

const CHART_WIDTH = 300;
const CHART_HEIGHT = 120;
const CHART_PAD_X = 12;
const CHART_PAD_Y = 14;

function TrendLineChart({ buckets }: { buckets: TrendBucket[] }) {
	const maxValue = Math.max(1, ...buckets.flatMap((bucket) => [bucket.genuine, bucket.suspected]));
	const stepX = buckets.length > 1 ? (CHART_WIDTH - CHART_PAD_X * 2) / (buckets.length - 1) : 0;

	const toX = (index: number) => CHART_PAD_X + index * stepX;
	const toY = (value: number) =>
		CHART_HEIGHT - CHART_PAD_Y - (value / maxValue) * (CHART_HEIGHT - CHART_PAD_Y * 2);

	const genuinePoints = buckets.map((bucket, index) => `${toX(index)},${toY(bucket.genuine)}`).join(' ');
	const suspectedPoints = buckets.map((bucket, index) => `${toX(index)},${toY(bucket.suspected)}`).join(' ');

	return (
		<View>
			<Svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
				<Polyline points={genuinePoints} fill="none" stroke={colors.labelsuccess} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
				<Polyline points={suspectedPoints} fill="none" stroke={colors.danger} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
				{buckets.map((bucket, index) => (
					<React.Fragment key={`point-${index}`}>
						<Circle cx={toX(index)} cy={toY(bucket.genuine)} r={3.5} fill={colors.labelsuccess} />
						<Circle cx={toX(index)} cy={toY(bucket.suspected)} r={3.5} fill={colors.danger} />
					</React.Fragment>
				))}
			</Svg>
			<View style={styles.axisRow}>
				{buckets.map((bucket, index) => (
					<Text key={`label-${index}`} style={styles.axisLabel} numberOfLines={1}>
						{bucket.label}
					</Text>
				))}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	screen: { 
		flex: 1, 
		backgroundColor: colors.background,
		top: 30,
	 },
	header: {
		backgroundColor: colors.background2,
		paddingHorizontal: 16,
		paddingTop: 10,
		paddingBottom: 12,
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
	},
	headerRow: { 
		flexDirection: 'row', 
		alignItems: 'center', 
		justifyContent: 'space-between' 
	},
	content: { 
		paddingHorizontal: 16, 
		paddingTop: 14, 
		paddingBottom: 10 
	},
	title: { 
		color: '#1E293B', 
		fontSize: 22, 
		fontWeight: '900', 
		letterSpacing: -0.6 
	},
	pill: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: colors.border,
		backgroundColor: colors.background2,
		paddingHorizontal: 14,
		paddingVertical: 8,
	},
	pillText: { 
		color: colors.label,
		 fontSize: 12, 
		 fontWeight: '700' 
		},
	dropdownMenu: {
		position: 'absolute',
		backgroundColor: colors.background2,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: colors.border,
		paddingVertical: 6,
		shadowColor: '#0F172A',
		shadowOpacity: 0.12,
		shadowRadius: 16,
		shadowOffset: { width: 0, height: 8 },
		elevation: 8,
	},
	dropdownOption: {
		paddingHorizontal: 18,
		paddingVertical: 14,
	},
	dropdownOptionText: {
		color: colors.textPrimary,
		fontSize: 14,
		fontWeight: '700',
	},
	statsGrid: { 
		gap: 10, 
		marginBottom: 18 
	},
	statsGridRow: { 
		flexDirection: 'row', 
		gap: 10 
	},
	sectionHeaderRow: { 
		flexDirection: 'row', 
		alignItems: 'center', 
		justifyContent: 'space-between', 
		marginBottom: 10, 
		marginTop: 2 
	},
	sectionHeader: { 
		color: colors.label, 
		fontSize: 16, 
		fontWeight: '800', 
		marginBottom: 10, 
		marginTop: 2 
	},
	chartCard: {
		backgroundColor: colors.background2, 
		borderRadius: 16, 
		borderWidth: 1, 
		borderColor: '#DDE6F2', 
		padding: 16, 
		marginBottom: 16,
		shadowColor: '#0F172A', 
		shadowOpacity: 0.04, 
		shadowRadius: 10, 
		shadowOffset: { width: 0, height: 4 }, 
		elevation: 1,
	},
	legendRow: { 
		flexDirection: 'row', 
		gap: 16, 
		marginBottom: 10 
	},
	legendItem: { 
		flexDirection: 'row', 
		alignItems: 'center', 
		gap: 6 
	},
	legendDot: { 
		width: 10, 
		height: 10, 
		borderRadius: 2 
	},
	legendText: { 
		color: colors.label, 
		fontSize: 11, 
		fontWeight: '600' 
	},
	axisRow: { 
		flexDirection: 'row', 
		justifyContent: 'space-between', 
		marginTop: 6, 
		paddingHorizontal: 2 
	},
	axisLabel: { 
		flex: 1, 
		textAlign: 'center', 
		color: colors.label, 
		fontSize: 10, 
		fontWeight: '600' 
	},
	docRow: { 
		flexDirection: 'row', 
		alignItems: 'center', 
		marginBottom: 10 
	},
	docLabel: { 
		width: 112, 
		color: colors.textPrimary, 
		fontSize: 14, 
		fontWeight: '700' 
	},
	progressWrap: { 
		flex: 1, 
		paddingRight: 10 
	},
	progressTrack: { 
		height: 5, 
		borderRadius: 999, 
		backgroundColor: '#E2E8F0', 
		overflow: 'hidden' 
	},
	progressFill: { 
		height: '100%', 
		borderRadius: 999, 
		backgroundColor: colors.primary 
	},
	docCount: { 
		width: 20, 
		textAlign: 'right', 
		color: colors.textPrimary, 
		fontSize: 14, 
		fontWeight: '700' 
	},
	rosterCard: {
		backgroundColor: colors.background2,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: colors.border,
		marginBottom: 16,
		overflow: 'hidden',
	},
	emptyMini: {
		backgroundColor: colors.background2,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: colors.border,
		padding: 16,
		alignItems: 'center',
		marginBottom: 16,
	},
	emptyMiniText: { 
		color: colors.label, 
		fontSize: 12, 
		fontWeight: '600' 
	},
	emptyState: { 
		color: colors.label, 
		fontSize: 13, 
		fontWeight: '600', 
		textAlign: 'center', 
		paddingVertical: 10 
	},
	skeletonInfoCard: {
		minHeight: 62, 
		borderRadius: 16, 
		borderWidth: 1, 
		borderColor: colors.border, 
		backgroundColor: colors.background2, 
		marginBottom: 16,
		paddingHorizontal: 14, 
		flexDirection: 'row', 
		alignItems: 'center', 
		gap: 10,
	},
	skeletonInfoTextLabel: { 
		flex: 1, 
		color: '#8FA2BE', 
		fontSize: 13, 
		fontWeight: '600' 
	},
	skeletonCardLarge: { 
		borderRadius: 16, 
		borderWidth: 1, 
		borderColor: colors.border, 
		backgroundColor: colors.background2, 
		marginBottom: 16, 
		minHeight: 168, 
		padding: 16 
	},
	skeletonTitlePill: { 
		width: 108, height: 22, 
		borderRadius: 999, 
		backgroundColor: '#C8D3E3', 
		marginBottom: 14 
	},
	skeletonLineMd: { 
		width: 110, 
		height: 8, 
		borderRadius: 999, 
		backgroundColor: '#D4DDEB', 
		marginBottom: 14 
	},
	skeletonLineLg: { 
		width: 100, 
		height: 26, 
		borderRadius: 13, 
		backgroundColor: '#C8D3E3', 
		marginBottom: 8 
	},
});