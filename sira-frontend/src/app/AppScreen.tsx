import { lazy, Suspense, type Dispatch, type FormEvent, type SetStateAction } from 'react';
import type { AuthUser, CatalogItem, ProfileData, SearchFilters } from '../types';
import { Spinner } from '../components/ui/Spinner';

const Home = lazy(() => import('../pages/Home').then(module => ({ default: module.Home })));
const Recommendations = lazy(() => import('../pages/Recommendations').then(module => ({ default: module.Recommendations })));
const Favorites = lazy(() => import('../pages/Favorites').then(module => ({ default: module.Favorites })));
const Profile = lazy(() => import('../pages/Profile').then(module => ({ default: module.Profile })));
const Catalog = lazy(() => import('../pages/Catalog').then(module => ({ default: module.Catalog })));
const Details = lazy(() => import('../pages/Details').then(module => ({ default: module.Details })));
const Login = lazy(() => import('../pages/Login').then(module => ({ default: module.Login })));
const Register = lazy(() => import('../pages/Register').then(module => ({ default: module.Register })));
const Onboarding = lazy(() => import('../pages/Onboarding').then(module => ({ default: module.Onboarding })));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword').then(module => ({ default: module.ForgotPassword })));
const ResetPassword = lazy(() => import('../pages/ResetPassword').then(module => ({ default: module.ResetPassword })));

const PageLoadingFallback = () => (
  <div className="min-h-[calc(100vh-68px)] flex items-center justify-center">
    <Spinner size="lg" />
  </div>
);

interface AppScreenProps {
  currentScreen: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: (event: FormEvent) => void;
  searchFilters: SearchFilters;
  setSearchFilters: (filters: SearchFilters) => void;
  user: AuthUser | null;
  results: CatalogItem[];
  aiMessage: string;
  viewDetails: (item: CatalogItem) => void;
  toggleFavorite: (item: CatalogItem) => Promise<boolean>;
  isFavorite: (id: string) => boolean;
  isLoading: boolean;
  isRegenerating: boolean;
  regenerateSearchResults: () => void;
  isSidebarOpen: boolean;
  selectedItem: CatalogItem | null;
  handleDetailsBack: () => void;
  previousScreen: string;
  catalogHomeResetKey: number;
  favoritesHomeResetKey: number;
  setCurrentScreen: (screen: string) => void;
  profileData: ProfileData;
  setProfileData: Dispatch<SetStateAction<ProfileData>>;
  isProfileLoading: boolean;
  profileError: string | null;
  loadSessionData: () => void;
  resetToken: string;
}

export const AppScreen = ({
  currentScreen,
  searchQuery,
  setSearchQuery,
  handleSearch,
  searchFilters,
  setSearchFilters,
  user,
  results,
  aiMessage,
  viewDetails,
  toggleFavorite,
  isFavorite,
  isLoading,
  isRegenerating,
  regenerateSearchResults,
  isSidebarOpen,
  selectedItem,
  handleDetailsBack,
  previousScreen,
  catalogHomeResetKey,
  favoritesHomeResetKey,
  setCurrentScreen,
  profileData,
  setProfileData,
  isProfileLoading,
  profileError,
  loadSessionData,
  resetToken,
}: AppScreenProps) => (
  <Suspense fallback={<PageLoadingFallback />}>
    {currentScreen === 'home' && (
      <Home
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        filters={searchFilters}
        setFilters={setSearchFilters}
        user={user}
      />
    )}
    {currentScreen === 'results' && (
      <Recommendations
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        setCurrentScreen={setCurrentScreen}
        results={results}
        aiMessage={aiMessage}
        viewDetails={viewDetails}
        toggleFavorite={toggleFavorite}
        isFavorite={isFavorite}
        isLoading={isLoading}
        isRegenerating={isRegenerating}
        onRegenerate={regenerateSearchResults}
        isSidebarOpen={isSidebarOpen}
        user={user}
      />
    )}
    {currentScreen === 'details' && (
      <Details
        item={selectedItem}
        onBack={handleDetailsBack}
        previousScreen={previousScreen}
        toggleFavorite={toggleFavorite}
        isFavorite={isFavorite}
      />
    )}
    {currentScreen === 'catalog' && (
      <Catalog
        viewDetails={viewDetails}
        toggleFavorite={toggleFavorite}
        isFavorite={isFavorite}
        homeResetKey={catalogHomeResetKey}
      />
    )}
    {currentScreen === 'favorites' && (
      <Favorites
        toggleFavorite={toggleFavorite}
        viewDetails={viewDetails}
        setCurrentScreen={setCurrentScreen}
        homeResetKey={favoritesHomeResetKey}
      />
    )}
    {currentScreen === 'profile' && (
      <Profile
        profileData={profileData}
        setProfileData={setProfileData}
        isLoading={isProfileLoading}
        loadError={profileError}
        onRetryLoad={loadSessionData}
      />
    )}
    {currentScreen === 'login' && <Login setCurrentScreen={setCurrentScreen} />}
    {currentScreen === 'register' && <Register setCurrentScreen={setCurrentScreen} />}
    {currentScreen === 'forgot-password' && <ForgotPassword setCurrentScreen={setCurrentScreen} />}
    {currentScreen === 'reset-password' && <ResetPassword token={resetToken} setCurrentScreen={setCurrentScreen} />}
    {currentScreen === 'onboarding' && (
      <Onboarding
        setCurrentScreen={setCurrentScreen}
        profileData={profileData}
        setProfileData={setProfileData}
      />
    )}
  </Suspense>
);
