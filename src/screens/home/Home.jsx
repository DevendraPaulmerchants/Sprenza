import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { dateAndTime } from '../../utils/formattedDateandTime';
import SelfieDetails from '../ui/SelfieDetails';
import QuickActions from '../ui/QuickActions';
import { styles } from '../../css/homeCss';
import CompanyLogoName from '../../components/common/CompanyLogoName';
import { BASE_URL } from '../../utils/GlobalText';

const HomeScreen = () => {
  const { logout, user, accessToken, puchInData, updatePunchInData } =
    useAuth();

  const [currentDateTime, setCurrentDateTime] = useState(
    dateAndTime(new Date()),
  );

  const rawName = user?.email?.split('@')[0]?.split('.')[0] || 'User';
  const userName =
    rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();

  useEffect(() => {
    if (!accessToken) return;
    fetch(`${BASE_URL}/attendance/history`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        console.log('Attendance History:', data);
      })
      .catch(err => {
        console.error('Error fetching attendance history:', err);
      });
  }, [accessToken]);

  useEffect(() => {
    const update = () => setCurrentDateTime(dateAndTime(new Date()));
    // update every minute
    const intervalId = setInterval(update, 60000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={true}
      scrollEventThrottle={16}
      decelerationRate="normal"
      bouncesZoom={false}
    >
      <View style={styles.container}>
        <CompanyLogoName />
        <View style={styles.userInfo}>
          <Text style={styles.title}>Welcome back, {userName}!</Text>
          <Text style={styles.date}>{currentDateTime.formattedDate}</Text>
          <View style={styles.timeContainer}>
            <Text style={styles.timeTitle}>Current Time:</Text>
            <Text style={styles.time}>{currentDateTime.formattedTime}</Text>
          </View>
        </View>
        <QuickActions />
        <View>
          <SelfieDetails
            puchInData={puchInData}
            accessToken={accessToken}
            updatePunchInData={updatePunchInData}
          />
        </View>
        <View style={styles.clearBtnContainer}>
          <TouchableOpacity onPress={() => logout()} style={styles.clearBtn}>
            <Text style={styles.clearButtonText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
