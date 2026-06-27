import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getPrescriptionTemplate, savePrescription } from '../../services/doctorService';
import { getCurrentEmail } from '../../services/authService';

interface LocationState {
  appointmentId?: number;
  patientName?: string;
}

const prescriptionSchema = z.object({
  patientName: z.string().min(1, 'Patient name is required'),
  doctorName: z.string().min(1, 'Doctor name is required'),
  prescriptionDate: z.string().min(1, 'Date is required'),
  medication: z.string().min(1, 'Medication is required'),
  dosage: z.string().min(1, 'Dosage instructions are required'),
  duration: z.string().min(1, 'Duration is required'),
  summary: z.string().min(1, 'Diagnosis summary is required'),
  warnings: z.string().optional(),
});

type PrescriptionFormData = z.infer<typeof prescriptionSchema>;

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition';
const labelCls = 'block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5';

// ✅ Helper function to extract error message from backend response
const extractErrorMessage = (error: any): string => {
  console.error('Error details:', error);

  if (error.response?.data) {
    const data = error.response.data;

    if (typeof data === 'string') {
      return data;
    }
    if (data.message) {
      return data.message;
    }
    if (data.error) {
      return data.error;
    }
    if (data.errors) {
      if (Array.isArray(data.errors)) {
        return data.errors.join(', ');
      }
      if (typeof data.errors === 'object') {
        return Object.values(data.errors).flat().join(', ');
      }
    }
    try {
      return JSON.stringify(data);
    } catch {
      return 'An unexpected error occurred.';
    }
  }

  if (error.message) {
    return error.message;
  }

  return 'Failed to save prescription. Please try again.';
};

// ✅ Helper function to map backend errors to user-friendly messages
const getFriendlyErrorMessage = (errorMessage: string): string => {
  if (errorMessage.includes('Patient not found')) {
    return '⚠️ Patient not found. Please make sure the patient exists in the system.';
  }
  if (errorMessage.includes('Doctor not found')) {
    return '⚠️ Doctor not found. Please make sure the doctor exists in the system.';
  }
  if (errorMessage.includes('patient name is required') || errorMessage.includes('patientName')) {
    return '⚠️ Patient name is required. Please enter the patient name.';
  }
  if (errorMessage.includes('doctor name is required') || errorMessage.includes('doctorName')) {
    return '⚠️ Doctor name is required. Please enter the doctor name.';
  }
  if (errorMessage.includes('unauthorized') || errorMessage.includes('authorization')) {
    return '⚠️ You are not authorized to save a prescription for this patient.';
  }
  if (errorMessage.includes('validation')) {
    return '⚠️ Validation error. Please check all fields and try again.';
  }
  if (errorMessage.includes('null') && errorMessage.includes('patient')) {
    return '⚠️ Patient not found. Please verify the patient name.';
  }
  if (errorMessage.includes('null') && errorMessage.includes('doctor')) {
    return '⚠️ Doctor not found. Please verify the doctor name.';
  }
  return errorMessage;
};

