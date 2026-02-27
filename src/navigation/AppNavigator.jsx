import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as Keychain from 'react-native-keychain';
import ReactNativeBiometrics from 'react-native-biometrics';
import { CommonActions, useNavigation } from '@react-navigation/native';

import LoginScreen from '../screens/auth/Login';
import HomeScreen from '../screens/home/Home';
import VerifyOTP from '../screens/auth/VerifyOtp';
import DailyPunch from '../screens/ui/DailyPunch';
import BiometricPrompt from '../components/BiometricPrompt';
import AppLoader from '../services/AppLoader';
import SlideableAlert from '../components/common/SlideableAlert';
import {
  checkAuthState,
  hideAlert,
} from '../store/actions/authActions';
import { getAccessToken } from '../utils/keychainHelper';

const Stack = createNativeStackNavigator();
const rnBiometrics = new ReactNativeBiometrics();

const AppContent = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { isAuthenticated } = useSelector(state => state.auth);
  const { alert } = useSelector(state => state.ui);

  const [showBiometric, setShowBiometric] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [deviceSecurity, setDeviceSecurity] = useState('NONE');
  const [isInitialAuthCheckDone, setIsInitialAuthCheckDone] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🔐 Checking device security...');

        const { available } = await rnBiometrics.isSensorAvailable();
        setBiometricAvailable(available);
        console.log('🔑 Biometric available:', available);

        try {
          const security = await Keychain.getSecurityLevel();
          if (security === 'BIOMETRIC' || security === 'BIOMETRIC_PASSCODE') {
            setDeviceSecurity('BIOMETRIC');
          } else if (security === 'PASSCODE') {
            setDeviceSecurity('PIN');
          } else if (security === 'DEVICE_PASSCODE') {
            setDeviceSecurity('PASSWORD');
          } else {
            setDeviceSecurity('NONE');
          }
        } catch (error) {
          console.log('Security check error:', error);
          setDeviceSecurity('NONE');
        }

        const hasTokens = await getAccessToken();
        console.log('🎫 Tokens exist:', hasTokens);

        if (hasTokens) {
          console.log('🔐 FORCING BIOMETRIC PROMPT - TOKENS FOUND');
          setShowBiometric(true);
        } else {
          await dispatch(checkAuthState());
          setIsInitialAuthCheckDone(true);
        }

        setInitialized(true);
      } catch (error) {
        console.error('App initialization error:', error);
        await dispatch(checkAuthState());
        setIsInitialAuthCheckDone(true);
        setInitialized(true);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    if (!initialized) return;

    console.log('🔄 Auth state changed:', isAuthenticated);

    if (isAuthenticated) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        })
      );
    } else if (isInitialAuthCheckDone && !showBiometric) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      );
    }
  }, [isAuthenticated, initialized, isInitialAuthCheckDone, showBiometric]);

  const handleBiometricSuccess = async () => {
    console.log('✅ Biometric success, loading auth state...');
    setShowBiometric(false);

    try {
      await dispatch(checkAuthState());
      setIsInitialAuthCheckDone(true);
    } catch (error) {
      console.error('Auth after biometric failed:', error);
      setIsInitialAuthCheckDone(true);
    }
  };

  const handleBiometricFailure = () => {
    console.log('❌ Biometric failed');
    setShowBiometric(false);
    setIsInitialAuthCheckDone(true);
  };

  const handlePasswordOption = async () => {
    console.log('🔑 Password option selected');
    setShowBiometric(false);

    try {
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: 'Authenticate to open app',
      });

      if (success) {
        console.log('✅ Password auth success, loading auth state...');
        await dispatch(checkAuthState());
        setIsInitialAuthCheckDone(true);
      } else {
        console.log('❌ Password auth failed');
        setIsInitialAuthCheckDone(true);
      }
    } catch (error) {
      console.log('❌ Device auth error:', error);
      setIsInitialAuthCheckDone(true);
    }
  };

  if (!initialized) {
    return <AppLoader />;
  }

  return (
    <View style={styles.container}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Verify_Otp" component={VerifyOTP} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="DailyPuch" component={DailyPunch} />
      </Stack.Navigator>

      {showBiometric && (
        <BiometricPrompt
          visible={showBiometric}
          onSuccess={handleBiometricSuccess}
          onFailure={handleBiometricFailure}
          onPassword={handlePasswordOption}
          deviceSecurity={deviceSecurity}
          biometricAvailable={biometricAvailable}
        />
      )}

      <SlideableAlert
        visible={alert.visible}
        message={alert.message}
        type={alert.type}
        onDismiss={() => dispatch(hideAlert())}
      />
    </View>
  );
};

const AppNavigator = () => {
  return <AppContent />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1128',
  },
});

export default AppNavigator;