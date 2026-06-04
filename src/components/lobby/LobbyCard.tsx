import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../../constants/theme';
import { LobbyCard as LobbyCardType } from '../../constants/mockData';

interface Props {
  lobby: LobbyCardType;
  isGrid?: boolean;
  onJoin?: (id: string) => void;
  onLeave?: (id: string) => void;
}

const TYPE_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  studyBlock:       { color: Colors.lobby.studyBlock,       icon: '📚', label: 'Study Block'       },
  campusEvent:      { color: Colors.lobby.campusEvent,      icon: '🏫', label: 'Campus Event'       },
  studentEvent:     { color: Colors.lobby.studentEvent,     icon: '🎉', label: 'Student Event'      },
  sports:           { color: Colors.lobby.sports,           icon: '⚽', label: 'Sports & Fitness'   },
  reviewSession:    { color: Colors.lobby.reviewSession,    icon: '✏️', label: 'Review Session'     },
  hobbyInterest:    { color: Colors.lobby.hobbyInterest,    icon: '🎮', label: 'Hobby & Interest'   },
  openPresentation: { color: Colors.lobby.openPresentation, icon: '🎤', label: 'Open Presentation'  },
};

const YEAR_COLORS: Record<string, string> = {
  '1st Year': '#3D5AFE',
  '2nd Year': '#7C3AED',
  '3rd Year': '#10B981',
  '4th Year': '#F59E0B',
  'Any':      '#6B7280',
};

