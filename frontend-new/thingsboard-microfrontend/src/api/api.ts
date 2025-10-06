import axios from 'axios';

export const thingsBoardApi = axios.create({
  baseURL: process.env.MODERN_THINGSBOARD_BASE_URL,
  timeout: 10000,
});

thingsBoardApi.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
