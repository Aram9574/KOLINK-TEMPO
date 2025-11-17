import React from 'react';
import { useI18n } from '../../hooks/useI18n';
import { useCredits } from '../../hooks/useCredits';
import { useToast } from '../../hooks/useToast';
import { usePlan } from '../../context/PlanContext';
import type { PlanName } from '../../types';

interface PlanSelectionModalProps {
    onClose: () => void;
}

const PlanSelectionModal: React.FC<PlanSelectionModalProps> = ({ onClose }) => {
    const { t } = useI18n();
    const { setCredits } = useCredits();
    const { showToast } = useToast();
    const { setPlan } = usePlan();

    const plans = [
        {
            key: 'Basic' as PlanName,
            name: t('settings.billing.plan.modal.plans.basic.name'),
            price: t('settings.billing.plan.modal.plans.basic.price'),
            description: t('settings.billing.plan.modal.plans.basic.description'),
            features: t('settings.billing.plan.modal.plans.basic.features') as unknown as string[],
            popular: false,
            creditAmount: 50,
        },
        {
            key: 'Standard' as PlanName,
            name: t('settings.billing.plan.modal.plans.standard.name'),
            price: t('settings.billing.plan.modal.plans.standard.price'),
            description: t('settings.billing.plan.modal.plans.standard.description'),
            features: t('settings.billing.plan.modal.plans.standard.features') as unknown as string[],
            popular: true,
            creditAmount: 150,
        },
        {
            key: 'Premium' as PlanName,
            name: t('settings.billing.plan.modal.plans.premium.name'),
            price: t('settings.billing.plan.modal.plans.premium.price'),
            description: t('settings.billing.plan.modal.plans.premium.description'),
            features: t('settings.billing.plan.modal.plans.premium.features') as unknown as string[],
            popular: false,
            creditAmount: 400,
        },
    ];

    const handleSelectPlan = (planKey: PlanName, creditAmount: number) => {
        setPlan(planKey);
        setCredits(creditAmount);
        showToast(t('settings.billing.plan.updateSuccess'), 'success');
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl p-8 m-4 relative"
                onClick={e => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 p-1 text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    aria-label="Close modal"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>

                <div className="text-center">
                    <h2 className="text-3xl font-bold text-kolink-text dark:text-white">{t('settings.billing.plan.modal.title')}</h2>
                    <p className="mt-2 text-kolink-text-secondary dark:text-gray-400">{t('settings.billing.plan.modal.subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                    {plans.map((plan) => (
                        <div 
                            key={plan.name}
                            className={`relative p-6 rounded-2xl border flex flex-col ${
                                plan.popular 
                                ? 'border-kolink-blue border-2' 
                                : 'border-gray-200 dark:border-gray-700'
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 text-sm font-semibold text-white bg-kolink-blue rounded-full">
                                    {t('settings.billing.plan.modal.mostPopular')}
                                </div>
                            )}
                            <div className="flex-grow">
                                <h3 className="text-xl font-bold text-kolink-text dark:text-white">{plan.name}</h3>
                                <p className="mt-2 text-4xl font-bold text-kolink-text dark:text-white">
                                    {plan.price}
                                    <span className="text-base font-normal text-kolink-text-secondary dark:text-gray-400">{t('settings.billing.plan.modal.plans.basic.period')}</span>
                                </p>
                                <p className="mt-4 text-sm text-kolink-text-secondary dark:text-gray-400">{plan.description}</p>
                                
                                <ul className="mt-6 space-y-3">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-start text-sm text-kolink-text dark:text-gray-300">
                                            <CheckIcon className="w-5 h-5 text-kolink-blue mr-2 flex-shrink-0 mt-0.5" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                onClick={() => handleSelectPlan(plan.key, plan.creditAmount)}
                                className={`w-full mt-8 py-3 font-semibold rounded-lg transition-colors ${
                                    plan.popular
                                    ? 'bg-kolink-blue text-white hover:bg-blue-700'
                                    : 'bg-white dark:bg-gray-800 border border-kolink-blue text-kolink-blue hover:bg-kolink-blue-light dark:hover:bg-blue-900/50'
                                }`}
                            >
                                {t('settings.billing.plan.modal.selectButton')}
                            </button>
                        </div>
                    ))}
                </div>
                <p className="mt-8 text-center text-sm text-kolink-text-secondary dark:text-gray-400">
                    {t('settings.billing.plan.modal.footer')}
                </p>
            </div>
        </div>
    );
};


const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>);
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>);


export default PlanSelectionModal;