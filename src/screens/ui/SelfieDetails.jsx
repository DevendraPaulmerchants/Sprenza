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
import { BASE_URL } from '@env';

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
            const { latitude, longitude } = await getCurrentLocation();
            console.log('Punch Out Location:', latitude, longitude);

            const address = await getAddressFromCoords(latitude, longitude);
            console.log('Punch Out Address:', address);

            const hasCameraPermission = await requestCameraPermission();
            if (!hasCameraPermission) {
              Alert.alert(
                'Permission Required',
                'Camera permission is required',
              );
              return;
            }
            const cameraResult = await launchCamera({
              mediaType: 'photo',
              cameraType: 'front',
              quality: 0.7,
              saveToPhotos: false,
            });

            if (cameraResult.didCancel) {
              console.log('User cancelled camera');
              return;
            }

            if (!cameraResult.assets || cameraResult.assets.length === 0) {
              Alert.alert('Error', 'Failed to capture image');
              return;
            }

            const photo = cameraResult.assets[0];

            const formData = new FormData();
            formData.append('latitude', String(latitude));
            formData.append('longitude', String(longitude));
            formData.append('address', address);

            formData.append('image', {
              uri:
                Platform.OS === 'android'
                  ? photo.uri
                  : photo.uri.replace('file://', ''),
              type: photo.type || 'image/jpeg',
              name: photo.fileName || 'punchout.jpg',
            });

            const response = await fetch(`${BASE_URL}/attendance/punch-out`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'multipart/form-data',
              },
              body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
              Alert.alert('Error', data.message || 'Punch out failed');
              return;
            }

            Alert.alert('Success', 'Punch out successful');
            console.log('Punch Out Response:', data);
            updatePunchInData(null);
          } catch (error) {
            console.error('Punch Out Error:', error);
            Alert.alert('Error', 'Something went wrong');
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
                  style={styles.punchOutButton}
                  onPress={handlePunchOut}
                  disabled={loading}
                >
                  <Text style={styles.punchOutText}>
                    {loading ? 'Punch Outing..' : 'Punch Out'}
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

export default React.memo(SelfieDetails);
