import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import LoginScreen from '../screens/auth/Login';
import HomeScreen from '../screens/home/Home';
import VerifyOTP from '../screens/auth/VerifyOtp';
import DailyPunch from '../screens/ui/DailyPunch';
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isTokenValid, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ff6b35" />
      </View>
    );
  }

  const isAuthenticated = isTokenValid();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="DailyPuch" component={DailyPunch} />
        </>
      ) : (
        <>
          <Stack.Screen name="Presenza" component={LoginScreen} />
          <Stack.Screen name="Verify_Otp" component={VerifyOTP} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
