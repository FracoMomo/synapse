import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize } from '../constants/theme';

interface Props {
  universityName?: string;
  universityShort?: string;
  email?: string;
  nextClass?: string;
  notificationCount?: number;
}

export const GlobalHeader: React.FC<Props> = ({
  universityName = 'University',
  universityShort,
  email = '',
  nextClass = '4:00 PM',
  notificationCount = 3,
}) => {
  const insets = useSafeAreaInsets();

  const shortName = universityShort ??
    universityName
      .split(' ')
      .filter(w => w.length > 2)
      .map(w => w[0])
      .join('')
      .toUpperCase();

  return (
    <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>

      {/* ── Left: logo + text ── */}
      <View style={styles.uniBlock}>
        <View style={styles.uniLogo}>
          <Text style={styles.uniLogoText}>{shortName[0]}</Text>
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.uniName} numberOfLines={1} ellipsizeMode="tail">
            {universityName}
          </Text>
          <View style={styles.verifiedRow}>
            <Text style={styles.emailText} numberOfLines={1} ellipsizeMode="middle">
              {email}
            </Text>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ .edu</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── Right: next class chip + bell ── */}
      <View style={styles.rightBlock}>
        <View style={styles.nextClassChip}>
          <Text style={styles.nextClassLabel}>NEXT</Text>
          <Text style={styles.nextClassTime}>{nextClass}</Text>
        </View>
        <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
          <Ionicons name="notifications" size={20} color="#fff" />
          {notificationCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {notificationCount > 9 ? '9+' : notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.bg.shell,
    gap: Spacing.sm,
  },
  uniBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minWidth: 0,
  },
  uniLogo: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  uniLogoText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: FontSize.md,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  uniName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
  },
  emailText: {
    fontSize: 10,
    color: '#9CA3AF',
    flexShrink: 1,
    minWidth: 0,
  },
  verifiedBadge: {
    backgroundColor: Colors.accent.green + '25',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    flexShrink: 0,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.accent.green,
    letterSpacing: 0.3,
  },
  rightBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexShrink: 0,
  },
  nextClassChip: {
    backgroundColor: '#1F2937',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextClassLabel: {
    fontSize: 9,
    color: '#9CA3AF',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  nextClassTime: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bellBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.accent.red,
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 7,
    color: '#fff',
    fontWeight: '800',
  },
});
