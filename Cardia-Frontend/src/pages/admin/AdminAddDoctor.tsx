import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addDoctor } from '../../services/adminService';

// ✅ Define days as const for proper type inference
const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;
// type Day = typeof DAYS[number];

// ✅ Fix: Use z.enum() with proper syntax
const addDoctorSchema = z.object({
  name: z.string().min(3, 'Full name must be at least 3 characters'),
  userName: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(5, 'Password must be at least 5 characters'),
  contactNumber: z.string().regex(
      /^(010|011|012|015)\d{8}$/,
      'Enter a valid Egyptian mobile number'
  ),
  age: z.number()
      .int('Age must be a whole number')
      .min(24, 'Age must be at least 24')
      .max(80, 'Age must be at most 80')
      .default(0),
  specialization: z.string().min(3, 'Specialization must be at least 3 characters'),
  // ✅ Fix: Use z.enum() correctly - pass the array directly without errorMap
  fromDay: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const),
  toDay: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const),
  fromTime: z.string().min(1, 'Start time is required'),
  toTime: z.string().min(1, 'End time is required'),
  streetAddress: z.string().min(3, 'Street address must be at least 3 characters').max(100),
  city: z.string().min(2, 'City must be at least 2 characters').max(50),
  state: z.string().min(2, 'State must be at least 2 characters').max(50),
  country: z.string().min(1, 'Country is required'),
});

type AddDoctorFormData = z.infer<typeof addDoctorSchema>;

// const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition';
const labelCls = 'block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5';
const errCls = (hasErr: boolean) =>
    `w-full border ${hasErr ? 'border-red-400' : 'border-gray-300'} rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 ${hasErr ? 'focus:ring-red-400' : 'focus:ring-indigo-600'} focus:border-transparent transition`;

