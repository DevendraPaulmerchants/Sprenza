import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { Colors, Fonts } from '../../utils/GlobalText';
import logo from '../../assets/logo.png';

const LogoHeader = () => {
  return (
    <View style={styles.container}>
      <View style={styles.logoWrapper}>
        <Image source={logo} style={styles.logo} />
      </View>
      <Text style={styles.appName}>PRESENZA</Text>
      <Text style={styles.subtitle}>Employee Portal</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: hp('5%'),
    marginTop: hp('-5%'),
  },
  logoWrapper: {
    width: wp('25%'),
    height: wp('25%'),
    borderRadius: wp('7%'),
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: hp('0.5%') },
    shadowOpacity: 0.3,
    shadowRadius: wp('2.5%'),
    elevation: 8,
    marginBottom: hp('2%'),
  },
  logo: {
    width: wp('20%'),
    height: wp('20%'),
    borderRadius: wp('6%'),
    resizeMode: 'cover',
  },
  appName: {
    color: Colors.primary,
    fontSize: wp('8%'),
    fontFamily: Fonts.medium,
    letterSpacing: wp('0.5%'),
    marginBottom: hp('1%'),
  },
  subtitle: {
    color: Colors.textPrimary,
    fontSize: wp('3.5%'),
    fontFamily: Fonts.light,
    letterSpacing: wp('1%'),
    opacity: 0.8,
  },
});

export default LogoHeader;