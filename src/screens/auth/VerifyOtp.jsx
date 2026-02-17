import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import logo from '../../assets/logo.png';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { styles } from '../../css/verifyOtpCss';
import { BASE_URL } from '../../utils/GlobalText';

const VerifyOTP = ({ route, navigation }) => {
  const { email } = route.params;
  const { login } = useAuth();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyOtp = async () => {
    if (!otp) {
      alert('Please enter OTP');
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || 'OTP failed');
        return;
      }
      console.log('Latest Data', data);
      const { access, refresh } = data.data.tokens;
      const user = data.data.user;

      await login(access.token, refresh.token, user);
      navigation.replace('Home', { email });
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topShadow} />
      <View style={styles.bottomShadow} />
      <View style={styles.appNameSection}>
        <Text style={styles.appName}>Presenza</Text>
      </View>
      <View style={styles.logoSection}>
        <Image source={logo} style={styles.logo} />
      </View>
      <View style={styles.wrapper}>
        <Text style={styles.title}>OTP sent to: {email}</Text>
        <View style={styles.errorContainer}>
          <Text style={{ color: '#139c4c' }}>Enter Wrong Email</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text>Go Back</Text>
          </TouchableOpacity>
        </View>

        <View>
          <Text style={styles.lable}>Enter OTP:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            autoCapitalize="none"
            maxLength={6}
          />
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={handleVerifyOtp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default VerifyOTP;
