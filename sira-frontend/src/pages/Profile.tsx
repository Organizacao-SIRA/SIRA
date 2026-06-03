import { useEffect, useState } from 'react';
import { Pencil, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { updateProfile, getPreferenceOptions } from '../services/api';
import { toast } from '../toast';
import type { Dispatch, SetStateAction } from 'react';
import type { PreferenceTopic, PreferenceOptions, UserProfile, ProfileData, UpdateProfilePayload } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useUiLocaleSync } from '../hooks/useUiLocaleSync';
import { Button } from '../components/ui/Button';
import { ErrorState } from '../components/ui/ErrorState';
import { PageHeader } from '../components/ui/PageHeader';
import { Skeleton } from '../components/ui/Skeleton';
import { ProfileHeaderCard } from '../components/profile/ProfileHeaderCard';
import { PersonalInfoCard } from '../components/profile/PersonalInfoCard';
import { AcademicProfileCard } from '../components/profile/AcademicProfileCard';
import { InterestAreasCard } from '../components/profile/InterestAreasCard';
import { ContentPreferencesCard } from '../components/profile/ContentPreferencesCard';
import { EditActionBar } from '../components/profile/EditActionBar';
import { AvatarUploadModal } from '../components/profile/AvatarUploadModal';
import { LanguageToggle } from '../components/ui/LanguageToggle';
import type { UiLocale } from '../i18n/locales';

interface ProfileProps {
  profileData: ProfileData;
  setProfileData: Dispatch<SetStateAction<ProfileData>>;
  isLoading?: boolean;
  loadError?: string | null;
  onRetryLoad?: () => void;
}

const DEFAULT_TOPICS: PreferenceTopic[] = [
  { id: 'dir', label: 'Direito' },
  { id: 'ia',  label: 'Tecnologia' },
  { id: 'sau', label: 'Saúde' },
  { id: 'eco', label: 'Economia' },
  { id: 'amb', label: 'Meio Ambiente' },
  { id: 'gp',  label: 'Gestão Pública' },
  { id: 'cd',  label: 'Ciência de Dados' },
  { id: 'edu', label: 'Educação' },
  { id: 'soc', label: 'Sociologia' },
];

