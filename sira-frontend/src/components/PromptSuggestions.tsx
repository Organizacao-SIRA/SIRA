interface PromptSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export const PromptSuggestions = ({ suggestions, onSelect }: PromptSuggestionsProps) => (
  <div className="flex flex-wrap justify-center gap-3 opacity-70">
    {suggestions.map(hint => (
      <button
        key={hint}
        type="button"
        onClick={() => onSelect(hint)}
        className="text-sm bg-white border border-gray-100 px-6 py-2.5 rounded-xl text-gray-600 hover:border-primary hover:text-primary transition-all shadow-sm font-medium hover:shadow-md active:scale-95"
      >
        "{hint}"
      </button>
    ))}
  </div>
);
