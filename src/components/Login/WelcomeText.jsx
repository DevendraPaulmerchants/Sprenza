import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { Colors, Fonts, GlobalText } from '../../utils/GlobalText';

const WelcomeText = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{GlobalText.login.title}</Text>
      <Text style={styles.subtitle}>
        {GlobalText.login.subtitle}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: hp('5%'),
  },
  title: {
    color: Colors.textPrimary,
    fontSize: wp('7%'),
    fontFamily: Fonts.medium,
    marginBottom: hp('1%'),
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: wp('3.5%'),
    fontFamily: Fonts.light,
    textAlign: 'center',
    lineHeight: hp('2.5%'),
    paddingHorizontal: wp('5%'),
  },
});

export default WelcomeText;