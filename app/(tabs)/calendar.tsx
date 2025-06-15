import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '@/hooks/useData';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import CampaignCard from '@/components/CampaignCard';
import CalendarSkeleton from '@/components/CalendarSkeleton';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ArrowLeft, Clock, Filter, Check, X } from 'lucide-react-native';

export default function CalendarScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { partners, campaigns, loading } = useData();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedPartners, setSelectedPartners] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showPartnerFilter, setShowPartnerFilter] = useState(false);
  const router = useRouter();

  const styles = createStyles(theme);

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
      const deadline = new Date(campaign.deadline);
      const isInMonth = deadline.getMonth() === selectedMonth.getMonth() && 
                       deadline.getFullYear() === selectedMonth.getFullYear();
      
      const matchesPartner = selectedPartners.length === 0 || selectedPartners.includes(campaign.partnerId);
      
      return isInMonth && matchesPartner;
    }).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
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
      pathname: `/campaigns/${campaignId}`,
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
          
          {selectedPartners.length > 0 && (
            <TouchableOpacity
              style={[styles.clearButton, { backgroundColor: theme.colors.errorLight }]}
              onPress={clearAllPartners}
            >
              <X size={16} color={theme.colors.error} />
            </TouchableOpacity>
          )}
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
                      dayBackgroundColor = theme.colors.errorLight;
                      dayBorderColor = theme.colors.error;
                      dayTextColor = theme.colors.error;
                      break;
                    case 'dueToday':
                      dayBackgroundColor = theme.colors.warningLight;
                      dayBorderColor = theme.colors.warning;
                      dayTextColor = theme.colors.warning;
                      break;
                    case 'normal':
                      dayBackgroundColor = theme.colors.borderLight;
                      dayBorderColor = theme.colors.border;
                      dayTextColor = theme.colors.primary;
                      break;
                  }
                }
                
                return (
                  <TouchableOpacity
                    key={dayIndex}
                    style={[
                      styles.day,
                      hasDeadlines && {
                        backgroundColor: dayBackgroundColor,
                        borderColor: dayBorderColor,
                        borderWidth: 1,
                      }
                    ]}
                    onPress={() => day && handleDayPress(day)}
                    disabled={!day || !hasDeadlines}
                    activeOpacity={hasDeadlines ? 0.7 : 1}
                  >
                    {day && (
                      <>
                        <Text style={[
                          styles.dayNumber,
                          { color: dayTextColor },
                          isToday && [styles.todayNumber, { color: theme.colors.primary, backgroundColor: theme.colors.primaryLight }],
                          hasDeadlines && !isToday && { color: dayTextColor }
                        ]}>
                          {day}
                        </Text>
                        {dayCampaigns.length > 0 && (
                          <View style={styles.campaignDots}>
                            {dayCampaigns.slice(0, 3).map((_, index) => {
                              let dotColor = theme.colors.primary;
                              if (deadlineStatus === 'overdue') {
                                dotColor = theme.colors.error;
                              } else if (deadlineStatus === 'dueToday') {
                                dotColor = theme.colors.warning;
                              }
                              
                              return (
                                <View key={index} style={[styles.campaignDot, { backgroundColor: dotColor }]} />
                              );
                            })}
                            {dayCampaigns.length > 3 && (
                              <Text style={[styles.moreDots, { color: dayTextColor }]}>+{dayCampaigns.length - 3}</Text>
                            )}
                          </View>
                        )}
                      </>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.campaignsList}>
          <Text style={[styles.campaignsTitle, { color: theme.colors.text }]}>
            Kampanie w {months[selectedMonth.getMonth()].toLowerCase()}
          </Text>
          
          {monthCampaigns.length > 0 ? (
            monthCampaigns.map(campaign => {
              const partner = partners.find(p => p.id === campaign.partnerId);
              return partner ? (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onPress={() => router.push(`/campaigns/${campaign.id}`)}
                />
              ) : null;
            })
          ) : (
            <View style={[styles.emptyState, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderLight }]}>
              <CalendarIcon size={48} color={theme.colors.border} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>{t.noCampaignsThisMonth}</Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                {selectedPartners.length > 0
                  ? 'Brak kampanii od wybranych partnerów w tym miesiącu'
                  : t.scheduleCampaigns
                }
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Partner Filter Modal */}
      <Modal
        visible={showPartnerFilter}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity
              style={[styles.modalBackButton, { backgroundColor: theme.colors.borderLight }]}
              onPress={() => setShowPartnerFilter(false)}
            >
              <X size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Filter Partners</Text>
            <View style={styles.modalBackButton} />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.borderLight }]}
              onPress={clearAllPartners}
            >
              <Text style={[styles.actionButtonText, { color: theme.colors.textSecondary }]}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              onPress={selectAllPartners}
            >
              <Text style={[styles.actionButtonText, { color: 'white' }]}>Select All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.partnersList}>
            {partners.map(partner => {
              const isSelected = selectedPartners.includes(partner.id);
              const campaignCount = campaigns.filter(c => 
                c.partnerId === partner.id && 
                new Date(c.deadline).getMonth() === selectedMonth.getMonth() &&
                new Date(c.deadline).getFullYear() === selectedMonth.getFullYear()
              ).length;

              return (
                <TouchableOpacity
                  key={partner.id}
                  style={[
                    styles.partnerOption,
                    { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.borderLight },
                    isSelected && { backgroundColor: theme.colors.primaryLight }
                  ]}
                  onPress={() => togglePartnerSelection(partner.id)}
                >
                  <View style={styles.partnerInfo}>
                    <View style={[styles.partnerAvatar, { backgroundColor: theme.colors.primary }]}>
                      <Text style={styles.partnerAvatarText}>
                        {partner.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.partnerDetails}>
                      <Text style={[styles.partnerName, { color: theme.colors.text }]}>{partner.name}</Text>
                      <Text style={[styles.partnerCompany, { color: theme.colors.textSecondary }]}>{partner.company}</Text>
                      {campaignCount > 0 && (
                        <Text style={[styles.campaignCount, { color: theme.colors.primary }]}>
                          {campaignCount} campaign{campaignCount !== 1 ? 's' : ''} this month
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={[
                    styles.checkbox,
                    { borderColor: theme.colors.border },
                    isSelected && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                  ]}>
                    {isSelected && <Check size={16} color="white" />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={[styles.modalFooter, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setShowPartnerFilter(false)}
            >
              <Text style={styles.applyButtonText}>
                Apply Filter ({selectedPartners.length} selected)
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Day Detail Modal */}
      <Modal
        visible={showDayModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity
              style={[styles.modalBackButton, { backgroundColor: theme.colors.borderLight }]}
              onPress={handleModalClose}
            >
              <ArrowLeft size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <View style={styles.modalTitleSection}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Terminy</Text>
              <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>{formatSelectedDate()}</Text>
            </View>
            <View style={styles.modalBackButton} />
          </View>
          
          <ScrollView style={styles.modalContent}>
            {selectedDayCampaigns.length > 0 ? (
              <>
                <View style={[styles.modalStats, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.shadow }]}>
                  <View style={styles.modalStatItem}>
                    <Clock size={20} color={theme.colors.primary} />
                    <Text style={[styles.modalStatText, { color: theme.colors.text }]}>
                      {selectedDayCampaigns.length} {selectedDayCampaigns.length === 1 ? 'termin' : selectedDayCampaigns.length < 5 ? 'terminy' : 'terminów'}
                    </Text>
                  </View>
                </View>
                
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
              </>
            ) : (
              <View style={styles.modalEmptyState}>
                <CalendarIcon size={48} color={theme.colors.border} />
                <Text style={[styles.modalEmptyTitle, { color: theme.colors.text }]}>{t.noDeadlines}</Text>
                <Text style={[styles.modalEmptyText, { color: theme.colors.textSecondary }]}>
                  Brak terminów kampanii w tym dniu
                </Text>
              </View>
            )}
          </ScrollView>
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
    clearButton: {
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
    dayNumber: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      marginBottom: 4,
    },
    todayNumber: {
      fontFamily: 'Inter-Bold',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      overflow: 'hidden',
    },
    campaignDots: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 2,
    },
    campaignDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    moreDots: {
      fontSize: 10,
      fontFamily: 'Inter-Medium',
      marginLeft: 2,
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
    modalBackButton: {
      padding: 8,
      borderRadius: 8,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalTitleSection: {
      flex: 1,
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      marginBottom: 2,
    },
    modalSubtitle: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      textAlign: 'center',
    },
    modalContent: {
      flex: 1,
    },
    modalActions: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 16,
      gap: 12,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    actionButtonText: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
    },
    partnersList: {
      flex: 1,
    },
    partnerOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
    },
    partnerInfo: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    partnerAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    partnerAvatarText: {
      fontSize: 14,
      fontFamily: 'Inter-Bold',
      color: 'white',
    },
    partnerDetails: {
      flex: 1,
    },
    partnerName: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      marginBottom: 2,
    },
    partnerCompany: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      marginBottom: 2,
    },
    campaignCount: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 4,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalFooter: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderTopWidth: 1,
    },
    applyButton: {
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    applyButtonText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: 'white',
    },
    modalStats: {
      marginHorizontal: 20,
      marginTop: 20,
      borderRadius: 12,
      padding: 16,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    modalStatItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    modalStatText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
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
  });
}