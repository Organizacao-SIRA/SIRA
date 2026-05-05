export const PREFERENCE_TOPICS = [
  {
    id: 'ia',
    label: 'Inteligência Artificial',
    description: 'Aprendizado de máquina, modelos generativos e sistemas inteligentes',
    keywords: ['artificial intelligence', 'machine learning', 'deep learning', 'inteligencia artificial'],
  },
  {
    id: 'gp',
    label: 'Gestão Pública',
    description: 'Políticas públicas, administração e serviços públicos',
    keywords: ['public administration', 'public policy', 'public management', 'gestao publica'],
  },
  {
    id: 'dir',
    label: 'Direito',
    description: 'Direito, legislação, jurisprudência e regulação',
    keywords: ['law', 'legal studies', 'legislation', 'direito'],
  },
  {
    id: 'cd',
    label: 'Ciência de Dados',
    description: 'Análise de dados, estatística, big data e visualização',
    keywords: ['data science', 'data analysis', 'statistics', 'big data'],
  },
  {
    id: 'edu',
    label: 'Educação',
    description: 'Pedagogia, aprendizagem, ensino e avaliação educacional',
    keywords: ['education', 'learning', 'teaching', 'pedagogy'],
  },
  {
    id: 'sau',
    label: 'Saúde',
    description: 'Saúde pública, medicina, epidemiologia e gestão em saúde',
    keywords: ['public health', 'healthcare', 'medicine', 'epidemiology'],
  },
  {
    id: 'eco',
    label: 'Economia',
    description: 'Economia, finanças, desenvolvimento e políticas econômicas',
    keywords: ['economics', 'finance', 'economic development', 'public economics'],
  },
  {
    id: 'soc',
    label: 'Sociologia',
    description: 'Sociedade, cultura, comportamento e desigualdades sociais',
    keywords: ['sociology', 'social sciences', 'social behavior', 'inequality'],
  },
  {
    id: 'amb',
    label: 'Meio Ambiente',
    description: 'Sustentabilidade, clima, ecologia e políticas ambientais',
    keywords: ['environment', 'sustainability', 'climate change', 'ecology'],
  },
] as const;

export const EDUCATION_LEVELS = ['Graduação', 'Especialização', 'Mestrado', 'Doutorado'] as const;
export const LANGUAGES = ['Português', 'Inglês', 'Espanhol'] as const;
export const MATERIAL_LEVELS = ['Introdutório', 'Intermediário', 'Avançado'] as const;
export const ACADEMIC_GOALS = [
  'TCC',
  'Pesquisa científica',
  'Estudo introdutório',
  'Aprofundamento técnico',
  'Concursos',
  'Trabalho profissional',
] as const;

export const PREFERENCE_TOPIC_IDS = new Set(PREFERENCE_TOPICS.map(topic => topic.id));
export const EDUCATION_LEVEL_SET = new Set<string>(EDUCATION_LEVELS);
export const LANGUAGE_SET = new Set<string>(LANGUAGES);
export const MATERIAL_LEVEL_SET = new Set<string>(MATERIAL_LEVELS);
export const ACADEMIC_GOAL_SET = new Set<string>(ACADEMIC_GOALS);

export const getPreferenceTopicKeywords = (topicIds: string[]): string[] => {
  const selected = new Set(topicIds);
  return PREFERENCE_TOPICS
    .filter(topic => selected.has(topic.id))
    .flatMap(topic => topic.keywords);
};

export const getPreferenceTopicLabels = (topicIds: string[]): string[] => {
  const selected = new Set(topicIds);
  return PREFERENCE_TOPICS
    .filter(topic => selected.has(topic.id))
    .map(topic => topic.label);
};
