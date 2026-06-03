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
        className="text-sm bg-surface border border-border px-6 py-2.5 rounded-xl text-text-muted hover:border-link hover:text-link transition-all duration-150 shadow-sm font-medium hover:shadow-md active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/30"
      >
        "{hint}"
      </button>
    ))}
  </div>
);
