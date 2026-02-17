import { StyleSheet } from 'react-native';
import { COLORS } from '../../utils/colors';

export const styles = StyleSheet.create({
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
  },
  logo: {
    height: 100,
    width: 100,
    objectFit: 'cover',
  },
  wrapper: {
    width: '90%',
    padding: 20,
    zIndex: 2,
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

  lable: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 15,
  },

  button: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 30,
  },

  buttonText: {
    color: '#1e2f4f',
    fontSize: 16,
    fontWeight: '600',
  },
});
