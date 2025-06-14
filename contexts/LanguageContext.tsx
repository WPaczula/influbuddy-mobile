import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'en' | 'pl';

export interface Translations {
  // Navigation
  dashboard: string;
  campaigns: string;
  partners: string;
  calendar: string;
  settings: string;

  // Common
  loading: string;
  error: string;
  success: string;
  cancel: string;
  save: string;
  edit: string;
  delete: string;
  add: string;
  search: string;
  filter: string;
  back: string;
  done: string;
  close: string;
  share: string;
  preview: string;
  required: string;

  // Dashboard
  goodMorning: string;
  dashboardSubtitle: string;
  overview: string;
  totalEarnings: string;
  activeCampaigns: string;
  totalPartners: string;
  dueThisWeek: string;
  upcomingDeadlines: string;
  urgent: string;
  recentCampaigns: string;
  readyToStart: string;
  createFirstCampaign: string;

  // Campaigns
  campaignDetails: string;
  newCampaign: string;
  campaignTitle: string;
  campaignDescription: string;
  campaignValue: string;
  startDate: string;
  deadline: string;
  requirements: string;
  socialMediaPosts: string;
  addPost: string;
  noCampaignsYet: string;
  createYourFirstCampaign: string;
  allCampaigns: string;
  draft: string;
  active: string;
  completed: string;
  cancelled: string;
  dueToday: string;
  daysLeft: string;
  daysRemaining: string;
  daysOverdue: string;
  overdue: string;
  startCampaign: string;
  markComplete: string;
  timeline: string;
  completedDate: string;
  campaignSummary: string;
  generateReport: string;
  shareReport: string;
  createSummary: string;

  // Partners
  partnerDetails: string;
  newPartner: string;
  fullName: string;
  companyName: string;
  emailAddress: string;
  phoneNumber: string;
  website: string;
  notes: string;
  contactInformation: string;
  basicInformation: string;
  contactDetails: string;
  additionalNotes: string;
  partnerAvatar: string;
  avatarGenerated: string;
  noPartnersYet: string;
  addYourFirstPartner: string;
  partnerSince: string;
  addPartner: string;

  // Calendar
  calendarView: string;
  noDeadlines: string;
  noCampaignsThisMonth: string;
  scheduleCampaigns: string;
  allPartners: string;
  deadlines: string;
  campaignsInMonth: string;

  // Settings
  editProfile: string;
  updatePersonalInfo: string;
  notifications: string;
  campaignDeadlinesUpdates: string;
  darkMode: string;
  switchTheme: string;
  language: string;
  exportData: string;
  downloadData: string;
  privacySecurity: string;
  managePrivacy: string;
  helpSupport: string;
  getHelp: string;
  rateApp: string;
  helpImprove: string;
  signOut: string;
  signingOut: string;
  signOutConfirmation: string;
  signOutError: string;
  version: string;
  madeWithLove: string;
  account: string;
  preferences: string;
  support: string;
  bio: string;
  socialMediaHandles: string;
  changeAvatar: string;
  saveChanges: string;

  // Forms
  requiredFields: string;
  editLater: string;
  selectPartner: string;
  addRequirement: string;
  creating: string;
  addingPartner: string;
  saving: string;
  updating: string;

  // Validation
  nameRequired: string;
  companyRequired: string;
  emailRequired: string;
  validEmail: string;
  validWebsite: string;
  titleRequired: string;
  descriptionRequired: string;
  selectPartnerRequired: string;
  validAmount: string;
  deadlineRequired: string;
  deadlineAfterStart: string;
  oneRequirement: string;

  // Social Media
  instagram: string;
  tiktok: string;
  youtube: string;
  twitter: string;
  linkedin: string;
  other: string;
  post: string;
  story: string;
  reel: string;
  video: string;
  carousel: string;
  postUrl: string;
  platform: string;
  postType: string;
  description: string;
  addSocialPost: string;
  noPostsYet: string;
  addSocialLinks: string;

  // Months
  january: string;
  february: string;
  march: string;
  april: string;
  may: string;
  june: string;
  july: string;
  august: string;
  september: string;
  october: string;
  november: string;
  december: string;

  // Days
  sunday: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;