export default function AdminAddDoctor() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<AddDoctorFormData>({
    resolver: zodResolver(addDoctorSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      userName: '',
      email: '',
      password: '',
      contactNumber: '',
      age: 0,
      specialization: '',
      fromDay: 'MONDAY',
      toDay: 'FRIDAY',
      fromTime: '09:00',
      toTime: '17:00',
      streetAddress: '',
      city: '',
      state: '',
      country: '',
    },
  });

  const onSubmit = async (data: AddDoctorFormData) => {
    try {
      await addDoctor({
        ...data,
        fromDay: data.fromDay,
        toDay: data.toDay,
        fromTime: data.fromTime + ':00',
        toTime: data.toTime + ':00',
      });
      navigate('/admin');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError('root', {
        message: axiosErr?.response?.data?.message ?? 'Failed to register doctor. Please try again.',
      });
    }
  };

  if (isSubmitSuccessful) {
    return (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 flex flex-col items-center gap-5 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 border-2 border-green-200 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">Doctor Registered Successfully</p>
              <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                The doctor has been added to the system and can now log in.
              </p>
            </div>
            <button
                onClick={() => navigate('/admin')}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
    );
  }

  return (
      <div className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-lg font-bold text-gray-900">Add New Doctor</h2>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Doctor Registration Form</h3>
              <p className="text-teal-100 text-xs mt-0.5">Fill in all required fields to register a new doctor</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
              <div>
                <label className={labelCls}>Full Name *</label>
                <input
                    type="text"
                    {...register('name')}
                    placeholder="Dr. Janna Mostafa"
                    className={errCls(!!errors.name)}
                />
                {errors.name && <p className="mt-1.5 text-xs text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <label className={labelCls}>Username *</label>
                <input
                    type="text"
                    {...register('userName')}
                    placeholder="dr.janna.mostafa"
                    className={errCls(!!errors.userName)}
                />
                {errors.userName && <p className="mt-1.5 text-xs text-red-600">{errors.userName.message}</p>}
              </div>

              <div>
                <label className={labelCls}>Email Address *</label>
                <input
                    type="email"
                    {...register('email')}
                    placeholder="doctor@cardia.health"
                    className={errCls(!!errors.email)}
                />
                {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
              </div>

              <div>
                <label className={labelCls}>Password *</label>
                <input
                    type="password"
                    {...register('password')}
                    placeholder="••••••••"
                    className={errCls(!!errors.password)}
                />
                {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>}
              </div>

              <div>
                <label className={labelCls}>Contact Number *</label>
                <input
                    type="tel"
                    {...register('contactNumber')}
                    placeholder="01012345678"
                    className={errCls(!!errors.contactNumber)}
                />
                {errors.contactNumber && <p className="mt-1.5 text-xs text-red-600">{errors.contactNumber.message}</p>}
              </div>

              <div>
                <label className={labelCls}>Age *</label>
                <input
                    type="number"
                    {...register('age', { valueAsNumber: true })}
                    placeholder="e.g. 38"
                    min={24}
                    max={80}
                    className={errCls(!!errors.age)}
                />
                {errors.age && <p className="mt-1.5 text-xs text-red-600">{errors.age.message}</p>}
              </div>

              <div>
                <label className={labelCls}>Specialization *</label>
                <input
                    type="text"
                    {...register('specialization')}
                    placeholder="e.g. Interventional Cardiologist"
                    className={errCls(!!errors.specialization)}
                />
                {errors.specialization && <p className="mt-1.5 text-xs text-red-600">{errors.specialization.message}</p>}
              </div>

              <div>
                <label className={labelCls}>From Day *</label>
                <select {...register('fromDay')} className={errCls(!!errors.fromDay)}>
                  {DAYS.map((day) => (
                      <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                {errors.fromDay && <p className="mt-1.5 text-xs text-red-600">{errors.fromDay.message}</p>}
              </div>

              <div>
                <label className={labelCls}>To Day *</label>
                <select {...register('toDay')} className={errCls(!!errors.toDay)}>
                  {DAYS.map((day) => (
                      <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                {errors.toDay && <p className="mt-1.5 text-xs text-red-600">{errors.toDay.message}</p>}
              </div>

              <div>
                <label className={labelCls}>From Time *</label>
                <input
                    type="time"
                    {...register('fromTime')}
                    className={errCls(!!errors.fromTime)}
                />
                {errors.fromTime && <p className="mt-1.5 text-xs text-red-600">{errors.fromTime.message}</p>}
              </div>

              <div>
                <label className={labelCls}>To Time *</label>
                <input
                    type="time"
                    {...register('toTime')}
                    className={errCls(!!errors.toTime)}
                />
                {errors.toTime && <p className="mt-1.5 text-xs text-red-600">{errors.toTime.message}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>Street Address *</label>
                <input
                    type="text"
                    {...register('streetAddress')}
                    placeholder="5 Al-Nil Street, Maadi"
                    className={errCls(!!errors.streetAddress)}
                />
                {errors.streetAddress && <p className="mt-1.5 text-xs text-red-600">{errors.streetAddress.message}</p>}
              </div>

              <div>
                <label className={labelCls}>City *</label>
                <input
                    type="text"
                    {...register('city')}
                    placeholder="Cairo"
                    className={errCls(!!errors.city)}
                />
                {errors.city && <p className="mt-1.5 text-xs text-red-600">{errors.city.message}</p>}
              </div>

              <div>
                <label className={labelCls}>State / Governorate *</label>
                <input
                    type="text"
                    {...register('state')}
                    placeholder="Cairo Governorate"
                    className={errCls(!!errors.state)}
                />
                {errors.state && <p className="mt-1.5 text-xs text-red-600">{errors.state.message}</p>}
              </div>

              <div>
                <label className={labelCls}>Country *</label>
                <input
                    type="text"
                    {...register('country')}
                    placeholder="Egypt"
                    className={errCls(!!errors.country)}
                />
                {errors.country && <p className="mt-1.5 text-xs text-red-600">{errors.country.message}</p>}
              </div>
            </div>

            {errors.root && (
                <div className="mt-5 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  <p className="text-sm text-red-600">{errors.root.message}</p>
                </div>
            )}

            <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
              <button
                  type="button"
                  onClick={() => reset()}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors"
              >
                Clear
              </button>
              <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl text-sm transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {isSubmitting ? 'Saving…' : 'Save Doctor'}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}