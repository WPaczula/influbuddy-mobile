import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Modal, TextInput, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useData } from '@/hooks/useData';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { useRouter } from 'expo-router';
import { UserProfile } from '@/types';
import { User, Bell, Shield, CircleHelp as HelpCircle, Star, LogOut, ChevronRight, Moon, Globe, Download, CreditCard as Edit, Save, X, Camera, Mail, Link as LinkIcon, Instagram, Youtube, Twitter, Check } from 'lucide-react-native';

interface SettingItem {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  type: 'navigation' | 'toggle' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export default function SettingsScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user, signOut, updateUserProfile } = useAuth();
  const { getDashboardStats } = useData();
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Create styles at the very beginning, before any conditional returns
  const styles = createStyles(theme);

  const stats = getDashboardStats();
  const profile = user?.profile;

  if (!profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>{t.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleEditProfile = () => {
    setEditForm({
      name: profile.name,
      email: profile.email,
      bio: profile.bio || '',
      website: profile.website || '',
      socialHandles: {
        instagram: profile.socialHandles?.instagram || '',
        tiktok: profile.socialHandles?.tiktok || '',
        youtube: profile.socialHandles?.youtube || '',
        twitter: profile.socialHandles?.twitter || '',
        linkedin: profile.socialHandles?.linkedin || '',
      },
    });
    setShowProfileModal(true);
  };

  const validateForm = () => {
    if (!editForm.name?.trim()) {
      Alert.alert(t.error, t.nameRequired);
      return false;
    }
    if (!editForm.email?.trim()) {
      Alert.alert(t.error, t.emailRequired);
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email.trim())) {
      Alert.alert(t.error, t.validEmail);
      return false;
    }

    if (editForm.website && editForm.website.trim() && !editForm.website.trim().startsWith('http')) {
      Alert.alert(t.error, t.validWebsite);
      return false;
    }

    return true;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;

    setIsUpdating(true);
    try {
      await updateUserProfile({
        name: editForm.name?.trim(),
        email: editForm.email?.trim(),
        bio: editForm.bio?.trim() || undefined,
        website: editForm.website?.trim() || undefined,
        socialHandles: {
          instagram: editForm.socialHandles?.instagram?.trim() || undefined,
          tiktok: editForm.socialHandles?.tiktok?.trim() || undefined,
          youtube: editForm.socialHandles?.youtube?.trim() || undefined,
          twitter: editForm.socialHandles?.twitter?.trim() || undefined,
          linkedin: editForm.socialHandles?.linkedin?.trim() || undefined,
        },
      });
      setShowProfileModal(false);
      setEditForm({});
      Alert.alert(t.success, t.profileUpdated);
    } catch (error) {
      Alert.alert(t.error, t.updateProfileError);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSignOut = () => {
    // Skip confirmation alert for web, as it often doesn't work properly in Expo web
    if (Platform.OS === 'web') {
      performSignOut();
    } else {
      // Show confirmation alert for mobile platforms
      Alert.alert(
        t.signOut,
        t.signOutConfirmation,
        [
          { text: t.cancel, style: 'cancel' },
          {
            text: t.signOut,
            style: 'destructive',
            onPress: performSignOut
          }
        ]
      );
    }
  };

  const performSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      // The auth context will handle the navigation automatically
      // But we can also explicitly navigate to ensure it happens
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert(t.error, t.signOutError);
    } finally {
      setIsSigningOut(false);
    }
  };

  const formatWebsite = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  const getLanguageDisplayName = (lang: Language) => {
    return lang === 'en' ? 'English' : 'Polski';
  };

  const settingsData: SettingItem[] = [
    {
      icon: <User size={20} color={theme.colors.textSecondary} />,
      title: t.editProfile,
      subtitle: t.updatePersonalInfo,
      type: 'navigation',
      onPress: handleEditProfile,
    },
    {
      icon: <Bell size={20} color={theme.colors.textSecondary} />,
      title: t.notifications,
      subtitle: t.campaignDeadlinesUpdates,
      type: 'toggle',
      value: notifications,
      onToggle: setNotifications,
    },
    {
      icon: <Moon size={20} color={theme.colors.textSecondary} />,
      title: t.darkMode,
      subtitle: t.switchTheme,
      type: 'toggle',
      value: isDark,
      onToggle: toggleTheme,
    },
    {
      icon: <Globe size={20} color={theme.colors.textSecondary} />,
      title: t.language,
      subtitle: getLanguageDisplayName(language),
      type: 'navigation',
      onPress: () => setShowLanguageModal(true),
    },
    {
      icon: <Download size={20} color={theme.colors.textSecondary} />,
      title: t.exportData,
      subtitle: t.downloadData,
      type: 'navigation',
      onPress: () => console.log('Export pressed'),
    },
    {
      icon: <Shield size={20} color={theme.colors.textSecondary} />,
      title: t.privacySecurity,
      subtitle: t.managePrivacy,
      type: 'navigation',
      onPress: () => console.log('Privacy pressed'),
    },
    {
      icon: <HelpCircle size={20} color={theme.colors.textSecondary} />,
      title: t.helpSupport,
      subtitle: t.getHelp,
      type: 'navigation',
      onPress: () => console.log('Help pressed'),
    },
    {
      icon: <Star size={20} color={theme.colors.textSecondary} />,
      title: t.rateApp,
      subtitle: t.helpImprove,
      type: 'navigation',
      onPress: () => console.log('Rate pressed'),
    },
  ];

  const renderSettingItem = (item: SettingItem, index: number) => {
    return (
      <TouchableOpacity
        key={index}
        style={[styles.settingItem, { borderBottomColor: theme.colors.borderLight }]}
        onPress={item.onPress}
        disabled={item.type === 'toggle'}
        activeOpacity={item.type === 'toggle' ? 1 : 0.7}
      >
        <View style={[styles.settingIcon, { backgroundColor: theme.colors.borderLight }]}>
          {item.icon}
        </View>

        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: theme.colors.text }]}>{item.title}</Text>
          {item.subtitle && (
            <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>{item.subtitle}</Text>
          )}
        </View>

        <View style={styles.settingAction}>
          {item.type === 'toggle' ? (
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary + '40' // 40% opacity for the track
              }}
              thumbColor={item.value ? theme.colors.primary : theme.colors.surface}
              ios_backgroundColor={theme.colors.border}
            />
          ) : (
            <ChevronRight size={20} color={theme.colors.border} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.profileSection, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity style={styles.profileAvatarContainer} onPress={handleEditProfile}>
            <View style={[styles.profileAvatar, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.profileAvatarText}>
                {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </Text>
            </View>
            <View style={[styles.editAvatarBadge, { backgroundColor: theme.colors.primary, borderColor: theme.colors.surface }]}>
              <Camera size={12} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.profileName, { color: theme.colors.text }]}>{profile.name}</Text>
          <Text style={[styles.profileEmail, { color: theme.colors.textSecondary }]}>{profile.email}</Text>
          {profile.bio && (
            <Text style={[styles.profileBio, { color: theme.colors.textSecondary }]}>{profile.bio}</Text>
          )}
          <Text style={[styles.profileStats, { color: theme.colors.primary }]}>
            {stats.activeCampaigns} {t.activeCampaigns.toLowerCase()} • {stats.totalPartners} {t.partners.toLowerCase()} • ${stats.totalEarnings.toLocaleString()} earned
          </Text>
        </View>

        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t.account}</Text>
          <View style={[styles.settingsList, { backgroundColor: theme.colors.surface }]}>
            {settingsData.slice(0, 2).map(renderSettingItem)}
          </View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t.preferences}</Text>
          <View style={[styles.settingsList, { backgroundColor: theme.colors.surface }]}>
            {settingsData.slice(2, 5).map(renderSettingItem)}
          </View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t.support}</Text>
          <View style={[styles.settingsList, { backgroundColor: theme.colors.surface }]}>
            {settingsData.slice(5).map(renderSettingItem)}
          </View>
        </View>

        <View style={styles.settingsSection}>
          <TouchableOpacity
            style={[
              styles.logoutButton,
              {
                backgroundColor: theme.colors.errorLight,
                borderColor: theme.colors.error,
                opacity: isSigningOut ? 0.6 : 1
              }
            ]}
            onPress={handleSignOut}
            disabled={isSigningOut}
            activeOpacity={0.7}
          >
            <LogOut size={20} color={theme.colors.error} />
            <Text style={[styles.logoutText, { color: theme.colors.error }]}>
              {isSigningOut ? t.signingOut : t.signOut}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>{t.version}</Text>
          <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>{t.madeWithLove}</Text>
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.colors.borderLight }]}
              onPress={() => setShowLanguageModal(false)}
            >
              <X size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t.language}</Text>
            <View style={styles.modalButton} />
          </View>

          <View style={styles.languageOptions}>
            <TouchableOpacity
              style={[styles.languageOption, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.borderLight }]}
              onPress={() => {
                setLanguage('en');
                setShowLanguageModal(false);
              }}
            >
              <View style={styles.languageInfo}>
                <Text style={[styles.languageName, { color: theme.colors.text }]}>English</Text>
                <Text style={[styles.languageNative, { color: theme.colors.textSecondary }]}>English</Text>
              </View>
              {language === 'en' && (
                <Check size={20} color={theme.colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.languageOption, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.borderLight }]}
              onPress={() => {
                setLanguage('pl');
                setShowLanguageModal(false);
              }}
            >
              <View style={styles.languageInfo}>
                <Text style={[styles.languageName, { color: theme.colors.text }]}>Polish</Text>
                <Text style={[styles.languageNative, { color: theme.colors.textSecondary }]}>Polski</Text>
              </View>
              {language === 'pl' && (
                <Check size={20} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Profile Edit Modal */}
      <Modal
        visible={showProfileModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.colors.borderLight }]}
              onPress={() => setShowProfileModal(false)}
            >
              <X size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t.editProfile}</Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.colors.borderLight }]}
              onPress={handleSaveProfile}
              disabled={isUpdating}
            >
              <Save size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalScrollContent}>
            <View style={[styles.avatarEditSection, { backgroundColor: theme.colors.surface }]}>
              <View style={[styles.avatarEdit, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.avatarEditText}>
                  {editForm.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'JD'}
                </Text>
              </View>
              <TouchableOpacity style={[styles.changeAvatarButton, { backgroundColor: theme.colors.primaryLight }]}>
                <Camera size={16} color={theme.colors.primary} />
                <Text style={[styles.changeAvatarText, { color: theme.colors.primary }]}>{t.changeAvatar}</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.formSection, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.formSectionTitle, { color: theme.colors.text }]}>{t.basicInformation}</Text>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t.fullName} *</Text>
                <View style={[styles.inputContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
                  <User size={20} color={theme.colors.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    value={editForm.name}
                    onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))}
                    placeholder="Your full name"
                    placeholderTextColor={theme.colors.textTertiary}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t.emailAddress} *</Text>
                <View style={[styles.inputContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
                  <Mail size={20} color={theme.colors.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    value={editForm.email}
                    onChangeText={(text) => setEditForm(prev => ({ ...prev, email: text }))}
                    placeholder="your@email.com"
                    placeholderTextColor={theme.colors.textTertiary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t.bio}</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text }]}
                  value={editForm.bio}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, bio: text }))}
                  placeholder="Tell us about yourself..."
                  placeholderTextColor={theme.colors.textTertiary}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t.website}</Text>
                <View style={[styles.inputContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
                  <LinkIcon size={20} color={theme.colors.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    value={editForm.website}
                    onChangeText={(text) => setEditForm(prev => ({ ...prev, website: formatWebsite(text) }))}
                    placeholder="https://yourwebsite.com"
                    placeholderTextColor={theme.colors.textTertiary}
                    keyboardType="url"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>
            </View>

            <View style={[styles.formSection, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.formSectionTitle, { color: theme.colors.text }]}>{t.socialMediaHandles}</Text>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t.instagram}</Text>
                <View style={[styles.inputContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
                  <Instagram size={20} color={theme.colors.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    value={editForm.socialHandles?.instagram}
                    onChangeText={(text) => setEditForm(prev => ({
                      ...prev,
                      socialHandles: { ...prev.socialHandles, instagram: text }
                    }))}
                    placeholder="@username"
                    placeholderTextColor={theme.colors.textTertiary}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t.tiktok}</Text>
                <View style={[styles.inputContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
                  <Text style={styles.platformIcon}>🎵</Text>
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    value={editForm.socialHandles?.tiktok}
                    onChangeText={(text) => setEditForm(prev => ({
                      ...prev,
                      socialHandles: { ...prev.socialHandles, tiktok: text }
                    }))}
                    placeholder="@username"
                    placeholderTextColor={theme.colors.textTertiary}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t.youtube}</Text>
                <View style={[styles.inputContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
                  <Youtube size={20} color={theme.colors.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    value={editForm.socialHandles?.youtube}
                    onChangeText={(text) => setEditForm(prev => ({
                      ...prev,
                      socialHandles: { ...prev.socialHandles, youtube: text }
                    }))}
                    placeholder="@username"
                    placeholderTextColor={theme.colors.textTertiary}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t.twitter}</Text>
                <View style={[styles.inputContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
                  <Twitter size={20} color={theme.colors.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    value={editForm.socialHandles?.twitter}
                    onChangeText={(text) => setEditForm(prev => ({
                      ...prev,
                      socialHandles: { ...prev.socialHandles, twitter: text }
                    }))}
                    placeholder="@username"
                    placeholderTextColor={theme.colors.textTertiary}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t.linkedin}</Text>
                <View style={[styles.inputContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
                  <Text style={styles.platformIcon}>💼</Text>
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    value={editForm.socialHandles?.linkedin}
                    onChangeText={(text) => setEditForm(prev => ({
                      ...prev,
                      socialHandles: { ...prev.socialHandles, linkedin: text }
                    }))}
                    placeholder="@username"
                    placeholderTextColor={theme.colors.textTertiary}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: theme.colors.borderLight }]}
                onPress={() => setShowProfileModal(false)}
              >
                <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.colors.primary }, isUpdating && styles.saveButtonDisabled]}
                onPress={handleSaveProfile}
                disabled={isUpdating}
              >
                <Text style={styles.saveButtonText}>
                  {isUpdating ? t.saving : t.saveChanges}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
      fontFamily: 'Inter-Medium',
    },
    scrollContent: {
      paddingBottom: 32,
    },
    profileSection: {
      paddingVertical: 32,
      paddingHorizontal: 20,
      alignItems: 'center',
      borderBottomWidth: 1,
    },
    profileAvatarContainer: {
      position: 'relative',
      marginBottom: 16,
    },
    profileAvatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    profileAvatarText: {
      fontSize: 28,
      fontFamily: 'Inter-Bold',
      color: 'white',
    },
    editAvatarBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
    },
    profileName: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      marginBottom: 4,
    },
    profileEmail: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      marginBottom: 8,
    },
    profileBio: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      textAlign: 'center',
      marginBottom: 8,
      maxWidth: 280,
    },
    profileStats: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      textAlign: 'center',
    },
    settingsSection: {
      marginTop: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      paddingHorizontal: 20,
      marginBottom: 12,
    },
    settingsList: {
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
    },
    settingIcon: {
      width: 40,
      height: 40,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    settingContent: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      marginBottom: 2,
    },
    settingSubtitle: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
    },
    settingAction: {
      marginLeft: 16,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      marginHorizontal: 20,
      borderRadius: 12,
      gap: 12,
      borderWidth: 2,
    },
    logoutText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    footer: {
      paddingTop: 32,
      paddingHorizontal: 20,
      alignItems: 'center',
      gap: 8,
    },
    footerText: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      textAlign: 'center',
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
    modalButton: {
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
    languageOptions: {
      flex: 1,
    },
    languageOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
    },
    languageInfo: {
      flex: 1,
    },
    languageName: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      marginBottom: 2,
    },
    languageNative: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
    },
    avatarEditSection: {
      alignItems: 'center',
      borderRadius: 16,
      padding: 24,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    avatarEdit: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    avatarEditText: {
      fontSize: 28,
      fontFamily: 'Inter-Bold',
      color: 'white',
    },
    changeAvatarButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      gap: 8,
    },
    changeAvatarText: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
    },
    formSection: {
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    formSectionTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      marginBottom: 16,
    },
    inputGroup: {
      marginBottom: 16,
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
    platformIcon: {
      fontSize: 20,
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
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
    saveButton: {
      flex: 2,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: 'white',
    },
  });
}