import React, { useState } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { SettingsCard } from './Shared';
import { useToast } from '../../hooks/useToast';

const ApiSettings: React.FC = () => {
    const { t } = useI18n();
    const { showToast } = useToast();
    
    const [apiKeys, setApiKeys] = useState([
        {
            key: "kolink_sk_••••••••••••••••••••1234",
            created: "1 de Julio, 2024",
            lastUsed: "3 de Julio, 2024"
        }
    ]);

    const handleCopy = (key: string) => {
        navigator.clipboard.writeText("kolink_sk_live_123abc456def789ghi"); // Simulate copying the real key
        showToast(t('settings.api.copySuccess'), 'success');
    }
    
    const handleCreateKey = () => {
        showToast(t('settings.api.createSuccess'), 'success');
    }
    
    const handleRegenerate = () => {
        if (confirm(t('settings.api.regenerateConfirm'))) {
            showToast(t('settings.api.regenerateSuccess'), 'info');
        }
    }

    return (
        <SettingsCard
            title={t('settings.api.title')}
            description={t('settings.api.description')}
        >
            <div className="flex justify-end py-5">
                 <button 
                    onClick={handleCreateKey}
                    className="px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 rounded-md bg-kolink-blue hover:bg-blue-700">
                    {t('settings.api.createNewKey')}
                </button>
            </div>
             <div className="flow-root">
                <div className="-mx-6 -my-2 overflow-x-auto sm:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead>
                                <tr>
                                    <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-kolink-text dark:text-white sm:pl-0">{t('settings.api.table.key')}</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-kolink-text dark:text-white">{t('settings.api.table.created')}</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-kolink-text dark:text-white">{t('settings.api.table.lastUsed')}</th>
                                    <th scope="col" className="relative py-3.5 pl-3 pr-6 sm:pr-0"><span className="sr-only">Acciones</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                {apiKeys.map((apiKey) => (
                                    <tr key={apiKey.key}>
                                        <td className="py-4 pl-6 pr-3 text-sm font-mono text-kolink-text dark:text-white sm:pl-0">{apiKey.key}</td>
                                        <td className="px-3 py-4 text-sm text-kolink-text-secondary dark:text-gray-400">{apiKey.created}</td>
                                        <td className="px-3 py-4 text-sm text-kolink-text-secondary dark:text-gray-400">{apiKey.lastUsed}</td>
                                        <td className="relative py-4 pl-3 pr-6 text-sm font-medium text-right sm:pr-0">
                                            <div className="flex items-center justify-end gap-4">
                                                <button onClick={() => handleCopy(apiKey.key)} className="text-kolink-blue hover:text-blue-700">{t('settings.api.copy')}</button>
                                                <button onClick={handleRegenerate} className="text-kolink-blue hover:text-blue-700">{t('settings.api.regenerate')}</button>
                                                <button className="text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400">{t('settings.api.delete')}</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </SettingsCard>
    );
};

export default ApiSettings;