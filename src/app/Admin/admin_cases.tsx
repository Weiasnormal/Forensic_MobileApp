import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
	FlatList,
	SectionList,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import CaseCard from '@/_components/caseCards';
import FilterCasesModal from '@/_components/modals/filtercases';
import { formatAnalysisTypeLabel, formatCaseDateLabel, getCaseSummary, type SavedCase, useCaseStore } from '@/store/caseStore';
import { caseMatchesSearch, normalizeCaseSearchQuery } from '@/utils/caseSearch';
import { ScreenStatusBar } from '@/_components/common/ScreenStatusBar';
import { SafeAreaView } from 'react-native-safe-area-context';

const quickFilters = ['All', 'Genuine', 'Suspected', 'Processing'];
const DEFAULT_HEADER_HEIGHT = 140;

export default function AdminCasesScreen() {
	const router = useRouter();
	const nav = router as any;
	const [query, setQuery] = useState('');
	const [debouncedQuery, setDebouncedQuery] = useState('');
	const [isSearchFocused, setIsSearchFocused] = useState(false);
	const [activeFilter, setActiveFilter] = useState('All');
	const [showFilter, setShowFilter] = useState(false);
	const [headerHeight, setHeaderHeight] = useState(DEFAULT_HEADER_HEIGHT);
	const [advancedFilters, setAdvancedFilters] = useState<{
		sortBy: string;
		verdict: string | null;
		analysisType: string | null;
		filteredCases: SavedCase[];
	} | null>(null);
	const cases = useCaseStore((state) => state.cases);
	const setActiveSignatureCaseId = useCaseStore((state) => state.setActiveSignatureCaseId);
	const refreshCasesFromBackend = useCaseStore((state) => state.refreshCasesFromBackend);

	useEffect(() => {
		refreshCasesFromBackend();
	}, [refreshCasesFromBackend]);

	useEffect(() => {
		const debounceId = setTimeout(() => {
			setDebouncedQuery(query);
		}, 220);

		return () => clearTimeout(debounceId);
	}, [query]);

	const casesToUse = advancedFilters ? advancedFilters.filteredCases : cases;

	const { sections, visibleCaseCount } = useMemo(() => {
		const normalizedQuery = normalizeCaseSearchQuery(debouncedQuery);
		const sortedCases = [...casesToUse].sort((left, right) => {
			return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
		});

		const filteredCases = sortedCases.filter((item) => {
			const matchesQuery = caseMatchesSearch(item, normalizedQuery);

			const matchesFilter =
				activeFilter === 'All' ||
				item.status === activeFilter ||
				formatAnalysisTypeLabel(item.analysisType) === activeFilter ||
				item.priority === activeFilter;

			return matchesQuery && matchesFilter;
		});

		const grouped = filteredCases.reduce<Record<string, SavedCase[]>>((accumulator, item) => {
			const sectionTitle = formatCaseDateLabel(item.createdAt);
			if (!accumulator[sectionTitle]) {
				accumulator[sectionTitle] = [];
			}

			accumulator[sectionTitle].push(item);
			return accumulator;
		}, {});

		return {
			sections: Object.entries(grouped).map(([title, data]) => ({ title, data })),
			visibleCaseCount: filteredCases.length,
		};
	}, [activeFilter, casesToUse, debouncedQuery]);

	const { totalCases } = getCaseSummary(cases);
	const hasSearchQuery = debouncedQuery.trim().length > 0;
	const showSearchFeedback = isSearchFocused || query.trim().length > 0;

	return (
		<SafeAreaView edges={['left', 'right']} style={styles.screen}>
			<ScreenStatusBar variant="onLight" />
			
			<View
				style={styles.fixedHeader}
				onLayout={(event) => {
					const nextHeight = event.nativeEvent.layout.height;
					if (nextHeight && nextHeight !== headerHeight) {
						setHeaderHeight(nextHeight);
					}
				}}
			>
				<View style={styles.headerRow}>
					<Text style={styles.pageTitle}>All Cases</Text>
					<View style={styles.countBadge}>
						<Text style={styles.countBadgeText}>{totalCases}</Text>
					</View>
				</View>

				<View style={styles.searchRow}>
					<View style={styles.searchBox}>
						<Ionicons name="search" size={18} color="#94A3B8" />
						<TextInput
							value={query}
							onChangeText={setQuery}
							onFocus={() => setIsSearchFocused(true)}
							onBlur={() => setIsSearchFocused(false)}
							placeholder="Search case ID, subject, examiner..."
							placeholderTextColor="#94A3B8"
							style={styles.searchInput}
						/>
					</View>

					<TouchableOpacity style={styles.filterButton} activeOpacity={0.85} onPress={() => setShowFilter(true)}>
						<Ionicons name="options-outline" size={20} color="#1F5DA8" />
					</TouchableOpacity>
				</View>

				{showSearchFeedback ? (
					<>
						<Text style={styles.searchHint}>
							Search covers case ID, subject, examiner, document type, priority, and analysis type across the whole organization.
						</Text>

						<View style={styles.searchMetaRow}>
							<Text style={styles.searchMetaText}>
								{hasSearchQuery
									? `Showing ${visibleCaseCount} of ${casesToUse.length} cases for “${debouncedQuery.trim()}”`
									: `Showing all ${casesToUse.length} cases`}
							</Text>
							{hasSearchQuery ? (
								<TouchableOpacity activeOpacity={0.85} onPress={() => setQuery('')} style={styles.clearSearchButton}>
									<Text style={styles.clearSearchText}>Clear</Text>
								</TouchableOpacity>
							) : null}
						</View>
					</>
				) : null}

				<FlatList
					data={quickFilters}
					keyExtractor={(item) => item}
					horizontal
					showsHorizontalScrollIndicator={false}
					renderItem={({ item }) => (
						<TouchableOpacity
							style={[styles.chip, activeFilter === item && styles.chipActive]}
							onPress={() => setActiveFilter(item)}
							activeOpacity={0.86}
						>
							<Text style={[styles.chipText, activeFilter === item && styles.chipTextActive]}>{item}</Text>
						</TouchableOpacity>
					)}
					contentContainerStyle={styles.chipsContent}
				/>
			</View>

			{totalCases === 0 ? (
				<View style={styles.emptyArea}>
					<View style={styles.emptyBadge}>
						<Ionicons name="document-text-outline" size={34} color="#94A3B8" />
					</View>
					<Text style={styles.emptyTitle}>No cases yet</Text>
					<Text style={styles.emptySubtitle}>Cases submitted by your analysts will appear here.</Text>
				</View>
			) : sections.length === 0 ? (
				<View style={styles.emptySearchArea}>
					<Ionicons name="search-outline" size={34} color="#94A3B8" />
					<Text style={styles.emptySearchTitle}>No matching cases</Text>
					<Text style={styles.emptySearchText}>
						Try a case ID, subject, examiner, document type, priority, or analysis type.
					</Text>
					<TouchableOpacity style={styles.clearSearchButtonLarge} activeOpacity={0.88} onPress={() => setQuery('')}>
						<Text style={styles.clearSearchTextLarge}>Clear search</Text>
					</TouchableOpacity>
				</View>
			) : (
				<SectionList
					sections={sections}
					keyExtractor={(item) => item.caseId}
					renderItem={({ item }) => (
						<CaseCard
							caseCode={item.caseCode ?? item.caseId}
							createdAt={item.createdAt}
							type={`${formatAnalysisTypeLabel(item.analysisType)} • `}
							priority={item.priority}
							name={`${item.subjectName} · ${item.examiner}`}
							status={item.status}
							onPress={() => {
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
								} else {
									nav.push(`/analysis/signature/results/${item.caseId}`);
								}
							}}
						/>
					)}
					renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
					showsVerticalScrollIndicator={false}
					style={[styles.list, { marginTop: headerHeight }]}
					contentContainerStyle={styles.listContent}
				/>
			)}
			<FilterCasesModal
				visible={showFilter}
				onClose={() => setShowFilter(false)}
				cases={cases}
				onApply={(filters) => {
					setAdvancedFilters(filters);
					setActiveFilter('All');
				}}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: '#F8FAFC',
	},
	fixedHeader: {
		position: 'absolute',
		left: 0,
		right: 0,
		zIndex: 20,
		elevation: 1,
		backgroundColor: '#FFFFFF',
		borderBottomWidth: 1,
		borderBottomColor: '#E2E8F0',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.08,
	},
	headerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingTop: 10,
		paddingBottom: 8,
	},
	pageTitle: {
		color: '#0F172A',
		fontSize: 24,
		fontWeight: '900',
		letterSpacing: -0.6,
	},
	countBadge: {
		backgroundColor: '#E0EDFF',
		borderRadius: 999,
		paddingHorizontal: 10,
		paddingVertical: 6,
	},
	countBadgeText: {
		color: '#1E6FD9',
		fontSize: 12,
		fontWeight: '800',
	},
	searchRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		paddingHorizontal: 16,
		paddingBottom: 10,
	},
	searchBox: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		minHeight: 44,
		paddingHorizontal: 14,
		borderRadius: 12,
		backgroundColor: '#F8FAFC',
		borderWidth: 1,
		borderColor: '#E6EEF9',
	},
	searchInput: {
		flex: 1,
		color: '#0F172A',
		fontSize: 14,
		fontWeight: '500',
	},
	searchHint: {
		paddingHorizontal: 16,
		paddingBottom: 4,
		fontSize: 12,
		lineHeight: 16,
		color: '#64748B',
	},
	searchMetaRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingBottom: 10,
		gap: 10,
	},
	searchMetaText: {
		flex: 1,
		fontSize: 12,
		color: '#64748B',
		fontWeight: '600',
	},
	emptyArea: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 24,
		paddingTop: 160,
		gap: 10,
	},
	emptyBadge: {
		width: 72,
		height: 72,
		borderRadius: 22,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#F8FAFC',
		borderWidth: 1,
		borderColor: '#E2E8F0',
	},
	emptyTitle: {
		color: '#0F172A',
		fontSize: 17,
		fontWeight: '800',
	},
	emptySubtitle: {
		color: '#64748B',
		fontSize: 12,
		textAlign: 'center',
		lineHeight: 17,
	},
	clearSearchButton: {
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 999,
		backgroundColor: '#E0EDFF',
	},
	clearSearchText: {
		fontSize: 12,
		fontWeight: '700',
		color: '#1E6FD9',
	},
	filterButton: {
		width: 44,
		height: 44,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderColor: '#E6EEF9',
	},
	chipsContent: {
		paddingHorizontal: 16,
		paddingBottom: 10,
		gap: 8,
	},
	chip: {
		paddingHorizontal: 16,
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
	list: {
		flex: 1,
		backgroundColor: '#F8FAFC',
	},
	listContent: {
		paddingBottom: 120,
	},
	sectionHeader: {
		paddingHorizontal: 16,
		paddingTop: 12,
		paddingBottom: 8,
		fontSize: 11,
		fontWeight: '700',
		color: '#94A3B8',
		letterSpacing: 0.5,
	},
	emptySearchArea: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 32,
		paddingTop: 120,
		gap: 10,
	},
	emptySearchTitle: {
		fontSize: 18,
		fontWeight: '800',
		color: '#0F172A',
	},
	emptySearchText: {
		fontSize: 13,
		lineHeight: 18,
		textAlign: 'center',
		color: '#64748B',
	},
	clearSearchButtonLarge: {
		marginTop: 4,
		paddingHorizontal: 14,
		paddingVertical: 10,
		borderRadius: 999,
		backgroundColor: '#1E6FD9',
	},
	clearSearchTextLarge: {
		fontSize: 13,
		fontWeight: '800',
		color: '#FFFFFF',
	},
});
