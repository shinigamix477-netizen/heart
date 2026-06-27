import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import logo from '../../Logo.png';
import { PatientProvider, usePatient } from '../context/PatientContext';

const NAV = [
  { to: 'predict',          label: 'Risk Prediction'   },
  { to: 'appointments',     label: 'My Appointments'   },
  { to: 'prescriptions',    label: 'My Prescriptions'  },
  { to: 'tests',            label: 'My Medical Tests'  },
  { to: 'doctors',          label: 'Find a Doctor'     },
  { to: 'personal-details', label: 'Personal Details'  },
];

import { logout } from '../services/authService';



function DashboardHeader() {
  const { profile, loading } = usePatient();
  const navigate = useNavigate();
// In your component:
  const handleLogout = async () => {
    try {
      await logout();
      // Clear any local storage data
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');
      // Navigate to login
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, navigate to login
      navigate('/login');
    }
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Cardia" className="h-10 w-auto object-contain flex-shrink-0" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Patient Portal</h1>
              <p className="text-sm text-gray-500">
                Welcome back,{' '}
                <span className="font-semibold text-blue-700">
                  {loading ? '…' : (profile?.name ?? 'Patient')}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Patient
            </span>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
        <nav className="flex overflow-x-auto">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

export default function PatientDashboard() {
  return (
    <PatientProvider>
      <div className="min-h-screen bg-slate-50">
        <DashboardHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </div>
    </PatientProvider>
  );
}
