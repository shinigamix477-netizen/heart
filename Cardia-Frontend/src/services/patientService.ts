import api from './api';
import { isNetworkError } from './api';
import { offlineResponse, MOCK_PATIENT_PROFILE, MOCK_DOCTORS } from './mockData';
import type { PatientProfile, ApiDoctor, PrescriptionItem, AppointmentListPatientViewDTO } from '../types';

export interface RegisterPayload {
  name: string;
  userName: string;
  email: string;
  password: string;
  contactNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  age: number;
  country: string;
}

export interface UpdatePatientPayload {
  name: string;
  userName: string;
  email: string;
  password: string;
  contactNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  age: number;
}

export interface PatientMedicalDataDTO {
  age: number;
  sex: number;
  cp: number;
  trestbps: number;
  chol: number;
  fbs: number;
  restecg: number;
  thalch: number;
  exang: number;
  oldpeak: number;
  slope: number;
  ca: number;
  thal: number;
}

export interface PredictionResultDTO {
  DateAndTime: string;
  diagnosis: string;
  riskProbability: string;
  riskCategory: string;
  recommendedDoctors: ApiDoctor[];
  belongsTo: string;
  recommendationMsg: string;
}

export const registerPatient = (payload: RegisterPayload) =>
    api.post<{ email: string; role: string }>('/patient/register', payload);

export const getPatientProfile = async (email: string) => {
  try {
    return await api.get<PatientProfile>(`/patient/me?patientEmail=${email}`);
  } catch (err: unknown) {
    if (isNetworkError(err)) return offlineResponse(MOCK_PATIENT_PROFILE);
    throw err;
  }
};

export const updatePatient = async (email: string, payload: UpdatePatientPayload) => {
  try {
    return await api.put<{ Message: string }>(`/patient/update?patientEmail=${email}`, payload);
  } catch (err: unknown) {
    if (isNetworkError(err)) return offlineResponse({ Message: 'Profile updated successfully.' });
    throw err;
  }
};

export const getDoctors = async (email: string) => {
  try {
    return await api.get<ApiDoctor[]>(`/patient/doctors?patientEmail=${email}`);
  } catch (err: unknown) {
    if (isNetworkError(err)) return offlineResponse(MOCK_DOCTORS);
    throw err;
  }
};

export const bookAppointment = async (
    patientEmail: string,
    doctorId: number,
    connectivityType: 'ONLINE' | 'OFFLINE',
    time: string
) => {
  try {
    return await api.post<string>(
        `/patient/book-appointment/${doctorId}?patientEmail=${patientEmail}&connectivityType=${connectivityType}&time=${encodeURIComponent(time)}`,
        {}
    );
  } catch (err: unknown) {
    if (isNetworkError(err)) return offlineResponse('Appointment booked successfully.');
    throw err;
  }
};

export const getPatientAppointments = async (email: string) => {
  try {
    return await api.get<AppointmentListPatientViewDTO[]>(`/patient/me/appointments?patientEmail=${email}`);
  } catch (err: unknown) {
    if (isNetworkError(err)) return offlineResponse([]);
    throw err;
  }
};

export const cancelAppointment = async (email: string, appointmentId: number) => {
  try {
    return await api.patch<string>(
        `/patient/cancel-appointment/${appointmentId}?patientEmail=${email}`
    );
  } catch (err: unknown) {
    if (isNetworkError(err)) return offlineResponse('Appointment cancelled successfully.');
    throw err;
  }
};

export const getPatientMedicalTests = async (email: string) => {
  try {
    return await api.get(`/patient/me/medical-tests?patientEmail=${email}`);
  } catch (err: unknown) {
    if (isNetworkError(err)) return offlineResponse([]);
    throw err;
  }
};

export const getPatientPrescriptions = async (email: string) => {
  try {
    return await api.get<PrescriptionItem[]>(`/patient/me/prescriptions?patientEmail=${email}`);
  } catch (err: unknown) {
    if (isNetworkError(err)) return offlineResponse([]);
    throw err;
  }
};

export const predictHeartDisease = async (email: string, medicalData: PatientMedicalDataDTO) => {
  try {
    return await api.post<PredictionResultDTO>(
        `/patient/predict?patientEmail=${email}`,
        medicalData
    );
  } catch (err: unknown) {
    throw err;
  }
};