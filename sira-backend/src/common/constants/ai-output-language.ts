import type { UiLocale } from './ui-locale';

const OUTPUT_LANGUAGE_LABEL: Record<UiLocale, string> = {
  'pt-BR': 'português do Brasil',
  'en-US': 'English',
};

const OUTPUT_INSTRUCTION: Record<UiLocale, string> = {
  'pt-BR': 'Toda saída voltada ao usuário (aiMessage e explanation) deve ser escrita em português do Brasil. Mantenha títulos, nomes de autores e demais metadados externos no idioma original.',
  'en-US': 'All user-facing output (aiMessage and explanation) must be written in English. Keep titles, author names, and other external metadata in their original language.',
};

const EMPTY_CHAT_MESSAGE: Record<UiLocale, string> = {
  'pt-BR': 'Não consegui encontrar materiais nas bases acadêmicas para este pedido. Tente reformular sua busca.',
  'en-US': 'I could not find materials in the academic databases for this request. Try rephrasing your search.',
};

const GENERIC_FALLBACK_MESSAGE: Record<UiLocale, string> = {
  'pt-BR': 'Encontrei alguns materiais que podem te ajudar na sua pesquisa.',
  'en-US': 'I found some materials that may help with your research.',
};

export const aiOutputLanguageLabel = (locale: UiLocale) => OUTPUT_LANGUAGE_LABEL[locale];
export const aiOutputInstruction = (locale: UiLocale) => OUTPUT_INSTRUCTION[locale];
export const aiEmptyChatMessage = (locale: UiLocale) => EMPTY_CHAT_MESSAGE[locale];
export const aiGenericFallbackMessage = (locale: UiLocale) => GENERIC_FALLBACK_MESSAGE[locale];
