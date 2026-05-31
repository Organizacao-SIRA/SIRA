import type { TFunction } from 'i18next';
import type { PreferenceTopic } from '../types';

const valueKeys: Record<string, string> = {
  'Graduação': 'education.graduation',
  'Especialização': 'education.specialization',
  'Mestrado': 'education.master',
  'Doutorado': 'education.doctorate',
  'Português': 'languages.portuguese',
  'Inglês': 'languages.english',
  'Espanhol': 'languages.spanish',
  'Introdutório': 'materialLevels.introductory',
  'Intermediário': 'materialLevels.intermediate',
  'Avançado': 'materialLevels.advanced',
  'TCC': 'goals.thesis',
  'Pesquisa científica': 'goals.scientificResearch',
  'Estudo introdutório': 'goals.introductoryStudy',
  'Aprofundamento técnico': 'goals.technicalDepth',
  'Concursos': 'goals.exams',
  'Trabalho profissional': 'goals.professionalWork',
};

export const preferenceValueLabel = (value: string, t: TFunction<'preferences'>) => {
  const key = valueKeys[value];
  return key ? t(key) : value;
};

export const preferenceTopicLabel = (topic: PreferenceTopic, t: TFunction<'preferences'>) =>
  t(`topics.${topic.id}.label`, { defaultValue: topic.label });

export const preferenceTopicDescription = (topic: PreferenceTopic, t: TFunction<'preferences'>) =>
  topic.description
    ? t(`topics.${topic.id}.description`, { defaultValue: topic.description })
    : undefined;