const ProfileSkeleton = () => {
  const { t } = useTranslation('profile');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-h-[calc(100vh-68px)] animate-fadeIn">
      <PageHeader
        icon={Settings}
        title={t('header.title')}
        subtitle={t('header.subtitle')}
      />

    <div className="space-y-6">
      <div className="sira-card p-5 sm:p-6 rounded-2xl flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-5">
        <Skeleton className="w-24 h-24 rounded-full shrink-0" />
        <div className="flex-1 min-w-0 w-full space-y-3">
          <Skeleton className="h-7 w-56 max-w-full mx-auto sm:mx-0" />
          <Skeleton className="h-4 w-72 max-w-full mx-auto sm:mx-0" />
        </div>
        <Skeleton className="h-9 w-44 rounded-full shrink-0" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="sira-card rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-surface-muted/30 flex items-center gap-2.5">
              <Skeleton className="w-9 h-9 rounded-md" />
              <Skeleton className="h-5 w-40" />
            </div>
            <div className="p-6 space-y-4">
              {Array.from({ length: index === 0 ? 2 : 4 }).map((__, row) => (
                <div key={row} className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-2 sm:gap-3 sm:items-center border-b border-border pb-3 last:border-b-0 last:pb-0">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="sira-card rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-surface-muted/30 flex items-center gap-2.5">
          <Skeleton className="w-9 h-9 rounded-md" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-36" />
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
};

export const Profile = ({ profileData, setProfileData, isLoading, loadError, onRetryLoad }: ProfileProps) => {
  const { t } = useTranslation('profile');
  const { updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<ProfileData>(profileData);
  const [preferenceOptions, setPreferenceOptions] = useState<PreferenceOptions | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setEditData(profileData));
  }, [profileData]);

  useEffect(() => {
    if (isEditing && !preferenceOptions) {
      getPreferenceOptions().then(setPreferenceOptions).catch(() => {});
    }
  }, [isEditing, preferenceOptions]);

  const { setUiLocale } = useUiLocaleSync({
    onError: () => toast.error(t('errors.localeSave')),
  });

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (loadError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-h-[calc(100vh-68px)] animate-fadeIn">
        <PageHeader
          icon={Settings}
          title={t('header.title')}
          subtitle={t('header.subtitle')}
        />
        <ErrorState
          title={t('header.loadErrorTitle')}
          message={loadError}
          onRetry={onRetryLoad}
          className="max-w-2xl mx-auto"
        />
      </div>
    );
  }

  const handleChange = <Field extends keyof ProfileData>(field: Field, value: ProfileData[Field]) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTextChange = (
    field: 'name' | 'course' | 'educationLevel' | 'mainArea' | 'subAreas' | 'academicGoal',
    value: string,
  ) => handleChange(field, value);

  const handleArrayChange = (field: 'languages' | 'materialLevels', value: string, checked: boolean) => {
    const current: string[] = editData[field] || [];
    handleChange(field, checked ? [...current, value] : current.filter(item => item !== value));
  };

  const toggleInterest = (id: string) => {
    const current: string[] = editData.interests || [];
    handleChange('interests', current.includes(id)
      ? current.filter(item => item !== id)
      : [...current, id]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload: UpdateProfilePayload = {
        name: editData.name || undefined,
        course: editData.course || undefined,
        educationLevel: editData.educationLevel || undefined,
        mainArea: editData.mainArea || undefined,
        subAreas: editData.subAreas || undefined,
        languages: editData.languages,
        materialLevels: editData.materialLevels,
        wantsBooks: editData.wantsBooks,
        wantsArticles: editData.wantsArticles,
        wantsOpenAccessOnly: editData.wantsOpenAccessOnly,
        interests: editData.interests,
        academicGoal: editData.academicGoal || undefined,
      };
      const saved = await updateProfile(payload);
      setProfileData((prev) => ({
        ...prev,
        name: saved.name || prev.name,
        email: saved.email,
        course: saved.course || '',
        educationLevel: saved.educationLevel || prev.educationLevel,
        mainArea: saved.mainArea || '',
        subAreas: saved.subAreas || '',
        languages: saved.languages?.length ? saved.languages : prev.languages,
        materialLevels: saved.materialLevels?.length ? saved.materialLevels : prev.materialLevels,
        wantsBooks: saved.wantsBooks,
        wantsArticles: saved.wantsArticles,
        wantsOpenAccessOnly: saved.wantsOpenAccessOnly,
        interests: saved.interests?.length ? saved.interests : prev.interests,
        academicGoal: saved.academicGoal || '',
        avatarUrl: saved.avatarUrl ?? prev.avatarUrl,
        uiLocale: saved.uiLocale ?? prev.uiLocale,
        hasCompletedOnboarding: saved.hasCompletedOnboarding,
        onboardingCompletedAt: saved.onboardingCompletedAt,
      }));
      updateUser({
        name: saved.name,
        ...(saved.uiLocale !== undefined ? { uiLocale: saved.uiLocale } : {}),
      });
      setIsEditing(false);
      toast.success(t('toast.saved'));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('errors.save'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(profileData);
  };

  const handleAvatarUpdated = (updated: UserProfile) => {
    setProfileData((prev) => ({
      ...prev,
      avatarUrl: updated.avatarUrl,
    }));
    updateUser({ avatarUrl: updated.avatarUrl });
  };

  const handleLocaleChange = (uiLocale: UiLocale) => {
    setProfileData(prev => ({ ...prev, uiLocale }));
    setEditData((prev) => ({ ...prev, uiLocale }));
    setUiLocale(uiLocale);
  };

  const topicsList            = preferenceOptions?.topics          || DEFAULT_TOPICS;
  const languagesList         = preferenceOptions?.languages       || ['Português', 'Inglês', 'Espanhol'];
  const materialLevelsList    = preferenceOptions?.materialLevels  || ['Introdutório', 'Intermediário', 'Avançado'];
  const educationLevelsList   = preferenceOptions?.educationLevels || ['Graduação', 'Especialização', 'Mestrado', 'Doutorado'];
  const academicGoalsList     = preferenceOptions?.academicGoals   || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-h-[calc(100vh-68px)] animate-fadeIn">
      <div className="flex flex-col gap-4 mb-6 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          icon={Settings}
          title={t('header.title')}
          subtitle={t('header.subtitle')}
          className="mb-0"
        />
        {!isEditing && (
          <div className="flex w-full flex-row items-center justify-between gap-3 sm:w-auto sm:justify-end sm:mt-1">
            <LanguageToggle onChange={handleLocaleChange} />
            <Button
              onClick={() => setIsEditing(true)}
              className="h-11 px-5 py-0 text-sm leading-none sm:h-auto sm:px-6 sm:py-2.5 sm:text-base sm:leading-normal"
            >
              <Pencil className="w-4 h-4" /> {t('header.edit')}
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <ProfileHeaderCard
          name={profileData.name}
          email={profileData.email}
          avatarUrl={profileData.avatarUrl}
          hasCompletedOnboarding={profileData.hasCompletedOnboarding}
          onAvatarChangeRequest={() => setIsAvatarModalOpen(true)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PersonalInfoCard
            isEditing={isEditing}
            name={profileData.name}
            email={profileData.email}
            editName={editData.name || ''}
            onChangeName={(v) => handleChange('name', v)}
          />
          <AcademicProfileCard
            isEditing={isEditing}
            data={{
              course: profileData.course,
              educationLevel: profileData.educationLevel,
              mainArea: profileData.mainArea,
              academicGoal: profileData.academicGoal,
            }}
            editData={{
              course: editData.course || '',
              educationLevel: editData.educationLevel || '',
              mainArea: editData.mainArea || '',
              academicGoal: editData.academicGoal || '',
            }}
            onChange={handleTextChange}
            topicsList={topicsList}
            educationLevelsList={educationLevelsList}
            academicGoalsList={academicGoalsList}
          />
        </div>

        <InterestAreasCard
          isEditing={isEditing}
          topicsList={topicsList}
          selectedIds={(isEditing ? editData.interests : profileData.interests) || []}
          onToggle={toggleInterest}
        />

        <ContentPreferencesCard
          isEditing={isEditing}
          data={profileData}
          editData={editData}
          onArrayChange={handleArrayChange}
          onBoolChange={(field, value) => handleChange(field, value)}
          languagesList={languagesList}
          materialLevelsList={materialLevelsList}
        />

        {isEditing && (
          <EditActionBar
            isSaving={isSaving}
            onCancel={handleCancel}
            onSave={handleSave}
          />
        )}
      </div>

      <AvatarUploadModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        userName={profileData.name || ''}
        currentAvatarUrl={profileData.avatarUrl}
        onAvatarUpdated={handleAvatarUpdated}
      />
    </div>
  );
};