  // Success Messages
  partnerAdded: string;
  campaignCreated: string;
  profileUpdated: string;
  partnerUpdated: string;
  campaignUpdated: string;

  // Error Messages
  addPartnerError: string;
  createCampaignError: string;
  updateProfileError: string;
  updatePartnerError: string;
  updateCampaignError: string;
  loadingError: string;
  deletePartnerConfirm: string;

  // Authentication
  welcomeBack: string;
  signInToContinue: string;
  signIn: string;
  password: string;
  enterPassword: string;
  forgotPassword: string;
  signingIn: string;
  newToApp: string;
  createAccountToStart: string;
  createAccount: string;
  demoCredentials: string;
  joinInfluencers: string;
  startTrackingPartnerships: string;
  confirmPassword: string;
  confirmYourPassword: string;
  creatingAccount: string;
  byCreatingAccount: string;
  termsOfService: string;
  and: string;
  privacyPolicy: string;
  alreadyHaveAccount: string;
  resetPassword: string;
  forgotYourPassword: string;
  resetPasswordInstructions: string;
  sendResetEmail: string;
  sendingEmail: string;
  rememberPassword: string;
  checkYourEmail: string;
  emailSent: string;
  checkEmailInstructions: string;
  emailSentTo: string;
  didntReceiveEmail: string;
  backToSignIn: string;
  passwordRequired: string;
  passwordMinLength: string;
  passwordsDoNotMatch: string;
  loginError: string;
  registerError: string;
  resetPasswordError: string;

  // Campaign Form
  validTitle: string;
  selectDeadline: string;
  enterTitle: string;
  enterDescription: string;
  partner: string;
  amount: string;
  collaborationType: string;

  // Campaign Summary Template
  campaignUpdateGreeting: string; // "Hey {{partnerName}}!"
  campaignUpdateIntro: string; // "I'm giving you an update about our campaign - {{campaignName}}. Please find links to my posts below:"
  campaignUpdateClosing: string; // "Best"
  campaignUpdateSignature: string; // "{{userName}}"
  noPostsSharedYet: string; // "No posts have been shared yet."
}

