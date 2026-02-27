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
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useDispatch, useSelector } from 'react-redux';
import { Fingerprint } from 'lucide-react-native';
import { Colors, Fonts, GlobalText } from '../../utils/GlobalText';
import LogoHeader from '../../components/Login/LogoHeader';
import WelcomeText from '../../components/Login/WelcomeText';
import FloatingLabelInput from '../../components/common/FloatingLabelInput';
import PrimaryButton from '../../components/common/PrimaryButton';
import SlideableAlert from '../../components/common/SlideableAlert';
import {
  sendOtp,
  biometricLogin,
  hideAlert,
  checkBiometricAvailability,
} from '../../store/actions/authActions';
import { getAccessToken } from '../../utils/keychainHelper';

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const {
    sendOtpLoading,
    sendOtpSuccess,
    biometricAvailable,
    biometricLoading,
  } = useSelector(state => state.auth);

  const { alert } = useSelector(state => state.ui);

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showBiometric, setShowBiometric] = useState(false);
  
  useEffect(() => {
    async function checkTokens() {
      const hasTokens = await getAccessToken();
      console.log('🔍 Checking tokens on app start:', hasTokens);
      if (hasTokens) {
        setShowBiometric(true);
      } else {
        console.log('🚪 No tokens');
      }
    }
    checkTokens();
  }, []);

  // const getCredentialsFromKeychain = async () => {
  //   try {
  //     const credentials = await Keychain.getInternetCredentials(
  //       'com.presenza.app',
  //     );
  //     if (credentials) {
  //       return JSON.parse(credentials.password);
  //     }
  //     return null;
  //   } catch (error) {
  //     console.error('Get credentials error:', error);
  //     return null;
  //   }
  // };

  // useEffect(() => {
  //   async function fetchData() {
  //     const hasCreds = await getCredentialsFromKeychain();
  //     console.log('🔍 Checking tokens on app start:', hasCreds);
  //     if (hasCreds) {
  //       setShowBiometric(true);
  //     } else {
  //       console.log('🚪 No tokens');
  //     }
  //   }
  //   fetchData();
  // }, [showBiometric]);

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
    dispatch(checkBiometricAvailability());
  }, []);

  useEffect(() => {
    if (sendOtpSuccess && email) {
      setTimeout(() => {
        navigation.navigate('Verify_Otp', {
          email: email.trim().toLowerCase(),
        });
      }, 500);
    }
  }, [sendOtpSuccess, email]);

  const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSendOtp = async () => {
    Keyboard.dismiss();
    setEmailError('');
    if (!validateEmail(email)) {
      setEmailError(GlobalText.alerts.invalidEmail);
      return;
    }
    await dispatch(sendOtp(email));
  };

  const handleBiometric = async () => {
    const result = await dispatch(biometricLogin());
    if (result.success) {
      navigation.replace('Home');
    }
  };

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
        <LogoHeader />
        <WelcomeText />

        <View style={styles.formContainer}>
          <FloatingLabelInput
            label={GlobalText.login.emailLabel}
            value={email}
            onChangeText={text => {
              setEmail(text);
              setEmailError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            maxLength={50}
            placeholder={GlobalText.login.emailPlaceholder}
            placeholderTextColor={Colors.textSecondary}
          />
          {emailError && <Text style={styles.errorText}>{emailError}</Text>}

          <PrimaryButton
            title={GlobalText.login.sendOtpButton}
            onPress={handleSendOtp}
            loading={sendOtpLoading}
            disabled={!validateEmail(email) || sendOtpLoading}
          />

          {biometricAvailable && showBiometric && (
            <TouchableOpacity
              style={styles.biometricOption}
              onPress={handleBiometric}
              disabled={biometricLoading}
            >
              <Fingerprint size={wp('5%')} color={Colors.primary} />
              <Text style={styles.biometricText}>
                {biometricLoading ? 'Checking...' : 'Login with Biometric'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
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
  formContainer: { width: '100%', marginBottom: hp('4%') },
  errorText: {
    color: Colors.error,
    fontSize: wp('3%'),
    fontFamily: Fonts.light,
    marginTop: -hp('1%'),
    marginBottom: hp('1%'),
    marginLeft: wp('2%'),
  },
  biometricOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp('2%'),
    padding: hp('1%'),
    gap: wp('2%'),
  },
  biometricText: {
    color: Colors.textSecondary,
    fontSize: wp('3.5%'),
    fontFamily: Fonts.light,
  },
});

export default LoginScreen;
