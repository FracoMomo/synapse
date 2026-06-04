import { LobbyType, VenueType } from './theme';

export interface LobbyCard {
  id: string;
  title: string;
  host: string;
  hostAvatar: string;
  type: LobbyType;
  yearLevel: '1st Year' | '2nd Year' | '3rd Year' | '4th Year' | 'Any';
  time: string;
  venue: string;
  venueId: VenueType;
  joined: number;
  capacity: number;
  hasJoined: boolean;
  isLive: boolean;
}

export interface AcademicDeadline {
  id: string;
  title: string;
  subject: string;
  dueIn: string;
  platform: 'teams';
}

export interface IntramuralsScore {
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  sport: string;
  isLive: boolean;
}

export const MOCK_LOBBIES: LobbyCard[] = [
  {
    id: '1',
    title: 'DS Finals Grind',
    host: 'Mika R.',
    hostAvatar: 'MR',
    type: 'studyBlock',
    yearLevel: '3rd Year',
    time: '4:00 PM',
    venue: 'CCS Lab',
    venueId: 'ccs_lab',
    joined: 5,
    capacity: 8,
    hasJoined: false,
    isLive: true,
  },
  {
    id: '2',
    title: 'Bball pickup game',
    host: 'Carlo B.',
    hostAvatar: 'CB',
    type: 'sports',
    yearLevel: 'Any',
    time: '5:30 PM',
    venue: 'Covered Court',
    venueId: 'ccs_lab',
    joined: 8,
    capacity: 10,
    hasJoined: true,
    isLive: false,
  },
  {
    id: '3',
    title: 'UI/UX Design Talk',
    host: 'GDSC CIT-U',
    hostAvatar: 'GD',
    type: 'campusEvent',
    yearLevel: 'Any',
    time: '6:00 PM',
    venue: 'Online / Zoom',
    venueId: 'online',
    joined: 14,
    capacity: 30,
    hasJoined: false,
    isLive: false,
  },
  {
    id: '4',
    title: 'Public Film Viewing — Everything Everywhere',
    host: 'Bea T.',
    hostAvatar: 'BT',
    type: 'studentEvent',
    yearLevel: '2nd Year',
    time: '3:00 PM',
    venue: 'CBA Lounge',
    venueId: 'cba_lounge',
    joined: 3,
    capacity: 6,
    hasJoined: false,
    isLive: true,
  },
  {
    id: '5',
    title: 'Accounting Board Exam Review',
    host: 'JC Accounting Society',
    hostAvatar: 'JC',
    type: 'reviewSession',
    yearLevel: '1st Year',
    time: '7:00 PM',
    venue: 'Library',
    venueId: 'library',
    joined: 22,
    capacity: 40,
    hasJoined: false,
    isLive: false,
  },
  {
    id: '6',
    title: 'Chess Casual — All Welcome',
    host: 'Franz L.',
    hostAvatar: 'FL',
    type: 'hobbyInterest',
    yearLevel: 'Any',
    time: '5:00 PM',
    venue: 'CBA Lounge',
    venueId: 'cba_lounge',
    joined: 4,
    capacity: 10,
    hasJoined: false,
    isLive: false,
  },
  {
    id: '7',
    title: 'Social Media & Mental Health — Physio Presentation',
    host: 'Physiology Block B',
    hostAvatar: 'PB',
    type: 'openPresentation',
    yearLevel: 'Any',
    time: '2:00 PM',
    venue: 'Library',
    venueId: 'library',
    joined: 9,
    capacity: 25,
    hasJoined: false,
    isLive: true,
  },
];

export const MOCK_ACADEMIC: AcademicDeadline = {
  id: 'a1',
  title: 'Lab Report 3',
  subject: 'Data Structures',
  dueIn: '2h 30m',
  platform: 'teams',
};

// ─── Calendar ──────────────────────────────────────────────────────────────

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'class' | 'deadline' | 'lobby' | 'campus_event';
  startTime: string;   // '09:00' — 24-hour
  endTime?: string;    // '10:30' — 24-hour, omit for deadlines
  venue?: string;
  subject?: string;    // Course name (shown on deadlines / classes)
  color: string;
  source: 'teams' | 'synapse' | 'manual';
  dateOffset: number;  // 0 = today, 1 = tomorrow, -1 = yesterday
}

