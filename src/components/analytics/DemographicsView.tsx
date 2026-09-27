import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DemographicCohort } from '../../types/analytics';

interface DemographicsViewProps {
  data: DemographicCohort;
}

export const DemographicsView: React.FC<DemographicsViewProps> = ({ data }) => {
  return (
    <View style={styles.card}>
      {/* Header with K-Anonymity Guardrail */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>AUTOMATED DEMOGRAPHIC PROFILING</Text>
          <Text style={styles.subtitle}>Aggregate, anonymized audience intelligence</Text>
        </View>
        <View style={styles.privacyBadge}>
          <Ionicons name="shield-checkmark" size={14} color="#34D399" />
          <Text style={styles.privacyText}>
            k={data.kAnonymityStatus.kValue} Verified
          </Text>
        </View>
      </View>

      {/* Age Brackets Distribution */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>GENERATIONAL & AGE BRACKETS</Text>
        <View style={styles.ageContainer}>
          {data.ageGroups.map((group, index) => {
            const colors = ['#38BDF8', '#818CF8', '#A78BFA', '#F472B6'];
            const color = colors[index % colors.length];
            return (
              <View key={group.label} style={styles.ageItem}>
                <View style={styles.ageLabelRow}>
                  <Text style={styles.ageLabel}>{group.label}</Text>
                  <Text style={[styles.ageValue, { color }]}>{group.percentage}%</Text>
                </View>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${group.percentage}%`, backgroundColor: color }]} />
                </View>
                <Text style={styles.ageCount}>~{group.count.toLocaleString()} accounts</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Geographic & Language Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>GEOGRAPHIC CONCENTRATION (TOP REGIONS)</Text>
        <View style={styles.geoGrid}>
          {data.topLocations.map((loc) => (
            <View key={loc.country} style={styles.geoTile}>
              <View style={styles.geoFlagBadge}>
                <Text style={styles.geoCode}>{loc.code}</Text>
              </View>
              <View style={styles.geoInfo}>
                <Text style={styles.geoCountry}>{loc.country}</Text>
                <Text style={styles.geoPercentage}>{loc.percentage}% share</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Inferred Professional & Topic Taxonomy */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PROFESSIONAL & TOPIC AFFINITY (BERTopic INFERENCE)</Text>
        <View style={styles.chipsWrap}>
          {data.professionalFields.map((field, idx) => {
            const accents = ['#38BDF8', '#34D399', '#FBBF24', '#C084FC', '#F472B6'];
            const color = accents[idx % accents.length];
            return (
              <View key={field.name} style={[styles.fieldChip, { borderColor: `${color}44`, backgroundColor: `${color}11` }]}>
                <Text style={[styles.fieldName, { color }]}>{field.name}</Text>
                <View style={[styles.fieldPercentBadge, { backgroundColor: color }]}>
                  <Text style={styles.fieldPercentText}>{field.percentage}%</Text>
                </View>
              </View>
            );
          })}
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
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderColor: '#34D399',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  privacyText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '700',
  },
  section: {
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  sectionTitle: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  ageContainer: {
    gap: 10,
  },
  ageItem: {
    width: '100%',
  },
  ageLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  ageLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  ageValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  track: {
    height: 6,
    backgroundColor: '#1E293B',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  ageCount: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  geoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  geoTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B66',
    borderWidth: 1,
    borderColor: '#33415544',
    borderRadius: 10,
    padding: 8,
    width: '48%',
    gap: 8,
  },
  geoFlagBadge: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  geoCode: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
  },
  geoInfo: {
    flex: 1,
  },
  geoCountry: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '600',
  },
  geoPercentage: {
    color: '#64748B',
    fontSize: 10,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fieldChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 10,
    paddingRight: 4,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  fieldName: {
    fontSize: 11,
    fontWeight: '600',
  },
  fieldPercentBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fieldPercentText: {
    color: '#0F172A',
    fontSize: 9,
    fontWeight: '800',
  },
});