const englishTranslations: Translations = {
  // Navigation
  dashboard: 'Dashboard',
  campaigns: 'Campaigns',
  partners: 'Partners',
  calendar: 'Calendar',
  settings: 'Settings',

  // Common
  loading: 'Loading...',
  error: 'Error',
  success: 'Success',
  cancel: 'Cancel',
  save: 'Save',
  edit: 'Edit',
  delete: 'Delete',
  add: 'Add',
  search: 'Search',
  filter: 'Filter',
  back: 'Back',
  done: 'Done',
  close: 'Close',
  share: 'Share',
  preview: 'Preview',
  required: 'Required',

  // Dashboard
  goodMorning: 'Good morning! 👋',
  dashboardSubtitle: "Here's your influencer dashboard",
  overview: 'Overview',
  totalEarnings: 'Total Earnings',
  activeCampaigns: 'Active Campaigns',
  totalPartners: 'Partners',
  dueThisWeek: 'Due This Week',
  upcomingDeadlines: 'Upcoming Deadlines',
  urgent: 'Urgent',
  recentCampaigns: 'Recent Campaigns',
  readyToStart: 'Ready to start?',
  createFirstCampaign: 'Create your first campaign to begin tracking your influencer partnerships!',

  // Campaigns
  campaignDetails: 'Campaign Details',
  newCampaign: 'New Campaign',
  campaignTitle: 'Campaign Title',
  campaignDescription: 'Description',
  campaignValue: 'Campaign Value',
  startDate: 'Start Date',
  deadline: 'Deadline',
  requirements: 'Requirements',
  socialMediaPosts: 'Social Media Posts',
  addPost: 'Add Post',
  noCampaignsYet: 'No campaigns yet',
  createYourFirstCampaign: 'Create Your First Campaign',
  allCampaigns: 'All',
  draft: 'Draft',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
  dueToday: 'Due today!',
  daysLeft: 'days left',
  daysRemaining: 'Days Remaining',
  daysOverdue: 'Days Overdue',
  overdue: 'Overdue',
  startCampaign: 'Start Campaign',
  markComplete: 'Mark Complete',
  timeline: 'Timeline',
  completedDate: 'Completed',
  campaignSummary: 'Campaign Summary',
  generateReport: 'Generate Report',
  shareReport: 'Share Report',
  createSummary: 'Create a professional summary to share with',

  // Partners
  partnerDetails: 'Partner Details',
  newPartner: 'New Partner',
  fullName: 'Full Name',
  companyName: 'Company Name',
  emailAddress: 'Email Address',
  phoneNumber: 'Phone Number',
  website: 'Website',
  notes: 'Notes',
  contactInformation: 'Contact Information',
  basicInformation: 'Basic Information',
  contactDetails: 'Contact Details',
  additionalNotes: 'Additional Notes',
  partnerAvatar: 'Partner Avatar',
  avatarGenerated: 'Avatar will be generated from initials',
  noPartnersYet: 'No partners yet',
  addYourFirstPartner: 'Add Your First Partner',
  partnerSince: 'Partner since',
  addPartner: 'Add Partner',

  // Calendar
  calendarView: 'Calendar',
  noDeadlines: 'No deadlines',
  noCampaignsThisMonth: 'No campaigns this month',
  scheduleCampaigns: 'Schedule your campaigns to see them here',
  allPartners: 'All Partners',
  deadlines: 'Deadlines',
  campaignsInMonth: 'Campaigns in',

  // Settings
  editProfile: 'Edit Profile',
  updatePersonalInfo: 'Update your personal information',
  notifications: 'Notifications',
  campaignDeadlinesUpdates: 'Campaign deadlines and updates',
  darkMode: 'Dark Mode',
  switchTheme: 'Switch between light and dark theme',
  language: 'Language',
  exportData: 'Export Data',
  downloadData: 'Download your campaigns and partners data',
  privacySecurity: 'Privacy & Security',
  managePrivacy: 'Manage your privacy settings',
  helpSupport: 'Help & Support',
  getHelp: 'Get help or contact support',
  rateApp: 'Rate the App',
  helpImprove: 'Help us improve with your feedback',
  signOut: 'Sign Out',
  signingOut: 'Signing out...',
  signOutConfirmation: 'Are you sure you want to sign out? This will clear all your local data.',
  signOutError: 'Failed to sign out. Please try again.',
  version: 'Version 1.0.0',
  madeWithLove: 'Made with ❤️ for influencers',
  account: 'Account',
  preferences: 'Preferences',
  support: 'Support',
  bio: 'Bio',
  socialMediaHandles: 'Social Media Handles',
  changeAvatar: 'Change Avatar',
  saveChanges: 'Save Changes',

  // Forms
  requiredFields: '* Required fields. You can always edit this information later.',
  editLater: 'You can always edit this information later',
  selectPartner: 'Select a partner',
  addRequirement: 'Add',
  creating: 'Creating...',
  addingPartner: 'Adding Partner...',
  saving: 'Saving...',
  updating: 'Updating...',

  // Validation
  nameRequired: 'Partner name is required',
  companyRequired: 'Company name is required',
  emailRequired: 'Email address is required',
  validEmail: 'Please enter a valid email address',
  validWebsite: 'Website URL should start with http:// or https://',
  titleRequired: 'Campaign title is required',
  descriptionRequired: 'Campaign description is required',
  selectPartnerRequired: 'Please select a partner',
  validAmount: 'Please enter a valid campaign amount',
  deadlineRequired: 'Please set a deadline',
  deadlineAfterStart: 'Deadline must be after start date',
  oneRequirement: 'Please add at least one requirement',

  // Social Media
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  twitter: 'Twitter',
  linkedin: 'LinkedIn',
  other: 'Other',
  post: 'Post',
  story: 'Story',
  reel: 'Reel',
  video: 'Video',
  carousel: 'Carousel',
  postUrl: 'Post URL',
  platform: 'Platform',
  postType: 'Post Type',
  description: 'Description',
  addSocialPost: 'Add Social Media Post',
  noPostsYet: 'No posts yet',
  addSocialLinks: 'Add links to your social media posts for this campaign',

  // Months
  january: 'January',
  february: 'February',
  march: 'March',
  april: 'April',
  may: 'May',
  june: 'June',
  july: 'July',
  august: 'August',
  september: 'September',
  october: 'October',
  november: 'November',
  december: 'December',

  // Days
  sunday: 'Sun',
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',

  // Success Messages
  partnerAdded: 'Partner added successfully!',
  campaignCreated: 'Campaign created successfully!',
  profileUpdated: 'Profile updated successfully!',
  partnerUpdated: 'Partner updated successfully!',
  campaignUpdated: 'Campaign updated successfully!',

  // Error Messages
  addPartnerError: 'Failed to add partner. Please try again.',
  createCampaignError: 'Failed to create campaign. Please try again.',
  updateProfileError: 'Failed to update profile. Please try again.',
  updatePartnerError: 'Failed to update partner details',
  updateCampaignError: 'Failed to update campaign status',
  loadingError: 'Failed to load data',
  deletePartnerConfirm: 'Are you sure you want to delete this partner? This action cannot be undone.',

  // Authentication
  welcomeBack: 'Welcome back! 👋',
  signInToContinue: 'Sign in to continue to your influencer dashboard',
  signIn: 'Sign In',
  password: 'Password',
  enterPassword: 'Enter your password',
  forgotPassword: 'Forgot Password?',
  signingIn: 'Signing in...',
  newToApp: 'New to the app?',
  createAccountToStart: 'Create an account to start tracking your partnerships',
  createAccount: 'Create Account',
  demoCredentials: 'Demo Credentials',
  joinInfluencers: 'Join thousands of influencers',
  startTrackingPartnerships: 'Start tracking your brand partnerships today',
  confirmPassword: 'Confirm Password',
  confirmYourPassword: 'Confirm your password',
  creatingAccount: 'Creating account...',
  byCreatingAccount: 'By creating an account, you agree to our',
  termsOfService: 'Terms of Service',
  and: 'and',
  privacyPolicy: 'Privacy Policy',
  alreadyHaveAccount: 'Already have an account?',
  resetPassword: 'Reset Password',
  forgotYourPassword: 'Forgot your password?',
  resetPasswordInstructions: 'Enter your email address and we\'ll send you a link to reset your password',
  sendResetEmail: 'Send Reset Email',
  sendingEmail: 'Sending email...',
  rememberPassword: 'Remember your password?',
  checkYourEmail: 'Check Your Email',
  emailSent: 'Email sent successfully!',
  checkEmailInstructions: 'We\'ve sent a password reset link to your email address',
  emailSentTo: 'Email sent to:',
  didntReceiveEmail: 'Didn\'t receive the email? Resend',
  backToSignIn: 'Back to Sign In',
  passwordRequired: 'Password is required',
  passwordMinLength: 'Password must be at least 6 characters',
  passwordsDoNotMatch: 'Passwords do not match',
  loginError: 'Invalid email or password. Please try again.',
  registerError: 'Failed to create account. Please try again.',
  resetPasswordError: 'Failed to send reset email. Please try again.',

  // Campaign Form
  validTitle: 'Valid Title',
  selectDeadline: 'Select Deadline',
  enterTitle: 'Enter Title',
  enterDescription: 'Enter Description',
  partner: 'Partner',
  amount: 'Amount',
  collaborationType: 'Collaboration Type',

  // Campaign Summary Template
  campaignUpdateGreeting: 'Hey {{partnerName}}!',
  campaignUpdateIntro: 'I\'m giving you an update about our campaign - {{campaignName}}. Please find links to my posts below:',
  campaignUpdateClosing: 'Best',
  campaignUpdateSignature: '{{userName}}',
  noPostsSharedYet: 'No posts have been shared yet.',
};

