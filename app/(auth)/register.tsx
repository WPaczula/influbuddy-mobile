import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft, ArrowRight, Building2 } from 'lucide-react-native';

export default function RegisterScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { signUp } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const styles = createStyles(theme);

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert(t.error, t.nameRequired);
      return false;
    }

    if (!formData.email.trim()) {
      Alert.alert(t.error, t.emailRequired);
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      Alert.alert(t.error, t.validEmail);
      return false;
    }

    if (!formData.password.trim()) {
      Alert.alert(t.error, t.passwordRequired);
      return false;
    }

    if (formData.password.length < 6) {
      Alert.alert(t.error, t.passwordMinLength);
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert(t.error, t.passwordsDoNotMatch);
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await signUp(formData.email.trim(), formData.password, formData.name.trim());
      // Navigation will be handled by the auth context
    } catch (error) {
      console.error('Registration error:', error);

      // Extract specific error message
      let errorMessage = t.registerError; // Default generic message

      if (error instanceof Error) {
        // Handle specific backend errors
        if (error.message.includes('email already exists') || error.message.includes('already registered')) {
          errorMessage = 'This email is already registered. Please use a different email or try logging in.';
        } else if (error.message.includes('Password must contain')) {
          errorMessage = 'Password must contain at least one uppercase letter, one lowercase letter, and one number or special character.';
        } else if (error.message.includes('Password must be at least')) {
          errorMessage = 'Password must be at least 8 characters long.';
        } else if (error.message.includes('valid email')) {
          errorMessage = 'Please provide a valid email address.';
        } else if (error.message.includes('Network request failed') || error.message.includes('Network error')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('Authentication required') || error.message.includes('Unauthorized')) {
          errorMessage = 'Server configuration error. Please try again later.';
        } else if (error.message.trim() !== '') {
          // Use the specific error message from the server
          errorMessage = error.message;
        }
      }

      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
            <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.colors.borderLight }]} onPress={handleBackToLogin}>
              <ArrowLeft size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t.createAccount}</Text>
            <View style={styles.backButton} />
          </View>

          {/* Welcome Section */}
          <LinearGradient
            colors={['#D6BCFA', '#B794F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.welcomeGradient}
          >
            <View style={styles.welcomeSection}>
              <View style={styles.welcomeIconContainer}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.welcomeIconBackground}
                >
                  <Building2 size={28} color="white" />
                </LinearGradient>
              </View>
              <Text style={styles.welcomeTitle}>{t.joinInfluencers}</Text>
              <Text style={styles.welcomeSubtitle}>{t.startTrackingPartnerships}</Text>
            </View>
          </LinearGradient>

          {/* Registration Form */}
          <View style={styles.formContainer}>
            <View style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t.fullName}</Text>
                <View style={[styles.inputContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
                  <User size={20} color={theme.colors.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    value={formData.name}
                    onChangeText={(text) => updateFormData('name', text)}
                    placeholder="John Doe"
                    placeholderTextColor={theme.colors.textTertiary}
                    autoCapitalize="words"
                    autoCorrect={false}
                    autoComplete="name"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t.emailAddress}</Text>
                <View style={[styles.inputContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
                  <Mail size={20} color={theme.colors.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    value={formData.email}
                    onChangeText={(text) => updateFormData('email', text)}
                    placeholder="your@email.com"
                    placeholderTextColor={theme.colors.textTertiary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t.password}</Text>
                <View style={[styles.inputContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
                  <Lock size={20} color={theme.colors.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    value={formData.password}
                    onChangeText={(text) => updateFormData('password', text)}
                    placeholder={t.enterPassword}
                    placeholderTextColor={theme.colors.textTertiary}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="new-password"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color={theme.colors.textSecondary} />
                    ) : (
                      <Eye size={20} color={theme.colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t.confirmPassword}</Text>
                <View style={[styles.inputContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
                  <Lock size={20} color={theme.colors.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    value={formData.confirmPassword}
                    onChangeText={(text) => updateFormData('confirmPassword', text)}
                    placeholder={t.confirmYourPassword}
                    placeholderTextColor={theme.colors.textTertiary}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="new-password"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color={theme.colors.textSecondary} />
                    ) : (
                      <Eye size={20} color={theme.colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#D6BCFA', '#B794F6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.registerButtonGradient}
                >
                  <Text style={styles.registerButtonText}>
                    {isLoading ? t.creatingAccount : t.createAccount}
                  </Text>
                  {!isLoading && <ArrowRight size={20} color="white" />}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Terms and Privacy */}
            <View style={styles.termsSection}>
              <Text style={[styles.termsText, { color: theme.colors.textSecondary }]}>
                {t.byCreatingAccount}{' '}
                <Text style={[styles.termsLink, { color: theme.colors.primary }]}>{t.termsOfService}</Text>
                {' '}{t.and}{' '}
                <Text style={[styles.termsLink, { color: theme.colors.primary }]}>{t.privacyPolicy}</Text>
              </Text>
            </View>

            {/* Back to Login */}
            <TouchableOpacity style={styles.loginSection} onPress={handleBackToLogin}>
              <Text style={[styles.loginText, { color: theme.colors.textSecondary }]}>
                {t.alreadyHaveAccount}{' '}
                <Text style={[styles.loginLink, { color: theme.colors.primary }]}>{t.signIn}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    keyboardContainer: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
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
    welcomeGradient: {
      marginHorizontal: 20,
      marginBottom: 20,
      borderRadius: 24,
    },
    welcomeSection: {
      padding: 32,
      alignItems: 'center',
    },
    welcomeIconContainer: {
      marginBottom: 20,
    },
    welcomeIconBackground: {
      width: 64,
      height: 64,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    welcomeTitle: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: 'white',
      marginBottom: 8,
      textAlign: 'center',
    },
    welcomeSubtitle: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: 'rgba(255, 255, 255, 0.9)',
      textAlign: 'center',
    },
    formContainer: {
      padding: 20,
    },
    formCard: {
      borderRadius: 24,
      padding: 32,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
    },
    inputGroup: {
      marginBottom: 24,
    },
    inputLabel: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      marginBottom: 8,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 2,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
    },
    eyeButton: {
      padding: 4,
    },
    registerButton: {
      borderRadius: 16,
      overflow: 'hidden',
      marginTop: 8,
    },
    registerButtonDisabled: {
      opacity: 0.6,
    },
    registerButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 18,
      paddingHorizontal: 24,
      gap: 12,
    },
    registerButtonText: {
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      color: 'white',
    },
    termsSection: {
      marginBottom: 20,
      paddingHorizontal: 16,
    },
    termsText: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      textAlign: 'center',
      lineHeight: 20,
    },
    termsLink: {
      fontFamily: 'Inter-SemiBold',
    },
    loginSection: {
      paddingHorizontal: 16,
    },
    loginText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      textAlign: 'center',
    },
    loginLink: {
      fontFamily: 'Inter-SemiBold',
    },
  });
}