import { lazy, Suspense, type Dispatch, type FormEvent, type SetStateAction } from 'react';
import type { AuthUser, CatalogItem, ProfileData, SearchFilters } from '../types';
import { Spinner } from '../components/ui/Spinner';
import { screenLoaders } from './screenLoaders';

const Home = lazy(screenLoaders.home);
const Recommendations = lazy(screenLoaders.results);
const Favorites = lazy(screenLoaders.favorites);
const Profile = lazy(screenLoaders.profile);
const Catalog = lazy(screenLoaders.catalog);
const Details = lazy(screenLoaders.details);
const Login = lazy(screenLoaders.login);
const Register = lazy(screenLoaders.register);
const Onboarding = lazy(screenLoaders.onboarding);
const ForgotPassword = lazy(screenLoaders['forgot-password']);
const ResetPassword = lazy(screenLoaders['reset-password']);

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
