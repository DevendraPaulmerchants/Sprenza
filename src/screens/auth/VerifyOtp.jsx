import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Text,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Clock } from 'lucide-react-native';
import { CommonActions } from '@react-navigation/native';

import { Colors, Fonts, GlobalText } from '../../utils/GlobalText';
import LogoHeader from '../../components/Login/LogoHeader';
import PrimaryButton from '../../components/common/PrimaryButton';
import SlideableAlert from '../../components/common/SlideableAlert';
import OTPInput from '../../components/common/OTPInput';

import {
  verifyOtp,
  hideAlert,
  setAlert,
  resendOtp,
  checkAuthState,
} from '../../store/actions/authActions';

const VerifyOTP = ({ route, navigation }) => {
  const { email } = route.params;
  const dispatch = useDispatch();
  const [disabledd, setDisabledd] = useState(false);
  const { verifyOtpLoading } = useSelector(state => state.auth);
  const { alert } = useSelector(state => state.ui);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(hp('3%'))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerifyOtp = async () => {
    Keyboard.dismiss();

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      dispatch(setAlert('Please enter complete 6-digit OTP', 'error'));
      return;
    }

    const result = await dispatch(verifyOtp(email, otpString));

    if (result.success) {
      // dispatch(setAlert('Login successful!', 'success'));
      dispatch(checkAuthState()); // This will trigger navigation

      // No need for manual navigation, the effect in AppNavigator will handle it
    } else {
      setOtp(['', '', '', '', '', '']);
    }
  };

  const handleResendOtp = async () => {
    setOtp(['', '', '', '', '', '']);
    setDisabledd(true);
    if (!canResend) return;
    const result = await dispatch(resendOtp(email));
    if (result.success) {
      setTimer(30);
      setDisabledd(false);

      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      dispatch(setAlert('OTP resent successfully', 'success'));
    }
  };

  const handleGoBack = () => navigation.goBack();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      <View style={styles.topShadow} />
      <View style={styles.bottomShadow} />

      <SlideableAlert
        visible={alert.visible}
        message={alert.message}
        type={alert.type}
        onDismiss={() => dispatch(hideAlert())}
      />

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft size={wp('5%')} color={Colors.textPrimary} />
          <Text style={styles.backButtonText}>Change Email</Text>
        </TouchableOpacity>

        <LogoHeader />

        <View style={styles.otpHeader}>
          <Text style={styles.otpTitle}>Verify OTP</Text>
          <Text style={styles.otpSubtitle}>Enter the 6-digit code sent to</Text>
          <Text style={styles.otpEmail}>{email}</Text>
        </View>

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.otpContainer}>
            <OTPInput otp={otp} setOtp={setOtp} />
          </View>
        </TouchableWithoutFeedback>

        <View style={styles.resendContainer}>
          <Clock size={wp('4%')} color={Colors.textSecondary} />
          <Text style={styles.resendText}>
            {canResend
              ? "Didn't receive the code?"
              : `Resend in 00:${timer.toString().padStart(2, '0')}`}
          </Text>
          {canResend && (
            <TouchableOpacity
              onPress={handleResendOtp}
              disabled={verifyOtpLoading || disabledd}
            >
              <Text style={styles.resendButton}> Resend OTP</Text>
            </TouchableOpacity>
          )}
        </View>

        <PrimaryButton
          title="Verify OTP"
          onPress={handleVerifyOtp}
          loading={verifyOtpLoading}
          disabled={otp.join('').length !== 6 || verifyOtpLoading}
          style={styles.verifyButton}
        />

        <Text style={styles.helpText}>OTP is valid for 5 minutes</Text>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topShadow: {
    position: 'absolute',
    top: -hp('1%'),
    right: -wp('2%'),
    backgroundColor: '#0b1425',
    opacity: 0.9,
    width: wp('90%'),
    height: hp('35%'),
    borderBottomLeftRadius: wp('25%'),
  },
  bottomShadow: {
    position: 'absolute',
    bottom: -hp('1%'),
    left: -wp('2%'),
    backgroundColor: Colors.primary,
    opacity: 0.5,
    width: wp('75%'),
    height: hp('35%'),
    borderTopRightRadius: wp('50%'),
  },
  content: {
    flex: 1,
    paddingHorizontal: wp('6%'),
    justifyContent: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('14%'),
    marginTop: hp('-10%'),
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: Colors.textSecondary,
    fontSize: wp('3.5%'),
    fontFamily: Fonts.light,
    marginLeft: wp('2%'),
  },
  otpHeader: {
    alignItems: 'center',
    marginBottom: hp('3%'),
  },
  otpTitle: {
    color: Colors.textPrimary,
    fontSize: wp('6%'),
    fontFamily: Fonts.medium,
    marginBottom: hp('1%'),
  },
  otpSubtitle: {
    color: Colors.textSecondary,
    fontSize: wp('3.5%'),
    fontFamily: Fonts.light,
    textAlign: 'center',
  },
  otpEmail: {
    color: Colors.primary,
    fontSize: wp('4%'),
    fontFamily: Fonts.medium,
    marginTop: hp('0.5%'),
  },
  otpContainer: { width: '100%', marginBottom: hp('2%') },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('3%'),
    gap: wp('1%'),
  },
  resendText: {
    color: Colors.textSecondary,
    fontSize: wp('3.5%'),
    fontFamily: Fonts.light,
  },
  resendButton: {
    color: Colors.primary,
    fontSize: wp('3.5%'),
    fontFamily: Fonts.medium,
  },
  verifyButton: { marginBottom: hp('2%') },
  helpText: {
    color: Colors.textSecondary,
    fontSize: wp('3%'),
    fontFamily: Fonts.light,
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default VerifyOTP;
