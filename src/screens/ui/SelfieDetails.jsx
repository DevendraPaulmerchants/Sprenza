import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import { getCurrentLocation } from '../../utils/locaton';
import { getAddressFromCoords } from '../../utils/geocode';
import { launchCamera } from 'react-native-image-picker';
import { requestCameraPermission } from '../../utils/permissions';
import { dateAndTime } from '../../utils/formattedDateandTime';
import { styles } from '../../css/selfieDetailsCss';
import StatusIndicator from '../../components/common/StatusIndicator';
import { BASE_URL } from '../../utils/GlobalText';

function SelfieDetails({ puchInData, accessToken, updatePunchInData }) {
  const sessionLength = puchInData?.sessions?.length || 0;
  const { formattedDate, formattedTime } = dateAndTime(
    puchInData?.sessions?.[sessionLength - 1]?.punchIn,
  );
  console.log('Punch In Data in SelfieDetails:', puchInData);
  const [loading, setLoading] = React.useState(false);

  const handlePunchOut = async () => {
    Alert.alert('Punch Out', 'Are you sure you want to punch out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          setLoading(true);
          try {
            console.log('Starting punch-out process...');
            console.log('BASE_URL:', BASE_URL);
            
            // Step 1: Get location
            console.log('Getting location...');
            const { latitude, longitude } = await getCurrentLocation();
            console.log('Punch Out Location:', { latitude, longitude });

            // Step 2: Get address
            console.log('Getting address...');
            const address = await getAddressFromCoords(latitude, longitude);
            console.log('Punch Out Address:', address);

            // Step 3: Check camera permission
            console.log('Checking camera permission...');
            const hasCameraPermission = await requestCameraPermission();
            if (!hasCameraPermission) {
              Alert.alert(
                'Permission Required',
                'Camera permission is required',
              );
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

            // Step 5: Prepare FormData (FIXED FOR iOS)
            const formData = new FormData();
            
            formData.append('latitude', String(latitude));
            formData.append('longitude', String(longitude));
            formData.append('address', address);

            // iOS URI fix - don't replace file:// for iOS, it needs it
            const imageUri = Platform.OS === 'ios' 
              ? photo.uri // Keep file:// for iOS
              : photo.uri; // Android can handle either

            // Create file object with proper structure for iOS
            const fileObject = {
              uri: imageUri,
              type: photo.type || 'image/jpeg',
              name: photo.fileName || `punchout_${Date.now()}.jpg`,
            };

            formData.append('image', fileObject);
            console.log('FormData prepared for:', Platform.OS);
            console.log('Image URI:', imageUri);

            // Step 6: Make API call (USING FETCH - most reliable)
            console.log('Making API call to:', `${BASE_URL}/attendance/punch-out`);
            
            // IMPORTANT: Don't set Content-Type header, let browser set it
            const response = await fetch(`${BASE_URL}/attendance/punch-out`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                // 'Content-Type' is intentionally omitted
                'Accept': 'application/json',
              },
              body: formData,
            });

            console.log('Response status:', response.status);

            // Get response as text first for debugging
            const responseText = await response.text();
            console.log('Raw response:', responseText);

            // Try to parse as JSON
            let data;
            try {
              data = JSON.parse(responseText);
            } catch (e) {
              console.log('Response is not JSON:', responseText);
              data = { message: responseText };
            }

            if (!response.ok) {
              throw new Error(data.message || `Punch out failed (${response.status})`);
            }

            // Success
            console.log('Punch Out Response:', data);
            Alert.alert('Success', 'Punch out successful');
            updatePunchInData(null);
            
          } catch (error) {
            console.error('=== PUNCH OUT ERROR ===');
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            
            // User-friendly error messages
            let errorMessage = 'Something went wrong';
            
            if (error.message.includes('Network request failed')) {
              errorMessage = `Cannot connect to server at ${BASE_URL}. Please check your network connection.`;
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
        },
      },
    ]);
  };

  return (
    <View style={styles.selfieContainer}>
      <Text style={styles.title}>Today's Activity:</Text>
      <View style={styles.container}>
        {puchInData ? (
          <>
            <View style={styles.detailsContainer}>
              {/* ---------- Image, Staus and punch date & Time -------- */}
              <View style={styles.punchInDetails}>
                <View style={styles.imageWrapper}>
                  <Image
                    style={styles.image}
                    source={{
                      uri: puchInData?.sessions?.[sessionLength - 1]
                        ?.punchInLocation?.imageUrl,
                    }}
                    alt="EmpId"
                  />
                </View>
                <StatusIndicator status={puchInData?.status} />
                <View style={styles.timeValue}>
                  <Text>Punched In:</Text>
                  <Text>{formattedDate}</Text>
                  <Text>{formattedTime}</Text>
                </View>
              </View>
              {/*--------------- Punch Button ----------- */}
              <View>
                <TouchableOpacity
                  style={[styles.punchOutButton, loading && styles.buttonDisabled]}
                  onPress={handlePunchOut}
                  disabled={loading}
                >
                  <Text style={styles.punchOutText}>
                    {loading ? 'Processing...' : 'Punch Out'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* ----------Sessions and Attendance Table ------------- */}
            <View>
              <View style={styles.sessionDetails}>
                <Text style={styles.sessionHeader}>PunchIn</Text>
                <Text style={styles.sessionHeader}>PunchOut</Text>
                <Text style={styles.sessionHeader}>Duration</Text>
              </View>
              {puchInData?.sessions?.map((session, index) => {
                const { formattedTime: punchInTime } = dateAndTime(
                  session?.punchIn,
                );
                const { formattedTime: punchOutTime } = dateAndTime(
                  session?.punchOut,
                );
                return (
                  <View key={index} style={styles.sessionContainer}>
                    <View style={styles.sessionDetails}>
                      <Text>{session.punchIn ? punchInTime : 'N/A'}</Text>
                      <Text>{session.punchOut ? punchOutTime : 'N/A'}</Text>
                      <Text>
                        {session.durationMinutes
                          ? `${session.durationMinutes} mins`
                          : 'N/A'}
                      </Text>
                    </View>
                  </View>
                );
              })}
              <View style={styles.totalWorking}>
                <Text style={styles.sessionHeader}>Total Working:</Text>
                <Text style={styles.sessionHeader}>
                  {puchInData?.totalWorkingMinutes || 'N/A'} Minutes
                </Text>
              </View>
            </View>
          </>
        ) : (
          <View>
            <Text>No data available for Today</Text>
          </View>
        )}
      </View>
    </View>
  );
}

// Add disabled button style if not already in your CSS
const localStyles = StyleSheet.create({
  buttonDisabled: {
    opacity: 0.6,
  }
});

// Merge with your existing styles
const mergedStyles = StyleSheet.flatten([styles, localStyles]);

export default React.memo(SelfieDetails);