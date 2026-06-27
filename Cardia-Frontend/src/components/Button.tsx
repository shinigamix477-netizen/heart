import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
}

export default function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  const base = 'px-4 py-2 rounded-lg font-semibold text-sm transition-colors focus:outline-none focus:ring-2';
  const variants: Record<string, string> = {
    primary: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-400',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-gray-300',
    outline: 'border border-red-600 text-red-600 hover:bg-red-50 focus:ring-red-300',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
