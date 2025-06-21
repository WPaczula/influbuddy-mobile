# Styled Alerts System

This document explains how to use the new styled alerts system that integrates with your app's theme.

## Overview

The styled alerts system replaces the default white alerts with themed alerts that match your app's design system. The alerts automatically adapt to light/dark mode and use your app's color palette.

## Features

- **Theme Integration**: Alerts automatically use your app's theme colors
- **Multiple Types**: Success, Error, Warning, and Info alerts with appropriate icons and colors
- **Responsive Design**: Works on both mobile and web platforms
- **Customizable**: Support for custom buttons and actions
- **Accessible**: Proper contrast and readable text

## Usage

### Within React Components

Use the `useAlert` hook in your React components:

```tsx
import { useAlert } from '@/contexts/AlertContext';

function MyComponent() {
  const { alert, confirm, confirmDestructive } = useAlert();

  const showSuccessAlert = () => {
    alert('Success!', 'Operation completed successfully.', 'success');
  };

  const showErrorAlert = () => {
    alert('Error!', 'Something went wrong.', 'error');
  };

  const showConfirmDialog = () => {
    confirm(
      'Confirm Action',
      'Are you sure you want to proceed?',
      () => console.log('Confirmed'),
      () => console.log('Cancelled')
    );
  };

  const showDestructiveConfirm = () => {
    confirmDestructive(
      'Delete Item',
      'This action cannot be undone.',
      () => console.log('Deleted'),
      () => console.log('Cancelled')
    );
  };

  return (
    <View>
      <Button onPress={showSuccessAlert} title="Show Success" />
      <Button onPress={showErrorAlert} title="Show Error" />
      <Button onPress={showConfirmDialog} title="Show Confirm" />
      <Button onPress={showDestructiveConfirm} title="Show Destructive" />
    </View>
  );
}
```

### Alert Types

- **`'success'`**: Green theme with checkmark icon
- **`'error'`**: Red theme with X icon
- **`'warning'`**: Orange theme with warning triangle icon
- **`'info'`**: Purple theme with info icon

### API Reference

#### `alert(title, message, type?)`

Shows a simple alert dialog.

- `title` (string): The alert title
- `message` (string): The alert message
- `type` (optional): 'success' | 'error' | 'warning' | 'info' (default: 'info')

#### `confirm(title, message, onConfirm, onCancel?, type?)`

Shows a confirmation dialog with two buttons.

- `title` (string): The dialog title
- `message` (string): The dialog message
- `onConfirm` (function): Called when user confirms
- `onCancel` (optional function): Called when user cancels
- `type` (optional): Alert type for styling

#### `confirmDestructive(title, message, onConfirm, onCancel?)`

Shows a destructive confirmation dialog with red styling.

- `title` (string): The dialog title
- `message` (string): The dialog message
- `onConfirm` (function): Called when user confirms
- `onCancel` (optional function): Called when user cancels

## Migration from Old Alert System

### Before (Old System)

```tsx
import { alert, confirm } from '@/utils/alert';

alert('Error', 'Something went wrong');
confirm('Confirm', 'Are you sure?', onConfirm, onCancel);
```

### After (New System)

```tsx
import { useAlert } from '@/contexts/AlertContext';

function MyComponent() {
  const { alert, confirm } = useAlert();

  alert('Error', 'Something went wrong', 'error');
  confirm('Confirm', 'Are you sure?', onConfirm, onCancel);
}
```

## Examples

### Form Validation

```tsx
const validateForm = () => {
  if (!name.trim()) {
    alert('Error', 'Name is required', 'error');
    return false;
  }
  return true;
};
```

### Success Feedback

```tsx
const handleSave = async () => {
  try {
    await saveData();
    alert('Success', 'Data saved successfully!', 'success');
  } catch (error) {
    alert('Error', 'Failed to save data', 'error');
  }
};
```

### Confirmation Dialogs

```tsx
const handleDelete = () => {
  confirmDestructive(
    'Delete Campaign',
    'This will permanently delete the campaign and all associated data.',
    async () => {
      await deleteCampaign();
      alert('Success', 'Campaign deleted successfully', 'success');
    }
  );
};
```

## Styling

The alerts automatically use your app's theme colors:

- **Background**: Uses `theme.colors.surface`
- **Text**: Uses `theme.colors.text` and `theme.colors.textSecondary`
- **Borders**: Uses theme-specific colors for each alert type
- **Buttons**: Use theme colors for different button styles

## Platform Support

- **Mobile**: Uses React Native's Modal component
- **Web**: Uses a custom modal implementation
- **Cross-platform**: Consistent API across all platforms

## Troubleshooting

### Alert not showing

Make sure your component is wrapped with the `AlertProvider` in the app's provider chain.

### Styling issues

The alerts automatically adapt to your theme. If colors seem off, check your theme configuration in `ThemeContext.tsx`.

### TypeScript errors

Make sure you're importing `useAlert` from `@/contexts/AlertContext` and not from the old `@/utils/alert`.
