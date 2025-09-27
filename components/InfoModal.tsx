import React, { useState, useMemo } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { t } from '../i18n';
import { AboutTab } from './info/AboutTab';
import { GuideTab } from './info/GuideTab';
import { ContactTab } from './info/ContactTab';

const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
);

const TABS = ['about', 'guide', 'contact'];
type TabNameKey = (typeof TABS)[number];

interface PageProps {
    onBack: () => void;
    defaultTab?: TabNameKey;
}

export const InfoPage: React.FC<PageProps> = ({ onBack, defaultTab = 'about' }) => {
    const [activeTab, setActiveTab] = useState<TabNameKey>(defaultTab);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    const TAB_COMPONENTS: Record<TabNameKey, React.ReactNode> = {
        'about': <AboutTab />,
        'guide': <GuideTab />,
        'contact': <ContactTab />,
    };

    return (
        <div className="h-screen bg-white/80 dark:bg-black/60 backdrop-blur-md flex flex-col">
            <header className="bg-white/80 dark:bg-slate-900/80 p-4 flex items-center border-b border-slate-200 dark:border-slate-700 z-10 flex-shrink-0">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
                    <BackIcon />
                </button>
                <h2 className="text-2xl font-bold text-center flex-grow">{t('info.title')}</h2>
                <div className="w-10"></div> {/* Spacer to balance the title */}
            </header>

             <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
                <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 p-4 flex-shrink-0">
                    {/* Mobile Dropdown */}
                    <div className="md:hidden relative">
                        <button
                            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                            className="w-full flex justify-between items-center p-3 rounded-md font-semibold bg-slate-200/50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600"
                        >
                            <span>{t(`info.tabs.${activeTab}`)}</span>
                            <span className={`transform transition-transform duration-200 ${isMobileNavOpen ? 'rotate-180' : ''}`}>
                                <ChevronDownIcon />
                            </span>
                        </button>
                        {isMobileNavOpen && (
                            <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsMobileNavOpen(false)}></div>
                            <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 rounded-md shadow-lg z-20 border border-slate-200 dark:border-slate-700 py-1">
                                {TABS.map(tabKey => (
                                    <button
                                        key={tabKey}
                                        onClick={() => {
                                            setActiveTab(tabKey as TabNameKey);
                                            setIsMobileNavOpen(false);
                                        }}
                                        className={`w-full text-left p-3 text-sm font-medium transition-colors ${
                                            activeTab === tabKey 
                                            ? 'bg-[var(--accent-color)] text-white' 
                                            : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        {t(`info.tabs.${tabKey}`)}
                                    </button>
                                ))}
                            </div>
                            </>
                        )}
                    </div>

                    {/* Desktop Sidebar */}
                    <nav className="hidden md:flex flex-col gap-2">
                        {TABS.map(tabKey => (
                            <button
                                key={tabKey}
                                onClick={() => setActiveTab(tabKey as TabNameKey)}
                                className={`w-full text-left p-3 rounded-md text-sm font-semibold transition-colors ${
                                    activeTab === tabKey 
                                    ? 'bg-[var(--accent-color)] text-white' 
                                    : 'hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                                }`}
                            >
                                {t(`info.tabs.${tabKey}`)}
                            </button>
                        ))}
                    </nav>
                </aside>

                <main className="flex-grow p-6 overflow-y-auto">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {TAB_COMPONENTS[activeTab]}
                    </div>
                </main>
            </div>
        </div>
    );
};