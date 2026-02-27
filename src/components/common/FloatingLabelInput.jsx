import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Animated, StyleSheet } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { Colors, Fonts } from '../../utils/GlobalText';

const FloatingLabelInput = ({
  label,
  value,
  onChangeText,
  onFocus,
  onBlur,
  keyboardType,
  autoCapitalize,
  maxLength,
  placeholder,
  placeholderTextColor,
  secureTextEntry,
  editable = true,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const floatingAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(floatingAnim, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelStyle = {
    position: 'absolute',
    left: wp('4%'),
    top: floatingAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [hp('2.2%'), -hp('1.2%')],
    }),
    fontSize: floatingAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [wp('3.8%'), wp('3%')],
    }),
    color: floatingAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [Colors.textSecondary, isFocused ? Colors.primary : Colors.textSecondary],
    }),
    backgroundColor: Colors.background,
    paddingHorizontal: wp('1.5%'),
    zIndex: 10,
    fontFamily: Fonts.medium,
  };

  return (
    <View style={[styles.container, style]}>
      <Animated.Text style={labelStyle}>
        {label}
      </Animated.Text>
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          !editable && styles.inputDisabled,
        ]}
        value={value}
        onChangeText={onChangeText}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
        placeholder={isFocused ? placeholder : ''}
        placeholderTextColor={placeholderTextColor || Colors.textSecondary}
        secureTextEntry={secureTextEntry}
        editable={editable}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: hp('2.5%'),
    position: 'relative',
  },
  input: {
    height: hp('7%'),
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: wp('3%'),
    paddingHorizontal: wp('4%'),
    fontSize: wp('3.8%'),
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
    fontFamily: Fonts.light,
  },
  inputFocused: {
    borderColor: Colors.primary,
  },
  inputDisabled: {
    opacity: 0.6,
    backgroundColor: Colors.disabled,
  },
});

export default FloatingLabelInput;