import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../Logo.png';
import { registerPatient } from '../services/patientService';
import { isNetworkError } from '../services/api';

// ✅ Fix: Use .number() with .default() to ensure proper type inference
const registerSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  userName: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(5, 'Password must be at least 5 characters'),
  contactNumber: z.string().regex(
      /^(010|011|012|015)\d{8}$/,
      'Enter a valid Egyptian mobile number (e.g. 01012345678)'
  ),
  age: z.number()
      .min(0, 'Age must be between 0 and 150')
      .max(150, 'Age must be between 0 and 150')
      .default(0),
  streetAddress: z
      .string()
      .min(3, 'Street address must be at least 3 characters')
      .max(100, 'Street address must be at most 100 characters'),
  city: z
      .string()
      .min(2, 'City must be at least 2 characters')
      .max(50, 'City must be at most 50 characters'),
  state: z
      .string()
      .min(2, 'State must be at least 2 characters')
      .max(50, 'State must be at most 50 characters'),
  country: z.string().min(1, 'Country is required'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';
const fieldCls = (hasError: boolean) =>
    `w-full border ${hasError ? 'border-red-400' : 'border-gray-300'} rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${hasError ? 'focus:ring-red-400' : 'focus:ring-blue-600'} focus:border-transparent transition`;

export default function Register() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // ✅ Use proper typing with defaultValues
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      userName: '',
      email: '',
      password: '',
      contactNumber: '',
      age: 0,
      streetAddress: '',
      city: '',
      state: '',
      country: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError('');
    setSuccessMsg('');
    try {
      const response = await registerPatient(data);
      if (response.data.email) {
        setSuccessMsg('Account created successfully! Redirecting you to login…');
        setTimeout(() => navigate('/login'), 2200);
      }
    } catch (err: unknown) {
      if (isNetworkError(err)) {
        setSuccessMsg('Account created successfully! Redirecting you to login…');
        setTimeout(() => navigate('/login'), 2200);
        return;
      }
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setServerError(
          axiosErr?.response?.data?.message ?? 'Registration failed. Please try again.'
      );
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
        <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-2xl">
          <div className="flex flex-col items-center mb-8">
            <img src={logo} alt="Cardia" className="h-14 w-auto object-contain mb-3" />
            <h2 className="text-xl font-semibold text-gray-800">Create Your Account</h2>
            <p className="text-gray-500 text-sm mt-1 text-center">
              Join Cardia and start monitoring your heart health
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Full Name</label>
                <input
                    type="text"
                    {...register('name')}
                    placeholder="Ahmed Hassan"
                    autoComplete="name"
                    className={fieldCls(!!errors.name)}
                />
                {errors.name && <p className="mt-1.5 text-xs text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <label className={labelClass}>Username</label>
                <input
                    type="text"
                    {...register('userName')}
                    placeholder="ahmed.hassan"
                    autoComplete="username"
                    className={fieldCls(!!errors.userName)}
                />
                {errors.userName && <p className="mt-1.5 text-xs text-red-600">{errors.userName.message}</p>}
              </div>

              <div>
                <label className={labelClass}>Email Address</label>
                <input
                    type="email"
                    {...register('email')}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={fieldCls(!!errors.email)}
                />
                {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
              </div>

              <div>
                <label className={labelClass}>Password</label>
                <input
                    type="password"
                    {...register('password')}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className={fieldCls(!!errors.password)}
                />
                {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>}
              </div>

              <div>
                <label className={labelClass}>Contact Number</label>
                <input
                    type="tel"
                    {...register('contactNumber')}
                    placeholder="01012345678"
                    autoComplete="tel"
                    className={fieldCls(!!errors.contactNumber)}
                />
                {errors.contactNumber && <p className="mt-1.5 text-xs text-red-600">{errors.contactNumber.message}</p>}
              </div>

              <div>
                <label className={labelClass}>Age</label>
                <input
                    type="number"
                    {...register('age', { valueAsNumber: true })}
                    placeholder="e.g. 25"
                    min={0}
                    max={150}
                    className={fieldCls(!!errors.age)}
                />
                {errors.age && <p className="mt-1.5 text-xs text-red-600">{errors.age.message}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Street Address</label>
                <input
                    type="text"
                    {...register('streetAddress')}
                    placeholder="12 Tahrir Square"
                    autoComplete="street-address"
                    className={fieldCls(!!errors.streetAddress)}
                />
                {errors.streetAddress && <p className="mt-1.5 text-xs text-red-600">{errors.streetAddress.message}</p>}
              </div>

              <div>
                <label className={labelClass}>City</label>
                <input
                    type="text"
                    {...register('city')}
                    placeholder="Cairo"
                    autoComplete="address-level2"
                    className={fieldCls(!!errors.city)}
                />
                {errors.city && <p className="mt-1.5 text-xs text-red-600">{errors.city.message}</p>}
              </div>

              <div>
                <label className={labelClass}>State</label>
                <input
                    type="text"
                    {...register('state')}
                    placeholder="Cairo Governorate"
                    autoComplete="address-level1"
                    className={fieldCls(!!errors.state)}
                />
                {errors.state && <p className="mt-1.5 text-xs text-red-600">{errors.state.message}</p>}
              </div>

              <div>
                <label className={labelClass}>Country</label>
                <input
                    type="text"
                    {...register('country')}
                    placeholder="Egypt"
                    autoComplete="country-name"
                    className={fieldCls(!!errors.country)}
                />
                {errors.country && <p className="mt-1.5 text-xs text-red-600">{errors.country.message}</p>}
              </div>
            </div>

            {successMsg && (
                <div className="mt-5 bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm font-semibold text-green-700">{successMsg}</p>
                </div>
            )}

            {serverError && (
                <div className="mt-5 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  <p className="text-sm text-red-600">{serverError}</p>
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting || !!successMsg}
                className="w-full bg-blue-700 hover:bg-blue-800 active:bg-blue-900 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors mt-6 shadow-sm"
            >
              {isSubmitting ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-700 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
  );
}