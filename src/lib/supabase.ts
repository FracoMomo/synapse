import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://zqxvzyqopszkjfbafmmu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxeHZ6eXFvcHN6a2pmYmFmbW11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MDMxNzcsImV4cCI6MjA5NTM3OTE3N30.O770c7t644fK4JTB7tGA56Wdd_rHLldD3CbROhwD5kM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Key Supabase uses to store the session — used to clear it when rememberMe is off
export const SUPABASE_SESSION_KEY = 'sb-zqxvzyqopszkjfbafmmu-auth-token';

// ── Types matching our database schema ────────────────────────────────────────
export interface Profile {
  id: string;
  full_name: string | null;
  university_id: string | null;
  university: string | null;   // resolved from allowed_domains.university_name via join
  course: string | null;
  year_level: string | null;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  is_premium: boolean;
  sessions_count: number;
  joined_count: number;
  hosted_count: number;
  created_at: string;
}

export interface Lobby {
  id: string;
  title: string;
  type: string;
  host_id: string;
  venue: string;
  lobby_time: string;
  capacity: number;
  joined_count: number;
  year_level_filter: string;
  is_active: boolean;
  created_at: string;
  // joined from profiles
  host?: Profile;
  // joined from lobby_members
  has_joined?: boolean;
}

export interface LobbyMember {
  id: string;
  lobby_id: string;
  student_id: string;
  joined_at: string;
}

export interface Portfolio {
  id: string;
  student_id: string;  // FK → profiles.id
  skill_tags: string[];
  average_rating: number;
  review_count: number;
  created_at: string;
}

export interface PortfolioItem {
  id: string;
  portfolio_id: string;  // FK → portfolios.id
  title: string;
  category: string;
  image_url: string | null;
  hero_image_url: string | null;
  proof_image_urls: string[] | null;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  user_id: string;  // FK → profiles.id (direct, not via portfolios)
  title: string;
  category: string;
  category_color: string;
  image_url: string | null;
  created_at: string;
}

export interface PeerReview {
  id: string;
  portfolio_id: string;  // FK → portfolios.id
  reviewer_id: string;   // FK → profiles.id
  rating: number;
  comment: string;
  created_at: string;
  reviewer?: Profile;
}
