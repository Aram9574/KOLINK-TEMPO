import React, { useState } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { SettingsCard, FormRow, FormInput } from './Shared';
import type { User } from '../../types';
import { useToast } from '../../hooks/useToast';

interface ProfileSettingsProps {
    user: User;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user }) => {
    const { t } = useI18n();
    const { showToast } = useToast();
    const [name, setName] = useState(user.name);
    const [headline, setHeadline] = useState(user.headline || '');
    const [bio, setBio] = useState('Especialista en contenido IA en Kolink, ayudando a empresas a crecer su presencia online con estrategias de contenido basadas en datos.');
    const [website, setWebsite] = useState('https://kolink.es');
    // FIX: Storing twitter handle without the '@' to prevent duplication with the UI element.
    const [twitter, setTwitter] = useState('kolink_es');

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            // In a real app, you would make an API call here.
            // The value to save would be `@${twitter}`
            showToast(t('settings.profile.saveSuccess'), 'success');
            setIsSaving(false);
        }, 1000);
    };

    const handleTwitterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Automatically remove the '@' symbol if the user types or pastes it.
        setTwitter(e.target.value.replace(/^@/, ''));
    };

    return (
        <SettingsCard
            title={t('settings.tabs.profile')}
            description={t('settings.profile.description')}
            footer={
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 rounded-md bg-kolink-blue hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                    {isSaving ? t('settings.saving') : t('settings.saveChanges')}
                </button>
            }
        >
            <FormRow label={t('settings.profile.photo')}>
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center font-bold text-2xl text-blue-800">
                        {user.avatar}
                    </div>
                    <button className="px-3 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">{t('settings.profile.changePhoto')}</button>
                </div>
            </FormRow>
            <FormRow label={t('settings.profile.fullName')} htmlFor="fullName">
                <FormInput type="text" id="fullName" value={name} onChange={e => setName(e.target.value)} className="max-w-sm" />
            </FormRow>
            <FormRow label={t('settings.profile.headline')} htmlFor="headline">
                <FormInput type="text" id="headline" value={headline} onChange={e => setHeadline(e.target.value)} className="max-w-sm" />
            </FormRow>
            <FormRow label={t('settings.profile.email')}>
                <p className="text-sm text-kolink-text-secondary dark:text-gray-400 pt-2">{user.email}</p>
            </FormRow>
            <FormRow label={t('settings.profile.bio')} htmlFor="bio">
                <textarea 
                    id="bio" 
                    value={bio} 
                    onChange={e => setBio(e.target.value)}
                    rows={4}
                    className="block w-full max-w-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-kolink-text dark:text-gray-200 shadow-sm focus:border-kolink-blue focus:ring-kolink-blue sm:text-sm p-2"
                />
            </FormRow>
            <FormRow label={t('settings.profile.website')} htmlFor="website">
                <FormInput type="url" id="website" value={website} onChange={e => setWebsite(e.target.value)} className="max-w-sm" placeholder="https://..." />
            </FormRow>
            <FormRow label={t('settings.profile.twitter')} htmlFor="twitter">
                <div className="relative max-w-sm">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-kolink-text-secondary dark:text-gray-400">@</span>
                    <FormInput type="text" id="twitter" value={twitter} onChange={handleTwitterChange} className="pl-7" placeholder="usuario" />
                </div>
            </FormRow>

        </SettingsCard>
    );
};

export default ProfileSettings;