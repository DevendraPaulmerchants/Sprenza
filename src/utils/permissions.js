// src/utils/permissions.js
import { PermissionsAndroid, Platform, Alert, Linking } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

/**
 * Check and request camera permission
 */
export const requestCameraPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'App needs access to your camera for attendance selfies',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Camera permission granted');
        return true;
      } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        Alert.alert(
          'Camera Permission Required',
          'Camera permission is needed for attendance verification. Please enable it in settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return false;
      } else {
        Alert.alert('Camera Permission Denied', 'Camera access is required for attendance.');
        return false;
      }
    } catch (err) {
      console.warn('Camera permission error:', err);
      return false;
    }
  } else {
    // iOS
    try {
      const status = await check(PERMISSIONS.IOS.CAMERA);
      if (status === RESULTS.GRANTED) {
        return true;
      } else if (status === RESULTS.DENIED) {
        const requestStatus = await request(PERMISSIONS.IOS.CAMERA);
        return requestStatus === RESULTS.GRANTED;
      } else {
        Alert.alert(
          'Camera Permission Required',
          'Camera permission is needed for attendance verification. Please enable it in settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return false;
      }
    } catch (err) {
      console.warn('Camera permission error:', err);
      return false;
    }
  }
};

/**
 * Check and request location permission
 */
export const checkAndRequestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      // Check if already granted
      const fineLocationGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      const coarseLocationGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
      );
      
      if (fineLocationGranted && coarseLocationGranted) {
        console.log('Location permissions already granted');
        return true;
      }
      
      // Request permission
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'App needs access to your location for attendance verification',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location permission granted');
        return true;
      } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        Alert.alert(
          'Location Permission Required',
          'Location permission is needed to verify your attendance location. Please enable it in settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return false;
      } else {
        Alert.alert('Location Permission Denied', 'Location access is required for attendance.');
        return false;
      }
    } catch (err) {
      console.warn('Location permission error:', err);
      return false;
    }
  } else {
    // iOS
    try {
      const status = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      if (status === RESULTS.GRANTED) {
        return true;
      } else if (status === RESULTS.DENIED) {
        const requestStatus = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        return requestStatus === RESULTS.GRANTED;
      } else {
        Alert.alert(
          'Location Permission Required',
          'Location permission is needed to verify your attendance location. Please enable it in settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return false;
      }
    } catch (err) {
      console.warn('Location permission error:', err);
      return false;
    }
  }
};

/**
 * Check if location services are enabled (Android only)
 */
export const isLocationEnabled = async () => {
  if (Platform.OS === 'android') {
    try {
      const locationEnabled = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return locationEnabled;
    } catch (err) {
      return false;
    }
  }
  return true; // iOS handled differently
};

/**
 * Show permission dialog for both camera and location
 */
export const requestAllPermissions = async () => {
  const cameraGranted = await requestCameraPermission();
  const locationGranted = await checkAndRequestLocationPermission();
  
  return {
    camera: cameraGranted,
    location: locationGranted,
    allGranted: cameraGranted && locationGranted
  };
};