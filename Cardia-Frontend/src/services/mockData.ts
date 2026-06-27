import type { AxiosResponse } from 'axios';
import type {
  PatientProfile,
  ApiDoctor,
  DoctorPatient,
  PredictionItem,
  PrescriptionTemplate,
  AdminUser,
  AdminPrediction,
} from '../types';

export function offlineResponse<T>(data: T): AxiosResponse<T> {
  return { data, status: 200, statusText: 'OK' } as unknown as AxiosResponse<T>;
}

export const MOCK_PATIENT_PROFILE: PatientProfile = {
  id: 1,
  name: 'Ahmed Hassan',
  userName: 'ahmed.hassan',
  email: 'patient@cardia.health',
  contactNumber: '01012345678',
  streetAddress: '12 Tahrir Square',
  city: 'Cairo',
  state: 'Cairo Governorate',
  country: 'Egypt',
  age: 45,
  prescriptions: [
    {
      patientName: 'Ahmed Hassan',
      doctorName: 'Dr. Karim Nour',
      prescriptionDate: '2026-06-10 00:00:00',
      content: [
        'Medication: Aspirin 75 mg',
        'Dosage: Once daily after meals',
        'Duration: 3 months',
        'Diagnosis: Stable angina pectoris – maintain low-sodium diet',
        'Warnings: Avoid NSAIDs; follow up in 4 weeks',
      ],
    },
    {
      patientName: 'Ahmed Hassan',
      doctorName: 'Dr. Karim Nour',
      prescriptionDate: '2026-04-22 00:00:00',
      content: [
        'Medication: Atorvastatin 40 mg',
        'Dosage: Once daily at bedtime',
        'Duration: Ongoing',
        'Diagnosis: Hypercholesterolemia – routine lipid monitoring every 3 months',
      ],
    },
  ],
  predictions: [
    {
      id: 1,
      DateAndTime: '2026-06-20 14:32:00',
      riskScore: 'Moderate',
      result: 'Possible Heart Disease',
      belongsTo: 'Ahmed Hassan',
      age: 52, sex: '1', cp: '0', trestbps: 140, chol: 268, fbs: '0',
      restecg: '1', thalch: 138, exang: '1', oldpeak: 2.3, slope: '1', ca: '2', thal: '3',
    },
    {
      id: 2,
      DateAndTime: '2026-05-15 09:10:00',
      riskScore: 'Low',
      result: 'No Heart Disease',
      belongsTo: 'Ahmed Hassan',
      age: 45, sex: '1', cp: '2', trestbps: 120, chol: 210, fbs: '0',
      restecg: '0', thalch: 155, exang: '0', oldpeak: 0.5, slope: '0', ca: '0', thal: '2',
    },
  ],
};

export const MOCK_DOCTORS: ApiDoctor[] = [
  {
    id: 1,
    name: 'Dr. Karim Nour',
    contactNumber: '01098765432',
    streetAddress: '5 Al-Nil Street',
    city: 'Cairo',
    state: 'Cairo Governorate',
    country: 'Egypt',
    specialization: 'Interventional Cardiologist',
    workTime: '9:00 AM – 4:00 PM',
  },
  {
    id: 2,
    name: 'Dr. Sara Hassan',
    contactNumber: '01155566677',
    streetAddress: '18 Mohandiseen Avenue',
    city: 'Giza',
    state: 'Giza Governorate',
    country: 'Egypt',
    specialization: 'Echocardiographer',
    workTime: '10:00 AM – 5:00 PM',
  },
  {
    id: 3,
    name: 'Dr. Khaled Mansour',
    contactNumber: '01222233344',
    streetAddress: '7 Sidi Gaber Street',
    city: 'Alexandria',
    state: 'Alexandria Governorate',
    country: 'Egypt',
    specialization: 'Electrophysiologist',
    workTime: '8:00 AM – 3:00 PM',
  },
];

export const MOCK_DOCTOR_PATIENTS: DoctorPatient[] = [
  { id: 1, patientName: 'Ahmed Hassan', BookingDateAndTime: '2026-06-30 10:00:00' },
  { id: 2, patientName: 'Sara Mohamed', BookingDateAndTime: '2026-06-30 11:30:00' },
  { id: 3, patientName: 'Omar Farouk',  BookingDateAndTime: '2026-07-03 01:00:00' },
];

export const MOCK_PREDICTIONS: PredictionItem[] = [
  {
    id: 1,
    DateAndTime: '2026-06-20 14:32:00',
    riskScore: 'Moderate',
    result: 'Possible Heart Disease',
    belongsTo: 'Ahmed Hassan',
    age: 52, sex: '1', cp: '0', trestbps: 140, chol: 268, fbs: '0',
    restecg: '1', thalch: 138, exang: '1', oldpeak: 2.3, slope: '1', ca: '2', thal: '3',
  },
  {
    id: 2,
    DateAndTime: '2026-05-15 09:10:00',
    riskScore: 'Low',
    result: 'No Heart Disease',
    belongsTo: 'Ahmed Hassan',
    age: 45, sex: '1', cp: '2', trestbps: 120, chol: 210, fbs: '0',
    restecg: '0', thalch: 155, exang: '0', oldpeak: 0.5, slope: '0', ca: '0', thal: '2',
  },
  {
    id: 3,
    DateAndTime: '2026-04-08 16:45:00',
    riskScore: 'High',
    result: 'Heart Disease Detected',
    belongsTo: 'Ahmed Hassan',
    age: 58, sex: '1', cp: '3', trestbps: 162, chol: 310, fbs: '1',
    restecg: '2', thalch: 112, exang: '1', oldpeak: 3.8, slope: '2', ca: '3', thal: '3',
  },
];

