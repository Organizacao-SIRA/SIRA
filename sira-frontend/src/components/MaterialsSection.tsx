import React from 'react';
import { RecommendationCard } from './RecommendationCard';
import { Button } from './ui/Button';
import { StatusBadge } from './ui/StatusBadge';

interface MaterialsSectionProps {
  results: any[];
  onRetry: () => void;
  viewDetails: (item: any) => void;
  toggleFavorite: (item: any) => void;
  isFavorite: (id: any) => boolean;
}

export const MaterialsSection = ({ results, onRetry, viewDetails, toggleFavorite, isFavorite }: MaterialsSectionProps) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between px-1">
      <div className="flex items-center gap-2">
        <h3 className="text-[10px] font-bold text-text-subtle uppercase tracking-[0.2em]">Materiais Selecionados</h3>
        {results.length > 0 && (
          <span className="text-[10px] font-bold text-text-muted bg-surface-subtle px-2 py-0.5 rounded-full">
            {results.length} {results.length === 1 ? 'material' : 'materiais'}
          </span>
        )}
      </div>
      <StatusBadge variant="success" className="rounded-full border-0">IA Verified</StatusBadge>
    </div>

    {results.map((item: any) => (
      <RecommendationCard
        key={item.id}
        item={item}
        viewDetails={viewDetails}
        toggleFavorite={toggleFavorite}
        isFavorite={isFavorite(item.id)}
      />
    ))}

    {results.length === 0 && (
      <div className="bg-surface p-8 rounded-2xl border border-dashed border-border-strong text-center space-y-4">
        <p className="text-text-subtle text-sm font-medium">
          Não consegui encontrar materiais específicos para este pedido nas bases acadêmicas no momento.
        </p>
        <Button onClick={onRetry} variant="secondary" size="sm">
          Tentar novamente
        </Button>
      </div>
    )}
  </div>
);