export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  // ── Today (0) ─────────────────────────────────────────────────────
  {
    id: 'cal1', title: 'Data Structures',
    type: 'class', startTime: '07:30', endTime: '09:00',
    venue: 'CCS Lab 3 — Room 201', subject: 'CSELECT 3',
    color: '#3D5AFE', source: 'teams', dateOffset: 0,
  },
  {
    id: 'cal2', title: 'Technical Writing',
    type: 'class', startTime: '10:00', endTime: '11:30',
    venue: 'Faculty Hall 4', subject: 'ENG 104',
    color: '#3D5AFE', source: 'teams', dateOffset: 0,
  },
  {
    id: 'cal3', title: 'Lab Report 3 — Submission Due',
    type: 'deadline', startTime: '23:59',
    subject: 'Data Structures',
    color: '#EF4444', source: 'teams', dateOffset: 0,
  },
  {
    id: 'cal4', title: 'DS Finals Grind',
    type: 'lobby', startTime: '16:00', endTime: '17:30',
    venue: 'CCS Lab', color: '#3D5AFE', source: 'synapse', dateOffset: 0,
  },
  {
    id: 'cal5', title: 'UI/UX Design Talk',
    type: 'campus_event', startTime: '18:00', endTime: '19:30',
    venue: 'Online / Zoom', color: '#7C3AED', source: 'synapse', dateOffset: 0,
  },
  // ── Tomorrow (1) ──────────────────────────────────────────────────
  {
    id: 'cal6', title: 'Object-Oriented Programming',
    type: 'class', startTime: '08:00', endTime: '09:30',
    venue: 'CCS Lab 2', subject: 'IT 211',
    color: '#3D5AFE', source: 'teams', dateOffset: 1,
  },
  {
    id: 'cal7', title: 'Physics Quiz 2 — Due',
    type: 'deadline', startTime: '12:00',
    subject: 'Physics for Engineers',
    color: '#EF4444', source: 'teams', dateOffset: 1,
  },
  {
    id: 'cal8', title: 'Bball Pickup Game',
    type: 'lobby', startTime: '17:30', endTime: '19:00',
    venue: 'Covered Court', color: '#10B981', source: 'synapse', dateOffset: 1,
  },
  // ── Day after tomorrow (2) ────────────────────────────────────────
  {
    id: 'cal9', title: 'Discrete Mathematics',
    type: 'class', startTime: '09:00', endTime: '10:30',
    venue: 'GS Hall 3', subject: 'MATH 211',
    color: '#3D5AFE', source: 'teams', dateOffset: 2,
  },
  {
    id: 'cal10', title: 'Database Systems',
    type: 'class', startTime: '13:00', endTime: '14:30',
    venue: 'CCS Lab 1', subject: 'DBMS 301',
    color: '#3D5AFE', source: 'teams', dateOffset: 2,
  },
  {
    id: 'cal11', title: 'Chess Casual — All Welcome',
    type: 'lobby', startTime: '17:00', endTime: '19:00',
    venue: 'CBA Lounge', color: '#EC4899', source: 'synapse', dateOffset: 2,
  },
  // ── Yesterday (-1) ────────────────────────────────────────────────
  {
    id: 'cal12', title: 'Software Engineering',
    type: 'class', startTime: '08:00', endTime: '09:30',
    venue: 'CCS Lab 3', subject: 'SE 301',
    color: '#3D5AFE', source: 'teams', dateOffset: -1,
  },
  {
    id: 'cal13', title: 'Case Study 2 — Submission',
    type: 'deadline', startTime: '23:59',
    subject: 'Software Engineering',
    color: '#EF4444', source: 'teams', dateOffset: -1,
  },
];

// ─── Portfolio ───────────────────────────────────────────────────────────────

export interface MockProofImage {
  id: string;
  label: string;   // caption shown under the image
  emoji: string;   // placeholder until real image (Phase 6: swap for uri)
  color: string;   // placeholder bg color
}

export interface MockGalleryItem {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  emoji: string;
  color: string;
}

export interface MockPortfolioItem {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  initials: string;   // hero fallback until real image (Phase 6: swap for uri)
  accentColor: string;
  description: string;
  proofImages: MockProofImage[];  // evidence images per item — Phase 6: real URIs
}

export interface MockPeerReview {
  id: string;
  reviewerName: string;
  reviewerInitials: string;
  reviewerCourse: string;
  reviewerColor: string;
  rating: number;
  comment: string;
  postedAgo: string;
}

export const MY_SKILL_TAGS = [
  'Graphic Design',
  'Video Editing',
  'UI/UX Design',
  'Tutoring',
];

