// screens/DiscoverScreen.tsx
// Synapse — Phase 6.2: Filter shelf (multi-select) replaces horizontal filter strip

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
  FlatList,
  Platform,
  ListRenderItemInfo,
  Modal,
  Pressable,
} from 'react-native';

// ─── Types ─────────────────────────────────────────────────────
interface EventItem {
  id: string; category: string; title: string; organizer: string;
  date: string; time: string; venue: string; attendees: number;
  capacity: number; color: string;
}
interface PersonItem {
  id: string; name: string; course: string; yearLevel: string;
  skills: string[]; rating: number; reviews: number;
  isVerified: boolean; initials: string; accentColor: string;
}
interface SyncItem {
  id: string; title: string; description: string; poster: string;
  posterInitials: string; posterCourse: string; accentColor: string;
  tags: string[]; type: 'paid' | 'collab' | 'volunteer';
  budget?: string; postedAgo: string; applicants: number;
}

// ─── Design Tokens ────────────────────────────────────────────
const COLORS = {
  primary:      '#3D5AFE',
  primaryLight: '#EEF1FF',
  primaryDark:  '#2541E8',
  green:        '#10B981',
  greenLight:   '#ECFDF5',
  orange:       '#F59E0B',
  orangeLight:  '#FFFBEB',
  purple:       '#7C3AED',
  purpleLight:  '#F5F3FF',
  red:          '#EF4444',
  redLight:     '#FEF2F2',
  teal:         '#06B6D4',
  tealLight:    '#ECFEFF',
  pink:         '#EC4899',
  pinkLight:    '#FDF2F8',
  bg:           '#F8F9FF',
  card:         '#FFFFFF',
  text:         '#111827',
  textSecond:   '#6B7280',
  textMuted:    '#9CA3AF',
  border:       '#E5E7EB',
  shadow:       'rgba(61,90,254,0.10)',
};

// ─── Filter Config ─────────────────────────────────────────────
const EVENT_CATEGORIES = [
  { label: 'Campus Event',      color: COLORS.purple,  bg: COLORS.purpleLight  },
  { label: 'Student Event',     color: COLORS.orange,  bg: COLORS.orangeLight  },
  { label: 'Sports & Fitness',  color: COLORS.green,   bg: COLORS.greenLight   },
  { label: 'Review Session',    color: COLORS.teal,    bg: COLORS.tealLight    },
  { label: 'Hobby & Interest',  color: COLORS.pink,    bg: COLORS.pinkLight    },
  { label: 'Open Presentation', color: COLORS.red,     bg: COLORS.redLight     },
];
const SKILL_OPTIONS = [
  { label: 'Design',   color: COLORS.primary, bg: COLORS.primaryLight },
  { label: 'Dev',      color: COLORS.purple,  bg: COLORS.purpleLight  },
  { label: 'Tutoring', color: COLORS.green,   bg: COLORS.greenLight   },
  { label: 'Video',    color: COLORS.red,     bg: COLORS.redLight     },
  { label: 'Writing',  color: COLORS.orange,  bg: COLORS.orangeLight  },
  { label: 'Photo',    color: COLORS.teal,    bg: COLORS.tealLight    },
];
const SYNC_OPTIONS = [
  { label: 'Paid',      color: COLORS.green,   bg: COLORS.greenLight   },
  { label: 'Collab',    color: COLORS.primary, bg: COLORS.primaryLight },
  { label: 'Volunteer', color: COLORS.orange,  bg: COLORS.orangeLight  },
];

