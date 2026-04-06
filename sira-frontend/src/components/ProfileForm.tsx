import React from 'react';
import { User, GraduationCap, Settings } from 'lucide-react';

interface ProfileFormProps {
  isEditing: boolean;
  profileData: any;
  editData: any;
  setEditData: (data: any) => void;
}

export const ProfileForm = ({ isEditing, profileData, editData, setEditData }: ProfileFormProps) => {
  const handleChange = (field: string, value: any) => {
    setEditData({ ...editData, [field]: value });
  };

  const handleCheckboxArray = (field: string, value: string, checked: boolean) => {
    const currentArray = editData[field] || [];
    const updated = checked 
      ? [...currentArray, value] 
      : currentArray.filter((item: string) => item !== value);
    handleChange(field, updated);
  };

  const data = isEditing ? editData : profileData;

  return (
    <div className="space-y-6 pb-10">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2 bg-gray-50/50">
          <User className="w-5 h-5 text-[#1351B4]" />
          <h3 className="text-lg font-bold text-[#003157]">Dados Pessoais</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          {[{ label: 'Nome', field: 'name' }, { label: 'E-mail', field: 'email' }, { label: 'Instituição', field: 'institution' }, { label: 'Curso', field: 'course' }].map((item) => (
            <div key={item.field}>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">{item.label}</label>
              {isEditing ? (
                <input type="text" value={data[item.field] || ''} onChange={(e) => handleChange(item.field, e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-[#1351B4]" />
              ) : (
                <p className="text-gray-900 font-semibold">{data[item.field]}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2 bg-gray-50/50">
          <GraduationCap className="w-5 h-5 text-[#1351B4]" />
          <h3 className="text-lg font-bold text-[#003157]">Perfil Acadêmico</h3>
        </div>
        <div className="p-6 space-y-4 text-sm">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Área Principal</label>
            {isEditing ? (
              <input type="text" value={data.mainArea || ''} onChange={(e) => handleChange('mainArea', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none" />
            ) : (
              <p className="text-gray-900 font-bold text-lg">{data.mainArea}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2 bg-gray-50/50">
          <Settings className="w-5 h-5 text-[#1351B4]" />
          <h3 className="text-lg font-bold text-[#003157]">Preferências</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div className="space-y-3">
            <span className="text-gray-500 font-bold block mb-2">Idiomas:</span>
            {['Português', 'Inglês', 'Espanhol'].map(lang => (
              <label key={lang} className="flex items-center gap-2">
                <input type="checkbox" checked={data.languages?.includes(lang) || false} disabled={!isEditing} onChange={(e) => handleCheckboxArray('languages', lang, e.target.checked)} className="rounded text-[#1351B4]" />
                <span className="text-gray-700">{lang}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};