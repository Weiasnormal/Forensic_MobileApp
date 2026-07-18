import CasesScreen from '@/app/User/user_cases';
import StatsScreen from '@/app/User/user_stats';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@/store/userStore';
import * as NavigationBar from 'expo-navigation-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CaseCard from '../../_components/caseCards';
import PendingCard from '../../_components/pendingCards';
import { formatAnalysisTypeLabel, getPendingCards, type SavedCase, useCaseStore } from '../../store/caseStore';
import Navbar, { type TabKey } from '../_navbar/nav_bar';
import ProfileScreen from './user_profile';
import { ScreenStatusBar } from '@/_components/common/ScreenStatusBar';
import { FolderOpen, Pencil } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import EmptyState from '@/_components/common/EmptyState';
import ListSectionHeader from '@/_components/common/ListSectionHeader';

const TAB_KEYS: TabKey[] = ['home', 'cases', 'stats', 'profile'];

function resolveTabValue(value: string | string[] | undefined): TabKey {
	const candidate = Array.isArray(value) ? value[0] : value;
	if (candidate && TAB_KEYS.includes(candidate as TabKey)) {
		return candidate as TabKey;
	}

	return 'home';
}

export default function UserDashboardScreen() {
	const params = useLocalSearchParams<{ tab?: string | string[] }>();
	const [activeTab, setActiveTab] = useState<TabKey>(resolveTabValue(params.tab));
	const router = useRouter();
	const nav = router as any;
	const cases = useCaseStore((state) => state.cases);
	const startNewSignatureDraft = useCaseStore((state) => state.startNewSignatureDraft);
	const refreshCasesFromBackend = useCaseStore((state) => state.refreshCasesFromBackend);
	const { user, load } = useUser();

	React.useEffect(() => {
		setActiveTab(resolveTabValue(params.tab));
	}, [params.tab]);

	React.useEffect(() => {
		load();
		refreshCasesFromBackend();
	}, []);

	useEffect(() => {
		if (Platform.OS !== 'android') return;

		NavigationBar.setBackgroundColorAsync(colors.background2).catch(() => {});
		NavigationBar.setButtonStyleAsync('dark').catch(() => {});
	}, [activeTab]);

	const handleNewAnalysisPress = () => {
		startNewSignatureDraft();
		nav.push('/analysis/signature/step1');
	};

	return (
		<SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
			<ScreenStatusBar variant="onLight" />

			{activeTab === 'home' ? (
				<View style={styles.homeHeader}>
					<View style={styles.homeHeaderTop}>
						<View>
							<Text allowFontScaling={false} style={styles.homeOrgText}>
								{user?.organization || 'PNP Crime Laboratory'}
							</Text>
							<Text
                allowFontScaling={false}
                style={styles.homeGreeting}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.5}
              >
                Hello, Analyst {user?.lastName}
              </Text>
						</View>
						<View style={styles.homeAvatarCircle}>
							{user && user.avatarUri ? (
								<Image source={{ uri: user.avatarUri }} style={styles.homeAvatarImage} />
							) : (
								<Text allowFontScaling={false} style={styles.homeAvatarText}>
									{getInitials(user?.firstName || '', user?.lastName || '')}
								</Text>
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
					<HomeTab onStartAnalysis={handleNewAnalysisPress} cases={cases} onViewAllPress={() => setActiveTab('cases')} />
				</ScrollView>
			) : activeTab === 'cases' ? (
				<CasesScreen />
			) : activeTab === 'stats' ? (
				<StatsScreen />
			) : (
				<ProfileScreen />
			)}

			<Navbar
				activeTab={activeTab}
				onTabChange={setActiveTab}
				onNewPress={handleNewAnalysisPress}
			/>
		</SafeAreaView>
	);
}

function HomeTab({ onStartAnalysis, cases, onViewAllPress }: { onStartAnalysis: () => void; cases: SavedCase[]; onViewAllPress: () => void }) {
	const router = useRouter();
	const nav = router as any;
	const draftSignatureCase = useCaseStore((state) => state.draftSignatureCase);
	const setActiveSignatureCaseId = useCaseStore((state) => state.setActiveSignatureCaseId);
	const pendingCards = getPendingCards(cases, draftSignatureCase);
	const latestCases = [...cases]
		.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
		.slice(0, 5);

	const goToCaseDestination = (item: SavedCase) => {
		setActiveSignatureCaseId(item.caseId);

		if (item.status === 'Processing') {
			if (item.analysisType === 'HW') {
				nav.push('/analysis/handwriting/processing');
				return;
			}

			nav.push('/analysis/signature/processing');
			return;
		}

		if (item.analysisType === 'HW') {
			nav.push('/analysis/handwriting/results');
			return;
		}

		nav.push(`/analysis/signature/signature_results`);
	};

	return (
		<>
			<TouchableOpacity style={styles.analysisBanner} activeOpacity={0.9} onPress={onStartAnalysis}>
				<View style={styles.analysisBannerIcon}>
					<Pencil size={24} color={colors.primary} />
				</View>

				<View style={styles.analysisBannerCopy}>
					<Text allowFontScaling={false} style={styles.analysisBannerLabel}>START ANALYSIS</Text>
					<Text allowFontScaling={false} style={styles.analysisBannerTitle}>Signature</Text>
				</View>

				<View style={styles.analysisBannerChevron}>
					<Text allowFontScaling={false} style={styles.analysisBannerChevronText}>›</Text>
				</View>
			</TouchableOpacity>

			<View style={styles.sectionDivider} />

			{pendingCards.length > 0 ? (
				<>
					<View style={styles.sectionHeader}>
						<Text allowFontScaling={false} style={styles.sectionTitle}>Pending Cases</Text>
					</View>

					<View style={styles.pendingList}>
						{pendingCards.map((item) => (
							<PendingCard
								key={`${item.id}-${item.status}`}
								caseCode={item.caseCode ?? item.id}
								name={item.name}
								type={item.type}
								status={item.status}
								onPress={() => {
									if (item.status === 'draft') {
										nav.push('/analysis/signature/step1');
										return;
									}

									const linkedCase = cases.find((entry) => entry.caseId === item.id);

									if (!linkedCase) {
										return;
									}

									goToCaseDestination(linkedCase);
								}}
							/>
						))}
					</View>
				</>
			) : null}

			{cases && cases.length > 0 ? (
				<>
					<ListSectionHeader
						title="Recent Cases"
						actionLabel="View all"
						onActionPress={onViewAllPress}
					/>

					<View style={styles.recentList}>
						{latestCases.map((item) => (
							<CaseCard
								key={item.caseId}
								caseCode={item.caseCode ?? item.caseId}
								createdAt={item.createdAt}
								type={`${formatAnalysisTypeLabel(item.analysisType)} • `}
								priority={item.priority}
								name={`${item.examiner} · ${item.documentType}`}
								status={item.status}
								onPress={() => goToCaseDestination(item)}
							/>
						))}
					</View>
				</>
			) : (
				<EmptyState
					icon={FolderOpen}
					title="No cases yet"
					subtitle="Start a new analysis to populate the dashboard."
					style={{
						marginTop: 24,
						marginHorizontal: 16,
						borderRadius: 20,
						borderWidth: 1,
						borderColor: colors.searchBorder,
						backgroundColor: colors.background2,
					}}
				/>
			)}
		</>
	);
}

function getInitials(first = '', last = '') {
	return ((first[0] || '') + (last[0] || '')).toUpperCase();
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: colors.background,
	},
	homeHeader: {
		backgroundColor: colors.background2,
		paddingTop: Platform.OS === 'android' ? 18 : 20,
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
		...getTypographyStyle('t2Title'),
		color: colors.textPrimary,
		letterSpacing: -0.5,
    flexShrink: 1, 
    marginRight: 8,
	},
	homeAvatarCircle: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: colors.primary,
		alignItems: 'center',
		justifyContent: 'center',
    flexShrink: 0,
	},
	homeAvatarImage: {
		width: 44,
		height: 44,
		borderRadius: 22,
	},
	homeAvatarText: {
		...getTypographyStyle('t3Title'),
		fontSize: 18,
		color: colors.primaryText,
	},
	homeOrgText: {
		...getTypographyStyle('c1Caption', 'regular'),
		color: colors.textSecondary,
	},
	scrollArea: {
		paddingHorizontal: 0,
		paddingTop: 0,
		paddingBottom: 18,
		backgroundColor: colors.background,
	},
	scrollView: {
		flex: 1,
	},
	homeScrollArea: {
		paddingTop: 10,
	},
	analysisBanner: {
		marginHorizontal: 16,
		marginTop: 8,
		marginBottom: 14,
		backgroundColor: colors.primary,
		borderRadius: 18,
		paddingHorizontal: 16,
		paddingVertical: 16,
		flexDirection: 'row',
		alignItems: 'center',
		shadowColor: colors.primary,
		shadowOpacity: 0.25,
		shadowRadius: 14,
		shadowOffset: { width: 0, height: 6 },
		elevation: 4,
	},
	analysisBannerLabel: {
		...getTypographyStyle('c2Caption', 'bold'),
		color: 'rgba(255,255,255,0.8)',
		letterSpacing: 0.7,
	},
	analysisBannerCopy: {
		flex: 1,
		marginLeft: 12,
	},
	analysisBannerTitle: {
		...getTypographyStyle('t2Title'),
		color: colors.primaryText,
		letterSpacing: -0.5,
	},
	analysisBannerIcon: {
		width: 46,
		height: 46,
		borderRadius: 14,
		backgroundColor: 'rgba(255,255,255,0.92)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	analysisBannerChevron: {
		width: 24,
		height: 24,
		alignItems: 'center',
		justifyContent: 'center',
	},
	analysisBannerChevronText: {
		color: colors.primaryText,
		fontSize: 24,
		fontWeight: '300',
		lineHeight: 24,
		textAlign: 'center',
		includeFontPadding: false,
	},
	emptyArea: {
		marginTop: 24,
		marginHorizontal: 16,
		paddingVertical: 28,
		paddingHorizontal: 20,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: colors.searchBorder,
		backgroundColor: colors.background2,
		alignItems: 'center',
		gap: 10,
	},
	emptyBadge: {
		width: 68,
		height: 68,
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.background,
		borderWidth: 1,
		borderColor: colors.disabledBorder,
	},
	emptyTitle: {
		...getTypographyStyle('t3Title'),
		fontSize: 16,
		color: colors.textPrimary,
	},
	emptySubtitle: {
		...getTypographyStyle('c2Caption', 'regular'),
		fontSize: 12,
		lineHeight: 17,
		color: colors.textMuted,
		textAlign: 'center',
	},
	sectionDivider: {
		height: 1,
		backgroundColor: colors.disabledBorder,
		marginHorizontal: 16,
		marginBottom: 14,
	},
	pendingList: {
		marginBottom: 10,
	},
	recentList: {
		marginBottom: 8,
	},
	sectionHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 10,
		marginHorizontal: 16,
	},
	sectionTitle: {
		...getTypographyStyle('headline'),
		color: colors.textPrimary,
	},
	sectionLink: {
		...getTypographyStyle('b3Button'),
		color: colors.primary,
	},
});