import React, { type InputHTMLAttributes, useId } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="space-y-1 w-full">
        {label && (
          <label htmlFor={inputId} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 block">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-gray-50 border rounded-xl py-2.5 text-sm outline-none transition-all ${
              icon ? 'pl-10 pr-4' : 'px-4'
            } ${
              error 
                ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                : 'border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary'
            } disabled:opacity-60 disabled:bg-gray-100 disabled:cursor-not-allowed ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-500 font-medium ml-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
