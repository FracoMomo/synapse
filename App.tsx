import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/lib/AuthContext';
import { Colors } from './src/constants/theme';
import { GlobalHeader } from './src/components/GlobalHeader';
import { BottomNav, TabName } from './src/components/BottomNav';
import { LobbyScreen } from './src/screens/LobbyScreen';
import { CreateLobbyModal } from './src/screens/CreateLobbyModal';
import { AuthScreen } from './src/screens/AuthScreen';
import DiscoverScreen from './src/screens/DiscoverScreen';
import { CalendarScreen } from './src/screens/CalendarScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { PortfolioScreen } from './src/screens/PortfolioScreen';
import { OnboardingScreen, ONBOARDING_KEY } from './src/screens/OnboardingScreen';

type AppState = 'loading' | 'onboarding' | 'auth' | 'app';

type OverlayScreen =
  | { type: 'ownPortfolio' }
  | { type: 'publicProfile'; userId: string }
  | { type: 'onboarding' };

const AppInner = () => {
  const { session, loading: authLoading, profile, user } = useAuth();

  const [appState, setAppState]           = useState<AppState>('loading');
  const [activeTab, setActiveTab]         = useState<TabName>('lobby');
  const [createVisible, setCreateVisible] = useState(false);
  const [overlay, setOverlay]             = useState<OverlayScreen | null>(null);

  useEffect(() => {
    if (authLoading) return;
    const checkOnboarding = async () => {
      const seen = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (!seen)         setAppState('onboarding');
      else if (!session) setAppState('auth');
      else               setAppState('app');
    };
    checkOnboarding();
  }, [authLoading, session]);

  if (appState === 'loading' || authLoading) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={styles.loadingLogo}>⚡</Text>
        <ActivityIndicator color={Colors.primary} size="large" style={{ marginTop: 16 }} />
      </View>
    );
  }

  if (appState === 'onboarding') {
    return <OnboardingScreen onDone={() => setAppState(session ? 'app' : 'auth')} />;
  }

  if (appState === 'auth' || !session) {
    return <AuthScreen />;
  }

  // Onboarding re-visit is a full-screen takeover — fine to unmount tabs for this
  if (overlay?.type === 'onboarding') {
    return <OnboardingScreen onDone={() => setOverlay(null)} />;
  }

  const handleTabPress = (tab: TabName) => {
    if (tab === 'create') setCreateVisible(true);
    else { setActiveTab(tab); setOverlay(null); }
  };

  const goToOwnPortfolio  = () => setOverlay({ type: 'ownPortfolio' });
  const goToPublicProfile = (userId: string) => setOverlay({ type: 'publicProfile', userId });
  const goToOnboarding    = () => setOverlay({ type: 'onboarding' });
  const dismissOverlay    = () => setOverlay(null);

  const portfolioOverlayVisible = !!overlay && overlay.type !== 'onboarding';

  // All tab screens + portfolio overlay live in the same React tree.
  // Tab screens are NEVER unmounted — display:none hides inactive ones.
  // This preserves uploaded image state across tab switches AND overlay open/close.
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg.shell} />
      <GlobalHeader
        universityName={profile?.university ?? 'Synapse'}
        email={user?.email ?? ''}
      />
      <View style={styles.content}>

        {/* ── Tab screens (always mounted, toggled via display) ── */}
        <View style={[styles.screenSlot, activeTab === 'lobby'    && styles.screenActive]}>
          <LobbyScreen />
        </View>
        <View style={[styles.screenSlot, activeTab === 'discover' && styles.screenActive]}>
          <DiscoverScreen navigation={null} onViewProfile={goToPublicProfile} />
        </View>
        <View style={[styles.screenSlot, activeTab === 'calendar' && styles.screenActive]}>
          <CalendarScreen />
        </View>
        <View style={[styles.screenSlot, activeTab === 'profile'  && styles.screenActive]}>
          <ProfileScreen onViewPortfolio={goToOwnPortfolio} onViewOnboarding={goToOnboarding} />
        </View>

        {/* ── Portfolio overlay (always mounted, toggled via display) ── */}
        <View style={[styles.overlaySlot, !portfolioOverlayVisible && { display: 'none' }]}>
          {overlay?.type === 'ownPortfolio' && (
            <PortfolioScreen
              isOwner
              ownerName={profile?.full_name ?? undefined}
              onBack={dismissOverlay}
            />
          )}
          {overlay?.type === 'publicProfile' && (
            <PortfolioScreen
              isOwner={false}
              userId={(overlay as { type: 'publicProfile'; userId: string }).userId}
              onBack={dismissOverlay}
            />
          )}
          {/* Placeholder keeps the slot non-empty when no overlay is set */}
          {!overlay && <View />}
        </View>

      </View>

      {!portfolioOverlayVisible && (
        <BottomNav activeTab={activeTab} onTabPress={handleTabPress} />
      )}

      <CreateLobbyModal
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
        onLaunch={() => {}}
      />
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.shell },
  content: {
    flex: 1,
    backgroundColor: Colors.bg.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  // Inactive tab screens are hidden but stay mounted — preserves all local state
  screenSlot:   { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'none' },
  screenActive: { display: 'flex' },
  // Portfolio overlay covers the full content area on top of tab screens
  overlaySlot:  { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, backgroundColor: Colors.bg.surface },
  loadingScreen: {
    flex: 1,
    backgroundColor: Colors.bg.shell,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingLogo: { fontSize: 48 },
});
