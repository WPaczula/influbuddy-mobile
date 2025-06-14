import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useData } from '@/hooks/useData';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import PartnerCard from '@/components/PartnerCard';
import PartnerCardSkeleton from '@/components/PartnerCardSkeleton';
import StatsBarSkeleton from '@/components/StatsBarSkeleton';
import { Search, Plus, Users, UserPlus } from 'lucide-react-native';

export default function PartnersScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { partners, loading } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Move styles creation before any usage
  const styles = createStyles(theme);

  const filteredPartners = partners
    .filter(partner => {
      const matchesSearch = partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.email?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const handlePartnerPress = (partnerId: string) => {
    router.push(`/partners/${partnerId}`);
  };

  const handleAddPartner = () => {
    router.push('/partners/add');
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

      {/* Stats bar skeleton */}
      <StatsBarSkeleton />

      {/* Partner cards skeleton */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {Array.from({ length: 5 }).map((_, index) => (
          <PartnerCardSkeleton key={index} />
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
                placeholder={`${t.search} ${t.partners.toLowerCase()}...`}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={theme.colors.textTertiary}
              />
            </View>
          </View>

          {/* Enhanced Stats Bar */}
          <View style={[styles.statsBar, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
            <LinearGradient
              colors={theme.isDark ? ['#2D3748', '#4A5568'] : ['#FAF5FF', '#F0FFF4']} // Adjusted for theme
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.statsGradient}
            >
              <View style={styles.statsContent}>
                <Text style={[styles.statsText, { color: theme.colors.text }]}>
                  {filteredPartners.length} z {partners.length} partnerów
                </Text>
                <Text style={[styles.statsText, { color: theme.colors.text }]}>
                  Łączne zarobki: {new Intl.NumberFormat('pl-PL', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                  }).format(partners.reduce((sum, p) => sum + p.totalEarnings, 0))}
                </Text>
              </View>
            </LinearGradient>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {filteredPartners.length > 0 ? (
              filteredPartners.map(partner => (
                <PartnerCard
                  key={partner.id}
                  partner={partner}
                  onPress={() => handlePartnerPress(partner.id)}
                />
              ))
            ) : (
              <View style={[styles.emptyState, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderLight }]}>
                <LinearGradient
                  colors={theme.isDark ? ['#2D3748', '#4A5568'] : ['#FAF5FF', '#F0FFF4']} // Adjusted for theme
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.emptyIcon}
                >
                  <Users size={32} color={theme.colors.primary} />
                </LinearGradient>
                <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                  {searchQuery ? 'Nie znaleziono partnerów' : t.noPartnersYet}
                </Text>
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  {searchQuery 
                    ? 'Spróbuj dostosować wyszukiwanie'
                    : 'Dodaj swojego pierwszego partnera, aby rozpocząć śledzenie sponsoringu!'
                  }
                </Text>
                {!searchQuery && (
                  <TouchableOpacity onPress={handleAddPartner} activeOpacity={0.8}>
                    <LinearGradient
                      colors={['#D6BCFA', '#B794F6']} // Softer purple gradients
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.emptyButton}
                    >
                      <UserPlus size={20} color="white" />
                      <Text style={styles.emptyButtonText}>{t.addYourFirstPartner}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>

          {/* Floating Action Button */}
          <TouchableOpacity 
            style={styles.fab} 
            onPress={handleAddPartner}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#D6BCFA', '#B794F6']} // Softer purple gradients
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fabGradient}
            >
              <UserPlus size={28} color="white" strokeWidth={2.5} />
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
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      gap: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      fontFamily: 'Inter-Regular',
    },
    searchSkeleton: {
      flex: 1,
      height: 15,
      borderRadius: 8,
    },
    statsBar: {
      borderBottomWidth: 1,
      overflow: 'hidden',
    },
    statsGradient: {
      paddingHorizontal: 20,
      paddingVertical: 14,
    },
    statsContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statsText: {
      fontSize: 13,
      fontFamily: 'Inter-Bold',
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 100, // Extra padding for FAB
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 64,
      borderRadius: 24,
      borderWidth: 2,
      borderStyle: 'dashed',
    },
    emptyIcon: {
      width: 80,
      height: 80,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    emptyTitle: {
      fontSize: 22,
      fontFamily: 'Inter-Bold',
      marginBottom: 12,
    },
    emptyText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      textAlign: 'center',
      maxWidth: 280,
      marginBottom: 32,
      lineHeight: 24,
    },
    emptyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderRadius: 16,
      gap: 8,
    },
    emptyButtonText: {
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      color: 'white',
    },
    fab: {
      position: 'absolute',
      bottom: 24,
      right: 24,
      width: 64,
      height: 64,
      borderRadius: 32,
    },
    fabGradient: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
}