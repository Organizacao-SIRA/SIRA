import { Injectable } from '@nestjs/common';

/**
 * Cálculo de relevância base dos materiais. Lógica pura, sem HTTP/Prisma —
 * fácil de testar e reutilizar pelos clients.
 */
@Injectable()
export class MaterialScoringService {
  /** Score posicional decrescente (97 → 70) conforme a ordem na fonte. */
  positionScore(index: number, total: number): number {
    return Math.round(97 - (index / Math.max(total - 1, 1)) * 27);
  }

  /** Bônus por citações (0 a 5), em escala logarítmica. */
  citationBoost(count: number): number {
    return Math.min(5, Math.round(Math.log10(count + 1) * 2));
  }
}
