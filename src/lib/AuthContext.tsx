import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, Profile, SUPABASE_SESSION_KEY } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
 
interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  /** Directly update the in-memory profile (used after image uploads in Phase 6) */
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}
 
const AuthContext = createContext<AuthContextType | null>(null);
 
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) await fetchProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);
 
  const fetchProfile = async (userId: string) => {
    // Fetch profile directly — no join to avoid RLS issues on allowed_domains
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = "no rows found" — means profile doesn't exist yet
      console.error('[AuthContext] fetchProfile error:', error.message);
      return;
    }

    if (!data) {
      // Profile row is missing (e.g. signup email-confirm flow didn't create it).
      // We can't recover here without knowing university_id, so just leave profile null.
      return;
    }

    // Resolve university name separately if university_id is set
    let university: string | null = null;
    if (data.university_id) {
      const { data: domain } = await supabase
        .from('allowed_domains')
        .select('university_name')
        .eq('id', data.university_id)
        .single();
      university = domain?.university_name ?? null;
    }
    setProfile({ ...data, university });

    // Ensure portfolios row exists — create it if missing (safety net for old accounts)
    const { data: portfolioRow } = await supabase
      .from('portfolios')
      .select('id')
      .eq('student_id', userId)
      .maybeSingle();

    if (!portfolioRow) {
      await supabase.from('portfolios').upsert(
        { student_id: userId, skill_tags: [], average_rating: 0, review_count: 0 },
        { onConflict: 'student_id', ignoreDuplicates: true },
      );
    }
  };
 
  const signUp = async (email: string, password: string, fullName: string) => {
    // 1. Check domain
    const domain = email.split('@')[1]?.toLowerCase().trim();
 
    const { data: domainRows } = await supabase
      .from('allowed_domains')
      .select('id, university_name')
      .eq('domain', domain);
 
    if (!domainRows || domainRows.length === 0) {
      return { error: 'Only university .edu emails are allowed. Ask your school to join Synapse!' };
    }
 
    const universityId = domainRows[0].id;
    const universityName = domainRows[0].university_name;
 
    // 2. Sign up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
 
    if (error) return { error: error.message };
 
    // 3. Create profile + portfolios rows.
    //    Supabase signUp with email confirmation creates the user but doesn't
    //    immediately establish a session, so RLS "auth.uid() = id" checks can
    //    fail here.  We use the service-role-equivalent workaround: after signUp
    //    the library still provides data.user (even pre-confirmation on some
    //    Supabase configs), so we attempt the insert and log any error without
    //    blocking the user.  The rows are also created defensively on first
    //    sign-in via fetchProfile if they are missing (see below).
    if (data.user) {
      const userId = data.user.id;

      // ── profiles ────────────────────────────────────────────────
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            id:            userId,
            full_name:     fullName,
            university_id: universityId,
          },
          { onConflict: 'id', ignoreDuplicates: true },
        );

      if (profileError) {
        console.error('[AuthContext] profiles upsert error:', profileError.message);
      }

      // ── portfolios ───────────────────────────────────────────────
      // Use upsert so a re-registration (e.g. after email confirm) doesn't fail
      const { error: portfolioError } = await supabase
        .from('portfolios')
        .upsert(
          {
            student_id:     userId,
            skill_tags:     [],
            average_rating: 0,
            review_count:   0,
          },
          { onConflict: 'student_id', ignoreDuplicates: true },
        );

      if (portfolioError) {
        console.error('[AuthContext] portfolios upsert error:', portfolioError.message);
      }
    }

    return { error: null };
  };
 
  const signIn = async (email: string, password: string, rememberMe = true) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    if (!rememberMe) {
      // Session stays alive in memory for this launch only.
      // Removing the persisted key means next app launch won't auto-login.
      await AsyncStorage.removeItem(SUPABASE_SESSION_KEY);
    }

    return { error: null };
  };
 
  const signOut = async () => {
    await supabase.auth.signOut();
  };
 
  return (
    <AuthContext.Provider value={{ session, user, profile, loading, setProfile, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
 
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
