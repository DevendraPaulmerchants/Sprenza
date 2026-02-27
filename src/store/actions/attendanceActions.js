import { getCurrentLocation } from '../../utils/locaton';
import { getAddressFromCoords } from '../../utils/geocode';
import { launchCamera } from 'react-native-image-picker';
import { requestCameraPermission } from '../../utils/permissions';
import { BASE_URL } from '../../utils/GlobalText';
import apiService from '../../services/apiService';
import * as types from './types';
import { setAlert } from './authActions';

// ==================== PUNCH IN ACTIONS ====================
export const punchIn = () => async dispatch => {
  try {
    console.log('📝 PUNCH IN: Starting punch in process...');
    dispatch({ type: types.PUNCH_IN_REQUEST });

    // Step 1: Get location
    console.log('📍 Getting location...');
    const { latitude, longitude } = await getCurrentLocation();
    console.log('📍 Location obtained:', { latitude, longitude });

    // Step 2: Get address
    console.log('🏢 Getting address...');
    const address = await getAddressFromCoords(latitude, longitude);
    console.log('🏢 Address obtained:', address);

    // Step 3: Check camera permission
    console.log('📸 Checking camera permission...');
    const hasCameraPermission = await requestCameraPermission();
    console.log('📸 Camera permission:', hasCameraPermission);

    if (!hasCameraPermission) {
      console.log('❌ Camera permission denied');
      dispatch(setAlert('Camera permission is required', 'error'));
      dispatch({
        type: types.PUNCH_IN_FAIL,
        payload: 'Camera permission denied',
      });
      return { success: false };
    }

    // Step 4: Open camera
    console.log('📸 Opening camera...');
    const cameraResult = await launchCamera({
      mediaType: 'photo',
      cameraType: 'front',
      quality: 0.5,
      saveToPhotos: false,
      includeBase64: false,
    });

    console.log('📸 Camera result:', cameraResult);

    if (cameraResult.didCancel) {
      console.log('❌ Camera cancelled by user');
      dispatch({ type: types.PUNCH_IN_FAIL, payload: 'Camera cancelled' });
      return { success: false };
    }

    if (!cameraResult.assets || cameraResult.assets.length === 0) {
      console.log('❌ No image captured');
      dispatch(setAlert('Failed to capture image', 'error'));
      dispatch({ type: types.PUNCH_IN_FAIL, payload: 'No image captured' });
      return { success: false };
    }

    const photo = cameraResult.assets[0];
    console.log('📸 Photo captured:', photo.uri);

    // Step 5: Prepare FormData
    console.log('📦 Preparing FormData...');
    const formData = new FormData()

    formData.append('latitude', String(latitude));
    formData.append('longitude', String(longitude));
    formData.append('address', address);

    const fileObject = {
      uri: photo.uri,
      type: photo.type || 'image/jpeg',
      name: photo.fileName || `selfie_${Date.now()}.jpg`,
    };

    formData.append('image', fileObject);
    console.log('📦 FormData prepared');

    // Step 6: Make API call
    console.log('🌐 Making API call to /attendance/punch-in');
    const response = await apiService.upload('/attendance/punch-in', formData);
    console.log('📡 Response status:', response.status);

    const data = await response.json();
    console.log('📡 Response data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.log('❌ API Error:', data.message || 'Punch in failed');
      throw new Error(data.message || 'Punch in failed');
    }

    // Success
    console.log('✅ Punch in successful:', data.data);
    dispatch({
      type: types.PUNCH_IN_SUCCESS,
      payload: data.data,
    });

    dispatch(setAlert('Attendance marked successfully!', 'success'));

    return { success: true, data: data.data };
  } catch (error) {
    console.error('❌ Punch in error:', error);
    console.error('❌ Error stack:', error.stack);
    dispatch({
      type: types.PUNCH_IN_FAIL,
      payload: error.message || 'Punch in failed',
    });
    dispatch(setAlert(error.message || 'Punch in failed', 'error'));
    return { success: false };
  }
};

