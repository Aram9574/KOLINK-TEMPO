import React, { useState, useMemo, useRef } from 'react';
import { useI18n } from '../hooks/useI18n';
import { usePosts } from '../context/PostsContext';
import type { Post } from '../types';

type DateRange = '7d' | '30d' | '90d';

const ExpandableText: React.FC<{ text: string; maxLength?: number }> = ({ text, maxLength = 80 }) => {
    const { t } = useI18n();
    const [isExpanded, setIsExpanded] = useState(false);

    if (text.length <= maxLength) {
        return <p className="whitespace-normal">{text}</p>;
    }

    return (
        <div>
            <p className="whitespace-normal">
                {isExpanded ? text : `${text.substring(0, maxLength)}...`}
            </p>
            <button 
                onClick={() => setIsExpanded(!isExpanded)} 
                className="text-kolink-blue text-xs font-semibold hover:underline mt-1"
            >
                {isExpanded ? t('statistics.seeLess') : t('statistics.seeMore')}
            </button>
        </div>
    );
};


const Statistics: React.FC = () => {
    const { t } = useI18n();
    const { posts } = usePosts();
    const [dateRange, setDateRange] = useState<DateRange>('30d');

    const { currentPosts, prevTotals } = useMemo(() => {
        const now = new Date();
        let days;
        switch (dateRange) {
            case '7d': days = 7; break;
            case '90d': days = 90; break;
            case '30d':
            default: days = 30; break;
        }

        const endDate = now;
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        const prevEndDate = startDate;
        const prevStartDate = new Date(prevEndDate.getTime() - days * 24 * 60 * 60 * 1000);

        const publishedPosts = posts.filter(p => p.status === 'scheduled' && p.scheduledAt && p.scheduledAt <= now);

        const currentPeriodPosts = publishedPosts.filter(p => p.scheduledAt! >= startDate && p.scheduledAt! <= endDate);
        const previousPeriodPosts = publishedPosts.filter(p => p.scheduledAt! >= prevStartDate && p.scheduledAt! < prevEndDate);
        
        const calculateTotals = (postList: Post[]) => {
            return postList.reduce((acc, post) => {
                acc.impressions += post.views || 0;
                acc.likes += post.likes || 0;
                acc.comments += post.comments || 0;
                return acc;
            }, { impressions: 0, likes: 0, comments: 0 });
        };
        
        const previousPeriodTotals = calculateTotals(previousPeriodPosts);
        
        const prevEngagementValue = previousPeriodTotals.likes + previousPeriodTotals.comments;
        const prevEngagementRate = previousPeriodTotals.impressions > 0 ? (prevEngagementValue / previousPeriodTotals.impressions) * 100 : 0;
        
        const finalPrevTotals = {
            ...previousPeriodTotals,
            engagement: prevEngagementValue,
            engagementRate: prevEngagementRate
        };

        return {
            currentPosts: currentPeriodPosts,
            prevTotals: finalPrevTotals,
        };
    }, [posts, dateRange]);

    const { totals, chartData, topPosts, bestPost } = useMemo(() => {
        const newTotals = currentPosts.reduce((acc, post) => {
            acc.impressions += post.views || 0;
            acc.likes += post.likes || 0;
            acc.comments += post.comments || 0;
            return acc;
        }, { impressions: 0, likes: 0, comments: 0, engagement: 0, engagementRate: 0 });

        newTotals.engagement = newTotals.likes + newTotals.comments;
        newTotals.engagementRate = newTotals.impressions > 0 ? (newTotals.engagement / newTotals.impressions) * 100 : 0;
        
        const newTopPosts = [...currentPosts]
            .map(p => ({...p, engagementRate: p.views ? (((p.likes || 0) + (p.comments || 0)) / p.views * 100) : 0}))
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 5);

        const newBestPost = newTopPosts.length > 0 ? newTopPosts[0] : null;

        const days = dateRange === '7d' ? 7 : (dateRange === '30d' ? 30 : 90);
        const dailyData = Array.from({ length: days }, (_, i) => {
             const date = new Date();
             date.setHours(0,0,0,0);
             date.setDate(date.getDate() - (days - 1 - i));
             const postsOnDay = currentPosts.filter(p => {
                 const postDate = new Date(p.scheduledAt!);
                 postDate.setHours(0,0,0,0);
                 return postDate.getTime() === date.getTime();
             });
             const impressions = postsOnDay.reduce((sum, p) => sum + (p.views || 0), 0);
             const engagement = postsOnDay.reduce((sum, p) => sum + (p.likes || 0) + (p.comments || 0), 0);
             return { date, impressions, engagement };
        });

        const newChartData = {
            labels: dailyData.map(d => d.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })),
            impressions: dailyData.map(d => d.impressions),
            engagement: dailyData.map(d => d.engagement),
        };

        return { totals: newTotals, chartData: newChartData, topPosts: newTopPosts, bestPost: newBestPost };
    }, [currentPosts, dateRange]);


    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-kolink-text dark:text-white">{t('statistics.title')}</h1>
                    <p className="mt-1 text-kolink-text-secondary dark:text-gray-400">{t('statistics.subtitle')}</p>
                </div>
                <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    {(['7d', '30d', '90d'] as DateRange[]).map(range => (
                        <button
                            key={range}
                            onClick={() => setDateRange(range)}
                            className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                                dateRange === range 
                                ? 'bg-white dark:bg-gray-700 text-kolink-blue shadow' 
                                : 'text-kolink-text-secondary dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
                            }`}
                        >
                            {t(`statistics.dateRanges.${range}`)}
                        </button>
                    ))}
                </div>
            </div>

            {currentPosts.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-64 p-8 mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <ChartBarIcon className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                    <p className="mt-4 font-semibold text-kolink-text dark:text-white">{t('statistics.noData')}</p>
                 </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-6 mt-8 sm:grid-cols-2 lg:grid-cols-4">
                        <AnalyticsCard title={t('statistics.metrics.impressions')} value={totals.impressions} previousValue={prevTotals.impressions} format="number" icon={<EyeIcon />} />
                        <AnalyticsCard title={t('statistics.metrics.engagementRate')} value={totals.engagementRate} previousValue={prevTotals.engagementRate} format="percent" icon={<FireIcon />} />
                        <AnalyticsCard title={t('statistics.metrics.likes')} value={totals.likes} previousValue={prevTotals.likes} format="number" icon={<HandThumbUpIcon />} />
                        <AnalyticsCard title={t('statistics.metrics.comments')} value={totals.comments} previousValue={prevTotals.comments} format="number" icon={<ChatBubbleLeftEllipsisIcon />} />
                    </div>

                    <div className="grid grid-cols-1 gap-8 mt-8 lg:grid-cols-5">
                        <div className="flex flex-col gap-8 lg:col-span-3">
                            <div className="p-6 bg-white sm:p-8 dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                                <h2 className="text-lg font-bold text-kolink-text dark:text-white">{t('statistics.chart.title')}</h2>
                                <PerformanceChart data={chartData} />
                            </div>
                            <div className="p-6 bg-white sm:p-8 dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                                <h2 className="text-lg font-bold text-kolink-text dark:text-white">{t('statistics.topPosts.title')}</h2>
                                <TopPostsTable posts={topPosts} />
                            </div>
                        </div>
                         <div className="lg:col-span-2">
                           <KeyInsightsCard posts={currentPosts} totals={totals} bestPost={bestPost} />
                         </div>
                    </div>
                </>
            )}
        </div>
    );
};

const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) {
        return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
};

const AnalyticsCard: React.FC<{ title: string; value: number; previousValue: number; format: 'number' | 'percent', icon: React.ReactElement }> = ({ title, value, previousValue, format, icon }) => {
    const { t } = useI18n();
    const change = calculatePercentageChange(value, previousValue);
    const isPositive = change >= 0;

    const formatValue = (val: number) => {
        if (format === 'number') return Math.round(val).toLocaleString('es-ES');
        return `${val.toFixed(1)}%`;
    };

    return (
        <div className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-kolink-text-secondary dark:text-gray-400">{title}</h3>
                <div className="p-2 bg-kolink-blue-light dark:bg-gray-700 text-kolink-blue dark:text-gray-300 rounded-lg">
                    {/* FIX: Explicitly specify the props type for React.cloneElement to resolve typing error. */}
                    {React.cloneElement<React.SVGProps<SVGSVGElement>>(icon, { className: 'w-5 h-5' })}
                </div>
            </div>
            <p className="mt-2 text-3xl font-bold text-kolink-text dark:text-white">{formatValue(value)}</p>
            <div className="flex items-center mt-2 text-sm">
                <span className={`flex items-center font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
                    {change.toFixed(1)}%
                </span>
                <span className="ml-1 text-kolink-text-secondary dark:text-gray-500">{t('statistics.comparison')}</span>
            </div>
        </div>
    );
};

