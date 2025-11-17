import React, { useRef, useEffect } from 'react';

interface LinkedInPreviewProps {
  content: string;
  user: {
    name: string;
    avatar: string;
    headline: string;
  };
  device: 'mobile' | 'desktop';
  isEditable?: boolean;
  onContentChange?: (newContent: string) => void;
  onCopy?: () => void;
  t?: (key: string) => string;
}

const LinkedInPreview: React.FC<LinkedInPreviewProps> = ({ content, user, device, isEditable, onContentChange, onCopy, t }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditable && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content, isEditable, device]);

  const getDeviceWidthClass = (d: 'mobile' | 'desktop') => {
    switch (d) {
      case 'mobile':
        return 'max-w-[375px]';
      case 'desktop':
        return 'w-full';
      default:
        return 'w-full';
    }
  };

  return (
    <div className={`mx-auto transition-all duration-300 ${getDeviceWidthClass(device)}`}>
        <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 font-sans text-sm text-kolink-text dark:text-gray-300">
        <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center font-bold text-xl mr-3 flex-shrink-0">
            {user.avatar}
            </div>
            <div>
            <p className="font-semibold text-kolink-text dark:text-white">{user.name}</p>
            <p className="text-xs text-kolink-text-secondary dark:text-gray-400">{user.headline}</p>
            <p className="text-xs text-kolink-text-secondary dark:text-gray-400">Ahora</p>
            </div>
        </div>
        <div className="mt-4 text-kolink-text dark:text-gray-200 whitespace-pre-wrap">
             {isEditable ? (
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => onContentChange?.(e.target.value)}
                    className="w-full p-0 bg-transparent border-none resize-none focus:outline-none focus:ring-0 text-kolink-text dark:text-gray-200 text-sm"
                    rows={1}
                />
            ) : (
                content
            )}
        </div>
        <div className="mt-4 pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center space-x-6 text-kolink-text-secondary dark:text-gray-400">
            <div className="flex items-center space-x-2 cursor-pointer hover:text-kolink-blue dark:hover:text-blue-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V3a.75.75 0 0 1 .75-.75A2.25 2.25 0 0 1 16.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904M6.633 10.5l-1.89-1.89a.75.75 0 0 0-1.06 0l-1.06 1.06a.75.75 0 0 0 0 1.06l4.5 4.5a.75.75 0 0 0 1.06 0l3.353-3.353a.75.75 0 0 0 0-1.06l-1.89-1.89a.75.75 0 0 0-1.061 0Z"></path></svg>
                <span>Recomendar</span>
            </div>
            <div className="flex items-center space-x-2 cursor-pointer hover:text-kolink-blue dark:hover:text-blue-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H7.5z" clipRule="evenodd"></path></svg>
                <span>Comentar</span>
            </div>
            {onCopy && t && (
              <div onClick={onCopy} className="flex items-center space-x-2 cursor-pointer hover:text-kolink-blue dark:hover:text-blue-400 transition-colors">
                <PaperAirplaneIcon className="w-5 h-5" />
                <span>{t('generator.shareAction')}</span>
              </div>
            )}
        </div>
        </div>
    </div>
  );
};

const PaperAirplaneIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
    </svg>
);


export default LinkedInPreview;