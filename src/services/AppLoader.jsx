import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { Colors, Fonts } from '../utils/GlobalText';
import logo from '../assets/logo.png';

const AppLoader = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(hp('5%'))).current;

  useEffect(() => {
    // Parallel animations
    Animated.parallel([
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
      // Scale animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      // Slide up animation
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();

    // Pulse animation for logo
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    );

    // Start pulse after initial animation
    setTimeout(() => {
      pulseAnimation.start();
    }, 800);

    return () => pulseAnimation.stop();
  }, []);

  return (
    <View style={styles.container}>
      {/* Background Elements */}
      <View style={styles.topShadow} />
      <View style={styles.bottomShadow} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Image source={logo} style={styles.logo} />
        </Animated.View>

        <Text style={styles.appName}>PRESENZA</Text>
        <Text style={styles.tagline}>Employee Attendance System</Text>

        {/* Animated Dots */}
        {/* <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, styles.dot1]} />
          <Animated.View style={[styles.dot, styles.dot2]} />
          <Animated.View style={[styles.dot, styles.dot3]} />
        </View> */}

        {/* <Text style={styles.loadingText}>Loading...</Text> */}
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: hp('2%') }} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topShadow: {
    position: 'absolute',
    top: -hp('1%'),
    right: -wp('2%'),
    backgroundColor: '#0b1425',
    opacity: 0.9,
    width: wp('90%'),
    height: hp('35%'),
    borderBottomLeftRadius: wp('25%'),
  },
  bottomShadow: {
    position: 'absolute',
    bottom: -hp('1%'),
    left: -wp('2%'),
    backgroundColor: Colors.primary,
    opacity: 0.5,
    width: wp('75%'),
    height: hp('35%'),
    borderTopRightRadius: wp('50%'),
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    width: wp('30%'),
    height: wp('30%'),
    borderRadius: wp('7%'),
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: hp('0.5%') },
    shadowOpacity: 0.3,
    shadowRadius: wp('2.5%'),
    elevation: 8,
    marginBottom: hp('3%'),
  },
  logo: {
    width: wp('25%'),
    height: wp('25%'),
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
  tagline: {
    color: Colors.textSecondary,
    fontSize: wp('3.5%'),
    fontFamily: Fonts.light,
    letterSpacing: wp('0.1%'),
    marginBottom: hp('4%'),
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  dot: {
    width: wp('2%'),
    height: wp('2%'),
    borderRadius: wp('1%'),
    backgroundColor: Colors.primary,
    marginHorizontal: wp('1%'),
  },
  dot1: {
    opacity: 0.5,
    transform: [{ scale: 0.8 }],
  },
  dot2: {
    opacity: 0.8,
    transform: [{ scale: 1 }],
  },
  dot3: {
    opacity: 1,
    transform: [{ scale: 1.2 }],
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: wp('3.2%'),
    fontFamily: Fonts.light,
    marginTop: hp('1%'),
  },
});

export default AppLoader;