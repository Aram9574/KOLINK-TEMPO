import React, { useState, useMemo, DragEvent } from 'react';
import { usePosts } from '../context/PostsContext';
import { useI18n } from '../hooks/useI18n';
import type { Post, TaskStatus } from '../types';
import { useGamification } from '../hooks/useGamification';
import { useToast } from '../hooks/useToast';

type View = 'calendar' | 'list';
type PostStatusFilter = 'all' | 'draft' | 'scheduled' | 'published';

const MyPosts: React.FC = () => {
    const { t } = useI18n();
    const { posts, updatePost, deletePost } = usePosts();
    const [view, setView] = useState<View>('calendar');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [dropDate, setDropDate] = useState<Date | null>(null);

    const drafts = useMemo(() => posts.filter(p => p.status === 'draft'), [posts]);
    
    const handleDragStart = (e: DragEvent<HTMLDivElement>, post: Post) => {
        e.dataTransfer.setData("postId", post.id);
    };

    const handleDrop = (date: Date, draggedPostId: string) => {
        const postToSchedule = posts.find(p => p.id === draggedPostId);
        if (postToSchedule && postToSchedule.status === 'draft') {
            setEditingPost(postToSchedule);
            setDropDate(date);
            setIsModalOpen(true);
        }
    };

    const handlePostClick = (post: Post) => {
        setEditingPost(post);
        setDropDate(null);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPost(null);
        setDropDate(null);
    };

    const handleSavePost = (post: Post) => {
        updatePost(post.id, post);
        handleCloseModal();
    };

    const handleDeletePost = (id: string) => {
        deletePost(id);
        handleCloseModal();
    };


    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-kolink-text dark:text-white">{t('myPosts.title')}</h1>
                     <p className="mt-1 text-kolink-text-secondary dark:text-gray-400">{t('myPosts.subtitle')}</p>
                </div>
                 <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg self-start">
                    <ViewToggle a="calendar" b="list" selected={view} setSelected={setView} t={t} />
                </div>
            </div>

            {view === 'calendar' ? (
                <div className="flex flex-col lg:flex-row gap-8 mt-8">
                    <DraftsSidebar drafts={drafts} onDragStart={handleDragStart} onClickPost={handlePostClick} />
                    <CalendarView posts={posts} onDrop={handleDrop} onClickPost={handlePostClick} />
                </div>
            ) : (
                <ListView posts={posts} onClickPost={handlePostClick} onStatusChange={updatePost} />
            )}

            {isModalOpen && editingPost && (
                <PostEditModal 
                    post={editingPost}
                    initialDate={dropDate}
                    onClose={handleCloseModal}
                    onSave={handleSavePost}
                    onDelete={handleDeletePost}
                />
            )}
        </div>
    );
};

const ViewToggle: React.FC<{a: View, b: View, selected: View, setSelected: (v: View) => void, t: (k:string) => string}> = ({ a, b, selected, setSelected, t }) => (
    <>
        <button
            onClick={() => setSelected(a)}
            className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors w-full sm:w-auto ${selected === a ? 'bg-white dark:bg-gray-700 text-kolink-blue shadow' : 'text-kolink-text-secondary dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'}`}
        >{t(`myPosts.view.${a}`)}</button>
        <button
            onClick={() => setSelected(b)}
            className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors w-full sm:w-auto ${selected === b ? 'bg-white dark:bg-gray-700 text-kolink-blue shadow' : 'text-kolink-text-secondary dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'}`}
        >{t(`myPosts.view.${b}`)}</button>
    </>
);

const DraftsSidebar: React.FC<{drafts: Post[], onDragStart: (e: DragEvent<HTMLDivElement>, post: Post) => void, onClickPost: (post: Post) => void}> = ({ drafts, onDragStart, onClickPost }) => {
    const { t } = useI18n();
    return (
        <aside className="w-full lg:w-1/4 lg:max-w-xs flex-shrink-0">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 h-full">
                <h2 className="text-lg font-bold text-kolink-text dark:text-white">{t('myPosts.draftsSidebar.title')}</h2>
                <p className="text-xs text-kolink-text-secondary dark:text-gray-400 mt-1">{t('myPosts.draftsSidebar.subtitle')}</p>
                <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    {drafts.length > 0 ? drafts.map(post => (
                        <div 
                            key={post.id} 
                            draggable
                            onDragStart={(e) => onDragStart(e, post)}
                            onClick={() => onClickPost(post)}
                            className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-grab active:cursor-grabbing hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <p className="text-sm text-kolink-text-secondary dark:text-gray-300 line-clamp-2">{post.content}</p>
                        </div>
                    )) : <p className="text-sm text-kolink-text-secondary dark:text-gray-400 text-center py-8">{t('myPosts.noDrafts')}</p>}
                </div>
            </div>
        </aside>
    );
};

