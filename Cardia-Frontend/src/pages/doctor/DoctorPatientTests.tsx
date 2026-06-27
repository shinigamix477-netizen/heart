import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getPatientMedicalTests, getPrescriptionTemplate } from '../../services/doctorService';
import { getCurrentEmail } from '../../services/authService';
import type { PredictionItem, PrescriptionTemplate } from '../../types';

interface LocationState {
  appointmentId?: number;
  patientName?: string;
  patientInitials?: string;
  avatarClass?: string;
}

interface PrescriptionModal {
  data: PrescriptionTemplate | null;
  loading: boolean;
  error: string;
}

const RISK_BADGE: Record<string, string> = {
  High: 'bg-red-100 text-red-700 border-red-200',
  Moderate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Low: 'bg-green-100 text-green-700 border-green-200',
};

const CLINICAL_PARAMS: { key: keyof PredictionItem; label: string }[] = [
  { key: 'age', label: 'Age' },
  { key: 'sex', label: 'Sex' },
  { key: 'cp', label: 'Chest Pain Type' },
  { key: 'trestbps', label: 'Resting BP' },
  { key: 'chol', label: 'Cholesterol' },
  { key: 'fbs', label: 'Fasting Blood Sugar' },
  { key: 'restecg', label: 'Resting ECG' },
  { key: 'thalch', label: 'Max Heart Rate' },
  { key: 'exang', label: 'Exercise Angina' },
  { key: 'oldpeak', label: 'ST Depression' },
  { key: 'slope', label: 'ST Slope' },
  { key: 'ca', label: 'Vessels Colored' },
  { key: 'thal', label: 'Thalassemia' },
];

