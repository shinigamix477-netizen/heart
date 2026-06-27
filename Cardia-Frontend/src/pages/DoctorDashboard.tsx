import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import logo from '../../Logo.png';
import { getCurrentEmail } from '../services/authService';
import { logout } from '../services/authService';

const NAV = [
  { to: 'appointments',  label: 'Appointments'        },
  { to: 'patient-tests', label: 'Patient Medical Tests' },
  { to: 'prescription',  label: 'Write Prescription'  },
];

const STAT_CARDS = [
  { label: "Today's Appointments", value: '3',  color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-100'   },
  { label: 'Active Patients',       value: '12', color: 'text-teal-700',   bg: 'bg-teal-50',   border: 'border-teal-100'   },
  { label: 'High Risk Cases',       value: '2',  color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-100'    },
  { label: 'Pending Reports',       value: '5',  color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-100' },
];

const currentEmail = getCurrentEmail();

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <img src={logo} alt="Cardia" className="h-10 w-auto object-contain flex-shrink-0" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Doctor Portal</h1>
                  <p className="text-sm text-gray-500">Welcome back, <span className="font-semibold text-blue-700">
                    {currentEmail || 'Doctor'}
                  </span></p>
                </div>
              </div>
              <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                On Duty
              </span>
                <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors disabled:opacity-50"
                >
                  {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-4">
              {STAT_CARDS.map((s) => (
                  <div key={s.label} className={`rounded-xl border ${s.border} ${s.bg} px-4 py-3`}>
                    <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">{s.label}</p>
                  </div>
              ))}
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </div>
  );
}