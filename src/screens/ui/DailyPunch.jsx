import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { Clock } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { getCurrentLocation } from '../../utils/locaton';
import { getAddressFromCoords } from '../../utils/geocode';
import { launchCamera } from 'react-native-image-picker';
import { requestCameraPermission } from '../../utils/permissions';
import { styles } from '../../css/dailyPuchCss';
import { BASE_URL } from '@env';

const DailyPunch = () => {
  const { accessToken, user, updatePunchInData } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const handleTakeSelfies = async () => {
    console.log('User is Uploading Selfie:', user);
    try {
      setLoading(true);
      // Get live location
      const { latitude, longitude } = await getCurrentLocation();
      console.log('Current Location:', latitude, longitude);

      // Get address
      const address = await getAddressFromCoords(latitude, longitude);
      console.log('Resolved Address:', address);

      // Open camera
      const hasCameraPermission = await requestCameraPermission();

      if (!hasCameraPermission) {
        Alert.alert('Permission Required', 'Camera permission is required');
        return;
      }

      const cameraResult = await launchCamera({
        mediaType: 'photo',
        cameraType: 'front',
        quality: 0.7,
        saveToPhotos: false,
      });

      console.log('Camera Result:', cameraResult);

      if (cameraResult.didCancel) {
        console.log('User cancelled camera');
        return;
      }

      if (!cameraResult.assets || cameraResult.assets.length === 0) {
        Alert.alert('Error', 'Failed to capture image');
        return;
      }

      const photo = cameraResult.assets[0];

      //  FormData
      const formData = new FormData();

      formData.append('latitude', String(latitude));
      formData.append('longitude', String(longitude));
      formData.append('address', address);

      formData.append('image', {
        uri:
          Platform.OS === 'android'
            ? photo.uri
            : photo.uri.replace('file://', ''),
        type: photo.type,
        name: photo.fileName || 'selfie.jpg',
      });

      console.log('FormData Prepared:', formData);

      // API call
      const response = await fetch(`${BASE_URL}/attendance/punch-in`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Error', data.message || 'Taking selfie failed');
        return;
      }

      Alert.alert('Success', 'Selfie taken and attendance marked successfully');
      console.log(data);
      updatePunchInData(data.data);
      // navigation.navigate('Home');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
      navigation.navigate('Home');
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
          style={styles.button}
          onPress={handleTakeSelfies}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Clock size={18} color="#fff" />
          <Text style={styles.buttonText}>
            {loading ? 'Processing...' : 'Start Punch In'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DailyPunch;