export const MOCK_PORTFOLIO_ITEMS: MockPortfolioItem[] = [
  {
    id: 'p1',
    title: 'CIT-U Hackathon Brand Identity',
    category: 'Design',
    categoryColor: '#3D5AFE',
    initials: 'BD',
    accentColor: '#3D5AFE',
    description: 'Full brand identity for the CIT-U 2025 Hackathon — logo, color palette, and social kit.',
    proofImages: [
      { id: 'pi1a', label: 'Logo Final',       emoji: '🎨', color: '#EEF1FF' },
      { id: 'pi1b', label: 'Color Palette',    emoji: '🌈', color: '#F5F3FF' },
      { id: 'pi1c', label: 'Social Media Kit', emoji: '📱', color: '#EEF1FF' },
      { id: 'pi1d', label: 'Print Mockup',     emoji: '📌', color: '#F0F4FF' },
    ],
  },
  {
    id: 'p2',
    title: 'Org Promo Reel — CIT-U GDSC',
    category: 'Video',
    categoryColor: '#7C3AED',
    initials: 'PR',
    accentColor: '#7C3AED',
    description: '30-second promo video for the Google Developer Student Club, edited in Premiere Pro.',
    proofImages: [
      { id: 'pi2a', label: 'Storyboard',      emoji: '📋', color: '#F5F3FF' },
      { id: 'pi2b', label: 'Rough Cut',       emoji: '✂️',  color: '#EDE9FE' },
      { id: 'pi2c', label: 'Color Grade',     emoji: '🎥', color: '#F5F3FF' },
    ],
  },
  {
    id: 'p3',
    title: 'Synapse App — UI/UX Case Study',
    category: 'UI/UX',
    categoryColor: '#06B6D4',
    initials: 'UX',
    accentColor: '#06B6D4',
    description: 'End-to-end UX case study: research, wireframes, and high-fi prototype in Figma.',
    proofImages: [
      { id: 'pi3a', label: 'User Research',   emoji: '🔬', color: '#ECFEFF' },
      { id: 'pi3b', label: 'Wireframes',      emoji: '✏️',  color: '#E0F9FF' },
      { id: 'pi3c', label: 'Hi-Fi Prototype', emoji: '📲', color: '#ECFEFF' },
      { id: 'pi3d', label: 'Final Screens',   emoji: '✨',  color: '#E0F9FF' },
    ],
  },
  {
    id: 'p4',
    title: 'Data Structures Tutoring Module',
    category: 'Tutoring',
    categoryColor: '#10B981',
    initials: 'DS',
    accentColor: '#10B981',
    description: 'Self-paced review module used by 40+ 2nd-year CS students for their midterm exam.',
    proofImages: [
      { id: 'pi4a', label: 'Module Cover',    emoji: '📚', color: '#ECFDF5' },
      { id: 'pi4b', label: 'Sample Slide',    emoji: '📊', color: '#D1FAE5' },
      { id: 'pi4c', label: 'Student Feedback',emoji: '⭐', color: '#ECFDF5' },
    ],
  },
];

// ─── Gallery of My Works ─────────────────────────────────────────────────────
// Phase 6: items will have real image URIs from Supabase Storage

export const MOCK_GALLERY_ITEMS: MockGalleryItem[] = [
  { id: 'g1', title: 'GDSC Hackathon Poster',       category: 'Design',  categoryColor: '#3D5AFE', emoji: '🎨', color: '#EEF1FF' },
  { id: 'g2', title: 'Campus Org Reel',              category: 'Video',   categoryColor: '#7C3AED', emoji: '🎥', color: '#F5F3FF' },
  { id: 'g3', title: 'Thesis Defense Slides',        category: 'Design',  categoryColor: '#3D5AFE', emoji: '📊', color: '#EEF1FF' },
  { id: 'g4', title: 'Figma Plugin UI',              category: 'UI/UX',   categoryColor: '#06B6D4', emoji: '🔮', color: '#ECFEFF' },
  { id: 'g5', title: 'Brand Guide — Student Startup', category: 'Design',  categoryColor: '#3D5AFE', emoji: '📐', color: '#EEF1FF' },
  { id: 'g6', title: 'Motion Intro — PodcastPH',    category: 'Video',   categoryColor: '#7C3AED', emoji: '🎙', color: '#F5F3FF' },
];

export const MOCK_PEER_REVIEWS: MockPeerReview[] = [
  {
    id: 'r1',
    reviewerName: 'Jed Reyes',
    reviewerInitials: 'JR',
    reviewerCourse: 'BS Information Technology',
    reviewerColor: '#7C3AED',
    rating: 5,
    comment: 'Super talented designer and very easy to work with. Delivered the brand assets ahead of schedule and iterated quickly on feedback.',
    postedAgo: '2 weeks ago',
  },
  {
    id: 'r2',
    reviewerName: 'Kyla Uy',
    reviewerInitials: 'KU',
    reviewerCourse: 'BS Accountancy',
    reviewerColor: '#10B981',
    rating: 5,
    comment: 'Her tutoring sessions are so structured. I went from failing quizzes to acing the midterm. Highly recommend for any CS unit.',
    postedAgo: '1 month ago',
  },
  {
    id: 'r3',
    reviewerName: 'Franz Lim',
    reviewerInitials: 'FL',
    reviewerCourse: 'BS Architecture',
    reviewerColor: '#F59E0B',
    rating: 4,
    comment: 'Great UI/UX work on our org poster. Clean layouts, fast turnaround. Would collaborate again for sure.',
    postedAgo: '3 weeks ago',
  },
];

export const MOCK_INTRAMURALS: IntramuralsScore = {
  teamA: 'CCS',
  teamB: 'COBA',
  scoreA: 42,
  scoreB: 38,
  sport: '🏀 Basketball',
  isLive: true,
};