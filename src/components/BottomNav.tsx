import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../constants/theme';

export type TabName = 'lobby' | 'discover' | 'create' | 'calendar' | 'profile';

interface TabItem {
  id: TabName;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  isFAB?: boolean;
}

const TABS: TabItem[] = [
  { id: 'lobby',    label: 'Lobby',    icon: 'home-outline',     iconActive: 'home' },
  { id: 'discover', label: 'Discover', icon: 'search-outline',   iconActive: 'search' },
  { id: 'create',   label: '',         icon: 'add',              iconActive: 'add',    isFAB: true },
  { id: 'calendar', label: 'Calendar', icon: 'calendar-outline', iconActive: 'calendar' },
  { id: 'profile',  label: 'Profile',  icon: 'person-outline',   iconActive: 'person' },
];

interface Props {
  activeTab: TabName;
  onTabPress: (tab: TabName) => void;
}

const FAB_SIZE   = 56;
const FAB_RISE   = (BAR_HEIGHT - FAB_SIZE) / 2; // vertically centered in bar
const BAR_HEIGHT = 56;

export const BottomNav: React.FC<Props> = ({ activeTab, onTabPress }) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 8);

  return (
    // Outer wrapper reserves space for both bar + FAB overhang
    <View style={[styles.wrapper, { paddingBottom: bottomPadding }]}>
      {/* ── Bar ── */}
      <View style={styles.bar}>
        {TABS.map(tab => {
          if (tab.isFAB) {
            // Empty slot so flex spacing works correctly
            return <View key={tab.id} style={styles.fabSlot} />;
          }
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabBtn}
              onPress={() => onTabPress(tab.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isActive ? tab.iconActive : tab.icon}
                size={22}
                color={isActive ? Colors.primary : Colors.text.muted}
              />
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.activeDot} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── FAB — absolutely positioned, protruding above bar ── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => onTabPress('create')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: Spacing.lg,
    borderRadius: 20,
    height: BAR_HEIGHT,
    paddingHorizontal: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
    alignSelf: 'stretch',
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 2,
    position: 'relative',
  },
  fabSlot: {
    flex: 1,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.text.muted,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  activeDot: {
    position: 'absolute',
    bottom: 0,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  fab: {
    position: 'absolute',
    bottom: FAB_RISE,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 16,
  },
});

