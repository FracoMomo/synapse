// screens/PortfolioScreen.tsx
// Synapse — Phase 6.1: Wire real Supabase data (portfolio_items, gallery_items, peer_reviews)
//
// Changes from Phase 6:
//   • usePortfolio() hook replaces MOCK_PORTFOLIO_ITEMS / MOCK_GALLERY_ITEMS / MOCK_PEER_REVIEWS
//   • heroUrls / proofUrls / galleryUrls state seeded from DB on mount → images survive relaunch
//   • skillTags pulled from portfolios table (own profile) or PUBLIC_PROFILE_BY_ID (other users)
//   • Loading skeleton shown while data fetches
//   • handleReviewSubmit now writes to peer_reviews table
//
// Everything else (upload handlers, card components, styles) is unchanged from Phase 6.

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  Image,
  ImageBackground,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../constants/theme';
import { useImageUpload } from '../hooks/useImageUpload';
import { usePortfolio } from '../hooks/usePortfolio';
import {
  avatarPath,
  bannerPath,
  heroImagePath,
  proofImagePath,
  galleryImagePath,
} from '../lib/storage';
import {
  MY_SKILL_TAGS,
  MockPortfolioItem,
  MockPeerReview,
  MockGalleryItem,
} from '../constants/mockData';

const SCREEN_WIDTH = Dimensions.get('window').width;
const BANNER_HEIGHT = 160;
const AVATAR_SIZE   = 100;

// ─── Mock public-profile data (other users from Discover > People) ────────────
const PUBLIC_PROFILE_BY_ID: Record<string, {
  name: string; course: string; yearLevel: string; email: string;
  initials: string; accentColor: string; bannerColor: string;
  isVerified: boolean; rating: number; reviews: number; skills: string[];
  avatarUrl?: string; bannerUrl?: string;
}> = {
  '1': { name: 'Maria Santos',     course: 'BS Computer Science',      yearLevel: '3rd Year',
         email: 'maria@cit.edu',   initials: 'MS', accentColor: '#3D5AFE', bannerColor: '#3D5AFE',
         isVerified: true,  rating: 4.9, reviews: 14,
         skills: ['UI/UX', 'Figma', 'React Native', 'Product Design'] },
  '2': { name: 'Jed Reyes',        course: 'BS Information Technology', yearLevel: '4th Year',
         email: 'jed@cit.edu',     initials: 'JR', accentColor: '#7C3AED', bannerColor: '#7C3AED',
         isVerified: true,  rating: 4.8, reviews: 21,
         skills: ['Video Editing', 'Motion Graphics', 'Premiere Pro', 'DaVinci'] },
  '3': { name: 'Kyla Uy',          course: 'BS Accountancy',            yearLevel: '2nd Year',
         email: 'kyla@cit.edu',    initials: 'KU', accentColor: '#10B981', bannerColor: '#10B981',
         isVerified: false, rating: 4.7, reviews: 9,
         skills: ['Tutoring', 'Mathematics', 'Accounting', 'Financial Review'] },
  '4': { name: 'Franz Lim',        course: 'BS Architecture',           yearLevel: '3rd Year',
         email: 'franz@cit.edu',   initials: 'FL', accentColor: '#F59E0B', bannerColor: '#F59E0B',
         isVerified: true,  rating: 4.6, reviews: 7,
         skills: ['Illustration', 'AutoCAD', 'Graphic Design', 'SketchUp'] },
  '5': { name: 'Bea Montoya',      course: 'BS Marketing',              yearLevel: '4th Year',
         email: 'bea@cit.edu',     initials: 'BM', accentColor: '#06B6D4', bannerColor: '#06B6D4',
         isVerified: false, rating: 4.5, reviews: 5,
         skills: ['Copywriting', 'Canva', 'Social Media', 'Brand Strategy'] },
  '6': { name: 'Marco Villanueva', course: 'BS Computer Engineering',   yearLevel: '3rd Year',
         email: 'marco@cit.edu',   initials: 'MV', accentColor: '#EF4444', bannerColor: '#EF4444',
         isVerified: false, rating: 4.8, reviews: 12,
         skills: ['Web Dev', 'Python', 'Backend', 'REST APIs'] },
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  isOwner: boolean;
  userId?: string;
  ownerName?: string;
  onBack: () => void;
}

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
}

// ─── Add Portfolio Item Modal ─────────────────────────────────────────────────

const PORTFOLIO_CATEGORIES = ['Design', 'Dev', 'Video', 'Writing', 'Photo', 'Tutoring', 'UI/UX', 'Other'];

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (title: string, category: string, description: string) => Promise<void>;
}

const AddPortfolioItemModal: React.FC<AddItemModalProps> = ({ visible, onClose, onAdd }) => {
  const [title,       setTitle]       = useState('');
  const [category,    setCategory]    = useState('Design');
  const [description, setDescription] = useState('');
  const [saving,      setSaving]      = useState(false);

  // Reset form on open
  React.useEffect(() => {
    if (visible) { setTitle(''); setCategory('Design'); setDescription(''); }
  }, [visible]);

  const handleAdd = async () => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Please enter a title for your portfolio item.');
      return;
    }
    setSaving(true);
    await onAdd(title.trim(), category, description.trim());
    setSaving(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Add Portfolio Item</Text>
          <Text style={styles.modalSub}>Showcase a project, commission, or case study.</Text>

          <Text style={styles.addItemLabel}>Title</Text>
          <TextInput
            style={styles.addItemInput}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. CIT-U Hackathon Brand Identity"
            placeholderTextColor={Colors.text.muted}
            autoCapitalize="words"
            returnKeyType="next"
          />

          <Text style={styles.addItemLabel}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.addItemCategoryRow}
          >
            {PORTFOLIO_CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.addItemCategoryChip,
                  category === cat && styles.addItemCategoryChipActive,
                ]}
                onPress={() => setCategory(cat)}
                activeOpacity={0.75}
              >
                <Text style={[
                  styles.addItemCategoryChipText,
                  category === cat && styles.addItemCategoryChipTextActive,
                ]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.addItemLabel}>Description <Text style={styles.addItemOptional}>(optional)</Text></Text>
          <TextInput
            style={[styles.addItemInput, styles.addItemInputMulti]}
            value={description}
            onChangeText={setDescription}
            placeholder="Briefly describe this project..."
            placeholderTextColor={Colors.text.muted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.submitReviewBtn, saving && { opacity: 0.6 }]}
            onPress={handleAdd}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitReviewBtnText}>Add to Portfolio</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.cancelBtn} activeOpacity={0.7}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─── Review Modal ─────────────────────────────────────────────────────────────

