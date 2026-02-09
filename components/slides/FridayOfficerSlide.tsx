
import React from 'react';
import type { FridayOfficerSlide } from '../../types';
import { t } from '../../i18n';

// Simple Icons
const MicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>
);
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const BookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
);
const SpeakerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><circle cx="12" cy="14" r="4"/><line x1="12" y1="6" x2="12.01" y2="6"/></svg>
);

interface OfficerCardProps {
    title: string;
    name: string;
    icon: React.ReactNode;
}

const OfficerCard: React.FC<OfficerCardProps> = ({ title, name, icon }) => (
    <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-white/20 flex flex-col items-center justify-center text-center gap-3 transition-transform hover:scale-105 duration-300">
        <div className="text-[var(--accent-color)] bg-white/10 p-3 rounded-full mb-2">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-white/80 uppercase tracking-widest">{title}</h3>
        <p className="text-2xl md:text-3xl font-bold text-white font-serif tracking-wide">{name || '-'}</p>
    </div>
);

export const FridayOfficerSlideDisplay: React.FC<{ slide: FridayOfficerSlide }> = ({ slide }) => {
    // Safety check: ensure officers object exists
    const officers = slide.officers || { khotib: '', imam: '', muadzin: '', bilal: '' };

    return (
        <div className="w-full flex flex-col justify-center items-center p-8 h-full">
            <div className="w-full max-w-6xl mx-auto flex flex-col h-full justify-center">
                <h1 className="text-4xl md:text-6xl font-bold text-center text-white text-shadow-lg mb-8 md:mb-12" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.7)'}}>
                    {slide.title || t('settings.slides.officer.title')}
                </h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 w-full">
                    <OfficerCard 
                        title={t('settings.slides.officer.khotib')} 
                        name={officers.khotib} 
                        icon={<BookIcon />} 
                    />
                    <OfficerCard 
                        title={t('settings.slides.officer.imam')} 
                        name={officers.imam} 
                        icon={<UserIcon />} 
                    />
                    <OfficerCard 
                        title={t('settings.slides.officer.muadzin')} 
                        name={officers.muadzin} 
                        icon={<MicIcon />} 
                    />
                    <OfficerCard 
                        title={t('settings.slides.officer.bilal')} 
                        name={officers.bilal} 
                        icon={<SpeakerIcon />} 
                    />
                </div>
            </div>
        </div>
    );
};
