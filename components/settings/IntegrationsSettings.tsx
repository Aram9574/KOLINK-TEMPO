import React from 'react';
import { useI18n } from '../../hooks/useI18n';
import { SettingsCard } from './Shared';


const IntegrationItem: React.FC<{ name: string, status: 'connected' | 'available' | 'soon', icon: React.ReactElement }> = ({ name, status, icon }) => {
    const { t } = useI18n();

    const renderButton = () => {
        switch (status) {
            case 'connected':
                return <button className="px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-900 w-full sm:w-auto">{t('settings.integrations.disconnect')}</button>;
            case 'available':
                return <button className="px-4 py-2 text-sm font-medium text-kolink-blue bg-blue-100 rounded-md hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900 w-full sm:w-auto">{t('settings.integrations.connect')}</button>;
            case 'soon':
                 return <button disabled className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-md cursor-not-allowed dark:bg-gray-700 dark:text-gray-400 w-full sm:w-auto">{t('settings.integrations.comingSoon')}</button>;
        }
    };
    
    return (
        <div className="py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    {icon}
                    <div>
                        <p className="font-semibold text-kolink-text dark:text-white">{name}</p>
                        {status === 'connected' && <p className="text-xs text-green-600 dark:text-green-400 font-medium">{t('settings.integrations.connected')}</p>}
                    </div>
                </div>
                {renderButton()}
            </div>
        </div>
    )
}

const IntegrationsSettings: React.FC = () => {
    const { t } = useI18n();

    // FIX: Explicitly type the integrations array to ensure the status property is not widened to a generic 'string'.
    const integrations: { name: string, status: 'connected' | 'available' | 'soon', icon: React.ReactElement }[] = [
        { name: 'LinkedIn', status: 'connected', icon: <LinkedInIcon /> },
        { name: 'X (Twitter)', status: 'available', icon: <XIcon /> },
        { name: 'Instagram', status: 'soon', icon: <InstagramIcon /> },
        { name: 'Facebook Pages', status: 'soon', icon: <FacebookIcon /> },
    ];

    return (
        <SettingsCard
            title={t('settings.integrations.title')}
            description={t('settings.integrations.description')}
        >
            {integrations.map(int => <IntegrationItem key={int.name} {...int} />)}
        </SettingsCard>
    );
};

// Icons for integrations
const LinkedInIcon = () => (
    <div className="flex items-center justify-center w-10 h-10 bg-[#0077B5] rounded-lg text-white">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" /></svg>
    </div>
);
const XIcon = () => (
    <div className="flex items-center justify-center w-10 h-10 bg-black rounded-lg text-white">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 16 16"><path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-1.78 13h2.683L4.032 2.155H1.25l9.572 11.595Z"/></svg>
    </div>
);
const InstagramIcon = () => (
     <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600 rounded-lg text-white">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
    </div>
)
const FacebookIcon = () => (
    <div className="flex items-center justify-center w-10 h-10 bg-[#1877F2] rounded-lg text-white">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/></svg>
    </div>
)


export default IntegrationsSettings;
