import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow, LOBBY_TYPES, VENUES, QUICK_TIMES } from '../constants/theme';
import type { LobbyType, VenueType } from '../constants/theme';

interface CreateLobbyState {
  type: LobbyType | null;
  time: string | null;
  venueId: VenueType | null;
  capacity: number;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onLaunch: (lobby: CreateLobbyState) => void;
}

type Step = 1 | 2 | 3 | 'success';

const CAPACITY_MIN = 2;
const CAPACITY_MAX = 50;

export const CreateLobbyModal: React.FC<Props> = ({ visible, onClose, onLaunch }) => {
  const [step, setStep] = useState<Step>(1);
  const [state, setState] = useState<CreateLobbyState>({
    type: null,
    time: null,
    venueId: null,
    capacity: 8,
  });

  const reset = () => {
    setStep(1);
    setState({ type: null, time: null, venueId: null, capacity: 8 });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const selectedType = LOBBY_TYPES.find(t => t.id === state.type);
  const selectedVenue = VENUES.find(v => v.id === state.venueId);

  // ── Step 1: Type selector ────────────────────────────────────────────────
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepQuestion}>What kind of lobby?</Text>
      <View style={styles.typeGrid}>
        {LOBBY_TYPES.map(type => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.typeCard,
              state.type === type.id && {
                borderColor: type.color,
                backgroundColor: type.color + '10',
              },
            ]}
            onPress={() => {
              setState(s => ({ ...s, type: type.id }));
              setTimeout(() => setStep(2), 150);
            }}
            activeOpacity={0.75}
          >
            <Text style={styles.typeCardIcon}>{type.icon}</Text>
            <Text
              style={[
                styles.typeCardLabel,
                state.type === type.id && { color: type.color },
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // ── Step 2: Details ──────────────────────────────────────────────────────
  const renderStep2 = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      {/* Selected type pill */}
      <View style={[styles.selectedTypePill, { backgroundColor: selectedType?.color + '18' }]}>
        <Text style={styles.selectedTypePillIcon}>{selectedType?.icon}</Text>
        <Text style={[styles.selectedTypePillText, { color: selectedType?.color }]}>
          {selectedType?.label}
        </Text>
      </View>

      {/* Time */}
      <Text style={styles.fieldLabel}>Time</Text>
      <View style={styles.chipRow}>
        {QUICK_TIMES.map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.chip, state.time === t && styles.chipActive]}
            onPress={() => setState(s => ({ ...s, time: t }))}
          >
            <Text style={[styles.chipText, state.time === t && styles.chipTextActive]}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Venue */}
      <Text style={styles.fieldLabel}>Venue</Text>
      <View style={styles.venueList}>
        {VENUES.map(v => (
          <TouchableOpacity
            key={v.id}
            style={[styles.venueItem, state.venueId === v.id && styles.venueItemActive]}
            onPress={() => setState(s => ({ ...s, venueId: v.id }))}
            activeOpacity={0.75}
          >
            <Text style={styles.venueItemIcon}>{v.icon}</Text>
            <Text
              style={[
                styles.venueItemText,
                state.venueId === v.id && styles.venueItemTextActive,
              ]}
            >
              {v.label}
            </Text>
            {state.venueId === v.id && (
              <View style={styles.venueCheck}>
                <Text style={styles.venueCheckText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Capacity */}
      <Text style={styles.fieldLabel}>Capacity</Text>
      <View style={styles.capacityRow}>
        <TouchableOpacity
          style={styles.capBtn}
          onPress={() => setState(s => ({ ...s, capacity: Math.max(CAPACITY_MIN, s.capacity - 1) }))}
        >
          <Text style={styles.capBtnText}>−</Text>
        </TouchableOpacity>
        <View style={styles.capDisplay}>
          <Text style={styles.capNum}>{state.capacity}</Text>
          <Text style={styles.capLabel}>students</Text>
        </View>
        <TouchableOpacity
          style={styles.capBtn}
          onPress={() => setState(s => ({ ...s, capacity: Math.min(CAPACITY_MAX, s.capacity + 1) }))}
        >
          <Text style={styles.capBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Next */}
      <TouchableOpacity
        style={[
          styles.primaryBtn,
          (!state.time || !state.venueId) && styles.primaryBtnDisabled,
        ]}
        onPress={() => setStep(3)}
        disabled={!state.time || !state.venueId}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryBtnText}>Review →</Text>
      </TouchableOpacity>
      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );

  // ── Step 3: Summary ──────────────────────────────────────────────────────
  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepQuestion}>Review your lobby</Text>

      <View style={[styles.summaryCard, { borderTopColor: selectedType?.color }]}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryKey}>Type</Text>
          <View style={styles.summaryVal}>
            <Text style={styles.summaryIcon}>{selectedType?.icon}</Text>
            <Text style={styles.summaryValText}>{selectedType?.label}</Text>
          </View>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryKey}>Time</Text>
          <Text style={styles.summaryValText}>{state.time}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryKey}>Venue</Text>
          <Text style={styles.summaryValText}>
            {selectedVenue?.icon} {selectedVenue?.label}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryKey}>Capacity</Text>
          <Text style={styles.summaryValText}>{state.capacity} students</Text>
        </View>
      </View>

      <View style={styles.summaryActions}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setStep(2)}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.launchBtn}
          onPress={() => {
            onLaunch(state);
            setStep('success');
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.launchBtnText}>🚀 Launch Lobby</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ── Success State ────────────────────────────────────────────────────────
  const renderSuccess = () => (
    <View style={[styles.stepContainer, styles.successContainer]}>
      <View style={styles.successIcon}>
        <Text style={styles.successCheckmark}>✓</Text>
      </View>
      <Text style={styles.successTitle}>Lobby Launched! 🚀</Text>
      <Text style={styles.successSub}>
        {selectedType?.label} at {selectedVenue?.label} · {state.time}
      </Text>
      <TouchableOpacity
        style={styles.createAnotherBtn}
        onPress={reset}
        activeOpacity={0.8}
      >
        <Text style={styles.createAnotherText}>Create Another</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleClose} style={styles.doneBtn}>
        <Text style={styles.doneBtnText}>Done</Text>
      </TouchableOpacity>
    </View>
  );

  const stepLabels = { 1: 'Type', 2: 'Details', 3: 'Launch' };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.modal}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        {step !== 'success' && (
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Lobby</Text>
            {/* Step indicator */}
            <View style={styles.stepIndicator}>
              {([1, 2, 3] as const).map(s => (
                <View key={s} style={styles.stepDotWrapper}>
                  <View
                    style={[
                      styles.stepDot,
                      (step as number) >= s && styles.stepDotActive,
                      (step as number) === s && styles.stepDotCurrent,
                    ]}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Content */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 'success' && renderSuccess()}
      </View>
    </Modal>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  modal: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  closeBtnText: {
    fontSize: FontSize.md,
    color: Colors.text.muted,
  },
  modalTitle: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.text.primary,
    textAlign: 'center',
    marginRight: 24,
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  stepDotWrapper: {},
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  stepDotActive: {
    backgroundColor: Colors.primary + '60',
  },
  stepDotCurrent: {
    backgroundColor: Colors.primary,
    width: 18,
  },

  stepContainer: {
    flex: 1,
    padding: Spacing.xl,
  },
  stepQuestion: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: Spacing.xl,
  },

  // Step 1
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  typeCard: {
    width: '47%',
    backgroundColor: Colors.bg.muted,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'flex-start',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeCardIcon: {
    fontSize: 28,
    marginBottom: Spacing.sm,
  },
  typeCardLabel: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text.primary,
  },

  // Step 2
  selectedTypePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    marginBottom: Spacing.xl,
    gap: 6,
  },
  selectedTypePillIcon: { fontSize: 14 },
  selectedTypePillText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  fieldLabel: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bg.card,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  chipTextActive: {
    color: '#fff',
  },
  venueList: {
    gap: Spacing.sm,
  },
  venueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bg.card,
  },
  venueItemActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
  },
  venueItemIcon: { fontSize: 18 },
  venueItemText: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  venueItemTextActive: {
    color: Colors.primary,
  },
  venueCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  venueCheckText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '800',
  },
  capacityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  capBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.bg.muted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  capBtnText: {
    fontSize: 22,
    color: Colors.text.primary,
    lineHeight: 26,
  },
  capDisplay: {
    alignItems: 'center',
    minWidth: 80,
  },
  capNum: {
    fontSize: 40,
    fontWeight: '800',
    color: Colors.primary,
  },
  capLabel: {
    fontSize: FontSize.sm,
    color: Colors.text.muted,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.pill,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  primaryBtnDisabled: {
    backgroundColor: Colors.bg.muted,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: FontSize.md,
  },

  // Step 3
  summaryCard: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    borderTopWidth: 4,
    overflow: 'hidden',
    ...Shadow.card,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  summaryKey: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  summaryVal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  summaryIcon: { fontSize: 16 },
  summaryValText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.lg,
  },
  summaryActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xxl,
  },
  backBtn: {
    flex: 1,
    borderRadius: Radius.pill,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  backBtnText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text.secondary,
  },
  launchBtn: {
    flex: 2,
    backgroundColor: Colors.primary,
    borderRadius: Radius.pill,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  launchBtnText: {
    color: '#fff',
    fontSize: FontSize.md,
    fontWeight: '800',
  },

  // Success
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent.green + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  successCheckmark: {
    fontSize: 40,
    color: Colors.accent.green,
  },
  successTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  successSub: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xxxl,
  },
  createAnotherBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.pill,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xxxl,
    marginBottom: Spacing.md,
  },
  createAnotherText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: FontSize.md,
  },
  doneBtn: {
    padding: Spacing.md,
  },
  doneBtnText: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
});