const polishTranslations: Translations = {
  // Navigation
  dashboard: 'Panel główny',
  campaigns: 'Kampanie',
  partners: 'Partnerzy',
  calendar: 'Kalendarz',
  settings: 'Ustawienia',

  // Common
  loading: 'Ładowanie...',
  error: 'Błąd',
  success: 'Sukces',
  cancel: 'Anuluj',
  save: 'Zapisz',
  edit: 'Edytuj',
  delete: 'Usuń',
  add: 'Dodaj',
  search: 'Szukaj',
  filter: 'Filtruj',
  back: 'Wstecz',
  done: 'Gotowe',
  close: 'Zamknij',
  share: 'Udostępnij',
  preview: 'Podgląd',
  required: 'Wymagane',

  // Dashboard
  goodMorning: 'Dzień dobry! 👋',
  dashboardSubtitle: 'Oto Twój panel influencera',
  overview: 'Przegląd',
  totalEarnings: 'Łączne zarobki',
  activeCampaigns: 'Aktywne kampanie',
  totalPartners: 'Partnerzy',
  dueThisWeek: 'Termin w tym tygodniu',
  upcomingDeadlines: 'Nadchodzące terminy',
  urgent: 'Pilne',
  recentCampaigns: 'Ostatnie kampanie',
  readyToStart: 'Gotowy na start?',
  createFirstCampaign: 'Utwórz swoją pierwszą kampanię, aby rozpocząć śledzenie współpracy z influencerami!',

  // Campaigns
  campaignDetails: 'Szczegóły kampanii',
  newCampaign: 'Nowa kampania',
  campaignTitle: 'Tytuł kampanii',
  campaignDescription: 'Opis',
  campaignValue: 'Wartość kampanii',
  startDate: 'Data rozpoczęcia',
  deadline: 'Termin',
  requirements: 'Wymagania',
  socialMediaPosts: 'Posty w mediach społecznościowych',
  addPost: 'Dodaj post',
  noCampaignsYet: 'Brak kampanii',
  createYourFirstCampaign: 'Utwórz swoją pierwszą kampanię',
  allCampaigns: 'Wszystkie',
  draft: 'Wersja robocza',
  active: 'Aktywna',
  completed: 'Zakończono',
  cancelled: 'Anulowana',
  dueToday: 'Termin dzisiaj!',
  daysLeft: 'dni pozostało',
  daysRemaining: 'Dni pozostało',
  daysOverdue: 'Dni po terminie',
  overdue: 'Po terminie',
  startCampaign: 'Rozpocznij kampanię',
  markComplete: 'Oznacz jako ukończone',
  timeline: 'Harmonogram',
  completedDate: 'Ukończono',
  campaignSummary: 'Podsumowanie kampanii',
  generateReport: 'Generuj raport',
  shareReport: 'Udostępnij raport',
  createSummary: 'Utwórz profesjonalne podsumowanie do udostępnienia z',

  // Partners
  partnerDetails: 'Szczegóły partnera',
  newPartner: 'Nowy partner',
  fullName: 'Imię i nazwisko',
  companyName: 'Nazwa firmy',
  emailAddress: 'Adres e-mail',
  phoneNumber: 'Numer telefonu',
  website: 'Strona internetowa',
  notes: 'Notatki',
  contactInformation: 'Informacje kontaktowe',
  basicInformation: 'Podstawowe informacje',
  contactDetails: 'Dane kontaktowe',
  additionalNotes: 'Dodatkowe notatki',
  partnerAvatar: 'Awatar partnera',
  avatarGenerated: 'Awatar zostanie wygenerowany z inicjałów',
  noPartnersYet: 'Brak partnerów',
  addYourFirstPartner: 'Dodaj swojego pierwszego partnera',
  partnerSince: 'Partner od',
  addPartner: 'Dodaj partnera',

  // Calendar
  calendarView: 'Kalendarz',
  noDeadlines: 'Brak terminów',
  noCampaignsThisMonth: 'Brak kampanii w tym miesiącu',
  scheduleCampaigns: 'Zaplanuj swoje kampanie, aby je tutaj zobaczyć',
  allPartners: 'Wszyscy partnerzy',
  deadlines: 'Terminy',
  campaignsInMonth: 'Kampanie w',

  // Settings
  editProfile: 'Edytuj profil',
  updatePersonalInfo: 'Zaktualizuj swoje dane osobowe',
  notifications: 'Powiadomienia',
  campaignDeadlinesUpdates: 'Terminy kampanii i aktualizacje',
  darkMode: 'Tryb ciemny',
  switchTheme: 'Przełącz między jasnym a ciemnym motywem',
  language: 'Język',
  exportData: 'Eksportuj dane',
  downloadData: 'Pobierz dane swoich kampanii i partnerów',
  privacySecurity: 'Prywatność i bezpieczeństwo',
  managePrivacy: 'Zarządzaj ustawieniami prywatności',
  helpSupport: 'Pomoc i wsparcie',
  getHelp: 'Uzyskaj pomoc lub skontaktuj się z pomocą techniczną',
  rateApp: 'Oceń aplikację',
  helpImprove: 'Pomóż nam się poprawić dzięki swojej opinii',
  signOut: 'Wyloguj się',
  signingOut: 'Wylogowywanie...',
  signOutConfirmation: 'Czy na pewno chcesz się wylogować? Spowoduje to wyczyszczenie wszystkich lokalnych danych.',
  signOutError: 'Nie udało się wylogować. Spróbuj ponownie.',
  version: 'Wersja 1.0.0',
  madeWithLove: 'Stworzone z ❤️ dla influencerów',
  account: 'Konto',
  preferences: 'Preferencje',
  support: 'Wsparcie',
  bio: 'Bio',
  socialMediaHandles: 'Konta w mediach społecznościowych',
  changeAvatar: 'Zmień awatar',
  saveChanges: 'Zapisz zmiany',

  // Forms
  requiredFields: '* Pola wymagane. Możesz zawsze edytować te informacje później.',
  editLater: 'Możesz zawsze edytować te informacje później',
  selectPartner: 'Wybierz partnera',
  addRequirement: 'Dodaj',
  creating: 'Tworzenie...',
  addingPartner: 'Dodawanie partnera...',
  saving: 'Zapisywanie...',
  updating: 'Aktualizowanie...',

  // Validation
  nameRequired: 'Nazwa partnera jest wymagana',
  companyRequired: 'Nazwa firmy jest wymagana',
  emailRequired: 'Adres e-mail jest wymagany',
  validEmail: 'Proszę wprowadzić prawidłowy adres e-mail',
  validWebsite: 'URL strony internetowej powinien zaczynać się od http:// lub https://',
  titleRequired: 'Tytuł kampanii jest wymagany',
  descriptionRequired: 'Opis kampanii jest wymagany',
  selectPartnerRequired: 'Proszę wybrać partnera',
  validAmount: 'Proszę wprowadzić prawidłową kwotę kampanii',
  deadlineRequired: 'Proszę ustawić termin',
  deadlineAfterStart: 'Termin musi być po dacie rozpoczęcia',
  oneRequirement: 'Proszę dodać co najmniej jedno wymaganie',

  // Social Media
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  twitter: 'Twitter',
  linkedin: 'LinkedIn',
  other: 'Inne',
  post: 'Post',
  story: 'Story',
  reel: 'Reel',
  video: 'Wideo',
  carousel: 'Karuzela',
  postUrl: 'URL posta',
  platform: 'Platforma',
  postType: 'Typ posta',
  description: 'Opis',
  addSocialPost: 'Dodaj post w mediach społecznościowych',
  noPostsYet: 'Brak postów',
  addSocialLinks: 'Dodaj linki do swoich postów w mediach społecznościowych dla tej kampanii',

  // Months
  january: 'Styczeń',
  february: 'Luty',
  march: 'Marzec',
  april: 'Kwiecień',
  may: 'Maj',
  june: 'Czerwiec',
  july: 'Lipiec',
  august: 'Sierpień',
  september: 'Wrzesień',
  october: 'Październik',
  november: 'Listopad',
  december: 'Grudzień',

  // Days
  sunday: 'Nd',
  monday: 'Pn',
  tuesday: 'Wt',
  wednesday: 'Śr',
  thursday: 'Czw',
  friday: 'Pt',
  saturday: 'Sb',

  // Success Messages
  partnerAdded: 'Partner został pomyślnie dodany!',
  campaignCreated: 'Kampania została pomyślnie utworzona!',
  profileUpdated: 'Profil został pomyślnie zaktualizowany!',
  partnerUpdated: 'Partner został pomyślnie zaktualizowany!',
  campaignUpdated: 'Kampania została pomyślnie zaktualizowana!',

  // Error Messages
  addPartnerError: 'Nie udało się dodać partnera. Spróbuj ponownie.',
  createCampaignError: 'Nie udało się utworzyć kampanii. Spróbuj ponownie.',
  updateProfileError: 'Nie udało się zaktualizować profilu. Spróbuj ponownie.',
  updatePartnerError: 'Nie udało się zaktualizować szczegółów partnera',
  updateCampaignError: 'Nie udało się zaktualizować statusu kampanii',
  loadingError: 'Nie udało się załadować danych',
  deletePartnerConfirm: 'Czy na pewno chcesz usunąć tego partnera? Tej akcji nie można cofnąć.',

  // Authentication
  welcomeBack: 'Witaj ponownie! 👋',
  signInToContinue: 'Zaloguj się, aby przejść do panelu influencera',
  signIn: 'Zaloguj się',
  password: 'Hasło',
  enterPassword: 'Wprowadź swoje hasło',
  forgotPassword: 'Zapomniałeś hasła?',
  signingIn: 'Logowanie...',
  newToApp: 'Nowy w aplikacji?',
  createAccountToStart: 'Utwórz konto, aby rozpocząć śledzenie partnerstw',
  createAccount: 'Utwórz konto',
  demoCredentials: 'Dane demonstracyjne',
  joinInfluencers: 'Dołącz do tysięcy influencerów',
  startTrackingPartnerships: 'Zacznij śledzić swoje partnerstwa z markami już dziś',
  confirmPassword: 'Potwierdź hasło',
  confirmYourPassword: 'Potwierdź swoje hasło',
  creatingAccount: 'Tworzenie konta...',
  byCreatingAccount: 'Tworząc konto, zgadzasz się na nasze',
  termsOfService: 'Warunki korzystania z usługi',
  and: 'i',
  privacyPolicy: 'Politykę prywatności',
  alreadyHaveAccount: 'Masz już konto?',
  resetPassword: 'Resetuj hasło',
  forgotYourPassword: 'Zapomniałeś hasła?',
  resetPasswordInstructions: 'Wprowadź swój adres e-mail, a wyślemy Ci link do resetowania hasła',
  sendResetEmail: 'Wyślij e-mail resetujący',
  sendingEmail: 'Wysyłanie e-maila...',
  rememberPassword: 'Pamiętasz hasło?',
  checkYourEmail: 'Sprawdź swoją skrzynkę e-mail',
  emailSent: 'E-mail został wysłany pomyślnie!',
  checkEmailInstructions: 'Wysłaliśmy link do resetowania hasła na Twój adres e-mail',
  emailSentTo: 'E-mail wysłany do:',
  didntReceiveEmail: 'Nie otrzymałeś e-maila? Wyślij ponownie',
  backToSignIn: 'Powrót do logowania',
  passwordRequired: 'Hasło jest wymagane',
  passwordMinLength: 'Hasło musi mieć co najmniej 6 znaków',
  passwordsDoNotMatch: 'Hasła nie są zgodne',
  loginError: 'Nieprawidłowy e-mail lub hasło. Spróbuj ponownie.',
  registerError: 'Nie udało się utworzyć konta. Spróbuj ponownie.',
  resetPasswordError: 'Nie udało się wysłać e-maila resetującego. Spróbuj ponownie.',

  // Campaign Form
  validTitle: 'Valid Title',
  selectDeadline: 'Select Deadline',
  enterTitle: 'Enter Title',
  enterDescription: 'Enter Description',
  partner: 'Partner',
  amount: 'Amount',
  collaborationType: 'Collaboration Type',

  // Campaign Summary Template
  campaignUpdateGreeting: 'Cześć {{partnerName}}!',
  campaignUpdateIntro: 'Przesyłam aktualizację dotyczącą naszej kampanii - {{campaignName}}. Poniżej znajdziesz linki do moich postów:',
  campaignUpdateClosing: 'Pozdrawiam',
  campaignUpdateSignature: '{{userName}}',
  noPostsSharedYet: 'Nie udostępniono jeszcze żadnych postów.',
};

const translations = {
  en: englishTranslations,
  pl: polishTranslations,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translations;
  isLoaded: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'app_language_preference';

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadLanguagePreference();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveLanguagePreference(language);
    }
  }, [language, isLoaded]);

  const loadLanguagePreference = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'pl')) {
        setLanguageState(savedLanguage as Language);
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveLanguagePreference = async (lang: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoaded }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}