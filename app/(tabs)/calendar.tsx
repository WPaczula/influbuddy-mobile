import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAlert } from '@/contexts/AlertContext';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import CampaignCard from '@/components/CampaignCard';
import CalendarSkeleton from '@/components/CalendarSkeleton';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ArrowLeft, Clock, Filter, Check, X, Download } from 'lucide-react-native';
import { Partner } from '@/types';
import { useCampaigns } from '@/hooks/queries/useCampaigns';
import { usePartners } from '@/hooks/queries/usePartners';

export default function CalendarScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { alert } = useAlert();
  const { data: campaigns = [], isLoading: campaignsLoading } = useCampaigns();
  const { data: partners = [], isLoading: partnersLoading } = usePartners();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedPartners, setSelectedPartners] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showPartnerFilter, setShowPartnerFilter] = useState(false);
  const router = useRouter();

  const styles = createStyles(theme);
  const loading = campaignsLoading || partnersLoading;

  const months = [
    t.january, t.february, t.march, t.april, t.may, t.june,
    t.july, t.august, t.september, t.october, t.november, t.december
  ];

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedMonth);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedMonth(newDate);
  };

  const getMonthCampaigns = () => {
    return campaigns.filter(campaign => {
      if (!campaign.deadline) return false;
      const deadline = new Date(campaign.deadline);
      const isInMonth = deadline.getMonth() === selectedMonth.getMonth() &&
        deadline.getFullYear() === selectedMonth.getFullYear();

      const matchesPartner = selectedPartners.length === 0 || selectedPartners.includes(campaign.partnerId);

      return isInMonth && matchesPartner;
    }).sort((a, b) => {
      if (!a.deadline || !b.deadline) return 0;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
  };

  const monthCampaigns = getMonthCampaigns();

  const getWeeksInMonth = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const weeks = [];
    let currentWeek = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(day);

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Add remaining empty cells
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    if (currentWeek.some(day => day !== null)) {
      weeks.push(currentWeek);
    }

    return weeks;
  };

  const getDayCampaigns = (day: number) => {
    return monthCampaigns.filter(campaign => {
      if (!campaign.deadline) return false;
      const deadline = new Date(campaign.deadline);
      return deadline.getDate() === day;
    });
  };

  const getDayDeadlineStatus = (day: number) => {
    const dayCampaigns = getDayCampaigns(day);
    if (dayCampaigns.length === 0) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day);
    dayDate.setHours(0, 0, 0, 0);

    const diffTime = dayDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Check if any campaigns are overdue or due today (and not completed/cancelled)
    const hasOverdue = dayCampaigns.some(campaign =>
      diffDays < 0 && campaign.status !== 'COMPLETED' && campaign.status !== 'CANCELLED'
    );
    const hasDueToday = dayCampaigns.some(campaign =>
      diffDays === 0 && campaign.status !== 'COMPLETED' && campaign.status !== 'CANCELLED'
    );

    if (hasOverdue) return 'overdue';
    if (hasDueToday) return 'dueToday';
    return 'normal';
  };

  const getSelectedDayCampaigns = () => {
    if (!selectedDay) return [];
    return getDayCampaigns(selectedDay);
  };

  const formatSelectedDate = () => {
    if (!selectedDay) return '';
    const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), selectedDay);
    return date.toLocaleDateString('pl-PL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDayPress = (day: number) => {
    const dayCampaigns = getDayCampaigns(day);
    if (dayCampaigns.length > 0) {
      setSelectedDay(day);
      setShowDayModal(true);
    }
  };

  const handleCampaignPress = (campaignId: string) => {
    setShowDayModal(false);
    // Navigate with a parameter to indicate we came from calendar
    router.push({
      pathname: `/campaigns/${campaignId}` as any,
      params: { from: 'calendar' }
    });
  };

  const handleModalClose = () => {
    setShowDayModal(false);
    setSelectedDay(null);
  };

  const togglePartnerSelection = (partnerId: string) => {
    setSelectedPartners(prev => {
      if (prev.includes(partnerId)) {
        return prev.filter(id => id !== partnerId);
      } else {
        return [...prev, partnerId];
      }
    });
  };

  const clearAllPartners = () => {
    setSelectedPartners([]);
  };

  const selectAllPartners = () => {
    setSelectedPartners(partners.map(p => p.id));
  };

  const getFilterButtonText = () => {
    if (selectedPartners.length === 0) {
      return t.allPartners;
    } else if (selectedPartners.length === 1) {
      const partner = partners.find(p => p.id === selectedPartners[0]);
      return partner?.company || t.allPartners;
    } else {
      return `${selectedPartners.length} selected`;
    }
  };

  const generateMonthlySummary = () => {
    const monthName = months[selectedMonth.getMonth()];
    const year = selectedMonth.getFullYear();

    // Filter campaigns based on selected partners
    const filteredCampaigns = selectedPartners.length === 0
      ? monthCampaigns
      : monthCampaigns.filter(campaign => selectedPartners.includes(campaign.partnerId));

    // Group campaigns by status
    const campaignsByStatus = {
      active: filteredCampaigns.filter(c => c.status === 'ACTIVE'),
      completed: filteredCampaigns.filter(c => c.status === 'COMPLETED'),
      draft: filteredCampaigns.filter(c => c.status === 'DRAFT'),
      waitingForPayment: filteredCampaigns.filter(c => c.status === 'WAITING_FOR_PAYMENT'),
      cancelled: filteredCampaigns.filter(c => c.status === 'CANCELLED'),
    };

    // Calculate earnings
    const totalEarnings = campaignsByStatus.completed.reduce((sum, c) => sum + (c.productValue || 0), 0);
    const pendingEarnings = campaignsByStatus.waitingForPayment.reduce((sum, c) => sum + (c.productValue || 0), 0);

    // Get partner information
    const involvedPartners = [...new Set(filteredCampaigns.map(c => c.partnerId))]
      .map(id => partners.find(p => p.id === id))
      .filter(Boolean) as Partner[];

    // Generate summary text using translations
    let summary = `📅 ${t.campaignSummary.toUpperCase()} - ${monthName} ${year}\n`;
    summary += `${'='.repeat(50)}\n\n`;

    // Overview
    summary += `📊 ${t.overview.toUpperCase()}\n`;
    summary += `• ${t.campaigns}: ${filteredCampaigns.length}\n`;
    summary += `• ${t.partners}: ${involvedPartners.length}\n`;
    summary += `• ${t.totalEarnings}: $${totalEarnings.toLocaleString()}\n`;
    if (pendingEarnings > 0) {
      summary += `• ${t.waitingForPayment}: $${pendingEarnings.toLocaleString()}\n`;
    }
    summary += `\n`;

    // Campaign Status Breakdown
    summary += `📈 ${t.campaigns.toUpperCase()}\n`;
    if (campaignsByStatus.active.length > 0) summary += `• ${t.active}: ${campaignsByStatus.active.length}\n`;
    if (campaignsByStatus.completed.length > 0) summary += `• ${t.completed}: ${campaignsByStatus.completed.length}\n`;
    if (campaignsByStatus.draft.length > 0) summary += `• ${t.draft}: ${campaignsByStatus.draft.length}\n`;
    if (campaignsByStatus.waitingForPayment.length > 0) summary += `• ${t.waitingForPayment}: ${campaignsByStatus.waitingForPayment.length}\n`;
    if (campaignsByStatus.cancelled.length > 0) summary += `• ${t.cancelled}: ${campaignsByStatus.cancelled.length}\n`;
    summary += `\n`;

    // Partners
    if (involvedPartners.length > 0) {
      summary += `🤝 ${t.partners.toUpperCase()}\n`;
      involvedPartners.forEach(partner => {
        const partnerCampaigns = filteredCampaigns.filter(c => c.partnerId === partner.id);
        const partnerEarnings = partnerCampaigns
          .filter(c => c.status === 'COMPLETED')
          .reduce((sum, c) => sum + (c.productValue || 0), 0);
        summary += `• ${partner.company} (${partnerCampaigns.length} ${t.campaigns.toLowerCase()}`;
        if (partnerEarnings > 0) {
          summary += `, $${partnerEarnings.toLocaleString()} ${t.earnings.toLowerCase()}`;
        }
        summary += `)\n`;
      });
      summary += `\n`;
    }

    // Campaign Details
    if (filteredCampaigns.length > 0) {
      summary += `📋 ${t.campaignDetails.toUpperCase()}\n`;

      // Group by week
      const campaignsByWeek: { [key: string]: typeof filteredCampaigns } = {};
      filteredCampaigns.forEach(campaign => {
        if (campaign.deadline) {
          const deadline = new Date(campaign.deadline);
          const weekStart = new Date(deadline);
          weekStart.setDate(deadline.getDate() - deadline.getDay());
          const weekKey = `${t.calendar} ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

          if (!campaignsByWeek[weekKey]) {
            campaignsByWeek[weekKey] = [];
          }
          campaignsByWeek[weekKey].push(campaign);
        }
      });

      Object.entries(campaignsByWeek).forEach(([week, campaigns]) => {
        summary += `\n${week}:\n`;
        campaigns.forEach(campaign => {
          const partner = partners.find(p => p.id === campaign.partnerId);
          const deadline = new Date(campaign.deadline || '');
          const statusEmoji = {
            'ACTIVE': '🟡',
            'COMPLETED': '✅',
            'DRAFT': '⚪',
            'WAITING_FOR_PAYMENT': '💰',
            'CANCELLED': '❌'
          }[campaign.status] || '⚪';

          summary += `  ${statusEmoji} ${campaign.title}\n`;
          summary += `     ${t.partner}: ${partner?.company || 'Unknown'}\n`;
          summary += `     ${t.deadline}: ${deadline.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}\n`;
          if (campaign.productValue) {
            summary += `     ${t.campaignValue}: $${campaign.productValue.toLocaleString()}\n`;
          }
        });
      });
    }

    summary += `\n${'='.repeat(50)}\n`;
    summary += `${t.generateReport} ${new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}\n`;

    return summary;
  };

  const handleDownloadSummary = async () => {
    try {
      const summary = generateMonthlySummary();
      const monthName = months[selectedMonth.getMonth()];
      const year = selectedMonth.getFullYear();

      await Share.share({
        message: summary,
        title: `${t.campaignSummary} - ${monthName} ${year}`,
      });
    } catch (error) {
      alert(t.error, 'Failed to generate summary', 'error');
    }
  };

  const handleGenerateSummary = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Handle summary generation
    } catch (error) {
      alert(t.error, 'Failed to generate summary', 'error');
    }
  };

  const weeks = getWeeksInMonth();
  const selectedDayCampaigns = getSelectedDayCampaigns();

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <CalendarSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.monthNavigation, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigateMonth('prev')} style={[styles.navButton, { backgroundColor: theme.colors.borderLight }]}>
          <ChevronLeft size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <Text style={[styles.monthText, { color: theme.colors.text }]}>
          {months[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
        </Text>
        <TouchableOpacity onPress={() => navigateMonth('next')} style={[styles.navButton, { backgroundColor: theme.colors.borderLight }]}>
          <ChevronRight size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {partners.length > 0 && (
        <View style={[styles.partnerFilter, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: theme.colors.borderLight, borderColor: theme.colors.border }]}
            onPress={() => setShowPartnerFilter(true)}
          >
            <Filter size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.filterButtonText, { color: theme.colors.text }]} numberOfLines={1}>
              {getFilterButtonText()}
            </Text>
            {selectedPartners.length > 0 && (
              <View style={[styles.filterBadge, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.filterBadgeText}>{selectedPartners.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.filterActions}>
            {selectedPartners.length > 0 && (
              <TouchableOpacity
                style={[styles.clearButton, { backgroundColor: theme.colors.errorLight }]}
                onPress={clearAllPartners}
              >
                <X size={16} color={theme.colors.error} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.downloadButton, { backgroundColor: theme.colors.primaryLight }]}
              onPress={handleDownloadSummary}
            >
              <Download size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.calendar, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.shadow }]}>
          <View style={styles.calendarHeader}>
            {[t.sunday, t.monday, t.tuesday, t.wednesday, t.thursday, t.friday, t.saturday].map(day => (
              <Text key={day} style={[styles.dayHeader, { color: theme.colors.textSecondary }]}>{day}</Text>
            ))}
          </View>

          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.week}>
              {week.map((day, dayIndex) => {
                const dayCampaigns = day ? getDayCampaigns(day) : [];
                const deadlineStatus = day ? getDayDeadlineStatus(day) : null;
                const isToday = day &&
                  new Date().getDate() === day &&
                  new Date().getMonth() === selectedMonth.getMonth() &&
                  new Date().getFullYear() === selectedMonth.getFullYear();
                const hasDeadlines = dayCampaigns.length > 0;

                // Get the appropriate colors based on deadline status
                let dayBackgroundColor = 'transparent';
                let dayBorderColor = 'transparent';
                let dayTextColor = theme.colors.text;

                if (hasDeadlines && deadlineStatus) {
                  switch (deadlineStatus) {
                    case 'overdue':
                      dayBackgroundColor = '#FED7D7';
                      dayBorderColor = '#FC8181';
                      dayTextColor = '#E53E3E';
                      break;
                    case 'dueToday':
                      dayBackgroundColor = '#FEF5E7';
                      dayBorderColor = '#F6AD55';
                      dayTextColor = '#DD6B20';
                      break;
                    case 'normal':
                      dayBackgroundColor = '#E6FFFA';
                      dayBorderColor = '#68D391';
                      dayTextColor = '#38A169';
                      break;
                  }
                }

                return (
                  <TouchableOpacity
                    key={dayIndex}
                    style={[
                      styles.day,
                      {
                        backgroundColor: dayBackgroundColor,
                        borderColor: dayBorderColor,
                        borderWidth: hasDeadlines ? 2 : 0,
                      }
                    ]}
                    onPress={() => day && handleDayPress(day)}
                    disabled={!day}
                  >
                    <Text style={[
                      styles.dayText,
                      {
                        color: day ? dayTextColor : theme.colors.textSecondary,
                        fontWeight: isToday ? 'bold' : 'normal',
                      }
                    ]}>
                      {day || ''}
                    </Text>
                    {hasDeadlines && (
                      <View style={[styles.deadlineIndicator, { backgroundColor: dayBorderColor }]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {monthCampaigns.length === 0 && (
          <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
            <CalendarIcon size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>{t.noCampaignsThisMonth}</Text>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {t.scheduleCampaigns}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Day Modal */}
      <Modal
        visible={showDayModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleModalClose}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity onPress={handleModalClose} style={styles.modalCloseButton}>
              <ArrowLeft size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {formatSelectedDate()}
            </Text>
            <View style={styles.modalCloseButton} />
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedDayCampaigns.length > 0 ? (
              <View style={styles.modalCampaignsList}>
                {selectedDayCampaigns.map(campaign => {
                  const partner = partners.find(p => p.id === campaign.partnerId);
                  return partner ? (
                    <CampaignCard
                      key={campaign.id}
                      campaign={campaign}
                      onPress={() => handleCampaignPress(campaign.id)}
                    />
                  ) : null;
                })}
              </View>
            ) : (
              <View style={[styles.modalEmptyState, { backgroundColor: theme.colors.surface }]}>
                <Clock size={64} color={theme.colors.textSecondary} />
                <Text style={[styles.modalEmptyTitle, { color: theme.colors.text }]}>{t.noDeadlines}</Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Partner Filter Modal */}
      <Modal
        visible={showPartnerFilter}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPartnerFilter(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity onPress={() => setShowPartnerFilter(false)} style={styles.modalCloseButton}>
              <ArrowLeft size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {t.filter}
            </Text>
            <View style={styles.modalCloseButton} />
          </View>

          <View style={styles.modalContent}>
            <View style={styles.filterActions}>
              <TouchableOpacity
                style={[styles.filterActionButton, { backgroundColor: theme.colors.primaryLight }]}
                onPress={selectAllPartners}
              >
                <Check size={16} color={theme.colors.primary} />
                <Text style={[styles.filterActionText, { color: theme.colors.primary }]}>
                  {t.selectAll}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterActionButton, { backgroundColor: theme.colors.errorLight }]}
                onPress={clearAllPartners}
              >
                <X size={16} color={theme.colors.error} />
                <Text style={[styles.filterActionText, { color: theme.colors.error }]}>
                  {t.clearAll}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.partnersList}>
              {partners.map(partner => (
                <TouchableOpacity
                  key={partner.id}
                  style={[
                    styles.partnerItem,
                    {
                      backgroundColor: selectedPartners.includes(partner.id)
                        ? theme.colors.primaryLight
                        : theme.colors.surface,
                      borderColor: theme.colors.border,
                    }
                  ]}
                  onPress={() => togglePartnerSelection(partner.id)}
                >
                  <View style={styles.partnerInfo}>
                    <Text style={[styles.partnerName, { color: theme.colors.text }]}>
                      {partner.company}
                    </Text>
                    <Text style={[styles.partnerEmail, { color: theme.colors.textSecondary }]}>
                      {partner.email}
                    </Text>
                  </View>
                  {selectedPartners.includes(partner.id) && (
                    <Check size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    monthNavigation: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
    },
    navButton: {
      padding: 8,
      borderRadius: 8,
    },
    monthText: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
    },
    partnerFilter: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      gap: 12,
    },
    filterButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      gap: 8,
    },
    filterButtonText: {
      flex: 1,
      fontSize: 14,
      fontFamily: 'Inter-Medium',
    },
    filterBadge: {
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 6,
    },
    filterBadgeText: {
      fontSize: 12,
      fontFamily: 'Inter-Bold',
      color: 'white',
    },
    filterActions: {
      flexDirection: 'row',
      gap: 8,
    },
    clearButton: {
      padding: 8,
      borderRadius: 8,
    },
    downloadButton: {
      padding: 8,
      borderRadius: 8,
    },
    scrollContent: {
      padding: 20,
    },
    calendar: {
      borderRadius: 16,
      padding: 16,
      marginBottom: 24,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    calendarHeader: {
      flexDirection: 'row',
      marginBottom: 12,
    },
    dayHeader: {
      flex: 1,
      textAlign: 'center',
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      paddingVertical: 8,
    },
    week: {
      flexDirection: 'row',
    },
    day: {
      flex: 1,
      minHeight: 60,
      padding: 4,
      alignItems: 'center',
      borderRadius: 8,
    },
    dayText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      marginBottom: 4,
    },
    deadlineIndicator: {
      width: 4,
      height: 4,
      borderRadius: 2,
      marginLeft: 4,
    },
    campaignsList: {
      marginBottom: 32,
    },
    campaignsTitle: {
      fontSize: 20,
      fontFamily: 'Inter-SemiBold',
      marginBottom: 16,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 48,
      borderRadius: 16,
      borderWidth: 2,
      borderStyle: 'dashed',
    },
    emptyTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      marginTop: 16,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      textAlign: 'center',
      maxWidth: 280,
    },
    modalContainer: {
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
    modalCloseButton: {
      padding: 8,
      borderRadius: 8,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      marginBottom: 2,
    },
    modalContent: {
      flex: 1,
    },
    modalCampaignsList: {
      padding: 20,
    },
    modalEmptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 80,
      paddingHorizontal: 40,
    },
    modalEmptyTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      marginTop: 16,
      marginBottom: 8,
    },
    modalEmptyText: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      textAlign: 'center',
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
    },
    partnerName: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      marginBottom: 2,
    },
    partnerEmail: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      marginBottom: 2,
    },
    filterActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      gap: 8,
    },
    filterActionText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
    },
    partnersList: {
      flex: 1,
    },
  });
}