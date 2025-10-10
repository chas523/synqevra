import axios from 'axios';

export const proxyApi = axios.create({
  baseURL: process.env.MODERN_PROXY_URL,
  timeout: 10000,
  // withCredentials: true
});
