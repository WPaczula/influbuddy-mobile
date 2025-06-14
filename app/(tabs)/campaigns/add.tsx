import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useData } from '@/hooks/useData';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import { ArrowLeft, Calendar, DollarSign, X, ChevronDown, Building2, Check } from 'lucide-react-native';

interface CampaignForm {
  title: string;
  description: string;
  partnerId: string;
  productValue: string;
  deadline: string;
  collaborationType: 'BARTER' | 'PAID' | 'SPONSORED' | 'GIFTED' | 'EVENT';
}

export default function AddCampaignScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const { partners, addCampaign } = useData();
  const [form, setForm] = useState<CampaignForm>({
    title: '',
    description: '',
    partnerId: '',
    productValue: '',
    deadline: '',
    collaborationType: 'BARTER',
  });
  const [showPartnerPicker, setShowPartnerPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const styles = createStyles(theme);

  const selectedPartner = partners.find(p => p.id === form.partnerId);

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  const validateForm = () => {
    if (!form.title.trim()) {
      Alert.alert(t.error, t.validTitle);
      return false;
    }
    if (!form.partnerId) {
      Alert.alert(t.error, t.selectPartner);
      return false;
    }
    if (!form.productValue || isNaN(Number(form.productValue)) || Number(form.productValue) <= 0) {
      Alert.alert(t.error, t.validAmount);
      return false;
    }
    if (!form.deadline) {
      Alert.alert(t.error, t.selectDeadline);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await addCampaign({
        title: form.title.trim(),
        description: form.description.trim(),
        partnerId: form.partnerId,
        productValue: Number(form.productValue),
        deadline: new Date(form.deadline),
        collaborationType: form.collaborationType,
        status: 'DRAFT',
      });
      router.back();
    } catch (error) {
      console.error('Error creating campaign:', error);
      Alert.alert(t.error, t.createCampaignError);
    } finally {
      setLoading(false);
    }
  };

  const handlePartnerSelect = (partner: { id: string; name: string; company: string }) => {
    setForm(prev => ({ ...prev, partnerId: partner.id }));
    setShowPartnerPicker(false);
  };

  const formatCurrency = (value: string) => {
    const number = value.replace(/[^0-9]/g, '');
    return number ? `$${Number(number).toLocaleString()}` : '';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t.newCampaign}</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={[styles.saveButton, { opacity: loading ? 0.5 : 1 }]}
        >
          <Text style={[styles.saveButtonText, { color: theme.colors.primary }]}>
            {loading ? t.saving : t.save}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContent}>
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>{t.campaignTitle}</Text>
          <TextInput
            style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
            value={form.title}
            onChangeText={(text) => setForm(prev => ({ ...prev, title: text }))}
            placeholder={t.enterTitle}
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>{t.description}</Text>
          <TextInput
            style={[styles.textArea, { color: theme.colors.text, borderColor: theme.colors.border }]}
            value={form.description}
            onChangeText={(text) => setForm(prev => ({ ...prev, description: text }))}
            placeholder={t.enterDescription}
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>{t.partner}</Text>
          <TouchableOpacity
            style={[styles.partnerPicker, { borderColor: theme.colors.border }]}
            onPress={() => setShowPartnerPicker(true)}
          >
            <View style={styles.partnerPickerContent}>
              <Building2 size={20} color={theme.colors.textSecondary} />
              <Text style={[styles.partnerPickerText, { color: theme.colors.text }]}>
                {form.partnerId
                  ? partners.find(p => p.id === form.partnerId)?.name
                  : t.selectPartner}
              </Text>
            </View>
            <ChevronDown size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>{t.amount}</Text>
          <View style={[styles.currencyInput, { borderColor: theme.colors.border }]}>
            <DollarSign size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={[styles.currencyField, { color: theme.colors.text }]}
              value={form.productValue}
              onChangeText={(text) => {
                const formatted = formatCurrency(text);
                setForm(prev => ({ ...prev, productValue: formatted }));
              }}
              placeholder="0"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>{t.deadline}</Text>
          <TouchableOpacity
            style={[styles.datePicker, { borderColor: theme.colors.border }]}
            onPress={() => {
              // Show date picker
            }}
          >
            <View style={styles.datePickerContent}>
              <Calendar size={20} color={theme.colors.textSecondary} />
              <Text style={[styles.datePickerText, { color: theme.colors.text }]}>
                {form.deadline || t.selectDeadline}
              </Text>
            </View>
            <ChevronDown size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>{t.collaborationType}</Text>
          <View style={[styles.typePicker, { borderColor: theme.colors.border }]}>
            {(['BARTER', 'PAID', 'SPONSORED', 'GIFTED', 'EVENT'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeOption,
                  form.collaborationType === type && { backgroundColor: theme.colors.primary },
                ]}
                onPress={() => setForm(prev => ({ ...prev, collaborationType: type }))}
              >
                <Text
                  style={[
                    styles.typeOptionText,
                    { color: form.collaborationType === type ? 'white' : theme.colors.text },
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showPartnerPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPartnerPicker(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t.selectPartner}</Text>
              <TouchableOpacity onPress={() => setShowPartnerPicker(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.partnerList}>
              {partners.map((partner) => (
                <TouchableOpacity
                  key={partner.id}
                  style={[styles.partnerItem, { borderBottomColor: theme.colors.border }]}
                  onPress={() => handlePartnerSelect(partner)}
                >
                  <View style={styles.partnerInfo}>
                    <Text style={[styles.partnerName, { color: theme.colors.text }]}>
                      {partner.name}
                    </Text>
                    <Text style={[styles.partnerCompany, { color: theme.colors.textSecondary }]}>
                      {partner.company}
                    </Text>
                  </View>
                  {form.partnerId === partner.id && (
                    <Check size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
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
    backButton: {
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
    formGroup: {
      marginBottom: 16,
    },
    label: {
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
    partnerPicker: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderRadius: 12,
    },
    partnerPickerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    partnerPickerText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
    },
    currencyInput: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 12,
    },
    currencyField: {
      flex: 1,
      paddingHorizontal: 8,
      paddingVertical: 12,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
    },
    datePicker: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderRadius: 12,
    },
    datePickerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    datePickerText: {
      flex: 1,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
    },
    typePicker: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 12,
    },
    typeOption: {
      padding: 12,
    },
    typeOptionText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
    },
    saveButton: {
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 12,
      alignItems: 'center',
    },
    saveButtonText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    modalContainer: {
      flex: 1,
    },
    modalContent: {
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
    partnerList: {
      flex: 1,
    },
    partnerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
    },
    partnerInfo: {
      flex: 1,
      marginLeft: 12,
    },
    partnerName: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    partnerCompany: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
    },
  });
}