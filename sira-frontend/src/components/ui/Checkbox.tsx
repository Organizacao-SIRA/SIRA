import React, { InputHTMLAttributes, useId } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;

    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id={checkboxId}
            type="checkbox"
            ref={ref}
            className={`w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
              error ? 'border-red-300 focus:ring-red-500 text-red-600' : ''
            } ${className}`}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="ml-3 text-sm">
            {label && (
              <label htmlFor={checkboxId} className={`font-medium cursor-pointer ${error ? 'text-red-500' : 'text-gray-700'}`}>
                {label}
              </label>
            )}
            {description && (
              <p className="text-gray-500 text-xs mt-0.5">{description}</p>
            )}
            {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
