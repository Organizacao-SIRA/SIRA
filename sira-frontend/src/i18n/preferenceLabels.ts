import type { TFunction } from 'i18next';
import type { PreferenceTopic } from '../types';
import {
  ACADEMIC_GOALS,
  EDUCATION_LEVELS,
  LANGUAGES,
  MATERIAL_LEVELS,
} from './preferenceValues';

const valueKeys: Record<string, string> = {
  [EDUCATION_LEVELS[0]]: 'education.graduation',
  [EDUCATION_LEVELS[1]]: 'education.specialization',
  [EDUCATION_LEVELS[2]]: 'education.master',
  [EDUCATION_LEVELS[3]]: 'education.doctorate',
  [LANGUAGES[0]]: 'languages.portuguese',
  [LANGUAGES[1]]: 'languages.english',
  [LANGUAGES[2]]: 'languages.spanish',
  [MATERIAL_LEVELS[0]]: 'materialLevels.introductory',
  [MATERIAL_LEVELS[1]]: 'materialLevels.intermediate',
  [MATERIAL_LEVELS[2]]: 'materialLevels.advanced',
  [ACADEMIC_GOALS[0]]: 'goals.thesis',
  [ACADEMIC_GOALS[1]]: 'goals.scientificResearch',
  [ACADEMIC_GOALS[2]]: 'goals.subjectStudy',
  [ACADEMIC_GOALS[3]]: 'goals.exams',
  [ACADEMIC_GOALS[4]]: 'goals.professionalWork',
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
