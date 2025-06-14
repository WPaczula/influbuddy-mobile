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
import { ArrowLeft, CreditCard as Edit, Save, X, Building2, Mail, Phone, Globe, Calendar, DollarSign, ChartBar as BarChart3, Users, Trash2 } from 'lucide-react-native';
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
  const deletePartner = useDeletePartner();

  const styles = createStyles(theme);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>{t.loading}</Text>
        </View>
      </SafeAreaView>
    );
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
      .reduce((sum, c) => sum + (c.amount || 0), 0);

    return { activeCampaigns, completedCampaigns, totalEarnings };
  };

  const stats = getPartnerStats();

  const handleEdit = () => {
    router.push(`/partners/edit/${id}`);
  };

  const handleDelete = () => {
    Alert.alert(
      t.delete,
      t.deletePartnerConfirm,
      [
        {
          text: t.cancel,
          style: 'cancel',
        },
        {
          text: t.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePartner.mutateAsync(id);
              router.replace('/(tabs)/partners');
            } catch (error) {
              Alert.alert(t.error, t.updatePartnerError);
            }
          },
        },
      ],
    );
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
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
            <Edit size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
            <Trash2 size={20} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.profileSection, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.avatarText}>
              {partner.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Text>
          </View>

          {isEditing ? (
            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t.fullName} *</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text }]}
                  value={editForm.name}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))}
                  placeholder="Imię i nazwisko"
                  placeholderTextColor={theme.colors.textTertiary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t.companyName} *</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text }]}
                  value={editForm.company}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, company: text }))}
                  placeholder="Nazwa firmy"
                  placeholderTextColor={theme.colors.textTertiary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t.emailAddress} *</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text }]}
                  value={editForm.email}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, email: text }))}
                  placeholder="email@firma.com"
                  placeholderTextColor={theme.colors.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t.phoneNumber}</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text }]}
                  value={editForm.phone}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, phone: text }))}
                  placeholder="+48 555 123 456"
                  placeholderTextColor={theme.colors.textTertiary}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t.website}</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text }]}
                  value={editForm.website}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, website: text }))}
                  placeholder="https://firma.com"
                  placeholderTextColor={theme.colors.textTertiary}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t.notes}</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text }]}
                  value={editForm.notes}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, notes: text }))}
                  placeholder="Dodatkowe notatki o tym partnerze..."
                  placeholderTextColor={theme.colors.textTertiary}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.editActions}>
                <TouchableOpacity style={[styles.cancelButton, { backgroundColor: theme.colors.borderLight }]} onPress={() => setIsEditing(false)}>
                  <X size={16} color={theme.colors.textSecondary} />
                  <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>{t.cancel}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => {
                    setUpdating(true);
                    updatePartner(partner.id, {
                      name: editForm.name?.trim() || '',
                      company: editForm.company?.trim() || '',
                      email: editForm.email?.trim() || '',
                      phone: editForm.phone?.trim() || undefined,
                      website: editForm.website?.trim() || undefined,
                      notes: editForm.notes?.trim() || undefined,
                    })
                      .then(() => {
                        setIsEditing(false);
                        setEditForm({});
                        Alert.alert(t.success, t.partnerUpdated);
                      })
                      .catch((e) => {
                        Alert.alert(t.error, t.updatePartnerError);
                      })
                      .finally(() => setUpdating(false));
                  }}
                  disabled={updating}
                >
                  <Save size={16} color="white" />
                  <Text style={styles.saveButtonText}>
                    {updating ? t.saving : t.saveChanges}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
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
          )}
        </View>

        {!isEditing && (
          <>
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
                    partner={partner}
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
                    partner={partner}
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
          </>
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
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
    backButton: {
      padding: 8,
      marginRight: 8,
    },
    headerTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: '600',
      marginLeft: 8,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerButton: {
      padding: 8,
      marginLeft: 8,
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
    editForm: {
      width: '100%',
    },
    inputGroup: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      marginBottom: 6,
    },
    input: {
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
    },
    textArea: {
      height: 80,
      textAlignVertical: 'top',
    },
    editActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    cancelButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 8,
      gap: 8,
    },
    cancelButtonText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    saveButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 8,
      gap: 8,
    },
    saveButtonText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: 'white',
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