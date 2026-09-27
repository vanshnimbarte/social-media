import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PostEvent } from '../../types/analytics';
import { PlatformBadge } from '../common/PlatformBadge';
import { EmotionBadge } from '../common/EmotionBadge';

interface LiveFeedViewProps {
  posts: PostEvent[];
}

export const LiveFeedView: React.FC<LiveFeedViewProps> = ({ posts }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleCol}>
          <Text style={styles.title}>CONTINUOUS INGESTION FEED</Text>
          <Text style={styles.subtitle}>Raw multi-platform event stream with NLP annotations</Text>
        </View>
        <View style={styles.eventCountBadge}>
          <Text style={styles.eventCountText}>{posts.length} events</Text>
        </View>
      </View>

      <View style={styles.feedList}>
        {posts.map((post) => (
          <View key={post.id} style={styles.postCard}>
            {/* Header: Author & Platform */}
            <View style={styles.authorRow}>
              <Image source={{ uri: post.author.avatar }} style={styles.avatar} />
              <View style={styles.authorMeta}>
                <View style={styles.authorNameLine}>
                  <Text style={styles.displayName}>{post.author.displayName}</Text>
                  {post.author.verified && (
                    <Ionicons name="checkmark-circle" size={13} color="#38BDF8" />
                  )}
                  <Text style={styles.handle}>@{post.author.handle}</Text>
                </View>
                <Text style={styles.timeAndChannel}>
                  {post.relativeTime}
                  {post.channelOrSubreddit ? ` • in ${post.channelOrSubreddit}` : ''}
                </Text>
              </View>
              <PlatformBadge platform={post.platform} showLabel={false} />
            </View>

            {/* Content Text */}
            <Text style={styles.postContent}>{post.content}</Text>

            {/* NLP Sentiment & Stance Layer */}
            <View style={styles.nlpAnnotationBox}>
              <View style={styles.nlpRow}>
                <EmotionBadge
                  emotion={post.sentiment.primaryEmotion}
                  confidence={post.sentiment.emotionConfidence}
                  sarcasmDetected={post.sentiment.sarcasmDetected}
                />
                <View style={[
                  styles.stanceBadge,
                  post.sentiment.stance === 'supportive'
                    ? styles.stanceSupportive
                    : post.sentiment.stance === 'against'
                    ? styles.stanceAgainst
                    : styles.stanceNeutral,
                ]}>
                  <Text style={styles.stanceText}>
                    Stance: {post.sentiment.stance.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Post Interaction Metrics */}
            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Ionicons name="heart-outline" size={13} color="#94A3B8" />
                <Text style={styles.metricVal}>{post.metrics.likes.toLocaleString()}</Text>
              </View>
              <View style={styles.metricItem}>
                <Ionicons name="repeat-outline" size={13} color="#94A3B8" />
                <Text style={styles.metricVal}>{post.metrics.shares.toLocaleString()}</Text>
              </View>
              <View style={styles.metricItem}>
                <Ionicons name="chatbubble-outline" size={13} color="#94A3B8" />
                <Text style={styles.metricVal}>{post.metrics.replies.toLocaleString()}</Text>
              </View>
              {post.metrics.views && (
                <View style={styles.metricItem}>
                  <Ionicons name="eye-outline" size={13} color="#94A3B8" />
                  <Text style={styles.metricVal}>{(post.metrics.views / 1000).toFixed(0)}k</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleCol: {
    flex: 1,
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
    marginTop: 1,
  },
  eventCountBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  eventCountText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '700',
  },
  feedList: {
    gap: 12,
  },
  postCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 14,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },
  authorMeta: {
    flex: 1,
  },
  authorNameLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  displayName: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  handle: {
    color: '#64748B',
    fontSize: 11,
  },
  timeAndChannel: {
    color: '#475569',
    fontSize: 10,
    marginTop: 1,
  },
  postContent: {
    color: '#E2E8F0',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
  nlpAnnotationBox: {
    backgroundColor: '#020617',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 10,
  },
  nlpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  stanceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  stanceSupportive: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderColor: '#34D399',
  },
  stanceAgainst: {
    backgroundColor: 'rgba(251, 113, 133, 0.15)',
    borderColor: '#FB7185',
  },
  stanceNeutral: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    borderColor: '#94A3B8',
  },
  stanceText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 0.3,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#1E293B66',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metricVal: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
});