const ReviewModal: React.FC<ReviewModalProps> = ({ visible, onClose, onSubmit }) => {
  const [rating, setRating]   = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0 || !comment.trim()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    onSubmit(rating, comment.trim());
    setRating(0);
    setComment('');
    setLoading(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Leave a Review</Text>
          <Text style={styles.modalSub}>How was your experience working with them?</Text>
          <View style={styles.starPicker}>
            {[1,2,3,4,5].map(i => (
              <TouchableOpacity key={i} onPress={() => setRating(i)} activeOpacity={0.7}>
                <Text style={[styles.starPickerItem, { opacity: i <= rating ? 1 : 0.2 }]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <Text style={styles.ratingLabel}>
              {['','Poor','Fair','Good','Great','Excellent'][rating]}
            </Text>
          )}
          <TextInput
            style={styles.reviewInput}
            placeholder="Write your review here..."
            placeholderTextColor={Colors.text.muted}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[styles.submitReviewBtn, (rating === 0 || !comment.trim()) && { opacity: 0.5 }]}
            onPress={handleSubmit}
            disabled={rating === 0 || !comment.trim() || loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitReviewBtnText}>Submit Review</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.cancelBtn} activeOpacity={0.7}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─── Portfolio Item Card ───────────────────────────────────────────────────────

interface PortfolioCardProps {
  item: MockPortfolioItem;
  isOwner: boolean;
  userId: string | null;
  heroUrl: string | null;
  proofUrls: Record<string, string>;
  onHeroUpload: (itemId: string) => void;
  onProofUpload: (itemId: string, proofId: string) => void;
  heroUploading: boolean;
  proofUploading: string | null;
}

const PortfolioCard: React.FC<PortfolioCardProps> = ({
  item,
  isOwner,
  heroUrl,
  proofUrls,
  onHeroUpload,
  onProofUpload,
  heroUploading,
  proofUploading,
}) => (
  <View style={styles.portfolioCard}>
    {/* ── Hero image ── */}
    <TouchableOpacity
      style={styles.heroImageWrapper}
      onPress={isOwner ? () => onHeroUpload(item.id) : undefined}
      activeOpacity={isOwner ? 0.85 : 1}
      disabled={heroUploading}
    >
      {heroUrl ? (
        <Image source={{ uri: heroUrl }} style={styles.heroImage} resizeMode="cover" />
      ) : (
        <View style={[styles.heroImagePlaceholder, { backgroundColor: item.accentColor + '20' }]}>
          <Text style={styles.heroEmoji}>{item.initials}</Text>
        </View>
      )}
      {isOwner && (
        <View style={styles.heroEditBtn}>
          {heroUploading
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.heroEditIcon}>{heroUrl ? '🖼  Change Cover' : '🖼  Add Cover'}</Text>}
        </View>
      )}
    </TouchableOpacity>

    {/* ── Proof images strip ── */}
    {item.proofImages.length > 0 && (
      <View style={styles.proofSection}>
        <Text style={styles.proofLabel}>Proof of Work</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.proofStrip}
        >
          {item.proofImages.map(proof => {
            const proofUrl = proofUrls[proof.id] ?? null;
            const isUploadingThis = proofUploading === proof.id;
            return (
              <TouchableOpacity
                key={proof.id}
                style={[styles.proofThumb, { backgroundColor: proofUrl ? 'transparent' : proof.color }]}
                onPress={isOwner ? () => onProofUpload(item.id, proof.id) : undefined}
                activeOpacity={isOwner ? 0.8 : 1}
                disabled={isUploadingThis}
              >
                {proofUrl ? (
                  <Image source={{ uri: proofUrl }} style={styles.proofThumbImage} resizeMode="cover" />
                ) : isUploadingThis ? (
                  <ActivityIndicator size="small" color={Colors.text.muted} />
                ) : (
                  <>
                    <Text style={styles.proofThumbEmoji}>{proof.emoji}</Text>
                    <Text style={styles.proofThumbLabel} numberOfLines={1}>{proof.label}</Text>
                  </>
                )}
              </TouchableOpacity>
            );
          })}
          {isOwner && (
            <TouchableOpacity
              style={styles.proofAddThumb}
              activeOpacity={0.8}
              onPress={() => onProofUpload(item.id, `new_${Date.now()}`)}
            >
              <Text style={styles.proofAddIcon}>＋</Text>
              <Text style={styles.proofAddLabel}>Add</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    )}

    {/* ── Card body ── */}
    <View style={styles.portfolioBody}>
      <View style={styles.portfolioTopRow}>
        <View style={[styles.catBadge, { backgroundColor: item.categoryColor + '18' }]}>
          <Text style={[styles.catBadgeText, { color: item.categoryColor }]}>{item.category}</Text>
        </View>
        {isOwner && (
          <TouchableOpacity style={styles.editItemBtn} activeOpacity={0.7}>
            <Text style={styles.editItemBtnText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.portfolioTitle}>{item.title}</Text>
      <Text style={styles.portfolioDesc}>{item.description}</Text>
      {!isOwner && (
        <TouchableOpacity
          style={[styles.inquireBtn, { backgroundColor: item.accentColor }]}
          activeOpacity={0.8}
        >
          <Text style={styles.inquireBtnText}>Inquire →</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

// ─── Gallery Grid ─────────────────────────────────────────────────────────────

interface GalleryGridProps {
  items: MockGalleryItem[];
  isOwner: boolean;
  galleryUrls: Record<string, string>;
  onGalleryUpload: (itemId: string) => void;
  uploadingGalleryId: string | null;
}

const GALLERY_ITEM_SIZE = (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.sm) / 2;

const GalleryGrid: React.FC<GalleryGridProps> = ({
  items, isOwner, galleryUrls, onGalleryUpload, uploadingGalleryId,
}) => (
  <View style={styles.galleryGrid}>
    {items.map(item => {
      const imageUrl   = galleryUrls[item.id] ?? null;
      const isUploading = uploadingGalleryId === item.id;
      return (
        <TouchableOpacity
          key={item.id}
          style={[styles.galleryItem, { backgroundColor: imageUrl ? 'transparent' : item.color }]}
          onPress={isOwner ? () => onGalleryUpload(item.id) : undefined}
          activeOpacity={isOwner ? 0.85 : 1}
          disabled={isUploading}
        >
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.galleryItemImage} resizeMode="cover" />
          ) : isUploading ? (
            <ActivityIndicator size="large" color={item.categoryColor} />
          ) : (
            <Text style={styles.galleryEmoji}>{item.emoji}</Text>
          )}
          <View style={styles.galleryOverlay}>
            <View style={[styles.galleryCatDot, { backgroundColor: item.categoryColor }]} />
            <Text style={styles.galleryItemTitle} numberOfLines={2}>{item.title}</Text>
          </View>
        </TouchableOpacity>
      );
    })}
    {isOwner && (
      <TouchableOpacity
        style={styles.galleryAddItem}
        activeOpacity={0.8}
        onPress={() => onGalleryUpload(`new_${Date.now()}`)}
      >
        <Text style={styles.galleryAddIcon}>＋</Text>
        <Text style={styles.galleryAddLabel}>Add to Gallery</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ─── Review Card ──────────────────────────────────────────────────────────────

const ReviewCard: React.FC<{ review: MockPeerReview }> = ({ review }) => (
  <View style={styles.reviewCard}>
    <View style={styles.reviewHeader}>
      <View style={[styles.reviewAvatar, { backgroundColor: review.reviewerColor + '18' }]}>
        <Text style={[styles.reviewAvatarText, { color: review.reviewerColor }]}>
          {review.reviewerInitials}
        </Text>
      </View>
      <View style={styles.reviewerInfo}>
        <Text style={styles.reviewerName}>{review.reviewerName}</Text>
        <Text style={styles.reviewerCourse}>{review.reviewerCourse}</Text>
      </View>
      <View style={styles.reviewRatingCol}>
        <View style={styles.reviewStars}>
          {[1,2,3,4,5].map(i => (
            <Text key={i} style={[styles.reviewStar, { opacity: i <= review.rating ? 1 : 0.15 }]}>★</Text>
          ))}
        </View>
        <Text style={styles.reviewAgo}>{review.postedAgo}</Text>
      </View>
    </View>
    <Text style={styles.reviewComment}>{review.comment}</Text>
  </View>
);

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

const LoadingSkeleton = () => (
  <View style={styles.skeletonWrap}>
    <ActivityIndicator color={Colors.primary} size="large" />
    <Text style={styles.skeletonText}>Loading portfolio…</Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

export const PortfolioScreen: React.FC<Props> = ({ isOwner, userId, ownerName, onBack }) => {
  const [reviewModalVisible,  setReviewModalVisible]  = useState(false);
  const [addItemModalVisible, setAddItemModalVisible] = useState(false);

  const { profile: ownProfile, user, setProfile } = useAuth();
  const { uploading: imageUploading, pickAndUpload } = useImageUpload();

  // ── Determine whose portfolio to load ────────────────────────────────────
  // Own portfolio  → use authenticated user's id
  // Other profile  → use the passed userId prop (mock IDs '1'–'6' won't have DB rows,
  //                  so the hook returns empty arrays gracefully)
  const targetUserId = isOwner ? (user?.id ?? null) : (userId ?? null);
  const {
    portfolioItems,
    galleryItems,
    reviews:      dbReviews,
    portfolioId,
    skillTags:    dbSkillTags,
    initialHeroUrls,
    initialProofUrls,
    initialGalleryUrls,
    loading:      portfolioLoading,
    refetch:      refetchPortfolio,
  } = usePortfolio(targetUserId);

  // ── Image URL state (seeded from DB on load) ──────────────────────────────
  // Banner + avatar read directly from AuthContext so they stay in sync with ProfileScreen
  const [heroUrls,    setHeroUrls]    = useState<Record<string, string>>({});
  const [proofUrls,   setProofUrls]   = useState<Record<string, string>>({});
  const [galleryUrls, setGalleryUrls] = useState<Record<string, string>>({});

  // Seed image maps once the hook has loaded from DB
  useEffect(() => {
    if (!portfolioLoading) {
      setHeroUrls(initialHeroUrls);
      setProofUrls(initialProofUrls);
      setGalleryUrls(initialGalleryUrls);
    }
  }, [portfolioLoading, initialHeroUrls, initialProofUrls, initialGalleryUrls]);

  // ── Reviews: use DB data; optimistically prepend new ones ─────────────────
  const [optimisticReviews, setOptimisticReviews] = useState<MockPeerReview[]>([]);
  const allReviews = [...optimisticReviews, ...dbReviews];

  // ── Upload-in-progress trackers ───────────────────────────────────────────
  const [uploadingBanner,    setUploadingBanner]    = useState(false);
  const [uploadingAvatar,    setUploadingAvatar]    = useState(false);
  const [uploadingHeroId,    setUploadingHeroId]    = useState<string | null>(null);
  const [uploadingProofId,   setUploadingProofId]   = useState<string | null>(null);
  const [uploadingGalleryId, setUploadingGalleryId] = useState<string | null>(null);

  // ── Derived display values ────────────────────────────────────────────────
  const publicProfile   = !isOwner && userId ? PUBLIC_PROFILE_BY_ID[userId] : null;
  const displayName     = isOwner ? (ownProfile?.full_name ?? ownerName ?? 'Student') : (publicProfile?.name ?? 'Student');
  const displayInitials = isOwner
    ? (ownProfile?.full_name
        ? ownProfile.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
        : ownerName ? ownerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'ME')
    : (publicProfile?.initials ?? '?');
  const accentColor = isOwner ? Colors.primary : (publicProfile?.accentColor ?? Colors.primary);
  const bannerColor = isOwner ? Colors.primary : (publicProfile?.bannerColor  ?? Colors.primary);
  const isVerified  = !isOwner && (publicProfile?.isVerified ?? false);

  const ownCourse = ownProfile?.course     ?? 'Course not set';
  const ownYear   = ownProfile?.year_level  ?? 'Year not set';
  const ownEmail  = user?.email             ?? '';

  // Banner + avatar come from AuthContext directly — always in sync with ProfileScreen
  const bannerUri = isOwner ? (ownProfile?.banner_url ?? null) : (publicProfile?.bannerUrl ?? null);
  const avatarUri = isOwner ? (ownProfile?.avatar_url ?? null) : (publicProfile?.avatarUrl ?? null);

  // Skill tags: own → DB (fall back to MY_SKILL_TAGS constant if DB empty); other → PUBLIC_PROFILE_BY_ID
  const displaySkillTags = isOwner
    ? (dbSkillTags.length > 0 ? dbSkillTags : MY_SKILL_TAGS)
    : (publicProfile?.skills ?? []);

  const avgRating = allReviews.length > 0
    ? (allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(1)
    : isOwner ? '—' : (publicProfile?.rating.toFixed(1) ?? '—');
  const reviewCount = isOwner ? allReviews.length : (publicProfile?.reviews ?? 0);

  // ── Upload handlers ───────────────────────────────────────────────────────

  const handleBannerUpload = useCallback(async () => {
    if (!user?.id || uploadingBanner) return;
    setUploadingBanner(true);
    const url = await pickAndUpload('banners', bannerPath(user.id), { aspect: [16, 5], quality: 0.9 });
    if (url) {
      const { error } = await supabase.from('profiles').update({ banner_url: url }).eq('id', user.id);
      if (error) console.error('[PortfolioScreen] banner save error:', error.message);
      else if (setProfile && ownProfile) setProfile({ ...ownProfile, banner_url: url });
    }
    setUploadingBanner(false);
  }, [user?.id, uploadingBanner, ownProfile, setProfile, pickAndUpload]);

  const handleAvatarUpload = useCallback(async () => {
    if (!user?.id || uploadingAvatar) return;
    setUploadingAvatar(true);
    const url = await pickAndUpload('avatars', avatarPath(user.id), { aspect: [1, 1], quality: 0.85 });
    if (url) {
      const { error } = await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
      if (error) console.error('[PortfolioScreen] avatar save error:', error.message);
      else if (setProfile && ownProfile) setProfile({ ...ownProfile, avatar_url: url });
    }
    setUploadingAvatar(false);
  }, [user?.id, uploadingAvatar, ownProfile, setProfile, pickAndUpload]);

  const handleHeroUpload = useCallback(async (itemId: string) => {
    if (!user?.id || uploadingHeroId) return;
    setUploadingHeroId(itemId);
    const url = await pickAndUpload('portfolio', heroImagePath(user.id, itemId), { aspect: [16, 9], quality: 0.9 });
    if (url) {
      setHeroUrls(prev => ({ ...prev, [itemId]: url }));
      if (portfolioId) {
        const { error } = await supabase
          .from('portfolio_items')
          .update({ hero_image_url: url })
          .eq('id', itemId)
          .eq('portfolio_id', portfolioId);
        if (error) console.error('[PortfolioScreen] hero save error:', error.message);
      }
    }
    setUploadingHeroId(null);
  }, [user?.id, uploadingHeroId, pickAndUpload]);

  const handleProofUpload = useCallback(async (itemId: string, proofId: string) => {
    if (!user?.id || uploadingProofId) return;
    setUploadingProofId(proofId);
    const url = await pickAndUpload('portfolio', proofImagePath(user.id, itemId, proofId), { aspect: [4, 3], quality: 0.85 });
    if (url) {
      setProofUrls(prev => ({ ...prev, [proofId]: url }));
      if (portfolioId) {
        const { data: existingRow } = await supabase
          .from('portfolio_items')
          .select('proof_image_urls')
          .eq('id', itemId)
          .eq('portfolio_id', portfolioId)
          .single();
        const existing: string[] = existingRow?.proof_image_urls ?? [];
        await supabase
          .from('portfolio_items')
          .update({ proof_image_urls: [...existing, url] })
          .eq('id', itemId)
          .eq('portfolio_id', portfolioId);
      }
    }
    setUploadingProofId(null);
  }, [user?.id, uploadingProofId, pickAndUpload]);

  const handleGalleryUpload = useCallback(async (itemId: string) => {
    if (!user?.id || uploadingGalleryId) return;
    // itemId starting with 'new_' means no DB row yet — we INSERT
    const isNew = itemId.startsWith('new_');
    setUploadingGalleryId(itemId);
    const storageId = isNew ? `gallery_${Date.now()}` : itemId;
    const url = await pickAndUpload('gallery', galleryImagePath(user.id, storageId), { aspect: [1, 1], quality: 0.9 });
    if (url) {
      if (isNew) {
        // INSERT a new gallery_items row
        const { data: newRow, error } = await supabase
          .from('gallery_items')
          .insert({
            user_id:        user.id,
            title:          'My Work',
            category:       'Other',
            category_color: '#6B7280',
            image_url:      url,
          })
          .select()
          .single();
        if (error) {
          console.error('[PortfolioScreen] gallery insert error:', error.message);
        } else if (newRow) {
          // Refetch so the new row appears in galleryItems
          refetchPortfolio();
        }
      } else {
        // UPDATE existing row
        setGalleryUrls(prev => ({ ...prev, [itemId]: url }));
        const { error } = await supabase
          .from('gallery_items')
          .update({ image_url: url })
          .eq('id', itemId)
          .eq('user_id', user.id);
        if (error) console.error('[PortfolioScreen] gallery update error:', error.message);
      }
    }
    setUploadingGalleryId(null);
  }, [user?.id, uploadingGalleryId, pickAndUpload]);

  // ── Add portfolio item ─────────────────────────────────────────────────────
  const handleAddItem = useCallback(async (title: string, category: string, description: string) => {
    if (!portfolioId) return;
    const { error } = await supabase
      .from('portfolio_items')
      .insert({
        portfolio_id: portfolioId,
        title,
        category,
        description,
      });
    if (error) {
      console.error('[PortfolioScreen] add item error:', error.message);
    } else {
      refetchPortfolio();
    }
  }, [portfolioId, refetchPortfolio]);

  // ── Review submit — writes to DB + optimistic prepend ─────────────────────
  const handleReviewSubmit = useCallback(async (rating: number, comment: string) => {
    if (!user?.id || !portfolioId) return;

    // Optimistic update so the review appears immediately
    const optimistic: MockPeerReview = {
      id:               `opt_${Date.now()}`,
      reviewerName:     ownProfile?.full_name ?? 'You',
      reviewerInitials: ownProfile?.full_name
        ? ownProfile.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
        : 'YO',
      reviewerCourse:   ownProfile?.course ?? '',
      reviewerColor:    Colors.primary,
      rating,
      comment,
      postedAgo: 'just now',
    };
    setOptimisticReviews(prev => [optimistic, ...prev]);

    // Persist to Supabase
    const { error } = await supabase.from('peer_reviews').insert({
      portfolio_id: portfolioId,
      reviewer_id:  user.id,
      rating,
      comment,
    });
    if (error) {
      console.error('[PortfolioScreen] review insert error:', error.message);
      // Roll back optimistic insert
      setOptimisticReviews(prev => prev.filter(r => r.id !== optimistic.id));
    }
  }, [user?.id, userId, ownProfile, portfolioId]);

  // ── Render ────────────────────────────────────────────────────────────────

  if (portfolioLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <TouchableOpacity style={styles.floatingBackStandalone} onPress={onBack} activeOpacity={0.85}>
          <Text style={styles.floatingBackIcon}>‹</Text>
        </TouchableOpacity>
        <LoadingSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ══ Banner + Avatar Header ══════════════════════════════════════ */}
        <View style={styles.bannerContainer}>
          {bannerUri ? (
            <ImageBackground
              source={{ uri: bannerUri }}
              style={[styles.banner, { backgroundColor: bannerColor }]}
              resizeMode="cover"
            >
              <View style={styles.bannerFade} />
              <TouchableOpacity style={styles.floatingBack} onPress={onBack} activeOpacity={0.85}>
                <Text style={styles.floatingBackIcon}>‹</Text>
              </TouchableOpacity>
              {isOwner && (
                <TouchableOpacity
                  style={styles.floatingEdit}
                  onPress={handleBannerUpload}
                  activeOpacity={0.85}
                  disabled={uploadingBanner}
                >
                  {uploadingBanner
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={styles.floatingEditText}>🖼  Change Banner</Text>}
                </TouchableOpacity>
              )}
            </ImageBackground>
          ) : (
            <View style={[styles.banner, { backgroundColor: bannerColor }]}>
              <View style={styles.bannerFade} />
              <TouchableOpacity style={styles.floatingBack} onPress={onBack} activeOpacity={0.85}>
                <Text style={styles.floatingBackIcon}>‹</Text>
              </TouchableOpacity>
              {isOwner && (
                <TouchableOpacity
                  style={styles.floatingEdit}
                  onPress={handleBannerUpload}
                  activeOpacity={0.85}
                  disabled={uploadingBanner}
                >
                  {uploadingBanner
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={styles.floatingEditText}>🖼  Add Banner</Text>}
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Avatar — overlaps banner bottom */}
          <View style={styles.avatarWrapper}>
            <TouchableOpacity
              onPress={isOwner ? handleAvatarUpload : undefined}
              activeOpacity={isOwner ? 0.85 : 1}
              disabled={uploadingAvatar}
              style={[
                styles.avatar,
                { backgroundColor: accentColor + '30', borderColor: accentColor },
                avatarUri && { backgroundColor: 'transparent', borderColor: '#fff' },
              ]}
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImg} resizeMode="cover" />
              ) : uploadingAvatar ? (
                <ActivityIndicator size="small" color={accentColor} />
              ) : (
                <Text style={[styles.avatarText, { color: accentColor }]}>{displayInitials}</Text>
              )}
            </TouchableOpacity>
            {isOwner && !uploadingAvatar && (
              <TouchableOpacity style={styles.avatarEditBtn} onPress={handleAvatarUpload} activeOpacity={0.8}>
                <Text style={styles.avatarEditIcon}>✎</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ══ Identity ════════════════════════════════════════════════════ */}
        <View style={styles.identityBlock}>
          <View style={styles.nameRow}>
            <Text style={styles.displayName}>{displayName}</Text>
            {isVerified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Verified</Text>
              </View>
            )}
          </View>
          {isOwner ? (
            <>
              <Text style={styles.courseLine}>{ownYear}  ·  {ownCourse}</Text>
              <Text style={styles.emailLine}>{ownEmail}</Text>
            </>
          ) : publicProfile ? (
            <>
              <Text style={styles.courseLine}>{publicProfile.course}  ·  {publicProfile.yearLevel}</Text>
              <Text style={styles.emailLine}>{publicProfile.email}</Text>
            </>
          ) : null}
          <View style={styles.ratingRow}>
            <View style={styles.ratingStars}>
              {[1,2,3,4,5].map(i => (
                <Text key={i} style={[styles.ratingStar, { opacity: i <= Math.round(Number(avgRating)) ? 1 : 0.2 }]}>★</Text>
              ))}
            </View>
            <Text style={styles.ratingNum}>{avgRating}</Text>
            <Text style={styles.ratingCount}>({reviewCount} reviews)</Text>
          </View>
        </View>

        {/* ══ Commission / Hire CTA (public only) ═════════════════════════ */}
        {!isOwner && (
          <View style={styles.hireCTARow}>
            <TouchableOpacity style={[styles.hireBtn, { backgroundColor: accentColor }]} activeOpacity={0.85}>
              <Text style={styles.hireBtnText}>💼  Commission / Hire</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageBtn} activeOpacity={0.85}>
              <Text style={styles.messageBtnText}>✉  Message</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ══ Skills ══════════════════════════════════════════════════════ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillTagsRow}>
            {displaySkillTags.map(skill => (
              <View key={skill} style={[styles.skillTag, { backgroundColor: accentColor + '15', borderColor: accentColor + '35' }]}>
                <Text style={[styles.skillTagText, { color: accentColor }]}>{skill}</Text>
              </View>
            ))}
            {isOwner && (
              <TouchableOpacity style={styles.addSkillTag} activeOpacity={0.7}>
                <Text style={styles.addSkillTagText}>+ Add Skill</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ══ Portfolio Items ══════════════════════════════════════════════ */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Portfolio</Text>
            {isOwner && (
              <TouchableOpacity
                style={[styles.sectionActionBtn, { backgroundColor: accentColor }]}
                activeOpacity={0.8}
                onPress={() => setAddItemModalVisible(true)}
              >
                <Text style={styles.sectionActionBtnText}>+ Add Item</Text>
              </TouchableOpacity>
            )}
          </View>
          {portfolioItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎨</Text>
              <Text style={styles.emptyText}>No portfolio items yet</Text>
              {isOwner && <Text style={styles.emptySubtext}>Tap "+ Add Item" to showcase your work</Text>}
            </View>
          ) : (
            <View style={styles.portfolioList}>
              {portfolioItems.map(item => (
                <PortfolioCard
                  key={item.id}
                  item={item}
                  isOwner={isOwner}
                  userId={user?.id ?? null}
                  heroUrl={heroUrls[item.id] ?? null}
                  proofUrls={proofUrls}
                  onHeroUpload={handleHeroUpload}
                  onProofUpload={handleProofUpload}
                  heroUploading={uploadingHeroId === item.id}
                  proofUploading={uploadingProofId}
                />
              ))}
            </View>
          )}
        </View>

        {/* ══ Gallery of My Works ══════════════════════════════════════════ */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <View>
              <Text style={styles.sectionTitle}>Gallery of My Works</Text>
              <Text style={styles.sectionSubtitle}>Commissions & outputs</Text>
            </View>
            {isOwner && (
              <TouchableOpacity
                style={[styles.sectionActionBtn, { backgroundColor: accentColor }]}
                activeOpacity={0.8}
                onPress={() => handleGalleryUpload(`new_${Date.now()}`)}
              >
                <Text style={styles.sectionActionBtnText}>+ Upload</Text>
              </TouchableOpacity>
            )}
          </View>
          {galleryItems.length === 0 && !isOwner ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🖼</Text>
              <Text style={styles.emptyText}>No gallery items yet</Text>
            </View>
          ) : (
            <GalleryGrid
              items={galleryItems}
              isOwner={isOwner}
              galleryUrls={galleryUrls}
              onGalleryUpload={handleGalleryUpload}
              uploadingGalleryId={uploadingGalleryId}
            />
          )}
        </View>

        {/* ══ Peer Reviews ═════════════════════════════════════════════════ */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <View>
              <Text style={styles.sectionTitle}>
                Peer Reviews{allReviews.length > 0 && <Text style={styles.sectionCount}>  {allReviews.length}</Text>}
              </Text>
            </View>
            {!isOwner && (
              <TouchableOpacity
                style={styles.writeReviewBtn}
                onPress={() => setReviewModalVisible(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.writeReviewBtnText}>✏  Write Review</Text>
              </TouchableOpacity>
            )}
          </View>
          {allReviews.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>⭐</Text>
              <Text style={styles.emptyText}>No reviews yet</Text>
              {!isOwner && <Text style={styles.emptySubtext}>Be the first to leave a review</Text>}
            </View>
          ) : (
            <View style={styles.reviewsList}>
              {allReviews.map(review => <ReviewCard key={review.id} review={review} />)}
            </View>
          )}
        </View>

      </ScrollView>

      <ReviewModal
        visible={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
        onSubmit={handleReviewSubmit}
      />

      <AddPortfolioItemModal
        visible={addItemModalVisible}
        onClose={() => setAddItemModalVisible(false)}
        onAdd={handleAddItem}
      />
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.bg.surface },
  scroll: { paddingBottom: 100 },

  // ── Loading ──
  skeletonWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  skeletonText: { fontSize: FontSize.sm, color: Colors.text.muted },

  // ── Banner + Avatar ──
  bannerContainer: { marginBottom: 0 },
  banner: { height: BANNER_HEIGHT, width: '100%', justifyContent: 'flex-end' },
  bannerFade: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 60, backgroundColor: 'rgba(0,0,0,0.18)',
  },
  floatingBack: {
    position: 'absolute', top: Spacing.md, left: Spacing.md,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.30)', alignItems: 'center', justifyContent: 'center',
  },
  floatingBackStandalone: {
    margin: Spacing.md,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.bg.muted, alignItems: 'center', justifyContent: 'center',
  },
  floatingBackIcon: { fontSize: 24, color: '#fff', lineHeight: 28, marginTop: -2 },
  floatingEdit: {
    position: 'absolute', top: Spacing.md, right: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.30)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.pill, minWidth: 40, alignItems: 'center',
  },
  floatingEditText: { fontSize: 11, fontWeight: '700', color: '#fff' },

  avatarWrapper: { position: 'absolute', bottom: -(AVATAR_SIZE / 2), left: Spacing.xl, zIndex: 10 },
  avatar: {
    width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2,
    borderWidth: 3, borderColor: '#fff', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#eee',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15,
    shadowRadius: 6, elevation: 4, overflow: 'hidden',
  },
  avatarImg:     { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 },
  avatarText:    { fontSize: 22, fontWeight: '800' },
  avatarEditBtn: {
    position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.primary, borderWidth: 2, borderColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarEditIcon: { fontSize: 11, color: '#fff', fontWeight: '800' },

  // ── Identity ──
  identityBlock: {
    paddingHorizontal: Spacing.xl,
    paddingTop: AVATAR_SIZE / 2 + Spacing.sm,
    paddingBottom: Spacing.lg,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  nameRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 },
  displayName:  { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text.primary, letterSpacing: -0.4 },
  verifiedBadge:{ backgroundColor: Colors.accent.green + '22', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  verifiedText: { fontSize: 10, fontWeight: '700', color: Colors.accent.green },
  courseLine:   { fontSize: FontSize.sm, color: Colors.text.secondary, marginBottom: 2 },
  emailLine:    { fontSize: FontSize.xs, color: Colors.text.muted, marginBottom: 8 },
  ratingRow:    { flexDirection: 'row', alignItems: 'center', gap: 5 },
  ratingStars:  { flexDirection: 'row' },
  ratingStar:   { fontSize: 13, color: Colors.accent.orange },
  ratingNum:    { fontSize: 13, fontWeight: '800', color: Colors.text.primary },
  ratingCount:  { fontSize: 12, color: Colors.text.muted },

  // ── Hire CTA ──
  hireCTARow: {
    flexDirection: 'row', gap: Spacing.sm,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  hireBtn:        { flex: 1, paddingVertical: Spacing.md, borderRadius: Radius.pill, alignItems: 'center' },
  hireBtnText:    { fontSize: FontSize.sm, fontWeight: '800', color: '#fff' },
  messageBtn:     { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, borderRadius: Radius.pill, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center' },
  messageBtnText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text.secondary },

  // ── Section ──
  section:         { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.md },
  sectionRow:      { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: Spacing.md },
  sectionTitle:    { fontSize: FontSize.lg, fontWeight: '800', color: Colors.text.primary, letterSpacing: -0.2 },
  sectionSubtitle: { fontSize: FontSize.xs, color: Colors.text.muted, marginTop: 2 },
  sectionCount:    { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text.muted },
  sectionActionBtn:{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.pill },
  sectionActionBtnText: { fontSize: FontSize.xs, fontWeight: '700', color: '#fff' },

  // ── Skills ──
  skillTagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillTag:     { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill, borderWidth: 1.5 },
  skillTagText: { fontSize: FontSize.sm, fontWeight: '700' },
  addSkillTag:  { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill, borderWidth: 1.5, borderStyle: 'dashed', borderColor: Colors.border },
  addSkillTagText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text.muted },

  // ── Portfolio Cards ──
  portfolioList: { gap: Spacing.lg },
  portfolioCard: { backgroundColor: '#fff', borderRadius: Radius.xl, overflow: 'hidden', ...Shadow.card },
  heroImageWrapper: { position: 'relative' },
  heroImage:        { height: 180, width: '100%' },
  heroImagePlaceholder: { height: 180, width: '100%', alignItems: 'center', justifyContent: 'center' },
  heroEmoji:   { fontSize: 52, opacity: 0.6 },
  heroEditBtn: {
    position: 'absolute', bottom: Spacing.sm, right: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.pill, minWidth: 40, alignItems: 'center',
  },
  heroEditIcon: { fontSize: 11, fontWeight: '700', color: '#fff' },

  proofSection:  { paddingTop: Spacing.md, paddingBottom: Spacing.xs },
  proofLabel:    { fontSize: 10, fontWeight: '700', color: Colors.text.muted, letterSpacing: 0.8, marginBottom: Spacing.sm, paddingHorizontal: Spacing.md },
  proofStrip:    { paddingHorizontal: Spacing.md, gap: Spacing.sm },
  proofThumb:    { width: 96, height: 72, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', paddingBottom: Spacing.xs, gap: 4, overflow: 'hidden' },
  proofThumbImage: { width: 96, height: 72, borderRadius: Radius.md },
  proofThumbEmoji: { fontSize: 26 },
  proofThumbLabel: { fontSize: 9, fontWeight: '600', color: Colors.text.secondary, textAlign: 'center', paddingHorizontal: 4 },
  proofAddThumb: { width: 96, height: 72, borderRadius: Radius.md, borderWidth: 1.5, borderStyle: 'dashed', borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', gap: 2 },
  proofAddIcon:  { fontSize: 20, color: Colors.text.muted },
  proofAddLabel: { fontSize: 9, fontWeight: '600', color: Colors.text.muted },

  portfolioBody:   { padding: Spacing.lg, gap: Spacing.sm },
  portfolioTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  catBadge:        { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 6 },
  catBadgeText:    { fontSize: 10, fontWeight: '700' },
  editItemBtn:     { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.pill, borderWidth: 1.5, borderColor: Colors.border },
  editItemBtnText: { fontSize: 11, fontWeight: '600', color: Colors.text.muted },
  portfolioTitle:  { fontSize: FontSize.md, fontWeight: '800', color: Colors.text.primary, lineHeight: 22 },
  portfolioDesc:   { fontSize: 13, color: Colors.text.secondary, lineHeight: 19 },
  inquireBtn:      { alignSelf: 'flex-start', paddingHorizontal: Spacing.lg, paddingVertical: 7, borderRadius: Radius.pill, marginTop: 4 },
  inquireBtnText:  { fontSize: 13, fontWeight: '800', color: '#fff' },

  // ── Gallery Grid ──
  galleryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  galleryItem: { width: GALLERY_ITEM_SIZE, height: GALLERY_ITEM_SIZE, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' },
  galleryItemImage: { width: GALLERY_ITEM_SIZE, height: GALLERY_ITEM_SIZE, borderRadius: Radius.lg, position: 'absolute' },
  galleryEmoji:     { fontSize: 38, opacity: 0.7 },
  galleryOverlay:   { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.30)', padding: Spacing.sm, flexDirection: 'row', alignItems: 'center', gap: 5 },
  galleryCatDot:    { width: 6, height: 6, borderRadius: 3, flexShrink: 0 },
  galleryItemTitle: { flex: 1, fontSize: 11, fontWeight: '700', color: '#fff', lineHeight: 14 },
  galleryAddItem:   { width: GALLERY_ITEM_SIZE, height: GALLERY_ITEM_SIZE, borderRadius: Radius.lg, borderWidth: 1.5, borderStyle: 'dashed', borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', gap: Spacing.xs },
  galleryAddIcon:   { fontSize: 28, color: Colors.text.muted },
  galleryAddLabel:  { fontSize: 12, fontWeight: '600', color: Colors.text.muted },

  // ── Reviews ──
  writeReviewBtn:     { backgroundColor: Colors.bg.muted, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.pill },
  writeReviewBtnText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.text.secondary },
  reviewsList: { gap: Spacing.md },
  reviewCard:  { backgroundColor: '#fff', borderRadius: Radius.lg, padding: Spacing.lg, ...Shadow.card },
  reviewHeader:     { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, marginBottom: Spacing.sm },
  reviewAvatar:     { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  reviewAvatarText: { fontSize: 14, fontWeight: '800' },
  reviewerInfo:     { flex: 1 },
  reviewerName:     { fontSize: FontSize.md, fontWeight: '700', color: Colors.text.primary },
  reviewerCourse:   { fontSize: 11, color: Colors.text.muted, marginTop: 1 },
  reviewRatingCol:  { alignItems: 'flex-end', gap: 2 },
  reviewStars:      { flexDirection: 'row' },
  reviewStar:       { fontSize: 12, color: Colors.accent.orange },
  reviewAgo:        { fontSize: 10, color: Colors.text.muted },
  reviewComment:    { fontSize: FontSize.sm, color: Colors.text.secondary, lineHeight: 20 },

  // ── Empty State ──
  emptyState:   { alignItems: 'center', paddingVertical: Spacing.xxxl, gap: Spacing.sm },
  emptyIcon:    { fontSize: 36 },
  emptyText:    { fontSize: FontSize.md, fontWeight: '700', color: Colors.text.secondary },
  emptySubtext: { fontSize: FontSize.sm, color: Colors.text.muted },

  // ── Add Item Modal ──
  addItemLabel:    { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text.primary, marginBottom: 6, marginTop: Spacing.md },
  addItemOptional: { fontSize: FontSize.xs, fontWeight: '400', color: Colors.text.muted },
  addItemInput: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md,
    padding: Spacing.md, fontSize: FontSize.md, color: Colors.text.primary,
    marginBottom: 4,
  },
  addItemInputMulti: { minHeight: 80, textAlignVertical: 'top' },
  addItemCategoryRow: { flexDirection: 'row', gap: 8, paddingVertical: 4, paddingBottom: Spacing.md },
  addItemCategoryChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: '#fff',
  },
  addItemCategoryChipActive:     { backgroundColor: Colors.primary, borderColor: Colors.primary },
  addItemCategoryChipText:       { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text.secondary },
  addItemCategoryChipTextActive: { color: '#fff', fontWeight: '700' },

  // ── Review Modal ──
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet:   { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.xl, paddingBottom: 36 },
  modalHandle:         { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.xl },
  modalTitle:          { fontSize: FontSize.xl, fontWeight: '800', color: Colors.text.primary, marginBottom: 4 },
  modalSub:            { fontSize: FontSize.sm, color: Colors.text.muted, marginBottom: Spacing.xl },
  starPicker:          { flexDirection: 'row', gap: Spacing.sm, marginBottom: 8 },
  starPickerItem:      { fontSize: 40, color: Colors.accent.orange },
  ratingLabel:         { fontSize: FontSize.sm, fontWeight: '700', color: Colors.accent.orange, marginBottom: Spacing.lg, textAlign: 'center' },
  reviewInput:         { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.md, color: Colors.text.primary, minHeight: 100, marginBottom: Spacing.lg },
  submitReviewBtn:     { backgroundColor: Colors.primary, borderRadius: Radius.pill, paddingVertical: Spacing.lg, alignItems: 'center', marginBottom: Spacing.sm },
  submitReviewBtnText: { fontSize: FontSize.md, fontWeight: '800', color: '#fff' },
  cancelBtn:           { alignItems: 'center', paddingVertical: Spacing.sm },
  cancelBtnText:       { fontSize: FontSize.sm, color: Colors.text.muted, fontWeight: '600' },
});
