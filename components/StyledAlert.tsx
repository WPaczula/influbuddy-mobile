import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react-native';

export interface StyledAlertProps {
    visible: boolean;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    buttons?: Array<{
        text: string;
        onPress?: () => void;
        style?: 'default' | 'cancel' | 'destructive';
    }>;
    onClose?: () => void;
}

export default function StyledAlert({
    visible,
    title,
    message,
    type = 'info',
    buttons = [{ text: 'OK' }],
    onClose
}: StyledAlertProps) {
    const { theme } = useTheme();

    const getTypeConfig = () => {
        switch (type) {
            case 'success':
                return {
                    icon: CheckCircle,
                    iconColor: theme.colors.success,
                    backgroundColor: theme.colors.successLight,
                    borderColor: theme.colors.success,
                    gradientColors: theme.isDark
                        ? ['rgba(104, 211, 145, 0.2)', 'rgba(104, 211, 145, 0.1)'] as const
                        : ['rgba(104, 211, 145, 0.1)', 'rgba(104, 211, 145, 0.05)'] as const,
                };
            case 'error':
                return {
                    icon: XCircle,
                    iconColor: theme.colors.error,
                    backgroundColor: theme.colors.errorLight,
                    borderColor: theme.colors.error,
                    gradientColors: theme.isDark
                        ? ['rgba(252, 129, 129, 0.2)', 'rgba(252, 129, 129, 0.1)'] as const
                        : ['rgba(252, 129, 129, 0.1)', 'rgba(252, 129, 129, 0.05)'] as const,
                };
            case 'warning':
                return {
                    icon: AlertTriangle,
                    iconColor: theme.colors.warning,
                    backgroundColor: theme.colors.warningLight,
                    borderColor: theme.colors.warning,
                    gradientColors: theme.isDark
                        ? ['rgba(246, 173, 85, 0.2)', 'rgba(246, 173, 85, 0.1)'] as const
                        : ['rgba(246, 173, 85, 0.1)', 'rgba(246, 173, 85, 0.05)'] as const,
                };
            case 'info':
            default:
                return {
                    icon: Info,
                    iconColor: theme.colors.primary,
                    backgroundColor: theme.colors.primaryLight,
                    borderColor: theme.colors.primary,
                    gradientColors: theme.isDark
                        ? ['rgba(183, 148, 246, 0.2)', 'rgba(183, 148, 246, 0.1)'] as const
                        : ['rgba(183, 148, 246, 0.1)', 'rgba(183, 148, 246, 0.05)'] as const,
                };
        }
    };

    const typeConfig = getTypeConfig();
    const IconComponent = typeConfig.icon;

    const handleButtonPress = (button: typeof buttons[0]) => {
        button.onPress?.();
        onClose?.();
    };

    const getButtonStyle = (buttonStyle?: string) => {
        const baseStyle = [styles.button];

        switch (buttonStyle) {
            case 'destructive':
                return [
                    ...baseStyle,
                    { backgroundColor: theme.colors.error },
                ];
            case 'cancel':
                return [
                    ...baseStyle,
                    {
                        backgroundColor: 'transparent',
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                    },
                ];
            default:
                return [
                    ...baseStyle,
                    { backgroundColor: theme.colors.primary },
                ];
        }
    };

    const getButtonTextStyle = (buttonStyle?: string) => {
        const baseStyle = [styles.buttonText];

        switch (buttonStyle) {
            case 'destructive':
                return [...baseStyle, { color: 'white' }];
            case 'cancel':
                return [...baseStyle, { color: theme.colors.text }];
            default:
                return [...baseStyle, { color: 'white' }];
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.alertContainer, { backgroundColor: theme.colors.surface }]}>
                    {/* Background gradient */}
                    <LinearGradient
                        colors={typeConfig.gradientColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.backgroundGradient}
                    />

                    {/* Border accent */}
                    <View style={[styles.borderAccent, { backgroundColor: typeConfig.borderColor }]} />

                    <View style={styles.content}>
                        {/* Icon */}
                        <View style={[styles.iconContainer, { backgroundColor: typeConfig.backgroundColor }]}>
                            <IconComponent size={24} color={typeConfig.iconColor} />
                        </View>

                        {/* Text content */}
                        <View style={styles.textContainer}>
                            <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
                            <Text style={[styles.message, { color: theme.colors.textSecondary }]}>{message}</Text>
                        </View>
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        {buttons.map((button, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    getButtonStyle(button.style),
                                    buttons.length > 1 && styles.buttonWithMargin
                                ]}
                                onPress={() => handleButtonPress(button)}
                                activeOpacity={0.7}
                            >
                                <Text style={getButtonTextStyle(button.style)}>{button.text}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    alertContainer: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 12,
    },
    backgroundGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    borderAccent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
    },
    content: {
        flexDirection: 'row',
        padding: 24,
        gap: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontFamily: 'Inter-Bold',
        marginBottom: 8,
        lineHeight: 24,
    },
    message: {
        fontSize: 16,
        fontFamily: 'Inter-Regular',
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: 'row',
        padding: 24,
        paddingTop: 0,
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonWithMargin: {
        marginRight: 8,
    },
    buttonText: {
        fontSize: 16,
        fontFamily: 'Inter-SemiBold',
    },
}); 