import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useDispatch, useSelector } from 'react-redux';
import {
  Clock,
  Timer,
  Snowflake,
  CalendarDays,
  SquareChartGantt,
} from 'lucide-react-native';
import MainLayout from '../../components/layout/MainLayout';
import { logout, setAlert } from '../../store/actions/authActions';
import {
  getAttendanceHistory,
  punchOut,
} from '../../store/actions/attendanceActions';
import { dateAndTime } from '../../utils/formattedDateandTime';
import { Colors, Fonts, GlobalText } from '../../utils/GlobalText';

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { history, historyLoading, punchOutLoading } = useSelector(
    state => state.attendance,
  );
  const [isProcessing, setIsProcessing] = useState(false);

  console.log('🏠 Home Screen rendered');
  console.log('📊 historyLoading:', historyLoading);
  console.log('📊 history:', history);
  console.log('📊 history length:', history?.length);

  const [currentDateTime, setCurrentDateTime] = useState(
    dateAndTime(new Date()),
  );

  const rawName = user?.email?.split('@')[0]?.split('.')[0] || 'Developer';
  const userName =
    rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();

  useEffect(() => {
    console.log('🔄 HomeScreen mounted, fetching attendance history...');
    dispatch(getAttendanceHistory());

    const interval = setInterval(() => {
      setCurrentDateTime(dateAndTime(new Date()));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Log when history changes
  useEffect(() => {
    console.log('📊 history updated:', history);
    if (history?.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = history.find(record => {
        const recordDate = record.date.split('T')[0];
        return recordDate === today;
      });
      console.log('📊 todayRecord:', todayRecord);
    }
  }, [history]);

  const handleQuickActionPress = (route, label) => {
    if (isProcessing) return; // 👈 Processing hai to return

    if (route === 'DailyPuch') {
      if (isUserCheckedIn) {
        dispatch(setAlert('You are already punched in!', 'error'));
        return;
      }
      console.log('👉 Navigating to DailyPuch');
      navigation.navigate(route);
    } else {
      dispatch(
        setAlert(
          `✨ ${label} ${GlobalText.alerts.comingSoon || 'Coming Soon!'} ✨`,
          'info',
        ),
      );
    }
  };

  const handlePunchOut = async () => {
    Alert.alert(
      'Punch Out',
      'Are you sure you want to punch out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Punch Out',
          onPress: async () => {
            try {
              setIsProcessing(true); // 👈 Screen freeze
              const result = await dispatch(punchOut());
              if (result.success) {
                dispatch(setAlert('✅ Punched out successfully!', 'success'));
                await dispatch(getAttendanceHistory()); // Refresh with await
              }
            } catch (error) {
              console.error('Punch out error:', error);
              dispatch(setAlert('❌ Punch out failed!', 'error'));
            } finally {
              setIsProcessing(false); // 👈 Screen unfreeze
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true },
    );
  };

  const quickActions = [
    {
      label: GlobalText.home.dailyPunch || 'Daily Punch',
      icon: Timer,
      route: 'DailyPuch',
    },
    {
      label: GlobalText.home.idleTracking || 'Break Time',
      icon: Snowflake,
      route: null,
    },
    {
      label: GlobalText.home.leaveManagement || 'Leave',
      icon: CalendarDays,
      route: null,
    },
    {
      label: GlobalText.home.reports || 'Reports',
      icon: SquareChartGantt,
      route: null,
    },
  ];

  const formatTime = dateString => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (e) {
      return 'N/A';
    }
  };

  const formatDate = dateString => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      });
    } catch (e) {
      return '';
    }
  };

  // Saare records mein se aaj ka record dhundo
  const today = new Date().toISOString().split('T')[0];
  const todayRecord = history?.find(record => {
    const recordDate = record.date.split('T')[0];
    return recordDate === today;
  });

  console.log('📊 today:', today);
  console.log('📊 todayRecord found:', todayRecord);

  // Sessions se data extract karo
  const sessions = todayRecord?.sessions || [];
  const lastSession = sessions[sessions.length - 1];

  const todaysPunchIn = lastSession?.punchIn;
  const todaysPunchOut = lastSession?.punchOut;

  const lastImage = lastSession?.punchInLocation?.imageUrl;

  // Total minutes calculate karo
  let totalMinutes = 0;
  sessions.forEach(session => {
    totalMinutes += session.durationMinutes || 0;
  });

  const isUserCheckedIn = todayRecord?.status === 'PRESENT' && !todaysPunchOut;

  console.log('📊 sessions:', sessions);
  console.log('📊 lastSession:', lastSession);
  console.log('📊 punchIn:', todaysPunchIn);
  console.log('📊 punchOut:', todaysPunchOut);
  console.log('📊 totalMinutes:', totalMinutes);
  console.log('📊 isUserCheckedIn:', isUserCheckedIn);

  return (
    <MainLayout hideBottomNav={false}>
      {isProcessing && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.overlayText}>Processing...</Text>
        </View>
      )}
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.timeCard}>
            <Text style={styles.date}>
              {currentDateTime.formattedDate.toUpperCase()}
            </Text>
            <Text style={styles.welcome}>
              {GlobalText.home.welcomeBack || 'Welcome back,'}{' '}
              <Text style={styles.name}>{userName}!</Text>
            </Text>
            <View style={styles.timeInner}>
              <View style={styles.timeLeftSection}>
                <Text style={styles.timeLabel}>
                  {GlobalText.home.currentTime || 'CURRENT TIME'}
                </Text>
                <Text style={styles.timeText}>
                  {currentDateTime.formattedTime}
                </Text>
              </View>
              <Clock size={wp('7%')} color={Colors.textDark} />
            </View>
          </View>

          <Text style={styles.sectionTitle}>
            {GlobalText.home.quickActions || 'QUICK ACTIONS'}
          </Text>
          <View style={styles.grid}>
            {quickActions.map((item, index) => {
              const Icon = item.icon;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.gridCard, isProcessing && styles.disabledCard]}
                  onPress={() => handleQuickActionPress(item.route, item.label)}
                  activeOpacity={0.7}
                  disabled={isProcessing} // 👈 Disable when processing
                >
                  <Icon
                    size={wp('7%')}
                    color={isProcessing ? Colors.disabled : Colors.icon}
                  />
                  <Text
                    style={[
                      styles.gridText,
                      isProcessing && styles.disabledText,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>
            {GlobalText.home.todaysActivity || "TODAY'S ACTIVITY"}
          </Text>

          {historyLoading ? (
            <View style={styles.loadingCard}>
              <Text style={styles.loadingText}>Loading attendance...</Text>
            </View>
          ) : todayRecord ? (
            <View style={styles.attendanceCard}>
              <View style={styles.attendanceHeader}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: hp('1.5%'),
                  }}
                >
                  <Image
                    src={lastImage}
                    style={{
                      width: wp('10%'),
                      height: wp('10%'),
                      borderRadius: wp('50%'),
                    }}
                  />
                  <View>
                    <Text style={styles.punchStatus}>
                      {isUserCheckedIn ? 'PUNCHED IN' : 'NOT PUNCHED IN'}
                    </Text>
                    <Text style={styles.punchDate}>
                      {formatDate(todaysPunchIn)}
                    </Text>
                    <Text style={styles.punchTime}>
                      {formatTime(todaysPunchIn)}
                    </Text>
                  </View>
                </View>

                {isUserCheckedIn && (
                  <TouchableOpacity
                    style={[
                      styles.punchOutButton,
                      isProcessing && styles.disabledButton,
                    ]}
                    onPress={handlePunchOut}
                    disabled={punchOutLoading || isProcessing} // 👈 Disable when processing
                  >
                    <Text style={styles.punchOutText}>
                      {punchOutLoading || isProcessing
                        ? 'Processing...'
                        : 'Punch Out'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>PUNCH IN</Text>
                <Text style={styles.tableHeaderText}>DURATION</Text>
                <Text style={styles.tableHeaderText}>PUNCH OUT</Text>
              </View>

              {sessions.map((session, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>
                    {session.punchIn ? formatTime(session.punchIn) : '---'}
                  </Text>
                  <Text style={styles.tableCell}>
                    {session.durationMinutes
                      ? `${session.durationMinutes} mins`
                      : '---'}
                  </Text>
                  <Text style={styles.tableCell}>
                    {session.punchOut ? formatTime(session.punchOut) : '---'}
                  </Text>
                </View>
              ))}

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Working:</Text>
                <Text style={styles.totalValue}>
                  {totalMinutes > 0 ? `${totalMinutes} Minutes` : '---'}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Clock size={wp('10%')} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>No attendance recorded today</Text>
              <TouchableOpacity
                style={[
                  styles.punchNowButton,
                  isProcessing && styles.disabledButton,
                ]}
                onPress={() => {
                  if (isProcessing) return; // 👈 Processing hai to return
                  if (isUserCheckedIn) {
                    dispatch(
                      setAlert('You are already punched in!', 'error'),
                    );
                  } else {
                    navigation.navigate('DailyPuch');
                  }
                }}
                disabled={isProcessing} // 👈 Disable when processing
              >
                <Text style={styles.punchNowText}>Punch In Now</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </MainLayout>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: hp('2%') },
  date: {
    color: Colors.primary,
    fontSize: wp('3%'),
    letterSpacing: wp('0.2%'),
    fontFamily: Fonts.medium,
    marginBottom: hp('0.5%'),
  },
  welcome: {
    color: Colors.textPrimary,
    fontSize: wp('5.5%'),
    fontFamily: Fonts.medium,
    marginBottom: hp('1%'),
  },
  name: {
    color: Colors.secondary,
    fontSize: wp('5.5%'),
    fontFamily: Fonts.bold,
  },
  timeCard: {
    marginTop: hp('2%'),
    borderRadius: wp('5%'),
    padding: wp('6%'),
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: wp('0.1%'),
  },
  timeLabel: {
    color: Colors.shadow,
    fontSize: wp('3%'),
    letterSpacing: wp('0.1%'),
    fontFamily: Fonts.medium,
    marginBottom: hp('0.5%'),
  },
  timeInner: {
    marginTop: hp('2%'),
    backgroundColor: Colors.secondary,
    borderRadius: wp('4%'),
    padding: wp('5%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeLeftSection: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: hp('0.5%'),
  },
  timeText: {
    fontSize: wp('6%'),
    fontFamily: Fonts.bold,
    color: Colors.textDark,
  },
  sectionTitle: {
    marginTop: hp('4%'),
    marginBottom: hp('1.5%'),
    color: Colors.textSecondary,
    fontSize: wp('3.2%'),
    letterSpacing: wp('0.2%'),
    fontFamily: Fonts.medium,
    paddingHorizontal: wp('5%'),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: wp('5%'),
  },
  gridCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: wp('4%'),
    paddingVertical: hp('3%'),
    alignItems: 'center',
    marginBottom: hp('2%'),
    borderColor: Colors.border,
    borderWidth: wp('0.1%'),
  },
  gridText: {
    color: Colors.iconTitle,
    marginTop: hp('1%'),
    fontSize: wp('3.2%'),
    fontFamily: Fonts.regular,
  },

  attendanceCard: {
    backgroundColor: Colors.surface,
    borderRadius: wp('5%'),
    padding: wp('5%'),
    marginHorizontal: wp('5%'),
    borderColor: Colors.border,
    borderWidth: wp('0.1%'),
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('2%'),
    paddingBottom: hp('1.5%'),
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  punchStatus: {
    color: Colors.primary,
    fontSize: wp('3%'),
    fontFamily: Fonts.medium,
  },
  punchDate: {
    color: Colors.textPrimary,
    fontSize: wp('2.8%'),
    fontFamily: Fonts.light,
    marginTop: hp('0.3%'),
  },
  punchTime: {
    color: Colors.textPrimary,
    fontSize: wp('4%'),
    fontFamily: Fonts.medium,
    marginTop: hp('0.3%'),
  },
  punchOutButton: {
    backgroundColor: Colors.error,
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1%'),
    borderRadius: wp('2%'),
  },
  punchOutText: {
    color: Colors.textDark,
    fontSize: wp('3.2%'),
    fontFamily: Fonts.medium,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: hp('1%'),
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableHeaderText: {
    color: Colors.primary,
    fontSize: wp('3%'),
    fontFamily: Fonts.medium,
    flex: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: hp('1.5%'),
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableCell: {
    color: Colors.textPrimary,
    fontSize: wp('3%'),
    fontFamily: Fonts.light,
    flex: 1,
    textAlign: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: hp('1.5%'),
    paddingTop: hp('1%'),
  },
  totalLabel: {
    color: Colors.secondary,
    fontSize: wp('3%'),
    fontFamily: Fonts.medium,
    marginRight: wp('2%'),
  },
  totalValue: {
    color: Colors.primary,
    fontSize: wp('3.2%'),
    fontFamily: Fonts.medium,
  },

  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: wp('5%'),
    padding: hp('4%'),
    marginHorizontal: wp('5%'),
    alignItems: 'center',
    borderColor: Colors.border,
    borderWidth: wp('0.1%'),
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: wp('3.5%'),
    fontFamily: Fonts.light,
    marginVertical: hp('2%'),
  },
  punchNowButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('1.5%'),
    borderRadius: wp('5%'),
  },
  punchNowText: {
    color: Colors.textDark,
    fontSize: wp('3.5%'),
    fontFamily: Fonts.medium,
  },
  loadingCard: {
    backgroundColor: Colors.surface,
    borderRadius: wp('5%'),
    padding: hp('3%'),
    marginHorizontal: wp('5%'),
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: wp('3.5%'),
    fontFamily: Fonts.light,
  },
  bottomPadding: { height: hp('2%') },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: Colors.disabled,
  },
  disabledCard: {
    opacity: 0.5,
  },
  disabledText: {
    color: Colors.disabled,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  overlayText: {
    color: Colors.textPrimary,
    fontSize: wp('4%'),
    fontFamily: Fonts.medium,
    marginTop: hp('2%'),
  },
  containerDisabled: {
    opacity: 0.5,
  },
});
