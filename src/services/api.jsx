import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';

const BASE_URL = 'http://103.171.97.71/api/v1';

const isTokenExpired = token => {
  const decoded = jwtDecode(token);
  return decoded.exp * 1000 < Date.now();
};

const refreshAccessToken = async refreshToken => {
  const response = await fetch(`${BASE_URL}/auth/refresh-tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error('Session expired');

  await AsyncStorage.setItem('accessToken', data.access.token);
  return data.access.token;
};

export const apiRequest = async (endpoint, options = {}) => {
  let accessToken = await AsyncStorage.getItem('accessToken');
  const refreshToken = await AsyncStorage.getItem('refreshToken');

  if (accessToken && isTokenExpired(accessToken)) {
    accessToken = await refreshAccessToken(refreshToken);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers || {}),
    },
  });

  return response.json();
};
