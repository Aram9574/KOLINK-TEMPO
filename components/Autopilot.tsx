

import React, { useState, useEffect } from 'react';
import { useI18n } from '../hooks/useI18n';
import type { User, AdvancedSettings } from '../types';
import { generateAutopilotSuggestions, analyzePostThemes } from '../services/geminiService';
import { usePosts } from '../context/PostsContext';
import Spinner from './Spinner';
import { useGamification } from '../hooks/useGamification';
import { useToast } from '../hooks/useToast';
import Tooltip from './Tooltip';
import { useCredits } from '../hooks/useCredits';
import { usePersonalization } from '../hooks/usePersonalization';
import { useInspiration } from '../hooks/useInspiration';
import { useKnowledgeBase } from '../context/KnowledgeBaseContext';

interface AutopilotProps {
    user: User;
    openPlanModal: () => void;
}

type SuggestionStatus = 'pending' | 'approved' | 'discarded';
interface Suggestion {
    id: string;
    content: string;
    status: SuggestionStatus;
}

const Autopilot: React.FC<AutopilotProps> = ({ user, openPlanModal }) => {
    const { t, language } = useI18n();
    const { posts, addPost } = usePosts();
    const { addXp } = useGamification();
    const { showToast } = useToast();
    const { useCredit } = useCredits();
    const { identity, basePractices, customPractices } = usePersonalization();
    const { inspirationPosts } = useInspiration();
    const { knowledgeItems } = useKnowledgeBase();

    const [isEnabled, setIsEnabled] = useState(true);
    const [frequency, setFrequency] = useState('3');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [keywords, setKeywords] = useState<string[]>(['Inteligencia Artificial', 'Marketing Digital', 'Crecimiento de Startups']);
    const [error, setError] = useState<string | null>(null);
    const [customTopics, setCustomTopics] = useState('');
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [tone, setTone] = useState('professional');
    const [useKnowledge, setUseKnowledge] = useState(true);
    const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>({
        length: 'medium',
        emojiUsage: 'subtle',
        creativity: 0.7,
        cta: 'question',
        hashtags: 'broad',
        audience: '',
    });
    const [isKeywordModalOpen, setIsKeywordModalOpen] = useState(false);
    
    const MAX_KEYWORDS = 5;
    const POST_THRESHOLD = 5;
    const publishedPosts = posts.filter(p => p.status === 'scheduled' && p.scheduledAt && p.scheduledAt <= new Date());
    const publishedPostCount = publishedPosts.length;

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        setError(null);
        try {
            const publishedPostsContent = publishedPosts.map(p => p.content);
            const themeResponse = await analyzePostThemes(publishedPostsContent);
            const newFoundThemes = themeResponse.themes.filter(t => !keywords.includes(t));
            const updatedKeywords = [...keywords, ...newFoundThemes].slice(0, MAX_KEYWORDS);
            setKeywords(updatedKeywords);
            showToast(t('autopilot.analysis.analyzeSuccess'), 'success');
        } catch (err: any) {
            setError(t('autopilot.analysis.analyzeError'));
            console.error(err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleGenerate = async () => {
        if (!identity.occupation) {
            return;
        }
        
        const creditsNeeded = parseInt(frequency);
        if (!useCredit(creditsNeeded)) {
            showToast(t('autopilot.errors.noCreditsMessage', { count: creditsNeeded }), 'error');
            openPlanModal();
            return;
        }

        setIsGenerating(true);
        setError(null);
        setSuggestions([]);

        try {
            const knowledgeBaseContent = useKnowledge ? knowledgeItems.map(item => `**${item.title}**\n${item.content}`).join('\n\n---\n\n') : '';
            const activeBasePractices = basePractices.filter(p => p.active).map(p => p.text);
            const activeCustomPractices = customPractices.map(p => p.text);
            const allBestPractices = [...activeBasePractices, ...activeCustomPractices];
            
            const response = await generateAutopilotSuggestions({
                frequency: parseInt(frequency),
                themes: keywords,
                customTopics,
                tone,
                advanced: advancedSettings,
                identity,
                inspirationPosts,
                bestPractices: allBestPractices,
                knowledgeBaseContent,
                language,
            });
            
            const newSuggestions = response.suggestions.map((s, i) => ({
                id: `suggestion-${Date.now()}-${i}`,
                content: s.content,
                status: 'pending' as SuggestionStatus,
            }));
            setSuggestions(newSuggestions);
            addXp(20, t('gamification.xp.autopilotGenerate'));

        } catch (err: any) {
            setError(t('autopilot.error'));
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleApprove = (id: string) => {
        const suggestion = suggestions.find(s => s.id === id);
        if (suggestion) {
            addPost({ content: suggestion.content });
            addXp(5, t('gamification.xp.autopilotApprove'));
            setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: 'approved' } : s));
            showToast(t('autopilot.suggestions.approved'), 'success');
        }
    };

    const handleDiscard = (id: string) => {
        setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: 'discarded' } : s));
    };

    const handleRemoveKeyword = (keywordToRemove: string) => {
        setKeywords(keywords.filter(kw => kw !== keywordToRemove));
    };

    const handleClearKeywords = () => {
        if (confirm(t('autopilot.analysis.deleteAllConfirm'))) {
            setKeywords([]);
        }
    };

    const handleAddKeyword = (newKeyword: string) => {
        if (newKeyword.trim() && !keywords.includes(newKeyword.trim()) && keywords.length < MAX_KEYWORDS) {
            setKeywords([...keywords, newKeyword.trim()]);
        } else if (keywords.length >= MAX_KEYWORDS) {
            showToast(t('autopilot.analysis.maxKeywordsWarning'), 'error');
        }
    };

    return (
        <div>
            {isKeywordModalOpen && (
                <KeywordManagementModal
                    onClose={() => setIsKeywordModalOpen(false)}
                    keywords={keywords}
                    onAdd={handleAddKeyword}
                    onRemove={handleRemoveKeyword}
                    onClearAll={handleClearKeywords}
                    maxKeywords={MAX_KEYWORDS}
                />
            )}
            
            <h1 className="text-3xl font-bold text-kolink-text dark:text-white">{t('autopilot.title')}</h1>
            <p className="mt-1 text-kolink-text-secondary dark:text-gray-400">{t('autopilot.subtitle')}</p>
            
            {/* How it Works */}
            <HowItWorksCard />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                {/* Left Column: Control Panel */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-kolink-text dark:text-white mb-4">{t('autopilot.config.title')}</h2>
                        
                        {/* Main Settings */}
                        <ConfigSection title={t('autopilot.config.mainSettings.title')} icon={<Cog6ToothIcon/>}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <label className="text-sm font-medium text-kolink-text dark:text-gray-300">{t('autopilot.config.mainSettings.statusLabel')}</label>
                                    <Tooltip text={t('autopilot.config.mainSettings.statusTooltip')}><InformationCircleIcon className="w-4 h-4 text-gray-400 ml-2" /></Tooltip>
                                </div>
                                <label htmlFor="autopilot-toggle" className="inline-flex relative items-center cursor-pointer">
                                    <input type="checkbox" id="autopilot-toggle" className="sr-only peer" checked={isEnabled} onChange={() => setIsEnabled(!isEnabled)} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-kolink-blue"></div>
                                </label>
                            </div>
                             <div>
                                <label htmlFor="frequency-select" className="block text-sm font-medium text-kolink-text dark:text-gray-300">{t('autopilot.config.mainSettings.frequencyLabel')}</label>
                                <select id="frequency-select" value={frequency} onChange={(e) => setFrequency(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-kolink-text dark:text-gray-200 shadow-sm focus:border-kolink-blue focus:ring-kolink-blue sm:text-sm">
                                    <option value="1">{t('autopilot.frequency.one')}</option>
                                    <option value="3">{t('autopilot.frequency.three')}</option>
                                    <option value="5">{t('autopilot.frequency.five')}</option>
                                </select>
                            </div>
                        </ConfigSection>

                        {/* Topics */}
                        <ConfigSection title={t('autopilot.config.topics.title')} icon={<BookOpenIcon/>} description={t('autopilot.config.topics.description')}>
                           <div>
                                <label className="text-sm font-medium text-kolink-text dark:text-gray-300">{t('autopilot.config.topics.headlineLabel')}</label>
                                 {identity.occupation ? (
                                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm text-kolink-text-secondary dark:text-gray-300">"{identity.occupation}"</div>
                                ) : (
                                    <div className="mt-1 p-3 bg-yellow-50 dark:bg-yellow-900/50 rounded-lg border border-yellow-200 dark:border-yellow-800 text-sm text-yellow-800 dark:text-yellow-200" dangerouslySetInnerHTML={{ __html: t('autopilot.config.topics.noHeadline')}}></div>
                                )}
                           </div>
                            <div>
                                <label htmlFor="custom-topics" className="text-sm font-medium text-kolink-text dark:text-gray-300">{t('autopilot.config.topics.customTopicsLabel')}</label>
                                <input type="text" id="custom-topics" value={customTopics} onChange={(e) => setCustomTopics(e.target.value)} placeholder={t('autopilot.config.topics.customTopicsPlaceholder')} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-kolink-text dark:text-gray-200 shadow-sm focus:border-kolink-blue focus:ring-kolink-blue sm:text-sm" />
                            </div>
                             <div>
                                <label className="flex items-center text-sm font-medium text-kolink-text dark:text-gray-300">{t('autopilot.analysis.subtitle')} <Tooltip text={t('autopilot.analysis.tooltip')}><InformationCircleIcon className="w-4 h-4 text-gray-400 ml-2" /></Tooltip></label>
                                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg min-h-[60px]">
                                    {keywords.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5">
                                            {keywords.map((kw, i) => <span key={i} className="px-2 py-0.5 text-xs font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-200">{kw}</span>)}
                                        </div>
                                    ) : ( <div className="flex items-center justify-center h-full"><p className="text-xs text-center text-kolink-text-secondary dark:text-gray-400">{t('autopilot.analysis.noKeywords')}</p></div> )}
                                </div>
                                <div className="mt-2 flex justify-end items-center gap-4">
                                     <button onClick={() => setIsKeywordModalOpen(true)} className="text-xs font-semibold text-kolink-blue hover:underline">{t('autopilot.analysis.manage')}</button>
                                     <button onClick={handleAnalyze} disabled={isAnalyzing || publishedPostCount < POST_THRESHOLD} className="text-xs font-semibold text-kolink-blue hover:underline disabled:opacity-50 disabled:cursor-not-allowed" title={publishedPostCount < POST_THRESHOLD ? t('autopilot.analysis.unlockInfo', { count: POST_THRESHOLD - publishedPostCount }) : ''}>{t('autopilot.analysis.analyzeButton')}</button>
                                </div>
                             </div>
                        </ConfigSection>

                        {/* AI Personality */}
                        <ConfigSection title={t('autopilot.config.personality.title')} icon={<SparklesIcon/>} description={t('autopilot.config.personality.description')} isCollapsible>
                            <div className="flex items-center space-x-2">
                                <label htmlFor="knowledge-toggle-autopilot" className="flex items-center cursor-pointer text-sm font-medium text-kolink-text dark:text-gray-300">
                                    <input type="checkbox" id="knowledge-toggle-autopilot" className="sr-only peer" checked={useKnowledge} onChange={() => setUseKnowledge(!useKnowledge)} />
                                    <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-kolink-blue"></div>
                                    <span className="ml-2">{t('autopilot.config.personality.useKnowledgeBase')}</span>
                                </label>
                                <Tooltip text={t('autopilot.config.personality.useKnowledgeBaseTooltip')}>
                                    <InformationCircleIcon className="w-5 h-5 text-gray-400" />
                                </Tooltip>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="tone-select" className="block text-xs font-medium text-kolink-text-secondary dark:text-gray-400">{t('generator.personalization.toneLabel')}</label>
                                    <select id="tone-select" value={tone} onChange={(e) => setTone(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-kolink-text dark:text-gray-200 shadow-sm focus:border-kolink-blue focus:ring-kolink-blue sm:text-sm">
                                        {Object.entries(t('generator.personalization.tones', { returnObjects: true }) as Record<string, string>).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="length-select" className="block text-xs font-medium text-kolink-text-secondary dark:text-gray-400">{t('generator.advanced.length')}</label>
                                    <select id="length-select" value={advancedSettings.length} onChange={(e) => setAdvancedSettings({...advancedSettings, length: e.target.value as any})} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-kolink-text dark:text-gray-200 shadow-sm focus:border-kolink-blue focus:ring-kolink-blue sm:text-sm">
                                        {Object.entries(t('generator.advanced.lengthOptions', {returnObjects: true}) as Record<string, string>).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="cta-select" className="block text-xs font-medium text-kolink-text-secondary dark:text-gray-400">{t('generator.advanced.cta')}</label>
                                    <select id="cta-select" value={advancedSettings.cta} onChange={(e) => setAdvancedSettings({...advancedSettings, cta: e.target.value as any})} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-kolink-text dark:text-gray-200 shadow-sm focus:border-kolink-blue focus:ring-kolink-blue sm:text-sm">
                                        {Object.entries(t('generator.advanced.ctaOptions', {returnObjects: true}) as Record<string, string>).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="hashtags-select" className="block text-xs font-medium text-kolink-text-secondary dark:text-gray-400">{t('generator.advanced.hashtags')}</label>
                                    <select id="hashtags-select" value={advancedSettings.hashtags} onChange={(e) => setAdvancedSettings({...advancedSettings, hashtags: e.target.value as any})} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-kolink-text dark:text-gray-200 shadow-sm focus:border-kolink-blue focus:ring-kolink-blue sm:text-sm">
                                        {Object.entries(t('generator.advanced.hashtagsOptions', {returnObjects: true}) as Record<string, string>).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                                    </select>
                                </div>
                            </div>
                        </ConfigSection>
                    </div>

                    <div title={!identity.occupation ? t('autopilot.config.topics.noHeadline') : ''}>
                        <button onClick={handleGenerate} disabled={isGenerating || !identity.occupation} className="w-full flex items-center justify-center gap-2 py-3 font-semibold text-white transition-colors duration-200 rounded-lg shadow-lg bg-kolink-blue hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed">
                            {isGenerating ? <Spinner /> : <CpuChipIcon className="w-5 h-5" />}
                            {isGenerating ? t('autopilot.generating') : t('autopilot.generateNow')}
                        </button>
                    </div>
                </div>

                {/* Right Column: Suggestions */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-semibold text-kolink-text dark:text-white">{t('autopilot.suggestions.title')}</h2>
                    {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
                    
                    {isGenerating ? (
                        <div className="flex flex-col items-center justify-center p-8 mt-4 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 min-h-[400px]">
                            <Spinner />
                            <p className="mt-4 text-kolink-text-secondary dark:text-gray-400">{t('autopilot.generating')}</p>
                        </div>
                    ) : suggestions.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 mt-4 md:grid-cols-2">
                            {suggestions.map(suggestion => (
                            <SuggestionCard key={suggestion.id} suggestion={suggestion} onApprove={() => handleApprove(suggestion.id)} onDiscard={() => handleDiscard(suggestion.id)} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 mt-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 min-h-[400px]">
                            <LightBulbIcon className="w-12 h-12 text-gray-400" />
                            <p className="mt-4 font-semibold text-kolink-text dark:text-white">{t('autopilot.suggestions.noSuggestions')}</p>
                            <p className="text-sm text-kolink-text-secondary dark:text-gray-400">{t('autopilot.suggestions.startHere')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const HowItWorksCard: React.FC = () => {
    const { t } = useI18n();
    const steps = [
        { title: t('autopilot.howItWorks.step1.title'), description: t('autopilot.howItWorks.step1.description'), icon: <Cog6ToothIcon/> },
        { title: t('autopilot.howItWorks.step2.title'), description: t('autopilot.howItWorks.step2.description'), icon: <CpuChipIcon/> },
        { title: t('autopilot.howItWorks.step3.title'), description: t('autopilot.howItWorks.step3.description'), icon: <CheckCircleIcon/> },
    ];
    return (
        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-kolink-text dark:text-white text-center">{t('autopilot.howItWorks.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                {steps.map((step, i) => (
                    <div key={i} className="flex items-start">
                        <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-kolink-blue-light dark:bg-blue-900/50 text-kolink-blue dark:text-blue-300 rounded-full font-bold text-lg mr-4">{i+1}</div>
                        <div>
                            <h3 className="font-semibold text-kolink-text dark:text-white">{step.title}</h3>
                            <p className="text-sm text-kolink-text-secondary dark:text-gray-400">{step.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const ConfigSection: React.FC<{title: string; icon: React.ReactElement; description?: string; children: React.ReactNode; isCollapsible?: boolean}> = ({ title, icon, description, children, isCollapsible }) => {
    const [isOpen, setIsOpen] = useState(!isCollapsible);
    
    return (
        <div className="py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
             <div 
                className={`flex justify-between items-center ${isCollapsible ? 'cursor-pointer' : ''}`}
                onClick={() => isCollapsible && setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-3">
                    {/* FIX: Explicitly specify the props type for React.cloneElement to resolve typing error. */}
                    {React.cloneElement<React.SVGProps<SVGSVGElement>>(icon, { className: 'w-5 h-5 text-kolink-text-secondary dark:text-gray-400' })}
                    <h3 className="text-md font-semibold text-kolink-text dark:text-white">{title}</h3>
                </div>
                 {isCollapsible && <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
            </div>
             {isOpen && (
                <div className="pl-8 mt-3 space-y-4">
                    {description && <p className="text-xs text-kolink-text-secondary dark:text-gray-500 -mt-2 mb-3">{description}</p>}
                    {children}
                </div>
            )}
        </div>
    );
}


const KeywordManagementModal: React.FC<{
    onClose: () => void;
    keywords: string[];
    onAdd: (keyword: string) => void;
    onRemove: (keyword: string) => void;
    onClearAll: () => void;
    maxKeywords: number;
}> = ({ onClose, keywords, onAdd, onRemove, onClearAll, maxKeywords }) => {
    const { t } = useI18n();
    const [newKeyword, setNewKeyword] = useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd(newKeyword);
        setNewKeyword('');
    };
    
    const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);

    return (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 m-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-kolink-text dark:text-white">{t('autopilot.analysis.modal.titleManage')}</h3>
                    <button onClick={onClose} className="p-1 -mt-2 -mr-2 text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Add new keyword form */}
                <form onSubmit={handleAdd} className="mt-6 flex gap-2">
                    <input
                        type="text"
                        value={newKeyword}
                        onChange={e => setNewKeyword(e.target.value)}
                        placeholder={t('autopilot.analysis.modal.placeholder')}
                        className="flex-grow block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-kolink-text dark:text-gray-200 shadow-sm focus:border-kolink-blue focus:ring-kolink-blue sm:text-sm"
                        disabled={keywords.length >= maxKeywords}
                    />
                    <button type="submit" disabled={!newKeyword.trim() || keywords.length >= maxKeywords} className="px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 rounded-lg bg-kolink-blue hover:bg-blue-700 disabled:bg-blue-300">{t('autopilot.analysis.modal.add')}</button>
                </form>

                {/* Current keywords list */}
                <div className="mt-6">
                    <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium text-kolink-text-secondary dark:text-gray-300">{t('autopilot.analysis.modal.currentKeywords')} ({keywords.length}/{maxKeywords})</h4>
                        {keywords.length > 0 && 
                            <button onClick={onClearAll} className="text-xs font-semibold text-red-500 hover:underline">{t('autopilot.analysis.deleteAll')}</button>
                        }
                    </div>
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg min-h-[120px] max-h-48 overflow-y-auto">
                        {keywords.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {keywords.map((kw) => (
                                    <span key={kw} className="flex items-center gap-1 px-2 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-200">
                                        <span>{kw}</span>
                                        <button onClick={() => onRemove(kw)} className="p-1 rounded-full text-blue-600 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                                           <XMarkIcon className="w-4 h-4" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        ) : ( 
                            <div className="flex items-center justify-center h-full">
                                <p className="text-sm text-center text-kolink-text-secondary dark:text-gray-400">{t('autopilot.analysis.modal.noKeywords')}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-semibold text-kolink-text dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">{t('autopilot.analysis.modal.done')}</button>
                </div>
            </div>
        </div>
    );
};

const SuggestionCard: React.FC<{ suggestion: Suggestion; onApprove: () => void; onDiscard: () => void; }> = ({ suggestion, onApprove, onDiscard }) => {
    const { t } = useI18n();
    const isPending = suggestion.status === 'pending';
    const isApproved = suggestion.status === 'approved';

    return (
        <div className={`flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 ${suggestion.status === 'discarded' ? 'opacity-50' : ''} ${isApproved ? 'border-green-400 dark:border-green-600' : ''}`}>
             <div className="p-4 flex-grow">
                <p className="text-sm text-kolink-text-secondary dark:text-gray-300 whitespace-pre-wrap">{suggestion.content}</p>
            </div>
            <div className={`p-3 border-t border-gray-200 dark:border-gray-700 ${isApproved ? 'bg-green-50 dark:bg-green-900/50' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                {isPending ? (
                    <div className="flex items-center gap-2">
                        <button onClick={onDiscard} className="w-full px-4 py-2 text-sm font-medium text-kolink-text dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">{t('autopilot.suggestions.discard')}</button>
                        <button onClick={onApprove} className="w-full px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 rounded-md bg-kolink-blue hover:bg-blue-700">{t('autopilot.suggestions.approve')}</button>
                    </div>
                ) : isApproved ? (
                    <div className="flex justify-center items-center gap-2 w-full text-center text-sm font-semibold text-green-600 dark:text-green-400">
                        <CheckCircleIcon className="w-5 h-5"/>
                        {t('autopilot.suggestions.approved')}
                    </div>
                ) : (
                     <div className="w-full text-center text-sm font-medium text-kolink-text-secondary dark:text-gray-500">{t('autopilot.suggestions.discarded')}</div>
                )}
            </div>
        </div>
    );
};

// Icons
const CpuChipIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M8.25 21v-1.5M21 15.75h-1.5M15.75 3h-1.5M21 8.25v7.5a2.25 2.25 0 0 1-2.25-2.25h-7.5a2.25 2.25 0 0 1-2.25-2.25v-7.5a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 21 8.25Zm-9.75 5.25a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1-.75-.75ZM3 15.75v-7.5a2.25 2.25 0 0 1 2.25-2.25h1.5" /></svg>);
const LightBulbIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.311a14.994 14.994 0 0 1-4.5 0M9.75 10.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM3.75 12a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Z" /></svg>);
const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>);
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg>);
const InformationCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>);
const BookOpenIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>);
const Cog6ToothIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.438.995s.145.755.438.995l1.003.827c.48.398.668 1.03.26 1.431l-1.296 2.247a1.125 1.125 0 0 1-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 0 1-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 0 1-1.37-.49l-1.296-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.437-.995s-.145-.755-.437-.995l-1.004-.827a1.125 1.125 0 0 1-.26-1.431l1.296-2.247a1.125 1.125 0 0 1 1.37-.49l1.217.456c.355.133.75.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.213-1.28Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>);
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>);


export default Autopilot;