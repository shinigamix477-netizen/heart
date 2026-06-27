import api from './api';
// import type { PatientProfile } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  email: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
}

export const login = (payload: LoginPayload) =>
    api.post<LoginResponse>('/auth/login', payload);

export const logout = () => api.get('/auth/logout');

export const getCurrentRole = (): 'PATIENT' | 'DOCTOR' | 'ADMIN' | null => {
  const role = localStorage.getItem('userRole');
  if (role === 'PATIENT' || role === 'DOCTOR' || role === 'ADMIN') {
    return role;
  }
  return null;
};

export const getCurrentEmail = (): string | null => {
  return localStorage.getItem('userEmail');
};

// Updated determineRole with email parameter
export const determineRole = async (email: string): Promise<'PATIENT' | 'DOCTOR' | 'ADMIN'> => {
  try {
    // Try to fetch patient data
    await api.get(`/patient/me?patientEmail=${email}`);
    return 'PATIENT';
  } catch {
    try {
      // Try to fetch doctor data
      await api.get(`/doctor/appointments?doctorEmail=${email}`);
      return 'DOCTOR';
    } catch {
      // Assume admin if neither works
      return 'ADMIN';
    }
  }
};