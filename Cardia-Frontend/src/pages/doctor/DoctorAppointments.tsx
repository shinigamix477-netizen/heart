import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctorAppointments } from '../../services/doctorService';
import { getCurrentEmail } from '../../services/authService';
import type { AppointmentListDoctorViewDTO } from '../../types';

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-teal-100 text-teal-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-green-100 text-green-700',
];

function getInitials(name: string) {
  return name
      .split(' ')
      .filter((w) => w.length > 0)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');
}

function formatDateTime(dateTimeStr: string) {
  const date = new Date(dateTimeStr);
  return date.toLocaleString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DoctorAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<AppointmentListDoctorViewDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedLink, setCopiedLink] = useState<number | null>(null);

  useEffect(() => {
    const email = getCurrentEmail();
    if (!email) {
      setLoading(false);
      setError('Please login to view appointments.');
      return;
    }
    getDoctorAppointments(email)
        .then((res) => setAppointments(res.data))
        .catch(() => setError('Failed to load appointments. Please try again.'))
        .finally(() => setLoading(false));
  }, []);

  const handleViewFile = (appointment: AppointmentListDoctorViewDTO, colorIdx: number) => {
    navigate('../patient-tests', {
      state: {
        appointmentId: appointment.appointmentId,
        patientName: appointment.patientName,
        patientInitials: getInitials(appointment.patientName),
        avatarClass: AVATAR_COLORS[colorIdx % AVATAR_COLORS.length],
      },
    });
  };

  const handleCopyLink = (meetingLink: string | null, appointmentId: number) => {
      if (!meetingLink)
        return; // Skip if null
       navigator.clipboard.writeText(meetingLink).then(() => {
      setCopiedLink(appointmentId);
      setTimeout(() => setCopiedLink(null), 2000);
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = meetingLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedLink(appointmentId);
      setTimeout(() => setCopiedLink(null), 2000);
    });
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
          <button
              onClick={() => window.location.reload()}
              className="mt-3 text-sm font-semibold text-red-600 hover:underline"
          >
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

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
              <tr className="bg-slate-50 border-b border-gray-100 text-left">
                {['Patient', 'Date & Time', 'Type', 'Status', 'Meeting Link', 'Action'].map((h) => (
                    <th key={h} className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
              {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">
                      No appointments scheduled yet.
                    </td>
                  </tr>
              ) : appointments.map((appt, idx) => (
                  <tr key={appt.appointmentId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                          {getInitials(appt.patientName)}
                        </div>
                        <span className="font-medium text-gray-900 whitespace-nowrap">{appt.patientName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{formatDateTime(appt.time)}</td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{appt.connectivityType}</td>
                    <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        appt.appointmentStatus === 'CONFIRMED' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            appt.appointmentStatus === 'COMPLETED' ? 'bg-green-100 text-green-700 border-green-200' :
                                appt.appointmentStatus === 'CANCELLED' ? 'bg-gray-100 text-gray-500 border-gray-200' :
                                    'bg-yellow-100 text-yellow-700 border-yellow-200'
                    }`}>
                      {appt.appointmentStatus}
                    </span>
                    </td>
                    <td className="px-6 py-4">
                      {appt.connectivityType === 'ONLINE' && appt.meetingLink ? (
                          <div className="flex items-center gap-1">
                            <a
                                href={appt.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline text-xs truncate max-w-[120px]"
                                title={appt.meetingLink}
                            >
                              Join Meeting
                            </a>
                            <button
                                onClick={() => handleCopyLink(appt.meetingLink, appt.appointmentId)}
                                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                                title="Copy link"
                            >
                              {copiedLink === appt.appointmentId ? (
                                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                              ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                  </svg>
                              )}
                            </button>
                          </div>
                      ) : (
                          <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {appt.appointmentStatus === 'CONFIRMED' && (
                          <button
                              onClick={() => handleViewFile(appt, idx)}
                              className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                          >
                            View Medical File
                          </button>
                      )}
                      {appt.appointmentStatus === 'PASSED' && (
                          <span className="text-xs text-gray-400">Expired</span>
                      )}
                      {appt.appointmentStatus === 'COMPLETED' && (
                          <span className="text-xs text-gray-400">Completed</span>
                      )}
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>

          <div className="sm:hidden divide-y divide-gray-100">
            {appointments.map((appt, idx) => (
                <div key={appt.appointmentId} className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                      {getInitials(appt.patientName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{appt.patientName}</p>
                      <p className="text-xs text-gray-500">{formatDateTime(appt.time)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{appt.connectivityType}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        appt.appointmentStatus === 'CONFIRMED' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            appt.appointmentStatus === 'COMPLETED' ? 'bg-green-100 text-green-700 border-green-200' :
                                appt.appointmentStatus === 'CANCELLED' ? 'bg-gray-100 text-gray-500 border-gray-200' :
                                    'bg-yellow-100 text-yellow-700 border-yellow-200'
                    }`}>
                      {appt.appointmentStatus}
                    </span>
                  </div>

                  {/* ✅ Meeting Link for Mobile */}
                  {appt.connectivityType === 'ONLINE' && appt.meetingLink && (
                      <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2">
                        <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <a
                            href={appt.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-xs truncate flex-1"
                        >
                          Join Meeting
                        </a>
                        <button
                            onClick={() => handleCopyLink(appt.meetingLink, appt.appointmentId)}
                            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                        >
                          {copiedLink === appt.appointmentId ? (
                              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                          ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                              </svg>
                          )}
                        </button>
                      </div>
                  )}

                  {appt.appointmentStatus === 'CONFIRMED' && (
                      <button
                          onClick={() => handleViewFile(appt, idx)}
                          className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold py-2 rounded-lg transition-colors"
                      >
                        View Medical File
                      </button>
                  )}
                </div>
            ))}
          </div>
        </div>
      </div>
  );
}