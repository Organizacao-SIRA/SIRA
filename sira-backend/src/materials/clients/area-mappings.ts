// Mapeamentos de área temática (id interno → termo/campo de cada API externa) e
// de idioma (rótulo → ISO 639-1). Centralizados para os clients consumirem.

export const AREA_GB_SUBJECT: Record<string, string> = {
  ia: 'artificial intelligence',
  cd: 'data science',
  edu: 'education',
  sau: 'medicine',
  dir: 'law',
  eco: 'economics',
  soc: 'sociology',
  amb: 'environment',
  gp: 'public administration',
};

export const AREA_SS_FIELDS: Record<string, string> = {
  ia: 'Computer Science',
  cd: 'Computer Science',
  edu: 'Education',
  sau: 'Medicine',
  dir: 'Law',
  eco: 'Economics',
  soc: 'Sociology',
  amb: 'Environmental Science',
  gp: 'Political Science',
};

export const AREA_OA_CONCEPT: Record<string, string> = {
  ia: 'artificial intelligence',
  cd: 'data science',
  edu: 'education',
  sau: 'medicine',
  dir: 'law',
  eco: 'economics',
  soc: 'sociology',
  amb: 'environmental science',
  gp: 'political science',
};

export const LANGUAGE_ISO: Record<string, string> = {
  'Português': 'pt',
  'Inglês': 'en',
  'Espanhol': 'es',
};
