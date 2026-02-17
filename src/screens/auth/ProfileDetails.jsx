import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProfileDetails = () => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text>Profile Details</Text>
          <Text>X</Text>
        </View>
        <View>
          <Text>Name: Devendra Kumar</Text>
          <Text>Email: dk321@gmail.com</Text>
        </View>
      </View>
    </View>
  );
};

export default ProfileDetails;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'rgb(34, 31, 31)',
    position: 'absolute',
    height: 100,
    width: 100,
    borderColor: 'green',
    borderWidth: 5,
    display: 'flex',
    justifyContent: 'center',
  },
  container: {
    backgroundColor: '#fff',
  },
});
