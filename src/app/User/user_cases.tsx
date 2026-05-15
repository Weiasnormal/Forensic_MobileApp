import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
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

type CaseSection = {
  title: string;
  data: SavedCase[];
};

const quickFilters = ['All', 'Genuine', 'Suspect', 'Processing', 'Completed'];
const DEFAULT_HEADER_HEIGHT = 140;

export default function UserCasesScreen() {
  const [query, setQuery] = useState('');
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

  // Use advanced filtered cases if applied, otherwise use all cases
  const casesToUse = advancedFilters ? advancedFilters.filteredCases : cases;

  const sections = useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase();
    const sortedCases = [...casesToUse].sort((left, right) => {
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });

    const filteredCases = sortedCases.filter((item) => {
      const matchesQuery =
        !trimmedQuery ||
        item.caseId.toLowerCase().includes(trimmedQuery) ||
        item.subjectName.toLowerCase().includes(trimmedQuery) ||
        item.examiner.toLowerCase().includes(trimmedQuery) ||
        item.documentType.toLowerCase().includes(trimmedQuery);

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

    return Object.entries(grouped).map(([title, data]) => ({ title, data }));
  }, [activeFilter, casesToUse, query]);
  const { totalCases } = getCaseSummary(cases);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

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
          <Text style={styles.pageTitle}>My cases</Text>
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
              placeholder="Search case ID, subject..."
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
            />
          </View>

          <TouchableOpacity style={styles.filterButton} activeOpacity={0.85} onPress={() => setShowFilter(true)}>
            <Ionicons name="options-outline" size={20} color="#1F5DA8" />
          </TouchableOpacity>
        </View>

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

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.caseId}
        renderItem={({ item }) => (
          <CaseCard
            id={item.caseId}
            createdAt={item.createdAt}
            type={`${formatAnalysisTypeLabel(item.analysisType)} • ${item.priority}`}
            name={`${item.subjectName} · ${item.documentType}`}
            status={item.status}
          />
        )}
        renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
        showsVerticalScrollIndicator={false}
        style={[styles.list, { marginTop: headerHeight }]}
        contentContainerStyle={styles.listContent}
      />

      <FilterCasesModal
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        cases={cases}
        onApply={(filters) => {
          setAdvancedFilters(filters);
          setActiveFilter('All'); // Reset quick filter when applying advanced filters
          console.log('applied filters', filters);
        }}
      />
    </View>
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
    color: '#1F5DA8',
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
    backgroundColor: '#1F5DA8',
    borderColor: '#1F5DA8',
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
});
