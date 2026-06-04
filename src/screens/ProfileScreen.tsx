// screens/ProfileScreen.tsx
// Synapse — Phase 6.2: Edit Profile flow (full_name, course, year_level)

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../lib/AuthContext';
import { Colors, Spacing, Radius, FontSize } from '../constants/theme';
import { supabase } from '../lib/supabase';
import { useImageUpload } from '../hooks/useImageUpload';
import { avatarPath } from '../lib/storage';

interface Props {
  onViewPortfolio: () => void;
  onViewOnboarding: () => void;
}

// ─── Year level options ───────────────────────────────────────────────────────

const YEAR_LEVELS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Graduate'];

// ─── Edit Profile Modal ───────────────────────────────────────────────────────

interface EditProfileModalProps {
  visible: boolean;
  initialName: string;
  initialCourse: string;
  initialYear: string;
  onClose: () => void;
  onSave: (fullName: string, course: string, yearLevel: string) => Promise<void>;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible, initialName, initialCourse, initialYear, onClose, onSave,
}) => {
  const [fullName,  setFullName]  = useState(initialName);
  const [course,    setCourse]    = useState(initialCourse);
  const [yearLevel, setYearLevel] = useState(initialYear);
  const [saving,    setSaving]    = useState(false);

  // Reset form to latest prop values when modal opens
  React.useEffect(() => {
    if (visible) {
      setFullName(initialName);
      setCourse(initialCourse);
      setYearLevel(initialYear);
    }
  }, [visible, initialName, initialCourse, initialYear]);

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Name required', 'Please enter your full name.');
      return;
    }
    setSaving(true);
    await onSave(fullName.trim(), course.trim(), yearLevel);
    setSaving(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={editStyles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={editStyles.sheet}>
          <View style={editStyles.handle} />
          <Text style={editStyles.title}>Edit Profile</Text>

          <Text style={editStyles.label}>Full Name</Text>
          <TextInput
            style={editStyles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="e.g. Juan dela Cruz"
            placeholderTextColor={Colors.text.muted}
            autoCapitalize="words"
            returnKeyType="next"
          />

          <Text style={editStyles.label}>Course</Text>
          <TextInput
            style={editStyles.input}
            value={course}
            onChangeText={setCourse}
            placeholder="e.g. BS Computer Science"
            placeholderTextColor={Colors.text.muted}
            autoCapitalize="words"
            returnKeyType="next"
          />

          <Text style={editStyles.label}>Year Level</Text>
          <View style={editStyles.yearRow}>
            {YEAR_LEVELS.map(y => (
              <TouchableOpacity
                key={y}
                style={[
                  editStyles.yearChip,
                  yearLevel === y && editStyles.yearChipActive,
                ]}
                onPress={() => setYearLevel(y)}
                activeOpacity={0.75}
              >
                <Text style={[
                  editStyles.yearChipText,
                  yearLevel === y && editStyles.yearChipTextActive,
                ]}>{y}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[editStyles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={editStyles.saveBtnText}>Save Changes</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={editStyles.cancelBtn} activeOpacity={0.7}>
            <Text style={editStyles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

interface MenuItemProps {
  icon: string;
  label: string;
  onPress?: () => void;
  badge?: number;
  accent?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, onPress, badge, accent }) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.menuIcon, accent && styles.menuIconAccent]}>
      <Text style={styles.menuIconText}>{icon}</Text>
    </View>
    <Text style={[styles.menuLabel, accent && styles.menuLabelAccent]}>{label}</Text>
    <View style={styles.menuRight}>
      {badge !== undefined && badge > 0 && (
        <View style={styles.menuBadge}>
          <Text style={styles.menuBadgeText}>{badge}</Text>
        </View>
      )}
      <Text style={[styles.menuChevron, accent ? { color: Colors.primary } : {}]}>›</Text>
    </View>
  </TouchableOpacity>
);

export const ProfileScreen: React.FC<Props> = ({ onViewPortfolio, onViewOnboarding }) => {
  const { profile, user, signOut, setProfile } = useAuth();
  const { uploading, pickAndUpload } = useImageUpload();

  // Optimistic local avatar URI — shows immediately after pick before Supabase confirms
  const [localAvatarUri, setLocalAvatarUri]   = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  const displayCourse = profile?.course     ?? 'BS Computer Science';
  const displayYear   = profile?.year_level  ?? '3rd Year';
  const displayEmail  = user?.email          ?? '';
  const displayUni    = profile?.university  ?? 'University';

  const sessionsCount = profile?.sessions_count ?? 0;
  const joinedCount   = profile?.joined_count   ?? 0;
  const hostedCount   = profile?.hosted_count   ?? 0;

  // The avatar to display: local optimistic → remote Supabase → initials fallback
  const avatarUri = localAvatarUri ?? profile?.avatar_url ?? null;

  const handleAvatarPress = async () => {
    if (!user?.id || uploading) return;

    const url = await pickAndUpload(
      'avatars',
      avatarPath(user.id),
      { aspect: [1, 1], quality: 0.85 },
    );

    if (!url) return;

    // Optimistic update in local state
    setLocalAvatarUri(url);

    // Persist to Supabase profiles table
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: url })
      .eq('id', user.id);

    if (error) {
      console.error('[ProfileScreen] failed to save avatar_url:', error.message);
      // Roll back optimistic update
      setLocalAvatarUri(null);
    } else if (setProfile && profile) {
      // Keep AuthContext profile in sync so GlobalHeader etc. see the new URL
      setProfile({ ...profile, avatar_url: url });
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header Card ─────────────────────────── */}
        <View style={styles.headerCard}>
          {/* Avatar */}
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={handleAvatarPress}
            activeOpacity={0.85}
            disabled={uploading}
          >
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            {/* Edit overlay badge */}
            <View style={styles.editAvatarBtn}>
              {uploading
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.editAvatarIcon}>✎</Text>}
            </View>
          </TouchableOpacity>

          <Text style={styles.name}>{profile?.full_name ?? 'Student'}</Text>
          <Text style={styles.courseLine}>{displayYear}  ·  {displayCourse}</Text>
          <View style={styles.emailRow}>
            <Text style={styles.emailText}>{displayEmail}</Text>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ .edu</Text>
            </View>
          </View>
          <Text style={styles.uniText}>{displayUni}</Text>

          {/* Edit Profile + Portfolio CTA */}
          <View style={styles.profileCtaRow}>
            <TouchableOpacity
              style={styles.editProfileBtn}
              onPress={() => setEditModalVisible(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.editProfileBtnText}>✎  Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.portfolioBtn}
              onPress={onViewPortfolio}
              activeOpacity={0.85}
            >
              <Text style={styles.portfolioBtnText}>🎨  Portfolio</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Stats Row ──────────────────────────── */}
        <View style={styles.statsRow}>
          <View style={styles.statCell}>
            <Text style={styles.statNum}>{sessionsCount}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={styles.statNum}>{joinedCount}</Text>
            <Text style={styles.statLabel}>Joined</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={styles.statNum}>{hostedCount}</Text>
            <Text style={styles.statLabel}>Hosted</Text>
          </View>
        </View>

        {/* ── Menu ──────────────────────────────── */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionLabel}>MY STUFF</Text>
          <View style={styles.menuCard}>
            <MenuItem icon="📚" label="My Classes"       onPress={() => {}} />
            <View style={styles.menuDivider} />
            <MenuItem icon="🔖" label="Saved Activities" onPress={() => {}} />
            <View style={styles.menuDivider} />
            <MenuItem icon="🔔" label="Notifications"    onPress={() => {}} badge={3} />
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          <View style={styles.menuCard}>
            <MenuItem icon="⚙️" label="Settings"             onPress={() => {}} />
            <View style={styles.menuDivider} />
            <MenuItem icon="💡" label="How Synapse Works"     onPress={onViewOnboarding} />
            <View style={styles.menuDivider} />
            <MenuItem icon="⭐" label="Go Premium — ₱29/mo"  onPress={() => {}} accent />
          </View>
        </View>

        {/* ── Sign Out ──────────────────────────── */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={signOut}
          activeOpacity={0.8}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Synapse v1.0.0 · Phase 6.2</Text>
      </ScrollView>

      <EditProfileModal
        visible={editModalVisible}
        initialName={profile?.full_name ?? ''}
        initialCourse={profile?.course ?? ''}
        initialYear={profile?.year_level ?? ''}
        onClose={() => setEditModalVisible(false)}
        onSave={async (fullName, course, yearLevel) => {
          if (!user?.id) return;
          const { error } = await supabase
            .from('profiles')
            .update({ full_name: fullName, course, year_level: yearLevel })
            .eq('id', user.id);
          if (error) {
            console.error('[ProfileScreen] edit profile error:', error.message);
          } else if (setProfile && profile) {
            setProfile({ ...profile, full_name: fullName, course, year_level: yearLevel });
          }
        }}
      />
    </SafeAreaView>
  );
};

const AVATAR_SIZE = 150;

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.bg.surface },
  scroll: { paddingBottom: 100 },

  // ── Header Card ──
  headerCard: {
    backgroundColor: '#fff',
    margin: Spacing.lg,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: Spacing.md,
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  // Shown when avatar_url is set — real photo
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.primary + '44',
  },
  // Shown as fallback when no avatar_url
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: 24,
    backgroundColor: Colors.primary + '22',
    borderWidth: 2,
    borderColor: Colors.primary + '44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: Colors.primary },
  editAvatarBtn: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  editAvatarIcon: { fontSize: 12, color: '#fff', fontWeight: '700', lineHeight: 16 },

  name:       { fontSize: FontSize.xl,  fontWeight: '800', color: Colors.text.primary, marginBottom: 4, letterSpacing: -0.3 },
  courseLine: { fontSize: FontSize.sm, color: Colors.text.secondary, marginBottom: 6 },
  emailRow:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  emailText:  { fontSize: FontSize.xs, color: Colors.text.muted },
  verifiedBadge: {
    backgroundColor: Colors.accent.green + '22',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  verifiedText: { fontSize: 9, fontWeight: '700', color: Colors.accent.green, letterSpacing: 0.3 },
  uniText:    { fontSize: FontSize.xs, color: Colors.text.muted, marginBottom: Spacing.lg },

  profileCtaRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  editProfileBtn: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  editProfileBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  portfolioBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.pill,
    alignItems: 'center',
  },
  portfolioBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: '#fff' },

  // ── Stats ──
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  statCell:    { flex: 1, alignItems: 'center' },
  statNum:     { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text.primary, letterSpacing: -0.5 },
  statLabel:   { fontSize: FontSize.xs, color: Colors.text.muted, fontWeight: '600', marginTop: 2 },
  statDivider: { width: 1, height: '60%', backgroundColor: Colors.border, alignSelf: 'center' },

  // ── Menu ──
  menuSection:  { marginHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.text.muted,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    paddingLeft: 4,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  menuIcon:       { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.bg.muted, alignItems: 'center', justifyContent: 'center' },
  menuIconAccent: { backgroundColor: Colors.primary + '15' },
  menuIconText:   { fontSize: 17 },
  menuLabel:      { flex: 1, fontSize: FontSize.md, fontWeight: '600', color: Colors.text.primary },
  menuLabelAccent:{ color: Colors.primary },
  menuRight:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  menuBadge: {
    backgroundColor: Colors.accent.red,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  menuBadgeText: { fontSize: 9, color: '#fff', fontWeight: '800' },
  menuChevron:   { fontSize: 20, color: Colors.text.muted, lineHeight: 24 },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 36 + Spacing.md + Spacing.lg,
  },

  // ── Sign Out ──
  signOutBtn: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  signOutText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text.secondary },
  versionText: { textAlign: 'center', fontSize: FontSize.xs, color: Colors.text.muted, marginBottom: Spacing.sm },
});

// ─── Edit Profile Modal Styles ────────────────────────────────────────────────

const editStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xl,
    paddingBottom: 36,
  },
  handle: {
    width: 40, height: 4, backgroundColor: Colors.border,
    borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xl, fontWeight: '800', color: Colors.text.primary,
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: FontSize.sm, fontWeight: '700', color: Colors.text.primary,
    marginBottom: 6, marginTop: Spacing.md,
  },
  input: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md,
    padding: Spacing.md, fontSize: FontSize.md, color: Colors.text.primary,
    marginBottom: 4,
  },
  yearRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.xl },
  yearChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.pill,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: '#fff',
  },
  yearChipActive:     { backgroundColor: Colors.primary, borderColor: Colors.primary },
  yearChipText:       { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text.secondary },
  yearChipTextActive: { color: '#fff', fontWeight: '700' },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.pill,
    paddingVertical: Spacing.lg, alignItems: 'center', marginBottom: Spacing.sm,
  },
  saveBtnText: { fontSize: FontSize.md, fontWeight: '800', color: '#fff' },
  cancelBtn:   { alignItems: 'center', paddingVertical: Spacing.sm },
  cancelBtnText: { fontSize: FontSize.sm, color: Colors.text.muted, fontWeight: '600' },
});
