import React from 'react';
import { ChevronRight } from 'lucide-react';
import { AutoResizeTextarea } from './ui/AutoResizeTextarea';

interface ChatInputFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const ChatInputForm = ({ value, onChange, onSubmit, placeholder, autoFocus }: ChatInputFormProps) => (
  <form
    onSubmit={onSubmit}
    className="flex items-end rounded-[32px] bg-white border border-gray-200 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/5 transition-all p-1.5 pr-3"
  >
    <div className="flex-1">
      <AutoResizeTextarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'O que você deseja investigar hoje?...'}
        required
        autoFocus={autoFocus}
        className="pr-2"
      />
    </div>
    <div className="pb-1.5">
      <button
        type="submit"
        aria-label="Enviar"
        className="bg-primary hover:bg-primary-dark text-white w-12 h-12 flex items-center justify-center rounded-full transition-all active:scale-95 shadow-sm flex-shrink-0"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  </form>
);