// ✅ CORRECT: Export default function at the top
export default function DoctorPrescription() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state ?? {}) as LocationState;

  const [saved, setSaved] = useState(false);
  const [serverError, setServerError] = useState('');
  const [templateLoading, setTemplateLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      patientName: state.patientName ?? '',
      doctorName: '',
      prescriptionDate: new Date().toISOString().slice(0, 10),
      medication: '',
      dosage: '',
      duration: '',
      summary: '',
      warnings: '',
    },
  });

  useEffect(() => {
    if (!state.appointmentId) return;
    const doctorEmail = getCurrentEmail();
    if (!doctorEmail) return;

    setTemplateLoading(true);
    getPrescriptionTemplate(doctorEmail, state.appointmentId)
        .then((res) => {
          const tpl = res.data;
          let dateValue = new Date().toISOString().slice(0, 10);
          if (tpl.prescriptionDate) {
            if (typeof tpl.prescriptionDate === 'string') {
              dateValue = tpl.prescriptionDate.slice(0, 10);
            } else {
              dateValue = new Date(tpl.prescriptionDate).toISOString().slice(0, 10);
            }
          }
          reset({
            patientName: tpl.patientName,
            doctorName: tpl.doctorName,
            prescriptionDate: dateValue,
            medication: '',
            dosage: '',
            duration: '',
            summary: tpl.content?.join('\n') ?? '',
            warnings: '',
          });
        })
        .catch((err) => {
          console.error('Failed to load template:', err);
          const errorMsg = extractErrorMessage(err);
          setServerError(getFriendlyErrorMessage(errorMsg));
        })
        .finally(() => setTemplateLoading(false));
  }, [state.appointmentId, reset]);

  const buildContent = (data: PrescriptionFormData): string[] => {
    const lines: string[] = [
      `Medication: ${data.medication}`,
      `Dosage: ${data.dosage}`,
      `Duration: ${data.duration}`,
      `Diagnosis: ${data.summary}`,
    ];
    if (data.warnings?.trim()) {
      lines.push(`Warnings: ${data.warnings}`);
    }
    return lines;
  };

  const onSubmit = async (data: PrescriptionFormData) => {
    setServerError('');
    try {
      const doctorEmail = getCurrentEmail();
      if (!doctorEmail) {
        setServerError('⚠️ Please login to save a prescription.');
        return;
      }

      const payload = {
        patientName: data.patientName.trim(),
        doctorName: data.doctorName.trim(),
        prescriptionDate: `${data.prescriptionDate} 00:00:00`,
        content: buildContent(data),
      };

      console.log('📤 Sending payload:', JSON.stringify(payload, null, 2));

      await savePrescription(doctorEmail, payload);
      setSaved(true);
    } catch (err: any) {
      console.error('❌ Save error:', err);
      console.error('❌ Error response:', err.response);

      const errorMessage = extractErrorMessage(err);
      const friendlyMessage = getFriendlyErrorMessage(errorMessage);
      setServerError(friendlyMessage);
    }
  };

  const handlePrint = () => window.print();

  const handleReset = () => {
    setSaved(false);
    setServerError('');
    reset({
      patientName: state.patientName ?? '',
      doctorName: '',
      prescriptionDate: new Date().toISOString().slice(0, 10),
      medication: '',
      dosage: '',
      duration: '',
      summary: '',
      warnings: '',
    });
  };

  if (saved) {
    return (
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 flex flex-col items-center gap-5 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 border-2 border-green-200 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">Prescription Saved</p>
              <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                The prescription for{' '}
                <span className="font-semibold text-gray-700">{getValues('patientName')}</span>{' '}
                has been saved successfully.
              </p>
            </div>
            <div className="flex gap-3 w-full max-w-xs">
              <button
                  onClick={handlePrint}
                  className="flex-1 flex items-center justify-center gap-2 border border-gray-300 bg-white hover:bg-slate-50 text-gray-700 font-semibold py-2.5 rounded-xl text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
              <button
                  onClick={handleReset}
                  className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
              >
                New Prescription
              </button>
            </div>
            <button
                onClick={() => navigate('../appointments')}
                className="text-sm text-blue-600 hover:underline font-medium"
            >
              Back to Appointments
            </button>
          </div>
        </div>
    );
  }

  return (
      <div className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-lg font-bold text-gray-900">Write a Prescription</h2>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Medical Prescription</h3>
              <p className="text-blue-100 text-xs mt-0.5">
                {templateLoading ? 'Loading patient template…' : 'Cardia Health System'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
            {serverError && (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <div className="mt-1 text-sm text-red-700 whitespace-pre-wrap">{serverError}</div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setServerError('')}
                        className="ml-auto flex-shrink-0"
                    >
                      <svg className="h-4 w-4 text-red-400 hover:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Patient Name</label>
                <input
                    type="text"
                    {...register('patientName')}
                    placeholder="Patient full name"
                    className={inputCls}
                />
                {errors.patientName && <p className="mt-1.5 text-xs text-red-600">{errors.patientName.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Doctor Name</label>
                <input
                    type="text"
                    {...register('doctorName')}
                    placeholder="Dr. Full Name"
                    className={inputCls}
                />
                {errors.doctorName && <p className="mt-1.5 text-xs text-red-600">{errors.doctorName.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Prescription Date</label>
                <input
                    type="date"
                    {...register('prescriptionDate')}
                    className={inputCls}
                />
                {errors.prescriptionDate && <p className="mt-1.5 text-xs text-red-600">{errors.prescriptionDate.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Treatment Duration</label>
                <input
                    type="text"
                    {...register('duration')}
                    placeholder="e.g. 3 months"
                    className={inputCls}
                />
                {errors.duration && <p className="mt-1.5 text-xs text-red-600">{errors.duration.message}</p>}
              </div>
            </div>

            <div>
              <label className={labelCls}>Medication</label>
              <input
                  type="text"
                  {...register('medication')}
                  placeholder="e.g. Aspirin 75 mg, Atorvastatin 40 mg"
                  className={inputCls}
              />
              {errors.medication && <p className="mt-1.5 text-xs text-red-600">{errors.medication.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Dosage Instructions</label>
              <input
                  type="text"
                  {...register('dosage')}
                  placeholder="e.g. Once daily after meals; Atorvastatin at night"
                  className={inputCls}
              />
              {errors.dosage && <p className="mt-1.5 text-xs text-red-600">{errors.dosage.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Prescription Content / Diagnosis Summary</label>
              <textarea
                  {...register('summary')}
                  placeholder="Summarize clinical findings, working diagnosis, and management plan…"
                  rows={4}
                  className={`${inputCls} resize-none`}
              />
              {errors.summary && <p className="mt-1.5 text-xs text-red-600">{errors.summary.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Warnings &amp; Notes</label>
              <textarea
                  {...register('warnings')}
                  placeholder="Contraindications, dietary restrictions, follow-up schedule, emergency signs…"
                  rows={3}
                  className={`${inputCls} resize-none`}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-2 border border-gray-300 bg-white hover:bg-slate-50 text-gray-700 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
              <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl text-sm transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {isSubmitting ? 'Saving…' : 'Save & Send to Patient'}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}