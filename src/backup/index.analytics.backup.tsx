import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  TextInput,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useSignUp, useSignIn, useUser } from '@clerk/expo';

import {
  MOCK_POST_EVENTS,
  MOCK_TIMELINE_SERIES,
  MOCK_TRENDING_TOPICS,
  MOCK_DEMOGRAPHICS,
  MOCK_NETWORK_GRAPH,
} from '../data/mockAnalyticsData';
import { PlatformType, TimelineDataPoint } from '../types/analytics';
import { MetricCard } from '../components/common/MetricCard';
import { PlatformBadge } from '../components/common/PlatformBadge';
import { TimelineScrubber } from '../components/analytics/TimelineScrubber';
import { SentimentChart } from '../components/analytics/SentimentChart';
import { DemographicsView } from '../components/analytics/DemographicsView';
import { TrendsView } from '../components/analytics/TrendsView';
import { NetworkGraphView } from '../components/analytics/NetworkGraphView';
import { LiveFeedView } from '../components/analytics/LiveFeedView';

type TabVector = 'overview' | 'timeline' | 'sentiment' | 'demographics' | 'trends' | 'network';

export default function MainScreen() {
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const { signUp } = useSignUp();
  const { signIn } = useSignIn();
  const { user } = useUser();

  // Demo mode toggle so anyone can explore without mandatory signup/signin
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Auth toggle: 'signin' | 'signup'
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');

  // Input states
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  // Analytics UI state
  const [activeTab, setActiveTab] = useState<TabVector>('overview');
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformType[]>([
    'x',
    'telegram',
    'reddit',
    'youtube',
    'instagram',
  ]);
  const [selectedTimePoint, setSelectedTimePoint] = useState<TimelineDataPoint>(
    MOCK_TIMELINE_SERIES[MOCK_TIMELINE_SERIES.length - 1]
  );

  // ─── Reactive finalize for Sign-Up ────────────────────────────────────────
  // signUp is a reactive signal: its .status and .createdSessionId only reflect
  // updated server state on the NEXT render after a mutation. Calling
  // finalize() in the same async handler reads stale state (createdSessionId
  // is still null) → throws "cannot finalize sign-up without a created session".
  // The fix: useEffect fires once the signal settles to status === 'complete'.
  useEffect(() => {
    if (signUp.status !== 'complete' || !isVerifying) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoadingAuth(true);

    signUp.finalize().then(({ error }) => {
      if (cancelled) return;
      if (error) {
        setAuthError(error.message || 'Error finalizing account session');
      }
      // On success, isSignedIn from useAuth() reactively becomes true and
      // the component re-renders to show the dashboard automatically.
      setIsLoadingAuth(false);
    });

    return () => {
      cancelled = true;
    };
  }, [signUp.status, isVerifying]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Reactive finalize for Sign-In ────────────────────────────────────────
  // Same root cause: after signIn.password() or signIn.mfa.verifyEmailCode(),
  // the signIn signal's .status is only 'complete' on the next render cycle.
  useEffect(() => {
    if (signIn.status !== 'complete') return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoadingAuth(true);

    signIn.finalize().then(({ error }) => {
      if (cancelled) return;
      if (error) {
        setAuthError(error.message || 'Sign in finalization failed');
      }
      setIsLoadingAuth(false);
    });

    return () => {
      cancelled = true;
    };
  }, [signIn.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const togglePlatform = (p: PlatformType) => {
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter((item) => item !== p));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const filteredPosts = MOCK_POST_EVENTS.filter((post) =>
    selectedPlatforms.includes(post.platform)
  );

  // Handle Clerk Sign In (Login)
  const handleSignIn = async () => {
    if (!signIn) return;
    setAuthError(null);
    setAuthSuccessMsg(null);
    setIsLoadingAuth(true);

    try {
      const { error } = await signIn.password({ emailAddress, password });
      if (error) {
        setAuthError(error.message || 'Invalid email or password');
        setIsLoadingAuth(false);
        return;
      }

      // signIn.status is stale here (reactive signal updates on next render).
      // The useEffect above detects status === 'complete' and calls finalize().
      // For MFA / Device Trust, status will be non-complete here:
      if (signIn.status === 'needs_second_factor' || signIn.status === 'needs_client_trust') {
        await signIn.mfa.sendEmailCode();
        setIsVerifying(true);
      } else if (signIn.status !== 'complete') {
        // Unexpected status — surface it as an error
        setAuthError(`Sign in status: ${signIn.status}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed';
      setAuthError(msg);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  // Handle Clerk Sign Up
  const handleSignUp = async () => {
    if (!signUp) return;
    setAuthError(null);
    setAuthSuccessMsg(null);
    setIsLoadingAuth(true);

    try {
      const { error } = await signUp.password({ emailAddress, password });
      if (error) {
        setAuthError(error.message || 'Error initiating sign up');
        setIsLoadingAuth(false);
        return;
      }

      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) {
        setAuthError(sendError.message || 'Error sending verification code');
        setIsLoadingAuth(false);
        return;
      }

      setIsVerifying(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign up failed';
      setAuthError(msg);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  // Handle Verification Code (Used in both Sign-Up verification and MFA Login)
  const handleVerify = async () => {
    setAuthError(null);
    setIsLoadingAuth(true);

    try {
      if (authTab === 'signup' && signUp) {
        const { error } = await signUp.verifications.verifyEmailCode({ code });
        if (error) {
          setAuthError(error.message || 'Invalid verification code');
          return;
        }
        // signUp.status updates reactively on the next render.
        // The useEffect above watches for status === 'complete' and calls
        // signUp.finalize() automatically — no need to call it here.
      } else if (authTab === 'signin' && signIn) {
        const { error } = await signIn.mfa.verifyEmailCode({ code });
        if (error) {
          setAuthError(error.message || 'Invalid MFA code');
        }
        // signIn.status updates reactively on the next render.
        // The useEffect above watches for status === 'complete' and calls
        // signIn.finalize() automatically.
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Verification failed';
      setAuthError(msg);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#38BDF8" />
        <Text style={styles.loadingText}>Initializing Neural Pulse...</Text>
      </View>
    );
  }

  // --- SCREEN 1: LOGIN & SIGN-UP SCREEN (When not signed in & not in demo mode) ---
  if (!isSignedIn && !isDemoMode) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#020617" />
        <ScrollView contentContainerStyle={styles.authScrollContainer}>
          <View style={styles.authBox}>
            {/* Header Branding */}
            <View style={styles.authBrandRow}>
              <View style={styles.authLogo}>
                <Ionicons name="git-network-outline" size={26} color="#38BDF8" />
              </View>
              <Text style={styles.authTitle}>NEURAL PULSE</Text>
              <Text style={styles.authSubtitle}>
                AI-Driven Social Media Analytics & Audience Intelligence
              </Text>
            </View>

            {/* Tab Switcher: Sign In vs Sign Up */}
            {!isVerifying && (
              <View style={styles.authTabs}>
                <Pressable
                  onPress={() => {
                    setAuthTab('signin');
                    setAuthError(null);
                  }}
                  style={[styles.authTabItem, authTab === 'signin' && styles.authTabItemActive]}>
                  <Text style={[styles.authTabItemText, authTab === 'signin' && styles.authTabItemTextActive]}>
                    Sign In (Login)
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setAuthTab('signup');
                    setAuthError(null);
                  }}
                  style={[styles.authTabItem, authTab === 'signup' && styles.authTabItemActive]}>
                  <Text style={[styles.authTabItemText, authTab === 'signup' && styles.authTabItemTextActive]}>
                    Sign Up
                  </Text>
                </Pressable>
              </View>
            )}

            {authError && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={16} color="#F87171" />
                <Text style={styles.errorText}>{authError}</Text>
              </View>
            )}

            {authSuccessMsg && (
              <View style={styles.successBanner}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#34D399" />
                <Text style={styles.successText}>{authSuccessMsg}</Text>
              </View>
            )}

            {isVerifying ? (
              // Verification View
              <View style={styles.formSection}>
                <View style={styles.verificationNotice}>
                  <Ionicons name="mail-unread-outline" size={24} color="#38BDF8" />
                  <Text style={styles.verificationHeader}>Check Your Email</Text>
                  <Text style={styles.verificationSub}>
                    We sent a verification code to{' '}
                    <Text style={styles.boldEmail}>{emailAddress}</Text>
                  </Text>
                </View>

                <Text style={styles.fieldLabel}>VERIFICATION CODE</Text>
                <TextInput
                  style={styles.textInput}
                  value={code}
                  placeholder="Enter 6-digit code"
                  placeholderTextColor="#64748B"
                  onChangeText={setCode}
                  keyboardType="numeric"
                  autoFocus
                />

                <Pressable
                  onPress={handleVerify}
                  disabled={isLoadingAuth || !code.trim()}
                  style={[styles.primaryButton, (!code.trim() || isLoadingAuth) && styles.buttonDisabled]}>
                  {isLoadingAuth ? (
                    <ActivityIndicator color="#020617" size="small" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Verify & Continue</Text>
                  )}
                </Pressable>

                <Pressable onPress={() => setIsVerifying(false)} style={styles.secondaryLink}>
                  <Text style={styles.secondaryLinkText}>← Back to login</Text>
                </Pressable>
              </View>
            ) : (
              // Form Section (Login or Sign Up)
              <View style={styles.formSection}>
                <Text style={styles.sectionHeading}>
                  {authTab === 'signin' ? 'Sign In to Neural Pulse' : 'Create Your Account'}
                </Text>

                <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
                <TextInput
                  style={styles.textInput}
                  autoCapitalize="none"
                  value={emailAddress}
                  placeholder="name@example.com"
                  placeholderTextColor="#64748B"
                  onChangeText={setEmailAddress}
                  keyboardType="email-address"
                />

                <Text style={styles.fieldLabel}>PASSWORD</Text>
                <TextInput
                  style={styles.textInput}
                  value={password}
                  placeholder="Enter your password"
                  placeholderTextColor="#64748B"
                  secureTextEntry={true}
                  onChangeText={setPassword}
                />

                <Pressable
                  onPress={authTab === 'signin' ? handleSignIn : handleSignUp}
                  disabled={isLoadingAuth || !emailAddress.trim() || !password.trim()}
                  style={[
                    styles.primaryButton,
                    (!emailAddress.trim() || !password.trim() || isLoadingAuth) &&
                      styles.buttonDisabled,
                  ]}>
                  {isLoadingAuth ? (
                    <ActivityIndicator color="#020617" size="small" />
                  ) : (
                    <Text style={styles.primaryButtonText}>
                      {authTab === 'signin' ? 'Log In' : 'Sign up'}
                    </Text>
                  )}
                </Pressable>

                {/* Required for sign-up flows on Expo web. Clerk skips the browser CAPTCHA on iOS and Android */}
                <View nativeID="clerk-captcha" />

                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Direct Demo / Preview Button */}
                <Pressable
                  onPress={() => setIsDemoMode(true)}
                  style={styles.demoButton}>
                  <Ionicons name="sparkles" size={15} color="#34D399" />
                  <Text style={styles.demoButtonText}>
                    Explore Analytics UI (Demo Mode)
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- SCREEN 2: AUTHENTICATED / ACTIVE DASHBOARD SCREEN ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />

      {/* Top App Navbar */}
      <View style={styles.navbar}>
        <View style={styles.brandRow}>
          <View style={styles.brandLogo}>
            <Ionicons name="git-network-outline" size={18} color="#38BDF8" />
          </View>
          <View>
            <Text style={styles.brandTitle}>NEURAL PULSE</Text>
            <Text style={styles.brandSubtitle}>Social Media Intelligence AI</Text>
          </View>
        </View>

        {/* User Status / Sign Out */}
        <View style={styles.userControls}>
          {isSignedIn ? (
            <View style={styles.signedInPill}>
              <View style={styles.onlineDot} />
              <Text style={styles.userEmailText} numberOfLines={1}>
                {user?.primaryEmailAddress?.emailAddress || 'Signed In'}
              </Text>
              <Pressable
                onPress={async () => {
                  await signOut();
                  setIsDemoMode(false);
                }}
                style={styles.logoutIconBtn}>
                <Ionicons name="log-out-outline" size={14} color="#F87171" />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => setIsDemoMode(false)}
              style={styles.signInPill}>
              <Ionicons name="log-in-outline" size={14} color="#38BDF8" />
              <Text style={styles.signInPillText}>Sign Up / In</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Ingestion Stream Platform Filter Bar */}
      <View style={styles.platformBar}>
        <Text style={styles.filterTitle}>ACTIVE INGESTION STREAM (5 PLATFORMS):</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.platformList}>
          {(['x', 'telegram', 'reddit', 'youtube', 'instagram'] as PlatformType[]).map((plat) => (
            <PlatformBadge
              key={plat}
              platform={plat}
              isSelected={selectedPlatforms.includes(plat)}
              onPress={() => togglePlatform(plat)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Primary Analytical Vector Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {[
            { id: 'overview', label: 'All Vectors', icon: 'grid-outline' },
            { id: 'timeline', label: 'A. Timeline', icon: 'time-outline' },
            { id: 'sentiment', label: 'B. Sentiment', icon: 'heart-half-outline' },
            { id: 'demographics', label: 'C. Demographics', icon: 'people-outline' },
            { id: 'trends', label: 'D. Trends', icon: 'trending-up-outline' },
            { id: 'network', label: 'E. Network Graph', icon: 'share-social-outline' },
          ].map((tab) => {
            const isCurrent = activeTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setActiveTab(tab.id as TabVector)}
                style={[styles.tabButton, isCurrent && styles.tabButtonActive]}>
                <Ionicons
                  name={tab.icon as keyof typeof Ionicons.glyphMap}
                  size={13}
                  color={isCurrent ? '#38BDF8' : '#94A3B8'}
                />
                <Text style={[styles.tabButtonText, isCurrent && styles.tabButtonTextActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Analytical Dashboard Content */}
      <ScrollView style={styles.contentScroll} contentContainerStyle={styles.scrollPadding}>
        {/* KPI Summary Tiles */}
        <View style={styles.kpiRow}>
          <MetricCard
            title="Total Events"
            value="128.4k"
            changeRate="+18.4%"
            isPositiveChange={true}
            accentColor="#38BDF8"
            iconName="pulse"
          />
          <MetricCard
            title="EVI Volatility"
            value={selectedTimePoint.emotionalVolatilityIndex.toFixed(2)}
            subtitle="Within stable bounds"
            accentColor="#34D399"
            iconName="speedometer-outline"
          />
          <MetricCard
            title="Diffusion R_t"
            value="1.48"
            changeRate="Supercritical"
            isPositiveChange={false}
            accentColor="#F43F5E"
            iconName="git-merge-outline"
          />
          <MetricCard
            title="Active KOLs"
            value="14"
            subtitle="High authority"
            accentColor="#A78BFA"
            iconName="star-outline"
          />
        </View>

        {/* Tab-driven Content Rendering */}
        {(activeTab === 'overview' || activeTab === 'timeline') && (
          <TimelineScrubber
            series={MOCK_TIMELINE_SERIES}
            selectedPoint={selectedTimePoint}
            onSelectPoint={setSelectedTimePoint}
          />
        )}

        {(activeTab === 'overview' || activeTab === 'sentiment') && (
          <SentimentChart
            series={MOCK_TIMELINE_SERIES}
            currentPoint={selectedTimePoint}
          />
        )}

        {(activeTab === 'overview' || activeTab === 'trends') && (
          <TrendsView topics={MOCK_TRENDING_TOPICS} />
        )}

        {(activeTab === 'overview' || activeTab === 'demographics') && (
          <DemographicsView data={MOCK_DEMOGRAPHICS} />
        )}

        {(activeTab === 'overview' || activeTab === 'network') && (
          <NetworkGraphView data={MOCK_NETWORK_GRAPH} />
        )}

        {(activeTab === 'overview' || activeTab === 'timeline') && (
          <LiveFeedView posts={filteredPosts} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  // Auth Screen Styles
  authScrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#020617',
  },
  authBox: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  authBrandRow: {
    alignItems: 'center',
    marginBottom: 20,
  },
  authLogo: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#38BDF866',
    marginBottom: 12,
  },
  authTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  authSubtitle: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    maxWidth: 260,
  },
  authTabs: {
    flexDirection: 'row',
    backgroundColor: '#020617',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  authTabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  authTabItemActive: {
    backgroundColor: '#1E293B',
  },
  authTabItemText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  authTabItemTextActive: {
    color: '#38BDF8',
    fontWeight: '800',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(248, 113, 113, 0.15)',
    borderWidth: 1,
    borderColor: '#F87171',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#F87171',
    fontSize: 12,
    flex: 1,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderWidth: 1,
    borderColor: '#34D399',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#34D399',
    fontSize: 12,
    flex: 1,
  },
  formSection: {
    gap: 12,
  },
  sectionHeading: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  fieldLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  textInput: {
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    padding: 13,
    color: '#F8FAFC',
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: '#38BDF8',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: '#020617',
    fontSize: 14,
    fontWeight: '800',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1E293B',
  },
  dividerText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#34D39944',
    borderRadius: 10,
    paddingVertical: 12,
  },
  demoButtonText: {
    color: '#34D399',
    fontSize: 13,
    fontWeight: '700',
  },
  verificationNotice: {
    alignItems: 'center',
    backgroundColor: '#020617',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 16,
    marginBottom: 8,
    gap: 6,
  },
  verificationHeader: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  verificationSub: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
  },
  boldEmail: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  secondaryLink: {
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  secondaryLinkText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  // Dashboard Styles
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#020617',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#38BDF866',
  },
  brandTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  brandSubtitle: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '500',
  },
  userControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signedInPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#34D39944',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    maxWidth: 150,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  userEmailText: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '600',
    flexShrink: 1,
  },
  logoutIconBtn: {
    padding: 2,
  },
  signInPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#38BDF844',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  signInPillText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  platformBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B44',
    backgroundColor: '#090D1A',
  },
  filterTitle: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  platformList: {
    flexDirection: 'row',
    gap: 8,
  },
  tabsContainer: {
    backgroundColor: '#020617',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  tabsScroll: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  tabButtonActive: {
    backgroundColor: '#1E293B',
    borderColor: '#38BDF8',
  },
  tabButtonText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#F8FAFC',
    fontWeight: '800',
  },
  contentScroll: {
    flex: 1,
  },
  scrollPadding: {
    padding: 16,
    paddingBottom: 40,
  },
  kpiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
});
