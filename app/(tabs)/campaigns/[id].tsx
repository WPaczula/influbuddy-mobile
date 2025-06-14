import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, Modal, TextInput, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { Campaign } from '@/types';
import { ArrowLeft, Calendar, DollarSign, ExternalLink, Building2, CircleCheck as CheckCircle, Clock, CirclePlay as PlayCircle, Pencil, Trash2, Plus, Eye, Heart, MessageCircle, Share as ShareIcon, X, Link as LinkIcon, FileText, Send, Instagram, Youtube, Twitter, Globe } from 'lucide-react-native';
import { campaignsService } from '@/services/campaigns';
import StatusBadge from '@/components/StatusBadge';
import CampaignDetailsSkeleton from '@/components/CampaignDetailsSkeleton';
import { useAuth } from '@/contexts/FirebaseAuthContext';

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
    if (!campaign || !user) return '';

    const partnerName = campaign.partner.name;
    const campaignName = campaign.title;
    const userName = user.name;

    // Build the summary using the template
    let summary = t.campaignUpdateGreeting.replace('{{partnerName}}', partnerName) + '\n\n';
    summary += t.campaignUpdateIntro.replace('{{campaignName}}', campaignName) + '\n\n';

    // Add social media links if available
    if (campaign.socialLinks && campaign.socialLinks.length > 0) {
      campaign.socialLinks.forEach((link, index) => {
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

          {isUrgent && (
            <View style={[styles.urgentBanner, { backgroundColor: theme.colors.errorLight, borderLeftColor: theme.colors.error }]}>
              <Clock size={20} color={theme.colors.error} />
              <Text style={[styles.urgentText, { color: theme.colors.error }]}>
                {daysUntil === 0 ? t.dueToday : t.daysLeft.replace('{days}', daysUntil.toString())}
              </Text>
            </View>
          )}
        </View>

        {/* Vertical Timeline */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t.timeline}</Text>
          <View style={[styles.timelineContainer, { backgroundColor: theme.colors.surface }]}>
            
            {/* Campaign Value */}
            {campaign.productValue && (
              <View style={styles.timelineStep}>
                <View style={styles.timelineStepLeft}>
                  <View style={[styles.timelineIcon, { backgroundColor: theme.colors.success }]}>
                    <DollarSign size={16} color="white" />
                  </View>
                  <View style={[styles.timelineLine, { backgroundColor: theme.colors.border }]} />
                </View>
                <View style={styles.timelineStepRight}>
                  <Text style={[styles.timelineStepTitle, { color: theme.colors.text }]}>{t.campaignValue}</Text>
                  <Text style={[styles.timelineStepValue, { color: theme.colors.success }]}>
                    {formatCurrency(campaign.productValue)}
                  </Text>
                </View>
              </View>
            )}

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
                  { backgroundColor: isUrgent ? theme.colors.error : theme.colors.warning }
                ]}>
                  <Calendar size={16} color="white" />
                </View>
              </View>
              <View style={styles.timelineStepRight}>
                <Text style={[styles.timelineStepTitle, { color: theme.colors.text }]}>{t.deadline}</Text>
                <Text style={[
                  styles.timelineStepValue, 
                  { color: isUrgent ? theme.colors.error : theme.colors.textSecondary }
                ]}>
                  {campaign.deadline ? formatDate(campaign.deadline) : t.noDeadlines}
                </Text>
                {isUrgent && (
                  <Text style={[styles.timelineStepSubtext, { color: theme.colors.error }]}>
                    {daysUntil === 0 ? 'Due today!' : `${daysUntil} days left`}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Social Media Posts */}
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
                <Text style={[styles.summaryMainTitle, { color: theme.colors.text }]}>Generate Campaign Report</Text>
                <Text style={[styles.summaryMainSubtitle, { color: theme.colors.textSecondary }]}>
                  Create a professional summary to share with {campaign.partner.company}
                </Text>
              </View>
            </View>

            {/* Summary Features */}
            <View style={styles.summaryFeatures}>
              <View style={styles.summaryFeature}>
                <View style={[styles.featureIcon, { backgroundColor: theme.colors.successLight }]}>
                  <CheckCircle size={16} color={theme.colors.success} />
                </View>
                <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>Campaign timeline & status</Text>
              </View>
              <View style={styles.summaryFeature}>
                <View style={[styles.featureIcon, { backgroundColor: theme.colors.blueLight }]}>
                  <Building2 size={16} color={theme.colors.blue} />
                </View>
                <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>Partner information</Text>
              </View>
              <View style={styles.summaryFeature}>
                <View style={[styles.featureIcon, { backgroundColor: theme.colors.orangeLight }]}>
                  <ExternalLink size={16} color={theme.colors.orange} />
                </View>
                <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>Social media links</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.summaryMainActions}>
              <TouchableOpacity 
                style={[styles.previewButton, { backgroundColor: theme.colors.borderLight }]} 
                onPress={handleGenerateSummary}
              >
                <Eye size={18} color={theme.colors.textSecondary} />
                <Text style={[styles.previewButtonText, { color: theme.colors.textSecondary }]}>Preview Report</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.shareMainButton, { backgroundColor: theme.colors.primary }]} 
                onPress={handleShareSummary}
              >
                <Send size={18} color="white" />
                <Text style={styles.shareMainButtonText}>Share Report</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={[styles.quickAction, { backgroundColor: theme.colors.surface }]}>
              <ShareIcon size={20} color={theme.colors.primary} />
              <Text style={[styles.quickActionText, { color: theme.colors.text }]}>Quick Share</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.quickAction, { backgroundColor: theme.colors.surface }]}>
              <FileText size={20} color={theme.colors.primary} />
              <Text style={[styles.quickActionText, { color: theme.colors.text }]}>Export PDF</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.quickAction, { backgroundColor: theme.colors.surface }]}>
              <Send size={20} color={theme.colors.primary} />
              <Text style={[styles.quickActionText, { color: theme.colors.text }]}>Email Report</Text>
            </TouchableOpacity>
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
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
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
      flexDirection: 'row',
      gap: 12,
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
    quickActions: {
      flexDirection: 'row',
      gap: 12,
    },
    quickAction: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 12,
      borderRadius: 12,
      gap: 8,
    },
    quickActionText: {
      fontSize: 12,
      fontFamily: 'Inter-SemiBold',
      textAlign: 'center',
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
  });
}

export default CampaignDetailsScreen;