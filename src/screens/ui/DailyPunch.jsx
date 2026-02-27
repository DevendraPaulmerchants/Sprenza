import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {
  MapPin,
  Fingerprint,
  CheckCircle,
  ScanFace,
  Loader,
  Frown,
  Map,
  Camera,
  Upload,
  CheckCircle2,
  XCircle,
  ScanEye,
  ScanFaceIcon,
  Image,
  CameraIcon,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import MainLayout from '../../components/layout/MainLayout';
import SlideableAlert from '../../components/common/SlideableAlert';
import { Colors, Fonts, GlobalText } from '../../utils/GlobalText';
import {
  punchIn,
  getTodayAttendance,
  getAttendanceHistory,
} from '../../store/actions/attendanceActions';
import { hideAlert, setAlert } from '../../store/actions/authActions';

const DailyPunch = ({ navigation }) => {
  const dispatch = useDispatch();
  const { alert } = useSelector(state => state.ui);
  const { punchInLoading, isCheckedIn, location, punchError } = useSelector(
    state => state.attendance,
  );
  const [stepStatuses, setStepStatuses] = useState({
    location: 'pending', // pending, loading, success, error
    selfie: 'pending',
    upload: 'pending',
  });
  // Step status update karo based on uiState
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

  // Step icon animation function
  const getStepIcon = (step, status) => {
    const iconSize = wp('4%');

    // Upload step ke liye loading animation
    if (step === 'upload' && status === 'loading') {
      return (
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Loader size={iconSize} color={Colors.primary} />
        </Animated.View>
      );
    }

    switch (status) {
      case 'success':
        return <CheckCircle2 size={iconSize} color={Colors.success} />;
      case 'error':
        return <XCircle size={iconSize} color={Colors.error} />;
      case 'loading':
        return <Loader size={iconSize} color={Colors.primary} />;
      default:
        switch (step) {
          case 'location':
            return <MapPin size={iconSize} color={Colors.textSecondary} />;
          case 'selfie':
            return <Camera size={iconSize} color={Colors.textSecondary} />;
          case 'upload':
            return <Upload size={iconSize} color={Colors.textSecondary} />;
          default:
            return null;
        }
    }
  };

  // Step text get karne ke liye
  const getStepText = step => {
    const texts = {
      location: GlobalText.attendance.locationStep || 'Location',
      selfie: GlobalText.attendance.selfieStep || 'Selfie',
      upload: GlobalText.attendance.uploadStep || 'Upload',
    };
    return texts[step] || step;
  };

  const [uiState, setUiState] = useState('idle'); // idle, loading, success, error

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(hp('5%'))).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const dotWaveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Get today's attendance on mount
    // dispatch(getTodayAttendance());

    // Start continuous animations
    startPulse();
    startWave();
    startDotWave();
  }, []);

  // Agar pehle se checked in hai to redirect with message
  useEffect(() => {
    if (isCheckedIn) {
      dispatch(setAlert('You are already punched in!', 'error'));
      // Use navigation.replace instead of goBack for better stack management
      navigation.replace('Home');
    }
  }, [isCheckedIn]);

  // Update UI state based on API states
  useEffect(() => {
    if (punchInLoading) {
      setUiState('loading');
      startRotation();
    } else if (punchError) {
      setUiState('error');
      stopRotation();

      // Auto revert to idle after 3 seconds
      setTimeout(() => {
        setUiState('idle');
      }, 3000);
    } else {
      setUiState('idle');
      stopRotation();
    }
  }, [punchInLoading, punchError]);

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const startRotation = () => {
    rotateAnim.setValue(0);
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  };

  const stopRotation = () => {
    rotateAnim.stopAnimation();
    rotateAnim.setValue(0);
  };

  const startWave = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 4000,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const startDotWave = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotWaveAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(dotWaveAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const waveScale = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });

  const waveOpacity = waveAnim.interpolate({
    inputRange: [0, 0.3, 0.7, 1],
    outputRange: [0.5, 0.3, 0.1, 0],
  });

  const dotWaveScale = dotWaveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });

  const dotWaveOpacity = dotWaveAnim.interpolate({
    inputRange: [0.1, 0.3, 0.7, 1],
    outputRange: [0.7, 0.4, 0.8, 0.9],
  });

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handlePunch = async () => {
    const result = await dispatch(punchIn());
    if (result.success) {
      dispatch(setAlert('✅ Punched in successfully!', 'success'));
      // Refresh history before going back
      await dispatch(getAttendanceHistory());
      // Navigate back to home
      navigation.replace('Home');
    }
  };

  const getStatusText = () => {
    return GlobalText.attendance.notPunched || 'Not Punched In';
  };

  const getLocationName = () => {
    return (
      location?.name ||
      GlobalText.attendance.defaultLocation ||
      'HO - Chandigarh'
    );
  };

  const getIcon = () => {
    if (uiState === 'loading') {
      return (
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Loader size={wp('15%')} color={Colors.textDark} />
        </Animated.View>
      );
    }

    switch (uiState) {
      case 'success':
        return <CheckCircle size={wp('15%')} color={Colors.textDark} />;
      case 'error':
        return <Frown size={wp('15%')} color={Colors.textDark} />;
      default:
        return Platform.OS === 'ios' ? (
          <CameraIcon size={wp('15%')} color={Colors.textDark} />
        ) : (
          <CameraIcon size={wp('15%')} color={Colors.textDark} />
        );
    }
  };

  const getButtonText = () => {
    if (uiState === 'loading') {
      return GlobalText.attendance.processing || 'PROCESSING...';
    }

    switch (uiState) {
      case 'success':
        return GlobalText.attendance.success || 'SUCCESS!';
      case 'error':
        return GlobalText.attendance.error || 'ERROR!';
      default:
        return GlobalText.attendance.punchIn || 'Punch In';
    }
  };

  const getSyncText = () => {
    switch (uiState) {
      case 'error':
        return GlobalText.attendance.failed || 'FAILED';
      case 'loading':
        return GlobalText.attendance.processing || 'PROCESSING';
      default:
        return GlobalText.attendance.readyToSync || 'READY TO SYNC';
    }
  };

  const getVerifyStepText = () => {
    if (uiState === 'loading') {
      return GlobalText.attendance.uploading || 'Uploading';
    }
    if (uiState === 'error') {
      return GlobalText.attendance.failed || 'Failed';
    }
    return GlobalText.attendance.pending || 'Pending';
  };

  const getDotColor = () => {
    if (uiState === 'error') return Colors.error;
    return Colors.textSecondary;
  };

  const shouldShowWaves = () => {
    return uiState !== 'error';
  };

  return (
    <MainLayout
      title={GlobalText.home.dailyPunch || 'Daily Punch'}
      showBack={true}
      headerBackgroundColor={Colors.background}
      hideBottomNav={false}
    >

      {/* Status Card */}
      <Animated.View
        style={[
          styles.statusCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.statusLabel}>
          {GlobalText.attendance.currentStatus?.toUpperCase() ||
            'CURRENT STATUS'}
        </Text>
        <Text style={styles.statusText}>{getStatusText()}</Text>

        <View style={styles.locationRow}>
          <View style={styles.locationLeft}>
            <MapPin size={wp('4%')} color={Colors.primary} />
            <Text style={styles.locationText}>{getLocationName()}</Text>
          </View>

          <View style={styles.mapBtn}>
            <Text style={styles.mapText}>
              {GlobalText.buttons.map?.toUpperCase() || 'MAP'}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Center Section */}
      <View style={styles.centerContainer}>
        {/* Wave Animation */}
        {shouldShowWaves() && (
          <Animated.View
            style={[
              styles.wave,
              {
                transform: [{ scale: waveScale }],
                opacity: waveOpacity,
                backgroundColor: Colors.primary,
                marginTop: hp('6%'),
              },
            ]}
          />
        )}

        {/* Punch Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handlePunch}
          disabled={punchInLoading}
          style={{ marginTop: hp('7%') }}
        >
          <Animated.View
            style={[
              styles.punchCircle,
              punchInLoading && styles.punchCircleDisabled,
              uiState === 'error' && styles.errorCircle,
              uiState !== 'error' && {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            {getIcon()}
            <Text
              style={[
                styles.punchText,
                uiState === 'error' && styles.errorText,
              ]}
            >
              {getButtonText()}
            </Text>

            {uiState === 'error' && (
              <Text style={styles.errorSubText}>
                {GlobalText.attendance.tryAgain || 'Tap to retry'}
              </Text>
            )}
          </Animated.View>
        </TouchableOpacity>

        {/* Sync Pill */}
        <View style={styles.syncPillContainer}>
          <View
            style={[styles.syncPill, uiState === 'error' && styles.errorPill]}
          >
            {shouldShowWaves() && (
              <Animated.View
                style={[
                  styles.dotWave,
                  {
                    transform: [{ scale: dotWaveScale }],
                    opacity: dotWaveOpacity,
                    backgroundColor: Colors.success,
                  },
                ]}
              />
            )}
            <Text
              style={[
                styles.syncText,
                uiState === 'error' && styles.errorSyncText,
              ]}
            >
              {getSyncText()}
            </Text>
          </View>
        </View>
      </View>

      {/* Verification Steps */}
      <Animated.View
        style={[
          styles.verification,
          {
            opacity: fadeAnim,
            transform: [{ translateY: Animated.multiply(slideAnim, -1) }],
          },
        ]}
      >
        <Text style={styles.verifyTitle}>
          {GlobalText.attendance.verificationSteps?.toUpperCase() ||
            'VERIFICATION PROCESS'}
        </Text>

        <View style={styles.verifyRow}>
          {['location', 'selfie', 'upload'].map((step, index) => (
            <View key={step} style={styles.stepItem}>
              {getStepIcon(step, stepStatuses[step])}
              <Text
                style={[
                  styles.verifyItem,
                  stepStatuses[step] === 'success' && styles.successStep,
                  stepStatuses[step] === 'error' && styles.errorStep,
                  stepStatuses[step] === 'loading' && styles.loadingStep,
                ]}
              >
                {getStepText(step)}
              </Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </MainLayout>
  );
};

export default DailyPunch;

const styles = StyleSheet.create({
  statusCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: wp('5%'),
    marginTop: hp('3%'),
    padding: wp('6%'),
    borderRadius: wp('5%'),
    borderColor: Colors.border,
    borderWidth: wp('0.1%'),
  },
  statusLabel: {
    fontSize: wp('2.8%'),
    color: Colors.primary,
    fontFamily: Fonts.medium,
    marginBottom: hp('0.8%'),
    letterSpacing: wp('0.1%'),
  },
  statusText: {
    fontSize: wp('5.2%'),
    fontFamily: Fonts.medium,
    marginBottom: hp('2%'),
    color: Colors.textPrimary,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Styles mein yeh add karo
stepItem: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: wp('1.5%'),
},
successStep: {
  color: Colors.success,
},
loadingStep: {
  color: Colors.primary,
},
  locationText: {
    marginLeft: wp('2%'),
    fontSize: wp('3.4%'),
    color: Colors.textPrimary,
    fontFamily: Fonts.light,
  },
  mapBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('0.8%'),
    borderRadius: wp('2%'),
  },
  mapText: {
    fontSize: wp('3%'),
    fontFamily: Fonts.medium,
    color: Colors.textDark,
  },
  centerContainer: {
    alignItems: 'center',
    marginTop: hp('5%'),
    position: 'relative',
  },
  wave: {
    position: 'absolute',
    width: wp('45%'),
    height: wp('45%'),
    borderRadius: wp('27.5%'),
    backgroundColor: Colors.primary,
  },
  punchCircle: {
    width: wp('40%'),
    height: wp('40%'),
    borderRadius: wp('27.5%'),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: hp('0.5%') },
    shadowOpacity: 0.3,
    shadowRadius: wp('2%'),
  },
  punchCircleDisabled: {
    opacity: 0.8,
  },
  errorCircle: {
    backgroundColor: Colors.error,
    shadowColor: Colors.error,
  },
  punchText: {
    marginTop: hp('1.2%'),
    fontSize: wp('3.5%'),
    fontFamily: Fonts.medium,
    letterSpacing: wp('0.2%'),
    color: Colors.textDark,
  },
  errorText: {
    color: Colors.textDark,
  },
  errorSubText: {
    fontSize: wp('2.5%'),
    fontFamily: Fonts.light,
    color: Colors.textDark,
    marginTop: hp('0.3%'),
  },
  syncPillContainer: {
    position: 'relative',
    marginTop: hp('5%'),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp('10%'),
  },
  dotWave: {
    position: 'absolute',
    width: wp('1.5%'),
    height: wp('1.5%'),
    borderRadius: wp('50%'),
    backgroundColor: Colors.success,
    marginLeft: wp('2.5'),
  },
  syncPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('0.8%'),
    borderRadius: wp('5%'),
    borderColor: Colors.border,
    borderWidth: wp('0.1%'),
    zIndex: 2,
  },
  errorPill: {
    borderColor: Colors.error,
  },
  syncText: {
    fontSize: wp('3%'),
    color: Colors.textPrimary,
    fontFamily: Fonts.light,
  },
  errorSyncText: {
    color: Colors.error,
  },
  verification: {
    position: 'absolute',
    bottom: hp('5%'),
    width: '100%',
    alignItems: 'center',
  },
  verifyTitle: {
    fontSize: wp('2.5%'),
    color: Colors.textSecondary,
    marginBottom: hp('2%'),
    fontFamily: Fonts.medium,
    letterSpacing: wp('0.1%'),
  },
  verifyRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: wp('5%'),
  },
  verifyItem: {
    fontSize: wp('3%'),
    color: Colors.primary,
    fontFamily: Fonts.light,
  },
  loadingText: {
    color: Colors.primary,
  },
  successText: {
    color: Colors.success,
  },
  errorStep: {
    color: Colors.error,
  },
});
