import React, { type InputHTMLAttributes, useId } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  /** Marca o campo como inválido (borda de erro) SEM renderizar texto — útil
   *  quando a mensagem é exibida por outro meio (ex.: toast), sem alterar a altura. */
  invalid?: boolean;
  icon?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, invalid, icon, rightSlot, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const hasError = Boolean(error) || invalid;

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1 block">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-surface-muted text-text border rounded-xl py-2.5 text-sm outline-none transition-all duration-150 ${
              icon ? 'pl-10' : 'pl-4'
            } ${
              rightSlot ? 'pr-11' : 'pr-4'
            } ${
              hasError
                ? 'border-danger-border focus:border-danger-strong focus:ring-1 focus:ring-danger-strong'
                : 'border-border-strong focus:border-focus focus:ring-1 focus:ring-focus'
            } disabled:opacity-60 disabled:bg-surface-subtle disabled:cursor-not-allowed ${className}`}
            {...props}
          />
          {rightSlot && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {rightSlot}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-danger-strong font-medium ml-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
