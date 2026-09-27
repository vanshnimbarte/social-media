export type PlatformType = 'x' | 'telegram' | 'reddit' | 'youtube' | 'instagram';

export type EmotionType = 
  | 'excitement' 
  | 'anxiety' 
  | 'sarcasm' 
  | 'outrage' 
  | 'joy' 
  | 'curiosity' 
  | 'supportive' 
  | 'against'
  | 'neutral';

export interface AuthorProfile {
  id: string;
  handle: string;
  displayName: string;
  avatar: string;
  platform: PlatformType;
  followerCount: number;
  bio?: string;
  verified?: boolean;
  inferredAgeGroup?: '18-24' | '25-34' | '35-49' | '50+';
  inferredLocation?: string;
  inferredInterest?: string;
}

export interface PostEvent {
  id: string;
  platform: PlatformType;
  channelOrSubreddit?: string;
  timestamp: string; // ISO string
  relativeTime: string;
  author: AuthorProfile;
  content: string;
  hashtags: string[];
  mentions: string[];
  metrics: {
    likes: number;
    shares: number;
    replies: number;
    views?: number;
  };
  sentiment: {
    polarityScore: number; // -1.0 to 1.0
    primaryEmotion: EmotionType;
    emotionConfidence: number; // 0 to 1
    sarcasmDetected: boolean;
    sarcasmScore: number; // 0 to 1
    stance: 'supportive' | 'against' | 'neutral';
  };
}

export interface TimelineDataPoint {
  timeLabel: string;
  timestamp: number;
  postVolume: number;
  positiveSentiment: number;
  negativeSentiment: number;
  neutralSentiment: number;
  emotionalVolatilityIndex: number;
  topEmotion: EmotionType;
}

export interface TrendingTopic {
  id: string;
  name: string;
  category: string;
  postVolume: number;
  velocity: number; // posts/minute
  acceleration: number; // velocity delta
  burstState: 'normal' | 'rising' | 'bursting' | 'supercritical';
  sentimentValence: number; // -1 to 1
  dominantEmotion: EmotionType;
  trajectory: {
    sixHourForecast: number;
    twelveHourForecast: number;
    twentyFourHourForecast: number;
  };
  topHashtags: string[];
  samplePostSnippet: string;
}

export interface DemographicCohort {
  ageGroups: { label: string; percentage: number; count: number }[];
  topLocations: { country: string; code: string; percentage: number }[];
  languages: { code: string; name: string; percentage: number }[];
  professionalFields: { name: string; percentage: number; count: number }[];
  kAnonymityStatus: {
    thresholdMet: boolean;
    sampleSize: number;
    kValue: number;
  };
}

export interface NetworkNode {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  platform: PlatformType;
  followerCount: number;
  pageRank: number; // 0 to 1
  betweennessCentrality: number; // 0 to 1
  inDegree: number;
  isKOL: boolean;
  communityId: number;
  color: string;
  x?: number;
  y?: number;
}

export interface NetworkLink {
  source: string;
  target: string;
  type: 'mention' | 'retweet' | 'reply' | 'forward';
  weight: number;
  timestamp: string;
}

export interface NetworkGraphData {
  nodes: NetworkNode[];
  links: NetworkLink[];
  cascadeMetrics: {
    reproductionRateRt: number;
    activeSeedNodes: number;
    activatedSecondaryNodes: number;
    supercriticalClusters: number;
  };
}
