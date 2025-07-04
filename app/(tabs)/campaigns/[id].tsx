import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Modal, TextInput, Share, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import { Campaign, SocialLink } from '@/types';
import { ArrowLeft, Calendar, DollarSign, ExternalLink, Building2, CircleCheck as CheckCircle, Clock, CirclePlay as PlayCircle, Pencil, Trash2, Plus, Eye, Heart, MessageCircle, Share as ShareIcon, X, Link as LinkIcon, FileText, Send, Instagram, Youtube, Twitter, Globe } from 'lucide-react-native';
import StatusBadge from '@/components/StatusBadge';
import CampaignDetailsSkeleton from '@/components/CampaignDetailsSkeleton';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { useCampaign, useAddPost, useUpdateCampaign, useRemovePost } from '@/hooks/queries/useCampaigns';
import { usePartners } from '@/hooks/queries/usePartners';
import { useStyledAlert } from '@/hooks/useStyledAlert';

interface AddPostForm {
  url: string;
  postType: 'post' | 'story' | 'reel' | 'video' | 'carousel';
  description: string;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'linkedin' | 'other';
}

const CampaignDetailsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [showAddPost, setShowAddPost] = useState(false);
  const [postForm, setPostForm] = useState<AddPostForm>({
    url: '',
    postType: 'post',
    description: '',
    platform: 'instagram',
  });
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  // Preload partners data
  const { data: partners = [] } = usePartners();

  const { data: campaign, isLoading, error } = useCampaign(id);
  const addPostMutation = useAddPost();
  const updateCampaignMutation = useUpdateCampaign();
  const removePostMutation = useRemovePost();
  const { alert, confirmDestructive } = useStyledAlert();

  const styles = createStyles(theme);

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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
    deadline.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil;
  };

  const getDeadlineStatus = () => {
    if (!campaign?.deadline) return null;

    const daysUntil = getDaysUntilDeadline();

    // Only show urgency for non-completed and non-cancelled campaigns
    if (campaign.status === 'COMPLETED' || campaign.status === 'CANCELLED') {
      return null;
    }

    if (daysUntil < 0) {
      return {
        type: 'overdue',
        color: theme.colors.error,
        backgroundColor: theme.colors.errorLight,
        text: `${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''} overdue`,
        isUrgent: true
      };
    } else if (daysUntil === 0) {
      return {
        type: 'dueToday',
        color: theme.colors.warning,
        backgroundColor: theme.colors.warningLight,
        text: 'Due today',
        isUrgent: true
      };
    } else if (daysUntil <= 3) {
      return {
        type: 'urgent',
        color: theme.colors.warning,
        backgroundColor: theme.colors.warningLight,
        text: `${daysUntil} day${daysUntil !== 1 ? 's' : ''} left`,
        isUrgent: true
      };
    }

    return null;
  };

  const updateStatus = async (newStatus: 'DRAFT' | 'ACTIVE' | 'WAITING_FOR_PAYMENT' | 'COMPLETED' | 'CANCELLED') => {
    if (!campaign) {
      alert(t.error, t.loadingError, 'error');
      return;
    }

    try {
      await updateCampaignMutation.mutateAsync({
        id: campaign.id,
        updates: { status: newStatus }
      });
    } catch (error) {
      console.error('Error updating campaign status:', error);
      alert(t.error, t.updateCampaignError, 'error');
    }
  };

  const openLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening link:', error);
      alert(t.error, t.loadingError, 'error');
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
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.success }]}
            onPress={() => updateStatus(campaign.productValue && campaign.productValue > 0 ? 'WAITING_FOR_PAYMENT' : 'COMPLETED')}
          >
            <Text style={styles.actionButtonText}>{t.markComplete}</Text>
          </TouchableOpacity>
        );
      case 'WAITING_FOR_PAYMENT':
        return (
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.blue }]} onPress={() => updateStatus('COMPLETED')}>
            <Text style={styles.actionButtonText}>{t.markAsPaid}</Text>
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
      alert(t.error, t.validWebsite, 'error');
      return;
    }
    if (!campaign) {
      alert(t.error, t.loadingError, 'error');
      return;
    }
    try {
      await addPostMutation.mutateAsync({
        campaignId: campaign.id,
        postUrl: postForm.url,
        platform: postForm.platform,
        postType: postForm.postType,
        description: postForm.description,
      });
      setPostForm({
        url: '',
        postType: 'post',
        description: '',
        platform: 'instagram',
      });
      setShowAddPost(false);
      alert(t.success, t.postAdded, 'success');
    } catch (error) {
      alert(t.error, t.addPostError, 'error');
    }
  };

  const handleRemovePost = async (postId: string) => {
    if (!campaign) {
      alert(t.error, t.loadingError, 'error');
      return;
    }

    confirmDestructive(
      t.delete,
      t.deletePostConfirm,
      async () => {
        try {
          await removePostMutation.mutateAsync({
            campaignId: campaign.id,
            postId,
          });
          alert(t.success, t.postRemoved, 'success');
        } catch (error) {
          alert(t.error, t.removePostError, 'error');
        }
      }
    );
  };

  const generateSummary = () => {
    if (!campaign || !user) return '';

    const partnerName = campaign.partner.name;
    const campaignName = campaign.title;
    const userName = user.name;

    // Build the summary using the template
    let summary = t.campaignUpdateGreeting.replace('{{partnerName}}', partnerName) + '\n\n';
    summary += t.campaignUpdateIntro.replace('{{campaignName}}', campaignName) + '\n\n';

    // Add social media links if available
    if (campaign.socialLinks && campaign.socialLinks.length > 0) {
      campaign.socialLinks.forEach((link: SocialLink, index: number) => {
        summary += `${index + 1}. ${link.url}\n`;
      });
      summary += '\n';
    } else {
      summary += t.noPostsSharedYet + '\n\n';
    }

    summary += t.campaignUpdateClosing + '\n';
    summary += t.campaignUpdateSignature.replace('{{userName}}', userName);

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
      alert(t.error, 'Failed to share summary', 'error');
    }
  };

  const daysUntil = getDaysUntilDeadline();
  const deadlineStatus = getDeadlineStatus();

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

  if (isLoading) {
    return <CampaignDetailsSkeleton />;
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
          <Pencil size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Campaign Header - Clean layout */}
        <View style={styles.section}>
          <View style={styles.campaignHeader}>
            <View style={styles.titleSection}>
              <Text style={[styles.title, { color: theme.colors.text }]}>{campaign.title}</Text>
              <View style={styles.partnerInfo}>
                <Building2 size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.partnerName, { color: theme.colors.textSecondary }]}>{campaign.partner.name}</Text>
              </View>
            </View>
            <StatusBadge status={campaign.status} />
          </View>

          {campaign.description && (
            <View style={[styles.descriptionCard, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.description, { color: theme.colors.textSecondary }]}>{campaign.description}</Text>
            </View>
          )}

          {campaign.requirements && campaign.requirements.length > 0 && (
            <View style={[styles.requirementsCard, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.requirementsTitle, { color: theme.colors.text }]}>{t.requirements}</Text>
              {campaign.requirements.map((requirement: any, index: number) => (
                <View key={index} style={styles.requirementItem}>
                  <View style={[styles.requirementBullet, { backgroundColor: theme.colors.primary }]} />
                  <Text style={[styles.requirementText, { color: theme.colors.textSecondary }]}>
                    {typeof requirement === 'string' ? requirement : requirement.text}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {deadlineStatus && (
            <View style={[
              styles.urgentBanner,
              {
                backgroundColor: deadlineStatus.backgroundColor,
                borderLeftColor: deadlineStatus.color
              }
            ]}>
              <Clock size={20} color={deadlineStatus.color} />
              <Text style={[styles.urgentText, { color: deadlineStatus.color }]}>
                {deadlineStatus.text}
              </Text>
            </View>
          )}
        </View>

        {/* Vertical Timeline */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t.timeline}</Text>
          <View style={[styles.timelineContainer, { backgroundColor: theme.colors.surface }]}>

            {/* Start Date */}
            <View style={styles.timelineStep}>
              <View style={styles.timelineStepLeft}>
                <View style={[styles.timelineIcon, { backgroundColor: theme.colors.primary }]}>
                  <PlayCircle size={16} color="white" />
                </View>
                <View style={[styles.timelineLine, { backgroundColor: theme.colors.border }]} />
              </View>
              <View style={styles.timelineStepRight}>
                <Text style={[styles.timelineStepTitle, { color: theme.colors.text }]}>{t.startDate}</Text>
                <Text style={[styles.timelineStepValue, { color: theme.colors.textSecondary }]}>
                  {formatDate(campaign.createdAt)}
                </Text>
              </View>
            </View>

            {/* Deadline */}
            <View style={[styles.timelineStep, styles.timelineStepLast]}>
              <View style={styles.timelineStepLeft}>
                <View style={[
                  styles.timelineIcon,
                  { backgroundColor: deadlineStatus ? deadlineStatus.color : theme.colors.warning }
                ]}>
                  <Calendar size={16} color="white" />
                </View>
                {campaign.productValue ? <View style={[styles.timelineLine, { backgroundColor: theme.colors.border }]} /> : null}
              </View>
              <View style={styles.timelineStepRight}>
                <Text style={[styles.timelineStepTitle, { color: theme.colors.text }]}>{t.deadline}</Text>
                <Text style={[
                  styles.timelineStepValue,
                  { color: deadlineStatus ? deadlineStatus.color : theme.colors.textSecondary }
                ]}>
                  {campaign.deadline ? formatDate(campaign.deadline) : t.noDeadlines}
                </Text>
                {deadlineStatus && (
                  <Text style={[styles.timelineStepSubtext, { color: deadlineStatus.color }]}>
                    {deadlineStatus.text}
                  </Text>
                )}
              </View>
            </View>

            {/* Campaign Value */}
            {campaign.productValue && (
              <View style={styles.timelineStep}>
                <View style={styles.timelineStepLeft}>
                  <View style={[styles.timelineIcon, { backgroundColor: theme.colors.success }]}>
                    <DollarSign size={16} color="white" />
                  </View>
                </View>
                <View style={styles.timelineStepRight}>
                  <Text style={[styles.timelineStepTitle, { color: theme.colors.text }]}>
                    {campaign.status === 'COMPLETED' ? t.earnings : t.campaignValue}
                  </Text>
                  <Text style={[styles.timelineStepValue, { color: campaign.status === 'WAITING_FOR_PAYMENT' ? theme.colors.blue : theme.colors.success }]}>
                    {formatCurrency(campaign.productValue)}
                  </Text>
                  {campaign.status === 'WAITING_FOR_PAYMENT' && (
                    <Text style={[styles.timelineStepSubtext, { color: theme.colors.blue }]}>
                      {t.waitingForPayment}
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Social Media Posts - Enhanced Section */}
        <View style={styles.section}>
          <View style={styles.socialMediaHeader}>
            <View style={styles.socialMediaTitleSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t.socialMediaPosts}</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                {campaign.socialLinks && campaign.socialLinks.length > 0
                  ? `${campaign.socialLinks.length} post${campaign.socialLinks.length !== 1 ? 's' : ''} shared`
                  : 'No posts shared yet'
                }
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.addPostButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleAddPost}
            >
              <Plus size={18} color="white" />
              <Text style={styles.addPostButtonText}>{t.addPost}</Text>
            </TouchableOpacity>
          </View>

          {campaign.socialLinks && campaign.socialLinks.length > 0 ? (
            <View style={styles.socialPostsList}>
              {campaign.socialLinks.map((link, index) => (
                <View
                  key={link.id}
                  style={[styles.socialPostCard, { backgroundColor: theme.colors.surface }]}
                >
                  <View style={styles.socialPostHeader}>
                    <View style={styles.socialPostInfo}>
                      <View style={styles.socialPostPlatform}>
                        {getPlatformIcon(link.platform)}
                        <Text style={[styles.socialPlatformText, { color: theme.colors.text }]}>
                          {getPlatformName(link.platform)}
                        </Text>
                      </View>
                      <View style={[styles.socialPostTypeBadge, { backgroundColor: theme.colors.borderLight }]}>
                        <Text style={[styles.socialPostTypeText, { color: theme.colors.textSecondary }]}>
                          {getPostTypeLabel(link.postType)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.socialPostActions}>
                      <TouchableOpacity
                        style={[styles.socialPostAction, { backgroundColor: theme.colors.borderLight }]}
                        onPress={() => openLink(link.url)}
                      >
                        <ExternalLink size={16} color={theme.colors.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.socialPostAction, { backgroundColor: theme.colors.errorLight }]}
                        onPress={() => handleRemovePost(link.id)}
                      >
                        <Trash2 size={16} color={theme.colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {link.description && (
                    <View style={styles.socialPostDescription}>
                      <Text style={[styles.socialDescriptionText, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                        {link.description}
                      </Text>
                    </View>
                  )}

                  <View style={styles.socialPostFooter}>
                    <Text style={[styles.socialPostUrl, { color: theme.colors.primary }]} numberOfLines={1}>
                      {link.url}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={[styles.socialEmptyState, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderLight }]}>
              <View style={[styles.socialEmptyIcon, { backgroundColor: theme.colors.borderLight }]}>
                <ExternalLink size={32} color={theme.colors.border} />
              </View>
              <Text style={[styles.socialEmptyTitle, { color: theme.colors.text }]}>{t.noPostsYet}</Text>
              <Text style={[styles.socialEmptyText, { color: theme.colors.textSecondary }]}>
                {t.addSocialLinks}
              </Text>
              <TouchableOpacity
                style={[styles.socialEmptyButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleAddPost}
              >
                <Plus size={16} color="white" />
                <Text style={styles.socialEmptyButtonText}>Add First Post</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Enhanced Campaign Summary Section */}
        <View style={styles.summarySection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t.campaignSummary}</Text>

          {/* Main Summary Card */}
          <View style={[styles.summaryMainCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.summaryHeader}>
              <View style={[styles.summaryIconContainer, { backgroundColor: theme.colors.primaryLight }]}>
                <FileText size={28} color={theme.colors.primary} />
              </View>
              <View style={styles.summaryHeaderText}>
                <Text style={[styles.summaryMainTitle, { color: theme.colors.text }]}>{t.generateCampaignReport}</Text>
                <Text style={[styles.summaryMainSubtitle, { color: theme.colors.textSecondary }]}>
                  {t.createProfessionalSummary} {campaign.partner.company}
                </Text>
              </View>
            </View>

            {/* Summary Features */}
            <View style={styles.summaryFeatures}>
              <View style={styles.summaryFeature}>
                <View style={[styles.featureIcon, { backgroundColor: theme.colors.successLight }]}>
                  <CheckCircle size={16} color={theme.colors.success} />
                </View>
                <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>{t.campaignTimelineStatus}</Text>
              </View>
              <View style={styles.summaryFeature}>
                <View style={[styles.featureIcon, { backgroundColor: theme.colors.blueLight }]}>
                  <Building2 size={16} color={theme.colors.blue} />
                </View>
                <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>{t.partnerInformation}</Text>
              </View>
              <View style={styles.summaryFeature}>
                <View style={[styles.featureIcon, { backgroundColor: theme.colors.orangeLight }]}>
                  <ExternalLink size={16} color={theme.colors.orange} />
                </View>
                <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>{t.socialMediaLinks}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.summaryMainActions}>
              <TouchableOpacity
                style={[styles.previewButton, { backgroundColor: theme.colors.borderLight }]}
                onPress={handleGenerateSummary}
              >
                <Eye size={18} color={theme.colors.textSecondary} />
                <Text style={[styles.previewButtonText, { color: theme.colors.textSecondary }]}>{t.previewReport}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.shareMainButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleShareSummary}
              >
                <Send size={18} color="white" />
                <Text style={styles.shareMainButtonText}>{t.shareReport}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Action Button */}
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
                style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleSubmitPost}
              >
                <Text style={styles.submitButtonText}>Dodaj post</Text>
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
                <Text style={styles.summaryShareButtonText}>Share with Partner</Text>
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
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
    },
    scrollContent: {
      padding: 20,
    },
    section: {
      marginBottom: 24,
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
      lineHeight: 30,
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
    descriptionCard: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    description: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      lineHeight: 24,
    },
    requirementsCard: {
      borderRadius: 12,
      padding: 16,
      marginTop: 16,
    },
    requirementsTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 12,
    },
    requirementItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    requirementBullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginTop: 6,
      marginRight: 8,
    },
    requirementText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
    },
    urgentBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      padding: 16,
      borderLeftWidth: 4,
      gap: 12,
    },
    urgentText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    sectionTitle: {
      fontSize: 20,
      fontFamily: 'Inter-SemiBold',
      marginBottom: 16,
    },
    sectionSubtitle: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      marginTop: 2,
    },

    // Vertical Timeline Styles
    timelineContainer: {
      borderRadius: 16,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    timelineStep: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      minHeight: 60,
    },
    timelineStepLast: {
      minHeight: 'auto',
    },
    timelineStepLeft: {
      alignItems: 'center',
      marginRight: 16,
      width: 32,
    },
    timelineIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    timelineLine: {
      width: 2,
      flex: 1,
      minHeight: 20,
    },
    timelineStepRight: {
      flex: 1,
      paddingTop: 4,
    },
    timelineStepTitle: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    timelineStepValue: {
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      lineHeight: 20,
    },
    timelineStepSubtext: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      marginTop: 2,
    },

    // Enhanced Social Media Posts Styles
    socialMediaHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 20,
    },
    socialMediaTitleSection: {
      flex: 1,
    },
    addPostButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      gap: 8,
    },
    addPostButtonText: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: 'white',
    },
    socialPostsList: {
      gap: 12,
    },
    socialPostCard: {
      borderRadius: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    socialPostHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    socialPostInfo: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    socialPostPlatform: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    socialPlatformText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    socialPostTypeBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    socialPostTypeText: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      textTransform: 'capitalize',
    },
    socialPostActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    socialPostAction: {
      padding: 8,
      borderRadius: 8,
    },
    socialPostDescription: {
      marginBottom: 12,
    },
    socialDescriptionText: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      lineHeight: 20,
    },
    socialPostFooter: {
      borderTopWidth: 1,
      borderTopColor: 'rgba(0,0,0,0.05)',
      paddingTop: 12,
    },
    socialPostUrl: {
      fontSize: 13,
      fontFamily: 'Inter-Medium',
    },
    socialEmptyState: {
      borderRadius: 16,
      padding: 32,
      alignItems: 'center',
      borderWidth: 2,
      borderStyle: 'dashed',
    },
    socialEmptyIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    socialEmptyTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      marginBottom: 8,
    },
    socialEmptyText: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      textAlign: 'center',
      marginBottom: 20,
      maxWidth: 240,
    },
    socialEmptyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      gap: 8,
    },
    socialEmptyButtonText: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: 'white',
    },

    // Enhanced Summary Section Styles
    summarySection: {
      marginBottom: 32,
    },
    summaryMainCard: {
      borderRadius: 20,
      padding: 24,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 6,
    },
    summaryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    summaryIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    summaryHeaderText: {
      flex: 1,
    },
    summaryMainTitle: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      marginBottom: 4,
      lineHeight: 24,
    },
    summaryMainSubtitle: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      lineHeight: 20,
    },
    summaryFeatures: {
      marginBottom: 24,
      gap: 12,
    },
    summaryFeature: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    featureIcon: {
      width: 32,
      height: 32,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    featureText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      flex: 1,
    },
    summaryMainActions: {
      flexDirection: 'column',
      gap: 8,
    },
    previewButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 12,
      gap: 8,
    },
    previewButtonText: {
      fontSize: 15,
      fontFamily: 'Inter-SemiBold',
    },
    shareMainButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 12,
      gap: 8,
    },
    shareMainButtonText: {
      fontSize: 15,
      fontFamily: 'Inter-SemiBold',
      color: 'white',
    },

    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      gap: 12,
      marginTop: 8,
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
  });
}

export default CampaignDetailsScreen;