// This file provides a way to use styled alerts from outside of React components
// For use within React components, use the useAlert hook directly

let alertContext: any = null;

export const setAlertContext = (context: any) => {
  alertContext = context;
};

export const showStyledAlert = (
  title: string,
  message: string,
  type: 'success' | 'error' | 'warning' | 'info' = 'info'
) => {
  if (alertContext) {
    alertContext.alert(title, message, type);
  } else {
    console.warn('Alert context not available. Use useAlert hook within React components.');
  }
};

export const showStyledConfirm = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  type: 'success' | 'error' | 'warning' | 'info' = 'info'
) => {
  if (alertContext) {
    alertContext.confirm(title, message, onConfirm, onCancel, type);
  } else {
    console.warn('Alert context not available. Use useAlert hook within React components.');
  }
};

export const showStyledConfirmDestructive = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  if (alertContext) {
    alertContext.confirmDestructive(title, message, onConfirm, onCancel);
  } else {
    console.warn('Alert context not available. Use useAlert hook within React components.');
  }
}; 