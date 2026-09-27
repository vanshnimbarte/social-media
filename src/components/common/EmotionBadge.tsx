import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EmotionType } from '../../types/analytics';

interface EmotionBadgeProps {
  emotion: EmotionType;
  confidence?: number;
  sarcasmDetected?: boolean;
}

export const EMOTION_CONFIG: Record<
  EmotionType,
  { label: string; emoji: string; color: string; bg: string }
> = {
  excitement: { label: 'Excitement', emoji: '⚡', color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.15)' },
  joy: { label: 'Joy', emoji: '✨', color: '#34D399', bg: 'rgba(52, 211, 153, 0.15)' },
  anxiety: { label: 'Anxiety', emoji: '⚠️', color: '#FBBF24', bg: 'rgba(251, 191, 36, 0.15)' },
  sarcasm: { label: 'Sarcasm / Irony', emoji: '🎭', color: '#C084FC', bg: 'rgba(192, 132, 252, 0.15)' },
  outrage: { label: 'Outrage / Anger', emoji: '🔥', color: '#F87171', bg: 'rgba(248, 113, 113, 0.15)' },
  curiosity: { label: 'Curiosity', emoji: '💡', color: '#60A5FA', bg: 'rgba(96, 165, 250, 0.15)' },
  supportive: { label: 'Supportive', emoji: '🤝', color: '#4ADE80', bg: 'rgba(74, 222, 128, 0.15)' },
  against: { label: 'Critical', emoji: '🛑', color: '#FB7185', bg: 'rgba(251, 113, 133, 0.15)' },
  neutral: { label: 'Neutral', emoji: '⚖️', color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.15)' },
};

export const EmotionBadge: React.FC<EmotionBadgeProps> = ({
  emotion,
  confidence,
  sarcasmDetected,
}) => {
  const config = EMOTION_CONFIG[emotion] || EMOTION_CONFIG.neutral;

  return (
    <View style={styles.badgeRow}>
      <View style={[styles.badge, { backgroundColor: config.bg, borderColor: config.color }]}>
        <Text style={styles.emoji}>{config.emoji}</Text>
        <Text style={[styles.label, { color: config.color }]}>
          {config.label}
          {confidence !== undefined ? ` ${(confidence * 100).toFixed(0)}%` : ''}
        </Text>
      </View>
      {sarcasmDetected && (
        <View style={styles.sarcasmBadge}>
          <Text style={styles.sarcasmText}>🎭 Sarcasm Inversion</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  emoji: {
    fontSize: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  sarcasmBadge: {
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    borderColor: '#C084FC',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sarcasmText: {
    color: '#E9D5FF',
    fontSize: 11,
    fontWeight: '600',
  },
});
