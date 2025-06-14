import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import CampaignCard from '@/components/CampaignCard';
import CampaignCardSkeleton from '@/components/CampaignCardSkeleton';
import FilterChipSkeleton from '@/components/FilterChipSkeleton';
import { Search, Plus, Filter } from 'lucide-react-native';
import { campaignsService } from '@/services/campaigns';
import { Campaign } from '@/types';

export default function CampaignsScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('all');
  const router = useRouter();

  const styles = createStyles(theme);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const data = await campaignsService.list();
      setCampaigns(data);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      // You might want to show an error message to the user here
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = campaigns
    .filter(campaign => {
      const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Sort by deadline (earliest first), but completed campaigns at the end
      if (a.status === 'COMPLETED' && b.status !== 'COMPLETED') return 1;
      if (b.status === 'COMPLETED' && a.status !== 'COMPLETED') return -1;
      if (!a.deadline || !b.deadline) return 0;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });

  const statusCounts = {
    all: campaigns.length,
    DRAFT: campaigns.filter(c => c.status === 'DRAFT').length,
    ACTIVE: campaigns.filter(c => c.status === 'ACTIVE').length,
    COMPLETED: campaigns.filter(c => c.status === 'COMPLETED').length,
    CANCELLED: campaigns.filter(c => c.status === 'CANCELLED').length,
  };

  const getFilterLabel = (status: string) => {
    const labels = {
      all: t.allCampaigns,
      DRAFT: t.draft,
      ACTIVE: t.active,
      COMPLETED: t.completed,
      CANCELLED: t.cancelled
    };
    return labels[status as keyof typeof labels];
  };

  const handleCampaignPress = (campaignId: string) => {
    router.push(`/campaigns/${campaignId}`);
  };

  const handleAddCampaign = () => {
    router.push('/campaigns/add');
  };

  const renderLoadingState = () => (
    <>
      {/* Search skeleton */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: theme.colors.borderLight }]}>
          <Search size={18} color={theme.colors.textSecondary} />
          <View style={[styles.searchSkeleton, { backgroundColor: theme.colors.border }]} />
        </View>
      </View>

      {/* Filter chips skeleton */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <FilterChipSkeleton key={index} />
          ))}
        </ScrollView>
      </View>

      {/* Campaign cards skeleton */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {Array.from({ length: 6 }).map((_, index) => (
          <CampaignCardSkeleton key={index} />
        ))}
      </ScrollView>
    </>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {loading ? renderLoadingState() : (
        <>
          {/* Compact Search */}
          <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
            <View style={[styles.searchBox, { backgroundColor: theme.colors.borderLight }]}>
              <Search size={18} color={theme.colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: theme.colors.text }]}
                placeholder={`${t.search} ${t.campaigns.toLowerCase()}...`}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={theme.colors.textTertiary}
              />
            </View>
          </View>

          {/* Compact Filter Chips */}
          <View style={styles.filterContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScrollContent}
            >
              {(['all', 'DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as const).map(status => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterChip,
                    { backgroundColor: theme.colors.borderLight },
                    statusFilter === status && styles.filterChipActive
                  ]}
                  onPress={() => setStatusFilter(status)}
                  activeOpacity={0.7}
                >
                  {statusFilter === status && (
                    <LinearGradient
                      colors={['#D6BCFA', '#B794F6']} // Softer purple gradients
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.filterChipGradient}
                    />
                  )}
                  <View style={styles.filterChipContent}>
                    <Text style={[
                      styles.filterChipText,
                      { color: theme.colors.textSecondary },
                      statusFilter === status && { color: 'white', fontFamily: 'Inter-Bold' }
                    ]} numberOfLines={1}>
                      {getFilterLabel(status)}
                    </Text>
                    <View style={[
                      styles.filterChipBadge,
                      { backgroundColor: statusFilter === status ? 'rgba(255,255,255,0.3)' : theme.colors.border }
                    ]}>
                      <Text style={[
                        styles.filterChipBadgeText,
                        { color: statusFilter === status ? 'white' : theme.colors.textSecondary }
                      ]}>
                        {statusCounts[status]}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {filteredCampaigns.length > 0 ? (
              filteredCampaigns.map(campaign => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onPress={() => handleCampaignPress(campaign.id)}
                />
              ))
            ) : (
              <View style={[styles.emptyState, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderLight }]}>
                <LinearGradient
                  colors={theme.isDark ? ['#2D3748', '#4A5568'] : ['#FAF5FF', '#EBF8FF']} // Adjusted for theme
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.emptyIcon}
                >
                  <Filter size={32} color={theme.colors.primary} />
                </LinearGradient>
                <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                  {searchQuery || statusFilter !== 'all' ? t.noCampaignsYet : t.noCampaignsYet}
                </Text>
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  {searchQuery || statusFilter !== 'all'
                    ? 'Spróbuj dostosować wyszukiwanie lub filtry'
                    : t.createFirstCampaign
                  }
                </Text>
                <TouchableOpacity onPress={handleAddCampaign} activeOpacity={0.8}>
                  <LinearGradient
                    colors={['#D6BCFA', '#B794F6']} // Softer purple gradients
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.emptyButton}
                  >
                    <Plus size={20} color="white" />
                    <Text style={styles.emptyButtonText}>{t.createYourFirstCampaign}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {/* Floating Action Button */}
          <TouchableOpacity
            style={styles.fab}
            onPress={handleAddCampaign}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#D6BCFA', '#B794F6']} // Softer purple gradients
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fabGradient}
            >
              <Plus size={28} color="white" strokeWidth={2.5} />
            </LinearGradient>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    searchContainer: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      padding: 0,
    },
    searchSkeleton: {
      flex: 1,
      height: 16,
      borderRadius: 8,
    },
    filterContainer: {
      paddingVertical: 12,
    },
    filterScrollContent: {
      paddingHorizontal: 20,
      gap: 8,
    },
    filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      overflow: 'hidden',
      position: 'relative',
    },
    filterChipActive: {
      borderWidth: 0,
    },
    filterChipGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    filterChipContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    filterChipText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
    },
    filterChipBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
    },
    filterChipBadgeText: {
      fontSize: 12,
      fontFamily: 'Inter-SemiBold',
    },
    scrollContent: {
      padding: 20,
    },
    emptyState: {
      padding: 24,
      borderRadius: 16,
      alignItems: 'center',
      borderWidth: 1,
    },
    emptyIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      textAlign: 'center',
      marginBottom: 24,
    },
    emptyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      gap: 8,
    },
    emptyButtonText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: 'white',
    },
    fab: {
      position: 'absolute',
      right: 20,
      bottom: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      overflow: 'hidden',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    fabGradient: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
}