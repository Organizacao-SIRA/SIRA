import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useOnboardingForm } from '../hooks/useOnboardingForm';
import { usePreferenceOptions } from '../queries/usePreferenceOptions';
import type { UserProfile, ProfileData } from '../types';
import { OnboardingLayout } from '../components/onboarding/OnboardingLayout';
import { OnboardingProgress } from '../components/onboarding/OnboardingProgress';
import { OnboardingActions } from '../components/onboarding/OnboardingActions';
import { WelcomeStep } from '../components/onboarding/steps/WelcomeStep';
import { AcademicProfileStep } from '../components/onboarding/steps/AcademicProfileStep';
import { InterestAreasStep } from '../components/onboarding/steps/InterestAreasStep';
import { ContentPreferencesStep } from '../components/onboarding/steps/ContentPreferencesStep';
import { AcademicGoalStep } from '../components/onboarding/steps/AcademicGoalStep';
import { ReviewStep } from '../components/onboarding/steps/ReviewStep';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';

interface OnboardingProps {
  setCurrentScreen: (screen: string) => void;
  profileData: ProfileData;
  setProfileData: (data: ProfileData) => void;
}

export const Onboarding = ({ setCurrentScreen, profileData, setProfileData }: OnboardingProps) => {
  const { t } = useTranslation('onboarding');
  const { user } = useAuth();
  const {
    data: preferenceOptions,
    isLoading: isLoadingOptions,
    error: optionsError,
    refetch: loadPreferenceOptions,
  } = usePreferenceOptions();

  const handleSuccess = (profile: UserProfile) => {
    setProfileData({
      ...profileData,
      name: profile.name || profileData.name,
      email: profile.email,
      course: profile.course || '',
      educationLevel: profile.educationLevel || profileData.educationLevel,
      mainArea: profile.mainArea || '',
      subAreas: profile.subAreas || '',
      languages: profile.languages?.length ? profile.languages : profileData.languages,
      materialLevels: profile.materialLevels?.length ? profile.materialLevels : profileData.materialLevels,
      wantsBooks: profile.wantsBooks,
      wantsArticles: profile.wantsArticles,
      interests: profile.interests || [],
      academicGoal: profile.academicGoal || '',
      avatarUrl: profile.avatarUrl ?? profileData.avatarUrl,
      uiLocale: profile.uiLocale ?? profileData.uiLocale,
      hasCompletedOnboarding: true,
      onboardingCompletedAt: profile.onboardingCompletedAt,
    });
    setCurrentScreen('home');
  };

  const onboarding = useOnboardingForm({
    initialData: profileData,
    onSuccess: handleSuccess,
  });

  const [direction, setDirection] = useState(1);
  const goToStep = (target: number) => {
    setDirection(target >= onboarding.step ? 1 : -1);
    onboarding.goTo(target);
  };
  const goNext = () => {
    setDirection(1);
    onboarding.next();
  };
  const goBack = () => {
    setDirection(-1);
    onboarding.back();
  };

  if (isLoadingOptions) {
    return (
      <div className="min-h-[calc(100vh-68px)] flex items-center justify-center p-4 bg-surface-muted animate-fadeIn">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto" />
          <p className="mt-4 text-primary-dark dark:text-text font-bold text-xs uppercase tracking-widest">
            {t('loading.options')}
          </p>
        </div>
      </div>
    );
  }

  if (optionsError || !preferenceOptions) {
    return (
      <div className="min-h-[calc(100vh-68px)] flex items-center justify-center p-4 bg-surface-muted animate-fadeIn">
        <div className="sira-card rounded-2xl p-6 sm:p-8 max-w-md w-full text-center">
          <AlertCircle className="w-10 h-10 text-warning-strong mx-auto mb-3" />
          <h3 className="text-lg font-bold text-primary-dark dark:text-text mb-2">{t('loading.errorTitle')}</h3>
          <p className="text-text-muted text-sm mb-4">{optionsError?.message || t('loading.unavailable')}</p>
          <Button onClick={() => loadPreferenceOptions()} className="px-6">
            {t('common:actions.retry')}
          </Button>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (onboarding.step) {
      case 0:
        return <WelcomeStep userName={user?.name} />;
      case 1:
        return (
          <AcademicProfileStep
            data={onboarding.data}
            errors={onboarding.stepErrors[1]}
            options={preferenceOptions}
            onChange={onboarding.setField}
          />
        );
      case 2:
        return (
          <InterestAreasStep
            topics={preferenceOptions.topics}
            selected={onboarding.data.interests}
            onToggle={(id) => onboarding.toggleArrayField('interests', id)}
            error={onboarding.stepErrors[2].interests}
          />
        );
      case 3:
        return (
          <ContentPreferencesStep
            data={onboarding.data}
            errors={onboarding.stepErrors[3]}
            options={preferenceOptions}
            onToggleArray={onboarding.toggleArrayField}
            onChange={onboarding.setField}
          />
        );
      case 4:
        return (
          <AcademicGoalStep
            goals={preferenceOptions.academicGoals}
            selected={onboarding.data.academicGoal}
            onSelect={(goal) => onboarding.setField('academicGoal', goal)}
          />
        );
      case 5:
        return (
          <ReviewStep
            data={onboarding.data}
            options={preferenceOptions}
            onEdit={onboarding.goTo}
          />
        );
      default:
        return null;
    }
  };

  const stepHint = (() => {
    if (onboarding.step === 2) {
      const count = onboarding.data.interests.length;
      return t('interests.hint', { count });
    }
    return null;
  })();

  return (
    <OnboardingLayout
      progress={
        <OnboardingProgress
          currentStep={onboarding.step}
          onJumpTo={goToStep}
        />
      }
      actions={
        <OnboardingActions
          step={onboarding.step}
          totalSteps={onboarding.totalSteps}
          canAdvance={onboarding.canAdvance}
          isSaving={onboarding.isSaving}
          onBack={goBack}
          onNext={goNext}
          onSubmit={onboarding.submit}
          hint={stepHint}
        />
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={onboarding.step}
          initial={{ x: direction * 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction * -40, opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </OnboardingLayout>
  );
};