export const LobbyCardComponent: React.FC<Props> = ({ lobby, isGrid = false, onJoin, onLeave }) => {
  const [joined, setJoined] = useState(lobby.hasJoined);
  const [count, setCount] = useState(lobby.joined);
  const config = TYPE_CONFIG[lobby.type];
  const fillPercent = count / lobby.capacity;
  const isFull = count >= lobby.capacity;

  const handlePress = () => {
    if (joined) {
      setJoined(false);
      setCount(c => c - 1);
      onLeave?.(lobby.id);
    } else if (!isFull) {
      setJoined(true);
      setCount(c => c + 1);
      onJoin?.(lobby.id);
    }
  };

  // ── Grid (compact) card ──────────────────────────────────────────────────
  if (isGrid) {
    return (
      <View style={[styles.gridCard, { borderTopColor: config.color }]}>
        {/* Type icon + LIVE badge */}
        <View style={styles.gridTopRow}>
          <View style={[styles.gridTypeBadge, { backgroundColor: config.color + '18' }]}>
            <Text style={styles.gridTypeIcon}>{config.icon}</Text>
            <Text style={[styles.gridTypeBadgeText, { color: config.color }]} numberOfLines={1}>
              {config.label}
            </Text>
          </View>
          {lobby.isLive && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>

        {/* Title */}
        <Text style={styles.gridTitle} numberOfLines={2}>{lobby.title}</Text>
        <Text style={styles.gridHost} numberOfLines={1}>by {lobby.host}</Text>

        {/* Time + Venue */}
        <Text style={styles.gridMeta} numberOfLines={1}>🕐 {lobby.time}</Text>
        <Text style={styles.gridMeta} numberOfLines={1}>📍 {lobby.venue}</Text>

        {/* Progress bar */}
        <View style={styles.gridProgressBg}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(fillPercent * 100, 100)}%`,
                backgroundColor: isFull ? Colors.accent.red : config.color,
              },
            ]}
          />
        </View>
        <Text style={styles.gridCapacityText}>{count}/{lobby.capacity}</Text>

        {/* Join button */}
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.8}
          style={[
            styles.gridJoinBtn,
            { backgroundColor: joined ? 'transparent' : config.color },
            joined && { borderWidth: 1.5, borderColor: Colors.accent.red },
            isFull && !joined && { backgroundColor: Colors.bg.muted },
          ]}
          disabled={isFull && !joined}
        >
          <Text style={[
            styles.gridJoinBtnText,
            joined && { color: Colors.accent.red },
            isFull && !joined && { color: Colors.text.muted },
          ]}>
            {isFull && !joined ? 'Full' : joined ? 'Leave' : 'Join'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── List (full) card ─────────────────────────────────────────────────────
  return (
    <View style={styles.card}>
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: config.color }]} />

      <View style={styles.body}>
        {/* Top row */}
        <View style={styles.topRow}>
          <View style={styles.badges}>
            <View style={[styles.typeBadge, { backgroundColor: config.color + '18' }]}>
              <Text style={styles.typeIcon}>{config.icon}</Text>
              <Text style={[styles.typeBadgeText, { color: config.color }]}>
                {config.label}
              </Text>
            </View>
            <View style={[styles.yearBadge, { backgroundColor: YEAR_COLORS[lobby.yearLevel] + '18' }]}>
              <Text style={[styles.yearBadgeText, { color: YEAR_COLORS[lobby.yearLevel] }]}>
                {lobby.yearLevel}
              </Text>
            </View>
            {lobby.isLive && (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
          </View>
        </View>

        {/* Title + host */}
        <Text style={styles.title}>{lobby.title}</Text>
        <Text style={styles.host}>hosted by {lobby.host}</Text>

        {/* Meta row */}
        <View style={styles.metaRow}>
          <Text style={styles.metaItem}>🕐 {lobby.time}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaItem}>📍 {lobby.venue}</Text>
        </View>

        {/* Capacity + Join */}
        <View style={styles.bottomRow}>
          <View style={styles.capacityBlock}>
            <View style={styles.progressBg}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(fillPercent * 100, 100)}%`,
                    backgroundColor: isFull ? Colors.accent.red : config.color,
                  },
                ]}
              />
            </View>
            <Text style={styles.capacityText}>
              {count}/{lobby.capacity} joined
            </Text>
          </View>

          <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.8}
            style={[
              styles.joinBtn,
              joined && styles.joinBtnLeave,
              isFull && !joined && styles.joinBtnFull,
            ]}
            disabled={isFull && !joined}
          >
            <Text
              style={[
                styles.joinBtnText,
                joined && styles.joinBtnTextLeave,
                isFull && !joined && styles.joinBtnTextFull,
              ]}
            >
              {isFull && !joined ? 'Full' : joined ? 'Leave' : 'Join'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // ── Grid card ──
  gridCard: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    borderTopWidth: 3,
    padding: Spacing.md,
    gap: 4,
    ...Shadow.card,
    // width set by parent flex layout
  },
  gridTopRow:      { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
  gridTypeBadge:   { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.pill, flex: 1 },
  gridTypeIcon:    { fontSize: 10 },
  gridTypeBadgeText:{ fontSize: 9, fontWeight: '700', flexShrink: 1 },
  gridTitle:       { fontSize: FontSize.md, fontWeight: '800', color: Colors.text.primary, lineHeight: 20, marginTop: 2 },
  gridHost:        { fontSize: 11, color: Colors.text.muted },
  gridMeta:        { fontSize: 11, color: Colors.text.secondary },
  gridProgressBg:  { height: 3, backgroundColor: Colors.bg.muted, borderRadius: Radius.pill, overflow: 'hidden', marginTop: 6 },
  gridCapacityText:{ fontSize: 10, color: Colors.text.muted },
  gridJoinBtn:     { paddingVertical: 7, borderRadius: Radius.pill, alignItems: 'center', marginTop: 4 },
  gridJoinBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: '#fff' },

  // ── List card ──
  card: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    overflow: 'hidden',
    ...Shadow.card,
  },
  accentBar: {
    width: 4,
    borderRadius: 0,
  },
  body: {
    flex: 1,
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badges: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    gap: 4,
  },
  typeIcon:     { fontSize: 11 },
  typeBadgeText:{ fontSize: FontSize.xs, fontWeight: '600' },
  yearBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  yearBadgeText: { fontSize: FontSize.xs, fontWeight: '600' },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    gap: 4,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: Colors.accent.red,
  },
  liveText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.accent.red,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text.primary,
    marginTop: 4,
  },
  host:    { fontSize: FontSize.sm, color: Colors.text.secondary },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 2,
  },
  metaItem: { fontSize: FontSize.sm, color: Colors.text.secondary },
  metaDot:  { color: Colors.text.muted, fontSize: FontSize.sm },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  capacityBlock: {
    flex: 1,
    gap: 4,
    marginRight: Spacing.lg,
  },
  progressBg: {
    height: 4,
    backgroundColor: Colors.bg.muted,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  progressFill:    { height: '100%', borderRadius: Radius.pill },
  capacityText:    { fontSize: FontSize.xs, color: Colors.text.muted },
  joinBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
  },
  joinBtnLeave: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.accent.red,
  },
  joinBtnFull:         { backgroundColor: Colors.bg.muted },
  joinBtnText:         { color: Colors.text.inverse, fontWeight: '700', fontSize: FontSize.sm },
  joinBtnTextLeave:    { color: Colors.accent.red },
  joinBtnTextFull:     { color: Colors.text.muted },
});