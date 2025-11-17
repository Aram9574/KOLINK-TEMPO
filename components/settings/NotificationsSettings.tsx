import React, { useState } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { SettingsCard, FormRow, Toggle } from './Shared';

const NotificationsSettings: React.FC = () => {
    const { t } = useI18n();
    const [notifications, setNotifications] = useState({
        digest: true,
        news: true,
        confirm: false,
        likes: true,
        comments: true,
        milestones: false,
    });

    const handleChange = (key: keyof typeof notifications, value: boolean) => {
        setNotifications(prev => ({ ...prev, [key]: value }));
        // In a real app, you would save this preference.
    };

    return (
        <SettingsCard
            title={t('settings.notifications.title')}
            description={t('settings.notifications.description')}
        >
             <h3 className="text-sm font-semibold text-kolink-text dark:text-white pt-5">{t('settings.notifications.email.title')}</h3>
            <FormRow 
                label={t('settings.notifications.digest.label')}
                description={t('settings.notifications.digest.description')}
            >
                <Toggle id="digest" checked={notifications.digest} onChange={(v) => handleChange('digest', v)} />
            </FormRow>
             <FormRow 
                label={t('settings.notifications.news.label')}
                description={t('settings.notifications.news.description')}
            >
                <Toggle id="news" checked={notifications.news} onChange={(v) => handleChange('news', v)} />
            </FormRow>
             <FormRow 
                label={t('settings.notifications.confirm.label')}
                description={t('settings.notifications.confirm.description')}
            >
                <Toggle id="confirm" checked={notifications.confirm} onChange={(v) => handleChange('confirm', v)} />
            </FormRow>
            
            <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-kolink-text dark:text-white">{t('settings.notifications.activity.title')}</h3>
                <FormRow 
                    label={t('settings.notifications.likes.label')}
                    description={t('settings.notifications.likes.description')}
                >
                    <Toggle id="likes" checked={notifications.likes} onChange={(v) => handleChange('likes', v)} />
                </FormRow>
                 <FormRow 
                    label={t('settings.notifications.comments.label')}
                    description={t('settings.notifications.comments.description')}
                >
                    <Toggle id="comments" checked={notifications.comments} onChange={(v) => handleChange('comments', v)} />
                </FormRow>
                 <FormRow 
                    label={t('settings.notifications.milestones.label')}
                    description={t('settings.notifications.milestones.description')}
                >
                    <Toggle id="milestones" checked={notifications.milestones} onChange={(v) => handleChange('milestones', v)} />
                </FormRow>
            </div>


        </SettingsCard>
    );
};

export default NotificationsSettings;
