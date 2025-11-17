import React, { useState } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { SettingsCard, FormRow, FormInput, Toggle } from './Shared';
import { useToast } from '../../hooks/useToast';

const SecuritySettings: React.FC = () => {
    const { t } = useI18n();
    const { showToast } = useToast();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);

    const handleSavePassword = () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            showToast(t('settings.security.password.error.allFields'), 'error');
            return;
        }
        if (newPassword !== confirmPassword) {
            showToast(t('settings.security.password.error.noMatch'), 'error');
            return;
        }
        setIsSaving(true);
        setTimeout(() => {
            // Simulate API call
            showToast(t('settings.security.password.success'), 'success');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setIsSaving(false);
        }, 1500);
    };

    return (
        <SettingsCard
            title={t('settings.security.title')}
            description={t('settings.security.description')}
        >
            {/* Change Password Section */}
            <div>
                <h3 className="text-sm font-semibold text-kolink-text dark:text-white pt-5">{t('settings.security.password.title')}</h3>
                <FormRow label={t('settings.security.password.current')} htmlFor="currentPassword">
                    <FormInput type="password" id="currentPassword" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="max-w-sm" />
                </FormRow>
                <FormRow label={t('settings.security.password.new')} htmlFor="newPassword">
                    <FormInput type="password" id="newPassword" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="max-w-sm" />
                </FormRow>
                <FormRow label={t('settings.security.password.confirm')} htmlFor="confirmPassword">
                    <FormInput type="password" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="max-w-sm" />
                </FormRow>
                 <div className="flex justify-end pt-5 mt-5 border-t border-gray-200 dark:border-gray-700">
                     <button
                        onClick={handleSavePassword}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 rounded-md bg-kolink-blue hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                    >
                        {isSaving ? t('settings.saving') : t('settings.security.password.save')}
                    </button>
                </div>
            </div>

            {/* Two-Factor Authentication Section */}
            <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-kolink-text dark:text-white">{t('settings.security.twoFactor.title')}</h3>
                <p className="mt-1 text-sm text-kolink-text-secondary dark:text-gray-400">{t('settings.security.twoFactor.description')}</p>
                <FormRow label={t('settings.security.twoFactor.label')}>
                    <Toggle id="2fa-toggle" checked={isTwoFactorEnabled} onChange={setIsTwoFactorEnabled} />
                </FormRow>
            </div>
        </SettingsCard>
    );
};

export default SecuritySettings;