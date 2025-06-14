import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '@/hooks/useData';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import CampaignCard from '@/components/CampaignCard';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ArrowLeft, Clock } from 'lucide-react-native';

export default function CalendarScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { partners, campaigns, loading } = useData();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);
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
      
      const matchesPartner = selectedPartner === null || campaign.partnerId === selectedPartner;
      
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

  const weeks = getWeeksInMonth();
  const selectedDayCampaigns = getSelectedDayCampaigns();

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>{t.loading}</Text>
        </View>
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
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.partnerScrollContent}
          >
            <TouchableOpacity
              style={[
                styles.partnerChip,
                { backgroundColor: theme.colors.borderLight },
                selectedPartner === null && { backgroundColor: theme.colors.primary }
              ]}
              onPress={() => setSelectedPartner(null)}
            >
              <Text style={[
                styles.partnerChipText,
                { color: theme.colors.textSecondary },
                selectedPartner === null && { color: 'white' }
              ]} numberOfLines={1}>
                {t.allPartners}
              </Text>
            </TouchableOpacity>
            
            {partners.map(partner => (
              <TouchableOpacity
                key={partner.id}
                style={[
                  styles.partnerChip,
                  { backgroundColor: theme.colors.borderLight },
                  selectedPartner === partner.id && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => setSelectedPartner(partner.id)}
              >
                <Text style={[
                  styles.partnerChipText,
                  { color: theme.colors.textSecondary },
                  selectedPartner === partner.id && { color: 'white' }
                ]} numberOfLines={1}>
                  {partner.company}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
                const isToday = day && 
                  new Date().getDate() === day &&
                  new Date().getMonth() === selectedMonth.getMonth() &&
                  new Date().getFullYear() === selectedMonth.getFullYear();
                const hasDeadlines = dayCampaigns.length > 0;
                
                return (
                  <TouchableOpacity
                    key={dayIndex}
                    style={[
                      styles.day,
                      hasDeadlines && [styles.dayWithDeadlines, { backgroundColor: theme.colors.borderLight, borderColor: theme.colors.border }]
                    ]}
                    onPress={() => day && handleDayPress(day)}
                    disabled={!day || !hasDeadlines}
                    activeOpacity={hasDeadlines ? 0.7 : 1}
                  >
                    {day && (
                      <>
                        <Text style={[
                          styles.dayNumber,
                          { color: theme.colors.text },
                          isToday && [styles.todayNumber, { color: theme.colors.primary, backgroundColor: theme.colors.primaryLight }],
                          hasDeadlines && { color: theme.colors.primary }
                        ]}>
                          {day}
                        </Text>
                        {dayCampaigns.length > 0 && (
                          <View style={styles.campaignDots}>
                            {dayCampaigns.slice(0, 3).map((_, index) => (
                              <View key={index} style={[styles.campaignDot, { backgroundColor: theme.colors.primary }]} />
                            ))}
                            {dayCampaigns.length > 3 && (
                              <Text style={[styles.moreDots, { color: theme.colors.primary }]}>+{dayCampaigns.length - 3}</Text>
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
                  partner={partner}
                  onPress={() => router.push(`/campaigns/${campaign.id}`)}
                />
              ) : null;
            })
          ) : (
            <View style={[styles.emptyState, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderLight }]}>
              <CalendarIcon size={48} color={theme.colors.border} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>{t.noCampaignsThisMonth}</Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                {selectedPartner 
                  ? 'Brak kampanii od tego partnera w wybranym miesiącu'
                  : t.scheduleCampaigns
                }
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

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
                        partner={partner}
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      fontFamily: 'Inter-Medium',
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
      paddingVertical: 10,
      borderBottomWidth: 1,
    },
    partnerScrollContent: {
      paddingHorizontal: 20,
    },
    partnerChip: {
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginRight: 8,
      minHeight: 28,
      justifyContent: 'center',
      alignItems: 'center',
    },
    partnerChipText: {
      fontSize: 13,
      fontFamily: 'Inter-SemiBold',
      lineHeight: 16,
      textAlign: 'center',
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
    dayWithDeadlines: {
      borderWidth: 1,
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