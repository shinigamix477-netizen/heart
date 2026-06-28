import axios from 'axios';

const api = axios.create({
  baseURL: 'https://baasas-cardia-java-backend.hf.space',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

export function isNetworkError(err: unknown): boolean {
  return axios.isAxiosError(err) && !err.response;
}

export default api;
