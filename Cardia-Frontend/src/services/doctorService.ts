import api from './api';
import { isNetworkError } from './api';
import {
  offlineResponse,
  MOCK_PRESCRIPTION_TEMPLATE,
} from './mockData';
import type { AppointmentListDoctorViewDTO, PredictionItem, PrescriptionTemplate } from '../types';

export interface SavePrescriptionPayload {
  patientName: string;
  doctorName: string;
  // prescriptionDate: string; // Format: "yyyy-MM-dd HH:mm:ss"
  // content: string[];
}

export const getDoctorAppointments = async (doctorEmail: string) => {
  try {
    return await api.get<AppointmentListDoctorViewDTO[]>(`/doctor/appointments?doctorEmail=${doctorEmail}`);
  } catch (err: unknown) {
    if (isNetworkError(err)) return offlineResponse([]);
    throw err;
  }
};

export const getPatientMedicalTests = async (doctorEmail: string, appointmentId: number) => {
  try {
    return await api.get<PredictionItem[]>(
        `/doctor/appointment/${appointmentId}/medical-tests?doctorEmail=${doctorEmail}`
    );
  } catch (err: unknown) {
    if (isNetworkError(err)) return offlineResponse([]);
    throw err;
  }
};

export const getPrescriptionTemplate = async (doctorEmail: string, appointmentId: number) => {
  try {
    return await api.get<PrescriptionTemplate>(
        `/doctor/appointment/${appointmentId}/prescription?doctorEmail=${doctorEmail}`
    );
  } catch (err: unknown) {
    if (isNetworkError(err)) return offlineResponse(MOCK_PRESCRIPTION_TEMPLATE);
    throw err;
  }
};

export const savePrescription = async (doctorEmail: string, payload: SavePrescriptionPayload) => {
  try {
    console.log('📤 Saving prescription:', JSON.stringify(payload, null, 2));
    const response = await api.post<string>(`/doctor/save-prescription?doctorEmail=${doctorEmail}`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      transformRequest: [(data) => JSON.stringify(data)],
    });
    return response;
  } catch (err: unknown) {
    console.error('❌ Save prescription error:', err);
    if (isNetworkError(err)) {
      return offlineResponse('Prescription saved successfully.');
    }
    throw err;
  }
};