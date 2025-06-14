import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, Modal, TextInput, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { Campaign } from '@/types';
import { ArrowLeft, Calendar, DollarSign, ExternalLink, Building2, CircleCheck as CheckCircle, Clock, CirclePlay as PlayCircle, CreditCard as Edit, Trash2, Plus, Eye, Heart, MessageCircle, Share as ShareIcon, X, Link as LinkIcon, FileText, Send, Instagram, Youtube, Twitter, Globe } from 'lucide-react-native';
import { campaignsService } from '@/services/campaigns';
import StatusBadge from '@/components/StatusBadge';

interface AddPostForm {
  url: string;
  postType: 'post' | 'story' | 'reel' | 'video' | 'carousel';
  description: string;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'linkedin' | 'other';
}

const CampaignDetailsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddPost, setShowAddPost] = useState(false);
  const [postForm, setPostForm] = useState<AddPostForm>({
    url: '',
    postType: 'post',
    description: '',
    platform: 'instagram',
  });
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  const styles = createStyles(theme);

  useEffect(() => {
    loadCampaign();
  }, [id]);

  const loadCampaign = async () => {
    try {
      setLoading(true);
      const data = await campaignsService.getDetails(id);
      setCampaign(data);
    } catch (error) {
      console.error('Error loading campaign:', error);
      Alert.alert(t.error, t.loadingError);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('pl-PL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getDaysUntilDeadline = () => {
    if (!campaign?.deadline) return 0;
    const deadline = new Date(campaign.deadline);
    const today = new Date();
    const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil;
  };

  const updateStatus = async (newStatus: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED') => {
    if (!campaign) {
      Alert.alert(t.error, t.loadingError);
      return;
    }

    try {
      const updatedCampaign = await campaignsService.update(campaign.id, { status: newStatus });
      setCampaign(updatedCampaign);
    } catch (error) {
      console.error('Error updating campaign status:', error);
      Alert.alert(t.error, t.updateCampaignError);
    }
  };

  const openLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening link:', error);
      Alert.alert(t.error, t.loadingError);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Instagram size={20} color={theme.colors.text} />;
      case 'tiktok':
        return <Globe size={20} color={theme.colors.text} />;
      case 'youtube':
        return <Youtube size={20} color={theme.colors.text} />;
      case 'twitter':
        return <Twitter size={20} color={theme.colors.text} />;
      case 'linkedin':
        return <Globe size={20} color={theme.colors.text} />;
      default:
        return <Globe size={20} color={theme.colors.text} />;
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return t.instagram;
      case 'tiktok':
        return t.tiktok;
      case 'youtube':
        return t.youtube;
      case 'twitter':
        return t.twitter;
      case 'linkedin':
        return t.linkedin;
      default:
        return t.other;
    }
  };

  const getStatusActions = () => {
    if (!campaign) return null;

    switch (campaign.status) {
      case 'DRAFT':
        return (
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.primary }]} onPress={() => updateStatus('ACTIVE')}>
            <Text style={styles.actionButtonText}>{t.startCampaign}</Text>
          </TouchableOpacity>
        );
      case 'ACTIVE':
        return (
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.success }]} onPress={() => updateStatus('COMPLETED')}>
            <Text style={styles.actionButtonText}>{t.markComplete}</Text>
          </TouchableOpacity>
        );
      case 'COMPLETED':
        return (
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.error }]} onPress={() => updateStatus('CANCELLED')}>
            <Text style={styles.actionButtonText}>{t.cancel}</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleEditCampaign = () => {
    router.push(`/campaigns/edit/${id}`);
  };

  const detectPlatform = (url: string): 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'linkedin' | 'other' => {
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('tiktok.com')) return 'tiktok';
    if (url.includes('youtube.com')) return 'youtube';
    if (url.includes('twitter.com')) return 'twitter';
    if (url.includes('linkedin.com')) return 'linkedin';
    return 'other';
  };

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleAddPost = () => {
    setShowAddPost(true);
  };

  const handleUrlChange = (url: string) => {
    const platform = detectPlatform(url);
    setPostForm(prev => ({
      ...prev,
      url,
      platform,
    }));
  };

  const handleSubmitPost = async () => {
    if (!validateUrl(postForm.url)) {
      Alert.alert(t.error, t.validWebsite);
      return;
    }

    if (!campaign) {
      Alert.alert(t.error, t.loadingError);
      return;
    }

    setIsSubmittingPost(true);
    try {
      const updatedCampaign = await campaignsService.addPost(
        campaign.id,
        postForm.url
      );
      setCampaign(updatedCampaign);
      setShowAddPost(false);
      setPostForm({
        url: '',
        postType: 'post',
        description: '',
        platform: 'instagram',
      });
    } catch (error) {
      console.error('Error adding post:', error);
      Alert.alert(t.error, t.updateCampaignError);
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const generateSummary = () => {
    if (!campaign) return '';

    const startDate = new Date(campaign.createdAt).toLocaleDateString();
    const deadline = campaign.deadline ? new Date(campaign.deadline).toLocaleDateString() : 'No deadline';
    const status = campaign.status.toLowerCase();
    const partnerName = campaign.partner.name;
    const partnerCompany = campaign.partner.company;

    let summary = `Campaign: ${campaign.title}\n`;
    summary += `Partner: ${partnerName} (${partnerCompany})\n`;
    summary += `Status: ${status}\n`;
    summary += `Start Date: ${startDate}\n`;
    summary += `Deadline: ${deadline}\n`;

    if (campaign.description) {
      summary += `\nDescription:\n${campaign.description}\n`;
    }

    return summary;
  };

  const handleGenerateSummary = () => {
    setShowSummaryModal(true);
  };

  const handleShareSummary = async () => {
    try {
      const summary = generateSummary();
      await Share.share({
        message: summary,
        title: `Campaign Update: ${campaign?.title || 'Campaign'}`
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share summary');
    }
  };

  const daysUntil = getDaysUntilDeadline();
  const isUrgent = daysUntil <= 3 && campaign?.status !== 'COMPLETED';

  const getPostTypeLabel = (postType: string) => {
    switch (postType.toLowerCase()) {
      case 'post':
        return t.post;
      case 'story':
        return t.story;
      case 'reel':
        return t.reel;
      case 'video':
        return t.video;
      case 'carousel':
        return t.carousel;
      default:
        return postType;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>{t.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!campaign) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{t.loadingError}</Text>
          <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.colors.primary }]} onPress={handleBackPress}>
            <Text style={styles.backButtonText}>{t.back}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity style={[styles.headerButton, { backgroundColor: theme.colors.borderLight }]} onPress={handleBackPress}>
          <ArrowLeft size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t.campaignDetails}</Text>
        <TouchableOpacity style={[styles.headerButton, { backgroundColor: theme.colors.borderLight }]} onPress={handleEditCampaign}>
          <Edit size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.campaignHeader}>
            <View style={styles.titleSection}>
              <Text style={[styles.title, { color: theme.colors.text }]}>{campaign.title}</Text>
              <View style={styles.partnerInfo}>
                <Building2 size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.partnerName, { color: theme.colors.textSecondary }]}>{campaign.partner.name}</Text>
              </View>
            </View>
            <StatusBadge status={campaign.status} showLabel />
          </View>

          {campaign.description && (
            <Text style={[styles.description, { color: theme.colors.textSecondary }]}>{campaign.description}</Text>
          )}

          {isUrgent && (
            <View style={[styles.urgentBanner, { backgroundColor: theme.colors.errorLight, borderLeftColor: theme.colors.error }]}>
              <Clock size={20} color={theme.colors.error} />
              <Text style={[styles.urgentText, { color: theme.colors.error }]}>
                {daysUntil === 0 ? t.dueToday : t.daysLeft.replace('{days}', daysUntil.toString())}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t.timeline}</Text>
          <View style={[styles.timelineCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.timelineItem}>
              <Text style={[styles.timelineLabel, { color: theme.colors.textSecondary }]}>{t.startDate}</Text>
              <Text style={[styles.timelineValue, { color: theme.colors.text }]}>{formatDate(campaign.createdAt)}</Text>
            </View>
            <View style={[styles.timelineDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.timelineItem}>
              <Text style={[styles.timelineLabel, { color: theme.colors.textSecondary }]}>{t.deadline}</Text>
              <Text style={[styles.timelineValue, { color: theme.colors.text }, isUrgent && { color: theme.colors.error }]}>
                {campaign.deadline ? formatDate(campaign.deadline) : t.noDeadlines}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t.socialMediaPosts}</Text>
            <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }]} onPress={handleAddPost}>
              <Plus size={16} color={theme.colors.primary} />
              <Text style={[styles.addButtonText, { color: theme.colors.primary }]}>{t.addPost}</Text>
            </TouchableOpacity>
          </View>

          {campaign.socialLinks && campaign.socialLinks.length > 0 ? (
            campaign.socialLinks.map((link) => (
              <TouchableOpacity
                key={link.id}
                style={[styles.socialCard, { backgroundColor: theme.colors.surface }]}
                onPress={() => openLink(link.url)}
              >
                <View style={styles.socialHeader}>
                  <View style={styles.socialInfo}>
                    <Text style={[styles.socialPlatform, { color: theme.colors.text }]}>
                      {getPlatformIcon(link.platform)} {getPlatformName(link.platform)}
                    </Text>
                    <Text style={[styles.socialType, { color: theme.colors.textSecondary }]}>{getPostTypeLabel(link.postType)}</Text>
                  </View>
                  <ExternalLink size={16} color={theme.colors.textSecondary} />
                </View>

                {link.description && (
                  <Text style={[styles.socialDescription, { color: theme.colors.textSecondary }]}>{link.description}</Text>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={[styles.emptyState, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderLight }]}>
              <ExternalLink size={48} color={theme.colors.border} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>{t.noPostsYet}</Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>{t.addSocialLinks}</Text>
            </View>
          )}
        </View>

        {/* Campaign Summary Section */}
        <View style={styles.summarySection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t.campaignSummary}</Text>
          <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.summaryHeader}>
              <FileText size={24} color={theme.colors.primary} />
              <View style={styles.summaryInfo}>
                <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>{t.generateReport}</Text>
                <Text style={[styles.summarySubtitle, { color: theme.colors.textSecondary }]}>
                  {t.createSummary} {campaign.partner.company}
                </Text>
              </View>
            </View>
            <View style={styles.summaryActions}>
              <TouchableOpacity style={[styles.previewButton, { backgroundColor: theme.colors.primaryLight }]} onPress={handleGenerateSummary}>
                <Eye size={16} color={theme.colors.primary} />
                <Text style={[styles.previewButtonText, { color: theme.colors.primary }]}>{t.preview} podsumowania</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.shareButton, { backgroundColor: theme.colors.primary }]} onPress={handleShareSummary}>
                <Send size={16} color="white" />
                <Text style={styles.shareButtonText}>{t.shareReport}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {getStatusActions()}
      </ScrollView>

      {/* Add Post Modal */}
      <Modal
        visible={showAddPost}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity
              style={[styles.modalBackButton, { backgroundColor: theme.colors.borderLight }]}
              onPress={() => setShowAddPost(false)}
            >
              <X size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t.addSocialPost}</Text>
            <View style={styles.modalBackButton} />
          </View>

          <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalScrollContent}>
            <View style={[styles.formSection, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t.postUrl} *</Text>
                <View style={[styles.inputContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
                  <LinkIcon size={20} color={theme.colors.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    value={postForm.url}
                    onChangeText={handleUrlChange}
                    placeholder="https://instagram.com/p/example lub link do forum"
                    placeholderTextColor={theme.colors.textTertiary}
                    keyboardType="url"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t.platform}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.platformSelector}>
                  {(['instagram', 'tiktok', 'youtube', 'twitter', 'linkedin', 'other'] as const).map(platform => (
                    <TouchableOpacity
                      key={platform}
                      style={[
                        styles.platformChip,
                        { backgroundColor: theme.colors.borderLight },
                        postForm.platform === platform && { backgroundColor: theme.colors.primary }
                      ]}
                      onPress={() => setPostForm(prev => ({ ...prev, platform }))}
                    >
                      <Text style={styles.platformIcon}>{getPlatformIcon(platform)}</Text>
                      <Text style={[
                        styles.platformChipText,
                        { color: theme.colors.textSecondary },
                        postForm.platform === platform && { color: 'white' }
                      ]}>
                        {getPlatformName(platform)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t.postType}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
                  {(['post', 'story', 'reel', 'video', 'carousel'] as const).map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeChip,
                        { backgroundColor: theme.colors.borderLight },
                        postForm.postType === type && { backgroundColor: theme.colors.primary }
                      ]}
                      onPress={() => setPostForm(prev => ({ ...prev, postType: type }))}
                    >
                      <Text style={[
                        styles.typeChipText,
                        { color: theme.colors.textSecondary },
                        postForm.postType === type && { color: 'white' }
                      ]}>
                        {getPostTypeLabel(type)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t.description} (Opcjonalny)</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text }]}
                  value={postForm.description}
                  onChangeText={(text) => setPostForm(prev => ({ ...prev, description: text }))}
                  placeholder="Krótki opis posta..."
                  placeholderTextColor={theme.colors.textTertiary}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: theme.colors.borderLight }]}
                onPress={() => setShowAddPost(false)}
              >
                <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: theme.colors.primary }, isSubmittingPost && styles.submitButtonDisabled]}
                onPress={handleSubmitPost}
                disabled={isSubmittingPost}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmittingPost ? 'Dodawanie...' : 'Dodaj post'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Summary Preview Modal */}
      <Modal
        visible={showSummaryModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity
              style={[styles.modalBackButton, { backgroundColor: theme.colors.borderLight }]}
              onPress={() => setShowSummaryModal(false)}
            >
              <X size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t.campaignSummary}</Text>
            <TouchableOpacity
              style={[styles.modalShareButton, { backgroundColor: theme.colors.primaryLight }]}
              onPress={handleShareSummary}
            >
              <ShareIcon size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} contentContainerStyle={styles.summaryModalContent}>
            <View style={[styles.summaryPreview, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>{generateSummary()}</Text>
            </View>

            <View style={styles.summaryModalActions}>
              <TouchableOpacity
                style={[styles.summaryShareButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleShareSummary}
              >
                <Send size={16} color="white" />
                <Text style={styles.summaryShareButtonText}>Udostępnij partnerowi</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

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
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      marginBottom: 16,
    },
    backButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    backButtonText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: 'white',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
    },
    headerButton: {
      padding: 8,
      borderRadius: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
    },
    scrollContent: {
      padding: 20,
    },
    campaignHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    titleSection: {
      flex: 1,
      marginRight: 16,
    },
    title: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      marginBottom: 8,
    },
    partnerInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    partnerName: {
      fontSize: 16,
      fontFamily: 'Inter-Medium',
    },
    description: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      lineHeight: 24,
      marginBottom: 20,
    },
    urgentBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      borderLeftWidth: 4,
      gap: 12,
    },
    urgentText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    statsGrid: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 32,
    },
    statCard: {
      flex: 1,
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
    },
    statValue: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      marginTop: 8,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      textAlign: 'center',
    },
    section: {
      marginBottom: 32,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontFamily: 'Inter-SemiBold',
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      gap: 6,
    },
    addButtonText: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
    },
    timelineCard: {
      borderRadius: 16,
      padding: 20,
    },
    timelineItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    timelineDivider: {
      height: 1,
      marginVertical: 8,
    },
    timelineLabel: {
      fontSize: 16,
      fontFamily: 'Inter-Medium',
    },
    timelineValue: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    requirementsCard: {
      borderRadius: 16,
      padding: 20,
    },
    requirementItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 12,
      gap: 12,
    },
    requirementBullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginTop: 8,
    },
    requirementText: {
      flex: 1,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      lineHeight: 22,
    },
    socialCard: {
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
    },
    socialHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    socialInfo: {
      flex: 1,
    },
    socialPlatform: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      marginBottom: 2,
    },
    socialType: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      textTransform: 'capitalize',
    },
    socialDescription: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      marginBottom: 12,
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
    summarySection: {
      marginBottom: 32,
    },
    summaryCard: {
      borderRadius: 16,
      padding: 20,
    },
    summaryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 16,
    },
    summaryInfo: {
      flex: 1,
    },
    summaryTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      marginBottom: 4,
    },
    summarySubtitle: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      lineHeight: 20,
    },
    summaryActions: {
      flexDirection: 'row',
      gap: 12,
    },
    previewButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 8,
      gap: 8,
    },
    previewButtonText: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
    },
    shareButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 8,
      gap: 8,
    },
    shareButtonText: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: 'white',
    },
    actionsSection: {
      marginTop: 20,
      gap: 12,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      gap: 12,
    },
    actionButtonText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: 'white',
    },
    // Modal styles
    modalContainer: {
      flex: 1,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
    },
    modalBackButton: {
      padding: 8,
      borderRadius: 8,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalShareButton: {
      padding: 8,
      borderRadius: 8,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
    },
    modalContent: {
      flex: 1,
    },
    modalScrollContent: {
      padding: 20,
    },
    formSection: {
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
    },
    inputGroup: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      marginBottom: 8,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
    },
    textArea: {
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      height: 80,
      textAlignVertical: 'top',
    },
    platformSelector: {
      marginTop: 8,
    },
    platformChip: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginRight: 8,
      gap: 6,
    },
    platformIcon: {
      fontSize: 16,
    },
    platformChipText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
    },
    typeSelector: {
      marginTop: 8,
    },
    typeChip: {
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginRight: 8,
    },
    typeChipText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    cancelButtonText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    submitButton: {
      flex: 2,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    submitButtonDisabled: {
      opacity: 0.6,
    },
    submitButtonText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: 'white',
    },
    // Summary modal styles
    summaryModalContent: {
      padding: 20,
    },
    summaryPreview: {
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
    },
    summaryText: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      lineHeight: 20,
    },
    summaryModalActions: {
      marginBottom: 20,
    },
    summaryShareButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      borderRadius: 12,
      gap: 12,
    },
    summaryShareButtonText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: 'white',
    },
    statusButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderRadius: 8,
      marginTop: 16,
    },
    statusButtonText: {
      color: 'white',
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
      marginLeft: 8,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      fontFamily: 'Inter_400Regular',
    },
  });
}

export default CampaignDetailsScreen;