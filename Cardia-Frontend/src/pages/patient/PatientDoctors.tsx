import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctors, bookAppointment } from '../../services/patientService';
import { getCurrentEmail } from '../../services/authService';
import type { ApiDoctor } from '../../types';

const AVATAR_COLORS = [
  'bg-teal-100 text-teal-700',
  'bg-indigo-100 text-indigo-700',
  'bg-cyan-100 text-cyan-700',
  'bg-pink-100 text-pink-700',
  'bg-orange-100 text-orange-700',
];

function getInitials(name: string) {
  return name
      .split(' ')
      .filter((w) => w.length > 0)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');
}

// Format doctor's working hours
function formatWorkingHours(doc: ApiDoctor): string {
  // If backend provides fromDay/toDay/fromTime/toTime
  if (doc.fromDay && doc.toDay && doc.fromTime && doc.toTime) {
    const fromDay = doc.fromDay.charAt(0) + doc.fromDay.slice(1).toLowerCase();
    const toDay = doc.toDay.charAt(0) + doc.toDay.slice(1).toLowerCase();
    const fromTime = formatTime(doc.fromTime);
    const toTime = formatTime(doc.toTime);

    if (fromDay === toDay) {
      return `${fromDay} ${fromTime} - ${toTime}`;
    }
    return `${fromDay} - ${toDay}, ${fromTime} - ${toTime}`;
  }

  // Fallback to workTime if available
  return doc.workTime || 'Hours not specified';
}

function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  // Handle "09:00:00" -> "9:00 AM"
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;

  let hours = parseInt(parts[0]);
  const minutes = parts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

// // Format date for display
// function formatDateForDisplay(date: Date): string {
//   return date.toLocaleDateString('en-GB', {
//     year: 'numeric',
//     month: '2-digit',
//     day: '2-digit',
//   });
// }

// Map backend error messages to user-friendly messages
function getUserFriendlyErrorMessage(errorMessage: string): string {
  if (errorMessage.includes('Patient must have at least one medical test')) {
    return '⚠️ You need to complete a heart disease risk prediction before booking an appointment. Please go to Risk Prediction first.';
  }
  if (errorMessage.includes('Doctor is not available at this time')) {
    return '⚠️ The doctor is not available at the selected time. Please choose a different date and time.';
  }
  if (errorMessage.includes('No such Patient with this Email')) {
    return '⚠️ Please login again to continue.';
  }
  if (errorMessage.includes('No Doctors with id')) {
    return '⚠️ The selected doctor is no longer available. Please refresh the page.';
  }
  if (errorMessage.includes('No MedicalTest')) {
    return '⚠️ Please complete a heart disease risk prediction first.';
  }
  if (errorMessage.includes('Email already in use')) {
    return '⚠️ This email is already registered. Please use a different email.';
  }
  if (errorMessage.includes('Doctor not available')) {
    return '⚠️ The doctor is not available at this time. Please select a different time.';
  }
  return errorMessage;
}

interface BookingModalProps {
  doctor: ApiDoctor;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (connectivityType: 'ONLINE' | 'OFFLINE', dateTime: string) => void;
  isLoading: boolean;
  error: string;
}

function BookingModal({ doctor, isOpen, onClose, onConfirm, isLoading, error }: BookingModalProps) {
  const [connectivityType, setConnectivityType] = useState<'ONLINE' | 'OFFLINE'>('ONLINE');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [validationError, setValidationError] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const defaultDate = now.toISOString().slice(0, 10);
      const defaultTime = now.toTimeString().slice(0, 5);
      setSelectedDate(defaultDate);
      setSelectedTime(defaultTime);
      setConnectivityType('ONLINE');
      setValidationError('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) {
      setValidationError('Please select both date and time.');
      return;
    }

    // Validate that selected time is in the future
    const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);
    const now = new Date();

    if (selectedDateTime < now) {
      setValidationError('Please select a future date and time.');
      return;
    }

    const formattedDateTime = selectedDateTime.toISOString().slice(0, 19).replace('T', ' ');
    onConfirm(connectivityType, formattedDateTime);
  };

  if (!isOpen) return null;

  const workingHours = formatWorkingHours(doctor);

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Book Appointment</h3>
                <p className="text-blue-100 text-sm mt-0.5">with {doctor.name}</p>
              </div>
              <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/35 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-5">
            {/* Doctor Info */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Specialization:</span> {doctor.specialization}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Working Hours:</span> {workingHours}
              </p>
            </div>

            {/* Connectivity Type - Radio Buttons */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Appointment Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                      type="radio"
                      name="connectivityType"
                      value="ONLINE"
                      checked={connectivityType === 'ONLINE'}
                      onChange={() => setConnectivityType('ONLINE')}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">💻 Online</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                      type="radio"
                      name="connectivityType"
                      value="OFFLINE"
                      checked={connectivityType === 'OFFLINE'}
                      onChange={() => setConnectivityType('OFFLINE')}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">🏥 In-Person</span>
                </label>
              </div>
            </div>

            {/* Date and Time Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Date
                </label>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 10)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Time
                </label>
                <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Validation Error */}
            {validationError && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
                  <p className="text-sm text-yellow-700">{validationError}</p>
                </div>
            )}

            {/* Backend Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Modal Actions */}
            <div className="flex gap-3 pt-2">
              <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className="flex-1 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors shadow-sm"
              >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Booking...
                </span>
                ) : (
                    'Confirm Booking'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}