// ─── Mock Data ─────────────────────────────────────────────────
const MOCK_EVENTS: EventItem[] = [
  { id: '1', category: 'Campus Event',      title: 'Hackathon: Build for CIT',              organizer: 'CIT-U Tech Society',     date: 'Jun 14', time: '8:00 AM',  venue: 'AVR Building A',    attendees: 48,  capacity: 80,  color: COLORS.purple },
  { id: '2', category: 'Student Event',     title: 'Photography Exhibit Opening',            organizer: 'CIT-U Fine Arts Dept',   date: 'Jun 16', time: '3:00 PM',  venue: 'Gallery Hall',      attendees: 22,  capacity: 60,  color: COLORS.orange },
  { id: '3', category: 'Review Session',    title: 'Math Review Session — Finals Prep',      organizer: 'Peer Tutors Org',        date: 'Jun 17', time: '10:00 AM', venue: 'Library Annex',     attendees: 31,  capacity: 40,  color: COLORS.teal   },
  { id: '4', category: 'Sports & Fitness',  title: 'Intramural Basketball — Finals',         organizer: 'CIT-U Athletics',        date: 'Jun 18', time: '2:00 PM',  venue: 'Main Gym',          attendees: 120, capacity: 200, color: COLORS.green  },
  { id: '5', category: 'Student Event',     title: 'End-of-Sem Hangout Night',               organizer: 'Student Council',        date: 'Jun 20', time: '6:00 PM',  venue: 'Campus Quadrangle', attendees: 64,  capacity: 150, color: COLORS.orange },
  { id: '6', category: 'Hobby & Interest',  title: 'Chess Tournament — Open to All',         organizer: 'CIT-U Chess Club',       date: 'Jun 21', time: '1:00 PM',  venue: 'CBA Lounge',        attendees: 19,  capacity: 30,  color: COLORS.pink   },
  { id: '7', category: 'Open Presentation', title: 'Social Media & Mental Health — Physio',  organizer: 'Physiology Department',  date: 'Jun 22', time: '2:00 PM',  venue: 'AVR Building B',    attendees: 14,  capacity: 40,  color: COLORS.red    },
];
const MOCK_PEOPLE: PersonItem[] = [
  { id: '1', name: 'Maria Santos',      course: 'BS Computer Science',      yearLevel: '3rd Year', skills: ['UI/UX', 'Figma', 'React Native'],          rating: 4.9, reviews: 14, isVerified: true,  initials: 'MS', accentColor: COLORS.primary },
  { id: '2', name: 'Jed Reyes',         course: 'BS Information Technology', yearLevel: '4th Year', skills: ['Video Editing', 'Motion Graphics', 'Premiere'], rating: 4.8, reviews: 21, isVerified: true,  initials: 'JR', accentColor: COLORS.purple  },
  { id: '3', name: 'Kyla Uy',           course: 'BS Accountancy',            yearLevel: '2nd Year', skills: ['Tutoring', 'Math', 'Accounting'],           rating: 4.7, reviews: 9,  isVerified: false, initials: 'KU', accentColor: COLORS.green   },
  { id: '4', name: 'Franz Lim',         course: 'BS Architecture',           yearLevel: '3rd Year', skills: ['Illustration', 'AutoCAD', 'Graphic Design'], rating: 4.6, reviews: 7,  isVerified: true,  initials: 'FL', accentColor: COLORS.orange  },
  { id: '5', name: 'Bea Montoya',       course: 'BS Marketing',              yearLevel: '4th Year', skills: ['Copywriting', 'Canva', 'Social Media'],     rating: 4.5, reviews: 5,  isVerified: false, initials: 'BM', accentColor: COLORS.teal    },
  { id: '6', name: 'Marco Villanueva',  course: 'BS Computer Engineering',   yearLevel: '3rd Year', skills: ['Web Dev', 'Python', 'Backend'],             rating: 4.8, reviews: 12, isVerified: false, initials: 'MV', accentColor: COLORS.red     },
];
const MOCK_SYNCS: SyncItem[] = [
  { id: '1', title: 'Need a video editor for a 30-sec brand reel',      description: 'Looking for someone who can edit a short promo reel for a small local business. Raw footage is ready, just need cuts + color grade.',  poster: 'Bea Montoya',      posterInitials: 'BM', posterCourse: 'BS Marketing',              accentColor: COLORS.primary, tags: ['Video Editing', 'Color Grade', 'Short-form'], type: 'paid',      budget: '₱500', postedAgo: '2h ago', applicants: 3 },
  { id: '2', title: 'Looking for a dev to build a simple inventory system', description: 'Need a basic web-based inventory tracker for a capstone project. Will use as portfolio piece — no pay but full credit.',              poster: 'Marco Villanueva', posterInitials: 'MV', posterCourse: 'BS Computer Engineering',   accentColor: COLORS.purple,  tags: ['Web Dev', 'React', 'Supabase'],               type: 'collab',              postedAgo: '5h ago', applicants: 7 },
  { id: '3', title: 'Photographer needed for org event this Saturday',   description: 'CIT-U Photography Club is covering Foundation Day activities. We need 1 more shooter. Volunteer — great for your portfolio.',           poster: 'Franz Lim',        posterInitials: 'FL', posterCourse: 'BS Architecture',            accentColor: COLORS.orange,  tags: ['Photography', 'Events', 'Campus'],            type: 'volunteer',           postedAgo: '1d ago', applicants: 2 },
  { id: '4', title: 'Graphic designer for thesis defense poster',        description: 'Need someone to design a clean, professional research poster (A1 size) for my thesis defense next week. Flexible on style.',              poster: 'Kyla Uy',          posterInitials: 'KU', posterCourse: 'BS Accountancy',             accentColor: COLORS.green,   tags: ['Graphic Design', 'Print', 'Layout'],          type: 'paid',      budget: '₱300', postedAgo: '3h ago', applicants: 5 },
  { id: '5', title: 'Co-founder for a campus food delivery startup idea', description: 'Have a validated idea for a student-run delivery service within CIT campus. Looking for a tech co-founder who can handle the app side.', poster: 'Maria Santos',     posterInitials: 'MS', posterCourse: 'BS Computer Science',        accentColor: COLORS.teal,    tags: ['Startup', 'Mobile Dev', 'Co-founder'],        type: 'collab',              postedAgo: '2d ago', applicants: 4 },
];

