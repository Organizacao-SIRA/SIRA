import React, { useEffect, useState } from 'react';
import { Pencil, Settings } from 'lucide-react';
import { updateProfile, getPreferenceOptions } from '../services/api';
import type { PreferenceTopic, PreferenceOptions, UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { ProfileHeaderCard } from '../components/profile/ProfileHeaderCard';
import { PersonalInfoCard } from '../components/profile/PersonalInfoCard';
import { AcademicProfileCard } from '../components/profile/AcademicProfileCard';
import { InterestAreasCard } from '../components/profile/InterestAreasCard';
import { ContentPreferencesCard } from '../components/profile/ContentPreferencesCard';
import { EditActionBar } from '../components/profile/EditActionBar';
import { AvatarUploadModal } from '../components/profile/AvatarUploadModal';

interface ProfileProps {
  profileData: any;
  setProfileData: (data: any) => void;
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

export const Profile = ({ profileData, setProfileData }: ProfileProps) => {
  const { updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(profileData || {});
  const [preferenceOptions, setPreferenceOptions] = useState<PreferenceOptions | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  useEffect(() => {
    if (profileData) setEditData(profileData);
  }, [profileData]);

  useEffect(() => {
    if (isEditing && !preferenceOptions) {
      getPreferenceOptions().then(setPreferenceOptions).catch(() => {});
    }
  }, [isEditing, preferenceOptions]);

  if (!profileData) {
    return (
      <div className="p-20 text-center font-bold text-primary-dark dark:text-text">
        Carregando perfil...
      </div>
    );
  }

  const handleChange = (field: string, value: any) => {
    setEditData((prev: any) => ({ ...prev, [field]: value }));
  };

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
    setSaveError('');
    try {
      const payload = {
        name: editData.name,
        course: editData.course,
        educationLevel: editData.educationLevel,
        mainArea: editData.mainArea,
        subAreas: editData.subAreas,
        languages: editData.languages,
        materialLevels: editData.materialLevels,
        wantsBooks: editData.wantsBooks,
        wantsArticles: editData.wantsArticles,
        interests: editData.interests,
        academicGoal: editData.academicGoal,
      };
      const saved = await updateProfile(payload);
      setProfileData((prev: any) => ({ ...prev, ...saved }));
      updateUser({ name: saved.name });
      setIsEditing(false);
    } catch (err: any) {
      setSaveError(err.message || 'Erro ao salvar perfil. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSaveError('');
    setEditData(profileData);
  };

  const handleAvatarUpdated = (updated: UserProfile) => {
    setProfileData((prev: any) => ({ ...prev, ...updated }));
    updateUser({ avatarUrl: updated.avatarUrl });
  };

  const topicsList            = preferenceOptions?.topics          || DEFAULT_TOPICS;
  const languagesList         = preferenceOptions?.languages       || ['Português', 'Inglês', 'Espanhol'];
  const materialLevelsList    = preferenceOptions?.materialLevels  || ['Introdutório', 'Intermediário', 'Avançado'];
  const educationLevelsList   = preferenceOptions?.educationLevels || ['Graduação', 'Especialização', 'Mestrado', 'Doutorado'];
  const academicGoalsList     = preferenceOptions?.academicGoals   || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-[calc(100vh-68px)] animate-fadeIn">
      <div className="flex items-start justify-between mb-8 gap-4">
        <PageHeader
          icon={Settings}
          title="Meu Perfil"
          subtitle="Gerencie suas informações e preferências."
        />
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="mt-1">
            <Pencil className="w-4 h-4" /> Editar Perfil
          </Button>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            onChange={handleChange}
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
            error={saveError}
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
