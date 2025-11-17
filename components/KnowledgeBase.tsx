import React, { useState, useMemo } from 'react';
import { useI18n } from '../hooks/useI18n';
import { useKnowledgeBase } from '../context/KnowledgeBaseContext';
import type { KnowledgeItem } from '../types';

const KnowledgeBase: React.FC = () => {
    const { t } = useI18n();
    const { knowledgeItems, addKnowledgeItem, updateKnowledgeItem, deleteKnowledgeItem } = useKnowledgeBase();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);

    const filteredItems = useMemo(() => {
        if (!searchQuery) return knowledgeItems;
        return knowledgeItems.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.content.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [knowledgeItems, searchQuery]);
    
    const handleOpenModal = (item: KnowledgeItem | null = null) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };
    
    const handleSave = (data: { title: string; content: string }) => {
        if (editingItem) {
            updateKnowledgeItem(editingItem.id, data);
        } else {
            addKnowledgeItem(data);
        }
        handleCloseModal();
    };

    const handleDelete = (id: string) => {
        if (confirm(t('knowledgeBase.deleteConfirm'))) {
            deleteKnowledgeItem(id);
        }
    };
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-kolink-text dark:text-white">{t('knowledgeBase.title')}</h1>
            <p className="mt-1 text-kolink-text-secondary dark:text-gray-400">{t('knowledgeBase.subtitle')}</p>

            <div className="p-6 sm:p-8 mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder={t('knowledgeBase.searchPlaceholder')}
                            className="w-full sm:w-80 pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-kolink-blue focus:border-kolink-blue"
                        />
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center justify-center px-4 py-2 font-semibold text-white transition-colors duration-200 rounded-lg bg-kolink-blue hover:bg-blue-700"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        {t('knowledgeBase.add')}
                    </button>
                </div>
                
                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 -mx-6 sm:-mx-8">
                  {filteredItems.length > 0 ? (
                    <div className="mt-6 px-6 sm:px-8 space-y-4">
                        <p className="text-sm text-kolink-text-secondary dark:text-gray-400">
                            {filteredItems.length === 1 ? t('knowledgeBase.itemCount_one', {count: 1}) : t('knowledgeBase.itemCount_other', {count: filteredItems.length})}
                        </p>
                        {filteredItems.map(item => (
                            <div key={item.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-kolink-text dark:text-white">{item.title}</h3>
                                        <p className="mt-1 text-sm text-kolink-text-secondary dark:text-gray-300 whitespace-pre-wrap line-clamp-2">{item.content}</p>
                                    </div>
                                    <div className="flex flex-shrink-0 gap-1 ml-4 sm:gap-2">
                                        <button onClick={() => handleOpenModal(item)} className="p-2 text-gray-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600" title={t('knowledgeBase.edit')}><PencilIcon className="w-5 h-5" /></button>
                                        <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600" title={t('knowledgeBase.delete')}><TrashIcon className="w-5 h-5" /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                  ) : searchQuery ? (
                     <p className="text-center py-16 text-kolink-text-secondary dark:text-gray-400">{t('knowledgeBase.noResults')}</p>
                  ) : (
                    <div className="text-center py-12 px-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 text-kolink-blue bg-kolink-blue-light dark:bg-blue-900/50 dark:text-blue-300 rounded-full">
                           <BookOpenIcon className="w-8 h-8"/>
                        </div>
                        <h3 className="mt-4 text-lg font-bold text-kolink-text dark:text-white">{t('knowledgeBase.empty.title')}</h3>
                        <p className="mt-2 max-w-xl mx-auto text-sm text-kolink-text-secondary dark:text-gray-400">{t('knowledgeBase.empty.description')}</p>
                        <div className="mt-4 text-left inline-block bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                             <h4 className="font-semibold text-sm text-kolink-text dark:text-white">{t('knowledgeBase.empty.examplesTitle')}</h4>
                             <ul className="mt-2 space-y-2 text-sm text-kolink-text-secondary dark:text-gray-400">
                                 <li dangerouslySetInnerHTML={{ __html: t('knowledgeBase.empty.example1')}} />
                                 <li dangerouslySetInnerHTML={{ __html: t('knowledgeBase.empty.example2')}} />
                                 <li dangerouslySetInnerHTML={{ __html: t('knowledgeBase.empty.example3')}} />
                                 <li dangerouslySetInnerHTML={{ __html: t('knowledgeBase.empty.example4')}} />
                             </ul>
                        </div>
                    </div>
                  )}
                </div>
            </div>

            {isModalOpen && (
                <KnowledgeModal
                    item={editingItem}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

// Modal for adding/editing knowledge items
const KnowledgeModal: React.FC<{ item: KnowledgeItem | null; onClose: () => void; onSave: (data: { title: string; content: string }) => void; }> = ({ item, onClose, onSave }) => {
    const { t } = useI18n();
    const [title, setTitle] = useState(item?.title || '');
    const [content, setContent] = useState(item?.content || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            alert("El título y el contenido no pueden estar vacíos.");
            return;
        }
        onSave({ title, content });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6 sm:p-8 m-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-kolink-text dark:text-white">
                            {item ? t('knowledgeBase.modal.editTitle') : t('knowledgeBase.modal.addTitle')}
                        </h3>
                    </div>
                     <button onClick={onClose} className="p-1 -mt-2 -mr-2 text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                        <label htmlFor="kb-title" className="block text-sm font-medium text-kolink-text-secondary dark:text-gray-300">{t('knowledgeBase.modal.titleLabel')}</label>
                        <input
                            id="kb-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            placeholder={t('knowledgeBase.modal.titlePlaceholder')}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-kolink-text dark:text-gray-200 shadow-sm focus:border-kolink-blue focus:ring-kolink-blue sm:text-sm p-2"
                        />
                    </div>
                     <div>
                        <label htmlFor="kb-content" className="block text-sm font-medium text-kolink-text-secondary dark:text-gray-300">{t('knowledgeBase.modal.contentLabel')}</label>
                        <textarea
                            id="kb-content"
                            rows={8}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            placeholder={t('knowledgeBase.modal.contentPlaceholder')}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-kolink-text dark:text-gray-200 shadow-sm focus:border-kolink-blue focus:ring-kolink-blue sm:text-sm p-3"
                        ></textarea>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-kolink-text dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">{t('knowledgeBase.modal.cancel')}</button>
                        <button type="submit" className="px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 rounded-lg bg-kolink-blue hover:bg-blue-700">{t('knowledgeBase.modal.save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// Icons
const MagnifyingGlassIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>);
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>);
const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>);
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.134H8.09a2.09 2.09 0 0 0-2.09 2.134v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>);
const BookOpenIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>);
const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>);


export default KnowledgeBase;