const CalendarView: React.FC<{posts: Post[], onDrop: (date: Date, postId: string) => void, onClickPost: (post: Post) => void}> = ({ posts, onDrop, onClickPost }) => {
    const { t } = useI18n();
    const [currentDate, setCurrentDate] = useState(new Date());
    
    const taskStatusColors: Record<TaskStatus, string> = {
        todo: 'bg-yellow-400',
        inprogress: 'bg-blue-400',
        completed: 'bg-green-500',
    };

    const { month, year, daysInMonth, firstDayOfMonth } = useMemo(() => {
        const date = new Date(currentDate);
        return {
            month: date.getMonth(),
            year: date.getFullYear(),
            daysInMonth: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(),
            firstDayOfMonth: (new Date(date.getFullYear(), date.getMonth(), 1).getDay() + 6) % 7,
        };
    }, [currentDate]);

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const scheduledPostsByDay = useMemo(() => {
        return posts.reduce((acc, post) => {
            if (post.status === 'scheduled' && post.scheduledAt) {
                const day = post.scheduledAt.getDate();
                if (!acc[day]) acc[day] = [];
                acc[day].push(post);
            }
            return acc;
        }, {} as Record<number, Post[]>);
    }, [posts]);

    return (
        <div className="flex-1 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronLeftIcon /></button>
                <h2 className="text-xl font-bold text-kolink-text dark:text-white">{t(`myPosts.calendar.months.${month}`)} {year}</h2>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronRightIcon /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-kolink-text-secondary dark:text-gray-400">
                {t('myPosts.calendar.daysShort').map(day => <div key={day} className="py-2">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 h-[60vh]">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="border-t border-gray-100 dark:border-gray-700"></div>)}
                {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
                    const day = dayIndex + 1;
                    const date = new Date(year, month, day);
                    const isToday = new Date().toDateString() === date.toDateString();
                    const postsForDay = scheduledPostsByDay[day] || [];

                    const [isDragOver, setIsDragOver] = useState(false);
                    
                    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
                        e.preventDefault();
                        setIsDragOver(true);
                    };
                    const handleDragLeave = () => setIsDragOver(false);
                    const handleDropEvent = (e: DragEvent<HTMLDivElement>) => {
                        e.preventDefault();
                        setIsDragOver(false);
                        const postId = e.dataTransfer.getData("postId");
                        if (postId) {
                            onDrop(date, postId);
                        }
                    };

                    return (
                        <div 
                            key={day} 
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDropEvent}
                            className={`border-t border-gray-100 dark:border-gray-700 p-2 overflow-y-auto transition-colors ${isDragOver ? 'bg-kolink-blue-light dark:bg-blue-900/50' : ''}`}
                        >
                            <span className={`flex items-center justify-center text-sm w-7 h-7 rounded-full ${isToday ? 'bg-kolink-blue text-white' : 'text-kolink-text-secondary dark:text-gray-400'}`}>
                                {day}
                            </span>
                            <div className="mt-1 space-y-1">
                                {postsForDay.map(post => (
                                    <div key={post.id} onClick={() => onClickPost(post)} className="px-2 py-1 text-xs text-white bg-kolink-blue rounded cursor-pointer hover:bg-blue-700 flex items-center gap-2">
                                        {post.taskStatus && <span className={`w-2 h-2 rounded-full ${taskStatusColors[post.taskStatus]}`}></span>}
                                        <span className="truncate">{post.content}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const ListView: React.FC<{ posts: Post[], onClickPost: (post: Post) => void, onStatusChange: (id: string, updates: Partial<Post>) => void }> = ({ posts, onClickPost, onStatusChange }) => {
    const { t } = useI18n();
    const { showToast } = useToast();
    const [filter, setFilter] = useState<PostStatusFilter>('all');
    const [searchQuery, setSearchQuery] = useState('');
    
    const getStatus = (post: Post): PostStatusFilter => {
        if (post.status === 'draft') return 'draft';
        if (post.status === 'scheduled' && post.scheduledAt && post.scheduledAt > new Date()) return 'scheduled';
        return 'published';
    };

    const filteredPosts = useMemo(() => {
        return posts
            .map(p => ({...p, calculatedStatus: getStatus(p)}))
            .filter(p => {
                const statusMatch = filter === 'all' || p.calculatedStatus === filter;
                const searchMatch = searchQuery === '' || p.content.toLowerCase().includes(searchQuery.toLowerCase());
                return statusMatch && searchMatch;
            })
            .sort((a,b) => (b.scheduledAt?.getTime() || 0) - (a.scheduledAt?.getTime() || 0));
    }, [posts, filter, searchQuery]);

    const handleTaskStatusChange = (postId: string, newStatus: TaskStatus) => {
        onStatusChange(postId, { taskStatus: newStatus });
        showToast(t('myPosts.listView.taskStatusUpdateSuccess'), 'success');
    };
    
    return (
        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
             <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    {(['all', 'draft', 'scheduled', 'published'] as PostStatusFilter[]).map(f => (
                        <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${filter === f ? 'bg-white dark:bg-gray-800 text-kolink-blue shadow' : 'text-kolink-text-secondary dark:text-gray-400'}`}>
                            {t(`myPosts.listView.filters.${f}`)}
                        </button>
                    ))}
                </div>
                 <div className="relative">
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t('myPosts.listView.searchPlaceholder')} className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-kolink-blue focus:border-kolink-blue" />
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
            </div>
             <div className="mt-6 flow-root">
                <div className="-mx-6 -my-2 overflow-x-auto">
                    <div className="inline-block min-w-full py-2 align-middle px-6">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                           <thead>
                                <tr>
                                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-kolink-text dark:text-white sm:pl-0">{t('myPosts.listView.table.post')}</th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-kolink-text dark:text-white">{t('myPosts.listView.table.status')}</th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-kolink-text dark:text-white">{t('myPosts.listView.table.taskStatus')}</th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-kolink-text dark:text-white">{t('myPosts.listView.table.date')}</th>
                                </tr>
                           </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {filteredPosts.length > 0 ? (
                                    filteredPosts.map(post => (
                                        <tr key={post.id} onClick={() => onClickPost(post)} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                                            <td className="py-4 pl-4 pr-3 text-sm text-kolink-text-secondary dark:text-gray-400 sm:pl-0 max-w-md truncate">{post.content}</td>
                                            <td className="px-3 py-4"><StatusBadge status={post.calculatedStatus} t={t} /></td>
                                            <td className="px-3 py-4 text-sm">
                                                <TaskStatusDropdown 
                                                    status={post.taskStatus} 
                                                    onChange={(newStatus) => handleTaskStatusChange(post.id, newStatus)}
                                                    t={t}
                                                />
                                            </td>
                                            <td className="px-3 py-4 text-sm text-kolink-text-secondary dark:text-gray-400">{post.scheduledAt ? new Intl.DateTimeFormat('es-ES', {dateStyle: 'medium'}).format(post.scheduledAt) : 'N/A'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-16 text-kolink-text-secondary dark:text-gray-400">
                                            <div className="flex flex-col items-center">
                                                <MagnifyingGlassIcon className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                                                <p className="mt-4 font-semibold text-lg text-kolink-text dark:text-gray-200">{t('myPosts.listView.noResultsTitle')}</p>
                                                <p className="mt-1 text-sm">{t('myPosts.listView.noResultsDescription')}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TaskStatusDropdown: React.FC<{status?: TaskStatus; onChange: (newStatus: TaskStatus) => void; t: (k:string) => string}> = ({ status = 'todo', onChange, t }) => {
    
    const taskStatusColors: Record<TaskStatus, string> = {
        todo: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        inprogress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    };
    
    return (
        <select
            value={status}
            onChange={(e) => onChange(e.target.value as TaskStatus)}
            onClick={(e) => e.stopPropagation()}
            className={`px-2 py-1 text-xs font-medium rounded-full border-transparent focus:ring-2 focus:ring-kolink-blue focus:border-transparent ${taskStatusColors[status]}`}
        >
            <option value="todo">{t('myPosts.taskStatuses.todo')}</option>
            <option value="inprogress">{t('myPosts.taskStatuses.inprogress')}</option>
            <option value="completed">{t('myPosts.taskStatuses.completed')}</option>
        </select>
    );
};

const StatusBadge: React.FC<{status: PostStatusFilter, t: (k:string) => string}> = ({ status, t }) => {
    const styles = {
        draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        all: ''
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>{t(`myPosts.listView.statuses.${status}`)}</span>
}

const PostEditModal: React.FC<{post: Post; initialDate: Date | null; onClose: () => void; onSave: (post: Post) => void; onDelete: (id: string) => void;}> = ({ post, initialDate, onClose, onSave, onDelete }) => {
    const { t } = useI18n();
    const { addXp } = useGamification();
    const { showToast } = useToast();
    const [content, setContent] = useState(post.content);
    const [taskStatus, setTaskStatus] = useState<TaskStatus>(post.taskStatus || 'todo');
    
    const initialScheduleDate = post.scheduledAt || initialDate || new Date(new Date().setDate(new Date().getDate() + 1));
    const [date, setDate] = useState(initialScheduleDate.toISOString().split('T')[0]);
    const [time, setTime] = useState(initialScheduleDate.toTimeString().substring(0, 5));

    const handleSave = () => {
        const scheduledAt = new Date(`${date}T${time}`);
        const isScheduling = post.status === 'draft';

        onSave({
            ...post,
            content,
            status: 'scheduled',
            scheduledAt,
            taskStatus,
        });

        if (isScheduling) {
            addXp(15, t('gamification.xp.schedule'));
            showToast(t('myPosts.scheduleSuccess'), 'success');
        } else {
             showToast(t('myPosts.editModal.updateSuccess'), 'success');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl p-6 sm:p-8 m-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-kolink-text dark:text-white">{post.status === 'draft' ? t('myPosts.editModal.titleSchedule') : t('myPosts.editModal.titleEdit')}</h2>
                <div className="mt-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-kolink-text-secondary dark:text-gray-400">{t('myPosts.editModal.contentLabel')}</label>
                        <textarea value={content} onChange={e => setContent(e.target.value)} rows={8} className="mt-1 w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-kolink-blue focus:border-kolink-blue" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-1">
                            <label className="text-sm font-medium text-kolink-text-secondary dark:text-gray-400">{t('myPosts.listView.table.taskStatus')}</label>
                            <select value={taskStatus} onChange={e => setTaskStatus(e.target.value as TaskStatus)} className="mt-1 w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-kolink-blue focus:border-kolink-blue">
                                <option value="todo">{t('myPosts.taskStatuses.todo')}</option>
                                <option value="inprogress">{t('myPosts.taskStatuses.inprogress')}</option>
                                <option value="completed">{t('myPosts.taskStatuses.completed')}</option>
                            </select>
                        </div>
                        <div className="sm:col-span-1">
                            <label className="text-sm font-medium text-kolink-text-secondary dark:text-gray-400">{t('myPosts.dateLabel')}</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-kolink-blue focus:border-kolink-blue" />
                        </div>
                        <div className="sm:col-span-1">
                            <label className="text-sm font-medium text-kolink-text-secondary dark:text-gray-400">{t('myPosts.timeLabel')}</label>
                            <input type="time" value={time} onChange={e => setTime(e.target.value)} className="mt-1 w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-kolink-blue focus:border-kolink-blue" />
                        </div>
                    </div>
                </div>
                 <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button onClick={() => onDelete(post.id)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 rounded-lg hover:bg-red-200 dark:hover:bg-red-900">
                        <TrashIcon />
                        {t('myPosts.delete')}
                    </button>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-kolink-text dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">{t('myPosts.cancel')}</button>
                        <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold text-white bg-kolink-blue rounded-lg hover:bg-blue-700">{post.status === 'draft' ? t('myPosts.saveSchedule') : t('myPosts.editModal.saveChanges')}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// Icons
const ChevronLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>);
const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>);
const MagnifyingGlassIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>);
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.134H8.09a2.09 2.09 0 0 0-2.09 2.134v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>);


export default MyPosts;