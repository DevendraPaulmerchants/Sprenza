import { StyleSheet } from 'react-native';
import { COLORS } from '../utils/colors';

export const styles = StyleSheet.create({
  scrollView: {
    scrollBehavior: 'smooth',
  },
  container: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginHorizontal: 'auto',
    backgroundColor: '#eee',
  },
  userInfo: {
    marginVertical: 20,
    width: '100%',
    backgroundColor: '#1e2f4f',
    padding: 20,
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  date: {
    color: '#a2f4fd',
    fontSize: 18,
    marginTop: 5,
  },
  timeContainer: {
    marginTop: 10,
    backgroundColor: '#ff6b35',
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  timeTitle: {
    fontSize: 16,
    color: '#eee',
  },
  time: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },

  name: {
    marginTop: 10,
    fontSize: 20,
    textAlign: 'center',
    color: COLORS.subText,
  },
  buttonText: {
    fontSize: 20,
    cursor: 'pointer',
  },
  clearBtnContainer: {
    marginTop: 10,
  },
  clearBtn: {
    backgroundColor: '#646464',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  clearButtonText: {
    color: '#fff',
  },
});
