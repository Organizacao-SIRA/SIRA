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
  // — Ciências Exatas e da Terra —
  {
    id: 'mat',
    label: 'Matemática',
    description: 'Matemática pura e aplicada, álgebra, análise e modelagem',
    keywords: ['mathematics', 'applied mathematics', 'algebra', 'mathematical analysis'],
  },
  {
    id: 'fis',
    label: 'Física',
    description: 'Física teórica e experimental, mecânica, eletromagnetismo e quântica',
    keywords: ['physics', 'theoretical physics', 'quantum mechanics', 'electromagnetism'],
  },
  {
    id: 'qui',
    label: 'Química',
    description: 'Química orgânica, inorgânica, analítica e físico-química',
    keywords: ['chemistry', 'organic chemistry', 'analytical chemistry', 'physical chemistry'],
  },
  {
    id: 'comp',
    label: 'Computação',
    description: 'Algoritmos, sistemas, redes, segurança e teoria da computação',
    keywords: ['computer science', 'algorithms', 'computer networks', 'cybersecurity'],
  },
  // — Ciências Biológicas —
  {
    id: 'bio',
    label: 'Biologia',
    description: 'Biologia celular, genética, ecologia e evolução',
    keywords: ['biology', 'cell biology', 'genetics', 'molecular biology'],
  },
  // — Engenharias —
  {
    id: 'esoft',
    label: 'Engenharia de Software',
    description: 'Desenvolvimento de software, arquitetura, requisitos e qualidade',
    keywords: ['software engineering', 'software architecture', 'requirements engineering', 'software testing'],
  },
  {
    id: 'eciv',
    label: 'Engenharia Civil',
    description: 'Estruturas, construção, geotecnia e infraestrutura',
    keywords: ['civil engineering', 'structural engineering', 'construction', 'geotechnical engineering'],
  },
  {
    id: 'emec',
    label: 'Engenharia Mecânica',
    description: 'Mecânica, termodinâmica, materiais e manufatura',
    keywords: ['mechanical engineering', 'thermodynamics', 'manufacturing', 'materials science'],
  },
  {
    id: 'eprod',
    label: 'Engenharia de Produção',
    description: 'Processos, logística, qualidade e gestão de operações',
    keywords: ['industrial engineering', 'operations management', 'logistics', 'production planning'],
  },
  // — Ciências da Saúde —
  {
    id: 'med',
    label: 'Medicina',
    description: 'Clínica médica, diagnóstico, terapêutica e especialidades',
    keywords: ['medicine', 'clinical medicine', 'internal medicine', 'medical research'],
  },
  {
    id: 'enf',
    label: 'Enfermagem',
    description: 'Cuidados de enfermagem, assistência e gestão do cuidado',
    keywords: ['nursing', 'nursing care', 'patient care', 'clinical nursing'],
  },
  {
    id: 'psi',
    label: 'Psicologia',
    description: 'Comportamento, cognição, saúde mental e psicologia clínica',
    keywords: ['psychology', 'cognitive psychology', 'mental health', 'clinical psychology'],
  },
  // — Ciências Agrárias —
  {
    id: 'agro',
    label: 'Agronomia',
    description: 'Produção agrícola, solos, culturas e agronegócio',
    keywords: ['agronomy', 'agriculture', 'soil science', 'crop science'],
  },
  {
    id: 'vet',
    label: 'Medicina Veterinária',
    description: 'Saúde animal, clínica veterinária e zootecnia',
    keywords: ['veterinary medicine', 'animal health', 'animal science', 'veterinary clinic'],
  },
  // — Ciências Sociais Aplicadas —
  {
    id: 'adm',
    label: 'Administração',
    description: 'Gestão, estratégia, finanças e empreendedorismo',
    keywords: ['business administration', 'management', 'strategic management', 'entrepreneurship'],
  },
  {
    id: 'com',
    label: 'Comunicação',
    description: 'Mídia, jornalismo, publicidade e comunicação social',
    keywords: ['communication', 'media studies', 'journalism', 'advertising'],
  },
  // — Ciências Humanas —
  {
    id: 'hist',
    label: 'História',
    description: 'História, historiografia, memória e patrimônio',
    keywords: ['history', 'historiography', 'social history', 'cultural heritage'],
  },
  {
    id: 'fil',
    label: 'Filosofia',
    description: 'Ética, epistemologia, lógica e filosofia política',
    keywords: ['philosophy', 'ethics', 'epistemology', 'political philosophy'],
  },
  {
    id: 'geog',
    label: 'Geografia',
    description: 'Geografia humana e física, território e geoprocessamento',
    keywords: ['geography', 'human geography', 'physical geography', 'geographic information systems'],
  },
  // — Linguística, Letras e Artes —
  {
    id: 'let',
    label: 'Letras e Linguística',
    description: 'Língua, linguística, literatura e estudos de tradução',
    keywords: ['linguistics', 'language studies', 'literature', 'translation studies'],
  },
  {
    id: 'art',
    label: 'Artes e Design',
    description: 'Artes visuais, design, música e produção cultural',
    keywords: ['arts', 'design', 'visual arts', 'music'],
  },
] as const;

export const EDUCATION_LEVELS = ['Graduação', 'Especialização', 'Mestrado', 'Doutorado'] as const;
export const LANGUAGES = ['Português', 'Inglês', 'Espanhol'] as const;
export const MATERIAL_LEVELS = ['Introdutório', 'Intermediário', 'Avançado'] as const;
// Eixo único de "propósito": o que o usuário quer alcançar. A profundidade
// (introdutório/intermediário/avançado) vive em MATERIAL_LEVELS — por isso os
// antigos 'Estudo introdutório'/'Aprofundamento técnico' saíram daqui (migração
// remapeia os valores legados para 'Estudo de disciplina').
export const ACADEMIC_GOALS = [
  'TCC',
  'Pesquisa científica',
  'Estudo de disciplina',
  'Concursos',
  'Trabalho profissional',
] as const;

export const PREFERENCE_TOPIC_IDS = PREFERENCE_TOPICS.map(topic => topic.id);
export const EDUCATION_LEVEL_LIST = [...EDUCATION_LEVELS];
export const LANGUAGE_LIST = [...LANGUAGES];
export const MATERIAL_LEVEL_LIST = [...MATERIAL_LEVELS];
export const ACADEMIC_GOAL_LIST = [...ACADEMIC_GOALS];

/** Mínimo de áreas de interesse exigido para o onboarding ser considerado completo. */
export const MIN_INTEREST_AREAS = 3;

export const PREFERENCE_TOPIC_IDS_SET = new Set(PREFERENCE_TOPIC_IDS);
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