export default function PatientDoctors() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<ApiDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [bookError, setBookError] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<ApiDoctor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const email = getCurrentEmail();
    if (!email) {
      setLoading(false);
      setError('Please login to view doctors.');
      return;
    }
    getDoctors(email)
        .then((res) => setDoctors(res.data))
        .catch(() => setError('Failed to load doctors. Please try again.'))
        .finally(() => setLoading(false));
  }, []);

  const handleOpenModal = (doctor: ApiDoctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
    setBookError('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDoctor(null);
    setBookError('');
    setBookingId(null);
  };

  const handleConfirmBooking = async (connectivityType: 'ONLINE' | 'OFFLINE', dateTime: string) => {
    if (!selectedDoctor) return;

    setBookingId(selectedDoctor.id);
    setBookError('');
    setIsBooking(true);

    try {
      const email = getCurrentEmail();
      if (!email) throw new Error('Not logged in');

      await bookAppointment(email, selectedDoctor.id, connectivityType, dateTime);

      // Close modal and navigate to appointments
      setIsModalOpen(false);
      setSelectedDoctor(null);
      navigate('../appointments', { state: { justBooked: true } });

    } catch (err: any) {
      // Extract error message from backend
      let errorMessage = 'Booking failed. Please try again.';

      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Map to user-friendly message
      const friendlyMessage = getUserFriendlyErrorMessage(errorMessage);
      setBookError(friendlyMessage);
      setBookingId(null);
      setIsBooking(false);
    }
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
        </div>
    );
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Find a Doctor</h2>
          <span className="text-xs text-gray-400 font-medium">{doctors.length} cardiologists</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
              <tr className="bg-slate-50 border-b border-gray-100 text-left">
                {['Doctor', 'Specialization', 'Contact', 'Location', 'Work Hours', 'Action'].map((h) => (
                    <th key={h} className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
              {doctors.map((doc, idx) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                          {getInitials(doc.name)}
                        </div>
                        <p className="font-medium text-gray-900 whitespace-nowrap">{doc.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{doc.specialization}</td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{doc.contactNumber}</td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                      {[doc.city, doc.state].filter(Boolean).join(', ')}
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                      {formatWorkingHours(doc)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                          onClick={() => handleOpenModal(doc)}
                          disabled={bookingId === doc.id}
                          className="flex items-center gap-1 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {bookingId === doc.id ? 'Booking…' : 'Book'}
                      </button>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>

          <div className="sm:hidden divide-y divide-gray-100">
            {doctors.map((doc, idx) => (
                <div key={doc.id} className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                      {getInitials(doc.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.specialization}</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 space-y-0.5">
                    <p>{doc.contactNumber}</p>
                    <p>{[doc.city, doc.state].filter(Boolean).join(', ')}</p>
                    <p>{formatWorkingHours(doc)}</p>
                  </div>
                  <button
                      onClick={() => handleOpenModal(doc)}
                      disabled={bookingId === doc.id}
                      className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-semibold py-2 rounded-lg transition-colors"
                  >
                    {bookingId === doc.id ? 'Booking…' : 'Book Appointment'}
                  </button>
                </div>
            ))}
          </div>

          {doctors.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-sm text-gray-400">No doctors available at this time.</p>
              </div>
          )}
        </div>

        {/* Booking Modal */}
        {selectedDoctor && (
            <BookingModal
                doctor={selectedDoctor}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirmBooking}
                isLoading={isBooking}
                error={bookError}
            />
        )}
      </div>
  );
}