// ─── FilterShelf ───────────────────────────────────────────────
interface ShelfOption { label: string; color: string; bg: string; }

interface FilterShelfProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: ShelfOption[];
  selected: string[];
  onToggle: (label: string) => void;
  onClear: () => void;
}

const FilterShelf: React.FC<FilterShelfProps> = ({ visible, onClose, title, options, selected, onToggle, onClear }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable style={shelf.backdrop} onPress={onClose} />
    <View style={shelf.sheet}>
      {/* Handle */}
      <View style={shelf.handle} />

      {/* Header */}
      <View style={shelf.header}>
        <Text style={shelf.headerTitle}>{title}</Text>
        <TouchableOpacity onPress={onClear} activeOpacity={0.7}>
          <Text style={shelf.clearText}>Clear all</Text>
        </TouchableOpacity>
      </View>

      {/* Chips grid */}
      <View style={shelf.chipsWrap}>
        {options.map(opt => {
          const active = selected.includes(opt.label);
          return (
            <TouchableOpacity
              key={opt.label}
              onPress={() => onToggle(opt.label)}
              activeOpacity={0.75}
              style={[
                shelf.chip,
                active
                  ? { backgroundColor: opt.color, borderColor: opt.color }
                  : { backgroundColor: opt.bg,    borderColor: opt.color + '55' },
              ]}
            >
              {active && <Text style={shelf.checkmark}>✓ </Text>}
              <Text style={[shelf.chipText, { color: active ? '#fff' : opt.color }]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Apply button */}
      <TouchableOpacity style={shelf.applyBtn} onPress={onClose} activeOpacity={0.85}>
        <Text style={shelf.applyBtnText}>
          {selected.length === 0 ? 'Show all results' : `Show results · ${selected.length} filter${selected.length > 1 ? 's' : ''}`}
        </Text>
      </TouchableOpacity>
    </View>
  </Modal>
);

const shelf = StyleSheet.create({
  backdrop:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  handle:      { width: 40, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 16 },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  clearText:   { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  chipsWrap:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  chip:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  checkmark:   { fontSize: 12, color: '#fff', fontWeight: '800' },
  chipText:    { fontSize: 13, fontWeight: '700' },
  applyBtn:    { backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  applyBtnText:{ fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 0.2 },
});

// ─── ActiveFilterBar ───────────────────────────────────────────
interface ActiveFilterBarProps {
  filters: string[];
  options: ShelfOption[];
  onRemove: (label: string) => void;
}

const ActiveFilterBar: React.FC<ActiveFilterBarProps> = ({ filters, options, onRemove }) => {
  if (filters.length === 0) return null;
  return (
    <View style={bar.wrap}>
      {filters.map(label => {
        const opt   = options.find(o => o.label === label);
        const color = opt?.color ?? COLORS.primary;
        const bg    = opt?.bg    ?? COLORS.primaryLight;
        return (
          <TouchableOpacity key={label} style={[bar.pill, { backgroundColor: bg, borderColor: color + '55' }]} onPress={() => onRemove(label)} activeOpacity={0.7}>
            <Text style={[bar.pillText, { color }]}>{label}</Text>
            <Text style={[bar.pillX, { color }]}>  ✕</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const bar = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 6, marginBottom: 8 },
  pill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1.5 },
  pillText: { fontSize: 12, fontWeight: '700' },
  pillX:    { fontSize: 10, fontWeight: '800' },
});

// ─── Card Components ───────────────────────────────────────────
const EventCard: React.FC<{ item: EventItem }> = ({ item }) => {
  const fill = (item.attendees / item.capacity) * 100;
  const almostFull = fill >= 80;
  return (
    <View style={styles.eventCard}>
      <View style={[styles.eventAccent, { backgroundColor: item.color }]} />
      <View style={styles.eventBody}>
        <View style={styles.eventTopRow}>
          <View style={[styles.catBadge, { backgroundColor: item.color + '22' }]}>
            <Text style={[styles.catBadgeText, { color: item.color }]}>{item.category}</Text>
          </View>
          {almostFull && (
            <View style={styles.almostFullBadge}>
              <Text style={styles.almostFullText}>Almost Full</Text>
            </View>
          )}
        </View>
        <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.eventOrganizer}>{item.organizer}</Text>
        <View style={styles.eventMeta}>
          <Text style={styles.eventMetaText}>📅 {item.date}  ·  🕐 {item.time}</Text>
          <Text style={styles.eventMetaText}>📍 {item.venue}</Text>
        </View>
        <View style={styles.progressRow}>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${fill}%` as any, backgroundColor: item.color }]} />
          </View>
          <Text style={styles.attendeeCount}>{item.attendees}/{item.capacity}</Text>
        </View>
        <TouchableOpacity style={[styles.rsvpBtn, { backgroundColor: item.color }]} activeOpacity={0.8}>
          <Text style={styles.rsvpBtnText}>RSVP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const PersonCard: React.FC<{ item: PersonItem; onViewProfile: (id: string) => void }> = ({ item, onViewProfile }) => (
  <View style={[styles.personCard, item.isVerified && styles.personCardVerified]}>
    {item.isVerified && (
      <View style={styles.verifiedBanner}>
        <Text style={styles.verifiedBannerText}>✓ Verified Talent</Text>
      </View>
    )}
    <View style={styles.personHeader}>
      <View style={[styles.avatar, { backgroundColor: item.accentColor + '22', borderColor: item.accentColor + '44' }]}>
        <Text style={[styles.avatarText, { color: item.accentColor }]}>{item.initials}</Text>
      </View>
      <View style={styles.personInfo}>
        <View style={styles.personNameRow}>
          <Text style={styles.personName}>{item.name}</Text>
          {item.isVerified && <Text style={styles.verifiedIcon}>✓</Text>}
        </View>
        <Text style={styles.personCourse} numberOfLines={1}>{item.course}</Text>
        <Text style={styles.personYear}>{item.yearLevel}</Text>
      </View>
    </View>
    <View style={styles.skillTagsRow}>
      {item.skills.map(skill => (
        <View key={skill} style={styles.skillTag}>
          <Text style={styles.skillTagText}>{skill}</Text>
        </View>
      ))}
    </View>
    <View style={styles.ratingRow}>
      <View style={styles.starRow}>
        {[1,2,3,4,5].map(i => (
          <Text key={i} style={[styles.star, { opacity: i <= Math.round(item.rating) ? 1 : 0.25 }]}>★</Text>
        ))}
      </View>
      <Text style={styles.ratingNum}>{item.rating}</Text>
      <Text style={styles.reviewCount}>({item.reviews} reviews)</Text>
    </View>
    <TouchableOpacity style={[styles.viewProfileBtn, { borderColor: item.accentColor }]} onPress={() => onViewProfile(item.id)} activeOpacity={0.8}>
      <Text style={[styles.viewProfileBtnText, { color: item.accentColor }]}>View Profile →</Text>
    </TouchableOpacity>
  </View>
);

const TYPE_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  paid:      { color: COLORS.green,   bg: COLORS.greenLight,   label: '💸 Paid'       },
  collab:    { color: COLORS.primary, bg: COLORS.primaryLight, label: '🤝 Collab'     },
  volunteer: { color: COLORS.orange,  bg: COLORS.orangeLight,  label: '🙌 Volunteer'  },
};

const SyncCard: React.FC<{ item: SyncItem }> = ({ item }) => {
  const typeStyle = TYPE_STYLE[item.type];
  return (
    <View style={styles.syncCard}>
      <View style={styles.syncTopRow}>
        <View style={[styles.syncTypeBadge, { backgroundColor: typeStyle.bg }]}>
          <Text style={[styles.syncTypeBadgeText, { color: typeStyle.color }]}>{typeStyle.label}</Text>
        </View>
        {item.budget && (
          <View style={styles.budgetBadge}>
            <Text style={styles.budgetText}>{item.budget}</Text>
          </View>
        )}
        <Text style={styles.syncPostedAgo}>{item.postedAgo}</Text>
      </View>
      <Text style={styles.syncTitle}>{item.title}</Text>
      <Text style={styles.syncDescription} numberOfLines={2}>{item.description}</Text>
      <View style={styles.syncTagsRow}>
        {item.tags.map(tag => (
          <View key={tag} style={styles.syncTag}>
            <Text style={styles.syncTagText}>{tag}</Text>
          </View>
        ))}
      </View>
      <View style={styles.syncFooter}>
        <View style={[styles.syncAvatar, { backgroundColor: item.accentColor + '22' }]}>
          <Text style={[styles.syncAvatarText, { color: item.accentColor }]}>{item.posterInitials}</Text>
        </View>
        <View style={styles.syncPosterInfo}>
          <Text style={styles.syncPosterName}>{item.poster}</Text>
          <Text style={styles.syncPosterCourse}>{item.posterCourse}</Text>
        </View>
        <View style={styles.applicantsRow}>
          <Text style={styles.applicantsCount}>{item.applicants}</Text>
          <Text style={styles.applicantsLabel}> applied</Text>
        </View>
      </View>
      <TouchableOpacity style={[styles.applyBtn, { borderColor: item.accentColor }]} activeOpacity={0.8}>
        <Text style={[styles.applyBtnText, { color: item.accentColor }]}>Apply →</Text>
      </TouchableOpacity>
    </View>
  );
};

// ─── Main Screen ───────────────────────────────────────────────
export default function DiscoverScreen({ navigation, onViewProfile }: { navigation?: any; onViewProfile?: (userId: string) => void }) {
  const [activeTab, setActiveTab]   = useState<'Events' | 'People' | 'Syncs'>('Events');
  const [shelfOpen, setShelfOpen]   = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Multi-select filter arrays (empty = show all)
  const [eventFilters, setEventFilters] = useState<string[]>([]);
  const [skillFilters, setSkillFilters] = useState<string[]>([]);
  const [syncFilters,  setSyncFilters]  = useState<string[]>([]);

  const currentFilters = activeTab === 'Events' ? eventFilters : activeTab === 'People' ? skillFilters : syncFilters;
  const currentOptions = activeTab === 'Events' ? EVENT_CATEGORIES : activeTab === 'People' ? SKILL_OPTIONS : SYNC_OPTIONS;
  const currentSetFilters = activeTab === 'Events' ? setEventFilters : activeTab === 'People' ? setSkillFilters : setSyncFilters;

  const toggleFilter = useCallback((set: React.Dispatch<React.SetStateAction<string[]>>, label: string) => {
    set(prev => prev.includes(label) ? prev.filter(f => f !== label) : [...prev, label]);
  }, []);

  const removeFilter = useCallback((label: string) => {
    currentSetFilters(prev => prev.filter(f => f !== label));
  }, [currentSetFilters]);

  const clearFilters = useCallback(() => {
    currentSetFilters([]);
  }, [currentSetFilters]);

  const filteredEvents = useMemo(() => {
    if (eventFilters.length === 0) return MOCK_EVENTS;
    return MOCK_EVENTS.filter(e => eventFilters.includes(e.category));
  }, [eventFilters]);

  const filteredPeople = useMemo(() => {
    let people = [...MOCK_PEOPLE].sort((a, b) => Number(b.isVerified) - Number(a.isVerified));
    if (skillFilters.length > 0) {
      people = people.filter(p =>
        skillFilters.some(f => p.skills.some(s => s.toLowerCase().includes(f.toLowerCase())))
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      people = people.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.skills.some(s => s.toLowerCase().includes(q))
      );
    }
    return people;
  }, [skillFilters, searchQuery]);

  const filteredSyncs = useMemo(() => {
    if (syncFilters.length === 0) return MOCK_SYNCS;
    return MOCK_SYNCS.filter(s => syncFilters.map(f => f.toLowerCase()).includes(s.type));
  }, [syncFilters]);

  const TAB_LABELS: { key: 'Events' | 'People' | 'Syncs'; icon: string }[] = [
    { key: 'Events', icon: '📅' },
    { key: 'People', icon: '🎓' },
    { key: 'Syncs',  icon: '🔗' },
  ];

  const filterCount = currentFilters.length;

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Discover</Text>
          <Text style={styles.headerSub}>CIT University</Text>
        </View>
        {/* Filter trigger */}
        <TouchableOpacity style={styles.filterTrigger} onPress={() => setShelfOpen(true)} activeOpacity={0.8}>
          <Text style={styles.filterTriggerText}>⊞ Filter</Text>
          {filterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{filterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabSwitcher}>
        {TAB_LABELS.map(({ key, icon }) => (
          <TouchableOpacity
            key={key}
            style={[styles.tabBtn, activeTab === key && styles.tabBtnActive]}
            onPress={() => setActiveTab(key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabBtnText, activeTab === key && styles.tabBtnTextActive]}>
              {icon} {key}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Active filter pills */}
      <ActiveFilterBar filters={currentFilters} options={currentOptions} onRemove={removeFilter} />

      {/* Events Tab */}
      {activeTab === 'Events' && (
        <View style={{ flex: 1 }}>
          {filteredEvents.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyText}>No events match</Text>
              <Text style={styles.emptySubtext}>Try clearing some filters</Text>
            </View>
          ) : (
            <FlatList<EventItem>
              data={filteredEvents}
              keyExtractor={item => item.id}
              renderItem={({ item }: ListRenderItemInfo<EventItem>) => <EventCard item={item} />}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      )}

      {/* People Tab */}
      {activeTab === 'People' && (
        <View style={{ flex: 1 }}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Find a designer, tutor, developer..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.searchClear}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          {filteredPeople.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>No results found</Text>
              <Text style={styles.emptySubtext}>Try a different skill or name</Text>
            </View>
          ) : (
            <FlatList<PersonItem>
              data={filteredPeople}
              keyExtractor={item => item.id}
              renderItem={({ item }: ListRenderItemInfo<PersonItem>) => (
                <PersonCard item={item} onViewProfile={id => onViewProfile?.(id)} />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      )}

      {/* Syncs Tab */}
      {activeTab === 'Syncs' && (
        <View style={{ flex: 1 }}>
          {filteredSyncs.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔗</Text>
              <Text style={styles.emptyText}>No syncs found</Text>
              <Text style={styles.emptySubtext}>Try clearing some filters</Text>
            </View>
          ) : (
            <FlatList<SyncItem>
              data={filteredSyncs}
              keyExtractor={item => item.id}
              renderItem={({ item }: ListRenderItemInfo<SyncItem>) => <SyncCard item={item} />}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      )}

      {/* Filter Shelf */}
      <FilterShelf
        visible={shelfOpen}
        onClose={() => setShelfOpen(false)}
        title={`Filter ${activeTab}`}
        options={currentOptions}
        selected={currentFilters}
        onToggle={label => toggleFilter(currentSetFilters, label)}
        onClear={clearFilters}
      />
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: COLORS.text, letterSpacing: -0.5 },
  headerSub:   { fontSize: 13, fontWeight: '600', color: COLORS.primary },

  filterTrigger: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.border,
  },
  filterTriggerText: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  filterBadge:       { backgroundColor: COLORS.primary, borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  filterBadgeText:   { fontSize: 11, fontWeight: '800', color: '#fff' },

  tabSwitcher: {
    flexDirection: 'row', marginHorizontal: 20, marginBottom: 8,
    backgroundColor: '#fff', borderRadius: 12, padding: 4,
    borderWidth: 1, borderColor: COLORS.border,
  },
  tabBtn:           { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center' },
  tabBtnActive:     { backgroundColor: COLORS.primary },
  tabBtnText:       { fontSize: 13, fontWeight: '600', color: COLORS.textSecond },
  tabBtnTextActive: { color: '#fff' },

  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    marginHorizontal: 20, marginBottom: 10,
    paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
  searchIcon:  { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text },
  searchClear: { fontSize: 14, color: COLORS.textMuted, padding: 4 },

  listContent: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 100, gap: 14 },

  // Event Card
  eventCard:       { backgroundColor: COLORS.card, borderRadius: 16, flexDirection: 'row', overflow: 'hidden', shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 8, elevation: 3 },
  eventAccent:     { width: 5 },
  eventBody:       { flex: 1, padding: 14 },
  eventTopRow:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  catBadge:        { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 6 },
  catBadgeText:    { fontSize: 11, fontWeight: '700' },
  almostFullBadge: { backgroundColor: COLORS.redLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  almostFullText:  { fontSize: 11, fontWeight: '600', color: COLORS.red },
  eventTitle:      { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 3, letterSpacing: -0.2 },
  eventOrganizer:  { fontSize: 12, color: COLORS.textSecond, marginBottom: 8 },
  eventMeta:       { gap: 2, marginBottom: 10 },
  eventMetaText:   { fontSize: 12, color: COLORS.textSecond },
  progressRow:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  progressBg:      { flex: 1, height: 5, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  progressFill:    { height: '100%', borderRadius: 3 },
  attendeeCount:   { fontSize: 11, fontWeight: '600', color: COLORS.textSecond },
  rsvpBtn:         { paddingVertical: 9, borderRadius: 10, alignItems: 'center' },
  rsvpBtnText:     { fontSize: 13, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },

  // Person Card
  personCard:         { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 8, elevation: 3, borderWidth: 1.5, borderColor: 'transparent' },
  personCardVerified: { borderColor: COLORS.green + '55' },
  verifiedBanner:     { backgroundColor: COLORS.greenLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 10 },
  verifiedBannerText: { fontSize: 11, fontWeight: '700', color: COLORS.green },
  personHeader:       { flexDirection: 'row', gap: 12, marginBottom: 12 },
  avatar:             { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  avatarText:         { fontSize: 17, fontWeight: '800' },
  personInfo:         { flex: 1, justifyContent: 'center' },
  personNameRow:      { flexDirection: 'row', alignItems: 'center', gap: 5 },
  personName:         { fontSize: 16, fontWeight: '800', color: COLORS.text, letterSpacing: -0.2 },
  verifiedIcon:       { fontSize: 13, color: COLORS.green, fontWeight: '800' },
  personCourse:       { fontSize: 12, color: COLORS.textSecond, marginTop: 1 },
  personYear:         { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  skillTagsRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  skillTag:           { backgroundColor: COLORS.primaryLight, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 7 },
  skillTagText:       { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  ratingRow:          { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 12 },
  starRow:            { flexDirection: 'row' },
  star:               { fontSize: 13, color: COLORS.orange },
  ratingNum:          { fontSize: 13, fontWeight: '800', color: COLORS.text },
  reviewCount:        { fontSize: 12, color: COLORS.textMuted },
  viewProfileBtn:     { paddingVertical: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1.5 },
  viewProfileBtnText: { fontSize: 13, fontWeight: '700' },

  // Sync Card
  syncCard:          { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 8, elevation: 3 },
  syncTopRow:        { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  syncTypeBadge:     { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 6 },
  syncTypeBadgeText: { fontSize: 11, fontWeight: '700' },
  budgetBadge:       { backgroundColor: COLORS.greenLight, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 6 },
  budgetText:        { fontSize: 11, fontWeight: '700', color: COLORS.green },
  syncPostedAgo:     { fontSize: 11, color: COLORS.textMuted, marginLeft: 'auto' as any },
  syncTitle:         { fontSize: 15, fontWeight: '800', color: COLORS.text, marginBottom: 6, letterSpacing: -0.2 },
  syncDescription:   { fontSize: 13, color: COLORS.textSecond, lineHeight: 19, marginBottom: 10 },
  syncTagsRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  syncTag:           { backgroundColor: COLORS.bg, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 7, borderWidth: 1, borderColor: COLORS.border },
  syncTagText:       { fontSize: 11, fontWeight: '600', color: COLORS.textSecond },
  syncFooter:        { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  syncAvatar:        { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  syncAvatarText:    { fontSize: 13, fontWeight: '800' },
  syncPosterInfo:    { flex: 1 },
  syncPosterName:    { fontSize: 13, fontWeight: '700', color: COLORS.text },
  syncPosterCourse:  { fontSize: 11, color: COLORS.textMuted },
  applicantsRow:     { flexDirection: 'row', alignItems: 'center' },
  applicantsCount:   { fontSize: 13, fontWeight: '800', color: COLORS.primary },
  applicantsLabel:   { fontSize: 12, color: COLORS.textMuted },
  applyBtn:          { paddingVertical: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1.5 },
  applyBtnText:      { fontSize: 13, fontWeight: '700' },

  // Empty State
  emptyState:   { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyIcon:    { fontSize: 40, marginBottom: 12 },
  emptyText:    { fontSize: 16, fontWeight: '700', color: COLORS.text },
  emptySubtext: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
});
