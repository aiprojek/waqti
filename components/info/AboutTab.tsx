
import React, { useState, useEffect, useCallback } from 'react';
import { t } from '../../i18n';

// --- Social Icons ---
const CoffeeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>);
const TelegramIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 15 22l-4-9-9-4 20-7z" /></svg>);
const GithubIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>);

// --- Navigation Icons ---
const ChevronLeft = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>);
const ChevronRight = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>);

// --- Feature Icons Mapping ---
// Maps the index of the feature string to a specific icon
const getFeatureIcon = (index: number) => {
    // Even smaller size for compact look
    const size = "28"; 
    const icons = [
        <svg key="0" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, // Clock
        <svg key="1" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>, // Mobile
        <svg key="2" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="16" y1="14" x2="16" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>, // Calc
        <svg key="3" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>, // Hourglass
        <svg key="4" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4 8 4v14"/><path d="M10 9a3 3 0 0 0-3 3v9"/><path d="M14 21v-9a3 3 0 0 0-3-3"/></svg>, // Mosque
        <svg key="5" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>, // Layouts
        <svg key="6" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><path d="M10 8l5 3-5 3z"/></svg>, // Slideshow
        <svg key="7" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.74 5.74-5.74 5.74c-.78.78-.78 2.05 0 2.83l5.74 5.74-5.74 5.74c-.78.78-2.05.78-2.83 0l-5.74-5.74 5.74-5.74c.78-.78.78-2.05 0-2.83L3.51 8.43 9.25 2.69c.78-.78 2.05-.78 2.83 0z"/></svg>, // Presets
        <svg key="8" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>, // Palette
        <svg key="9" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 18.5a1.5 1.5 0 0 0-1.5-1.5H8a1.5 1.5 0 0 0 0 3h7.5a1.5 1.5 0 0 0 1.5-1.5Z"/><path d="M17 5.5a1.5 1.5 0 0 1-1.5 1.5H8a1.5 1.5 0 0 1 0-3h7.5a1.5 1.5 0 0 1 1.5 1.5Z"/><path d="M4 12h16"/></svg>, // Text
        <svg key="10" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>, // Dhikr
        <svg key="11" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><path d="M12 17v4"/><path d="M8 21h8"/></svg>, // Dim Screen
        <svg key="12" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>, // Sleep
        <svg key="13" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, // User
        <svg key="14" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22.61 16.95A5 5 0 0 0 18 10h-1.26a8 8 0 0 0-7.05-6M5 5a8 8 0 0 0 4 15h9a5 5 0 0 0 1.7-.3"/><line x1="1" y1="1" x2="23" y2="23"/></svg>, // Cloud Off
        <svg key="15" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>, // Lightning
        <svg key="16" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>, // Save
    ];
    return icons[index] || icons[0];
};

