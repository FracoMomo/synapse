import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../constants/theme';
import { useCalendar, WeekDay, CalendarEventWithStatus } from '../hooks/useCalendar';

// ── Formatters ────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'January','February','March','April',
  'May','June','July','August',
  'September','October','November','December',
];

function formatTime(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function getEventTypeLabel(type: CalendarEventWithStatus['type']): string {
  switch (type) {
    case 'class':        return 'Class';
    case 'deadline':     return 'Deadline';
    case 'lobby':        return 'Lobby';
    case 'campus_event': return 'Event';
  }
}

function getSourceIcon(source: CalendarEventWithStatus['source']): string {
  switch (source) {
    case 'teams':   return '📘';
    case 'synapse': return '🔷';
    case 'manual':  return '📝';
  }
}

// ── WeekDayChip ───────────────────────────────────────────────────────────

const WeekDayChip: React.FC<{
  day: WeekDay;
  isSelected: boolean;
  onPress: () => void;
}> = ({ day, isSelected, onPress }) => (
  <TouchableOpacity
    style={[
      styles.dayChip,
      day.isToday && !isSelected && styles.dayChipToday,
      isSelected && styles.dayChipSelected,
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
      {day.label}
    </Text>
    <Text style={[
      styles.dayNum,
      day.isToday && !isSelected && styles.dayNumToday,
      isSelected && styles.dayNumSelected,
    ]}>
      {day.dayNum}
    </Text>
    {day.isToday && (
      <View style={[styles.todayDot, isSelected && styles.todayDotSelected]} />
    )}
  </TouchableOpacity>
);

// ── MsTeamsBanner ─────────────────────────────────────────────────────────

const MsTeamsBanner: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <TouchableOpacity
    style={styles.teamsBanner}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <View style={styles.teamsBannerLeft}>
      <Text style={styles.teamsIconLarge}>📘</Text>
      <View style={styles.teamsBannerText}>
        <Text style={styles.teamsBannerTitle}>Sync with MS Teams</Text>
        <Text style={styles.teamsBannerSub}>
          Pull your class schedule &amp; deadlines automatically
        </Text>
      </View>
    </View>
    <View style={styles.connectBtn}>
      <Text style={styles.connectBtnText}>Connect →</Text>
    </View>
  </TouchableOpacity>
);

// ── EventCard ─────────────────────────────────────────────────────────────

const EventCard: React.FC<{ event: CalendarEventWithStatus }> = ({ event }) => {
  const isDeadline = event.type === 'deadline';

  return (
    <View style={styles.eventRow}>
      {/* Time column */}
      <View style={styles.timeCol}>
        <Text style={[styles.startTime, isDeadline && styles.startTimeDeadline]}>
          {formatTime(event.startTime)}
        </Text>
        {event.endTime && (
          <Text style={styles.endTime}>{formatTime(event.endTime)}</Text>
        )}
      </View>

      {/* Card */}
      <View style={[styles.eventCard, { borderLeftColor: event.color }]}>
        {/* Header row: icon + title + badge */}
        <View style={styles.eventCardHeader}>
          <View style={styles.eventTitleRow}>
            <Text style={styles.sourceIcon}>{getSourceIcon(event.source)}</Text>
            <Text style={styles.eventTitle} numberOfLines={2}>
              {event.title}
            </Text>
          </View>
          {event.isNow && (
            <View style={[styles.badge, styles.badgeNow]}>
              <Text style={styles.badgeText}>NOW</Text>
            </View>
          )}
          {event.isDue && !event.isNow && (
            <View style={[styles.badge, styles.badgeDue]}>
              <Text style={styles.badgeText}>DUE</Text>
            </View>
          )}
        </View>

        {/* Meta row: venue / subject + type pill */}
        <View style={styles.eventMeta}>
          {event.venue ? (
            <Text style={styles.eventMetaText} numberOfLines={1}>
              📍 {event.venue}
            </Text>
          ) : event.subject ? (
            <Text style={styles.eventMetaText} numberOfLines={1}>
              📚 {event.subject}
            </Text>
          ) : null}
          <View style={[styles.typePill, { backgroundColor: event.color + '18' }]}>
            <Text style={[styles.typePillText, { color: event.color }]}>
              {getEventTypeLabel(event.type)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// ── EmptyDay ──────────────────────────────────────────────────────────────

const EmptyDay: React.FC<{ isMsLinked: boolean }> = ({ isMsLinked }) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyIcon}>🗓</Text>
    <Text style={styles.emptyTitle}>Nothing scheduled</Text>
    <Text style={styles.emptySub}>
      {isMsLinked
        ? 'No classes or events on this day.'
        : 'Connect MS Teams above to pull your class schedule.'}
    </Text>
  </View>
);

// ── CalendarScreen ────────────────────────────────────────────────────────

export const CalendarScreen: React.FC = () => {
  const {
    weekDays,
    selectedKey,
    selectedDay,
    setSelectedKey,
    eventsForDay,
    isMsTeamsLinked,
    linkMsTeams,
  } = useCalendar();

  const d = selectedDay.date;
  const monthLabel = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  const dayLabel = selectedDay.isToday
    ? `Today, ${d.toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })}`
    : d.toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <View style={styles.screen}>
      {/* ── Calendar header: month + week strip ── */}
      <View style={styles.calHeader}>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.weekStrip}
        >
          {weekDays.map(day => (
            <WeekDayChip
              key={day.key}
              day={day}
              isSelected={day.key === selectedKey}
              onPress={() => setSelectedKey(day.key)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.divider} />

      {/* ── Timeline ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.timelineContent}
      >
        {/* Day label + count */}
        <View style={styles.dayHeader}>
          <Text style={styles.dayHeaderText}>{dayLabel}</Text>
          <Text style={styles.eventCount}>
            {eventsForDay.length} event{eventsForDay.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* MS Teams connect banner (shown until linked) */}
        {!isMsTeamsLinked && (
          <MsTeamsBanner onPress={linkMsTeams} />
        )}

        {/* Events or empty state */}
        {eventsForDay.length === 0 ? (
          <EmptyDay isMsLinked={isMsTeamsLinked} />
        ) : (
          <View style={styles.eventList}>
            {eventsForDay.map((ev, i) => (
              <React.Fragment key={ev.id}>
                {i > 0 && <View style={styles.eventGap} />}
                <EventCard event={ev} />
              </React.Fragment>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg.surface },

  // ── Calendar header ──
  calHeader: {
    backgroundColor: Colors.bg.card,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    ...Shadow.card,
  },
  monthLabel: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.text.primary,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  weekStrip: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
    paddingRight: Spacing.xl,
  },

  // ── Day chip ──
  dayChip: {
    width: 42,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    position: 'relative',
  },
  dayChipToday: {
    backgroundColor: Colors.bg.muted,
  },
  dayChipSelected: {
    backgroundColor: Colors.primary,
  },
  dayLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 3,
  },
  dayLabelSelected: {
    color: Colors.text.inverse,
  },
  dayNum: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  dayNumToday: {
    color: Colors.primary,
  },
  dayNumSelected: {
    color: Colors.text.inverse,
  },
  todayDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  todayDotSelected: {
    backgroundColor: Colors.text.inverse,
  },

  divider: { height: 1, backgroundColor: Colors.border },

  // ── Timeline ──
  timelineContent: { paddingBottom: 100, paddingTop: Spacing.lg },

  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  dayHeaderText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.text.primary,
    flex: 1,
  },
  eventCount: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    fontWeight: '500',
  },

  // ── MS Teams banner ──
  teamsBanner: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: '#E8EEFF',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  teamsBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  teamsIconLarge: { fontSize: 26 },
  teamsBannerText: { flex: 1 },
  teamsBannerTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  teamsBannerSub: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    marginTop: 1,
    lineHeight: 16,
  },
  connectBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    marginLeft: Spacing.sm,
  },
  connectBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.text.inverse,
  },

  // ── Event list ──
  eventList: { paddingHorizontal: Spacing.lg },
  eventGap: { height: Spacing.md },

  // ── Event row ──
  eventRow: { flexDirection: 'row', gap: Spacing.sm },

  timeCol: {
    width: 62,
    alignItems: 'flex-end',
    paddingTop: 3,
    flexShrink: 0,
  },
  startTime: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text.secondary,
  },
  startTimeDeadline: {
    color: Colors.accent.red,
  },
  endTime: {
    fontSize: 10,
    color: Colors.text.muted,
    marginTop: 2,
  },

  // ── Event card ──
  eventCard: {
    flex: 1,
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    borderLeftWidth: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Shadow.card,
  },
  eventCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  eventTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
    flex: 1,
  },
  sourceIcon: { fontSize: 11, marginTop: 1.5 },
  eventTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.text.primary,
    flex: 1,
    lineHeight: 18,
  },

  // ── NOW / DUE badges ──
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    flexShrink: 0,
  },
  badgeNow: { backgroundColor: Colors.accent.green },
  badgeDue: { backgroundColor: Colors.accent.red },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.text.inverse,
    letterSpacing: 0.5,
  },

  // ── Event meta row ──
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  eventMetaText: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    flex: 1,
  },
  typePill: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    flexShrink: 0,
  },
  typePillText: {
    fontSize: 10,
    fontWeight: '600',
  },

  // ── Empty state ──
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: Spacing.xxxl,
  },
  emptyIcon: { fontSize: 40, marginBottom: Spacing.md },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
