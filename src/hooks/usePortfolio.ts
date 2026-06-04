// src/hooks/usePortfolio.ts
// Synapse — Phase 6.1: Fetch real portfolio data from Supabase
//
// Replaces MOCK_PORTFOLIO_ITEMS, MOCK_GALLERY_ITEMS, MOCK_PEER_REVIEWS.
// Call with the target userId (own or another student's).
//
// Returned shape mirrors the MockPortfolioItem / MockGalleryItem / MockPeerReview
// interfaces so PortfolioScreen card components need zero changes.

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Colors } from '../constants/theme';
import {
  MockPortfolioItem,
  MockGalleryItem,
  MockPeerReview,
  MockProofImage,
} from '../constants/mockData';

// ── Category colour map (mirrors PortfolioItem.category values) ──────────────
const CATEGORY_COLOR: Record<string, string> = {
  Design:    '#3D5AFE',
  Dev:       '#10B981',
  Video:     '#7C3AED',
  Writing:   '#F59E0B',
  Photo:     '#EC4899',
  Tutoring:  '#06B6D4',
  'UI/UX':   '#06B6D4',
  Other:     '#6B7280',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function categoryColor(cat: string): string {
  return CATEGORY_COLOR[cat] ?? '#6B7280';
}

/** Convert a portfolio_items row → MockPortfolioItem shape */
function rowToPortfolioItem(row: any): MockPortfolioItem {
  // proof_image_urls is a text[] column; we turn each URL into a MockProofImage
  const proofImages: MockProofImage[] = (row.proof_image_urls ?? []).map(
    (url: string, i: number) => ({
      id:    `${row.id}_proof_${i}`,
      label: `Proof ${i + 1}`,
      emoji: '🖼',
      color: '#F1F3F9',
      // The real URL is stored separately in proofUrlsFromDb (see hook below)
      _url: url,   // ← extra field we attach so PortfolioScreen can seed proofUrls state
    }),
  );

  return {
    id:            row.id,
    title:         row.title ?? 'Untitled',
    category:      row.category ?? 'Other',
    categoryColor: categoryColor(row.category),
    initials:      (row.title ?? 'WK').slice(0, 2).toUpperCase(),
    accentColor:   categoryColor(row.category),
    description:   row.description ?? '',
    proofImages,
    // Extra fields PortfolioScreen uses directly:
    _heroImageUrl:      row.hero_image_url ?? null,
    _proofImageUrls:    row.proof_image_urls ?? [],
  } as any;
}

/** Convert a gallery_items row → MockGalleryItem shape */
function rowToGalleryItem(row: any): MockGalleryItem {
  return {
    id:            row.id,
    title:         row.title ?? 'Untitled',
    category:      row.category ?? 'Other',
    categoryColor: categoryColor(row.category),
    emoji:         '🖼',
    color:         '#F1F3F9',
    // Extra field:
    _imageUrl: row.image_url ?? null,
  } as any;
}

/** Convert a peer_reviews row → MockPeerReview shape */
function rowToPeerReview(row: any): MockPeerReview {
  const reviewer = row.reviewer as any;
  const name     = reviewer?.full_name ?? 'Student';
  const initials = name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return {
    id:               row.id,
    reviewerName:     name,
    reviewerInitials: initials,
    reviewerCourse:   reviewer?.course ?? '',
    reviewerColor:    Colors.primary,
    rating:           row.rating ?? 0,
    comment:          row.comment ?? '',
    postedAgo:        timeAgo(row.created_at),
  };
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins  = Math.floor(diff / 60_000);
  if (mins < 60)   return mins <= 1 ? 'just now'    : `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24)  return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  const days  = Math.floor(hours / 24);
  if (days < 7)    return days === 1 ? '1 day ago'  : `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5)   return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PortfolioData {
  portfolioItems: MockPortfolioItem[];
  galleryItems:   MockGalleryItem[];
  reviews:        MockPeerReview[];
  portfolioId:    string | null;  // portfolios.id — needed for inserting peer_reviews
  skillTags:      string[];

  // Pre-seeded image URL maps so PortfolioScreen can init its state correctly
  initialHeroUrls:    Record<string, string>;  // itemId → hero URL
  initialProofUrls:   Record<string, string>;  // proofId → URL  (proofId = `{itemId}_proof_{i}`)
  initialGalleryUrls: Record<string, string>;  // galleryItemId → URL

  loading: boolean;
  error:   string | null;
  refetch: () => void;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function usePortfolio(userId: string | null | undefined): PortfolioData {
  const [portfolioItems, setPortfolioItems] = useState<MockPortfolioItem[]>([]);
  const [galleryItems,   setGalleryItems]   = useState<MockGalleryItem[]>([]);
  const [reviews,        setReviews]        = useState<MockPeerReview[]>([]);
  const [portfolioId,    setPortfolioId]    = useState<string | null>(null);
  const [skillTags,      setSkillTags]      = useState<string[]>([]);
  const [initialHeroUrls,    setInitialHeroUrls]    = useState<Record<string, string>>({});
  const [initialProofUrls,   setInitialProofUrls]   = useState<Record<string, string>>({});
  const [initialGalleryUrls, setInitialGalleryUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // ── 1. portfolios row — uses student_id (not user_id) ────────────────────
      const { data: portfolioRow } = await supabase
        .from('portfolios')
        .select('id, skill_tags')
        .eq('student_id', userId)
        .single();

      const portfolioRowId = portfolioRow?.id ?? null;

      // ── 2. portfolio_items (FK: portfolio_id → portfolios.id) ───────────────────
      const heroMap: Record<string, string>  = {};
      const proofMap: Record<string, string> = {};
      const items: MockPortfolioItem[] = [];

      if (portfolioRowId) {
        const { data: itemRows, error: itemErr } = await supabase
          .from('portfolio_items')
          .select('*')
          .eq('portfolio_id', portfolioRowId)
          .order('created_at', { ascending: false });

        if (itemErr) throw new Error(itemErr.message);

        ;(itemRows ?? []).map(rowToPortfolioItem).forEach((item: any) => {
          items.push(item);
          if (item._heroImageUrl) heroMap[item.id] = item._heroImageUrl;
          ;(item._proofImageUrls as string[]).forEach((url: string, i: number) => {
            if (url) proofMap[`${item.id}_proof_${i}`] = url;
          });
        });
      }

      // ── 3. gallery_items (FK: user_id → profiles.id, NOT portfolio_id) ──────────
      const gItems: MockGalleryItem[] = [];
      const galleryMap: Record<string, string> = {};

      {
        const { data: galleryRows, error: galleryErr } = await supabase
          .from('gallery_items')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (galleryErr) throw new Error(galleryErr.message);

        ;(galleryRows ?? []).map(rowToGalleryItem).forEach((g: any) => {
          gItems.push(g);
          if (g._imageUrl) galleryMap[g.id] = g._imageUrl;
        });
      }

      // ── 4. peer_reviews — keyed by portfolio_id, not reviewee_id ──────────
      let reviewRows: any[] = [];
      if (portfolioRow?.id) {
        const { data: rRows, error: reviewErr } = await supabase
          .from('peer_reviews')
          .select('*, reviewer:profiles!peer_reviews_reviewer_id_fkey(full_name, course)')
          .eq('portfolio_id', portfolioRow.id)
          .order('created_at', { ascending: false });
        if (reviewErr) throw new Error(reviewErr.message);
        reviewRows = rRows ?? [];
      }

      // ── Commit state ───────────────────────────────────────────────────────
      setPortfolioItems(items);
      setGalleryItems(gItems);
      setReviews((reviewRows ?? []).map(rowToPeerReview));
      setPortfolioId(portfolioRowId);
      setSkillTags(portfolioRow?.skill_tags ?? []);
      setInitialHeroUrls(heroMap);
      setInitialProofUrls(proofMap);
      setInitialGalleryUrls(galleryMap);
    } catch (e: any) {
      console.error('[usePortfolio] fetch error:', e.message);
      setError(e.message ?? 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return {
    portfolioItems,
    galleryItems,
    reviews,
    portfolioId,
    skillTags,
    initialHeroUrls,
    initialProofUrls,
    initialGalleryUrls,
    loading,
    error,
    refetch: fetchAll,
  };
}