export const AboutTab: React.FC = () => {
    const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const features = t('info.about.features', {}).split('|').map(f => {
        const [title, description] = f.split(':', 2);
        return { title, description };
    });

    const nextFeature = useCallback(() => {
        setCurrentFeatureIndex((prev) => (prev + 1) % features.length);
    }, [features.length]);

    const prevFeature = useCallback(() => {
        setCurrentFeatureIndex((prev) => (prev - 1 + features.length) % features.length);
    }, [features.length]);

    useEffect(() => {
        if (!isHovered) {
            const timer = setInterval(nextFeature, 4000);
            return () => clearInterval(timer);
        }
    }, [isHovered, nextFeature]);

    return (
        <div className="space-y-6 pb-4">
            <section className="text-center">
                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent-color)] to-purple-600 mb-2">{t('info.about.appName')}</h1>
                <p className="mt-2 text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                    {t('info.about.description_part1')}
                    <a href="https://mawaqit.net" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-color)] hover:underline font-semibold decoration-2 decoration-[var(--accent-color)]/30 hover:decoration-[var(--accent-color)]">
                        {t('info.about.mawaqit_link_text')}
                    </a>
                    {t('info.about.description_part2')}
                </p>
            </section>

            <section className="max-w-4xl mx-auto px-1 md:px-6">
                <div className="flex items-center justify-center mb-4">
                    <span className="h-px w-8 bg-slate-300 dark:bg-slate-700"></span>
                    <h2 className="text-sm font-bold px-3 uppercase tracking-widest text-slate-500 dark:text-slate-400">{t('info.about.featuresTitle')}</h2>
                    <span className="h-px w-8 bg-slate-300 dark:bg-slate-700"></span>
                </div>
                
                {/* Carousel Container with External Controls */}
                <div 
                    className="flex flex-col items-center"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div className="flex items-center justify-between w-full gap-4">
                        {/* External Left Button */}
                        <button 
                            onClick={prevFeature}
                            className="hidden md:flex flex-shrink-0 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-[var(--accent-color)] transition-all shadow-sm border border-slate-200 dark:border-slate-700"
                            aria-label="Previous Feature"
                        >
                            <ChevronLeft />
                        </button>

                        {/* Compact Feature Card */}
                        <div 
                            className="relative flex-grow rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:shadow-xl group"
                            style={{ minHeight: '160px' }}
                        >
                            {/* Dynamic Background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-black"></div>
                            
                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-color)]/5 rounded-bl-full"></div>
                            
                            {/* Content */}
                            <div className="relative z-10 flex flex-col items-center justify-center text-center h-full p-5">
                                <div key={currentFeatureIndex} className="animate-fade-in flex flex-col items-center">
                                    <div className="mb-2 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-[var(--accent-color)] border border-slate-100 dark:border-slate-700">
                                        {getFeatureIcon(currentFeatureIndex)}
                                    </div>
                                    <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-1">
                                        {features[currentFeatureIndex].title}
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-snug">
                                        {features[currentFeatureIndex].description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* External Right Button */}
                        <button 
                            onClick={nextFeature}
                            className="hidden md:flex flex-shrink-0 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-[var(--accent-color)] transition-all shadow-sm border border-slate-200 dark:border-slate-700"
                            aria-label="Next Feature"
                        >
                            <ChevronRight />
                        </button>
                    </div>

                    {/* External Dots Indicator */}
                    <div className="flex justify-center gap-1.5 mt-4 flex-wrap px-4">
                        {features.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentFeatureIndex(idx)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    idx === currentFeatureIndex 
                                    ? 'bg-[var(--accent-color)] w-6' 
                                    : 'bg-slate-300 dark:bg-slate-700 w-1.5 hover:bg-slate-400'
                                }`}
                                aria-label={`Go to feature ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <section className="max-w-3xl mx-auto pt-4 border-t border-slate-200 dark:border-slate-700 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                     <a href="https://lynk.id/aiprojek/s/bvBJvdA" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-center gap-2 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all duration-200">
                        <div className="text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                            <CoffeeIcon />
                        </div>
                        <span className="font-semibold text-sm text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{t('info.about.coffee')}</span>
                    </a>
                    <a href="https://t.me/aiprojek_community" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-center gap-2 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-sky-500 dark:hover:border-sky-500 hover:shadow-md transition-all duration-200">
                        <div className="text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform">
                            <TelegramIcon />
                        </div>
                        <span className="font-semibold text-sm text-slate-700 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400">{t('info.about.discussion')}</span>
                    </a>
                    <a href="https://github.com/aiprojek/waqti" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-center gap-2 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-500 dark:hover:border-slate-400 hover:shadow-md transition-all duration-200">
                        <div className="text-slate-600 dark:text-slate-400 group-hover:scale-110 transition-transform">
                            <GithubIcon />
                        </div>
                        <span className="font-semibold text-sm text-slate-700 dark:text-slate-200 group-hover:text-slate-600 dark:group-hover:text-slate-300">{t('info.about.github')}</span>
                    </a>
                </div>
            </section>
            
            <footer className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
                <p className="mb-1">{t('info.developedBy')} <a href="https://aiprojek01.my.id/" target="_blank" rel="noopener noreferrer" className="font-bold text-[var(--accent-color)] hover:underline">AI Projek</a>.</p>
                <div className="flex justify-center gap-2 opacity-80">
                    <p>{t('info.license')} <a href="https://www.gnu.org/licenses/gpl-3.0.en.html" target="_blank" rel="noopener noreferrer" className="font-mono hover:underline">GNU GPLv3</a></p>
                    <span>•</span>
                    <p>{t('info.dataSource')} <a href="https://aladhan.com/prayer-times-api" target="_blank" rel="noopener noreferrer" className="underline">Aladhan API</a></p>
                </div>
            </footer>
        </div>
    );
};
