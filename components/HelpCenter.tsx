
import React, { useState, useMemo } from 'react';
import { useI18n } from '../hooks/useI18n';
import { useToast } from '../hooks/useToast';

// Define types for content
type HelpCategory = 'faq' | 'guides' | 'whatsNew' | 'contact';
type AccordionContent = { q: string, a: string };
type WhatsNewContent = { date: string, title: string, description: string };

const HelpCenter: React.FC = () => {
    const { t } = useI18n();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<HelpCategory>('faq');

    // Load content from i18n
    const faqs = useMemo(() => (t('helpCenter.faqs', { returnObjects: true }) || []) as AccordionContent[], [t]);
    const guides = useMemo(() => (t('helpCenter.guides', { returnObjects: true }) || []) as AccordionContent[], [t]);
    const whatsNewLog = useMemo(() => (t('helpCenter.whatsNewLog', { returnObjects: true }) || []) as WhatsNewContent[], [t]);

    const filteredContent = useMemo(() => {
        if (!searchQuery) {
            if (activeCategory === 'faq') return faqs;
            if (activeCategory === 'guides') return guides;
            return []; // No search for other categories
        }
        
        const lowercasedQuery = searchQuery.toLowerCase();
        let sourceData: AccordionContent[] = [];
        if (activeCategory === 'faq') sourceData = faqs;
        else if (activeCategory === 'guides') sourceData = guides;

        return sourceData.filter(item =>
            item.q.toLowerCase().includes(lowercasedQuery) ||
            item.a.toLowerCase().includes(lowercasedQuery)
        );
    }, [searchQuery, activeCategory, faqs, guides]);

    const renderContent = () => {
        switch (activeCategory) {
            case 'faq':
                return <AccordionList items={filteredContent as AccordionContent[]} noResultsMessage={t('helpCenter.noResults')} />;
            case 'guides':
                return <AccordionList items={filteredContent as AccordionContent[]} noResultsMessage={t('helpCenter.noResults')} />;
            case 'whatsNew':
                return <WhatsNewList items={whatsNewLog} />;
            case 'contact':
                return <ContactSection />;
            default:
                return null;
        }
    };

    return (
        <div>
            {/* Header and Search */}
            <div className="p-8 text-center bg-white border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-2xl">
                <h1 className="text-3xl font-bold text-kolink-text dark:text-white">{t('helpCenter.title')}</h1>
                <p className="mt-2 text-kolink-text-secondary dark:text-gray-400">{t('helpCenter.subtitle')}</p>
                <div className="relative max-w-lg mx-auto mt-6">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                    </span>
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('helpCenter.searchPlaceholder')}
                        className="block w-full py-3 pl-10 pr-4 text-gray-900 bg-gray-100 border border-transparent rounded-lg dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-kolink-blue"
                    />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="p-6 mt-10 bg-white sm:p-8 dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                {/* Category Navigation */}
                <nav className="flex border-b border-gray-200 dark:border-gray-700">
                    {(['faq', 'guides', 'whatsNew', 'contact'] as HelpCategory[]).map(cat => (
                        <button
                            key={cat}
                            onClick={() => {
                                setActiveCategory(cat);
                                setSearchQuery(''); // Clear search when changing category
                            }}
                            className={`px-4 py-3 -mb-px text-sm font-semibold border-b-2 transition-colors ${
                                activeCategory === cat
                                    ? 'text-kolink-blue border-kolink-blue'
                                    : 'text-kolink-text-secondary dark:text-gray-400 border-transparent hover:text-kolink-text dark:hover:text-white'
                            }`}
                        >
                            {t(`helpCenter.categories.${cat}`)}
                        </button>
                    ))}
                </nav>

                <div className="mt-6">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

const AccordionList: React.FC<{ items: AccordionContent[], noResultsMessage: string }> = ({ items, noResultsMessage }) => {
    if (items.length === 0) {
        return <p className="text-kolink-text-secondary dark:text-gray-400">{noResultsMessage}</p>;
    }
    return (
        <div className="space-y-4">
            {items.map((item, index) => (
                <AccordionItem key={index} title={item.q} content={item.a} />
            ))}
        </div>
    );
};

const AccordionItem: React.FC<{ title: string; content: string }> = ({ title, content }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full py-4 text-left">
                <span className="font-medium text-kolink-text dark:text-white">{title}</span>
                <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="pb-4 pr-8 text-kolink-text-secondary dark:text-gray-400 whitespace-pre-wrap">
                    <p>{content}</p>
                </div>
            )}
        </div>
    );
};

const WhatsNewList: React.FC<{ items: WhatsNewContent[] }> = ({ items }) => (
    <div className="space-y-6">
        {items.map((item, index) => (
            <div key={index} className="relative pl-8 border-l-2 border-gray-200 dark:border-gray-700">
                <span className="absolute -left-[9px] top-1 w-4 h-4 bg-kolink-blue rounded-full border-4 border-white dark:border-gray-800"></span>
                <p className="text-sm font-medium text-kolink-text-secondary dark:text-gray-400">{item.date}</p>
                <h3 className="mt-1 text-lg font-semibold text-kolink-text dark:text-white">{item.title}</h3>
                <p className="mt-1 text-sm text-kolink-text-secondary dark:text-gray-300">{item.description}</p>
            </div>
        ))}
    </div>
);

const ContactSection: React.FC = () => {
    const { t } = useI18n();
    const { showToast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        showToast(t('helpCenter.contact.submitSuccess'), 'success');
        (e.target as HTMLFormElement).reset();
    };

    return (
        <div>
            <h3 className="text-xl font-bold text-kolink-text dark:text-white">{t('helpCenter.contact.title')}</h3>
            <p className="mt-1 text-kolink-text-secondary dark:text-gray-400">{t('helpCenter.contact.description')}</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4 max-w-lg">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="contact-name" className="block text-sm font-medium text-kolink-text-secondary dark:text-gray-300">{t('helpCenter.contact.form.nameLabel')}</label>
                        <input type="text" id="contact-name" required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-kolink-text dark:text-gray-200 shadow-sm focus:border-kolink-blue focus:ring-kolink-blue sm:text-sm p-2" />
                    </div>
                    <div>
                        <label htmlFor="contact-email" className="block text-sm font-medium text-kolink-text-secondary dark:text-gray-300">{t('helpCenter.contact.form.emailLabel')}</label>
                        <input type="email" id="contact-email" required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-kolink-text dark:text-gray-200 shadow-sm focus:border-kolink-blue focus:ring-kolink-blue sm:text-sm p-2" />
                    </div>
                </div>
                <div>
                    <label htmlFor="contact-message" className="block text-sm font-medium text-kolink-text-secondary dark:text-gray-300">{t('helpCenter.contact.form.messageLabel')}</label>
                    <textarea id="contact-message" rows={5} required placeholder={t('helpCenter.contact.form.messagePlaceholder')} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-kolink-text dark:text-gray-200 shadow-sm focus:border-kolink-blue focus:ring-kolink-blue sm:text-sm p-3"></textarea>
                </div>
                <div>
                    <button type="submit" className="px-5 py-2.5 font-semibold text-white transition-colors duration-200 rounded-lg bg-kolink-blue hover:bg-blue-700">
                        {t('helpCenter.contact.form.sendButton')}
                    </button>
                </div>
                 <p className="text-sm text-center text-kolink-text-secondary dark:text-gray-400 !mt-8">
                    {t('helpCenter.contact.directEmail')}
                </p>
            </form>
        </div>
    );
};

// Icons
const MagnifyingGlassIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>);
const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>);

export default HelpCenter;
