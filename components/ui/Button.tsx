
import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-gradient-to-r from-aqua-600 to-marine-500 text-white hover:bg-aqua-700 focus:ring-aqua-500 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0',
      secondary: 'bg-gradient-to-r from-marine-500 to-marine-600 text-white hover:bg-marine-600 focus:ring-marine-400 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0',
      outline: 'bg-transparent border border-aqua-600 text-aqua-600 hover:bg-aqua-50 focus:ring-aqua-500 transform hover:-translate-y-0.5 active:translate-y-0',
      ghost: 'bg-transparent text-aqua-600 hover:bg-aqua-50 focus:ring-aqua-500 transform hover:-translate-y-0.5 active:translate-y-0',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 rounded',
      md: 'text-sm px-4 py-2 rounded-md',
      lg: 'text-base px-6 py-3 rounded-md',
    };

    return (
      <button
        className={cn(
          'relative inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none btn-ripple',
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            ></circle>
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