export default function DoctorPatientTests() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;

  const appointmentId = state.appointmentId;
  const patientName = state.patientName ?? 'Unknown Patient';
  const patientInitials = state.patientInitials ?? '??';
  const avatarClass = state.avatarClass ?? 'bg-gray-100 text-gray-700';

  const [predictions, setPredictions] = useState<PredictionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [prescriptionModal, setPrescriptionModal] = useState<PrescriptionModal | null>(null);

  useEffect(() => {
    if (!appointmentId) return;
    const doctorEmail = getCurrentEmail();
    if (!doctorEmail) {
      setError('Not logged in.');
      return;
    }
    setLoading(true);
    setError('');
    getPatientMedicalTests(doctorEmail, appointmentId)
        .then((res) => setPredictions(res.data))
        .catch(() => setError('Failed to load predictions for this patient.'))
        .finally(() => setLoading(false));
  }, [appointmentId]);

  const latestIndex = predictions.length > 0
      ? predictions.reduce(
          (maxIdx, pred, idx) =>
              pred.createdAt > predictions[maxIdx].createdAt ? idx : maxIdx,
          0
      )
      : -1;

  const handleWritePrescription = () => {
    navigate('../prescription', {
      state: { appointmentId, patientName, patientInitials, avatarClass },
    });
  };

  const handleViewPrescription = async () => {
    if (!appointmentId) return;
    const doctorEmail = getCurrentEmail();
    if (!doctorEmail) {
      setPrescriptionModal({ data: null, loading: false, error: 'Not logged in.' });
      return;
    }
    setPrescriptionModal({ data: null, loading: true, error: '' });
    try {
      const res = await getPrescriptionTemplate(doctorEmail, appointmentId);
      setPrescriptionModal({ data: res.data, loading: false, error: '' });
    } catch {
      setPrescriptionModal({ data: null, loading: false, error: 'Failed to load prescription.' });
    }
  };

  if (!appointmentId) {
    return (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Patient Medical Tests</h2>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
            <p className="text-gray-400 text-sm">
              Select a patient from the Appointments tab to view their medical file.
            </p>
          </div>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Patient Medical Tests</h2>
            <p className="text-sm text-gray-500 mt-0.5">Viewing records for <span className="font-semibold text-gray-700">{patientName}</span></p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${avatarClass}`}>
              {patientInitials}
            </div>
          </div>
        </div>

        {loading && (
            <div className="flex items-center justify-center py-12">
              <svg className="w-6 h-6 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
        )}

        {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
        )}

        {!loading && !error && predictions.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
              <p className="text-gray-400 text-sm">No prediction records found for this patient.</p>
            </div>
        )}

        {!loading && predictions.map((pred, i) => {
          const riskLabel = pred.riskProbability ?? 'Unknown';
          const badgeCls = RISK_BADGE[riskLabel] ?? 'bg-gray-100 text-gray-700 border-gray-200';
          const isPositive = pred.diagnosis?.toLowerCase().includes('heart disease') &&
              !pred.diagnosis?.toLowerCase().includes('no');
          const isLatest = i === latestIndex;

          return (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarClass}`}>
                      {patientInitials}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{patientName}</p>
                      <p className="text-xs text-gray-400">{pred.createdAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeCls}`}>
                  {riskLabel} Risk
                </span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${isPositive ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isPositive ? 'bg-red-500' : 'bg-green-500'}`} />
                      {isPositive ? 'Positive' : 'Negative'}
                </span>
                    {isLatest ? (
                        <button
                            onClick={handleWritePrescription}
                            className="inline-flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-3.5 py-1.5 rounded-lg text-xs transition-colors shadow-sm"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Write Prescription
                        </button>
                    ) : (
                        <button
                            onClick={handleViewPrescription}
                            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-gray-700 border border-gray-300 font-semibold px-3.5 py-1.5 rounded-lg text-xs transition-colors shadow-sm"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          View Prescription
                        </button>
                    )}
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-50 border border-gray-100 rounded-xl p-4">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Risk Score</p>
                      <p className="text-sm font-semibold text-gray-800">{pred.riskProbability}</p>
                    </div>
                    <div className="bg-slate-50 border border-gray-100 rounded-xl p-4">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Diagnosis</p>
                      <p className="text-sm font-semibold text-gray-800">{pred.diagnosis}</p>
                    </div>
                    <div className="bg-slate-50 border border-gray-100 rounded-xl p-4">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Recorded For Patient Id</p>
                      <p className="text-sm font-semibold text-gray-800">{pred.patientId}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Clinical ML Parameters</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                      {CLINICAL_PARAMS.map(({ key, label }) => {
                        const val = pred[key];
                        return (
                            <div key={key} className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                              <p className="text-[9px] font-semibold text-blue-500 uppercase tracking-wider mb-1 leading-tight">{label}</p>
                              <p className="text-sm font-bold text-gray-800">{val !== undefined && val !== null ? String(val) : '—'}</p>
                            </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
          );
        })}

        {prescriptionModal && (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                onClick={(e) => { if (e.target === e.currentTarget) setPrescriptionModal(null); }}
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">Past Prescription</h3>
                    <p className="text-blue-100 text-xs mt-0.5">Cardia Health System</p>
                  </div>
                  <button
                      onClick={() => setPrescriptionModal(null)}
                      className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-6">
                  {prescriptionModal.loading && (
                      <div className="flex items-center justify-center py-8">
                        <svg className="w-6 h-6 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                      </div>
                  )}
                  {prescriptionModal.error && (
                      <p className="text-sm text-red-600 text-center py-4">{prescriptionModal.error}</p>
                  )}
                  {!prescriptionModal.loading && prescriptionModal.data && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-slate-50 rounded-xl p-3">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Patient</p>
                            <p className="text-sm font-semibold text-gray-800">{prescriptionModal.data.patientName}</p>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-3">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Doctor</p>
                            <p className="text-sm font-semibold text-gray-800">{prescriptionModal.data.doctorName}</p>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-3 col-span-2">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Date</p>
                            <p className="text-sm font-semibold text-gray-800">{prescriptionModal.data.prescriptionDate}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Prescription Content</p>
                          <ul className="space-y-2">
                            {prescriptionModal.data.content.map((line, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                                  {line}
                                </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                  )}
                </div>
              </div>
            </div>
        )}
      </div>
  );
}