import React, { type SelectHTMLAttributes, useId } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: { value: string | number; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, children, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;

    return (
      <div className="space-y-1 w-full">
        {label && (
          <label htmlFor={selectId} className="text-[10px] font-bold text-text-subtle uppercase tracking-widest ml-1 block">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={`w-full bg-surface-muted text-text border rounded-xl px-4 py-2.5 text-sm outline-none appearance-none cursor-pointer transition-all ${
              error
                ? 'border-danger-border focus:border-danger-strong focus:ring-1 focus:ring-danger-strong'
                : 'border-border-strong focus:border-focus focus:ring-1 focus:ring-focus'
            } disabled:opacity-60 disabled:bg-surface-subtle disabled:cursor-not-allowed ${className}`}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-text-muted">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
        {error && <p className="text-xs text-danger-strong font-medium ml-1">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
