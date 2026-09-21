import CaseCard from "@/_components/caseCards";
import EmptyState from "@/_components/common/EmptyState";
import EmptyStateCard from "@/_components/common/EmptyStateCard";
import { ScreenStatusBar } from "@/_components/common/ScreenStatusBar";
import SecondaryButton from "@/_components/common/SecondaryButton";
import FilterCasesModal from "@/_components/modals/filtercases";
import { colors } from "@/constants/colors";
import { getTypographyStyle } from "@/constants/typography";
import {
  formatCaseDateLabel,
  getCaseSummary,
  type SavedCase,
  useCaseStore,
} from "@/store/caseStore";
import {
  caseMatchesSearch,
  normalizeCaseSearchQuery,
} from "@/utils/caseSearch";
import { normalizePersonDisplay } from "@/utils/validation";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Search } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const quickFilters = ["All", "Pending", "Genuine", "Suspected"];
const DEFAULT_HEADER_HEIGHT = 140;

interface AdminCasesScreenProps {
  memberId?: string;
  memberName?: string;
}

export default function AdminCasesScreen({
  memberId,
  memberName,
}: AdminCasesScreenProps) {
  const router = useRouter();
  const nav = router as any;
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [showFilter, setShowFilter] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(DEFAULT_HEADER_HEIGHT);
  const [advancedFilters, setAdvancedFilters] = useState<{
    sortBy: string;
    verdict: string | null;
    analysisType: string | null;
    filteredCases: SavedCase[];
  } | null>(null);
  const cases = useCaseStore((state) => state.cases);
  const totalCaseCount = useCaseStore((state) => state.totalCaseCount);
  const hasMoreCases = useCaseStore((state) => state.hasMoreCases);
  const isLoadingMoreCases = useCaseStore((state) => state.isLoadingMoreCases);
  const loadMoreCases = useCaseStore((state) => state.loadMoreCases);
  const loadAllCases = useCaseStore((state) => state.loadAllCases);
  const setActiveSignatureCaseId = useCaseStore(
    (state) => state.setActiveSignatureCaseId,
  );
  const refreshCasesFromBackend = useCaseStore(
    (state) => state.refreshCasesFromBackend,
  );

  useEffect(() => {
    let isCancelled = false;

    void (async () => {
      const refreshed = await refreshCasesFromBackend();
      if (!isCancelled && memberId && refreshed) {
        await loadAllCases();
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [loadAllCases, memberId, refreshCasesFromBackend]);

  useEffect(() => {
    const debounceId = setTimeout(() => {
      setDebouncedQuery(query);
    }, 220);

    return () => clearTimeout(debounceId);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.trim() || activeFilter !== "All" || advancedFilters) {
      void loadAllCases();
    }
  }, [activeFilter, advancedFilters, debouncedQuery, loadAllCases, memberId]);

  const casesToUse = advancedFilters ? advancedFilters.filteredCases : cases;

  const { sections } = useMemo(() => {
    const normalizedQuery = normalizeCaseSearchQuery(debouncedQuery);
    const sortedCases = [...casesToUse].sort((left, right) => {
      return (
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      );
    });

    const filteredCases = sortedCases.filter((item) => {
      const matchesMember =
        (!memberId && !memberName) ||
        (item.ownerUserId &&
          String(item.ownerUserId).toLowerCase() === memberId?.toLowerCase()) ||
        (!item.ownerUserId &&
          memberName &&
          normalizePersonDisplay(item.examiner) ===
            normalizePersonDisplay(memberName));
      const matchesQuery = caseMatchesSearch(item, normalizedQuery);

      const matchesFilter =
        activeFilter === "All" ||
        item.status === activeFilter ||
        (activeFilter === "Processing" &&
          item.workflowStatus === "Processing") ||
        item.documentType === activeFilter ||
        item.priority === activeFilter;

      return matchesMember && matchesQuery && matchesFilter;
    });

    const grouped = filteredCases.reduce<Record<string, SavedCase[]>>(
      (accumulator, item) => {
        const sectionTitle = formatCaseDateLabel(item.createdAt);
        if (!accumulator[sectionTitle]) {
          accumulator[sectionTitle] = [];
        }

        accumulator[sectionTitle].push(item);
        return accumulator;
      },
      {},
    );

    return {
      sections: Object.entries(grouped).map(([title, data]) => ({
        title,
        data,
      })),
    };
  }, [activeFilter, casesToUse, debouncedQuery, memberId, memberName]);

  const totalCases = totalCaseCount || getCaseSummary(cases).totalCases;
  const showSearchFeedback = isSearchFocused || query.trim().length > 0;

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.screen}>
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
          <Text style={styles.pageTitle}>
            {memberId ? "Analyst Cases" : "All Cases"}
          </Text>
          <View style={styles.countBadge}>
            <Text allowFontScaling={false} style={styles.countBadgeText}>
              {totalCases}
            </Text>
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

          <TouchableOpacity
            style={styles.filterButton}
            activeOpacity={0.85}
            onPress={() => setShowFilter(true)}
          >
            <Ionicons name="options-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {showSearchFeedback ? (
          <Text allowFontScaling={false} style={styles.searchHint}>
            Search covers case ID, subject, examiner, analysis type, and
            priority across the whole organization.
          </Text>
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
              <Text
                allowFontScaling={false}
                style={[
                  styles.chipText,
                  activeFilter === item && styles.chipTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.chipsContent}
        />
      </View>

      {totalCases === 0 ? (
        <View style={[styles.emptyArea, { marginTop: headerHeight }]}>
          <EmptyStateCard
            title="No cases yet"
            subtitle="Cases submitted by analysts will appear here."
            icon={require("../../../assets/images/no_cases.png")}
          />
        </View>
      ) : sections.length === 0 ? (
        <View style={[styles.emptyStateWrapper, { marginTop: headerHeight }]}>
          <EmptyState
            icon={Search}
            title="No matching cases"
            subtitle="Try a case ID, subject, examiner, analysis type, or priority."
            action={
              <SecondaryButton
                label="Clear search"
                onPress={() => setQuery("")}
                size="small"
              />
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
              type={`${item.documentType} • `}
              priority={item.priority}
              name={`${item.subjectName} · ${item.examiner}`}
              status={item.status}
              variant="admin"
              examiner={item.examiner}
              confidence={item.confidence ?? item.Confidence}
              adminStatus={
                item.workflowStatus === "PendingReview"
                  ? "Review"
                  : item.workflowStatus === "Reviewed"
                    ? item.status
                    : "Processing"
              }
                    isFlaggedForInternalReview={item.isFlaggedForInternalReview}
              onPress={() => {
                setActiveSignatureCaseId(item.caseId);

                if (item.workflowStatus === "Processing") {
                  if (item.analysisType === "HW") {
                    nav.push("/analysis/handwriting/processing");
                    return;
                  }

                  nav.push({
                    pathname: "/analysis/signature/processing",
                    params: { caseId: item.caseId },
                  });
                  return;
                }

                if (item.analysisType === "HW") {
                  nav.push("/analysis/handwriting/results");
                } else {
                  nav.push({
                    pathname: "/Admin/CaseResultAdmin",
                    params: { caseId: item.caseId },
                  });
                }
              }}
            />
          )}
          renderSectionHeader={({ section }) => (
            <Text allowFontScaling={false} style={styles.sectionHeader}>
              {section.title}
            </Text>
          )}
          showsVerticalScrollIndicator={false}
          style={[styles.list, { marginTop: headerHeight }]}
          contentContainerStyle={styles.listContent}
          onEndReached={() => {
            if (hasMoreCases && !isLoadingMoreCases) void loadMoreCases();
          }}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            isLoadingMoreCases ? (
              <View style={styles.loadingFooter}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : null
          }
        />
      )}
      <FilterCasesModal
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        cases={cases}
        onApply={(filters) => {
          setAdvancedFilters(filters);
          setActiveFilter("All");
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    top: 30,
  },
  fixedHeader: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 20,
    elevation: 1,
    backgroundColor: colors.background2,
    borderBottomWidth: 1,
    borderBottomColor: colors.disabledBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  pageTitle: {
    ...getTypographyStyle("t1Title"),
    color: colors.textPrimary,
    letterSpacing: -0.6,
    paddingBottom: 4,
  },
  countBadge: {
    backgroundColor: colors.badgeBackground,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  countBadgeText: {
    ...getTypographyStyle("c2Caption"),
    color: colors.primary,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
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
    ...getTypographyStyle("body", "medium"),
    color: colors.textPrimary,
  },
  searchHint: {
    ...getTypographyStyle("c2Caption", "regular"),
    lineHeight: 16,
    paddingHorizontal: 16,
    paddingBottom: 10,
    color: colors.textMuted,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
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
    ...getTypographyStyle("b3Button"),
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
    paddingBottom: 45,
  },
  loadingFooter: {
    alignItems: "center",
    paddingVertical: 16,
  },
  sectionHeader: {
    ...getTypographyStyle("headline"),
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  emptyArea: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emptyStateWrapper: {
    flex: 1,
  },
});
