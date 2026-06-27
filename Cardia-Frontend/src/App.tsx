import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import PatientPredict from './pages/patient/PatientPredict';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientPrescriptions from './pages/patient/PatientPrescriptions';
import PatientTests from './pages/patient/PatientTests';
import PatientDoctors from './pages/patient/PatientDoctors';
import PatientPersonalDetails from './pages/patient/PatientPersonalDetails';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorPatientTests from './pages/doctor/DoctorPatientTests';
import DoctorPrescription from './pages/doctor/DoctorPrescription';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTests from './pages/admin/AdminTests';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminAddDoctor from './pages/admin/AdminAddDoctor';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/patient" element={<PatientDashboard />}>
          <Route index element={<Navigate to="predict" replace />} />
          <Route path="predict" element={<PatientPredict />} />
          <Route path="appointments" element={<PatientAppointments />} />
          <Route path="prescriptions" element={<PatientPrescriptions />} />
          <Route path="tests" element={<PatientTests />} />
          <Route path="doctors" element={<PatientDoctors />} />
          <Route path="personal-details" element={<PatientPersonalDetails />} />
        </Route>

        <Route path="/doctor" element={<DoctorDashboard />}>
          <Route index element={<Navigate to="appointments" replace />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="patient-tests" element={<DoctorPatientTests />} />
          <Route path="prescription" element={<DoctorPrescription />} />
        </Route>

        <Route path="/admin" element={<AdminDashboard />}>
          <Route index element={<Navigate to="users" replace />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="tests" element={<AdminTests />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="add-doctor" element={<AdminAddDoctor />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
