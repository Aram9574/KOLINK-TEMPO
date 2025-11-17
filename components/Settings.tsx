import React, { useState, useEffect } from 'react';
import { useI18n } from '../hooks/useI18n';
import type { User, SettingsTab } from '../types';
import ProfileSettings from './settings/ProfileSettings';
import GeneralSettings from './settings/GeneralSettings';
import NotificationsSettings from './settings/NotificationsSettings';
import BillingSettings from './settings/BillingSettings';
import IntegrationsSettings from './settings/IntegrationsSettings';
import SecuritySettings from './settings/SecuritySettings';
import PersonalizationSettings from './settings/PersonalizationSettings';

interface SettingsProps {
    user: User;
    openPlanModal: () => void;
    initialTab?: SettingsTab;
}

const Settings: React.FC<SettingsProps> = ({ user, openPlanModal, initialTab }) => {
    const { t } = useI18n();
    const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab || 'general');

    useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab);
        }
    }, [initialTab]);
    
    const tabs: { id: SettingsTab; label: string; icon: React.ReactElement }[] = [
        { id: 'general', label: t('settings.tabs.general'), icon: <Cog6ToothIcon /> },
        { id: 'notifications', label: t('settings.tabs.notifications'), icon: <BellIcon /> },
        { id: 'personalization', label: t('settings.tabs.personalization'), icon: <PaintBrushIcon /> },
        { id: 'integrations', label: t('settings.tabs.integrations'), icon: <PuzzlePieceIcon /> },
        { id: 'security', label: t('settings.tabs.security'), icon: <ShieldCheckIcon /> },
        { id: 'profile', label: t('settings.tabs.profile'), icon: <UserCircleIcon /> },
        { id: 'billing', label: t('settings.tabs.billing'), icon: <CreditCardIcon /> },
    ];
    
    const renderContent = () => {
        switch (activeTab) {
            case 'profile': return <ProfileSettings user={user} />;
            case 'security': return <SecuritySettings />;
            case 'general': return <GeneralSettings />;
            case 'notifications': return <NotificationsSettings />;
            case 'billing': return <BillingSettings openPlanModal={openPlanModal} />;
            case 'integrations': return <IntegrationsSettings />;
            case 'personalization': return <PersonalizationSettings user={user} />;
            default: return <GeneralSettings />;
        }
    };
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-kolink-text dark:text-white">{t('settings.title')}</h1>
            <p className="mt-1 text-kolink-text-secondary dark:text-gray-400">{t('settings.subtitle')}</p>

            <div className="flex flex-col md:flex-row gap-8 mt-8">
                <aside className="md:w-1/4 lg:w-1/5">
                    <nav className="flex flex-col space-y-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                    activeTab === tab.id
                                        ? 'bg-kolink-blue text-white'
                                        : 'text-kolink-text-secondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            >
                                {/* FIX: Explicitly specify the props type for React.cloneElement to resolve typing error. */}
                                {React.cloneElement<React.SVGProps<SVGSVGElement>>(tab.icon, { className: 'w-5 h-5 mr-3 flex-shrink-0' })}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </aside>
                <main className="flex-1">
                    <div className="p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

// Icons
const UserCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>);
const Cog6ToothIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.438.995s.145.755.438.995l1.003.827c.48.398.668 1.03.26 1.431l-1.296 2.247a1.125 1.125 0 0 1-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 0 1-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 0 1-1.37-.49l-1.296-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.437-.995s-.145-.755-.437-.995l-1.004-.827a1.125 1.125 0 0 1-.26-1.431l1.296-2.247a1.125 1.125 0 0 1 1.37-.49l1.217.456c.355.133.75.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.213-1.28Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>);
const BellIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>);
const CreditCardIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15A2.25 2.25 0 0 0 2.25 6.75v10.5A2.25 2.25 0 0 0 4.5 19.5Z" /></svg>);
const PuzzlePieceIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.5 4.5 3.75 3.75-3.75 3.75m-9-3.75L3 12l3.75 3.75m1.5-15L12 3l1.5 1.5m-3 15L12 21l1.5-1.5m-9-3.75h21" /></svg>);
const ShieldCheckIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" /></svg>);
const PaintBrushIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.475 2.118 2.25 2.25 0 0 1-2.475-2.118c0-.496.167-.962.474-1.355a4.5 4.5 0 0 1 1.07-1.07c.393-.307.859-.474 1.355-.474.496 0 .962.167 1.355.474a4.5 4.5 0 0 1 1.07 1.07c.307.393.474.859.474 1.355a3 3 0 0 0 5.78-1.128Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.75a3 3 0 0 0-3 3v4.5a3 3 0 0 0 3 3h4.5a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-4.5Z" /></svg>);

export default Settings;
