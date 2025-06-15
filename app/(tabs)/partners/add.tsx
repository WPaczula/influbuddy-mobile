import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import { ArrowLeft, Building2, Mail, Phone, Globe, FileText, User } from 'lucide-react-native';
import { useCreatePartner } from '@/hooks/queries/usePartners';

interface PartnerForm {
  company: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  notes: string;
}

export default function AddPartnerScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const createPartner = useCreatePartner();
  const [form, setForm] = useState<PartnerForm>({
    company: '',
    name: '',
    email: '',
    phone: '',
    website: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const styles = createStyles(theme);

  const validateForm = () => {
    if (!form.company.trim()) {
      Alert.alert(t.error, t.companyRequired);
      return false;
    }
    if (!form.name.trim()) {
      Alert.alert(t.error, t.nameRequired);
      return false;
    }
    if (!form.email.trim()) {
      Alert.alert(t.error, t.emailRequired);
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      Alert.alert(t.error, t.validEmail);
      return false;
    }

    // Website validation if provided
    if (form.website.trim() && !form.website.trim().startsWith('http')) {
      Alert.alert(t.error, t.validWebsite);
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await createPartner.mutateAsync({
        company: form.company.trim(),
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || undefined,
        website: form.website.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });

      router.replace('/(tabs)/partners');
    } catch (error) {
      Alert.alert(t.error, t.addPartnerError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatWebsite = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity style={[styles.headerButton, { backgroundColor: theme.colors.borderLight }]} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t.newPartner}</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.avatarSection, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.border }]}>
            <Building2 size={32} color={theme.colors.primary} />
          </View>
          <Text style={[styles.avatarText, { color: theme.colors.text }]}>{t.partnerAvatar}</Text>
          <Text style={[styles.avatarSubtext, { color: theme.colors.textSecondary }]}>{t.avatarGenerated}</Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t.basicInformation}</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t.companyName} *</Text>
            <View style={[styles.inputContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
              <Building2 size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                value={form.company}
                onChangeText={(text) => setForm(prev => ({ ...prev, company: text }))}
                placeholder="e.g. TechStyle Fashion"
                placeholderTextColor={theme.colors.textTertiary}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t.fullName} *</Text>
            <View style={[styles.inputContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
              <User size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                value={form.name}
                onChangeText={(text) => setForm(prev => ({ ...prev, name: text }))}
                placeholder="e.g. Sarah Johnson"
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
                value={form.email}
                onChangeText={(text) => setForm(prev => ({ ...prev, email: text }))}
                placeholder="sarah@techstyle.com"
                placeholderTextColor={theme.colors.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t.contactDetails}</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t.phoneNumber}</Text>
            <View style={[styles.inputContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
              <Phone size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                value={form.phone}
                onChangeText={(text) => setForm(prev => ({ ...prev, phone: text }))}
                placeholder="+1 555 123 456"
                placeholderTextColor={theme.colors.textTertiary}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t.website}</Text>
            <View style={[styles.inputContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
              <Globe size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                value={form.website}
                onChangeText={(text) => setForm(prev => ({ ...prev, website: formatWebsite(text) }))}
                placeholder="https://company.com"
                placeholderTextColor={theme.colors.textTertiary}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t.additionalNotes}</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t.notes}</Text>
            <View style={[styles.textAreaContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
              <FileText size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={[styles.input, styles.textArea, { color: theme.colors.text }]}
                value={form.notes}
                onChangeText={(text) => setForm(prev => ({ ...prev, notes: text }))}
                placeholder="Add notes about this partner, collaboration history, preferences, etc."
                placeholderTextColor={theme.colors.textTertiary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.cancelButton, { backgroundColor: theme.colors.borderLight }]} onPress={() => router.back()}>
            <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>{t.cancel}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: theme.colors.primary }, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? t.addingPartner : t.addPartner}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            {t.requiredFields}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
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
    avatarSection: {
      borderRadius: 16,
      padding: 24,
      marginBottom: 16,
      alignItems: 'center',
    },
    avatarPlaceholder: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
      borderWidth: 2,
      borderStyle: 'dashed',
    },
    avatarText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      marginBottom: 4,
    },
    avatarSubtext: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      textAlign: 'center',
    },
    section: {
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
    },
    sectionTitle: {
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
    textAreaContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
      marginBottom: 16,
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
    footer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    footerText: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      textAlign: 'center',
      lineHeight: 20,
    },
  });
}