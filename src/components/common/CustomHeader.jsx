import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Power } from 'lucide-react-native';
import { Colors, Fonts, GlobalText } from '../../utils/GlobalText';
import logo from '../../assets/logo.png';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/actions/authActions';

const CustomHeader = ({
  title,
  showBack = false,
  showMenu = true,
  onMenuPress,
  rightComponent,
  backgroundColor = '#1C2541',
}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleLogout = () => {
    Alert.alert(
      GlobalText.buttons.logout || 'Logout',
      GlobalText.alerts.logoutConfirm || 'Are you sure you want to logout?',
      [
        { text: GlobalText.buttons.cancel || 'Cancel', style: 'cancel' },
        {
          text: GlobalText.buttons.logout || 'Logout',
          onPress: async () => await dispatch(logout()),
          style: 'destructive',
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={backgroundColor} />
      <View style={[styles.container, { backgroundColor }]}>
        {/* Left Section */}
        <View style={styles.leftSection}>
          {showBack ? (
            <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
              <ArrowLeft size={wp('5%')} color="#fff" />
            </TouchableOpacity>
          ) : (
            <View style={styles.logoSection}>
              <Image source={logo} style={styles.logo} />
              <Text style={styles.appName}>Presenza</Text>
            </View>
          )}
        </View>

        {/* Center Section (Optional Title) */}
        {title && (
          <View style={styles.centerSection}>
            {title !== 'Home' && <Text style={styles.title}>{title}</Text>}
          </View>
        )}

        {/* Right Section */}
        <View style={styles.rightSection}>
          <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
            <Power size={wp('5.5%')} color={Colors.error} />
          </TouchableOpacity>
          {rightComponent}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4%'),
    paddingTop: Platform.OS === 'ios' ? hp('5%') : hp('4%'),
    borderBottomWidth: 1,
    backgroundColor: '#1C2541',
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
    paddingVertical: hp('0.5%'),
    paddingTop: hp('1%'),
    paddingHorizontal: wp('2%'),
  },
  logo: {
    width: wp('5%'),
    height: wp('5%'),
    borderRadius: wp('50%'),
    resizeMode: 'cover',
  },
  appName: {
    color: Colors.primary,
    fontSize: wp('4%'),
    fontFamily: Fonts.medium,
    letterSpacing: wp('0.1%'),
  },
  title: {
    color: Colors.secondary,
    fontSize: wp('4.5%'),
    fontFamily: Fonts.medium,
  },
  iconButton: {
    padding: wp('2%'),
    paddingRight: wp('4%'),
  },
});

export default CustomHeader;
