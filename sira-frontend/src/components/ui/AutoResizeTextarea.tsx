import React, { useEffect, useRef } from 'react';

interface AutoResizeTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  maxHeight?: number;
}

export const AutoResizeTextarea = ({ value, maxHeight = 200, ...props }: AutoResizeTextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
      
      // Ativa scroll apenas se atingir o maxHeight
      textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Permite enviar com Enter, mas Shift+Enter pula linha
    if (e.key === 'Enter' && !e.shiftKey && props.required && value.trim()) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) form.requestSubmit();
    }
    
    if (props.onKeyDown) props.onKeyDown(e);
  };

  return (
    <textarea
      {...props}
      ref={textareaRef}
      value={value}
      onKeyDown={handleKeyDown}
      rows={1}
      className={`w-full py-4 pl-6 pr-4 text-base md:text-lg text-text outline-none placeholder-text-subtle resize-none bg-transparent block ${props.className || ''}`}
      style={{ 
        minHeight: '56px',
        maxHeight: `${maxHeight}px`,
        transition: 'height 0.1s ease-out',
        ...props.style 
      }}
    />
  );
};
