import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';
import { PlatformType } from '../../types/analytics';

interface PlatformBadgeProps {
  platform: PlatformType;
  isSelected?: boolean;
  onPress?: () => void;
  showLabel?: boolean;
}

export const PLATFORM_CONFIG: Record<
  PlatformType,
  { name: string; color: string; bg: string; icon: (size: number, color: string) => React.ReactNode }
> = {
  x: {
    name: 'X (Twitter)',
    color: '#E2E8F0',
    bg: '#18181B',
    icon: (size, color) => <FontAwesome6 name="x-twitter" size={size} color={color} />,
  },
  telegram: {
    name: 'Telegram',
    color: '#38BDF8',
    bg: '#0C4A6E',
    icon: (size, color) => <FontAwesome6 name="telegram" size={size} color={color} />,
  },
  reddit: {
    name: 'Reddit',
    color: '#FB923C',
    bg: '#7C2D12',
    icon: (size, color) => <FontAwesome6 name="reddit" size={size} color={color} />,
  },
  youtube: {
    name: 'YouTube',
    color: '#F87171',
    bg: '#7F1D1D',
    icon: (size, color) => <Ionicons name="logo-youtube" size={size} color={color} />,
  },
  instagram: {
    name: 'Instagram',
    color: '#F472B6',
    bg: '#831843',
    icon: (size, color) => <Ionicons name="logo-instagram" size={size} color={color} />,
  },
};

export const PlatformBadge: React.FC<PlatformBadgeProps> = ({
  platform,
  isSelected = true,
  onPress,
  showLabel = true,
}) => {
  const config = PLATFORM_CONFIG[platform];

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        { backgroundColor: isSelected ? config.bg : '#1E293B', borderColor: isSelected ? config.color : '#334155' },
        !isSelected && styles.dimmed,
      ]}>
      {config.icon(13, isSelected ? config.color : '#94A3B8')}
      {showLabel && (
        <Text style={[styles.label, { color: isSelected ? config.color : '#94A3B8' }]}>
          {config.name}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  dimmed: {
    opacity: 0.6,
  },
});
