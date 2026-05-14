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
          <label htmlFor={inputId} className="text-[10px] font-bold text-text-subtle uppercase tracking-widest ml-1 block">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-subtle">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-surface-muted text-text border rounded-xl py-2.5 text-sm outline-none transition-all ${
              icon ? 'pl-10 pr-4' : 'px-4'
            } ${
              error
                ? 'border-danger-border focus:border-danger-strong focus:ring-1 focus:ring-danger-strong'
                : 'border-border-strong focus:border-primary focus:ring-1 focus:ring-primary'
            } disabled:opacity-60 disabled:bg-surface-subtle disabled:cursor-not-allowed ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-danger-strong font-medium ml-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
