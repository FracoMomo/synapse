// SYNAPSE — Design Tokens
export const Colors = {
  primary: '#3D5AFE',
  primaryDark: '#2541e8',
  accent: {
    purple: '#7C3AED',
    green: '#10B981',
    orange: '#F59E0B',
    red: '#EF4444',
  },
  lobby: {
    studyBlock:       '#3D5AFE', // Electric Blue
    campusEvent:      '#7C3AED', // Purple
    studentEvent:     '#F59E0B', // Orange
    sports:           '#10B981', // Green
    reviewSession:    '#06B6D4', // Sky Blue
    hobbyInterest:    '#EC4899', // Pink/Magenta
    openPresentation: '#EF4444', // Red
  },
  yearLevel: {
    firstYear:  '#3D5AFE',
    secondYear: '#7C3AED',
    thirdYear:  '#10B981',
    fourthYear: '#F59E0B',
    any:        '#6B7280',
  },
  bg: {
    shell:   '#0F1117',
    card:    '#FFFFFF',
    surface: '#F8F9FF',
    muted:   '#F1F3F9',
  },
  text: {
    primary:   '#111827',
    secondary: '#6B7280',
    muted:     '#9CA3AF',
    inverse:   '#FFFFFF',
  },
  border: '#E5E7EB',
  shadow: 'rgba(61, 90, 254, 0.10)',
};

export const Spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  24,
  xxxl: 32,
};

export const Radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  pill: 999,
};

export const FontSize = {
  xs:   11,
  sm:   13,
  md:   15,
  lg:   17,
  xl:   20,
  xxl:  24,
  xxxl: 30,
};

export const Shadow = {
  card: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
};

export const LOBBY_TYPES = [
  { id: 'studyBlock',       label: 'Study Block',        icon: '📚', color: Colors.lobby.studyBlock       },
  { id: 'campusEvent',      label: 'Campus Event',        icon: '🏫', color: Colors.lobby.campusEvent      },
  { id: 'studentEvent',     label: 'Student Event',       icon: '🎉', color: Colors.lobby.studentEvent     },
  { id: 'sports',           label: 'Sports & Fitness',    icon: '⚽', color: Colors.lobby.sports           },
  { id: 'reviewSession',    label: 'Review Session',      icon: '✏️', color: Colors.lobby.reviewSession    },
  { id: 'hobbyInterest',    label: 'Hobby & Interest',    icon: '🎮', color: Colors.lobby.hobbyInterest    },
  { id: 'openPresentation', label: 'Open Presentation',   icon: '🎤', color: Colors.lobby.openPresentation },
] as const;

export const VENUES = [
  { id: 'library',   label: 'Library',       icon: '📖' },
  { id: 'ccs_lab',   label: 'CCS Lab',       icon: '💻' },
  { id: 'cba_lounge',label: 'CBA Lounge',    icon: '🛋' },
  { id: 'online',    label: 'Online / Zoom', icon: '🖥' },
] as const;

export const QUICK_TIMES = ['2:00 PM', '4:00 PM', '6:00 PM', '8:00 PM'];

export type LobbyType = typeof LOBBY_TYPES[number]['id'];
export type VenueType = typeof VENUES[number]['id'];