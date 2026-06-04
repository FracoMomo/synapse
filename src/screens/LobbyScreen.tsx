import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../constants/theme';
import { LobbyCardComponent } from '../components/lobby/LobbyCard';
import { AcademicSyncBanner, IntramuralsBanner } from '../components/lobby/Banners';
import { MOCK_LOBBIES, MOCK_ACADEMIC, MOCK_INTRAMURALS } from '../constants/mockData';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_GAP     = Spacing.sm;
const GRID_COLS    = 2;
const GRID_ITEM_WIDTH = (SCREEN_WIDTH - Spacing.lg * 2 - GRID_GAP) / GRID_COLS;

type FilterType = 'All' | 'Study Block' | 'Campus Event' | 'Student Event' | 'Sports & Fitness' | 'Review Session' | 'Hobby & Interest' | 'Open Presentation';

const FILTERS: FilterType[] = [
  'All',
  'Study Block',
  'Campus Event',
  'Student Event',
  'Sports & Fitness',
  'Review Session',
  'Hobby & Interest',
  'Open Presentation',
];

const TYPE_TO_FILTER: Record<string, FilterType> = {
  studyBlock:       'Study Block',
  campusEvent:      'Campus Event',
  studentEvent:     'Student Event',
  sports:           'Sports & Fitness',
  reviewSession:    'Review Session',
  hobbyInterest:    'Hobby & Interest',
  openPresentation: 'Open Presentation',
};

export const LobbyScreen: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [isGridView, setIsGridView] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const filtered = MOCK_LOBBIES.filter(l =>
    activeFilter === 'All' ? true : TYPE_TO_FILTER[l.type] === activeFilter
  );

  const displayed = showAll ? filtered : filtered.slice(0, 3);

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Section header */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Active Lobbies</Text>
            <Text style={styles.sectionSub}>{filtered.length} open right now</Text>
          </View>
          <View style={styles.headerActions}>
        {/* Toggle icon: list shows grid icon (⊞), grid shows list icon (☰) */}
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setIsGridView(v => !v)}
            >
              <Text style={styles.iconBtnText}>{isGridView ? '☰' : '⊞'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          style={styles.filterScroll}
        >
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => { setActiveFilter(f); setShowAll(false); }}
              style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, activeFilter === f && styles.filterChipTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Lobby cards */}
        {isGridView ? (
          // ── Grid layout: 2-column flex wrap ──
          <View style={styles.gridContainer}>
            {displayed.map(lobby => (
              <View key={lobby.id} style={styles.gridItem}>
                <LobbyCardComponent lobby={lobby} isGrid />
              </View>
            ))}
            {/* spacer so last row left-aligns if odd count */}
            {displayed.length % 2 !== 0 && <View style={styles.gridItem} />}
          </View>
        ) : (
          // ── List layout ──
          <View style={styles.cardsSection}>
            {displayed.map(lobby => (
              <LobbyCardComponent key={lobby.id} lobby={lobby} />
            ))}
          </View>
        )}

        {/* View All */}
        {!showAll && filtered.length > 3 && (
          <TouchableOpacity
            style={styles.viewAllBtn}
            onPress={() => setShowAll(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>
              View All ({filtered.length - 3} more)
            </Text>
          </TouchableOpacity>
        )}

        {/* Banners */}
        <View style={styles.bannersSection}>
          <AcademicSyncBanner deadline={MOCK_ACADEMIC} />
          <IntramuralsBanner score={MOCK_INTRAMURALS} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen:        { flex: 1, backgroundColor: Colors.bg.surface },
  scrollContent: { paddingBottom: 100 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  sectionTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text.primary },
  sectionSub:   { fontSize: FontSize.sm, color: Colors.text.secondary, marginTop: 1 },
  headerActions:{ flexDirection: 'row', gap: Spacing.xs },
  iconBtn: {
    width: 36, height: 36, borderRadius: Radius.md,
    backgroundColor: Colors.bg.card,
    alignItems: 'center', justifyContent: 'center',
    ...Shadow.card,
  },
  iconBtnText:  { fontSize: FontSize.lg },
  filterScroll: { marginBottom: Spacing.md },
  filterRow: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive:     { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText:       { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text.secondary },
  filterChipTextActive: { color: Colors.text.inverse },
  cardsSection:   { gap: 0 },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  gridItem: { width: GRID_ITEM_WIDTH },
  viewAllBtn: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.bg.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  viewAllText:    { fontSize: FontSize.sm, fontWeight: '600', color: Colors.primary },
  bannersSection: { gap: 0 },
});