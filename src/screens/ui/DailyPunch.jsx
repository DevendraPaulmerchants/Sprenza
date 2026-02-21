import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  Platform,
  ActivityIndicator 
} from 'react-native';
import { Clock } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { getCurrentLocation } from '../../utils/locaton';
import { getAddressFromCoords } from '../../utils/geocode';
import { launchCamera } from 'react-native-image-picker';
import { requestCameraPermission } from '../../utils/permissions';
import { styles } from '../../css/dailyPuchCss';
import { BASE_URL } from '../../utils/GlobalText';

const DailyPunch = () => {
  const { accessToken, user, updatePunchInData } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const handleTakeSelfies = async () => {
    try {
      setLoading(true);
      console.log('Starting punch-in process...');
      console.log('BASE_URL:', BASE_URL);
      
      // Step 1: Get location
      console.log('Getting location...');
      const { latitude, longitude } = await getCurrentLocation();
      console.log('Location obtained:', { latitude, longitude });

      // Step 2: Get address
      console.log('Getting address...');
      const address = await getAddressFromCoords(latitude, longitude);
      console.log('Address obtained:', address);

      // Step 3: Check camera permission
      console.log('Checking camera permission...');
      const hasCameraPermission = await requestCameraPermission();

      if (!hasCameraPermission) {
        Alert.alert('Permission Required', 'Camera permission is required');
        setLoading(false);
        return;
      }

      // Step 4: Open camera
      console.log('Opening camera...');
      const cameraResult = await launchCamera({
        mediaType: 'photo',
        cameraType: 'front',
        quality: 0.5, // Reduced quality for faster upload
        saveToPhotos: false,
        includeBase64: false,
      });

      console.log('Camera result received');

      if (cameraResult.didCancel) {
        console.log('User cancelled camera');
        setLoading(false);
        return;
      }

      if (!cameraResult.assets || cameraResult.assets.length === 0) {
        Alert.alert('Error', 'Failed to capture image');
        setLoading(false);
        return;
      }

      const photo = cameraResult.assets[0];
      console.log('Photo captured:', photo.uri);

      // Step 5: Prepare FormData
      const formData = new FormData();
      
      formData.append('latitude', String(latitude));
      formData.append('longitude', String(longitude));
      formData.append('address', address);

      // Fix URI for iOS
      const imageUri = Platform.OS === 'ios' && photo.uri.startsWith('file://') 
        ? photo.uri 
        : photo.uri;

      // Create file object
      const fileObject = {
        uri: imageUri,
        type: photo.type || 'image/jpeg',
        name: photo.fileName || `selfie_${Date.now()}.jpg`,
      };

      formData.append('image', fileObject);

      console.log('FormData prepared');
      console.log('Image URI:', imageUri);
      console.log('Access Token available:', !!accessToken);

      // Step 6: Make API call with fetch (most reliable for iOS)
      console.log('Making API call to:', `${BASE_URL}/attendance/punch-in`);
      
      const response = await fetch(`${BASE_URL}/attendance/punch-in`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          // Don't set Content-Type header, let browser set it with boundary
        },
        body: formData,
      });

      console.log('Response status:', response.status);
      
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.log('Response is not JSON:', responseText);
        responseData = { message: responseText };
      }

      if (!response.ok) {
        throw new Error(responseData.message || `HTTP Error: ${response.status}`);
      }

      // Success
      console.log('Success response:', responseData);
      Alert.alert('Success', 'Attendance marked successfully!');
      
      if (responseData.data) {
        updatePunchInData(responseData.data);
      }
      
      navigation.navigate('Home');

    } catch (error) {
      console.error('=== ERROR DETAILS ===');
      console.error('Name:', error.name);
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
      
      // User-friendly error messages
      let errorMessage = 'An error occurred. Please try again.';
      
      if (error.message.includes('Network request failed')) {
        errorMessage = `Cannot connect to server at ${BASE_URL}. Please check:\n\n` +
          '1. Your Mac and iPhone are on the same WiFi\n' +
          '2. The server is running\n' +
          '3. Your Mac\'s firewall is not blocking the connection\n' +
          `4. The IP address (${BASE_URL}) is correct`;
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      } else if (error.message.includes('401')) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daily Punch-In / Punch-Out</Text>
        <Text style={styles.headerSubtitle}>
          Complete multi-step verification to mark attendance
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Clock size={36} color="#fff" />
        </View>
        
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleTakeSelfies}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.buttonText}>Processing...</Text>
            </>
          ) : (
            <>
              <Clock size={18} color="#fff" />
              <Text style={styles.buttonText}>Start Punch In</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DailyPunch;