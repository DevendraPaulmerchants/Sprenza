// src/screens/home/punch/DailyPunch.jsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  StatusBar,
  Alert,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {
  MapPin,
  CheckCircle,
  Loader,
  Frown,
  Camera,
  Upload,
  CheckCircle2,
  XCircle,
  Map,
  AlertTriangle,
  Briefcase,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { Fonts } from '../../../utils/GlobalText';
import MainLayout from '../../../components/layout/MainLayout';
import {
  punchIn,
  getAttendanceHistory,
} from '../../../store/actions/attendanceActions';
import { setAlert } from '../../../store/actions/authActions';
import GeofenceMapModal from '../../../components/modals/GeofenceMapModal';
import RemoteLocationModal from '../../../components/modals/RemoteLocationModal';

const DailyPunch = ({ navigation }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const C = theme.colors;

  const { punchInLoading, isCheckedIn, location, punchError, history } =
    useSelector(state => state.attendance);

  // ── Profile — for sales team detection ────────────
  const { profile } = useSelector(state => state.employeeProfile);
  const department = profile?.[0]?.department || '';
  const isSalesTeam = department.toLowerCase().includes('sales');

  const [uiState, setUiState] = useState('idle');
  const [mapVisible, setMapVisible] = useState(false);
  const [isInsideGeofence, setIsInsideGeofence] = useState(null);
  const [stepStatuses, setStepStatuses] = useState({
    location: 'pending',
    selfie: 'pending',
    upload: 'pending',
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [distance, setDistance] = useState(null);
  const [userCoords, setUserCoords] = useState(null);
  const [userAddress, setUserAddress] = useState(null);

  // ── Remote location modal (sales team only) ────────
  const [remoteModalVisible, setRemoteModalVisible] = useState(false);
  const [pendingRemotePunch, setPendingRemotePunch] = useState(false);

  // Check if user has an active session (punched in but not out)
  const today = new Date().toISOString().split('T')[0];
  const todayRecord = history?.find(r => r.date.split('T')[0] === today);
  const hasActiveSession = todayRecord?.isPunchedIn === true;

  // ── Animations ─────────────────────────────────
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(hp('4%'))).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const dotOpacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 9,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();
    startPulse();
    startWave();
    startDotBlink();

    return () => {
      clearInterval(timeInterval);
    };
  }, []);

  useEffect(() => {
    if (punchInLoading) {
      setUiState('loading');
      startRotation();
    } else if (punchError) {
      setUiState('error');
      stopRotation();
      setTimeout(() => setUiState('idle'), 3000);
    } else {
      setUiState('idle');
      stopRotation();
    }
  }, [punchInLoading, punchError]);

  useEffect(() => {
    if (uiState === 'loading') {
      setStepStatuses({
        location: 'success',
        selfie: 'success',
        upload: 'loading',
      });
    } else if (uiState === 'success') {
      setStepStatuses({
        location: 'success',
        selfie: 'success',
        upload: 'success',
      });
    } else if (uiState === 'error') {
      setStepStatuses({
        location: 'success',
        selfie: 'success',
        upload: 'error',
      });
    } else {
      setStepStatuses({
        location: 'pending',
        selfie: 'pending',
        upload: 'pending',
      });
    }
  }, [uiState]);

  // ── Animation helpers ──────────────────────────
  const startPulse = () =>
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.07,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
      ]),
    ).start();

  const startRotation = () => {
    rotateAnim.setValue(0);
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  };

  const stopRotation = () => {
    rotateAnim.stopAnimation();
    rotateAnim.setValue(0);
  };

  const startWave = () =>
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ).start();

  const startDotBlink = () =>
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacityAnim, {
          toValue: 0.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(dotOpacityAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();

  const waveScale = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.9],
  });
  const waveOpacity = waveAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0.45, 0.15, 0],
  });
  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // ── Step rendering ─────────────────────────────
  const getStepIcon = (step, status) => {
    const size = wp('4%');
    if (step === 'upload' && status === 'loading') {
      return (
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Loader size={size} color={C.primary} />
        </Animated.View>
      );
    }
    switch (status) {
      case 'success':
        return <CheckCircle2 size={size} color={C.success} />;
      case 'error':
        return <XCircle size={size} color={C.error} />;
      case 'loading':
        return <Loader size={size} color={C.primary} />;
      default:
        const DefaultIcon = {
          location: MapPin,
          selfie: Camera,
          upload: Upload,
        }[step];
        return DefaultIcon ? (
          <DefaultIcon size={size} color={C.disabled} />
        ) : null;
    }
  };

  const getStepColor = s =>
    ({ success: C.success, error: C.error, loading: C.primary }[s] ||
    C.disabled);

  const getStepLabel = step => {
    switch (step) {
      case 'location':
        return t.attendance.locationStep;
      case 'selfie':
        return t.attendance.selfieStep;
      case 'upload':
        return t.attendance.uploadStep;
      default:
        return step;
    }
  };

  // ── Punch circle derived values ────────────────
  const outsideGeofence = isInsideGeofence === false;

  const isPunchDisabled = isSalesTeam
    ? punchInLoading || hasActiveSession
    : punchInLoading || outsideGeofence || hasActiveSession;

  const getAccentColor = () => {
    if (hasActiveSession) return C.warning;
    if (isSalesTeam && outsideGeofence) return C.warning;
    if (!isSalesTeam && outsideGeofence) return C.error;
    return C.primary;
  };

  const accentColor = getAccentColor();

  const getCircleIcon = () => {
    if (hasActiveSession)
      return <CheckCircle size={wp('14%')} color={C.textDark} />;
    if (!isSalesTeam && outsideGeofence)
      return <XCircle size={wp('14%')} color={C.textDark} />;
    if (isSalesTeam && outsideGeofence)
      return <Briefcase size={wp('14%')} color={C.textDark} />;
    if (uiState === 'loading')
      return (
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Loader size={wp('14%')} color={C.textDark} />
        </Animated.View>
      );
    if (uiState === 'success')
      return <CheckCircle size={wp('14%')} color={C.textDark} />;
    if (uiState === 'error')
      return <Frown size={wp('14%')} color={C.textDark} />;
    return <Camera size={wp('14%')} color={C.textDark} />;
  };

  const getCircleLabel = () => {
    if (hasActiveSession)
      return t.attendance.alreadyPunchedIn || 'ALREADY PUNCHED IN';
    if (!isSalesTeam && outsideGeofence)
      return t.attendance.outsideGeofenceStatus || 'Out of Range';
    if (isSalesTeam && outsideGeofence)
      return t?.remoteLocation?.remotePunchIn || 'REMOTE PUNCH IN';
    if (uiState === 'loading')
      return t.attendance.processing || 'PROCESSING...';
    if (uiState === 'success') return t.attendance.success || 'SUCCESS!';
    if (uiState === 'error') return t.attendance.error || 'ERROR!';
    return t.attendance.punchIn;
  };

  const getCircleSubLabel = () => {
    if (hasActiveSession)
      return (
        t.attendance.alreadyHaveActiveSession || 'You have an active session'
      );
    if (!isSalesTeam && outsideGeofence)
      return t.attendance.openMap || 'Open map to verify';
    if (isSalesTeam && outsideGeofence)
      return t?.remoteLocation?.tapToConfirm || 'Tap to confirm location';
    if (uiState === 'error') return t.attendance.tapRetry || 'Tap to retry';
    return '';
  };

  const getSyncLabel = () => {
    if (hasActiveSession) return t.attendance.sessionActive || 'ACTIVE SESSION';
    if (isSalesTeam && isInsideGeofence === false)
      return t?.remoteLocation?.remoteLabel || 'REMOTE LOCATION';
    if (isInsideGeofence === false)
      return t.attendance.outsideGeofenceStatus || 'OUTSIDE GEOFENCE';
    if (isInsideGeofence === true)
      return t.attendance.insideGeofenceStatus || 'INSIDE GEOFENCE';
    if (uiState === 'error') return t.attendance.failed || 'FAILED';
    if (uiState === 'loading') return t.attendance.processing || 'PROCESSING';
    return t.attendance.readyToSync;
  };

  const getGeofenceMessage = () => {
    if (hasActiveSession) {
      return t.attendance.cannotPunchTwice || 'You are already punched in';
    }
    if (isSalesTeam && isInsideGeofence === false) {
      return (
        t?.remoteLocation?.salesOutsideMsg ||
        'Remote punch-in available for sales team'
      );
    }
    if (isInsideGeofence === true) {
      return t.geofence.youAreInside || 'You are inside the geofence';
    }
    if (isInsideGeofence === false) {
      return t.geofence.youAreOutside || 'You are outside the geofence';
    }
    return t.geofence.checking || 'Checking your location...';
  };

  // Sync dot / text color
  const syncDotColor = hasActiveSession
    ? C.warning
    : isSalesTeam && isInsideGeofence === false
    ? C.warning
    : isInsideGeofence === false
    ? C.error
    : isInsideGeofence === true
    ? C.success
    : C.success;

  const syncTextColor = hasActiveSession
    ? C.warning
    : isSalesTeam && isInsideGeofence === false
    ? C.warning
    : isInsideGeofence === false
    ? C.error
    : isInsideGeofence === true
    ? C.success
    : C.textSecondary;

  // ── Geofence strip color ────────────────────────
  const getGeofenceStripColors = () => {
    if (hasActiveSession) return { bg: C.warning + '18', border: C.warning + '50', text: C.warning };
    if (isSalesTeam && isInsideGeofence === false)
      return { bg: C.warning + '18', border: C.warning + '50', text: C.warning };
    if (isInsideGeofence) return { bg: C.success + '18', border: C.success + '50', text: C.success };
    return { bg: C.error + '18', border: C.error + '50', text: C.error };
  };

  const geofenceStripColors = getGeofenceStripColors();

  const getGeofenceStripIcon = () => {
    const size = wp('3.5%');
    if (hasActiveSession) return <CheckCircle2 size={size} color={C.warning} />;
    if (isSalesTeam && isInsideGeofence === false)
      return <Briefcase size={size} color={C.warning} />;
    if (isInsideGeofence)
      return <CheckCircle2 size={size} color={C.success} />;
    return <AlertTriangle size={size} color={C.error} />;
  };

  // ── Execute the actual punch ───────────────────
  const executePunch = async () => {
    const result = await dispatch(punchIn());
    if (result?.success) {
      dispatch(setAlert(t.alerts.punchInSuccess, 'success'));
      await dispatch(getAttendanceHistory());
      navigation.replace('Home');
    }
  };

  // ── Punch handler ──────────────────────────────
  const handlePunch = async () => {
    if (hasActiveSession) {
      dispatch(
        setAlert(
          t.alerts.alreadyPunchedIn || 'You are already punched in',
          'warning',
        ),
      );
      return;
    }

    if (punchInLoading) return;

    // Non-sales: block if outside geofence
    if (!isSalesTeam && outsideGeofence) {
      dispatch(setAlert(t.alerts.outsideGeofence, 'error'));
      return;
    }

    // Sales team + outside geofence → show remote location modal
    if (isSalesTeam && outsideGeofence) {
      setRemoteModalVisible(true);
      return;
    }

    // Inside geofence OR sales team inside — proceed directly
    await executePunch();
  };

  // ── Remote modal confirm ───────────────────────
  const handleRemoteConfirm = async () => {
    setPendingRemotePunch(true);
    setRemoteModalVisible(false);
    await executePunch();
    setPendingRemotePunch(false);
  };

  const handleGeofenceStatusChange = (status, distanceValue, coords, address) => {
    setIsInsideGeofence(status);
    setDistance(distanceValue);
    if (coords) setUserCoords(coords);
    if (address) setUserAddress(address);
  };

  return (
    <MainLayout
      title={
        hasActiveSession ? t.attendance.alreadyPunchedIn : t.attendance.punchIn
      }
      showBack
      headerBackgroundColor={C.background}
      hideBottomNav={false}
    >
      <StatusBar barStyle={C.statusBar} backgroundColor={C.background} />

      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            backgroundColor: C.background,
          },
        ]}
      >
        {/* Sales team badge */}
        {isSalesTeam && (
          <View
            style={[
              styles.salesBadge,
              { backgroundColor: C.warning + '15', borderColor: C.warning + '40' },
            ]}
          >
            <Briefcase size={wp('3.5%')} color={C.warning} />
            <Text style={[styles.salesBadgeText, { color: C.warning }]}>
              {t?.remoteLocation?.salesTeamBadge || 'Sales Team — Remote Punch-In Enabled'}
            </Text>
          </View>
        )}

        {/* Status Card */}
        <View
          style={[
            styles.statusCard,
            {
              backgroundColor: C.surface,
              borderColor: C.border,
            },
          ]}
        >
          <Text style={[styles.statusCardLabel, { color: C.primary }]}>
            {t.attendance.currentStatus}
          </Text>
          <Text style={[styles.statusCardValue, { color: C.textPrimary }]}>
            {hasActiveSession
              ? t.attendance.punchedIn
              : t.attendance.notPunched}
          </Text>

          <View style={styles.locationRow}>
            <View style={styles.locationLeft}>
              <View
                style={[
                  styles.locationIconWrap,
                  { backgroundColor: C.primary + '20' },
                ]}
              >
                <MapPin size={wp('3.8%')} color={C.primary} />
              </View>
              <Text
                style={[styles.locationText, { color: C.textSecondary }]}
                numberOfLines={1}
              >
                {location?.name || t.attendance.defaultLocation}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.mapBadge, { backgroundColor: C.primary }]}
              onPress={() => setMapVisible(true)}
              activeOpacity={0.8}
              disabled={hasActiveSession}
            >
              <Map size={wp('3%')} color={C.textDark} />
              <Text style={[styles.mapBadgeText, { color: C.textDark }]}>
                {t.attendance.map || 'MAP'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Geofence strip */}
          <View
            style={[
              styles.geofenceStrip,
              {
                backgroundColor: geofenceStripColors.bg,
                borderColor: geofenceStripColors.border,
              },
            ]}
          >
            {getGeofenceStripIcon()}
            <Text
              style={[
                styles.geofenceStripText,
                { color: geofenceStripColors.text },
              ]}
            >
              {getGeofenceMessage()}
              {!hasActiveSession &&
                distance !== null &&
                !isInsideGeofence &&
                ` - ${Math.round(distance)} ${t.geofence.meters || 'm'}`}
            </Text>
          </View>
        </View>

        {/* Punch Circle */}
        <View style={styles.punchSection}>
          {!hasActiveSession &&
            !(isSalesTeam ? false : outsideGeofence) &&
            uiState !== 'error' && (
              <Animated.View
                style={[
                  styles.waveRing,
                  {
                    transform: [{ scale: waveScale }],
                    opacity: waveOpacity,
                    borderColor: accentColor,
                  },
                ]}
              />
            )}

          <TouchableOpacity
            onPress={handlePunch}
            disabled={isPunchDisabled}
            activeOpacity={isPunchDisabled ? 1 : 0.85}
          >
            <Animated.View
              style={[
                styles.punchCircle,
                { backgroundColor: accentColor, shadowColor: accentColor },
                !isPunchDisabled &&
                  uiState !== 'error' && { transform: [{ scale: pulseAnim }] },
                isPunchDisabled && { opacity: 0.78 },
              ]}
            >
              {getCircleIcon()}
              <Text style={[styles.punchLabel, { color: C.textDark }]}>
                {getCircleLabel()}
              </Text>
              <Text style={[styles.punchSubLabel, { color: C.textDark }]}>
                {getCircleSubLabel()}
              </Text>
            </Animated.View>
          </TouchableOpacity>

          {/* Sync pill */}
          <View
            style={[
              styles.syncPill,
              { backgroundColor: C.surface, borderColor: C.border },
              (isInsideGeofence === false || hasActiveSession) && {
                borderColor:
                  (isSalesTeam && isInsideGeofence === false
                    ? C.warning
                    : hasActiveSession
                    ? C.warning
                    : C.error) + '70',
              },
            ]}
          >
            <Animated.View
              style={[
                styles.syncDot,
                { backgroundColor: syncDotColor },
                isInsideGeofence === null &&
                  !hasActiveSession && { opacity: dotOpacityAnim },
              ]}
            />
            <Text style={[styles.syncText, { color: syncTextColor }]}>
              {getSyncLabel()}
            </Text>
          </View>
        </View>

        {/* Verification Steps */}
        <View
          style={[
            styles.stepsCard,
            {
              backgroundColor: C.surface,
              borderColor: C.border,
            },
          ]}
        >
          <Text style={[styles.stepsTitle, { color: C.textSecondary }]}>
            {t.attendance.verificationProcess}
          </Text>
          <View style={styles.stepsRow}>
            {['location', 'selfie', 'upload'].map((step, i) => (
              <React.Fragment key={step}>
                <View style={styles.stepItem}>
                  {getStepIcon(step, stepStatuses[step])}
                  <Text
                    style={[
                      styles.stepText,
                      { color: getStepColor(stepStatuses[step]) },
                    ]}
                  >
                    {getStepLabel(step)}
                  </Text>
                </View>
                {i < 2 && (
                  <View
                    style={[
                      styles.stepConnector,
                      { backgroundColor: C.border },
                      stepStatuses[step] === 'success' && {
                        backgroundColor: C.success,
                      },
                    ]}
                  />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Distance Info (non-sales outside) */}
        {!isSalesTeam &&
          !hasActiveSession &&
          isInsideGeofence === false &&
          distance !== null && (
            <View
              style={[
                styles.distanceInfo,
                { backgroundColor: C.surface, borderColor: C.border },
              ]}
            >
              <Text style={[styles.distanceText, { color: C.textSecondary }]}>
                {t.geofence.distanceToOffice || 'Distance to office'}:{' '}
                {Math.round(distance)} {t.geofence.meters || 'm'}
              </Text>
              <Text style={[styles.distanceHint, { color: C.warning }]}>
                {t.geofence.moveCloser || 'Please move closer to the office'}
              </Text>
            </View>
          )}

        {/* Distance Info (sales outside — informational only) */}
        {isSalesTeam &&
          !hasActiveSession &&
          isInsideGeofence === false &&
          distance !== null && (
            <View
              style={[
                styles.distanceInfo,
                {
                  backgroundColor: C.surface,
                  borderColor: C.warning + '40',
                },
              ]}
            >
              <Text style={[styles.distanceText, { color: C.textSecondary }]}>
                {t.geofence.distanceToOffice || 'Distance to office'}:{' '}
                {Math.round(distance)} {t.geofence.meters || 'm'}
              </Text>
              <Text style={[styles.distanceHint, { color: C.warning }]}>
                {t?.remoteLocation?.salesDistanceHint ||
                  'Tap the punch button to confirm remote punch-in'}
              </Text>
            </View>
          )}
      </Animated.View>

      {/* Geofence Map Modal */}
      <GeofenceMapModal
        visible={mapVisible}
        onClose={() => setMapVisible(false)}
        onStatusChange={handleGeofenceStatusChange}
        isSalesTeam={isSalesTeam}
      />

      {/* Remote Location Confirmation Modal (sales team only) */}
      <RemoteLocationModal
        visible={remoteModalVisible}
        onClose={() => setRemoteModalVisible(false)}
        onConfirm={handleRemoteConfirm}
        loading={pendingRemotePunch || punchInLoading}
        locationData={{
          latitude: userCoords?.latitude ?? null,
          longitude: userCoords?.longitude ?? null,
          address: userAddress,
          distance: distance,
        }}
      />
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp('5%'),
    paddingTop: hp('2.5%'),
    paddingBottom: hp('3%'),
  },

  // Sales badge
  salesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
    paddingHorizontal: wp('3.5%'),
    paddingVertical: hp('0.8%'),
    borderRadius: wp('2.5%'),
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginBottom: hp('1.5%'),
  },
  salesBadgeText: {
    fontSize: wp('2.8%'),
    fontFamily: Fonts.medium,
  },

  // Status Card
  statusCard: {
    borderRadius: wp('5%'),
    padding: wp('5%'),
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  statusCardLabel: {
    fontSize: wp('2.6%'),
    fontFamily: Fonts.medium,
    letterSpacing: 0.8,
    marginBottom: hp('0.5%'),
  },
  statusCardValue: {
    fontSize: wp('5%'),
    fontFamily: Fonts.bold,
    marginBottom: hp('2%'),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: wp('3%'),
  },
  locationIconWrap: {
    width: wp('7%'),
    height: wp('7%'),
    borderRadius: wp('2%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('2%'),
  },
  locationText: {
    fontSize: wp('3.2%'),
    fontFamily: Fonts.regular,
    flex: 1,
  },
  mapBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1.5%'),
    paddingHorizontal: wp('3.5%'),
    paddingVertical: hp('0.7%'),
    borderRadius: wp('2%'),
  },
  mapBadgeText: {
    fontSize: wp('2.8%'),
    fontFamily: Fonts.medium,
    letterSpacing: 0.5,
  },
  geofenceStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
    marginTop: hp('1.5%'),
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.9%'),
    borderRadius: wp('2.5%'),
    borderWidth: 1,
  },
  geofenceStripText: {
    fontSize: wp('2.8%'),
    fontFamily: Fonts.medium,
    flex: 1,
  },

  // Punch section
  punchSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: hp('3%'),
  },
  waveRing: {
    position: 'absolute',
    width: wp('52%'),
    height: wp('52%'),
    borderRadius: wp('26%'),
    borderWidth: 2,
    marginTop: -hp('7.5%'),
  },
  punchCircle: {
    width: wp('46%'),
    height: wp('46%'),
    borderRadius: wp('23%'),
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 12,
  },
  punchLabel: {
    marginTop: hp('1%'),
    fontSize: wp('3.5%'),
    fontFamily: Fonts.medium,
    letterSpacing: 0.3,
    textAlign: 'center',
    paddingHorizontal: wp('2%'),
  },
  punchSubLabel: {
    fontSize: wp('2.5%'),
    fontFamily: Fonts.regular,
    marginTop: 3,
    opacity: 0.8,
    textAlign: 'center',
    paddingHorizontal: wp('2%'),
  },
  syncPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('0.9%'),
    borderRadius: 30,
    borderWidth: 1,
    marginTop: hp('4%'),
    gap: wp('2%'),
  },
  syncDot: {
    width: wp('2%'),
    height: wp('2%'),
    borderRadius: wp('1%'),
  },
  syncText: {
    fontSize: wp('2.8%'),
    fontFamily: Fonts.medium,
    letterSpacing: 0.5,
  },

  // Steps card
  stepsCard: {
    borderRadius: wp('5%'),
    padding: wp('5%'),
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  stepsTitle: {
    fontSize: wp('2.5%'),
    fontFamily: Fonts.medium,
    letterSpacing: 0.8,
    textAlign: 'center',
    marginBottom: hp('2%'),
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepItem: {
    alignItems: 'center',
    gap: hp('0.6%'),
  },
  stepText: {
    fontSize: wp('2.8%'),
    fontFamily: Fonts.medium,
  },
  stepConnector: {
    height: 1.5,
    width: wp('12%'),
    marginHorizontal: wp('2%'),
    marginBottom: hp('1.5%'),
  },

  // Distance Info
  distanceInfo: {
    marginTop: hp('2%'),
    padding: wp('4%'),
    borderRadius: wp('3%'),
    borderWidth: 1,
    alignItems: 'center',
  },
  distanceText: {
    fontSize: wp('3%'),
    fontFamily: Fonts.regular,
  },
  distanceHint: {
    fontSize: wp('2.8%'),
    fontFamily: Fonts.medium,
    marginTop: hp('0.5%'),
    textAlign: 'center',
  },
});

export default DailyPunch;