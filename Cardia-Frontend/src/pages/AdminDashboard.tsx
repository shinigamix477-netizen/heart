import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import logo from '../../Logo.png';
import { getCurrentEmail } from '../services/authService';
import { logout } from '../services/authService';

const NAV = [
  { to: 'users',        label: 'User Management'    },
  { to: 'tests',        label: 'ML Predictions Log' },
  { to: 'appointments', label: 'Appointments'        },
  { to: 'add-doctor',   label: 'Add Doctor'          },
];

const STAT_CARDS = [
  { label: 'Total Users',       value: '1,284', sub: '+12 this week',   color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-100'   },
  { label: 'Total Doctors',     value: '47',    sub: '3 specialties',   color: 'text-teal-700',   bg: 'bg-teal-50',   border: 'border-teal-100'   },
  { label: 'Total Patients',    value: '1,231', sub: '89 active today', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-100' },
  { label: 'Total Predictions', value: '8,402', sub: '+89 today',       color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-100' },
];

const currentEmail = getCurrentEmail();

export default function AdminDashboard() {
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
                  <h1 className="text-xl font-bold text-gray-900">Admin Control Center</h1>
                  <p className="text-sm text-gray-500">
                    System overview and management -{' '}
                    <span className="font-semibold text-indigo-700">
                    {currentEmail || 'Admin'}
                  </span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Super Admin
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
                    <p className="text-sm font-medium text-gray-700 mt-0.5">{s.label}</p>
                    <p className="text-xs text-gray-400">{s.sub}</p>
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
                                  ? 'border-indigo-600 text-indigo-700'
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