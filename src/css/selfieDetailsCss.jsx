import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  selfieContainer: {
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: -8,
    color: '#111',
  },
  container: {
    marginTop: 20,
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 20,
  },
  detailsContainer: {
    display: 'flex',
    gap: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  punchInDetails: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '60%',
  },
  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: '100%',
    overflow: 'hidden',
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#1e2f4f',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  timeValue: {
    width: '50%',
  },
  punchOutButton: {
    backgroundColor: '#ff6b35',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  punchOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sessionDetails: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderColor: '#828282',
  },
  sessionHeader: {
    fontWeight: '700',
  },
  totalWorking: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 50,
  },
});
