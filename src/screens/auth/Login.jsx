import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import logo from '../../assets/logo.png';
import { handleAlphaNumericInput, isValidPassword } from '../../utils/utils';
import DeviceInfo from 'react-native-device-info';
import { styles } from '../../css/logInCss';
import { BASE_URL } from '@env';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !email.includes('@')) {
      alert('Error', 'Please enter a valid email');
      return;
    }
    const payload = {
      email: email.trim().toLowerCase(),
      device: {
        deviceId: DeviceInfo.getUniqueId()?._j,
        deviceType: 'MOBILE',
      },
    };

    try {
      setLoading(true);
      console.log(payload);
      const response = await fetch(`${BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log(data);
      if (!response.ok) {
        alert('Error', data.message || 'Something went wrong');
        return;
      }

      console.log('OTP Sent:', data);
      alert('Success', 'OTP sent successfully');
      if (data.step === 'VERIFY_OTP') {
        navigation.navigate('Verify_Otp', { email });
      }
    } catch (error) {
      console.error(error);
      alert('Network Error', 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.appNameSection}>
        <Text style={styles.appName}>Presenza</Text>
      </View>
      <View style={styles.topShadow} />
      <View style={styles.bottomShadow} />
      <View style={styles.logoSection}>
        <Image source={logo} style={styles.logo} />
      </View>
      <View style={styles.wrapper}>
        <Text style={styles.lable}>Employee Email:</Text>
        <TextInput
          style={styles.input}
          placeholder="Employee email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          maxLength={50}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Sending...' : 'Send OTP'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;
