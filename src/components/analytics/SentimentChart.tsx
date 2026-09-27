import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, Text as SvgText, Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { TimelineDataPoint } from '../../types/analytics';
import { EMOTION_CONFIG } from '../common/EmotionBadge';

interface SentimentChartProps {
  series: TimelineDataPoint[];
  currentPoint: TimelineDataPoint;
}

export const SentimentChart: React.FC<SentimentChartProps> = ({
  series,
  currentPoint,
}) => {
  const chartWidth = Math.min(360, Dimensions.get('window').width - 48);
  const chartHeight = 160;

  // Build SVG path points for positive & negative lines
  const pointsPositive = series.map((pt, idx) => {
    const x = 30 + (idx * (chartWidth - 50)) / (series.length - 1);
    const y = chartHeight - 25 - (pt.positiveSentiment / 100) * (chartHeight - 45);
    return `${x},${y}`;
  });

  const pointsNegative = series.map((pt, idx) => {
    const x = 30 + (idx * (chartWidth - 50)) / (series.length - 1);
    const y = chartHeight - 25 - (pt.negativeSentiment / 100) * (chartHeight - 45);
    return `${x},${y}`;
  });

  const pathPositive = `M ${pointsPositive.join(' L ')}`;
  const pathNegative = `M ${pointsNegative.join(' L ')}`;

  // Granular emotion breakdown for the current point
  const emotionBreakdown = [
    { type: 'excitement', percent: 34 },
    { type: 'anxiety', percent: 26 },
    { type: 'sarcasm', percent: 18 },
    { type: 'outrage', percent: 12 },
    { type: 'curiosity', percent: 10 },
  ] as const;

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.title}>MULTI-DIMENSIONAL SENTIMENT FLUCTUATION</Text>
          <Text style={styles.subtitle}>Temporal tracking of positive vs negative valence + EVI</Text>
        </View>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#34D399' }]} />
            <Text style={styles.legendText}>Positive</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F87171' }]} />
            <Text style={styles.legendText}>Negative</Text>
          </View>
        </View>
      </View>

      {/* SVG Sentiment Waves */}
      <View style={styles.chartWrapper}>
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            <LinearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#34D399" stopOpacity="0.3" />
              <Stop offset="1" stopColor="#34D399" stopOpacity="0.0" />
            </LinearGradient>
            <LinearGradient id="negGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#F87171" stopOpacity="0.3" />
              <Stop offset="1" stopColor="#F87171" stopOpacity="0.0" />
            </LinearGradient>
          </Defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((ratio, i) => (
            <Line
              key={i}
              x1="30"
              y1={chartHeight - 25 - ratio * (chartHeight - 45)}
              x2={chartWidth - 10}
              y2={chartHeight - 25 - ratio * (chartHeight - 45)}
              stroke="#334155"
              strokeDasharray="4 4"
              strokeWidth="0.8"
            />
          ))}

          {/* Wave Lines */}
          <Path d={pathPositive} fill="none" stroke="#34D399" strokeWidth="2.5" />
          <Path d={pathNegative} fill="none" stroke="#F87171" strokeWidth="2.5" />

          {/* Time Labels */}
          {series.map((pt, idx) => {
            const x = 30 + (idx * (chartWidth - 50)) / (series.length - 1);
            return (
              <SvgText
                key={idx}
                x={x}
                y={chartHeight - 6}
                fill="#64748B"
                fontSize="10"
                textAnchor="middle">
                {pt.timeLabel}
              </SvgText>
            );
          })}
        </Svg>
      </View>

      {/* Granular Nuanced Emotion Spectrum */}
      <View style={styles.emotionSection}>
        <Text style={styles.sectionHeader}>NUANCED EMOTION DISTRIBUTION (GoEmotions & Sarcasm)</Text>
        <View style={styles.emotionBars}>
          {emotionBreakdown.map((item) => {
            const conf = EMOTION_CONFIG[item.type];
            return (
              <View key={item.type} style={styles.emotionBarItem}>
                <View style={styles.emotionLabelRow}>
                  <Text style={styles.emotionLabel}>
                    {conf.emoji} {conf.label}
                  </Text>
                  <Text style={[styles.emotionPercent, { color: conf.color }]}>
                    {item.percent}%
                  </Text>
                </View>
                <View style={styles.barBackground}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${item.percent}%`, backgroundColor: conf.color },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Volatility Index Gauge Callout */}
      <View style={styles.eviCard}>
        <View style={styles.eviLeft}>
          <Text style={styles.eviTitle}>Emotional Volatility Index (EVI)</Text>
          <Text style={styles.eviDescription}>
            {currentPoint.emotionalVolatilityIndex > 0.7
              ? '🚨 High Volatility: Rapid sentiment swings and polarization detected in comment threads.'
              : '✅ Moderate Volatility: Community sentiment remains within standard variance.'}
          </Text>
        </View>
        <View style={styles.eviScoreBadge}>
          <Text style={styles.eviScoreVal}>{currentPoint.emotionalVolatilityIndex.toFixed(2)}</Text>
          <Text style={styles.eviScoreStatus}>
            {currentPoint.emotionalVolatilityIndex > 0.7 ? 'ELEVATED' : 'STABLE'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 16,
    marginVertical: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
  },
  chartWrapper: {
    alignItems: 'center',
    marginVertical: 6,
  },
  emotionSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  sectionHeader: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  emotionBars: {
    gap: 8,
  },
  emotionBarItem: {
    width: '100%',
  },
  emotionLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  emotionLabel: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '500',
  },
  emotionPercent: {
    fontSize: 11,
    fontWeight: '700',
  },
  barBackground: {
    height: 6,
    backgroundColor: '#1E293B',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  eviCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B55',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#33415544',
    alignItems: 'center',
    gap: 12,
  },
  eviLeft: {
    flex: 1,
  },
  eviTitle: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  eviDescription: {
    color: '#94A3B8',
    fontSize: 10,
    lineHeight: 14,
  },
  eviScoreBadge: {
    backgroundColor: '#0F172A',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#38BDF833',
  },
  eviScoreVal: {
    color: '#38BDF8',
    fontSize: 16,
    fontWeight: '800',
  },
  eviScoreStatus: {
    color: '#94A3B8',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 1,
  },
});
