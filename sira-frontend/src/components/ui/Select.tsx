import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Check, ChevronDown, Search } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps {
  label?: string;
  error?: string;
  /** Texto de apoio abaixo do campo (oculto quando há `error`). */
  hint?: string;
  options: SelectOption[];
  value: string | number;
  /** Recebe o `value` da opção escolhida (não o evento). */
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  /** Exibe campo de busca no painel. Por padrão, ativa em listas longas (> 7). */
  searchable?: boolean;
  className?: string;
  id?: string;
}

const MENU_MAX_HEIGHT = 240; // = max-h-60
const MENU_GAP = 8;
const SEARCH_THRESHOLD = 7;

/** Normaliza para comparação: minúsculas e sem acentos. */
const normalize = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/**
 * Combobox de seleção única com busca (padrões "select-only" e "editable
 * combobox" do ARIA APG).
 *
 * Substitui o `<select>` nativo — cujo painel era desenhado pelo browser e
 * ignorava o design system — por um listbox próprio que reaproveita os tokens
 * de seleção (`bg-selected`/`text-link`/`Check`, iguais a SelectableChip e
 * InterestCard) e o scroll do sistema (`.sira-scrollbar`). O estado fechado
 * mantém o visual anterior.
 *
 * Em listas longas (ou com `searchable`), o painel abre com um campo de busca
 * que filtra as opções por substring (ignorando acentos) — melhor que rolar
 * uma lista grande (ex.: as 30 áreas).
 *
 * O painel é renderizado num portal com posição `fixed` ancorada ao gatilho,
 * para não ser cortado por ancestrais com `overflow-hidden` (ex.: SectionCard).
 */
