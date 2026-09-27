import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, Image } from 'react-native';
import Svg, { Line, Circle, Text as SvgText, G } from 'react-native-svg';
import { NetworkGraphData, NetworkNode } from '../../types/analytics';
import { PlatformBadge } from '../common/PlatformBadge';

interface NetworkGraphViewProps {
  data: NetworkGraphData;
}

export const NetworkGraphView: React.FC<NetworkGraphViewProps> = ({ data }) => {
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(data.nodes[0] || null);

  const containerWidth = Math.min(360, Dimensions.get('window').width - 48);
  const containerHeight = 280;

  // Node lookup map
  const nodeMap = new Map<string, NetworkNode>();
  data.nodes.forEach((n) => nodeMap.set(n.id, n));

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>LINK ANALYSIS & NETWORK TOPOLOGY</Text>
          <Text style={styles.subtitle}>Information cascade diffusion & Key Opinion Leaders (KOLs)</Text>
        </View>
        <View style={styles.cascadeBadge}>
          <Text style={styles.cascadeLabel}>VIRAL R_t:</Text>
          <Text style={styles.cascadeVal}>{data.cascadeMetrics.reproductionRateRt.toFixed(2)}</Text>
        </View>
      </View>

      {/* Cascade Metric Ticker */}
      <View style={styles.tickerRow}>
        <View style={styles.tickerItem}>
          <Text style={styles.tickerVal}>{data.cascadeMetrics.activeSeedNodes}</Text>
          <Text style={styles.tickerLabel}>Seed KOLs</Text>
        </View>
        <View style={styles.tickerDivider} />
        <View style={styles.tickerItem}>
          <Text style={styles.tickerVal}>{data.cascadeMetrics.activatedSecondaryNodes}</Text>
          <Text style={styles.tickerLabel}>Activated Nodes</Text>
        </View>
        <View style={styles.tickerDivider} />
        <View style={styles.tickerItem}>
          <Text style={[styles.tickerVal, { color: '#F43F5E' }]}>Supercritical</Text>
          <Text style={styles.tickerLabel}>Diffusion State</Text>
        </View>
      </View>

      {/* SVG Interactive Topology Canvas */}
      <View style={styles.svgWrapper}>
        <Svg width={containerWidth} height={containerHeight}>
          {/* Render Graph Edges */}
          {data.links.map((link, idx) => {
            const source = nodeMap.get(link.source);
            const target = nodeMap.get(link.target);
            if (!source || !target || !source.x || !source.y || !target.x || !target.y) return null;

            const isHighlighted =
              selectedNode && (selectedNode.id === source.id || selectedNode.id === target.id);

            return (
              <G key={`link-${idx}`}>
                <Line
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={isHighlighted ? '#38BDF8' : '#334155'}
                  strokeWidth={isHighlighted ? link.weight * 1.5 : link.weight}
                  strokeOpacity={isHighlighted ? 0.9 : 0.4}
                  strokeDasharray={link.type === 'mention' ? '4 3' : undefined}
                />
              </G>
            );
          })}

          {/* Render Graph Nodes */}
          {data.nodes.map((node) => {
            if (!node.x || !node.y) return null;
            const isSelected = selectedNode?.id === node.id;
            const radius = node.isKOL ? 18 : 13;

            return (
              <G key={node.id} onPress={() => setSelectedNode(node)}>
                {/* Glow Ring for KOL / Selected */}
                {(node.isKOL || isSelected) && (
                  <Circle
                    cx={node.x}
                    cy={node.y}
                    r={radius + (isSelected ? 7 : 4)}
                    fill="none"
                    stroke={node.color}
                    strokeWidth={isSelected ? 3 : 1.5}
                    strokeOpacity={isSelected ? 0.9 : 0.4}
                  />
                )}
                {/* Inner Body */}
                <Circle
                  cx={node.x}
                  cy={node.y}
                  r={radius}
                  fill={node.color}
                  stroke="#0F172A"
                  strokeWidth="2"
                />
                {/* Label */}
                <SvgText
                  x={node.x}
                  y={node.y + radius + 11}
                  fill={isSelected ? '#F8FAFC' : '#94A3B8'}
                  fontSize={isSelected ? '10' : '9'}
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  textAnchor="middle">
                  {node.handle.length > 10 ? node.handle.substring(0, 9) + '…' : node.handle}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      </View>

      {/* Selected Node Details Card */}
      {selectedNode && (
        <View style={styles.nodeInspector}>
          <View style={styles.nodeHeader}>
            <Image source={{ uri: selectedNode.avatar }} style={styles.nodeAvatar} />
            <View style={styles.nodeInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.nodeName}>{selectedNode.name}</Text>
                {selectedNode.isKOL && (
                  <View style={styles.kolBadge}>
                    <Text style={styles.kolText}>KEY OPINION LEADER</Text>
                  </View>
                )}
              </View>
              <Text style={styles.nodeHandle}>{selectedNode.handle}</Text>
            </View>
            <PlatformBadge platform={selectedNode.platform} showLabel={false} />
          </View>

          {/* Graph Centrality Metrics Grid */}
          <View style={styles.metricsGrid}>
            <View style={styles.centralityTile}>
              <Text style={styles.centLabel}>PageRank Authority</Text>
              <Text style={[styles.centVal, { color: '#38BDF8' }]}>
                {(selectedNode.pageRank * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.centralityTile}>
              <Text style={styles.centLabel}>Betweenness Bridge</Text>
              <Text style={[styles.centVal, { color: '#A78BFA' }]}>
                {(selectedNode.betweennessCentrality * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.centralityTile}>
              <Text style={styles.centLabel}>In-Degree Citations</Text>
              <Text style={[styles.centVal, { color: '#34D399' }]}>
                {selectedNode.inDegree.toLocaleString()}
              </Text>
            </View>
            <View style={styles.centralityTile}>
              <Text style={styles.centLabel}>Network Reach</Text>
              <Text style={styles.centVal}>
                {(selectedNode.followerCount / 1000).toFixed(0)}k followers
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Top KOL Ranking List */}
      <View style={styles.kolListSection}>
        <Text style={styles.sectionHeader}>TOP OPINION LEADERS IN NETWORK</Text>
        {data.nodes
          .filter((n) => n.isKOL)
          .sort((a, b) => b.pageRank - a.pageRank)
          .map((kol, idx) => (
            <Pressable
              key={kol.id}
              onPress={() => setSelectedNode(kol)}
              style={[
                styles.kolItem,
                selectedNode?.id === kol.id && styles.kolItemSelected,
              ]}>
              <Text style={styles.kolRank}>#{idx + 1}</Text>
              <Image source={{ uri: kol.avatar }} style={styles.kolThumb} />
              <View style={styles.kolTextCol}>
                <Text style={styles.kolItemName}>{kol.name}</Text>
                <Text style={styles.kolItemHandle}>{kol.handle}</Text>
              </View>
              <View style={styles.kolScoreBadge}>
                <Text style={styles.kolScoreText}>PR {(kol.pageRank * 100).toFixed(0)}%</Text>
              </View>
            </Pressable>
          ))}
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
    marginBottom: 12,
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
  cascadeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderColor: '#F43F5E',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cascadeLabel: {
    color: '#F43F5E',
    fontSize: 10,
    fontWeight: '700',
  },
  cascadeVal: {
    color: '#F43F5E',
    fontSize: 12,
    fontWeight: '900',
  },
  tickerRow: {
    flexDirection: 'row',
    backgroundColor: '#1E293B55',
    borderRadius: 8,
    padding: 8,
    justifyContent: 'space-around',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#33415533',
  },
  tickerItem: {
    alignItems: 'center',
  },
  tickerVal: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '800',
  },
  tickerLabel: {
    color: '#64748B',
    fontSize: 9,
    marginTop: 2,
  },
  tickerDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#334155',
  },
  svgWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#020617',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingVertical: 10,
    marginBottom: 12,
  },
  nodeInspector: {
    backgroundColor: '#1E293B66',
    borderWidth: 1,
    borderColor: '#38BDF833',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  nodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  nodeAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  nodeInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nodeName: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  kolBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#38BDF866',
  },
  kolText: {
    color: '#38BDF8',
    fontSize: 8,
    fontWeight: '800',
  },
  nodeHandle: {
    color: '#94A3B8',
    fontSize: 11,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  centralityTile: {
    width: '48%',
    backgroundColor: '#0F172A',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#33415544',
  },
  centLabel: {
    color: '#64748B',
    fontSize: 9,
    marginBottom: 2,
  },
  centVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  kolListSection: {
    paddingTop: 10,
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
  kolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  kolItemSelected: {
    backgroundColor: '#1E293B',
  },
  kolRank: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    width: 20,
  },
  kolThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  kolTextCol: {
    flex: 1,
  },
  kolItemName: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
  },
  kolItemHandle: {
    color: '#64748B',
    fontSize: 10,
  },
  kolScoreBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#38BDF844',
  },
  kolScoreText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '700',
  },
});
