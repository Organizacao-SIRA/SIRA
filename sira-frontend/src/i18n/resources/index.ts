import { common as commonPtBr } from './pt-BR/common';
import { auth as authPtBr } from './pt-BR/auth';
import { home as homePtBr } from './pt-BR/home';
import { navigation as navigationPtBr } from './pt-BR/navigation';
import { catalog as catalogPtBr } from './pt-BR/catalog';
import { favorites as favoritesPtBr } from './pt-BR/favorites';
import { recommendations as recommendationsPtBr } from './pt-BR/recommendations';
import { details as detailsPtBr } from './pt-BR/details';
import { profile as profilePtBr } from './pt-BR/profile';
import { onboarding as onboardingPtBr } from './pt-BR/onboarding';
import { preferences as preferencesPtBr } from './pt-BR/preferences';
import { common as commonEnUs } from './en-US/common';
import { auth as authEnUs } from './en-US/auth';
import { home as homeEnUs } from './en-US/home';
import { navigation as navigationEnUs } from './en-US/navigation';
import { catalog as catalogEnUs } from './en-US/catalog';
import { favorites as favoritesEnUs } from './en-US/favorites';
import { recommendations as recommendationsEnUs } from './en-US/recommendations';
import { details as detailsEnUs } from './en-US/details';
import { profile as profileEnUs } from './en-US/profile';
import { onboarding as onboardingEnUs } from './en-US/onboarding';
import { preferences as preferencesEnUs } from './en-US/preferences';

export const resources = {
  'pt-BR': {
    common: commonPtBr,
    auth: authPtBr,
    home: homePtBr,
    navigation: navigationPtBr,
    catalog: catalogPtBr,
    favorites: favoritesPtBr,
    recommendations: recommendationsPtBr,
    details: detailsPtBr,
    profile: profilePtBr,
    onboarding: onboardingPtBr,
    preferences: preferencesPtBr,
  },
  'en-US': {
    common: commonEnUs,
    auth: authEnUs,
    home: homeEnUs,
    navigation: navigationEnUs,
    catalog: catalogEnUs,
    favorites: favoritesEnUs,
    recommendations: recommendationsEnUs,
    details: detailsEnUs,
    profile: profileEnUs,
    onboarding: onboardingEnUs,
    preferences: preferencesEnUs,
  },
} as const;
