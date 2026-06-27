import { useState, useEffect } from 'react';
import { usePatient } from '../../context/PatientContext';
import { getPatientPrescriptions } from '../../services/patientService';
import { getCurrentEmail } from '../../services/authService';
import type { PrescriptionItem } from '../../types';

function PrescriptionCard({ rx, index }: { rx: PrescriptionItem; index: number }) {
  return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Prescription #{index + 1}</p>
              <p className="text-xs text-gray-400 mt-0.5">{rx.prescriptionDate}</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-500 font-medium">{rx.doctorName}</p>
            <p className="text-xs text-gray-400">{rx.patientName}</p>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
            <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider mb-2">
              Prescription Details
            </p>
            <ul className="space-y-1.5">
              {rx.content.map((line, i) => (
                  <li key={i} className="text-sm text-gray-700 leading-relaxed">{line}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
  );
}

export default function PatientPrescriptions() {
  const { profile, loading: profileLoading, error: profileError } = usePatient();
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const email = getCurrentEmail();
    if (!email) {
      setLoading(false);
      setError('Please login to view prescriptions.');
      return;
    }
    getPatientPrescriptions(email)
        .then((res) => setPrescriptions(res.data))
        .catch(() => setError('Failed to load prescriptions.'))
        .finally(() => setLoading(false));
  }, []);

  if (loading || profileLoading) {
    return (
        <div className="flex items-center justify-center py-16">
          <svg className="w-6 h-6 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>
    );
  }

  const displayError = error || profileError;
  if (displayError) {
    return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-sm text-red-600 font-medium">{displayError}</p>
        </div>
    );
  }

  const allPrescriptions = profile?.prescriptions || prescriptions;

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">My Prescriptions</h2>
          <span className="text-xs text-gray-400 font-medium">{allPrescriptions.length} records</span>
        </div>

        {allPrescriptions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
              <p className="text-gray-400 text-sm">No prescriptions on record yet.</p>
            </div>
        ) : (
            <div className="space-y-4">
              {allPrescriptions.map((rx, i) => (
                  <PrescriptionCard key={i} rx={rx} index={i} />
              ))}
            </div>
        )}
      </div>
  );
}