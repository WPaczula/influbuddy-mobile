import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAlert } from '@/contexts/AlertContext';

export default function AlertDemo() {
    const { theme } = useTheme();
    const { alert, confirm, confirmDestructive } = useAlert();

    const showSuccessAlert = () => {
        alert('Success!', 'Your action was completed successfully.', 'success');
    };

    const showErrorAlert = () => {
        alert('Error!', 'Something went wrong. Please try again.', 'error');
    };

    const showWarningAlert = () => {
        alert('Warning!', 'Please review your input before proceeding.', 'warning');
    };

    const showInfoAlert = () => {
        alert('Information', 'Here is some helpful information for you.', 'info');
    };

    const showConfirmDialog = () => {
        confirm(
            'Confirm Action',
            'Are you sure you want to proceed with this action?',
            () => alert('Confirmed!', 'You confirmed the action.', 'success'),
            () => alert('Cancelled', 'You cancelled the action.', 'info')
        );
    };

    const showDestructiveConfirm = () => {
        confirmDestructive(
            'Delete Item',
            'This action cannot be undone. Are you sure you want to delete this item?',
            () => alert('Deleted!', 'The item has been deleted.', 'success'),
            () => alert('Cancelled', 'Deletion was cancelled.', 'info')
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Styled Alerts Demo</Text>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.colors.success }]}
                    onPress={showSuccessAlert}
                >
                    <Text style={styles.buttonText}>Success Alert</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.colors.error }]}
                    onPress={showErrorAlert}
                >
                    <Text style={styles.buttonText}>Error Alert</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.colors.warning }]}
                    onPress={showWarningAlert}
                >
                    <Text style={styles.buttonText}>Warning Alert</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.colors.primary }]}
                    onPress={showInfoAlert}
                >
                    <Text style={styles.buttonText}>Info Alert</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.colors.blue }]}
                    onPress={showConfirmDialog}
                >
                    <Text style={styles.buttonText}>Confirm Dialog</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.colors.error }]}
                    onPress={showDestructiveConfirm}
                >
                    <Text style={styles.buttonText}>Destructive Confirm</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontFamily: 'Inter-Bold',
        textAlign: 'center',
        marginBottom: 40,
    },
    buttonContainer: {
        gap: 16,
    },
    button: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Inter-SemiBold',
    },
}); 