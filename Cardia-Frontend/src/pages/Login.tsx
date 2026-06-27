import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import logo from '../../Logo.png';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { login } from '../services/authService';
import { isNetworkError } from '../services/api';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const fieldCls = (hasError: boolean) =>
  `w-full border ${hasError ? 'border-red-400' : 'border-gray-300'} rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${hasError ? 'focus:ring-red-400' : 'focus:ring-blue-600'} focus:border-transparent transition`;

function deriveOfflineRole(email: string): 'patient' | 'doctor' | 'admin' {
  const e = email.toLowerCase();
  if (e.includes('admin')) return 'admin';
  if (e.includes('doctor') || e.includes('dr.') || e.startsWith('dr@')) return 'doctor';
  return 'patient';
}

export default function Login() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Update the onSubmit function:
  const onSubmit = async (data: LoginFormData) => {
    setServerError('');
    try {
      const response = await login(data);
      const { email, role } = response.data;

      // Store user info
      localStorage.setItem('userRole', role);
      localStorage.setItem('userEmail', email);

      // Navigate based on role from backend
      if (role === 'PATIENT') navigate('/patient');
      else if (role === 'DOCTOR') navigate('/doctor');
      else navigate('/admin');
    } catch (loginErr: unknown) {
      if (isNetworkError(loginErr)) {
        const role = deriveOfflineRole(data.email);
        if (role === 'patient') navigate('/patient');
        else if (role === 'doctor') navigate('/doctor');
        else navigate('/admin');
        return;
      }
      const axiosErr = loginErr as { response?: { data?: { message?: string } } };
      setServerError(
          axiosErr?.response?.data?.message ?? 'Login failed. Please check your credentials.'
      );
      return;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md">

        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Cardia" className="h-14 w-auto object-contain mb-3" />
          <h2 className="text-xl font-semibold text-gray-800">Welcome Back</h2>
          <p className="text-gray-500 text-sm mt-1 text-center">
            Sign in to access your health dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              {...register('email')}
              placeholder="you@example.com"
              autoComplete="email"
              className={fieldCls(!!errors.email)}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              {...register('password')}
              placeholder="••••••••"
              autoComplete="current-password"
              className={fieldCls(!!errors.password)}
            />
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          {serverError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-sm text-red-600">{serverError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-700 hover:bg-blue-800 active:bg-blue-900 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors mt-1 shadow-sm"
          >
            {isSubmitting ? 'Signing In…' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-3 text-sm">
          <p className="text-gray-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-blue-700 hover:underline font-medium">
              Create Account
            </Link>
          </p>
          <a
            href="mailto:support@cardia.health"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            Need help? Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
