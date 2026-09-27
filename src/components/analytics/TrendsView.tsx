import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TrendingTopic } from '../../types/analytics';
import { EmotionBadge } from '../common/EmotionBadge';

interface TrendsViewProps {
  topics: TrendingTopic[];
  onSelectTopic?: (topic: TrendingTopic) => void;
}

export const TrendsView: React.FC<TrendsViewProps> = ({ topics }) => {
  const getBurstConfig = (state: TrendingTopic['burstState']) => {
    switch (state) {
      case 'supercritical':
        return { label: 'SUPERCRITICAL', color: '#F43F5E', bg: 'rgba(244, 63, 94, 0.15)' };
      case 'bursting':
        return { label: 'BURSTING', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' };
      case 'rising':
        return { label: 'RISING', color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.15)' };
      default:
        return { label: 'NORMAL', color: '#64748B', bg: 'rgba(100, 116, 139, 0.15)' };
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>REAL-TIME TREND & NARRATIVE TRACKING</Text>
          <Text style={styles.subtitle}>Ranked by velocity, acceleration, and burst probability</Text>
        </View>
        <View style={styles.algorithmBadge}>
          <Text style={styles.algoText}>BERTopic + Kleinberg Burst</Text>
        </View>
      </View>

      <View style={styles.list}>
        {topics.map((topic, index) => {
          const burst = getBurstConfig(topic.burstState);
          return (
            <View key={topic.id} style={styles.topicCard}>
              <View style={styles.topicHeader}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankNum}>#{index + 1}</Text>
                </View>
                <View style={styles.titleCol}>
                  <Text style={styles.topicName}>{topic.name}</Text>
                  <Text style={styles.topicCategory}>{topic.category}</Text>
                </View>
                <View style={[styles.burstBadge, { backgroundColor: burst.bg, borderColor: burst.color }]}>
                  <Text style={[styles.burstText, { color: burst.color }]}>{burst.label}</Text>
                </View>
              </View>

              {/* Velocity & Acceleration Metrics */}
              <View style={styles.metricsRow}>
                <View style={styles.metricBlock}>
                  <Text style={styles.metricLabel}>Velocity V(t)</Text>
                  <Text style={styles.metricValue}>{topic.velocity} <Text style={styles.unitText}>posts/min</Text></Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricBlock}>
                  <Text style={styles.metricLabel}>Acceleration</Text>
                  <View style={styles.accelRow}>
                    <Ionicons
                      name={topic.acceleration >= 0 ? 'arrow-up-circle' : 'arrow-down-circle'}
                      size={13}
                      color={topic.acceleration >= 0 ? '#34D399' : '#F87171'}
                    />
                    <Text style={[styles.metricValue, { color: topic.acceleration >= 0 ? '#34D399' : '#F87171' }]}>
                      {topic.acceleration > 0 ? `+${topic.acceleration}` : topic.acceleration}
                    </Text>
                  </View>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricBlock}>
                  <Text style={styles.metricLabel}>Total Volume</Text>
                  <Text style={styles.metricValue}>{topic.postVolume.toLocaleString()}</Text>
                </View>
              </View>

              {/* Predictive Trajectory Box */}
              <View style={styles.trajectoryBox}>
                <Text style={styles.trajTitle}>PREDICTED VOLUME FORECAST (CHRONOS AI):</Text>
                <View style={styles.trajIntervals}>
                  <View style={styles.trajItem}>
                    <Text style={styles.trajTime}>+6h</Text>
                    <Text style={styles.trajVal}>{(topic.trajectory.sixHourForecast / 1000).toFixed(0)}k</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={12} color="#475569" />
                  <View style={styles.trajItem}>
                    <Text style={styles.trajTime}>+12h</Text>
                    <Text style={styles.trajVal}>{(topic.trajectory.twelveHourForecast / 1000).toFixed(0)}k</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={12} color="#475569" />
                  <View style={styles.trajItem}>
                    <Text style={styles.trajTime}>+24h</Text>
                    <Text style={[styles.trajVal, { color: '#38BDF8' }]}>
                      {(topic.trajectory.twentyFourHourForecast / 1000).toFixed(0)}k
                    </Text>
                  </View>
                </View>
              </View>

              {/* Dominant Emotion & Hashtags */}
              <View style={styles.footerRow}>
                <EmotionBadge emotion={topic.dominantEmotion} />
                <View style={styles.hashtags}>
                  {topic.topHashtags.map((tag) => (
                    <Text key={tag} style={styles.hashtagText}>
                      {tag}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          );
        })}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
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
  algorithmBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  algoText: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '600',
  },
  list: {
    gap: 14,
  },
  topicCard: {
    backgroundColor: '#1E293B44',
    borderWidth: 1,
    borderColor: '#33415544',
    borderRadius: 12,
    padding: 12,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  rankBadge: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#38BDF844',
  },
  rankNum: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '800',
  },
  titleCol: {
    flex: 1,
  },
  topicName: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  topicCategory: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 1,
  },
  burstBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  burstText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: '#0F172A66',
    borderRadius: 8,
    padding: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricBlock: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#334155',
  },
  metricLabel: {
    color: '#64748B',
    fontSize: 9,
    marginBottom: 2,
  },
  metricValue: {
    color: '#F1F5F9',
    fontSize: 12,
    fontWeight: '700',
  },
  unitText: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '500',
  },
  accelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trajectoryBox: {
    backgroundColor: '#1E293B66',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  trajTitle: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  trajIntervals: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  trajItem: {
    alignItems: 'center',
  },
  trajTime: {
    color: '#94A3B8',
    fontSize: 10,
  },
  trajVal: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  hashtags: {
    flexDirection: 'row',
    gap: 6,
  },
  hashtagText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '500',
  },
});
