import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useData } from '@/hooks/useData';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import { Partner } from '@/types';
import CampaignCard from '@/components/CampaignCard';
import PartnerDetailsSkeleton from '@/components/PartnerDetailsSkeleton';
import { ArrowLeft, Save, X, Building2, Mail, Phone, Globe, Calendar, DollarSign, Users, Pencil } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePartner, useDeletePartner } from '@/hooks/queries/usePartners';

export default function PartnerDetailsScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { partners, campaigns, updatePartner } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Partner>>({});
  const [updating, setUpdating] = useState(false);
  const { data: partner, isLoading, error } = usePartner(id);

  const styles = createStyles(theme);

  if (isLoading) {
    return <PartnerDetailsSkeleton />;
  }

  if (error || !partner) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{t.error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getPartnerStats = () => {
    const activeCampaigns = campaigns.filter(c => c.partnerId === id && c.status !== 'COMPLETED').length;
    const completedCampaigns = campaigns.filter(c => c.partnerId === id && c.status === 'COMPLETED').length;
    const totalEarnings = campaigns
      .filter(c => c.partnerId === id && c.status === 'COMPLETED')
      .reduce((sum, c) => sum + (c.productValue || 0), 0);

    return { activeCampaigns, completedCampaigns, totalEarnings };
  };

  const stats = getPartnerStats();

  const handleEdit = () => {
    router.push(`/partners/edit/${id}`);
  };

  const activeCampaigns = campaigns.filter(c => c.partnerId === id && c.status !== 'COMPLETED');
  const completedCampaigns = campaigns.filter(c => c.partnerId === id && c.status === 'COMPLETED');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity style={[styles.headerButton, { backgroundColor: theme.colors.borderLight }]} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>
          {partner.name}
        </Text>
        <TouchableOpacity onPress={handleEdit} style={[styles.headerButton, { backgroundColor: theme.colors.borderLight }]}>
          <Pencil size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.profileSection, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.avatarText}>
              {partner.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={[styles.partnerName, { color: theme.colors.text }]}>{partner.name}</Text>
            <View style={styles.companyRow}>
              <Building2 size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.companyName, { color: theme.colors.textSecondary }]}>{partner.company}</Text>
            </View>
            <Text style={[styles.joinDate, { color: theme.colors.textTertiary }]}>
              {t.partnerSince} {formatDate(partner.createdAt)}
            </Text>
          </View>
        </View>

        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t.overview}</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
              <LinearGradient
                colors={['#D6BCFA', '#B794F6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statIcon}
              >
                <DollarSign size={20} color="white" />
              </LinearGradient>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {formatCurrency(stats.totalEarnings)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t.totalEarnings}</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
              <LinearGradient
                colors={['#9AE6B4', '#68D391']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statIcon}
              >
                <Calendar size={20} color="white" />
              </LinearGradient>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.activeCampaigns}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t.activeCampaigns}</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
              <LinearGradient
                colors={['#F6AD55', '#ED8936']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statIcon}
              >
                <Users size={20} color="white" />
              </LinearGradient>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.completedCampaigns}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t.completed}</Text>
            </View>
          </View>
        </View>

        <View style={styles.contactSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t.contactInformation}</Text>
          <View style={[styles.contactCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.contactItem}>
              <Mail size={20} color={theme.colors.textSecondary} />
              <Text style={[styles.contactText, { color: theme.colors.textSecondary }]}>{partner.email}</Text>
            </View>
            {partner.phone && (
              <View style={styles.contactItem}>
                <Phone size={20} color={theme.colors.textSecondary} />
                <Text style={[styles.contactText, { color: theme.colors.textSecondary }]}>{partner.phone}</Text>
              </View>
            )}
            {partner.website && (
              <View style={styles.contactItem}>
                <Globe size={20} color={theme.colors.textSecondary} />
                <Text style={[styles.contactText, { color: theme.colors.textSecondary }]}>{partner.website}</Text>
              </View>
            )}
          </View>
        </View>

        {partner.notes && (
          <View style={styles.notesSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t.notes}</Text>
            <View style={[styles.notesCard, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.notesText, { color: theme.colors.textSecondary }]}>{partner.notes}</Text>
            </View>
          </View>
        )}

        {activeCampaigns.length > 0 && (
          <View style={styles.campaignsSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Aktywne kampanie ({activeCampaigns.length})</Text>
            {activeCampaigns.map(campaign => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onPress={() => router.push(`/campaigns/${campaign.id}`)}
              />
            ))}
          </View>
        )}

        {completedCampaigns.length > 0 && (
          <View style={styles.campaignsSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Ukończone kampanie ({completedCampaigns.length})</Text>
            {completedCampaigns.map(campaign => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onPress={() => router.push(`/campaigns/${campaign.id}`)}
              />
            ))}
          </View>
        )}

        {campaigns.length === 0 && (
          <View style={[styles.emptyState, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderLight }]}>
            <Users size={48} color={theme.colors.border} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Brak kampanii</Text>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Rozpocznij swoją pierwszą kampanię z {partner.name}, aby ją tutaj zobaczyć
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    errorText: {
      fontSize: 16,
      textAlign: 'center',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
    },
    headerButton: {
      padding: 8,
      borderRadius: 8,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      flex: 1,
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      marginLeft: 8,
      textAlign: 'center',
    },
    scrollContent: {
      padding: 16,
    },
    profileSection: {
      borderRadius: 16,
      padding: 24,
      marginBottom: 24,
      alignItems: 'center',
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    avatarText: {
      fontSize: 28,
      fontFamily: 'Inter-Bold',
      color: 'white',
    },
    profileInfo: {
      alignItems: 'center',
    },
    partnerName: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      marginBottom: 8,
    },
    companyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    companyName: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
    },
    joinDate: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
    },
    statsSection: {
      marginBottom: 24,
    },
    statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    statCard: {
      flex: 1,
      padding: 16,
      alignItems: 'center',
      borderRadius: 16,
    },
    statValue: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      marginTop: 8,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      textAlign: 'center',
    },
    contactSection: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 20,
      fontFamily: 'Inter-SemiBold',
      marginBottom: 12,
    },
    contactCard: {
      borderRadius: 16,
      padding: 20,
    },
    contactItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      gap: 12,
    },
    contactText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
    },
    notesSection: {
      marginBottom: 24,
    },
    notesCard: {
      borderRadius: 16,
      padding: 20,
    },
    notesText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      lineHeight: 24,
    },
    campaignsSection: {
      marginBottom: 24,
    },
    emptyState: {
      borderRadius: 16,
      padding: 40,
      alignItems: 'center',
      borderWidth: 1,
      borderStyle: 'dashed',
    },
    emptyTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      marginTop: 16,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      textAlign: 'center',
      maxWidth: 240,
    },
    statIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
  });
}