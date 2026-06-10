export const EDUCATION_LEVELS = ['Graduação', 'Especialização', 'Mestrado', 'Doutorado'] as const;
export const LANGUAGES = ['Português', 'Inglês', 'Espanhol'] as const;
export const MATERIAL_LEVELS = ['Introdutório', 'Intermediário', 'Avançado'] as const;
// Espelho de ACADEMIC_GOALS do backend (preferences-options.ts) — eixo de
// "propósito". A profundidade vive em MATERIAL_LEVELS; manter as duas listas
// em paridade até a fonte única FE×BE (deferida no plano).
export const ACADEMIC_GOALS = [
  'TCC',
  'Pesquisa científica',
  'Estudo de disciplina',
  'Concursos',
  'Trabalho profissional',
] as const;

export const DEFAULT_EDUCATION_LEVEL = EDUCATION_LEVELS[0];
export const DEFAULT_LANGUAGES = [LANGUAGES[0]];
export const DEFAULT_MATERIAL_LEVELS = [MATERIAL_LEVELS[1]];
