import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { COLORS } from '../../utils/colors';
import ProfileDetails from './ProfileDetails';

const Profile = ({ route, navigation }) => {
  const { employeeId } = route?.params || {};
  const [open, setOpen] = useState(false);

  const navigateToLogIn = () => {
    console.log('empId:', employeeId);
    navigation.replace('Login');
  };
  const openProfileDetails = () => {
    setOpen(true);
  };
  const hideProfileDetails = () => {
    setOpen(false);
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Devendra !</Text>
      <Text style={styles.email}>
        <Text style={styles.textBold}>Name:</Text> {employeeId}
      </Text>
      {/* <Text style={styles.email}>
        <Text style={styles.textBold}>Email:</Text> {email}
      </Text> */}
      <TouchableOpacity style={styles.button} onPress={navigateToLogIn}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
      <View>
        <Pressable onPress={openProfileDetails}>
          <Text style={styles.button}>See Profile</Text>
        </Pressable>
      </View>
      {open && <ProfileDetails />}
    </View>
  );
};
export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  textBold: {
    fontSize: 20,
    fontWeight: 'medium',
    color: COLORS.text,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  email: {
    marginTop: 10,
    fontSize: 24,
    color: COLORS.subText,
  },
  button: {
    marginTop: 5,
    fontSize: 24,
    fontWeight: '700',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 14,
    borderRadius: 10,
    cursor: 'pointer',
  },
});
