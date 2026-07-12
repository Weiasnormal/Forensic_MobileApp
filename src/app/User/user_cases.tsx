import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
	FlatList,
	SectionList,
	StatusBar,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import CaseCard from '../../_components/caseCards';
import FilterCasesModal from '../../_components/modals/filtercases';
import { formatAnalysisTypeLabel, formatCaseDateLabel, getCaseSummary, type SavedCase, useCaseStore } from '../../store/caseStore';
import { caseMatchesSearch, normalizeCaseSearchQuery } from '../../utils/caseSearch';
import { ScreenStatusBar } from '@/_components/common/ScreenStatusBar';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import EmptyState from '@/_components/common/EmptyState';
import { FileText, Search } from 'lucide-react-native';
import SecondaryButton from '@/_components/common/SecondaryButton';

const quickFilters = ['All', 'Genuine', 'Suspected', 'Processing'];
const DEFAULT_HEADER_HEIGHT = 140;

export default function UserCasesScreen() {
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
		priority: string | null;
		analysisType: string | null;
		filteredCases: SavedCase[];
	} | null>(null);
	const cases = useCaseStore((state) => state.cases);
	const setActiveSignatureCaseId = useCaseStore((state) => state.setActiveSignatureCaseId);

	useEffect(() => {
		const debounceId = setTimeout(() => {
			setDebouncedQuery(query);
		}, 220);

		return () => clearTimeout(debounceId);
	}, [query]);

	// Use advanced filtered cases if applied, otherwise use all cases
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
		<View style={styles.screen}>
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
					<Text allowFontScaling={false} style={styles.pageTitle}>My cases</Text>
					<View style={styles.countBadge}>
						<Text allowFontScaling={false} style={styles.countBadgeText}>{totalCases}</Text>
					</View>
				</View>

				<View style={styles.searchRow}>
					<View style={styles.searchBox}>
						<Ionicons name="search" size={18} color={colors.label} />
						<TextInput
							value={query}
							onChangeText={setQuery}
							onFocus={() => setIsSearchFocused(true)}
							onBlur={() => setIsSearchFocused(false)}
							placeholder="Search case ID, subject..."
							placeholderTextColor={colors.label}
							style={styles.searchInput}
						/>
					</View>

					<TouchableOpacity style={styles.filterButton} activeOpacity={0.85} onPress={() => setShowFilter(true)}>
						<Ionicons name="options-outline" size={20} color={colors.iconAccent} />
					</TouchableOpacity>
				</View>

				{showSearchFeedback ? (
					<>
						<Text allowFontScaling={false} style={styles.searchHint}>
							Search covers case ID, subject, examiner, document type, priority, and analysis type.
						</Text>

						<View style={styles.searchMetaRow}>
							<Text allowFontScaling={false} style={styles.searchMetaText}>
								{hasSearchQuery
									? `Showing ${visibleCaseCount} of ${casesToUse.length} cases for “${debouncedQuery.trim()}”`
									: `Showing all ${casesToUse.length} cases`}
							</Text>
							{hasSearchQuery ? (
								<TouchableOpacity
									activeOpacity={0.85}
									onPress={() => setQuery('')}
									style={styles.clearSearchButton}
								>
									<Text allowFontScaling={false} style={styles.clearSearchText}>Clear</Text>
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
							<Text allowFontScaling={false} style={[styles.chipText, activeFilter === item && styles.chipTextActive]}>
								{item}
							</Text>
						</TouchableOpacity>
					)}
					contentContainerStyle={styles.chipsContent}
				/>
			</View>

			{totalCases === 0 ? (
        <View style={[styles.emptyStateWrapper, { marginTop: headerHeight }]}>
          <EmptyState
            icon={FileText}
            title="No cases yet"
            subtitle="Run a new analysis to see cases appear here."
          />
        </View>
      ) : sections.length === 0 ? (
        <View style={[styles.emptyStateWrapper, { marginTop: headerHeight }]}>
          <EmptyState
            icon={Search}
            title="No matching cases"
            subtitle="Try a case ID, subject, examiner, document type, priority, or analysis type."
            action={
              <SecondaryButton label="Clear search" onPress={() => setQuery('')} size="small" />
            }
          />
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
              name={`${item.subjectName} · ${item.documentType}`}
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
          renderSectionHeader={({ section }) => (
            <Text allowFontScaling={false} style={styles.sectionHeader}>{section.title}</Text>
          )}
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
					console.log('applied filters', filters);
				}}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: colors.background,
	},
	fixedHeader: {
		position: 'absolute',
		left: 0,
		right: 0,
		zIndex: 20,
		elevation: 1,
		backgroundColor: colors.background2,
		borderBottomWidth: 1,
		borderBottomColor: colors.disabledBorder,
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
		...getTypographyStyle('t1Title'),
		color: colors.textPrimary,
		letterSpacing: -0.6,
	},
	countBadge: {
		backgroundColor: colors.badgeBackground,
		borderRadius: 999,
		paddingHorizontal: 10,
		paddingVertical: 6,
	},
	countBadgeText: {
		...getTypographyStyle('c2Caption'),
		color: colors.primary,
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
		backgroundColor: colors.background,
		borderWidth: 1,
		borderColor: colors.searchBorder,
	},
	searchInput: {
		flex: 1,
		...getTypographyStyle('body', 'medium'),
		fontSize: 14,
		color: colors.textPrimary,
	},
	searchHint: {
		...getTypographyStyle('c2Caption', 'regular'),
		fontSize: 12,
		lineHeight: 16,
		paddingHorizontal: 16,
		paddingBottom: 4,
		color: colors.textMuted,
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
		...getTypographyStyle('c2Caption'),
		fontSize: 12,
		flex: 1,
		color: colors.textMuted,
	},
	clearSearchButton: {
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 999,
		backgroundColor: colors.badgeBackground,
	},
	clearSearchText: {
		...getTypographyStyle('b3Button'),
		color: colors.primary,
	},
	filterButton: {
		width: 44,
		height: 44,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.background2,
		borderWidth: 1,
		borderColor: colors.searchBorder,
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
		borderColor: colors.searchBorder,
		backgroundColor: colors.background2,
	},
	chipActive: {
		backgroundColor: colors.primary,
		borderColor: colors.primary,
	},
	chipText: {
		...getTypographyStyle('b3Button'),
		color: colors.chipTextInactive,
	},
	chipTextActive: {
		color: colors.primaryText,
	},
	list: {
		flex: 1,
		backgroundColor: colors.background,
	},
	listContent: {
		paddingBottom: 120,
	},
	sectionHeader: {
		...getTypographyStyle('l2List'),
		paddingHorizontal: 16,
		paddingTop: 12,
		paddingBottom: 8,
		color: colors.label,
		letterSpacing: 0.5,
	},
  emptyStateWrapper: {
    flex: 1,
  },
	clearSearchButtonLarge: {
		marginTop: 4,
		paddingHorizontal: 14,
		paddingVertical: 10,
		borderRadius: 999,
		backgroundColor: colors.primary,
	},
	clearSearchTextLarge: {
		...getTypographyStyle('l1List'),
		color: colors.primaryText,
	},
});