// ==================== PUNCH OUT ACTIONS ====================
export const punchOut = () => async dispatch => {
  try {
    console.log('📝 PUNCH OUT: Starting punch out process...');
    dispatch({ type: types.PUNCH_OUT_REQUEST });

    const { latitude, longitude } = await getCurrentLocation();
    console.log('📍 Location obtained:', { latitude, longitude });

    const address = await getAddressFromCoords(latitude, longitude);
    console.log('🏢 Address obtained:', address);

    const hasCameraPermission = await requestCameraPermission();
    console.log('📸 Camera permission:', hasCameraPermission);

    if (!hasCameraPermission) {
      console.log('❌ Camera permission denied');
      dispatch(setAlert('Camera permission is required', 'error'));
      return { success: false };
    }

    const cameraResult = await launchCamera({
      mediaType: 'photo',
      cameraType: 'front',
      quality: 0.5,
      saveToPhotos: false,
    });

    console.log('📸 Camera result:', cameraResult);

    if (cameraResult.didCancel) {
      console.log('❌ Camera cancelled');
      return { success: false };
    }

    if (!cameraResult.assets || cameraResult.assets.length === 0) {
      console.log('❌ No image captured');
      dispatch(setAlert('Failed to capture image', 'error'));
      return { success: false };
    }

    const photo = cameraResult.assets[0];
    console.log('📸 Photo captured:', photo.uri);

    const formData = new FormData();
    formData.append('latitude', String(latitude));
    formData.append('longitude', String(longitude));
    formData.append('address', address);

    const fileObject = {
      uri: photo.uri,
      type: photo.type || 'image/jpeg',
      name: photo.fileName || `selfie_${Date.now()}.jpg`,
    };
    formData.append('image', fileObject);
    console.log('📦 FormData prepared');

    console.log('🌐 Making API call to /attendance/punch-out');
    const response = await apiService.upload('/attendance/punch-out', formData);
    console.log('📡 Response status:', response.status);

    const data = await response.json();
    console.log('📡 Response data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.log('❌ API Error:', data.message || 'Punch out failed');
      throw new Error(data.message || 'Punch out failed');
    }

    console.log('✅ Punch out successful:', data.data);
    dispatch({ type: types.PUNCH_OUT_SUCCESS, payload: data.data });
    dispatch(setAlert('Punch out successful!', 'success'));

    // Refresh history after punch out
    console.log('🔄 Refreshing attendance history...');
    await dispatch(getAttendanceHistory());

    return { success: true, data: data.data };
  } catch (error) {
    console.error('❌ Punch out error:', error);
    console.error('❌ Error stack:', error.stack);
    dispatch(setAlert(error.message || 'Punch out failed', 'error'));
    return { success: false };
  }
};

// ==================== GET ATTENDANCE HISTORY ====================
export const getAttendanceHistory = () => async dispatch => {
  try {
    console.log('📊 FETCHING ATTENDANCE HISTORY...');
    dispatch({ type: types.ATTENDANCE_HISTORY_REQUEST });

    console.log('🌐 Making API call to /attendance/history');
    const response = await apiService.get('/attendance/history');
    console.log('📡 Response status:', response.status);

    const data = await response.json();
    console.log('📡 Response data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.log('❌ API Error:', data.message || 'Failed to fetch history');
      throw new Error(data.message || 'Failed to fetch history');
    }

    console.log('✅ Attendance history fetched:', data.data?.length || 0, 'records');
    console.log('📊 Today\'s record:', data.data?.find(r => {
      const recordDate = new Date(r.date).toDateString();
      const today = new Date().toDateString();
      return recordDate === today;
    }));

    dispatch({
      type: types.ATTENDANCE_HISTORY_SUCCESS,
      payload: data.data,
    });

    return { success: true, data: data.data };

  } catch (error) {
    console.error('❌ Get history error:', error);
    console.error('❌ Error stack:', error.stack);
    dispatch({
      type: types.ATTENDANCE_HISTORY_FAIL,
      payload: error.message || 'Failed to fetch history',
    });
    return { success: false };
  }
};

// ==================== GET TODAY'S ATTENDANCE ====================
export const getTodayAttendance = () => async dispatch => {
  try {
    console.log('📊 FETCHING TODAY\'S ATTENDANCE...');
    dispatch({ type: types.TODAY_ATTENDANCE_REQUEST });

    console.log('🌐 Making API call to /attendance/today');
    const response = await apiService.get('/attendance/today');
    console.log('📡 Response status:', response.status);

    const data = await response.json();
    console.log('📡 Response data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.log('❌ API Error:', data.message || 'Failed to fetch today\'s attendance');
      throw new Error(data.message || 'Failed to fetch today\'s attendance');
    }

    console.log('✅ Today\'s attendance fetched:', data.data);
    console.log('📊 isCheckedIn:', data.data?.isCheckedIn);
    console.log('📊 status:', data.data?.status);
    console.log('📊 location:', data.data?.location);

    dispatch({
      type: types.TODAY_ATTENDANCE_SUCCESS,
      payload: data.data,
    });

    return { success: true, data: data.data };

  } catch (error) {
    console.error('❌ Get today attendance error:', error);
    console.error('❌ Error stack:', error.stack);
    return { success: false };
  }
};