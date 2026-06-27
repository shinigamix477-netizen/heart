export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';
export type AppointmentStatus = 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'PASSED';
export type RiskLevel = 'Low' | 'Moderate' | 'High';
export type ConnectivityType = 'ONLINE' | 'OFFLINE';

export interface PredictionItem {
  id?: number;
  createdAt: string;
  riskProbability: number;
  riskCategory: string;
  diagnosis: string;
  patientId: number;
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

export interface PrescriptionItem {
  patientName: string;
  doctorName: string;
  // prescriptionDate: string;
  // content: string[];
}

export interface PatientProfile {
  id: number;
  name: string;
  userName: string;
  email: string;
  contactNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  age: number;
  prescriptions: PrescriptionItem[];
  predictions: PredictionItem[];
}

export interface ApiDoctor {
  id: number;
  name: string;
  contactNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  specialization: string;
  workTime: string;
  fromDay?: string;  // "MONDAY"
  toDay?: string;   
  fromTime?: string;
  toTime?: string;   // e.g., "17:00:00"
}

export interface AppointmentListPatientViewDTO {
  appointmentId: number;
  doctorName: string;
  time: string;
  connectivityType: ConnectivityType;
  appointmentStatus: AppointmentStatus;
  meetingLink: string | null;
}

export interface AppointmentListDoctorViewDTO {
  appointmentId: number;
  patientName: string;
  time: string;
  connectivityType: ConnectivityType;
  appointmentStatus: AppointmentStatus;
  meetingLink: string | null;
}

export interface AppointmentListAdminViewDTO {
  id: number;
  patientName: string;
  doctorName: string;
  appointmentTime: string;
  status: AppointmentStatus;
  connectivityType: ConnectivityType;
  meetingLink: string | null;
}

export interface AdminUser {
  id: number;
  userName: string;
  email: string;
  contactNumber: string;
  age: number;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  roleName: string;
}

export interface AdminPrediction {
  testId?: number;
  patientUserName: string;
  createdAt: string;
  riskProbability: number;
  riskCategory: string;
  diagnosis: string;
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

export interface PrescriptionTemplate {
  patientName: string;
  doctorName: string;
  prescriptionDate: string;
  content: string[];
}