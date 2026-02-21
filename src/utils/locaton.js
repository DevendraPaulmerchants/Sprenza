import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { request, check, PERMISSIONS, RESULTS } from 'react-native-permissions';

export const getCurrentLocation = async () => {
  try {
    // =========================
    // ANDROID PERMISSION
    // =========================
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'App needs your location to mark attendance',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        throw { code: 1, message: 'Location permission not granted.' };
      }
    }

    // =========================
    // IOS PERMISSION
    // =========================
    if (Platform.OS === 'ios') {
      const permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

      const status = await check(permission);

      if (status === RESULTS.DENIED) {
        const requestStatus = await request(permission);

        if (requestStatus !== RESULTS.GRANTED) {
          throw { code: 1, message: 'Location permission denied' };
        }
      }

      if (status === RESULTS.BLOCKED) {
        throw {
          code: 1,
          message: 'Location permission blocked. Enable from Settings.',
        };
      }
    }

    // =========================
    // GET LOCATION
    // =========================
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        error => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
          forceRequestLocation: true,
          showLocationDialog: true,
        },
      );
    });
  } catch (error) {
    throw error;
  }
};
