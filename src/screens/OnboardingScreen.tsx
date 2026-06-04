// screens/OnboardingScreen.tsx
// Synapse — In-app onboarding
//
// Shown on first launch (before AuthScreen).
// Re-accessible from Profile > Settings via onRevisit prop.
//
// AsyncStorage key: 'synapse_has_seen_onboarding'
// Set to 'true' when user taps "Get Started" or completes all slides.

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, FontSize } from '../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ONBOARDING_KEY = 'synapse_has_seen_onboarding';

// ─── Slide data ───────────────────────────────────────────────────────────────

interface Slide {
  id: string;
  bg: string;
  accentColor: string;
  emoji: string;
  tag: string;
  title: string;
  subtitle: string;
  bullets?: { icon: string; text: string }[];
}

const SLIDES: Slide[] = [
  {
    id: 's1',
    bg: Colors.bg.shell,
    accentColor: Colors.primary,
    emoji: '⚡',
    tag: 'WELCOME TO SYNAPSE',
    title: 'Where Campus\nLife Syncs.',
    subtitle: 'The campus activity layer your school is missing — built for Filipino university students.',
    bullets: [
      { icon: '🔗', text: 'Connect with anyone on campus' },
      { icon: '📅', text: 'Schedule and join activities in real time' },
      { icon: '🎉', text: 'Socialize beyond your block' },
    ],
  },
  {
    id: 's2',
    bg: '#0D1B4B',
    accentColor: Colors.primary,
    emoji: '🏟',
    tag: 'LOBBIES',
    title: 'See what\'s\nhappening now.',
    subtitle: 'Students post open, time-limited Lobbies — join a study block, a film screening, a pick-up game. It disappears when it\'s done.',
    bullets: [
      { icon: '📚', text: 'Study Blocks & Review Sessions' },
      { icon: '🎤', text: 'Open Presentations & Campus Events' },
      { icon: '⚽', text: 'Sports, Hobbies & Lunch Runs' },
    ],
  },
  {
    id: 's3',
    bg: '#1A0D3B',
    accentColor: '#7C3AED',
    emoji: '🔍',
    tag: 'DISCOVER',
    title: 'Find events,\npeople & collabs.',
    subtitle: 'Browse upcoming campus events, find student freelancers for design or tutoring, or post an async collab for your next project.',
    bullets: [
      { icon: '🗓', text: 'Campus & student-run events' },
      { icon: '🎨', text: 'Student freelancers — design, video, tutoring' },
      { icon: '🤝', text: 'Syncs — async paid or volunteer collabs' },
    ],
  },
  {
    id: 's4',
    bg: '#0A2218',
    accentColor: '#10B981',
    emoji: '📅',
    tag: 'CALENDAR',
    title: 'Never miss\na deadline.',
    subtitle: 'Your academic due dates and assignments pulled straight from MS Teams — all in one timeline so nothing gets buried.',
    bullets: [
      { icon: '📝', text: 'Assignment due dates from MS Teams' },
      { icon: '🔴', text: '"DUE" and "NOW" badges at a glance' },
      { icon: '📆', text: 'Weekly view synced to your school schedule' },
    ],
  },
  {
    id: 's5',
    bg: Colors.bg.shell,
    accentColor: Colors.primary,
    emoji: '🎓',
    tag: 'GET STARTED',
    title: 'Your campus,\nyour community.',
    subtitle: 'Sign up with your university email. Only verified students from your school can join — keeping it real, keeping it yours.',
    bullets: [
      { icon: '✉️', text: 'University email required (e.g. @cit.edu)' },
      { icon: '🔒', text: 'Only your campus can see your activity' },
      { icon: '🚀', text: 'Free to use — no credit card needed' },
    ],
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  onDone: () => void;   // called when user taps "Get Started" or completes slides
}

// ─── Dot indicator ────────────────────────────────────────────────────────────

const Dots: React.FC<{ count: number; active: number; color: string }> = ({ count, active, color }) => (
  <View style={styles.dotsRow}>
    {Array.from({ length: count }).map((_, i) => (
      <View
        key={i}
        style={[
          styles.dot,
          i === active
            ? [styles.dotActive, { backgroundColor: color, width: 20 }]
            : styles.dotInactive,
        ]}
      />
    ))}
  </View>
);

// ─── Single slide ─────────────────────────────────────────────────────────────

const SlideView: React.FC<{ slide: Slide }> = ({ slide }) => (
  <View style={[styles.slide, { backgroundColor: slide.bg }]}>
    {/* Big emoji */}
    <View style={[styles.emojiWrapper, { backgroundColor: slide.accentColor + '20' }]}>
      <Text style={styles.slideEmoji}>{slide.emoji}</Text>
    </View>

    {/* Tag */}
    <View style={[styles.tag, { backgroundColor: slide.accentColor + '25' }]}>
      <Text style={[styles.tagText, { color: slide.accentColor }]}>{slide.tag}</Text>
    </View>

    {/* Title */}
    <Text style={styles.slideTitle}>{slide.title}</Text>

    {/* Subtitle */}
    <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>

    {/* Bullets */}
    {slide.bullets && (
      <View style={styles.bulletsBlock}>
        {slide.bullets.map((b, i) => (
          <View key={i} style={[styles.bulletRow, { backgroundColor: slide.accentColor + '12' }]}>
            <Text style={styles.bulletIcon}>{b.icon}</Text>
            <Text style={styles.bulletText}>{b.text}</Text>
          </View>
        ))}
      </View>
    )}
  </View>
);

// ─── Main component ───────────────────────────────────────────────────────────

export const OnboardingScreen: React.FC<Props> = ({ onDone }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const isLast  = activeIndex === SLIDES.length - 1;
  const current = SLIDES[activeIndex];

  const markDoneAndExit = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    onDone();
  };

  const handleNext = () => {
    if (isLast) {
      markDoneAndExit();
      return;
    }
    const next = activeIndex + 1;
    flatRef.current?.scrollToIndex({ index: next, animated: true });
    setActiveIndex(next);
  };

  const handleSkip = () => markDoneAndExit();

  const onMomentumScrollEnd = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  return (
    <View style={[styles.root, { backgroundColor: current.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={current.bg} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>

        {/* Skip button */}
        {!isLast && (
          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}

        {/* Slides */}
        <FlatList
          ref={flatRef}
          data={SLIDES}
          keyExtractor={s => s.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled
          onMomentumScrollEnd={onMomentumScrollEnd}
          renderItem={({ item }) => <SlideView slide={item} />}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
        />

        {/* Bottom controls */}
        <View style={styles.bottomBar}>
          <Dots count={SLIDES.length} active={activeIndex} color={current.accentColor} />

          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: current.accentColor }]}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Text style={styles.nextBtnText}>
              {isLast ? '🚀  Get Started' : 'Next  →'}
            </Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },

  skipBtn: {
    position: 'absolute',
    top: 56,
    right: Spacing.xl,
    zIndex: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  skipText: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },

  // ── Slide ──
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingHorizontal: Spacing.xxl,
    paddingTop: SCREEN_HEIGHT * 0.12,
    paddingBottom: 120,
    justifyContent: 'flex-start',
  },

  emojiWrapper: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  slideEmoji: { fontSize: 44 },

  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    marginBottom: Spacing.md,
  },
  tagText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },

  slideTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 42,
    letterSpacing: -0.8,
    marginBottom: Spacing.lg,
  },
  slideSubtitle: {
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 24,
    marginBottom: Spacing.xxl,
  },

  // ── Bullets ──
  bulletsBlock: { gap: Spacing.sm },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
  },
  bulletIcon: { fontSize: 18, width: 26, textAlign: 'center' },
  bulletText: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.85)', fontWeight: '500', flex: 1 },

  // ── Bottom bar ──
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.xxl,
    paddingBottom: 40,
    paddingTop: Spacing.lg,
    gap: Spacing.xl,
    alignItems: 'center',
  },
  dotsRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { height: 6, borderRadius: 3 },
  dotActive:   { width: 20 },
  dotInactive: { width: 6, backgroundColor: 'rgba(255,255,255,0.25)' },

  nextBtn: {
    width: '100%',
    paddingVertical: Spacing.lg,
    borderRadius: Radius.pill,
    alignItems: 'center',
  },
  nextBtnText: { fontSize: FontSize.md, fontWeight: '800', color: '#fff' },
});
