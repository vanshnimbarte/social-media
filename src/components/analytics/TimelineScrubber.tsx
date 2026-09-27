import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { TimelineDataPoint } from '../../types/analytics';

interface TimelineScrubberProps {
  series: TimelineDataPoint[];
  selectedPoint: TimelineDataPoint;
  onSelectPoint: (point: TimelineDataPoint) => void;
  isStreaming?: boolean;
}

export const TimelineScrubber: React.FC<TimelineScrubberProps> = ({
  series,
  selectedPoint,
  onSelectPoint,
  isStreaming = true,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.liveIndicator}>
          <View style={[styles.pulseDot, isStreaming && styles.pulseDotActive]} />
          <Text style={styles.headerTitle}>
            CHRONOLOGICAL TIMELINE {isStreaming ? '(LIVE INGESTION)' : ''}
          </Text>
        </View>
        <Text style={styles.currentPointText}>
          Selected: <Text style={styles.highlightText}>{selectedPoint.timeLabel} UTC</Text>
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollList}>
        {series.map((point) => {
          const isSelected = selectedPoint.timestamp === point.timestamp;
          const heightRatio = Math.min(1, Math.max(0.2, point.postVolume / 2000));
          return (
            <Pressable
              key={point.timestamp}
              onPress={() => onSelectPoint(point)}
              style={[styles.timeNode, isSelected && styles.timeNodeSelected]}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.volumeBar,
                    { height: `${heightRatio * 100}%` },
                    isSelected ? styles.barSelected : styles.barDefault,
                  ]}
                />
              </View>
              <Text style={[styles.timeLabel, isSelected && styles.timeLabelSelected]}>
                {point.timeLabel}
              </Text>
              <Text style={[styles.volText, isSelected && styles.volTextSelected]}>
                {point.postVolume}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Snapshot Info for Selected Time */}
      <View style={styles.snapshotCard}>
        <View style={styles.snapshotMetric}>
          <Text style={styles.snapLabel}>Volume at {selectedPoint.timeLabel}</Text>
          <Text style={styles.snapValue}>{selectedPoint.postVolume.toLocaleString()} posts</Text>
        </View>
        <View style={styles.snapDivider} />
        <View style={styles.snapshotMetric}>
          <Text style={styles.snapLabel}>Dominant Emotion</Text>
          <Text style={[styles.snapValue, { color: '#38BDF8' }]}>
            {selectedPoint.topEmotion.toUpperCase()}
          </Text>
        </View>
        <View style={styles.snapDivider} />
        <View style={styles.snapshotMetric}>
          <Text style={styles.snapLabel}>Volatility Index (EVI)</Text>
          <Text style={[styles.snapValue, { color: selectedPoint.emotionalVolatilityIndex > 0.6 ? '#F87171' : '#34D399' }]}>
            {selectedPoint.emotionalVolatilityIndex.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    alignItems: 'center',
    marginBottom: 12,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#64748B',
  },
  pulseDotActive: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },
  headerTitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  currentPointText: {
    color: '#64748B',
    fontSize: 12,
  },
  highlightText: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  scrollList: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
  },
  timeNode: {
    alignItems: 'center',
    width: 60,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: '#1E293B55',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  timeNodeSelected: {
    backgroundColor: '#1E293B',
    borderColor: '#38BDF8',
  },
  barTrack: {
    height: 48,
    width: 8,
    backgroundColor: '#33415544',
    borderRadius: 4,
    justifyContent: 'flex-end',
    marginBottom: 8,
    overflow: 'hidden',
  },
  volumeBar: {
    width: '100%',
    borderRadius: 4,
  },
  barDefault: {
    backgroundColor: '#60A5FA66',
  },
  barSelected: {
    backgroundColor: '#38BDF8',
  },
  timeLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  timeLabelSelected: {
    color: '#F8FAFC',
    fontWeight: '800',
  },
  volText: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
  },
  volTextSelected: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  snapshotCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B66',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  snapshotMetric: {
    flex: 1,
    alignItems: 'center',
  },
  snapDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#334155',
  },
  snapLabel: {
    color: '#64748B',
    fontSize: 10,
    marginBottom: 2,
  },
  snapValue: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
});