const PerformanceChart: React.FC<{ data: { labels: string[], impressions: number[], engagement: number[] } }> = ({ data }) => {
    const { t } = useI18n();
    const svgRef = useRef<SVGSVGElement>(null);
    const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; dataIndex: number }>({ visible: false, x: 0, y: 0, dataIndex: -1 });

    const width = 500;
    const height = 250;
    const margin = { top: 20, right: 20, bottom: 30, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const maxImpressions = Math.max(...data.impressions, 1);
    const maxEngagement = Math.max(...data.engagement, 1);

    const xScale = (index: number) => margin.left + (index / (data.labels.length - 1)) * innerWidth;
    const yImpressionsScale = (value: number) => margin.top + innerHeight - (value / maxImpressions) * innerHeight;
    const yEngagementScale = (value: number) => margin.top + innerHeight - (value / maxEngagement) * innerHeight;

    const impressionsPath = data.impressions.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yImpressionsScale(d)}`).join(' ');
    const engagementPath = data.engagement.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yEngagementScale(d)}`).join(' ');
    
    const areaPath = `${impressionsPath} V ${innerHeight + margin.top} H ${margin.left} Z`;

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        const svg = svgRef.current;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const dataIndex = Math.round(((x - margin.left) / innerWidth) * (data.labels.length - 1));
        
        if (dataIndex >= 0 && dataIndex < data.labels.length) {
            setTooltip({
                visible: true,
                x: xScale(dataIndex),
                y: e.clientY - rect.top,
                dataIndex: dataIndex,
            });
        }
    };
    
    const handleMouseLeave = () => setTooltip({ ...tooltip, visible: false });

    return (
        <div className="relative mt-6">
            <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
                <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                </defs>

                {/* Grid lines */}
                {Array.from({ length: 5 }).map((_, i) => (
                    <line key={i} x1={margin.left} y1={margin.top + (i * innerHeight / 4)} x2={width - margin.right} y2={margin.top + (i * innerHeight / 4)} className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="1" />
                ))}

                <path d={areaPath} fill="url(#areaGradient)" />
                <path d={impressionsPath} fill="none" className="stroke-kolink-blue" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d={engagementPath} fill="none" className="stroke-teal-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                {tooltip.visible && (
                    <g>
                        <line x1={tooltip.x} y1={margin.top} x2={tooltip.x} y2={innerHeight + margin.top} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1" strokeDasharray="3 3" />
                        <circle cx={tooltip.x} cy={yImpressionsScale(data.impressions[tooltip.dataIndex])} r="4" fill="white" className="stroke-kolink-blue" strokeWidth="2" />
                        <circle cx={tooltip.x} cy={yEngagementScale(data.engagement[tooltip.dataIndex])} r="4" fill="white" className="stroke-teal-500" strokeWidth="2" />
                    </g>
                )}
            </svg>

            {tooltip.visible && (
                <div 
                    className="absolute top-0 left-0 p-3 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 pointer-events-none transition-transform duration-100"
                    style={{ transform: `translate(${tooltip.x + 15}px, ${tooltip.y - 60}px)` }}
                >
                    <p className="text-sm font-semibold text-kolink-text dark:text-white">{data.labels[tooltip.dataIndex]}</p>
                    <div className="mt-2 space-y-1 text-xs">
                        <p className="flex items-center"><span className="w-2 h-2 mr-2 rounded-full bg-kolink-blue"></span>{t('statistics.chart.impressions')}: <strong className="ml-1">{data.impressions[tooltip.dataIndex].toLocaleString('es-ES')}</strong></p>
                        <p className="flex items-center"><span className="w-2 h-2 mr-2 rounded-full bg-teal-500"></span>{t('statistics.chart.engagement')}: <strong className="ml-1">{data.engagement[tooltip.dataIndex].toLocaleString('es-ES')}</strong></p>
                    </div>
                </div>
            )}
             <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-kolink-blue"></span>
                    <span className="text-kolink-text-secondary dark:text-gray-400">{t('statistics.chart.impressions')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-teal-500"></span>
                    <span className="text-kolink-text-secondary dark:text-gray-400">{t('statistics.chart.engagement')}</span>
                </div>
            </div>
        </div>
    );
};

