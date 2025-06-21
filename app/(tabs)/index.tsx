import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import StatsCard from '@/components/StatsCard';
import StatsCardSkeleton from '@/components/StatsCardSkeleton';
import CampaignCard from '@/components/CampaignCard';
import CampaignCardSkeleton from '@/components/CampaignCardSkeleton';
import HeaderSkeleton from '@/components/HeaderSkeleton';
import { DollarSign, ChartBar as BarChart3, Users, Clock, Sparkles, TrendingUp } from 'lucide-react-native';
import { useCampaigns } from '@/hooks/queries/useCampaigns';
import { usePartners } from '@/hooks/queries/usePartners';

export default function DashboardScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { data: campaigns = [], isLoading: campaignsLoading, refetch: refetchCampaigns } = useCampaigns();
  const { data: partners = [], isLoading: partnersLoading, refetch: refetchPartners } = usePartners();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const styles = createStyles(theme);

  const loading = campaignsLoading || partnersLoading;

  // Calculate dashboard stats
  const getDashboardStats = () => {
    const totalEarnings = campaigns
      .filter(c => c.status === 'COMPLETED')
      .reduce((sum, c) => sum + (c.productValue || 0), 0);

    const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE').length;
    const totalPartners = partners.length;

    const upcomingDeadlines = campaigns.filter(c => {
      if (!c.deadline) return false;
      const deadline = new Date(c.deadline);
      const today = new Date();
      const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 7 && c.status !== 'COMPLETED';
    }).length;

    return {
      totalEarnings,
      activeCampaigns,
      totalPartners,
      upcomingDeadlines,
    };
  };

  const stats = getDashboardStats();

  const recentCampaigns = campaigns
    .sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 3);

  const upcomingDeadlines = campaigns
    .filter(c => {
      if (!c.deadline) return false;
      const deadline = new Date(c.deadline);
      const today = new Date();
      const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 7 && c.status !== 'COMPLETED';
    })
    .sort((a, b) => {
      if (!a.deadline || !b.deadline) return 0;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    })
    .slice(0, 3);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchCampaigns(), refetchPartners()]);
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleCampaignPress = (campaignId: string) => {
    router.push(`/campaigns/${campaignId}`);
  };

  const renderLoadingState = () => (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header skeleton */}
      <HeaderSkeleton />

      <View style={styles.contentContainer}>
        {/* Stats section skeleton */}
        <View style={styles.statsSection}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionTitleSkeleton, { backgroundColor: theme.colors.borderLight }]} />
            <View style={[styles.iconSkeleton, { backgroundColor: theme.colors.borderLight }]} />
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </View>
            <View style={styles.statsRow}>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </View>
          </View>
        </View>

        {/* Recent campaigns section skeleton */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionTitleSkeleton, { backgroundColor: theme.colors.borderLight }]} />
          </View>

          <View style={styles.campaignsList}>
            {Array.from({ length: 3 }).map((_, index) => (
              <CampaignCardSkeleton key={index} />
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {loading ? renderLoadingState() : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Gradient */}
          <LinearGradient
            colors={['#D6BCFA', '#B794F6']} // Softer purple gradients
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <View style={styles.greetingSection}>
                  <Text style={styles.greeting}>{t.goodMorning}</Text>
                  <Text style={styles.subtitle}>{t.dashboardSubtitle}</Text>
                </View>
                <View style={styles.headerIcon}>
                  <Sparkles size={28} color="white" />
                </View>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.contentContainer}>
            {/* Enhanced Stats Grid */}
            <View style={styles.statsSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t.overview}</Text>
                <TrendingUp size={20} color={theme.colors.primary} />
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statsRow}>
                  <StatsCard
                    icon={<DollarSign size={24} color="white" />}
                    title={t.totalEarnings}
                    value={formatCurrency(stats.totalEarnings)}
                    color="green"
                  />
                  <StatsCard
                    icon={<BarChart3 size={24} color="white" />}
                    title={t.activeCampaigns}
                    value={stats.activeCampaigns}
                    color="blue"
                  />
                </View>
                <View style={styles.statsRow}>
                  <StatsCard
                    icon={<Users size={24} color="white" />}
                    title={t.totalPartners}
                    value={stats.totalPartners}
                    color="purple"
                  />
                  <StatsCard
                    icon={<Clock size={24} color="white" />}
                    title={t.dueThisWeek}
                    value={stats.upcomingDeadlines}
                    color="orange"
                  />
                </View>
              </View>
            </View>

            {/* Upcoming Deadlines */}
            {upcomingDeadlines.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t.upcomingDeadlines}</Text>
                  <View style={[styles.urgentBadge, { backgroundColor: '#FED7D7' }]}>
                    <Clock size={14} color="#FC8181" />
                    <Text style={[styles.urgentBadgeText, { color: '#FC8181' }]}>{t.urgent}</Text>
                  </View>
                </View>
                <View style={styles.campaignsList}>
                  {upcomingDeadlines.map(campaign => {
                    const partner = partners.find(p => p.id === campaign.partnerId);
                    return partner ? (
                      <CampaignCard
                        key={campaign.id}
                        campaign={campaign}
                        onPress={() => handleCampaignPress(campaign.id)}
                      />
                    ) : null;
                  })}
                </View>
              </View>
            )}

            {/* Recent Campaigns */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t.recentCampaigns}</Text>
              </View>

              {recentCampaigns.length > 0 ? (
                <View style={styles.campaignsList}>
                  {recentCampaigns.map(campaign => {
                    const partner = partners.find(p => p.id === campaign.partnerId);
                    return partner ? (
                      <CampaignCard
                        key={campaign.id}
                        campaign={campaign}
                        onPress={() => handleCampaignPress(campaign.id)}
                      />
                    ) : null;
                  })}
                </View>
              ) : (
                <View style={[styles.emptyState, {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.borderLight
                }]}>
                  <View style={[styles.emptyIcon, { backgroundColor: theme.isDark ? '#553C9A' : '#FAF5FF' }]}>
                    <Sparkles size={32} color={theme.colors.primary} />
                  </View>
                  <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                    {t.readyToStart}
                  </Text>
                  <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                    {t.createFirstCampaign}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    headerGradient: {
      marginHorizontal: 20,
      marginTop: 20,
      borderRadius: 24,
    },
    header: {
      padding: 24,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    greetingSection: {
      flex: 1,
    },
    greeting: {
      fontSize: 28,
      fontFamily: 'Inter-Bold',
      color: 'white',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: 'rgba(255, 255, 255, 0.9)',
    },
    headerIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContent: {
      paddingBottom: 32,
    },
    contentContainer: {
      padding: 20,
    },
    statsSection: {
      marginBottom: 32,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 22,
      fontFamily: 'Inter-Bold',
    },
    sectionTitleSkeleton: {
      width: 120,
      height: 22,
      borderRadius: 6,
    },
    iconSkeleton: {
      width: 20,
      height: 20,
      borderRadius: 4,
    },
    urgentBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      gap: 6,
    },
    urgentBadgeText: {
      fontSize: 12,
      fontFamily: 'Inter-SemiBold',
    },
    statsGrid: {
      gap: 16,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 16,
    },
    section: {
      marginBottom: 32,
    },
    campaignsList: {
      gap: 12,
    },
    emptyState: {
      borderRadius: 24,
      padding: 40,
      alignItems: 'center',
      borderWidth: 2,
      borderStyle: 'dashed',
    },
    emptyIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    emptyTitle: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      textAlign: 'center',
      maxWidth: 280,
      lineHeight: 24,
    },
  });
}