import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Animated,
  PanResponder,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { Colors, Fonts } from '../../utils/GlobalText';

const { width } = Dimensions.get('window');

const SlideableAlert = ({ 
  visible, 
  message, 
  type = 'success', 
  duration = 3000,
  onDismiss 
}) => {
  // All hooks must be called in the same order every time
  const [localVisible, setLocalVisible] = useState(visible);
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);
  const isMounted = useRef(true);

  const colors = {
    success: { bg: Colors.success },
    error: { bg: Colors.error },
    info: { bg: Colors.info },
    warning: { bg: Colors.warning },
  };

  // Update local state when prop changes
  useEffect(() => {
    setLocalVisible(visible);
  }, [visible]);

  // Setup mounted ref
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // PanResponder - must be created before any conditional returns
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        translateX.setValue(gesture.dx);
        translateY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        if (Math.abs(gesture.dy) > 50 || Math.abs(gesture.dx) > wp('20%')) {
          // Swipe away
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: gesture.dy < 0 ? -200 : 200,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            if (isMounted.current && onDismiss) {
              onDismiss();
            }
          });
        } else {
          // Reset position
          Animated.parallel([
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }),
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  // Animation effect
  useEffect(() => {
    if (!localVisible) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    translateX.setValue(0);
    translateY.setValue(-100);
    
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    timerRef.current = setTimeout(() => {
      if (!isMounted.current) return;
      
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (isMounted.current && onDismiss) {
          onDismiss();
        }
      });
    }, duration);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [localVisible, duration]);

  // Return null if not visible (after all hooks)
  if (!localVisible) return null;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.container,
        {
          backgroundColor: colors[type].bg,
          transform: [
            { translateX },
            { translateY }
          ],
          opacity,
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.message} numberOfLines={2}>{message}</Text>
      </View>
      <TouchableOpacity 
        onPress={() => {
          if (onDismiss) onDismiss();
        }} 
        style={styles.closeButton}
      >
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? hp('7%') : hp('6%'),
    left: wp('5%'),
    right: wp('5%'),
    padding: hp('1%'),
    borderRadius: wp('3%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: hp('0.3%') },
    shadowOpacity: 0.25,
    shadowRadius: wp('1%'),
    elevation: 9999,
    zIndex: 9999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  message: {
    color: Colors.textPrimary,
    fontSize: wp('3.2%'),
    fontFamily: Fonts.medium,
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: wp('1%'),
    marginLeft: wp('2%'),
  },
  closeText: {
    color: Colors.textPrimary,
    fontSize: wp('5%'),
    fontWeight: 'bold',
  },
});

export default SlideableAlert;