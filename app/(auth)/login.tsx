import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/FirebaseAuthContext';
import { useAlert } from '@/contexts/AlertContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User } from 'lucide-react-native';

export default function LoginScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { signIn } = useAuth();
  const { alert } = useAlert();
  const router = useRouter();
  const [email, setEmail] = useState('wojciech.paczula@gmail.com');
  const [password, setPassword] = useState('zaq1@WSX');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const styles = createStyles(theme);

  const validateForm = () => {
    if (!email.trim()) {
      alert(t.error, t.emailRequired, 'error');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      alert(t.error, t.validEmail, 'error');
      return false;
    }
    if (!password.trim()) {
      alert(t.error, t.passwordRequired, 'error');
      return false;
    }
    if (password.length < 6) {
      alert(t.error, t.passwordMinLength, 'error');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)');
    } catch (error: any) {
      const errorMessage = error.message || t.loginError;
      alert('Login Failed', errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    router.push('/(auth)/register');
  };

  const handleForgotPassword = () => {
    router.push('/(auth)/forgot-password');
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
          {/* Header with Gradient and Mascot */}
          <LinearGradient
            colors={['#D6BCFA', '#B794F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.header}>
              <View style={styles.mascotContainer}>
                <Image
                  source={{ uri: '/assets/images/image.png' }}
                  style={styles.mascotImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.welcomeTitle}>{t.welcomeBack}</Text>
              <Text style={styles.welcomeSubtitle}>{t.signInToContinue}</Text>
            </View>
          </LinearGradient>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <View style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.formTitle, { color: theme.colors.text }]}>{t.signIn}</Text>

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

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>{t.password}</Text>
                <View style={[styles.inputContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
                  <Lock size={20} color={theme.colors.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder={t.enterPassword}
                    placeholderTextColor={theme.colors.textTertiary}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password"
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

              <TouchableOpacity style={styles.forgotPasswordButton} onPress={handleForgotPassword}>
                <Text style={[styles.forgotPasswordText, { color: theme.colors.primary }]}>{t.forgotPassword}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#D6BCFA', '#B794F6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.loginButtonGradient}
                >
                  <Text style={styles.loginButtonText}>
                    {isLoading ? t.signingIn : t.signIn}
                  </Text>
                  {!isLoading && <ArrowRight size={20} color="white" />}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Register Section */}
            <View style={[styles.registerSection, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.registerContent}>
                <User size={24} color={theme.colors.primary} />
                <View style={styles.registerTextContainer}>
                  <Text style={[styles.registerTitle, { color: theme.colors.text }]}>{t.newToApp}</Text>
                  <Text style={[styles.registerSubtitle, { color: theme.colors.textSecondary }]}>{t.createAccountToStart}</Text>
                </View>
              </View>
              <TouchableOpacity style={[styles.registerButton, { borderColor: theme.colors.primary }]} onPress={handleRegister}>
                <Text style={[styles.registerButtonText, { color: theme.colors.primary }]}>{t.createAccount}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Demo Credentials */}
          <View style={[styles.demoSection, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.demoTitle, { color: theme.colors.text }]}>{t.demoCredentials}</Text>
            <Text style={[styles.demoText, { color: theme.colors.textSecondary }]}>
              Email: demo@influencer.com
            </Text>
            <Text style={[styles.demoText, { color: theme.colors.textSecondary }]}>
              Password: demo123
            </Text>
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
    headerGradient: {
      marginHorizontal: 20,
      marginTop: 20,
      borderRadius: 24,
    },
    header: {
      padding: 32,
      alignItems: 'center',
    },
    mascotContainer: {
      marginBottom: 24,
      alignItems: 'center',
    },
    mascotImage: {
      width: 120,
      height: 120,
    },
    welcomeTitle: {
      fontSize: 28,
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
    formTitle: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      marginBottom: 32,
      textAlign: 'center',
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
    forgotPasswordButton: {
      alignSelf: 'flex-end',
      marginBottom: 32,
    },
    forgotPasswordText: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
    },
    loginButton: {
      borderRadius: 16,
      overflow: 'hidden',
    },
    loginButtonDisabled: {
      opacity: 0.6,
    },
    loginButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 18,
      paddingHorizontal: 24,
      gap: 12,
    },
    loginButtonText: {
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      color: 'white',
    },
    registerSection: {
      borderRadius: 20,
      padding: 24,
      marginBottom: 20,
    },
    registerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      gap: 16,
    },
    registerTextContainer: {
      flex: 1,
    },
    registerTitle: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      marginBottom: 4,
    },
    registerSubtitle: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      lineHeight: 20,
    },
    registerButton: {
      borderWidth: 2,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 24,
      alignItems: 'center',
    },
    registerButtonText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    demoSection: {
      marginHorizontal: 20,
      marginBottom: 20,
      borderRadius: 16,
      padding: 20,
    },
    demoTitle: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      marginBottom: 12,
      textAlign: 'center',
    },
    demoText: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      textAlign: 'center',
      marginBottom: 4,
    },
  });
}