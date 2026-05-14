import React, { type InputHTMLAttributes, useId } from 'react';

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
            className={`w-4 h-4 rounded border-border-strong text-primary focus:ring-primary transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
              error ? 'border-danger-border focus:ring-danger-strong text-danger-strong' : ''
            } ${className}`}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="ml-3 text-sm">
            {label && (
              <label htmlFor={checkboxId} className={`font-medium cursor-pointer ${error ? 'text-danger-strong' : 'text-text'}`}>
                {label}
              </label>
            )}
            {description && (
              <p className="text-text-muted text-xs mt-0.5">{description}</p>
            )}
            {error && <p className="text-xs text-danger-strong mt-0.5">{error}</p>}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