const KeyInsightsCard: React.FC<{posts: Post[], totals: {impressions: number, engagement: number}, bestPost: Post | null}> = ({posts, totals, bestPost}) => {
    const {t} = useI18n();
    const insights = useMemo(() => {
        const calculatedInsights = [];

        if (posts.length > 0) {
            calculatedInsights.push(t('statistics.insights.totalPosts', { count: posts.length }));
            const avgImpressions = Math.round(totals.impressions / posts.length).toLocaleString('es-ES');
            calculatedInsights.push(t('statistics.insights.avgImpressions', { avgImpressions }));
        }
        
        if (bestPost) {
            calculatedInsights.push(t('statistics.insights.bestPost', {
                impressions: bestPost.views?.toLocaleString('es-ES'),
                postTitle: bestPost.content.substring(0, 30) + '...'
            }));
        }

        if (totals.engagement > 0) {
            calculatedInsights.push(t('statistics.insights.totalEngagement', { engagement: totals.engagement.toLocaleString('es-ES') }));
        }

        if (posts.length > 0) {
            const daysOfWeek = t('statistics.insights.daysOfWeek', { returnObjects: true }) as string[];
            const impressionsByDay: { [key: number]: number } = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
            posts.forEach(post => {
                if(post.scheduledAt) {
                    const day = new Date(post.scheduledAt).getDay();
                    impressionsByDay[day] += post.views || 0;
                }
            });
            const bestDayIndex = Object.keys(impressionsByDay).reduce((a, b) => impressionsByDay[parseInt(a)] > impressionsByDay[parseInt(b)] ? a : b);
            const totalImpressionsOnDays = Object.values(impressionsByDay).reduce((a, b) => a + b, 0);

            if (totalImpressionsOnDays > 0 && Array.isArray(daysOfWeek) && daysOfWeek.length === 7) {
                 calculatedInsights.push(t('statistics.insights.bestDay', { day: daysOfWeek[parseInt(bestDayIndex)] }));
            }
        }

        const postsWithImage = posts.filter(p => p.image);
        const postsWithoutImage = posts.filter(p => !p.image);
        
        if (postsWithImage.length > 0 && postsWithoutImage.length > 0) {
            const engagementWithImage = postsWithImage.reduce((sum, p) => sum + (p.likes || 0) + (p.comments || 0), 0) / postsWithImage.length;
            const engagementWithoutImage = postsWithoutImage.reduce((sum, p) => sum + (p.likes || 0) + (p.comments || 0), 0) / postsWithoutImage.length;

            if (engagementWithImage > engagementWithoutImage && engagementWithoutImage > 0) {
                const percent = ((engagementWithImage / engagementWithoutImage - 1) * 100).toFixed(0);
                calculatedInsights.push(t('statistics.insights.bestPostType', { type: t('statistics.insights.postTypes.with_image'), percent }));
            } else if (engagementWithoutImage > engagementWithImage && engagementWithImage > 0) {
                const percent = ((engagementWithoutImage / engagementWithImage - 1) * 100).toFixed(0);
                calculatedInsights.push(t('statistics.insights.bestPostType', { type: t('statistics.insights.postTypes.without_image'), percent }));
            }
        }
        
        if (calculatedInsights.length === 0) {
            calculatedInsights.push(t('statistics.insights.noBestPost'));
        }

        if (calculatedInsights.length < 3) {
            calculatedInsights.push(t('statistics.insights.defaultTip'));
        }

        return calculatedInsights;
    }, [posts, totals, bestPost, t]);


    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 h-full">
            <h2 className="text-lg font-bold text-kolink-text dark:text-white">{t('statistics.insights.title')}</h2>
            <ul className="mt-4 space-y-3">
                {insights.map((insight, index) => (
                    <li key={index} className="flex items-start text-sm text-kolink-text-secondary dark:text-gray-300">
                         <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span dangerouslySetInnerHTML={{ __html: insight }}></span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

const TopPostsTable: React.FC<{ posts: Post[] }> = ({ posts }) => {
    const { t } = useI18n();
    return (
        <div className="mt-6 flow-root">
             <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead>
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-kolink-text dark:text-white sm:pl-0">{t('statistics.topPosts.table.post')}</th>
                                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-kolink-text dark:text-white">{t('statistics.topPosts.table.impressions')}</th>
                                <th scope="col" className="hidden px-3 py-3.5 text-right text-sm font-semibold text-kolink-text dark:text-white sm:table-cell">{t('statistics.topPosts.table.likes')}</th>
                                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-kolink-text dark:text-white">{t('statistics.topPosts.table.engagementRate')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {posts.map(post => (
                                <tr key={post.id} className="align-top">
                                    <td className="max-w-md py-4 pl-4 pr-3 text-sm font-medium text-kolink-text dark:text-white sm:pl-0">
                                        <ExpandableText text={post.content || ''} />
                                    </td>
                                    <td className="px-3 py-4 text-sm text-right text-kolink-text-secondary dark:text-gray-400">{post.views?.toLocaleString('es-ES')}</td>
                                    <td className="hidden px-3 py-4 text-sm text-right text-kolink-text-secondary dark:text-gray-400 sm:table-cell">{post.likes?.toLocaleString('es-ES')}</td>
                                    <td className="px-3 py-4 text-sm text-right font-semibold text-kolink-blue dark:text-blue-400">{(post as any).engagementRate.toFixed(1)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Icons
const ArrowUpIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" /></svg>);
const ArrowDownIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" /></svg>);
const ChartBarIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>);
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>);
const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>);
const FireIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.464 5.992 5.992 0 0 1-1.925 3.546 5.973 5.973 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" /></svg>);
const HandThumbUpIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V3a.75.75 0 0 1 .75-.75A2.25 2.25 0 0 1 16.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904M6.633 10.5l-1.89-1.89a.75.75 0 0 0-1.06 0l-1.06 1.06a.75.75 0 0 0 0 1.06l4.5 4.5a.75.75 0 0 0 1.06 0l3.353-3.353a.75.75 0 0 0 0-1.06l-1.89-1.89a.75.75 0 0 0-1.061 0Z" /></svg>);
const ChatBubbleLeftEllipsisIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>);

export default Statistics;