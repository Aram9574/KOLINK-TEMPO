

import React, { useState, useEffect, useRef } from 'react';
import { generatePost, enhancePrompt } from '../services/geminiService';
import Spinner from './Spinner';
import { useI18n } from '../hooks/useI18n';
import { usePosts } from '../context/PostsContext';
import LinkedInPreview from './LinkedInPreview';
import type { AdvancedSettings, GeneratedPostHistoryItem, User } from '../types';
import { useGamification } from '../hooks/useGamification';
import { useToast } from '../hooks/useToast';
import { useCredits } from '../hooks/useCredits';
import { useKnowledgeBase } from '../context/KnowledgeBaseContext';
import { usePersonalization } from '../hooks/usePersonalization';
import { useInspiration } from '../hooks/useInspiration';
import { useGenerationHistory } from '../context/GenerationHistoryContext';
import Tooltip from './Tooltip';


declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

const ProTip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex items-start p-3 mt-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/50 dark:text-blue-200">
        <LightBulbIcon className="flex-shrink-0 w-5 h-5 mr-3 text-blue-500 dark:text-blue-300" />
        <div>{children}</div>
    </div>
);

interface GeneratorProps {
    openPlanModal: () => void;
}

const Generator: React.FC<GeneratorProps> = ({ openPlanModal }) => {
    const { t, language } = useI18n();
    const { addPost } = usePosts();
    const { addXp } = useGamification();
    const { showToast } = useToast();
    const { useCredit } = useCredits();
    const { knowledgeItems } = useKnowledgeBase();
    const { identity, basePractices, customPractices } = usePersonalization();
    const { inspirationPosts } = useInspiration();
    const { history, addPostToHistory } = useGenerationHistory();
    
    // Core state
    const [prompt, setPrompt] = useState('');
    const [generatedPost, setGeneratedPost] = useState('');
    const [editablePost, setEditablePost] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user] = useState({ name: 'Aram', avatar: 'AZ', headline: 'AI Content Specialist @ Kolink' });

    // UI state
    const [activeTab, setActiveTab] = useState<'preview' | 'history'>('preview');
    const [device, setDevice] = useState<'mobile' | 'desktop'>('desktop');

    // Personalization and post settings
    const [template, setTemplate] = useState('');
    const [enhanceWithAI, setEnhanceWithAI] = useState(true);
    const [tone, setTone] = useState('professional');
    const [postType, setPostType] = useState('announcement');
    const [customInstructions, setCustomInstructions] = useState('');
    const [useKnowledge, setUseKnowledge] = useState(true);

    // Advanced settings
    const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false);
    const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>({
        length: 'medium',
        emojiUsage: 'moderate',
        creativity: 0.7,
        cta: 'question',
        hashtags: 'broad',
        audience: '',
    });
    const [defaultAdvancedSettings, setDefaultAdvancedSettings] = useState<AdvancedSettings>(advancedSettings);
    
    // Dictation state
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    const LINKEDIN_CHAR_LIMIT = 3000;

    const handleTemplateChange = (newTemplateValue: string) => {
        setTemplate(newTemplateValue);
        if (newTemplateValue) {
            setEnhanceWithAI(false);
            const templatePrompt = t(`generator.template_prompts.${newTemplateValue}`);
            // Check if templatePrompt is a string and not the key itself
            if (typeof templatePrompt === 'string' && templatePrompt !== `generator.template_prompts.${newTemplateValue}`) {
                setPrompt(templatePrompt);
            } else {
                setPrompt(''); // Clear if template prompt not found
            }
        } else {
            // If user selects "---", clear the text area. This is an explicit action.
            setPrompt('');
        }
    };

    // Speech Recognition setup
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'es-ES';

            recognition.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                setPrompt(prev => prev + finalTranscript);
            };

            recognition.onerror = (event: any) => {
                let errorMessage = t('generator.dictation.errors.generic');
                if (event.error === 'no-speech') errorMessage = t('generator.dictation.errors.noSpeech');
                else if (event.error === 'audio-capture') errorMessage = t('generator.dictation.errors.audioCapture');
                else if (event.error === 'not-allowed') errorMessage = t('generator.dictation.errors.notAllowed');
                else if (event.error === 'network') errorMessage = t('generator.dictation.errors.network');
                showToast(errorMessage, 'error');
                setIsListening(false);
            };

            recognition.onend = () => {
                 if(recognitionRef.current && (recognitionRef.current as any).__userStopped !== true) {
                     try {
                        recognition.start();
                     } catch (e) {
                         console.error("Recognition restart failed", e);
                         setIsListening(false);
                     }
                } else if (recognitionRef.current) {
                    (recognitionRef.current as any).__userStopped = false; 
                }
            };
            
            recognitionRef.current = recognition;
        }
    }, [t, showToast]);
    
    const handleDictate = () => {
        if (!recognitionRef.current) {
            showToast(t('generator.dictation.errors.unsupported'), 'error');
            return;
        }

        if (isListening) {
            (recognitionRef.current as any).__userStopped = true;
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (e) {
                console.error("Dictation start failed", e);
                showToast(t('generator.dictation.errors.startFailed'), 'error');
                setIsListening(false);
            }
        }
    };
    
    const handleEnhancePrompt = async () => {
        if (!prompt.trim()) return;

        if (!useCredit(1)) {
            showToast(t('generator.errors.noCreditsMessage'), 'error');
            openPlanModal();
            return;
        }

        setIsEnhancing(true);
        try {
            const enhanced = await enhancePrompt(prompt);
            setPrompt(enhanced);
            showToast(t('generator.promptEnhancement.success'), 'success');
        } catch (error) {
            showToast(t('generator.promptEnhancement.error'), 'error');
            console.error(error);
        } finally {
            setIsEnhancing(false);
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError(t('generator.errors.promptRequired'));
            return;
        }

        if (!useCredit(1)) {
            showToast(t('generator.errors.noCreditsMessage'), 'error');
            openPlanModal();
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedPost('');
        setEditablePost('');

        try {
            const knowledgeBaseContent = useKnowledge ? knowledgeItems.map(item => `**${item.title}**\n${item.content}`).join('\n\n---\n\n') : '';
            const activeBasePractices = basePractices.filter(p => p.active).map(p => p.text);
            const activeCustomPractices = customPractices.map(p => p.text);
            const allBestPractices = [...activeBasePractices, ...activeCustomPractices];
            
            const finalPrompt = prompt;
            
            const post = await generatePost({
                prompt: finalPrompt,
                tone,
                postType,
                customInstructions,
                advanced: advancedSettings,
                knowledgeBaseContent,
                identity,
                inspirationPosts: inspirationPosts,
                bestPractices: allBestPractices,
                language,
            });

            setGeneratedPost(post);
            setEditablePost(post);
            addXp(10, t('gamification.xp.generate'));
            addPostToHistory(post);
            setActiveTab('preview');
        } catch (err: any) {
            setError(err.message || t('generator.error.generic'));
            showToast(t('generator.error.generic'), 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleReuseHistory = (content: string) => {
        setGeneratedPost(content);
        setEditablePost(content);
        setActiveTab('preview');
        window.scrollTo(0, 0);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(editablePost);
        showToast(t('generator.copySuccess'), 'success');
    };
    
    const handleSaveDraft = () => {
        addPost({ content: editablePost });
        addXp(5, t('gamification.xp.saveDraft'));
        showToast(t('generator.saveSuccess'), 'success');
    };

    const handleSaveDefaults = () => {
        setDefaultAdvancedSettings(advancedSettings);
        showToast(t('generator.advanced.defaultsSaved'), 'success');
    };

    const handleResetDefaults = () => {
        setAdvancedSettings(defaultAdvancedSettings);
    };
    
    const charCount = prompt.length;
    const charCountColor =
        charCount > LINKEDIN_CHAR_LIMIT
            ? 'text-red-600 dark:text-red-400'
            : charCount > LINKEDIN_CHAR_LIMIT * 0.95
            ? 'text-orange-500 dark:text-orange-400'
            : 'text-kolink-text-secondary dark:text-gray-400';

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Input and Settings */}
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-kolink-text dark:text-white">{t('generator.title')}</h1>
                    <p className="mt-1 text-kolink-text-secondary dark:text-gray-400">{t('generator.subtitle')}</p>
                </div>
                
                {/* Main Prompt Area */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="template-select" className="text-sm font-medium text-kolink-text-secondary dark:text-gray-400">{t('generator.templateLabel')}</label>
                            <select id="template-select" value={template} onChange={e => handleTemplateChange(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-kolink-text dark:text-gray-200 shadow-sm focus:border-kolink-blue focus:ring-kolink-blue sm:text-sm">
                                <option value="">---</option>
                                <option value="question">{t('generator.templates.question')}</option>
                                <option value="tip">{t('generator.templates.tip')}</option>
                                <option value="event">{t('generator.templates.event')}</option>
                                <option value="testimonial">{t('generator.templates.testimonial')}</option>
                                <option value="case_study">{t('generator.templates.case_study')}</option>
                                <option value="industry_news">{t('generator.templates.industry_news')}</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="relative mt-4">
                        <label htmlFor="prompt-area" className="sr-only">{t('generator.promptLabel')}</label>
                        <textarea
                            id="prompt-area"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={t('generator.promptPlaceholder')}
                            className="w-full p-2 pr-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-kolink-blue focus:border-kolink-blue"
                            rows={5}
                        />
                         <button onClick={handleDictate} className={`absolute top-2 right-2 p-1 rounded-full transition-colors ${isListening ? 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600'}`} title={isListening ? t('generator.dictation.stop') : t('generator.dictation.start')}>
                            {isListening ? <MicrophoneSlashIcon className="w-5 h-5" /> : <MicrophoneIcon className="w-5 h-5" />}
                        </button>
                    </div>
                     <div className={`text-right text-xs mt-1 ${charCountColor}`}>
                        {charCount} / {LINKEDIN_CHAR_LIMIT}
                    </div>
                    {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

                    <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                        <div className="flex items-center space-x-2">
                             <label htmlFor="enhance-toggle" className={`flex items-center text-sm font-medium text-kolink-text dark:text-gray-300 ${template ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                <input type="checkbox" id="enhance-toggle" className="sr-only peer" checked={enhanceWithAI} onChange={() => setEnhanceWithAI(!enhanceWithAI)} disabled={!!template} />
                                <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-kolink-blue"></div>
                                <span className="ml-2">{t('generator.promptEnhancement.enable')}</span>
                            </label>
                            <Tooltip text={t('generator.promptEnhancement.tooltip')}>
                                <InformationCircleIcon className="w-5 h-5 text-gray-400" />
                            </Tooltip>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => { setPrompt(''); setTemplate(''); }} className="text-sm font-medium text-kolink-text-secondary dark:text-gray-400 hover:underline">{t('generator.clear')}</button>
                            <button onClick={handleEnhancePrompt} disabled={!enhanceWithAI || isEnhancing || !prompt} className="px-4 py-2 text-sm font-semibold text-kolink-blue transition-colors duration-200 bg-kolink-blue-light rounded-md hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900">
                                {isEnhancing ? <Spinner /> : t('generator.promptEnhancement.enhanceButton')}
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Personalization */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-kolink-text dark:text-white">{t('generator.personalization.title')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div>
                            <label htmlFor="tone-select-full" className="text-sm font-medium text-kolink-text-secondary dark:text-gray-400">{t('generator.personalization.toneLabel')}</label>
                             <select id="tone-select-full" value={tone} onChange={(e) => setTone(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-kolink-text dark:text-gray-200 shadow-sm focus:border-kolink-blue focus:ring-kolink-blue sm:text-sm">
                                {Object.entries(t('generator.personalization.tones', { returnObjects: true }) as Record<string, string>).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                            </select>
                        </div>
                        <div>
                           <label htmlFor="post-type-select-full" className="text-sm font-medium text-kolink-text-secondary dark:text-gray-400">{t('generator.personalization.postTypeLabel')}</label>
                            <select id="post-type-select-full" value={postType} onChange={(e) => setPostType(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-kolink-text dark:text-gray-200 shadow-sm focus:border-kolink-blue focus:ring-kolink-blue sm:text-sm">
                                {Object.entries(t('generator.personalization.postTypes', { returnObjects: true }) as Record<string, string>).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                            </select>
                        </div>
                    </div>
                     <div className="mt-4">
                        <label htmlFor="custom-instructions-full" className="text-sm font-medium text-kolink-text-secondary dark:text-gray-400">{t('generator.personalization.customInstructionsLabel')}</label>
                        <input type="text" id="custom-instructions-full" value={customInstructions} onChange={e => setCustomInstructions(e.target.value)} placeholder={t('generator.personalization.customInstructionsPlaceholder')} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-kolink-text dark:text-gray-200 shadow-sm focus:border-kolink-blue focus:ring-kolink-blue sm:text-sm" />
                    </div>
                     <div className="mt-4 flex items-center space-x-2">
                        <label htmlFor="knowledge-toggle" className="flex items-center cursor-pointer text-sm font-medium text-kolink-text dark:text-gray-300">
                            <input type="checkbox" id="knowledge-toggle" className="sr-only peer" checked={useKnowledge} onChange={() => setUseKnowledge(!useKnowledge)} />
                            <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-kolink-blue"></div>
                            <span className="ml-2">{t('generator.personalization.useKnowledgeBase')}</span>
                        </label>
                        <Tooltip text={t('generator.personalization.useKnowledgeBaseTooltip')}>
                           <InformationCircleIcon className="w-5 h-5 text-gray-400" />
                        </Tooltip>
                    </div>
                </div>

                {/* Advanced Settings */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsAdvancedSettingsOpen(!isAdvancedSettingsOpen)}>
                        <h3 className="text-lg font-bold text-kolink-text dark:text-white">{t('generator.advanced.toggle')}</h3>
                        <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isAdvancedSettingsOpen ? 'rotate-180' : ''}`} />
                    </div>
                    {isAdvancedSettingsOpen && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-kolink-text-secondary dark:text-gray-400">{t('generator.advanced.length')}</label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {Object.entries(t('generator.advanced.lengthOptions', {returnObjects: true}) as Record<string, string>).map(([key, value]) => (
                                        <AdvancedRadio key={key} name="length" value={key} checked={advancedSettings.length === key} onChange={v => setAdvancedSettings(s => ({...s, length: v as any}))} label={value} />
                                    ))}
                                </div>
                            </div>
                             <div>
                                <label className="text-sm font-medium text-kolink-text-secondary dark:text-gray-400">{t('generator.advanced.emojiUsage')}</label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                   {Object.entries(t('generator.advanced.emojiUsageOptions', {returnObjects: true}) as Record<string, string>).map(([key, value]) => (
                                        <AdvancedRadio key={key} name="emoji" value={key} checked={advancedSettings.emojiUsage === key} onChange={v => setAdvancedSettings(s => ({...s, emojiUsage: v as any}))} label={value} />
                                    ))}
                                </div>
                            </div>
                             <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-kolink-text-secondary dark:text-gray-400">{t('generator.advanced.creativity')}</label>
                                <Tooltip text={t('generator.advanced.creativityDescription')}>
                                    <InformationCircleIcon className="w-5 h-5 text-gray-400" />
                                </Tooltip>
                            </div>
                             <input type="range" min="0" max="1" step="0.1" value={advancedSettings.creativity} onChange={e => setAdvancedSettings({...advancedSettings, creativity: parseFloat(e.target.value)})} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-kolink-blue" />
                            <div>
                                <label htmlFor="audience" className="text-sm font-medium text-kolink-text-secondary dark:text-gray-400">{t('generator.advanced.audience')}</label>
                                <input type="text" id="audience" value={advancedSettings.audience} onChange={e => setAdvancedSettings({...advancedSettings, audience: e.target.value})} placeholder={t('generator.advanced.audiencePlaceholder')} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-kolink-text dark:text-gray-200 shadow-sm focus:border-kolink-blue focus:ring-kolink-blue sm:text-sm" />
                            </div>
                             <div className="flex justify-end gap-2 text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                                <button onClick={handleResetDefaults} className="font-medium text-kolink-text-secondary dark:text-gray-400 hover:underline">{t('generator.advanced.resetDefaults')}</button>
                                <button onClick={handleSaveDefaults} className="font-medium text-kolink-blue hover:underline">{t('generator.advanced.saveAsDefault')}</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Generate Button */}
                <button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} className="w-full flex items-center justify-center gap-2 py-3 font-semibold text-white transition-colors duration-200 rounded-lg shadow-lg bg-kolink-blue hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed">
                    {isLoading ? <Spinner /> : <SparklesIcon className="w-5 h-5" />}
                    {isLoading ? t('generator.generating') : t('generator.generate')}
                </button>
                <ProTip><p dangerouslySetInnerHTML={{__html: t('proTips.generator')}} /></ProTip>
            </div>
            
            {/* Right Column: Preview and History */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 md:sticky md:top-8 h-max">
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <TabButton title={t('generator.previewTitle')} isActive={activeTab === 'preview'} onClick={() => setActiveTab('preview')} />
                    <TabButton title={t('generator.history.title')} isActive={activeTab === 'history'} onClick={() => setActiveTab('history')} />
                </div>
                {activeTab === 'preview' ? (
                     <PreviewTab 
                        post={editablePost} 
                        user={user} 
                        device={device} 
                        setDevice={setDevice} 
                        onContentChange={setEditablePost}
                        onCopy={handleCopy}
                        onSaveDraft={handleSaveDraft}
                        t={t}
                     />
                ) : (
                    <HistoryTab history={history} onReuse={handleReuseHistory} t={t} />
                )}
            </div>
        </div>
    );
};
const AdvancedRadio: React.FC<{name: string, value: string, checked: boolean, onChange: (v: string) => void, label: string}> = ({name, value, checked, onChange, label}) => (
    <label className="flex items-center">
        <input type="radio" name={name} value={value} checked={checked} onChange={e => onChange(e.target.value)} className="sr-only peer" />
        <span className="px-3 py-1 text-sm rounded-full cursor-pointer transition-colors peer-checked:bg-kolink-blue peer-checked:text-white bg-gray-100 text-kolink-text-secondary dark:bg-gray-700 dark:text-gray-300 dark:peer-checked:bg-kolink-blue">{label}</span>
    </label>
)
const TabButton: React.FC<{title: string; isActive: boolean; onClick: () => void}> = ({title, isActive, onClick}) => (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${isActive ? 'text-kolink-blue border-kolink-blue' : 'text-kolink-text-secondary dark:text-gray-400 border-transparent hover:text-kolink-text dark:hover:text-white'}`}>
        {title}
    </button>
);

const PreviewTab: React.FC<{
    post: string;
    // FIX: Changed user prop type to require a headline to match what LinkedInPreview expects.
    user: {
        name: string;
        avatar: string;
        headline: string;
    };
    device: 'mobile' | 'desktop';
    setDevice: (d: 'mobile' | 'desktop') => void;
    onContentChange: (c: string) => void;
    onCopy: () => void;
    onSaveDraft: () => void;
    t: (key: string) => string;
}> = ({ post, user, device, setDevice, onContentChange, onCopy, onSaveDraft, t }) => {
    return (
        <div className="mt-4">
            {post ? (
                <>
                    <div className="flex justify-center items-center gap-1 p-1 mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                       {(['mobile', 'desktop'] as const).map(d => (
                           <button key={d} onClick={() => setDevice(d)} className={`px-3 py-1.5 text-sm font-semibold rounded-md w-full transition-colors ${device === d ? 'bg-white dark:bg-gray-800 text-kolink-blue shadow' : 'text-kolink-text-secondary dark:text-gray-400'}`}>
                               {t(`generator.preview.${d}`)}
                           </button>
                       ))}
                    </div>
                    <LinkedInPreview
                        user={user}
                        content={post}
                        onContentChange={onContentChange}
                        isEditable
                        device={device}
                        onCopy={onCopy}
                        t={t}
                    />
                    <div className="flex gap-2 justify-end mt-4">
                        <button onClick={onSaveDraft} className="px-4 py-2 text-sm font-semibold text-white bg-kolink-blue rounded-md hover:bg-blue-700">{t('generator.saveDraft')}</button>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center text-kolink-text-secondary dark:text-gray-500">
                    <SparklesIcon className="w-12 h-12" />
                    <p className="mt-2">{t('generator.placeholder')}</p>
                </div>
            )}
        </div>
    );
};

const HistoryTab: React.FC<{ history: GeneratedPostHistoryItem[]; onReuse: (content: string) => void; t: any }> = ({ history, onReuse, t }) => {
    return (
        <div className="mt-4 space-y-3 max-h-[80vh] overflow-y-auto">
            <p className="text-xs text-kolink-text-secondary dark:text-gray-500 px-2">{t('generator.history.description')}</p>
            {history.length > 0 ? history.map(item => (
                <div key={item.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-kolink-text-secondary dark:text-gray-300 line-clamp-3">{item.content}</p>
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(item.date).toLocaleString()}</span>
                        <button onClick={() => onReuse(item.content)} className="px-3 py-1 text-xs font-semibold text-kolink-blue bg-kolink-blue-light rounded-md hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900">{t('generator.history.reuse')}</button>
                    </div>
                </div>
            )) : <p className="text-sm text-center text-kolink-text-secondary dark:text-gray-500 py-8">{t('generator.history.noHistory')}</p>}
        </div>
    );
};

// Icons
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg>);
const LightBulbIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.311a14.994 14.994 0 0 1-4.5 0M9.75 10.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM3.75 12a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Z" /></svg>);
const InformationCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>);
const MicrophoneIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m12 5.25v-1.5a6 6 0 0 0-12 0v1.5m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>);
const MicrophoneSlashIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l-2.25 2.25M19.5 12l2.25-2.25M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m12 5.25v-1.5a6 6 0 0 0-12 0v1.5m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 3l18 18" /></svg>);
const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>);

export default Generator;