import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import type { PrayerName, PrayerTimes } from '../types';
import { DisplayState } from '../types';
import { FocusClockLayout } from './layouts/FocusClockLayout';
import { DashboardInfoLayout } from './layouts/DashboardInfoLayout';
import { MinimalistLayout } from './layouts/MinimalistLayout';
import { t } from '../i18n';

interface MainClockProps {
    displayState: DisplayState;
    activePrayer: PrayerName | null;
    countdown: number;
    prayerTimes: PrayerTimes | null;
    nextPrayer: { name: PrayerName; time: Date; } | null;
    timeToNextPrayer: string;
    stale: boolean;
    isFriday: boolean;
}

export const MainClock: React.FC<MainClockProps> = (props) => {
    const { displayState, activePrayer, countdown, stale, isFriday } = props;
    const { settings } = useSettings();
    const [currentDhikrIndex, setCurrentDhikrIndex] = useState(0);
    const [dhikrOpacity, setDhikrOpacity] = useState(1);
    
    const [internalDisplayState, setInternalDisplayState] = useState(displayState);
    const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Filtered list of Dhikr based on user's custom list and selections
    const filteredDhikrList = useMemo(() => {
        if (!settings.dhikrList || !settings.selectedDhikr) {
            return [];
        }
        const selectedIds = new Set(settings.selectedDhikr);
        return settings.dhikrList.filter(d => selectedIds.has(d.id));
    }, [settings.dhikrList, settings.selectedDhikr]);

    useEffect(() => {
        if (displayState !== internalDisplayState) {
            if (transitionTimer.current) {
                clearTimeout(transitionTimer.current);
            }
            transitionTimer.current = setTimeout(() => {
                setInternalDisplayState(displayState);
            }, 500); 
        }

        return () => {
            if (transitionTimer.current) {
                clearTimeout(transitionTimer.current);
            }
        };
    }, [displayState, internalDisplayState]);


    useEffect(() => {
        let timer: ReturnType<typeof setInterval> | undefined;
        if (displayState === DisplayState.Dhikr && settings.dhikrDuration > 0 && filteredDhikrList.length > 0) {
            const intervalDuration = (settings.dhikrDuration * 60 * 1000) / filteredDhikrList.length;
            
            timer = setInterval(() => {
                setDhikrOpacity(0);
                setTimeout(() => {
                    setCurrentDhikrIndex(prevIndex => (prevIndex + 1) % filteredDhikrList.length);
                    setDhikrOpacity(1);
                }, 500);
            }, intervalDuration);

        } else if (displayState !== DisplayState.Dhikr) {
            setCurrentDhikrIndex(0);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [displayState, settings.dhikrDuration, filteredDhikrList]);

    const renderContent = () => {
        const prayerName = (isFriday && activePrayer === 'Dhuhr' && settings.enableFridayMode) 
            ? t('general.jumat').toUpperCase()
            : (activePrayer ? t(`prayerNames.${activePrayer}`).toUpperCase() : '');

        switch (internalDisplayState) {
            case DisplayState.PrayerTime:
                return (
                    <div className="text-center">
                        <h1 className="text-center text-[clamp(2.5rem,10vw,6rem)] font-bold animate-pulse leading-tight" style={{textShadow: '3px 3px 20px rgba(0,0,0,0.5)'}}>
                            {t('main.prayerTime')} {prayerName}
                        </h1>
                    </div>
                );
            case DisplayState.IqamahCountdown:
                 const countdownMinutes = String(Math.floor(countdown / 60)).padStart(2, '0');
                 const countdownSeconds = String(countdown % 60).padStart(2, '0');
                return (
                    <div className="text-center">
                        <h2 className="text-[clamp(1.5rem,6vw,4rem)]" style={{textShadow: '2px 2px 10px rgba(0,0,0,0.5)'}}>{t('main.iqamahIn')}</h2>
                        <h1 className="py-4 text-[clamp(5rem,25vw,15rem)] font-mono font-bold leading-none" style={{textShadow: '3px 3px 20px rgba(0,0,0,0.7)'}}>
                           <span className="inline-block animate-fade-in w-[0.55em] text-center">{countdownMinutes[0]}</span>
                           <span className="inline-block animate-fade-in w-[0.55em] text-center">{countdownMinutes[1]}</span>
                           :
                           <span className="inline-block animate-fade-in w-[0.55em] text-center">{countdownSeconds[0]}</span>
                           <span className="inline-block animate-fade-in w-[0.55em] text-center">{countdownSeconds[1]}</span>
                        </h1>
                    </div>
                );
            case DisplayState.KhutbahInProgress:
                return (
                    <div className="text-center">
                        <h1 className="text-center text-[clamp(2.5rem,10vw,6rem)] font-bold leading-tight" style={{textShadow: '3px 3px 20px rgba(0,0,0,0.5)'}}>
                           {settings.khutbahMessageTitle}
                        </h1>
                        <p className="mt-4 text-[clamp(1.2rem,4vw,2rem)] text-slate-700 dark:text-white/80">
                           {settings.khutbahMessageTagline}
                        </p>
                    </div>
                );
            case DisplayState.PrayerInProgress:
                return (
                    <div className="text-center">
                        <h1 className="text-center text-[clamp(2.5rem,10vw,6rem)] font-bold leading-tight" style={{textShadow: '3px 3px 20px rgba(0,0,0,0.5)'}}>
                            {t('main.prayerInProgress')}
                        </h1>
                        <p className="mt-4 text-[clamp(1.2rem,4vw,2rem)] text-slate-700 dark:text-white/80">
                            {t('main.prayerInProgressTagline')}
                        </p>
                    </div>
                );
            case DisplayState.DimScreen:
                return (
                    <div className="fixed inset-0 bg-black z-50"></div>
                );
            case DisplayState.Dhikr:
                const currentDhikr = filteredDhikrList[currentDhikrIndex];
                if (!currentDhikr) {
                     return <h1 className="text-center text-[clamp(2.5rem,8vw,5rem)] font-bold leading-tight">{t('main.dhikr')}</h1>;
                }

                const arabicLen = currentDhikr.arabic.length;
                let arabicFontSizeClass = "text-[clamp(2.5rem,8vw,6rem)]";
                if (arabicLen > 50) arabicFontSizeClass = "text-[clamp(2rem,6vw,4.5rem)]";
                if (arabicLen > 100) arabicFontSizeClass = "text-[clamp(1.5rem,4vw,3.5rem)]";

                const latinLen = currentDhikr.latin.length;
                let latinFontSizeClass = "text-[clamp(1.2rem,4vw,2rem)]";
                if (latinLen > 70) latinFontSizeClass = "text-[clamp(1rem,3vw,1.5rem)]";

                return (
                     <div 
                        className="text-center transition-opacity duration-500 ease-in-out w-full h-full flex flex-col items-center justify-center" 
                        style={{ opacity: dhikrOpacity, textShadow: '2px 2px 10px rgba(0,0,0,0.5)' }}
                    >
                        <div className="flex flex-col items-center justify-center gap-4 md:gap-6 max-w-5xl mx-auto">
                            <p className="text-xl text-slate-600 dark:text-white/70 uppercase tracking-widest">
                                {t('main.dhikr')}
                            </p>
                            <h1
                                className={`${arabicFontSizeClass} font-bold leading-relaxed`}
                                lang="ar"
                                style={{ fontFamily: "'Amiri', serif" }}
                            >
                                {currentDhikr.arabic}
                            </h1>
                            <p className={`${latinFontSizeClass} text-slate-700 dark:text-white/80 italic`}>
                                {currentDhikr.latin}
                            </p>
                        </div>
                    </div>
                );
            case DisplayState.Clock:
            default:
                const layoutProps = { ...props, stale: stale };
                switch (settings.layoutTemplate) {
                    case 'dashboard-info':
                        return <DashboardInfoLayout {...layoutProps} />;
                    case 'minimalis':
                        return <MinimalistLayout {...layoutProps} />;
                    case 'focus-jam':
                    default:
                        return <FocusClockLayout {...layoutProps} />;
                }
        }
    };

    const layoutSpecificClasses = settings.layoutTemplate === 'dashboard-info'
        ? 'justify-start items-stretch h-full' // For dashboard, align top, stretch items, and ensure full height
        : 'justify-center items-center h-full'; // For other layouts, center everything

    return (
        <div 
            className={`flex flex-col w-full p-4 transition-all duration-500 ease-in-out transform
                ${layoutSpecificClasses}
                ${displayState === internalDisplayState ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
            `}
        >
            {renderContent()}
        </div>
    );
};