export const Select = ({
  label,
  error,
  hint,
  options,
  value,
  onChange,
  disabled = false,
  required = false,
  searchable,
  className = '',
  id,
}: SelectProps) => {
  const { t } = useTranslation('common');
  const generatedId = useId();
  const selectId = id || generatedId;
  const listboxId = `${selectId}-listbox`;
  const optionId = (index: number) => `${selectId}-opt-${index}`;

  const isSearchable = searchable ?? options.length > SEARCH_THRESHOLD;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number; openUp: boolean } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  // Opções visíveis após o filtro de busca.
  const filtered = useMemo(() => {
    if (!isSearchable || !query.trim()) return options;
    const q = normalize(query);
    return options.filter((opt) => normalize(opt.label).includes(q));
  }, [options, query, isSearchable]);

  const updatePosition = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < MENU_MAX_HEIGHT + MENU_GAP && rect.top > spaceBelow;
    setMenuPos({
      top: openUp ? rect.top - MENU_GAP : rect.bottom + MENU_GAP,
      left: rect.left,
      width: rect.width,
      openUp,
    });
  }, []);

  const openMenu = useCallback(() => {
    if (disabled) return;
    setQuery('');
    const idx = options.findIndex((opt) => String(opt.value) === String(value));
    setActiveIndex(idx >= 0 ? idx : 0);
    updatePosition();
    setOpen(true);
  }, [disabled, options, value, updatePosition]);

  const closeMenu = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  const commit = useCallback((index: number) => {
    const opt = filtered[index];
    if (opt) onChange(String(opt.value));
    setOpen(false);
    triggerRef.current?.focus();
  }, [filtered, onChange]);

  // Foca o campo de busca ao abrir (painel já montado no portal).
  useLayoutEffect(() => {
    if (open && isSearchable) inputRef.current?.focus();
  }, [open, isSearchable]);

  // Reposiciona antes do paint e mantém alinhado em scroll/resize.
  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    const onReflow = () => updatePosition();
    window.addEventListener('scroll', onReflow, true);
    window.addEventListener('resize', onReflow);
    return () => {
      window.removeEventListener('scroll', onReflow, true);
      window.removeEventListener('resize', onReflow);
    };
  }, [open, updatePosition]);

  // Fecha ao clicar fora (gatilho + painel no portal).
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!triggerRef.current?.contains(target) && !listRef.current?.parentElement?.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  // Mantém a opção ativa visível durante a navegação por teclado.
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector(`#${CSS.escape(optionId(activeIndex))}`)
      ?.scrollIntoView({ block: 'nearest' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeIndex]);

  // Navegação do listbox (compartilhada entre gatilho e campo de busca).
  const onListNavigation = (e: React.KeyboardEvent): boolean => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
        return true;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        return true;
      case 'Enter':
        e.preventDefault();
        if (filtered.length) commit(activeIndex);
        return true;
      case 'Escape':
        e.preventDefault();
        closeMenu();
        return true;
      case 'Tab':
        if (filtered.length) commit(activeIndex);
        return true;
      default:
        return false;
    }
  };

  const onTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    // Quando há busca, o teclado é tratado pelo input; aqui só fora dela.
    if (!isSearchable) {
      if (e.key === 'Home') { e.preventDefault(); setActiveIndex(0); return; }
      if (e.key === 'End') { e.preventDefault(); setActiveIndex(filtered.length - 1); return; }
      if (e.key === ' ') { e.preventDefault(); if (filtered.length) commit(activeIndex); return; }
      onListNavigation(e);
    }
  };

  return (
    <div className="space-y-1 w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="text-[10px] font-bold text-text-subtle uppercase tracking-widest ml-1 block"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <button
          id={selectId}
          ref={triggerRef}
          type="button"
          role={isSearchable ? undefined : 'combobox'}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-activedescendant={open && !isSearchable ? optionId(activeIndex) : undefined}
          aria-required={required}
          aria-invalid={!!error}
          disabled={disabled}
          onClick={() => (open ? closeMenu() : openMenu())}
          onKeyDown={onTriggerKeyDown}
          className={`w-full flex items-center justify-between gap-2 bg-surface-muted text-text border rounded-xl px-4 py-2.5 text-sm text-left outline-none cursor-pointer transition-all focus-visible:ring-1 ${
            error
              ? 'border-danger-border focus-visible:border-danger-strong focus-visible:ring-danger-strong'
              : 'border-border-strong focus-visible:border-focus focus-visible:ring-focus'
          } disabled:opacity-60 disabled:bg-surface-subtle disabled:cursor-not-allowed ${className}`}
        >
          <span className="truncate">{selectedOption?.label ?? ' '}</span>
          <ChevronDown
            className={`h-4 w-4 flex-shrink-0 text-text-muted transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
      </div>
      {error
        ? <p className="text-xs text-danger-strong font-medium ml-1">{error}</p>
        : hint && <p className="text-xs text-text-muted ml-1">{hint}</p>}

      {open && menuPos && createPortal(
        <div
          style={{
            top: menuPos.top,
            left: menuPos.left,
            width: menuPos.width,
            transform: menuPos.openUp ? 'translateY(-100%)' : undefined,
          }}
          className="fixed z-50 bg-surface border border-border-strong rounded-xl shadow-lg overflow-hidden animate-fadeIn"
        >
          {isSearchable && (
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
              <Search className="h-4 w-4 flex-shrink-0 text-text-subtle" aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded
                aria-controls={listboxId}
                aria-activedescendant={filtered.length ? optionId(activeIndex) : undefined}
                aria-autocomplete="list"
                aria-label={label}
                value={query}
                placeholder={t('select.searchPlaceholder')}
                onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
                onKeyDown={onListNavigation}
                className="w-full bg-transparent text-sm text-text outline-none placeholder-text-subtle"
              />
            </div>
          )}
          <ul
            id={listboxId}
            ref={listRef}
            role="listbox"
            aria-label={label}
            tabIndex={-1}
            className="sira-scrollbar max-h-60 overflow-y-auto py-1"
          >
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-text-muted text-center" role="presentation">
                {t('select.noResults')}
              </li>
            ) : (
              filtered.map((opt, index) => {
                const isSelected = String(opt.value) === String(value);
                const isActive = index === activeIndex;
                return (
                  <li
                    key={opt.value}
                    id={optionId(index)}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => commit(index)}
                    className={`flex items-center justify-between gap-2 mx-1 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                      isSelected ? 'text-link font-semibold' : 'text-text'
                    } ${isActive ? 'bg-selected' : 'hover:bg-surface-muted'}`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="h-4 w-4 flex-shrink-0 text-link" aria-hidden="true" />}
                  </li>
                );
              })
            )}
          </ul>
        </div>,
        document.body,
      )}
    </div>
  );
};
