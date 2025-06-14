import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useData } from '@/hooks/useData';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { Partner } from '@/types';
import { ArrowLeft, Calendar, DollarSign, Plus, X, ChevronDown, Building2, Check, Save } from 'lucide-react-native';

interface CampaignForm {
  title: string;
  description: string;
  partnerId: string;
  amount: string;
  startDate: string;
  deadline: string;
  requirements: string[];
}

export default function EditCampaignScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { partners, campaigns, updateCampaign } = useData();
  
  const campaign = campaigns.find(c => c.id === id);
  
  const [form, setForm] = useState<CampaignForm>({
    title: '',
    description: '',
    partnerId: '',
    amount: '',
    startDate: '',
    deadline: '',
    requirements: [''],
  });
  
  const [showPartnerPicker, setShowPartnerPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const styles = createStyles(theme);

  // Populate form when campaign data is available
  useEffect(() => {
    if (campaign && !isLoaded) {
      setForm({
        title: campaign.title || '',
        description: campaign.description || '',
        partnerId: campaign.partnerId || '',
        amount: campaign.amount?.toString() || '',
        startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : '',
        deadline: campaign.deadline ? new Date(campaign.deadline).toISOString().split('T')[0] : '',
        requirements: campaign.requirements && campaign.requirements.length > 0 ? campaign.requirements : [''],
      });
      setIsLoaded(true);
    }
  }, [campaign, isLoaded]);

  if (!campaign) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>Campaign not found</Text>
          <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.colors.primary }]} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Show loading state until form is populated
  if (!isLoaded) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>{t.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const selectedPartner = partners.find(p => p.id === form.partnerId);

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  const validateForm = () => {
    if (!form.title.trim()) {
      Alert.alert(t.error, t.titleRequired);
      return false;
    }
    if (!form.description.trim()) {
      Alert.alert(t.error, t.descriptionRequired);
      return false;
    }
    if (!form.partnerId) {
      Alert.alert(t.error, t.selectPartnerRequired);
      return false;
    }
    if (!form.amount || isNaN(Number(form.amount.replace(/,/g, ''))) || Number(form.amount.replace(/,/g, '')) <= 0) {
      Alert.alert(t.error, t.validAmount);
      return false;
    }
    if (!form.deadline) {
      Alert.alert(t.error, t.deadlineRequired);
      return false;
    }
    if (new Date(form.deadline) <= new Date(form.startDate)) {
      Alert.alert(t.error, t.deadlineAfterStart);
      return false;
    }
    if (form.requirements.filter(req => req.trim()).length === 0) {
      Alert.alert(t.error, t.oneRequirement);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await updateCampaign(campaign.id, {
        title: form.title.trim(),
        description: form.description.trim(),
        partnerId: form.partnerId,
        amount: Number(form.amount.replace(/,/g, '')),
        startDate: new Date(form.startDate).toISOString(),
        deadline: new Date(form.deadline).toISOString(),
        requirements: form.requirements.filter(req => req.trim()),
      });
      
      Alert.alert(
        t.success,
        'Campaign updated successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert(t.error, 'Failed to update campaign. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addRequirement = () => {
    setForm(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    setForm(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === index ? value : req)
    }));
  };

  const removeRequirement = (index: number) => {
    if (form.requirements.length > 1) {
      setForm(prev => ({
        ...prev,
        requirements: prev.requirements.filter((_, i) => i !== index)
      }));
    }
  };

  const formatCurrency = (amount: string) => {
    const num = Number(amount.replace(/[^0-9]/g, ''));
    if (isNaN(num)) return '';
    return num.toLocaleString();
  };

  const handleAmountChange = (text: string) => {
    const formatted = formatCurrency(text);
    setForm(prev => ({ ...prev, amount: formatted }));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity style={[styles.headerButton, { backgroundColor: theme.colors.borderLight }]} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Edit Campaign</Text>
        <TouchableOpacity 
          style={[styles.headerButton, { backgroundColor: theme.colors.primary }]} 
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Save size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Campaign Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t.campaignTitle} *</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text }]}
              value={form.title}
              onChangeText={(text) => setForm(prev => ({ ...prev, title: text }))}
              placeholder="e.g. Summer Fashion Collection"
              placeholderTextColor={theme.colors.textTertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t.description} *</Text>
            <TextInput
              style={[styles.input, styles.textArea, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text }]}
              value={form.description}
              onChangeText={(text) => setForm(prev => ({ ...prev, description: text }))}
              placeholder="Describe what this campaign involves..."
              placeholderTextColor={theme.colors.textTertiary}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Partner *</Text>
            <TouchableOpacity
              style={[styles.input, styles.pickerButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
              onPress={() => setShowPartnerPicker(true)}
            >
              {selectedPartner ? (
                <View style={styles.selectedPartner}>
                  <View style={[styles.partnerAvatar, { backgroundColor: theme.colors.primary }]}>
                    <Text style={styles.partnerAvatarText}>
                      {selectedPartner.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.partnerInfo}>
                    <Text style={[styles.partnerName, { color: theme.colors.text }]}>{selectedPartner.name}</Text>
                    <Text style={[styles.partnerCompany, { color: theme.colors.textSecondary }]}>{selectedPartner.company}</Text>
                  </View>
                </View>
              ) : (
                <Text style={[styles.placeholderText, { color: theme.colors.textTertiary }]}>{t.selectPartner}</Text>
              )}
              <ChevronDown size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t.campaignValue} *</Text>
            <View style={[styles.currencyInput, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.currencySymbol, { color: theme.colors.textSecondary }]}>$</Text>
              <TextInput
                style={[styles.currencyField, { color: theme.colors.text }]}
                value={form.amount}
                onChangeText={handleAmountChange}
                placeholder="0"
                placeholderTextColor={theme.colors.textTertiary}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t.timeline}</Text>
          
          <View style={styles.dateRow}>
            <View style={styles.dateInput}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t.startDate}</Text>
              <View style={[styles.dateField, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
                <Calendar size={16} color={theme.colors.textSecondary} />
                <TextInput
                  style={[styles.dateText, { color: theme.colors.text }]}
                  value={form.startDate}
                  onChangeText={(text) => setForm(prev => ({ ...prev, startDate: text }))}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.colors.textTertiary}
                />
              </View>
            </View>
            
            <View style={styles.dateInput}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t.deadline} *</Text>
              <View style={[styles.dateField, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
                <Calendar size={16} color={theme.colors.textSecondary} />
                <TextInput
                  style={[styles.dateText, { color: theme.colors.text }]}
                  value={form.deadline}
                  onChangeText={(text) => setForm(prev => ({ ...prev, deadline: text }))}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.colors.textTertiary}
                />
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.requirementsHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t.requirements}</Text>
            <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.colors.primaryLight }]} onPress={addRequirement}>
              <Plus size={16} color={theme.colors.primary} />
              <Text style={[styles.addButtonText, { color: theme.colors.primary }]}>{t.addRequirement}</Text>
            </TouchableOpacity>
          </View>
          
          {form.requirements.map((requirement, index) => (
            <View key={index} style={styles.requirementRow}>
              <TextInput
                style={[styles.input, styles.requirementInput, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text }]}
                value={requirement}
                onChangeText={(text) => updateRequirement(index, text)}
                placeholder={`Requirement ${index + 1}`}
                placeholderTextColor={theme.colors.textTertiary}
              />
              {form.requirements.length > 1 && (
                <TouchableOpacity
                  style={[styles.removeButton, { backgroundColor: theme.colors.errorLight }]}
                  onPress={() => removeRequirement(index)}
                >
                  <X size={16} color={theme.colors.error} />
                </TouchableOpacity>
              )}
            </View>
          ))}
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
              {isSubmitting ? t.updating : 'Update Campaign'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showPartnerPicker}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Select Partner</Text>
            <TouchableOpacity
              style={[styles.modalCloseButton, { backgroundColor: theme.colors.borderLight }]}
              onPress={() => setShowPartnerPicker(false)}
            >
              <X size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.partnersList}>
            {partners.map(partner => (
              <TouchableOpacity
                key={partner.id}
                style={[styles.partnerOption, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.borderLight }]}
                onPress={() => {
                  setForm(prev => ({ ...prev, partnerId: partner.id }));
                  setShowPartnerPicker(false);
                }}
              >
                <View style={[styles.partnerAvatar, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.partnerAvatarText}>
                    {partner.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </Text>
                </View>
                <View style={styles.partnerDetails}>
                  <Text style={[styles.partnerName, { color: theme.colors.text }]}>{partner.name}</Text>
                  <View style={styles.partnerCompanyRow}>
                    <Building2 size={14} color={theme.colors.textSecondary} />
                    <Text style={[styles.partnerCompany, { color: theme.colors.textSecondary }]}>{partner.company}</Text>
                  </View>
                </View>
                {form.partnerId === partner.id && (
                  <Check size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
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
      marginBottom: 6,
    },
    input: {
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    pickerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    selectedPartner: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    partnerAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    partnerAvatarText: {
      fontSize: 12,
      fontFamily: 'Inter-SemiBold',
      color: 'white',
    },
    partnerInfo: {
      flex: 1,
    },
    partnerName: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    partnerCompany: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
    },
    placeholderText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
    },
    currencyInput: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 12,
    },
    currencySymbol: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      paddingLeft: 16,
    },
    currencyField: {
      flex: 1,
      paddingHorizontal: 8,
      paddingVertical: 12,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
    },
    dateRow: {
      flexDirection: 'row',
      gap: 12,
    },
    dateInput: {
      flex: 1,
    },
    dateField: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 8,
    },
    dateText: {
      flex: 1,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
    },
    requirementsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      gap: 6,
    },
    addButtonText: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
    },
    requirementRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 8,
    },
    requirementInput: {
      flex: 1,
      marginBottom: 0,
    },
    removeButton: {
      padding: 8,
      borderRadius: 8,
    },
    actions: {
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
    modalTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
    },
    modalCloseButton: {
      padding: 8,
      borderRadius: 8,
    },
    partnersList: {
      flex: 1,
    },
    partnerOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
    },
    partnerDetails: {
      flex: 1,
      marginLeft: 12,
    },
    partnerCompanyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 2,
    },
  });
}