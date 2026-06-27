import api from './api';
import { isNetworkError } from './api';
import { offlineResponse, MOCK_ADMIN_USERS, MOCK_ADMIN_PREDICTIONS } from './mockData';
import type { AdminUser, AdminPrediction, AppointmentListAdminViewDTO } from '../types';

export interface AddDoctorPayload {
  name: string;
  userName: string;
  email: string;
  password: string;
  contactNumber: string;
  age: number;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  specialization: string;
  fromDay: string;
  toDay: string;
  fromTime: string;
  toTime: string;
}

export const getAllUsersExceptAdmins = async () => {
  try {
    return await api.get<AdminUser[]>('/admin/users');
  } catch (err: unknown) {
    if (isNetworkError(err)) return offlineResponse(MOCK_ADMIN_USERS);
    throw err;
  }
};

export const getAdminUserById = async (id: number) => {
  try {
    return await api.get<AdminUser>(`/admin/users/${id}`);
  } catch (err: unknown) {
    if (isNetworkError(err)) {
      const user = MOCK_ADMIN_USERS.find((u) => u.id === id) ?? MOCK_ADMIN_USERS[0];
      return offlineResponse(user);
    }
    throw err;
  }
};

export const deleteAdminUser = async (id: number) => {
  try {
    return await api.delete<string>(`/admin/users/${id}`);
  } catch (err: unknown) {
    if (isNetworkError(err)) return offlineResponse('User deleted successfully.');
    throw err;
  }
};

export const getAdminMedicalTests = async () => {
  try {
    return await api.get<AdminPrediction[]>('/admin/medical-tests');
  } catch (err: unknown) {
    if (isNetworkError(err)) return offlineResponse(MOCK_ADMIN_PREDICTIONS);
    throw err;
  }
};

export const deleteAdminMedicalTest = async (id: number) => {
  try {
    return await api.delete<string>(`/admin/medical-test/${id}`);
  } catch (err: unknown) {
    if (isNetworkError(err)) return offlineResponse('Medical test deleted successfully.');
    throw err;
  }
};

export const getAdminAppointments = async () => {
  try {
    return await api.get<AppointmentListAdminViewDTO[]>('/admin/appointments');
  } catch (err: unknown) {
    if (isNetworkError(err)) return offlineResponse([]);
    throw err;
  }
};

export const deleteAdminAppointment = async (appointmentId: number) => {
  try {
    return await api.delete<string>(`/admin/appointment/${appointmentId}`);
  } catch (err: unknown) {
    if (isNetworkError(err)) return offlineResponse('Appointment deleted successfully.');
    throw err;
  }
};

export const addDoctor = async (payload: AddDoctorPayload) => {
  try {
    return await api.post<{ message: string; role: string }>('/admin/doctors', payload);
  } catch (err: unknown) {
    if (isNetworkError(err)) return offlineResponse({ message: 'Doctor registered successfully.', role: 'DOCTOR' });
    throw err;
  }
};