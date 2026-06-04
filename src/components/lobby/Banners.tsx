import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../../constants/theme';
import { AcademicDeadline, IntramuralsScore } from '../../constants/mockData';

// ─── Academic Sync Banner ────────────────────────────────────────────────────
interface AcademicBannerProps {
  deadline: AcademicDeadline;
}

export const AcademicSyncBanner: React.FC<AcademicBannerProps> = ({ deadline }) => {
  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.academicBanner}>
      <View style={styles.academicLeft}>
        <View style={styles.teamsIcon}>
          <Text style={styles.teamsIconText}>T</Text>
        </View>
        <View>
          <Text style={styles.academicLabel}>MS Teams · Next Deadline</Text>
          <Text style={styles.academicTitle}>{deadline.title}</Text>
          <Text style={styles.academicSubject}>{deadline.subject}</Text>
        </View>
      </View>
      <View style={styles.dueChip}>
        <Text style={styles.dueChipText}>Due in</Text>
        <Text style={styles.dueTime}>{deadline.dueIn}</Text>
      </View>
    </TouchableOpacity>
  );
};

// ─── Intramurals Scoreboard Banner ───────────────────────────────────────────
interface IntramuralsBannerProps {
  score: IntramuralsScore;
}

export const IntramuralsBanner: React.FC<IntramuralsBannerProps> = ({ score }) => {
  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.intramuralsBanner}>
      <View style={styles.intramuralsTop}>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        <Text style={styles.sportLabel}>{score.sport}</Text>
      </View>

      <View style={styles.scoreRow}>
        <View style={styles.teamBlock}>
          <Text style={styles.teamName}>{score.teamA}</Text>
          <Text style={styles.scoreNum}>{score.scoreA}</Text>
        </View>
        <Text style={styles.vs}>VS</Text>
        <View style={[styles.teamBlock, styles.teamBlockRight]}>
          <Text style={styles.teamName}>{score.teamB}</Text>
          <Text style={styles.scoreNum}>{score.scoreB}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Academic Banner
  academicBanner: {
    backgroundColor: '#EEF2FF',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  academicLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  teamsIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamsIconText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: FontSize.md,
  },
  academicLabel: {
    fontSize: FontSize.xs,
    color: '#6366F1',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  academicTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  academicSubject: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
  },
  dueChip: {
    alignItems: 'center',
  },
  dueChipText: {
    fontSize: FontSize.xs,
    color: '#6366F1',
    fontWeight: '600',
  },
  dueTime: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: '#4F46E5',
  },

  // Intramurals Banner
  intramuralsBanner: {
    backgroundColor: '#0F1117',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  intramuralsTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
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
  sportLabel: {
    fontSize: FontSize.sm,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamBlock: {
    flex: 1,
    alignItems: 'flex-start',
  },
  teamBlockRight: {
    alignItems: 'flex-end',
  },
  teamName: {
    fontSize: FontSize.sm,
    color: '#9CA3AF',
    fontWeight: '600',
    marginBottom: 2,
  },
  scoreNum: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 40,
  },
  vs: {
    fontSize: FontSize.sm,
    color: '#4B5563',
    fontWeight: '700',
    letterSpacing: 1,
  },
});
