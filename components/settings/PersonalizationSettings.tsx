

import React, { useState, useEffect } from 'react';
import { useI18n } from '../../hooks/useI18n';
import type { InspirationPost, User, UserIdentity } from '../../types';
import { SettingsCard, FormRow, Toggle, FormInput } from './Shared';
import { usePersonalization } from '../../hooks/usePersonalization';
import { useInspiration } from '../../hooks/useInspiration';
import Tooltip from '../Tooltip';
import { useToast } from '../../hooks/useToast';

interface PersonalizationSettingsProps {
    user: User;
}

const PersonalizationSettings: React.FC<PersonalizationSettingsProps> = ({ user }) => {
    const { t } = useI18n();
    const { identity, setIdentity } = usePersonalization();
    const { showToast } = useToast();
    
    // Local form state to avoid updating context on every keystroke
    const [formState, setFormState] = useState<UserIdentity>(identity);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFormState(identity);
    }, [identity]);

    const handleInputChange = (field: keyof UserIdentity, value: string) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveIdentity = () => {
        setIsSaving(true);
        setIdentity(formState);
        setTimeout(() => {
            showToast(t('settings.personalization.saveSuccess'), 'success');
            setIsSaving(false);
        }, 1000);
    };
    
    const CardTitleWithTooltip: React.FC<{title: string; tooltip: string}> = ({ title, tooltip }) => (
        <div className="flex items-center gap-2">
            <span>{title}</span>
             <Tooltip text={tooltip}>
                <InformationCircleIcon className="w-5 h-5 text-gray-400" />
            </Tooltip>
        </div>
    );

    return (
        <div>
            <div className="space-y-10 pb-20">
                {/* Card 1: Content Identity */}
                <SettingsCard
                    title={<CardTitleWithTooltip title={t('settings.personalization.contentIdentity.title')} tooltip={t('settings.personalization.contentIdentity.tooltip')} />}
                    description={t('settings.personalization.contentIdentity.description')}
                >
                    {/* Custom instructions section */}
                    <div className="py-5">
                        <label htmlFor="custom-instructions" className="text-sm font-medium text-kolink-text dark:text-gray-300">{t('settings.personalization.contentIdentity.instructionsLabel')}</label>
                        <textarea 
                            id="custom-instructions" 
                            value={formState.customInstructions} 
                            onChange={e => handleInputChange('customInstructions', e.target.value)}
                            rows={4}
                            placeholder={t('settings.personalization.contentIdentity.instructionsPlaceholder')}
                            className="block w-full mt-2 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-kolink-text dark:text-gray-200 shadow-sm focus:border-kolink-blue focus:ring-kolink-blue sm:text-sm p-2"
                        />
                    </div>

                    {/* About you section */}
                    <div className="py-5">
                        <h3 className="text-sm font-medium text-kolink-text dark:text-gray-300">{t('settings.personalization.contentIdentity.aboutYouTitle')}</h3>
                        <p className="mt-1 text-xs text-kolink-text-secondary dark:text-gray-500">{t('settings.personalization.contentIdentity.aboutYouDescription')}</p>
                        <div className="mt-4 space-y-4">
                            <div>
                              <label htmlFor="name" className="block text-sm font-medium text-kolink-text-secondary dark:text-gray-400">{t('settings.personalization.contentIdentity.nameLabel')}</label>
                              <FormInput type="text" id="name" value={formState.name} onChange={e => handleInputChange('name', e.target.value)} className="mt-1" />
                            </div>
                            <div>
                              <label htmlFor="occupation" className="block text-sm font-medium text-kolink-text-secondary dark:text-gray-400">{t('settings.personalization.contentIdentity.occupationLabel')}</label>
                              <FormInput type="text" id="occupation" value={formState.occupation} onChange={e => handleInputChange('occupation', e.target.value)} className="mt-1" />
                            </div>
                            <div>
                              <label htmlFor="bio" className="block text-sm font-medium text-kolink-text-secondary dark:text-gray-400">{t('settings.personalization.contentIdentity.bioLabel')}</label>
                              <textarea 
                                  id="bio" 
                                  value={formState.bio} 
                                  onChange={e => handleInputChange('bio', e.target.value)}
                                  rows={4}
                                  placeholder={t('settings.personalization.contentIdentity.bioPlaceholder')}
                                  className="block w-full mt-1 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-kolink-text dark:text-gray-200 shadow-sm focus:border-kolink-blue focus:ring-kolink-blue sm:text-sm p-2"
                              />
                            </div>
                        </div>
                    </div>
                </SettingsCard>
                
                {/* Card 2: Best Practices */}
                <BestPracticesSection />

                {/* Card 3: Inspiration Hub */}
                <InspirationHubSection />

            </div>
            
            <div className="sticky bottom-0 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end rounded-b-2xl">
                    <button 
                        onClick={handleSaveIdentity} 
                        disabled={isSaving} 
                        className="px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 rounded-md bg-kolink-blue hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        {isSaving ? t('settings.saving') : t('settings.saveChanges')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const InspirationHubSection: React.FC = () => {
    const { t } = useI18n();
    const { inspirationPosts, addInspirationPost, updateInspirationPost, deleteInspirationPost } = useInspiration();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<InspirationPost | null>(null);

    const handleOpenModal = (item: InspirationPost | null = null) => {
        setCurrentItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const handleDelete = (id: string) => {
        if (confirm(t('settings.personalization.inspirationHub.deleteConfirm'))) {
            deleteInspirationPost(id);
        }
    }
    
    const CardTitleWithTooltip: React.FC<{title: string; tooltip: string}> = ({ title, tooltip }) => (
        <div className="flex items-center gap-2">
            <span>{title}</span>
             <Tooltip text={tooltip}>
                <InformationCircleIcon className="w-5 h-5 text-gray-400" />
            </Tooltip>
        </div>
    );

    return (
        <>
            <SettingsCard
                title={<CardTitleWithTooltip title={t('settings.personalization.inspirationHub.title')} tooltip={t('settings.personalization.inspirationHub.tooltip')} />}
                description={t('settings.personalization.inspirationHub.description')}
                 footer={
                     <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center justify-center px-4 py-2 font-semibold text-white transition-colors duration-200 rounded-lg bg-kolink-blue hover:bg-blue-700"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        {t('settings.personalization.inspirationHub.addPost')}
                    </button>
                }
            >
                <div className="py-5">
                    {inspirationPosts.length > 0 ? (
                        <div className="space-y-3">
                            {inspirationPosts.map(post => (
                                <div key={post.id} className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <p className="text-sm text-kolink-text-secondary dark:text-gray-300 whitespace-pre-wrap line-clamp-3">{post.content}</p>
                                    <div className="flex flex-shrink-0 gap-1 ml-4 sm:gap-2">
                                        <button onClick={() => handleOpenModal(post)} className="p-2 text-gray-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600" title={t('knowledgeBase.edit')}><PencilIcon className="w-5 h-5" /></button>
                                        <button onClick={() => handleDelete(post.id)} className="p-2 text-gray-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600" title={t('knowledgeBase.delete')}><TrashIcon className="w-5 h-5" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <div className="flex flex-col items-center justify-center p-8 text-center text-kolink-text-secondary dark:text-gray-400">
                            <LightBulbIcon className="w-10 h-10 mb-4" />
                            <p>{t('settings.personalization.inspirationHub.noPosts')}</p>
                        </div>
                    )}
                </div>
            </SettingsCard>
            {isModalOpen && (
                 <InspirationModal
                    item={currentItem}
                    onClose={handleCloseModal}
                    onSave={(data) => {
                        if(currentItem) {
                            updateInspirationPost(currentItem.id, data);
                        } else {
                            addInspirationPost(data);
                        }
                        handleCloseModal();
                    }}
                />
            )}
        </>
    );
};


const InspirationModal: React.FC<{ item: InspirationPost | null; onClose: () => void; onSave: (data: { content: string }) => void; }> = ({ item, onClose, onSave }) => {
    const { t } = useI18n();
    const [content, setContent] = useState(item?.content || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) {
            alert("El contenido no puede estar vacío.");
            return;
        }
        onSave({ content });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6 sm:p-8 m-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-kolink-text dark:text-white">
                            {item ? t('settings.personalization.inspirationHub.modal.editTitle') : t('settings.personalization.inspirationHub.modal.addTitle')}
                        </h3>
                    </div>
                    <button onClick={onClose} className="p-1 -mt-2 -mr-2 text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                        <label htmlFor="insp-content" className="block text-sm font-medium text-kolink-text-secondary dark:text-gray-300">{t('settings.personalization.inspirationHub.modal.contentLabel')}</label>
                        <textarea
                            id="insp-content"
                            rows={10}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            placeholder={t('settings.personalization.inspirationHub.modal.contentPlaceholder')}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-kolink-text dark:text-gray-200 shadow-sm focus:border-kolink-blue focus:ring-kolink-blue sm:text-sm p-3"
                        ></textarea>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-kolink-text dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">{t('settings.personalization.inspirationHub.modal.cancel')}</button>
                        <button type="submit" className="px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 rounded-lg bg-kolink-blue hover:bg-blue-700">{t('settings.personalization.inspirationHub.modal.save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const BestPracticesSection: React.FC = () => {
    const { t } = useI18n();
    const { basePractices, customPractices, toggleBasePractice, addCustomPractice, removeCustomPractice } = usePersonalization();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const CardTitleWithTooltip: React.FC<{title: string; tooltip: string}> = ({ title, tooltip }) => (
        <div className="flex items-center gap-2">
            <span>{title}</span>
             <Tooltip text={tooltip}>
                <InformationCircleIcon className="w-5 h-5 text-gray-400" />
            </Tooltip>
        </div>
    );

    return (
        <>
        <SettingsCard
            title={<CardTitleWithTooltip title={t('settings.personalization.bestPractices.title')} tooltip={t('settings.personalization.bestPractices.tooltip')} />}
            description={t('settings.personalization.bestPractices.description')}
        >
            <div className="py-5">
                <h3 className="text-sm font-semibold text-kolink-text dark:text-white">{t('settings.personalization.bestPractices.basePracticesTitle')}</h3>
                <div className="mt-2 space-y-2">
                    {basePractices.map(practice => (
                        <FormRow 
                            key={practice.id} 
                            label={practice.title || ''}
                            description={practice.description}
                        >
                            <Toggle id={practice.id} checked={practice.active || false} onChange={() => toggleBasePractice(practice.id)} />
                        </FormRow>
                    ))}
                </div>
            </div>
            <div className="py-5">
                 <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-kolink-text dark:text-white">{t('settings.personalization.bestPractices.customPracticesTitle')}</h3>
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1 text-sm font-medium text-kolink-blue hover:underline">
                        <PlusIcon className="w-4 h-4" />
                        {t('settings.personalization.bestPractices.addPractice')}
                    </button>
                 </div>
                 <div className="mt-4">
                    {customPractices.length > 0 ? (
                        <ul className="space-y-3">
                            {customPractices.map(practice => (
                                <li key={practice.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <p className="text-sm text-kolink-text-secondary dark:text-gray-300">{practice.text}</p>
                                    <button onClick={() => removeCustomPractice(practice.id)} className="p-1 text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-kolink-text-secondary dark:text-gray-400">{t('settings.personalization.bestPractices.noCustomPractices')}</p>
                    )}
                 </div>
            </div>
        </SettingsCard>
         {isModalOpen && (
                <AddPracticeModal
                    onClose={() => setIsModalOpen(false)}
                    onAdd={(text) => {
                        addCustomPractice(text);
                        setIsModalOpen(false);
                    }}
                />
            )}
        </>
    );
};

const AddPracticeModal: React.FC<{ onClose: () => void; onAdd: (text: string) => void }> = ({ onClose, onAdd }) => {
    const { t } = useI18n();
    const [text, setText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim()) {
            onAdd(text.trim());
        }
    };
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6 sm:p-8 m-4" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-kolink-text dark:text-white">{t('settings.personalization.bestPractices.modal.title')}</h3>
                <p className="mt-1 text-sm text-kolink-text-secondary dark:text-gray-400">{t('settings.personalization.bestPractices.modal.description')}</p>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                     <div>
                        <label htmlFor="practice-text" className="block text-sm font-medium text-kolink-text-secondary dark:text-gray-300">{t('settings.personalization.bestPractices.modal.label')}</label>
                        <textarea
                            id="practice-text"
                            rows={3}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            required
                            placeholder={t('settings.personalization.bestPractices.modal.placeholder')}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-kolink-text dark:text-gray-200 shadow-sm focus:border-kolink-blue focus:ring-kolink-blue sm:text-sm p-3"
                        ></textarea>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-kolink-text dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">{t('settings.personalization.bestPractices.modal.cancel')}</button>
                        <button type="submit" className="px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 rounded-lg bg-kolink-blue hover:bg-blue-700">{t('settings.personalization.bestPractices.modal.add')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Icons
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>);
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.134H8.09a2.09 2.09 0 0 0-2.09 2.134v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>);
const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>);
const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>);
const LightBulbIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.311a14.994 14.994 0 0 1-4.5 0M9.75 10.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM3.75 12a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Z" /></svg>);
const InformationCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>);

export default PersonalizationSettings;