export const MOCK_PRESCRIPTION_TEMPLATE: PrescriptionTemplate = {
  patientName: 'Ahmed Hassan',
  doctorName: 'Dr. Karim Nour',
  prescriptionDate: '2026-06-25 00:00:00',
  content: [
    'Patient presents with stable angina pectoris.',
    'Maintain low-sodium diet and moderate physical activity.',
  ],
};

export const MOCK_ADMIN_USERS: AdminUser[] = [
  {
    id: 1,
    userName: 'ahmed.hassan',
    email: 'patient@cardia.health',
    contactNumber: '01012345678',
    age: 45,
    streetAddress: '12 Tahrir Square',
    city: 'Cairo',
    state: 'Cairo Governorate',
    country: 'Egypt',
    roleName: 'PATIENT',
  },
  {
    id: 2,
    userName: 'sara.mohamed',
    email: 'sara@cardia.health',
    contactNumber: '01198765432',
    age: 32,
    streetAddress: '5 Zamalek Boulevard',
    city: 'Cairo',
    state: 'Cairo Governorate',
    country: 'Egypt',
    roleName: 'PATIENT',
  },
  {
    id: 3,
    userName: 'dr.karim.nour',
    email: 'doctor@cardia.health',
    contactNumber: '01098765432',
    age: 41,
    streetAddress: '5 Al-Nil Street',
    city: 'Cairo',
    state: 'Cairo Governorate',
    country: 'Egypt',
    roleName: 'DOCTOR',
  },
  {
    id: 4,
    userName: 'dr.sara.hassan',
    email: 'sara.doctor@cardia.health',
    contactNumber: '01155566677',
    age: 36,
    streetAddress: '18 Mohandiseen Avenue',
    city: 'Giza',
    state: 'Giza Governorate',
    country: 'Egypt',
    roleName: 'DOCTOR',
  },
  {
    id: 5,
    userName: 'omar.farouk',
    email: 'omar@cardia.health',
    contactNumber: '01044422233',
    age: 58,
    streetAddress: '9 Heliopolis Street',
    city: 'Cairo',
    state: 'Cairo Governorate',
    country: 'Egypt',
    roleName: 'PATIENT',
  },
];

export const MOCK_ADMIN_PREDICTIONS: AdminPrediction[] = [
  {
    id: 1,
    DateAndTime: '2026-06-20 14:32:00',
    riskScore: 'Moderate',
    result: 'Possible Heart Disease',
    belongsTo: 'Ahmed Hassan',
    age: 52, sex: '1', cp: '0', trestbps: 140, chol: 268, fbs: '0',
    restecg: '1', thalch: 138, exang: '1', oldpeak: 2.3, slope: '1', ca: '2', thal: '3',
  },
  {
    id: 2,
    DateAndTime: '2026-06-18 10:05:00',
    riskScore: 'High',
    result: 'Heart Disease Detected',
    belongsTo: 'Omar Farouk',
    age: 58, sex: '1', cp: '3', trestbps: 165, chol: 322, fbs: '1',
    restecg: '2', thalch: 110, exang: '1', oldpeak: 4.1, slope: '2', ca: '3', thal: '3',
  },
  {
    id: 3,
    DateAndTime: '2026-06-15 09:10:00',
    riskScore: 'Low',
    result: 'No Heart Disease',
    belongsTo: 'Sara Mohamed',
    age: 38, sex: '0', cp: '2', trestbps: 118, chol: 195, fbs: '0',
    restecg: '0', thalch: 162, exang: '0', oldpeak: 0.2, slope: '0', ca: '0', thal: '2',
  },
  {
    id: 4,
    DateAndTime: '2026-06-12 16:45:00',
    riskScore: 'Moderate',
    result: 'Possible Heart Disease',
    belongsTo: 'Khaled Ali',
    age: 49, sex: '1', cp: '1', trestbps: 132, chol: 245, fbs: '0',
    restecg: '1', thalch: 142, exang: '0', oldpeak: 1.7, slope: '1', ca: '1', thal: '2',
  },
  {
    id: 5,
    DateAndTime: '2026-06-10 11:20:00',
    riskScore: 'High',
    result: 'Heart Disease Detected',
    belongsTo: 'Nour El-Din',
    age: 63, sex: '1', cp: '3', trestbps: 178, chol: 355, fbs: '1',
    restecg: '2', thalch: 98, exang: '1', oldpeak: 5.0, slope: '2', ca: '4', thal: '3',
  },
];
