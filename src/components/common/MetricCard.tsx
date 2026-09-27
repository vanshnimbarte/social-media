import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  changeRate?: string;
  isPositiveChange?: boolean;
  accentColor?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  changeRate,
  isPositiveChange = true,
  accentColor = '#38BDF8',
  iconName,
}) => {
  return (
    <View style={[styles.card, { borderColor: `${accentColor}33` }]}>
      <View style={styles.topRow}>
        <Text style={styles.title}>{title}</Text>
        {iconName && (
          <View style={[styles.iconWrapper, { backgroundColor: `${accentColor}22` }]}>
            <Ionicons name={iconName} size={16} color={accentColor} />
          </View>
        )}
      </View>
      <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
      <View style={styles.bottomRow}>
        {changeRate && (
          <View style={[styles.changeBadge, { backgroundColor: isPositiveChange ? 'rgba(52, 211, 153, 0.15)' : 'rgba(248, 113, 113, 0.15)' }]}>
            <Ionicons
              name={isPositiveChange ? 'trending-up' : 'trending-down'}
              size={12}
              color={isPositiveChange ? '#34D399' : '#F87171'}
            />
            <Text style={[styles.changeText, { color: isPositiveChange ? '#34D399' : '#F87171' }]}>
              {changeRate}
            </Text>
          </View>
        )}
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flex: 1,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 11,
    flex: 1,
  },
});
