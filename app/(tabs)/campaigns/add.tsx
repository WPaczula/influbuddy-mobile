import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useData } from '@/hooks/useData';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import { Partner } from '@/types';
import { ArrowLeft, Calendar, DollarSign, Plus, X, ChevronDown, Building2, Check, Save } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface CampaignForm {
  title: string;
  description: string;
  partnerId: string;
  amount: string;
  startDate: Date;
  deadline: Date;
  requirements: string[];
  collaborationType: 'BARTER' | 'PAID' | 'SPONSORED' | 'GIFTED' | 'EVENT';
}

export default function AddCampaignScreen() {
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const router = useRouter();
  const { partners, addCampaign } = useData();
  
  const [form, setForm] = useState<CampaignForm>({
    title: '',
    description: '',
    partnerId: '',
    amount: '',
    startDate: new Date(),
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 1 week from now
    requirements: [''],
    collaborationType: 'BARTER',
  });
  
  const [showPartnerPicker, setShowPartnerPicker] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const styles = createStyles(theme);

  const selectedPartner = partners.find(p => p.id === form.partnerId);

  const formatDate = (date: Date) => {
    const locale = language === 'pl' ? 'pl-PL' : 'en-US';
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
    if (form.deadline <= form.startDate) {
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
      await addCampaign({
        title: form.title.trim(),
        description: form.description.trim(),
        partnerId: form.partnerId,
        productValue: Number(form.amount.replace(/,/g, '')),
        deadline: form.deadline,
        collaborationType: form.collaborationType,
        status: 'DRAFT',
      });
      
      Alert.alert(
        t.success,
        t.campaignCreated,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert(t.error, t.createCampaignError);
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

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
    }
    if (selectedDate) {
      setForm(prev => ({ ...prev, startDate: selectedDate }));
    }
  };

  const handleDeadlineChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDeadlinePicker(false);
    }
    if (selectedDate) {
      setForm(prev => ({ ...prev, deadline: selectedDate }));
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity style={[styles.headerButton, { backgroundColor: theme.colors.borderLight }]} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t.newCampaign}</Text>
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

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t.collaborationType}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
              {(['BARTER', 'PAID', 'SPONSORED', 'GIFTED', 'EVENT'] as const).map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeChip,
                    { backgroundColor: theme.colors.borderLight },
                    form.collaborationType === type && { backgroundColor: theme.colors.primary }
                  ]}
                  onPress={() => setForm(prev => ({ ...prev, collaborationType: type }))}
                >
                  <Text style={[
                    styles.typeChipText,
                    { color: theme.colors.textSecondary },
                    form.collaborationType === type && { color: 'white' }
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t.timeline}</Text>
          
          {/* Start Date */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t.startDate}</Text>
            <TouchableOpacity
              style={[styles.dateButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Calendar size={20} color={theme.colors.textSecondary} />
              <Text style={[styles.dateText, { color: theme.colors.text }]}>
                {formatDate(form.startDate)}
              </Text>
              <ChevronDown size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Deadline */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t.deadline} *</Text>
            <TouchableOpacity
              style={[styles.dateButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
              onPress={() => setShowDeadlinePicker(true)}
            >
              <Calendar size={20} color={theme.colors.textSecondary} />
              <Text style={[styles.dateText, { color: theme.colors.text }]}>
                {formatDate(form.deadline)}
              </Text>
              <ChevronDown size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Date Pickers */}
          {showStartDatePicker && (
            <DateTimePicker
              value={form.startDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleStartDateChange}
              maximumDate={form.deadline}
            />
          )}

          {showDeadlinePicker && (
            <DateTimePicker
              value={form.deadline}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDeadlineChange}
              minimumDate={form.startDate}
            />
          )}

          {/* iOS Date Picker Done Button */}
          {Platform.OS === 'ios' && (showStartDatePicker || showDeadlinePicker) && (
            <View style={styles.datePickerActions}>
              <TouchableOpacity
                style={[styles.datePickerDone, { backgroundColor: theme.colors.primary }]}
                onPress={() => {
                  setShowStartDatePicker(false);
                  setShowDeadlinePicker(false);
                }}
              >
                <Text style={styles.datePickerDoneText}>{t.done}</Text>
              </TouchableOpacity>
            </View>
          )}
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
                placeholder={`${t.requirementPlaceholder} ${index + 1}`}
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
              {isSubmitting ? t.creating : t.createAccount}
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
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
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
    dateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
    },
    dateText: {
      flex: 1,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
    },
    datePickerActions: {
      alignItems: 'center',
      marginTop: 16,
    },
    datePickerDone: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    datePickerDoneText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: 'white',
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