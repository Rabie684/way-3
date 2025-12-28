import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'font-semibold py-2 px-4 rounded-lg transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-75';
  
  const variantClasses = {
    primary: 'bg-primary-DEFAULT hover:bg-primary-dark text-white focus:ring-primary-light',
    secondary: 'bg-secondary hover:bg-blue-600 text-white focus:ring-blue-300',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-300',
    outline: 'border border-primary-DEFAULT text-primary-DEFAULT hover:bg-primary-light hover:text-white focus:ring-primary-light',
  };

  const sizeClasses = {
    sm: 'text-sm py-1 px-3',
    md: 'text-base py-2 px-4',
    lg: 'text-lg py-3 px-6',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
