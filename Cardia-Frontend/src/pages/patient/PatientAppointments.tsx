import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getPatientAppointments, cancelAppointment } from '../../services/patientService';
import { getCurrentEmail } from '../../services/authService';
import type { AppointmentListPatientViewDTO } from '../../types';

const STATUS_BADGE: Record<string, string> = {
  CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
  COMPLETED: 'bg-green-100 text-green-700 border-green-200',
  CANCELLED: 'bg-gray-100 text-gray-500 border-gray-200',
  PASSED: 'bg-yellow-100 text-yellow-700 border-yellow-200',
};

function getStatusBadge(status: string) {
  return STATUS_BADGE[status] ?? 'bg-gray-100 text-gray-500 border-gray-200';
}

function getInitials(name: string) {
  return name.split(' ').filter((w) => w.length > 0).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

const AVATAR_COLORS = [
  'bg-teal-100 text-teal-700',
  'bg-indigo-100 text-indigo-700',
  'bg-cyan-100 text-cyan-700',
  'bg-pink-100 text-pink-700',
  'bg-orange-100 text-orange-700',
];

export default function PatientAppointments() {
  const location = useLocation();
  const navigate = useNavigate();
  const justBooked = location.state?.justBooked as boolean | undefined;
  const [appointments, setAppointments] = useState<AppointmentListPatientViewDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const fetchAppointments = async () => {
    const email = getCurrentEmail();
    if (!email) {
      setLoading(false);
      return;
    }
    try {
      const res = await getPatientAppointments(email);
      setAppointments(res.data);
    } catch {
      setError('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [justBooked]);

  const handleCancel = async (appointmentId: number) => {
    const email = getCurrentEmail();
    if (!email) return;
    setCancellingId(appointmentId);
    try {
      await cancelAppointment(email, appointmentId);
      await fetchAppointments();
    } catch {
      setError('Failed to cancel appointment.');
    } finally {
      setCancellingId(null);
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return {
      date: date.toLocaleDateString('en-GB'),
      time: date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center py-16">
          <svg className="w-6 h-6 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>
    );
  }

  if (error) {
    return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-sm text-red-600 font-medium">{error}</p>
          <button onClick={fetchAppointments} className="mt-3 text-sm font-semibold text-red-600 hover:underline">
            Retry
          </button>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">My Appointments</h2>
          <span className="text-xs text-gray-400 font-medium">{appointments.length} appointment{appointments.length !== 1 ? 's' : ''}</span>
        </div>

        {justBooked && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-center gap-3">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm font-semibold text-green-700">Your appointment has been booked successfully.</p>
            </div>
        )}

        {appointments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
              <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-700 font-semibold text-sm">No appointments booked yet.</p>
              <p className="text-gray-400 text-xs mt-1.5 mb-4">Use Find a Doctor to book your first appointment.</p>
              <button
                  onClick={() => navigate('../doctors')}
                  className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Find a Doctor
              </button>
            </div>
        ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                  <tr className="bg-slate-50 border-b border-gray-100 text-left">
                    {['Doctor', 'Date', 'Time', 'Type', 'Status', 'Action'].map((h) => (
                        <th key={h} className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                  {appointments.map((appt, idx) => {
                    const { date, time } = formatDateTime(appt.time);
                    return (
                        <tr key={appt.appointmentId} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                                {getInitials(appt.doctorName)}
                              </div>
                              <span className="font-medium text-gray-900 whitespace-nowrap">{appt.doctorName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{date}</td>
                          <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{time}</td>
                          <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{appt.connectivityType}</td>
                          <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(appt.appointmentStatus)}`}>
                          {appt.appointmentStatus}
                        </span>
                          </td>
                          <td className="px-6 py-4">
                            {appt.appointmentStatus === 'CONFIRMED' && (
                                <button
                                    onClick={() => handleCancel(appt.appointmentId)}
                                    disabled={cancellingId === appt.appointmentId}
                                    className="text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  {cancellingId === appt.appointmentId ? 'Cancelling...' : 'Cancel'}
                                </button>
                            )}
                            {appt.appointmentStatus === 'PASSED' && (
                                <span className="text-xs text-gray-400">Expired</span>
                            )}
                            {appt.meetingLink && appt.appointmentStatus === 'CONFIRMED' && (
                                <a
                                    href={appt.meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
                                >
                                  Join
                                </a>
                            )}
                          </td>
                        </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>

              <div className="sm:hidden divide-y divide-gray-100">
                {appointments.map((appt, idx) => {
                  const { date, time } = formatDateTime(appt.time);
                  return (
                      <div key={appt.appointmentId} className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                              {getInitials(appt.doctorName)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{appt.doctorName}</p>
                              <p className="text-xs text-gray-500">{date} at {time}</p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(appt.appointmentStatus)}`}>
                      {appt.appointmentStatus}
                    </span>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs text-gray-400">{appt.connectivityType}</span>
                          {appt.appointmentStatus === 'CONFIRMED' && (
                              <button
                                  onClick={() => handleCancel(appt.appointmentId)}
                                  disabled={cancellingId === appt.appointmentId}
                                  className="text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg disabled:opacity-50"
                              >
                                {cancellingId === appt.appointmentId ? 'Cancelling...' : 'Cancel'}
                              </button>
                          )}
                        </div>
                      </div>
                  );
                })}
              </div>
            </div>
        )}
      </div>
  );
}