import React from 'react';
import { useI18n } from '../../hooks/useI18n';
import { SettingsCard } from './Shared';
import { usePlan } from '../../context/PlanContext';
import { useCredits } from '../../hooks/useCredits';
import type { PlanName } from '../../types';

interface BillingSettingsProps {
    openPlanModal: () => void;
}

const BillingSettings: React.FC<BillingSettingsProps> = ({ openPlanModal }) => {
    const { t } = useI18n();
    const { plan } = usePlan();
    const { credits } = useCredits();

    const planDetails: Record<PlanName, { totalCredits: number }> = {
        Free: { totalCredits: 10 },
        Basic: { totalCredits: 50 },
        Standard: { totalCredits: 150 },
        Premium: { totalCredits: 400 },
    };

    const currentPlanDetails = planDetails[plan];
    const totalCredits = currentPlanDetails.totalCredits;
    const usagePercentage = totalCredits > 0 ? (credits / totalCredits) * 100 : 0;


    const invoices = [
        { id: 'INV-123', date: '1 de Julio, 2024', amount: '€0.00', status: 'Pagado' },
        { id: 'INV-122', date: '1 de Junio, 2024', amount: '€0.00', status: 'Pagado' },
    ];

    return (
        <>
            <SettingsCard
                title={t('settings.billing.plan.title')}
            >
                <div className="p-6 my-5 bg-blue-50 dark:bg-blue-900/50 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="sm:flex sm:items-start sm:justify-between">
                        <div>
                            <h4 className="text-lg font-bold text-kolink-text dark:text-white">{t('settings.billing.plan.currentPlan')} <span className="text-sm font-medium text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-full">{plan}</span></h4>
                            <p className="text-sm text-kolink-text-secondary dark:text-blue-200 mt-1">{t('settings.billing.plan.description', { planName: plan })}</p>
                        </div>
                        <button 
                            onClick={openPlanModal}
                            className="flex-shrink-0 mt-3 sm:mt-0 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 rounded-md bg-kolink-blue hover:bg-blue-700">
                            {t('settings.billing.plan.manageButton')}
                        </button>
                    </div>
                    <div className="mt-4">
                         <div className="flex justify-between mb-1 text-sm font-medium text-kolink-text-secondary dark:text-blue-100">
                            <span>{t('settings.billing.plan.usage')}</span>
                            <span>{credits} / {totalCredits} {t('settings.billing.plan.credits')}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div className="bg-kolink-blue h-2.5 rounded-full" style={{width: `${usagePercentage}%`}}></div>
                        </div>
                    </div>
                </div>
            </SettingsCard>
            
            <div className="mt-10">
                <SettingsCard title={t('settings.billing.payment.title')}>
                    <div className="py-5">
                       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <img src="https://www.gstatic.com/images/icons/material/system_gm/2x/credit_card_black_24dp.png" alt="Credit card" className="w-10 h-auto p-1 bg-gray-100 border rounded-md" />
                                <div>
                                    <p className="font-semibold text-kolink-text dark:text-white">{t('settings.billing.payment.method')} <span className="font-mono">•••• 4242</span></p>
                                    <p className="text-xs text-kolink-text-secondary dark:text-gray-400">{t('settings.billing.payment.expires')} 08/2026</p>
                                </div>
                            </div>
                            <button className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 w-full sm:w-auto">
                                {t('settings.billing.payment.updateButton')}
                            </button>
                        </div>
                    </div>
                </SettingsCard>
            </div>

            <div className="mt-10">
                <SettingsCard title={t('settings.billing.history.title')}>
                    <div className="flow-root">
                        <div className="-mx-6 -my-2 overflow-x-auto sm:-mx-8">
                            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead>
                                        <tr>
                                            <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-kolink-text dark:text-white sm:pl-0">Factura</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-kolink-text dark:text-white">Fecha</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-kolink-text dark:text-white">Estado</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-kolink-text dark:text-white">Importe</th>
                                            <th scope="col" className="relative py-3.5 pl-3 pr-6 sm:pr-0"><span className="sr-only">Descargar</span></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                        {invoices.map((invoice) => (
                                            <tr key={invoice.id}>
                                                <td className="py-4 pl-6 pr-3 text-sm font-medium text-kolink-text dark:text-white sm:pl-0">{invoice.id}</td>
                                                <td className="px-3 py-4 text-sm text-kolink-text-secondary dark:text-gray-400">{invoice.date}</td>
                                                <td className="px-3 py-4 text-sm text-kolink-text-secondary dark:text-gray-400"><span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-300">{invoice.status}</span></td>
                                                <td className="px-3 py-4 text-sm text-kolink-text-secondary dark:text-gray-400">{invoice.amount}</td>
                                                <td className="relative py-4 pl-3 pr-6 text-sm font-medium text-right sm:pr-0"><a href="#" className="text-kolink-blue hover:text-blue-700">Descargar<span className="sr-only">, {invoice.id}</span></a></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </SettingsCard>
            </div>
        </>
    );
};

export default BillingSettings;