import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Home, Clock } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Colors, Fonts } from '../../utils/GlobalText';
import { setAlert } from '../../store/actions/authActions';

const BottomNavigator = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  
  // Get today's attendance status from Redux
  const { history } = useSelector(state => state.attendance);
  
  // Check if user is already punched in today
  const today = new Date().toISOString().split('T')[0];
  const todayRecord = history?.find(record => {
    const recordDate = record.date.split('T')[0];
    return recordDate === today;
  });
  
  const sessions = todayRecord?.sessions || [];
  const lastSession = sessions[sessions.length - 1];
  const isUserCheckedIn = todayRecord?.status === 'PRESENT' && !lastSession?.punchOut;

  const tabs = [
    {
      name: 'Home',
      icon: Home,
      label: 'Home',
      route: 'Home',
    },
    {
      name: 'DailyPuch',
      icon: Clock,
      label: 'Punch',
      route: 'DailyPuch',
    },
  ];

  const isActive = (tabRoute) => {
    return route.name === tabRoute;
  };

  const handleTabPress = (tab) => {
    if (tab.route === 'DailyPuch') {
      // Check if already punched in
      if (isUserCheckedIn) {
        dispatch(setAlert('You are already punched in!', 'error'));
        return;
      }
    }
    navigation.navigate(tab.route);
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => {
        const Icon = tab.icon;
        const active = isActive(tab.route);
        
        return (
          <TouchableOpacity
            key={index}
            style={styles.tabItem}
            onPress={() => handleTabPress(tab)}
          >
            <Icon 
              size={wp('5.5%')} 
              color={active ? Colors.primary : '#9CA3AF'} 
            />
            <Text 
              style={[
                styles.tabLabel,
                { color: active ? Colors.primary : '#9CA3AF' }
              ]}
            >
              {tab.label}
            </Text>
            {active && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 25 : 12,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('0.5%'),
    position: 'relative',
  },
  tabLabel: {
    fontSize: wp('3%'),
    fontFamily: Fonts.light,
    marginTop: hp('0.3%'),
  },
  activeIndicator: {
    position: 'absolute',
    top: -hp('0.5%'),
    width: wp('15%'),
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
});

export default BottomNavigator;