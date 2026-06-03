export const screenLoaders = {
  home: () => import('../pages/Home').then(module => ({ default: module.Home })),
  results: () => import('../pages/Recommendations').then(module => ({ default: module.Recommendations })),
  details: () => import('../pages/Details').then(module => ({ default: module.Details })),
  catalog: () => import('../pages/Catalog').then(module => ({ default: module.Catalog })),
  favorites: () => import('../pages/Favorites').then(module => ({ default: module.Favorites })),
  profile: () => import('../pages/Profile').then(module => ({ default: module.Profile })),
  login: () => import('../pages/Login').then(module => ({ default: module.Login })),
  register: () => import('../pages/Register').then(module => ({ default: module.Register })),
  onboarding: () => import('../pages/Onboarding').then(module => ({ default: module.Onboarding })),
  'forgot-password': () => import('../pages/ForgotPassword').then(module => ({ default: module.ForgotPassword })),
  'reset-password': () => import('../pages/ResetPassword').then(module => ({ default: module.ResetPassword })),
} as const;

export const prefetchScreen = (screen: string) => {
  const load = screenLoaders[screen as keyof typeof screenLoaders];
  if (load) void load();
};
