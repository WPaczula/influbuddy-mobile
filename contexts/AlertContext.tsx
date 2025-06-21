import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import StyledAlert from '@/components/StyledAlert';
import { useStyledAlert } from '@/hooks/useStyledAlert';
import { setAlertContext } from '@/utils/styledAlert';

interface AlertContextType {
    alert: (title: string, message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
    confirm: (
        title: string,
        message: string,
        onConfirm: () => void,
        onCancel?: () => void,
        type?: 'success' | 'error' | 'warning' | 'info'
    ) => void;
    confirmDestructive: (
        title: string,
        message: string,
        onConfirm: () => void,
        onCancel?: () => void
    ) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

interface AlertProviderProps {
    children: ReactNode;
}

export function AlertProvider({ children }: AlertProviderProps) {
    const {
        alertConfig,
        isVisible,
        showAlert,
        hideAlert,
        alert,
        confirm,
        confirmDestructive,
    } = useStyledAlert();

    // Set the context for utility functions
    useEffect(() => {
        setAlertContext({ alert, confirm, confirmDestructive, showAlert });
    }, [alert, confirm, confirmDestructive, showAlert]);

    return (
        <AlertContext.Provider value={{ alert, confirm, confirmDestructive }}>
            {children}
            {alertConfig && (
                <StyledAlert
                    visible={isVisible}
                    title={alertConfig.title}
                    message={alertConfig.message}
                    type={alertConfig.type}
                    buttons={alertConfig.buttons}
                    onClose={hideAlert}
                />
            )}
        </AlertContext.Provider>
    );
}

export function useAlert(): AlertContextType {
    const context = useContext(AlertContext);
    if (context === undefined) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
} 