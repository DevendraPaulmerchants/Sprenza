import { Image, StyleSheet, Text, View } from 'react-native';
import logo from '../../assets/logo.png';
function AuthBackground({ children }) {
  return (
    <View style={styles.container}>
      <View style={styles.appNameSection}>
        <Text style={styles.appName}>Presenza</Text>
      </View>
      <View style={styles.logoSection}>
        <Image source={logo} style={styles.logo} />
      </View>
      <View style={styles.topShadow} />
      <View style={styles.bottomShadow} />
      <View style={styles.childrenWrapper}>{children}</View>
    </View>
  );
}

export default AuthBackground;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e2f4f',
  },
  appNameSection: {
    position: 'absolute',
    top: 60,
    zIndex: 9,
  },
  appName: {
    color: '#ffffff',
    fontSize: 36,
    fontFamily: 'Satisfy',
    letterSpacing: 1.2,
    fontWeight: '700',
    textShadowColor: '#2e9191',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 6,
  },
  logoSection: {
    marginBottom: 40,
    alignItems: 'center',
    zIndex: 2,
  },
  logo: {
    height: 120,
    width: 120,
    objectFit: 'cover',
  },
  topShadow: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#1a2642',
    opacity: 0.9,
    width: '90%',
    height: 300,
    borderBottomLeftRadius: 100,
  },
  bottomShadow: {
    position: 'absolute',
    bottom: -10,
    left: -10,
    backgroundColor: '#ff8555',
    opacity: 0.5,
    width: 300,
    height: 300,
    borderTopRightRadius: '100%',
  },
  childrenWrapper: {
    width: '90%',
  },
});
