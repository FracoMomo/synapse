import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../lib/AuthContext';
import { Colors, Spacing, Radius, FontSize } from '../constants/theme';

type AuthMode = 'signin' | 'signup';

export const AuthScreen: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode]         = useState<AuthMode>('signin');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState<string | null>(null);
  const [rememberMe, setRememberMe]     = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [displayValue, setDisplayValue] = useState(''); // masked display
  const passwordRef = React.useRef('');

  const BULLET = '\u2022';

  const handlePasswordChange = (text: string) => {
    const prev = displayValue;
    let real = passwordRef.current;

    if (showPassword) {
      // Eye open — raw text, no masking
      passwordRef.current = text;
      setPassword(text);
      setDisplayValue(text);
      return;
    }

    if (text.length > prev.length) {
      // Character added — append real char, show it briefly via displayValue
      const added = text[text.length - 1];
      real = real + added;
      passwordRef.current = real;
      setPassword(real);

      // Show the last character for 600ms then mask it
      setDisplayValue(BULLET.repeat(real.length - 1) + added);
      setTimeout(() => {
        setDisplayValue(BULLET.repeat(passwordRef.current.length));
      }, 600);
    } else {
      // Character deleted
      real = real.slice(0, text.length);
      passwordRef.current = real;
      setPassword(real);
      setDisplayValue(BULLET.repeat(real.length));
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(v => {
      const next = !v;
      setDisplayValue(next ? passwordRef.current : BULLET.repeat(passwordRef.current.length));
      return next;
    });
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (mode === 'signup' && !fullName) { setError('Please enter your name.'); return; }

    setLoading(true);

    if (mode === 'signin') {
      const { error } = await signIn(email.trim(), password, rememberMe);
      if (error) setError(error);
    } else {
      const { error } = await signUp(email.trim(), password, fullName.trim());
      if (error) setError(error);
      else setSuccess('Account created! Check your email to confirm, then sign in.');
    }

    setLoading(false);
  };

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError(null);
    setSuccess(null);
    setPassword('');
    setDisplayValue('');
    passwordRef.current = '';
    setShowPassword(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoArea}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>S</Text>
          </View>
          <Text style={styles.appName}>Synapse</Text>
          <Text style={styles.tagline}>Where Campus Life Syncs.</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Tab switcher */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, mode === 'signin' && styles.tabActive]}
              onPress={() => switchMode('signin')}
            >
              <Text style={[styles.tabText, mode === 'signin' && styles.tabTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, mode === 'signup' && styles.tabActive]}
              onPress={() => switchMode('signup')}
            >
              <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {/* Full name (sign up only) */}
          {mode === 'signup' && (
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={Colors.text.muted}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          )}

          {/* Email */}
          <TextInput
            style={styles.input}
            placeholder="University email (e.g. mika@cit.edu)"
            placeholderTextColor={Colors.text.muted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {/* Password + eye toggle */}
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor={Colors.text.muted}
              value={displayValue}
              onChangeText={handlePasswordChange}
              secureTextEntry={false}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={toggleShowPassword}
              activeOpacity={0.6}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={Colors.text.muted}
              />
            </TouchableOpacity>
          </View>

          {/* Remember me (sign in only) */}
          {mode === 'signin' && (
            <TouchableOpacity
              style={styles.rememberRow}
              onPress={() => setRememberMe(v => !v)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.rememberLabel}>Remember me</Text>
            </TouchableOpacity>
          )}

          {/* Error / Success */}
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}
          {success && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>✅ {success}</Text>
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitBtnText}>
                  {mode === 'signin' ? 'Sign In →' : 'Create Account →'}
                </Text>
            }
          </TouchableOpacity>

          <Text style={styles.eduNotice}>
            🎓 Only university .edu emails are accepted
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.bg.shell },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: Spacing.xl },

  // ── Logo ──
  logoArea: { alignItems: 'center', marginBottom: Spacing.xxxl },
  logo: {
    width: 64, height: 64,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  logoText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  appName:  { fontSize: FontSize.xxxl, fontWeight: '800', color: '#fff', marginBottom: 4 },
  tagline:  { fontSize: FontSize.sm, color: '#9CA3AF' },

  // ── Card ──
  card: {
    backgroundColor: '#fff',
    borderRadius: Radius.xl,
    padding: Spacing.xl,
  },

  // ── Tabs ──
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.bg.muted,
    borderRadius: Radius.md,
    padding: 3,
    marginBottom: Spacing.xl,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm - 2,
    alignItems: 'center',
  },
  tabActive:     { backgroundColor: '#fff' },
  tabText:       { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text.muted },
  tabTextActive: { color: Colors.text.primary, fontWeight: '700' },

  // ── Inputs ──
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },

  // ── Password wrapper ──
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
    paddingRight: Spacing.sm,
  },
  passwordInput: {
    flex: 1,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text.primary,
  },
  eyeBtn: { padding: Spacing.xs },

  // ── Remember me ──
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  checkbox: {
    width: 20, height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '800',
    lineHeight: 14,
  },
  rememberLabel: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    fontWeight: '500',
  },

  // ── Feedback ──
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorText: { fontSize: FontSize.sm, color: '#DC2626' },
  successBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  successText: { fontSize: FontSize.sm, color: '#065F46' },

  // ── Submit ──
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.pill,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: FontSize.md },

  eduNotice: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    textAlign: 'center',
  },
});
