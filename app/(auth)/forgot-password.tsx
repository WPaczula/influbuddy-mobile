import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { Mail, ArrowLeft, ArrowRight, Shield } from 'lucide-react-native';

export default function ForgotPasswordScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { resetPassword } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const styles = createStyles(theme);

  const validateEmail = () => {
    if (!email.trim()) {
      Alert.alert(t.error, t.emailRequired);
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert(t.error, t.validEmail);
      return false;
    }

    return true;
  };

  const handleResetPassword = async () => {
    if (!validateEmail()) return;

    setIsLoading(true);
    try {
      await resetPassword(email.trim());
      setEmailSent(true);
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = error instanceof Error ? error.message : t.resetPasswordError;
      Alert.alert(t.error, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  const handleResendEmail = () => {
    setEmailSent(false);
    handleResetPassword();
  };

  if (emailSent) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.colors.borderLight }]} onPress={handleBackToLogin}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t.checkYourEmail}</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <LinearGradient
            colors={['#D6BCFA', '#B794F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.successGradient}
          >
            <View style={styles.successSection}>
              <View style={styles.successIconContainer}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.successIconBackground}
                >
                  <Mail size={32} color="white" />
                </LinearGradient>
              </View>
              <Text style={styles.successTitle}>{t.emailSent}</Text>
              <Text style={styles.successSubtitle}>{t.checkEmailInstructions}</Text>
            </View>
          </LinearGradient>

          <View style={styles.formContainer}>
            <View style={[styles.emailCard, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.emailSentTo, { color: theme.colors.textSecondary }]}>{t.emailSentTo}</Text>
              <Text style={[styles.emailAddress, { color: theme.colors.text }]}>{email}</Text>
            </View>

            <TouchableOpacity style={styles.resendButton} onPress={handleResendEmail}>
              <Text style={[styles.resendText, { color: theme.colors.primary }]}>{t.didntReceiveEmail}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.backToLoginButton, { backgroundColor: theme.colors.borderLight }]} onPress={handleBackToLogin}>
              <Text style={[styles.backToLoginText, { color: theme.colors.textSecondary }]}>{t.backToSignIn}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

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
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t.resetPassword}</Text>
            <View style={styles.backButton} />
          </View>

          {/* Info Section */}
          <LinearGradient
            colors={['#D6BCFA', '#B794F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.infoGradient}
          >
            <View style={styles.infoSection}>
              <View style={styles.infoIconContainer}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.infoIconBackground}
                >
                  <Shield size={28} color="white" />
                </LinearGradient>
              </View>
              <Text style={styles.infoTitle}>{t.forgotYourPassword}</Text>
              <Text style={styles.infoSubtitle}>{t.resetPasswordInstructions}</Text>
            </View>
          </LinearGradient>

          {/* Reset Form */}
          <View style={styles.formContainer}>
            <View style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t.emailAddress}</Text>
                <View style={[styles.inputContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
                  <Mail size={20} color={theme.colors.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="your@email.com"
                    placeholderTextColor={theme.colors.textTertiary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.resetButton, isLoading && styles.resetButtonDisabled]}
                onPress={handleResetPassword}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#D6BCFA', '#B794F6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.resetButtonGradient}
                >
                  <Text style={styles.resetButtonText}>
                    {isLoading ? t.sendingEmail : t.sendResetEmail}
                  </Text>
                  {!isLoading && <ArrowRight size={20} color="white" />}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Back to Login */}
            <TouchableOpacity style={styles.loginSection} onPress={handleBackToLogin}>
              <Text style={[styles.loginText, { color: theme.colors.textSecondary }]}>
                {t.rememberPassword}{' '}
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
    infoGradient: {
      marginHorizontal: 20,
      marginBottom: 20,
      borderRadius: 24,
    },
    infoSection: {
      padding: 32,
      alignItems: 'center',
    },
    infoIconContainer: {
      marginBottom: 20,
    },
    infoIconBackground: {
      width: 64,
      height: 64,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    infoTitle: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: 'white',
      marginBottom: 8,
      textAlign: 'center',
    },
    infoSubtitle: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: 'rgba(255, 255, 255, 0.9)',
      textAlign: 'center',
      lineHeight: 24,
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
      marginBottom: 32,
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
    resetButton: {
      borderRadius: 16,
      overflow: 'hidden',
    },
    resetButtonDisabled: {
      opacity: 0.6,
    },
    resetButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 18,
      paddingHorizontal: 24,
      gap: 12,
    },
    resetButtonText: {
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      color: 'white',
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
    // Success state styles
    successGradient: {
      marginHorizontal: 20,
      marginBottom: 20,
      borderRadius: 24,
    },
    successSection: {
      padding: 32,
      alignItems: 'center',
    },
    successIconContainer: {
      marginBottom: 20,
    },
    successIconBackground: {
      width: 80,
      height: 80,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    successTitle: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: 'white',
      marginBottom: 8,
      textAlign: 'center',
    },
    successSubtitle: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: 'rgba(255, 255, 255, 0.9)',
      textAlign: 'center',
      lineHeight: 24,
    },
    emailCard: {
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      alignItems: 'center',
    },
    emailSentTo: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      marginBottom: 8,
    },
    emailAddress: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
    },
    resendButton: {
      paddingVertical: 16,
      alignItems: 'center',
      marginBottom: 20,
    },
    resendText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    backToLoginButton: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: 'center',
    },
    backToLoginText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
  });
}