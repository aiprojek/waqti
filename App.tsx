
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { PrayerTimesDisplay } from './components/PrayerTimesDisplay';
import { MainClock } from './components/MainClock';
import { AppHeader } from './components/AppHeader';
import { Footer } from './components/Footer';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { RemoteProvider, useRemote } from './contexts/RemoteContext';
import { SettingsPage } from './components/SettingsModal';
import { InfoPage } from './components/InfoModal';
import { SlideDisplay } from './components/SlideDisplay';
import { RemoteView } from './components/RemoteView';
import useClock from './hooks/useClock';
import usePrayerTimes from './hooks/usePrayerTimes';
import { DisplayState, PrayerName, PrayerTimes } from './types';
import { IQAMAH_PRAYERS, PRAYER_NAMES } from './constants';
import { parseTimeToDate } from './utils';
import { t } from './i18n';
import { WelcomeModal } from './components/WelcomeModal';
import { db } from './lib/db';
import { useBlobUrl } from './hooks/useBlobUrl';
import { BluetoothRemote } from './lib/bluetoothRemote';
import { Capacitor } from '@capacitor/core';

// --- Flash Message Component ---
const FlashMessageOverlay: React.FC<{ message: string | null }> = ({ message }) => {
    if (!message) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-800 border-4 border-[var(--accent-color)] rounded-3xl p-8 md:p-12 shadow-2xl max-w-4xl w-full text-center relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--accent-color)]/20 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[var(--accent-color)]/20 rounded-full blur-2xl"></div>

                <div className="flex flex-col items-center gap-4 relative z-10">
                    <div className="w-16 h-16 bg-[var(--accent-color)]/20 text-[var(--accent-color)] rounded-full flex items-center justify-center mb-2 animate-bounce">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-800 dark:text-white leading-tight">
                        {message}
                    </h2>
                </div>
            </div>
        </div>
    );
};

// This component isolates all the logic that needs to update every second.
const TimeSensitiveContent: React.FC<{
    prayerTimes: PrayerTimes | null,
    stale: boolean,
    displayState: DisplayState,
    setDisplayState: React.Dispatch<React.SetStateAction<DisplayState>>,
    activePrayer: PrayerName | null,
    setActivePrayer: React.Dispatch<React.SetStateAction<PrayerName | null>>,
    countdown: number,
    setCountdown: React.Dispatch<React.SetStateAction<number>>
}> = ({
    prayerTimes,
    stale,
    displayState,
    setDisplayState,
    activePrayer,
    setActivePrayer,
    countdown,
    setCountdown
}) => {
        const { settings } = useSettings();
        const { currentTime } = useClock();
        const { lastCommand } = useRemote();

        const dayOfMonth = currentTime.getDate();

        const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
        const [displayMode, setDisplayMode] = useState<'clock' | 'slide'>('clock');
        const [isTransitioning, setIsTransitioning] = useState(false);

        const alarmAudioRef = useRef(new Audio());

        // --- Flash Message State ---
        const [flashMessage, setFlashMessage] = useState<string | null>(null);
        const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

        const isFriday = useMemo(() => currentTime.getDay() === 5, [currentTime]);

        // Handle Playback Remote Commands & Flash Message
        useEffect(() => {
            if (!lastCommand) return;

            switch (lastCommand.type) {
                case 'NEXT_SLIDE':
                    if (displayMode !== 'slide') {
                        setDisplayMode('slide');
                    } else {
                        const enabledSlides = settings.slides.filter(s => s.enabled);
                        if (enabledSlides.length > 0) {
                            setCurrentSlideIndex(prev => (prev + 1) % enabledSlides.length);
                        }
                    }
                    break;
                case 'PREV_SLIDE':
                    if (displayMode !== 'slide') {
                        setDisplayMode('slide');
                    } else {
                        const enabledSlides = settings.slides.filter(s => s.enabled);
                        if (enabledSlides.length > 0) {
                            setCurrentSlideIndex(prev => (prev - 1 + enabledSlides.length) % enabledSlides.length);
                        }
                    }
                    break;
                case 'STOP_ALARM':
                    if (alarmAudioRef.current) {
                        alarmAudioRef.current.pause();
                        alarmAudioRef.current.currentTime = 0;
                    }
                    break;
                case 'REFRESH':
                    window.location.reload();
                    break;
                case 'SHOW_FLASH_MESSAGE':
                    if (lastCommand.payload) {
                        setFlashMessage(lastCommand.payload);
                        // Clear existing timer if any
                        if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
                        // Auto hide after 30 seconds
                        flashTimerRef.current = setTimeout(() => {
                            setFlashMessage(null);
                        }, 30000);
                    }
                    break;
            }
        }, [lastCommand, displayMode, settings.slides]);

        const prayerTimesToUse = useMemo(() => {
            if (!prayerTimes) return null;
            if (isFriday && settings.enableFridayMode && settings.fridayTimeSource === 'manual') {
                return {
                    ...prayerTimes,
                    Dhuhr: settings.manualFridayTime,
                };
            }
            return prayerTimes;
        }, [prayerTimes, isFriday, settings.enableFridayMode, settings.fridayTimeSource, settings.manualFridayTime]);

        const sortedPrayerTimes = useMemo(() => {
            if (!prayerTimesToUse) return [];
            return IQAMAH_PRAYERS
                .map(name => ({ name, time: parseTimeToDate(prayerTimesToUse[name]) }))
                .sort((a, b) => a.time.getTime() - b.time.getTime());
        }, [prayerTimesToUse, dayOfMonth]);

        const nextPrayer = useMemo(() => {
            if (sortedPrayerTimes.length === 0) return null;
            const now = currentTime.getTime();
            const futurePrayers = sortedPrayerTimes.filter(p => p.time.getTime() > now);

            if (futurePrayers.length > 0) {
                return futurePrayers[0];
            }
            const tomorrowPrayer = {
                ...sortedPrayerTimes[0],
                time: new Date(sortedPrayerTimes[0].time)
            };
            tomorrowPrayer.time.setDate(tomorrowPrayer.time.getDate() + 1);
            return tomorrowPrayer;
        }, [currentTime, sortedPrayerTimes]);

        const timeToNextPrayer = useMemo(() => {
            if (!nextPrayer) return '';
            let diff = nextPrayer.time.getTime() - currentTime.getTime();
            const totalSeconds = Math.floor(diff / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);

            if (hours > 0) {
                return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            }
            return `${String(minutes).padStart(2, '0')}:${String(Math.floor(totalSeconds % 60)).padStart(2, '0')}`;
        }, [currentTime, nextPrayer]);

        // Dynamic Page Title Effect
        useEffect(() => {
            const originalTitle = "Waqti";
            const isJumatPrayer = isFriday && settings.enableFridayMode && activePrayer === 'Dhuhr';

            switch (displayState) {
                case DisplayState.Clock:
                    if (nextPrayer) {
                        const nextPrayerName = isFriday && settings.enableFridayMode && nextPrayer.name === 'Dhuhr'
                            ? t('general.jummah')
                            : t(`prayerNames.${nextPrayer.name}`);
                        document.title = `${timeToNextPrayer} ${t('main.until')} ${nextPrayerName}`;
                    } else {
                        document.title = originalTitle;
                    }
                    break;
                case DisplayState.PrayerTime:
                    if (activePrayer) {
                        const prayerName = isJumatPrayer ? t('general.jummah') : t(`prayerNames.${activePrayer}`);
                        document.title = `${t('main.prayerTime')} ${prayerName.toUpperCase()}`;
                    }
                    break;
                default:
                    document.title = originalTitle;
            }

            return () => {
                document.title = originalTitle;
            }

        }, [displayState, timeToNextPrayer, nextPrayer, activePrayer, isFriday, settings]);


        const playAlarm = (soundSrc: string) => {
            const audio = alarmAudioRef.current;
            audio.src = soundSrc;
            audio.play().catch(error => console.error("Audio playback failed:", error));
        };

        // Prayer Time Trigger
        useEffect(() => {
            let prayerTimer: ReturnType<typeof setTimeout>;

            if (displayState === DisplayState.Clock && nextPrayer) {
                const now = new Date();
                const timeToNextAdhan = nextPrayer.time.getTime() - now.getTime();

                if (timeToNextAdhan > 0) {
                    prayerTimer = setTimeout(() => {
                        setActivePrayer(nextPrayer.name);
                        if (settings.enableAdhanAlarm) {
                            playAlarm(settings.adhanAlarmSound);
                        }
                        setDisplayState(DisplayState.PrayerTime);
                    }, timeToNextAdhan);
                }
            }

            return () => {
                if (prayerTimer) {
                    clearTimeout(prayerTimer);
                }
            };
        }, [nextPrayer, displayState, settings.enableAdhanAlarm, settings.adhanAlarmSound]);


        useEffect(() => {
            const isJumatPrayer = isFriday && settings.enableFridayMode && activePrayer === 'Dhuhr';

            if (displayState === DisplayState.PrayerTime && activePrayer) {
                const timer = setTimeout(() => {
                    if (isJumatPrayer) {
                        setDisplayState(DisplayState.KhutbahInProgress);
                    } else {
                        const iqamahOffset = settings.iqamahOffsets[activePrayer] * 60;
                        setCountdown(iqamahOffset);
                        setDisplayState(DisplayState.IqamahCountdown);
                    }
                }, 10000);
                return () => clearTimeout(timer);
            } else if (displayState === DisplayState.IqamahCountdown && activePrayer) {
                if (countdown > 0) {
                    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
                    return () => clearTimeout(timer);
                } else {
                    if (settings.enableIqamahAlarm) {
                        playAlarm(settings.iqamahAlarmSound);
                    }
                    setDisplayState(DisplayState.PrayerInProgress);
                }
            } else if (displayState === DisplayState.KhutbahInProgress) {
                const khutbahDurationMs = settings.fridayPrayerDuration * 60 * 1000;
                const timer = setTimeout(() => {
                    setDisplayState(DisplayState.Clock);
                    setActivePrayer(null);
                }, khutbahDurationMs);
                return () => clearTimeout(timer);
            } else if (displayState === DisplayState.PrayerInProgress && activePrayer) {
                if (settings.enableDimScreen && !isJumatPrayer) {
                    const timer = setTimeout(() => {
                        setDisplayState(DisplayState.DimScreen);
                    }, 10000);
                    return () => clearTimeout(timer);
                } else {
                    const durationForCurrentPrayer = settings.prayerDurations[activePrayer] || 10;
                    const prayerDurationMs = durationForCurrentPrayer * 60 * 1000;
                    const timer = setTimeout(() => {
                        if (isJumatPrayer || !settings.enableDhikr || (settings.selectedDhikr?.length ?? 0) === 0) {
                            setDisplayState(DisplayState.Clock);
                            setActivePrayer(null);
                        } else {
                            setDisplayState(DisplayState.Dhikr);
                        }
                    }, prayerDurationMs);
                    return () => clearTimeout(timer);
                }
            } else if (displayState === DisplayState.DimScreen && activePrayer) {
                const durationForCurrentPrayer = settings.prayerDurations[activePrayer] || 10;
                const dimDurationMs = (durationForCurrentPrayer * 60 * 1000) - 10000;
                const timer = setTimeout(() => {
                    if (!settings.enableDhikr || (settings.selectedDhikr?.length ?? 0) === 0) {
                        setDisplayState(DisplayState.Clock);
                        setActivePrayer(null);
                    } else {
                        setDisplayState(DisplayState.Dhikr);
                    }
                }, Math.max(0, dimDurationMs));
                return () => clearTimeout(timer);
            } else if (displayState === DisplayState.Dhikr) {
                const dhikrDurationMs = settings.dhikrDuration * 60 * 1000;
                const timer = setTimeout(() => {
                    setDisplayState(DisplayState.Clock);
                    setActivePrayer(null);
                }, dhikrDurationMs);
                return () => clearTimeout(timer);
            }
        }, [displayState, countdown, activePrayer, settings, isFriday]);

        const enabledSlides = useMemo(() => {
            return settings.slides.filter(s => {
                if (!s.enabled) return false;
                if (s.fridayOnly) {
                    return isFriday && settings.enableFridayMode && settings.enableFridaySlides;
                }
                return true;
            });
        }, [settings.slides, isFriday, settings.enableFridayMode, settings.enableFridaySlides]);

        useEffect(() => {
            if (enabledSlides.length === 0) {
                if (displayMode !== 'clock') setDisplayMode('clock');
                return;
            }

            const validIndex = currentSlideIndex >= enabledSlides.length ? 0 : currentSlideIndex;
            if (validIndex !== currentSlideIndex) {
                setCurrentSlideIndex(validIndex);
                return;
            }

            let durationSeconds: number;
            if (displayMode === 'clock') {
                durationSeconds = enabledSlides[validIndex].duration;
            } else {
                durationSeconds = enabledSlides[validIndex].duration;
            }

            const timer = setTimeout(() => {
                setIsTransitioning(true);
                setTimeout(() => {
                    if (displayMode === 'clock') {
                        setDisplayMode('slide');
                    } else {
                        const nextIndex = (validIndex + 1) % enabledSlides.length;
                        setCurrentSlideIndex(nextIndex);
                        setDisplayMode('clock');
                    }
                    setIsTransitioning(false);
                }, 500);
            }, (durationSeconds || 15) * 1000);

            return () => clearTimeout(timer);

        }, [enabledSlides, displayMode, currentSlideIndex]);


        return (
            <div className={`w-full h-full flex justify-center items-center transition-opacity duration-500 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                <FlashMessageOverlay message={flashMessage} />

                {displayState === DisplayState.Clock && displayMode === 'slide' && enabledSlides.length > 0 ? (
                    <SlideDisplay slide={enabledSlides[currentSlideIndex]} />
                ) : (
                    <MainClock
                        stale={stale}
                        displayState={displayState}
                        activePrayer={activePrayer}
                        countdown={countdown}
                        prayerTimes={prayerTimesToUse}
                        nextPrayer={nextPrayer}
                        timeToNextPrayer={timeToNextPrayer}
                        isFriday={isFriday}
                    />
                )}
            </div>
        );
    };

const GlobalThemeApplicator: React.FC = () => {
    const { settings } = useSettings();

    const hexToRgba = (hex: string, alpha: number) => {
        let c: any;
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            c = hex.substring(1).split('');
            if (c.length === 3) {
                c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = '0x' + c.join('');
            return `rgba(${[(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',')},${alpha})`;
        }
        return `rgba(139, 92, 246, ${alpha})`;
    };

    useEffect(() => {
        const root = document.documentElement;
        if (settings.theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // Apply Eco Mode Class
        if (settings.enableEcoMode) {
            document.body.classList.add('eco-mode');
        } else {
            document.body.classList.remove('eco-mode');
        }

        if (settings.accentColor) {
            root.style.setProperty('--accent-color', settings.accentColor);
            root.style.setProperty('--accent-glow-color', hexToRgba(settings.accentColor, 0.5));
        } else {
            root.style.setProperty('--accent-color', '#8B5CF6');
            root.style.setProperty('--accent-glow-color', 'rgba(139, 92, 246, 0.5)');
        }

        if (settings.fontStyle === 'serif') {
            document.body.style.fontFamily = 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif';
        } else {
            document.body.style.fontFamily = 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif';
        }

    }, [settings.theme, settings.accentColor, settings.fontStyle, settings.enableEcoMode]);

    return null;
};

const SleepOverlay: React.FC = () => {
    const { settings } = useSettings();
    const { currentTime } = useClock();
    const [isSleeping, setIsSleeping] = useState(false);

    useEffect(() => {
        if (!settings.enableSleepMode || !settings.sleepStartTime || !settings.sleepEndTime) {
            setIsSleeping(false);
            return;
        }

        const now = currentTime;
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const [startHour, startMinute] = settings.sleepStartTime.split(':').map(Number);
        const startMinutes = startHour * 60 + startMinute;

        const [endHour, endMinute] = settings.sleepEndTime.split(':').map(Number);
        const endMinutes = endHour * 60 + endMinute;

        let shouldSleep = false;
        if (startMinutes < endMinutes) {
            shouldSleep = currentMinutes >= startMinutes && currentMinutes < endMinutes;
        } else {
            shouldSleep = currentMinutes >= startMinutes || currentMinutes < endMinutes;
        }

        setIsSleeping(shouldSleep);
    }, [currentTime, settings.enableSleepMode, settings.sleepStartTime, settings.sleepEndTime]);

    if (!isSleeping) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black cursor-none"></div>
    );
};

const DynamicBackgroundView: React.FC<{
    children: React.ReactNode;
    prayerTimes: PrayerTimes | null;
    displayState?: DisplayState;
}> = ({ children, prayerTimes, displayState }) => {
    const { settings } = useSettings();
    const { currentTime } = useClock();

    const activeWallpaperSetting = useMemo(() => {
        if (!settings.enableContextualWallpapers || !prayerTimes) {
            return settings.wallpaper;
        }

        const todayPrayerMoments = IQAMAH_PRAYERS.map(name => ({
            name,
            date: parseTimeToDate(prayerTimes[name])
        }));

        const ishaTimeStr = prayerTimes['Isha'];
        if (!ishaTimeStr) return settings.wallpaper;

        const yesterdayIsha = parseTimeToDate(ishaTimeStr);
        yesterdayIsha.setDate(yesterdayIsha.getDate() - 1);

        const allMoments = [
            { name: 'Isha' as PrayerName, date: yesterdayIsha },
            ...todayPrayerMoments
        ].sort((a, b) => a.date.getTime() - b.date.getTime());

        const pastOrCurrentMoments = allMoments.filter(p => p.date.getTime() <= currentTime.getTime());

        let currentPrayerPeriod: PrayerName = 'Isha';
        if (pastOrCurrentMoments.length > 0) {
            currentPrayerPeriod = pastOrCurrentMoments[pastOrCurrentMoments.length - 1].name;
        }

        return settings.contextualWallpapers[currentPrayerPeriod as keyof typeof settings.contextualWallpapers] || settings.wallpaper;
    }, [currentTime, prayerTimes, settings]);

    const isFriday = useMemo(() => currentTime.getDay() === 5, [currentTime]);
    const isPrayerTime = displayState === DisplayState.PrayerInProgress ||
        displayState === DisplayState.DimScreen ||
        displayState === DisplayState.KhutbahInProgress;

    const showStream = settings.fridayStreamMode !== 'off' && isFriday && !isPrayerTime;

    const streamUrl = useMemo(() => {
        if (!showStream) return '';
        let baseUrl = '';
        if (settings.fridayStreamMode === 'makkah') baseUrl = settings.makkahStreamUrl;
        else if (settings.fridayStreamMode === 'madinah') baseUrl = settings.madinahStreamUrl;
        else if (settings.fridayStreamMode === 'custom') baseUrl = settings.customStreamUrl;

        if (!baseUrl) return '';
        const connector = baseUrl.includes('?') ? '&' : '?';
        return `${baseUrl}${connector}autoplay=1&mute=${settings.muteFridayStream ? '1' : '0'}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`;
    }, [showStream, settings.fridayStreamMode, settings.makkahStreamUrl, settings.madinahStreamUrl, settings.muteFridayStream]);

    const resolvedWallpaper = useBlobUrl(activeWallpaperSetting);

    const backgroundStyle: React.CSSProperties = {};
    const finalWallpaper = resolvedWallpaper || activeWallpaperSetting;

    if (finalWallpaper) {
        if (finalWallpaper.startsWith('#')) {
            backgroundStyle.backgroundColor = finalWallpaper;
        } else {
            backgroundStyle.backgroundImage = `url(${finalWallpaper})`;
            backgroundStyle.backgroundSize = 'cover';
            backgroundStyle.backgroundPosition = 'center';
        }
    }

    return (
        <div
            className={`
                h-screen font-sans text-slate-800 dark:text-white 
                bg-gray-100 dark:bg-gray-900 
                transition-colors duration-500 w-full relative overflow-hidden
            `}
        >
            {showStream && streamUrl && (
                <div className="absolute inset-0 z-0 bg-black">
                    <iframe
                        className="w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                        src={streamUrl}
                        title="Holy Sites Live Stream"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                    {/* Dark overlay for video to ensure readability */}
                    <div className="absolute inset-0 bg-black/40"></div>
                </div>
            )}

            <div
                style={backgroundStyle}
                className={`
                    absolute inset-0 transition-all duration-1000
                    ${showStream ? 'opacity-0' : 'opacity-100'}
                    ${settings.enableBackgroundAnimation && !finalWallpaper?.startsWith('#') && !settings.enableEcoMode && !showStream
                        ? 'animate-subtle-pan-zoom'
                        : 'transform scale-110'
                    }
                `}
            ></div>

            <div className={`
                absolute inset-0 transition-opacity duration-500
                ${showStream ? 'bg-black/10' : 'bg-black/20'}
                dark:bg-gradient-to-br dark:from-slate-900/70 dark:via-slate-800/50 dark:to-slate-900/70
                ${settings.theme === 'dark' && settings.enableBackgroundAnimation && !settings.enableEcoMode && !showStream ? 'animate-aurora' : ''}
            `}></div>

            <div className="relative z-10 h-full w-full">
                {children}
            </div>
        </div>
    );
};

const MainViewLayout: React.FC<{
    prayerTimes: PrayerTimes | null;
    stale: boolean;
    onSettingsClick: () => void;
    onInfoClick: () => void;
    displayState: DisplayState;
    setDisplayState: React.Dispatch<React.SetStateAction<DisplayState>>;
    activePrayer: PrayerName | null;
    setActivePrayer: React.Dispatch<React.SetStateAction<PrayerName | null>>;
    countdown: number;
    setCountdown: React.Dispatch<React.SetStateAction<number>>;
}> = React.memo(({
    prayerTimes,
    stale,
    onSettingsClick,
    onInfoClick,
    displayState,
    setDisplayState,
    activePrayer,
    setActivePrayer,
    countdown,
    setCountdown
}) => {
    const { settings } = useSettings();
    return (
        <div className="h-full flex flex-col w-full">
            <AppHeader onSettingsClick={onSettingsClick} onInfoClick={onInfoClick} />
            <main className={`flex-grow flex flex-col min-h-0 p-4 gap-4 md:gap-8 relative ${settings.layoutTemplate !== 'dashboard-info' ? 'justify-center items-center' : ''}`}>
                <TimeSensitiveContent
                    prayerTimes={prayerTimes}
                    stale={stale}
                    displayState={displayState}
                    setDisplayState={setDisplayState}
                    activePrayer={activePrayer}
                    setActivePrayer={setActivePrayer}
                    countdown={countdown}
                    setCountdown={setCountdown}
                />
            </main>
            <Footer />
        </div>
    );
});

const AppContent = () => {
    const [currentView, setCurrentView] = useState<'main' | 'settings' | 'info'>('main');
    const [infoDefaultTab, setInfoDefaultTab] = useState<'about' | 'guide' | 'services' | 'contact'>('about');
    const { prayerTimes, stale } = usePrayerTimes();
    const { language } = useLanguage();
    const { settings, saveSettings } = useSettings(); // Need access to saveSettings
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const { lastCommand, sendCommand } = useRemote();

    // --- Prayer State Machine Logic (Lifted) ---
    const [displayState, setDisplayState] = useState<DisplayState>(DisplayState.Clock);
    const [activePrayer, setActivePrayer] = useState<PrayerName | null>(null);
    const [countdown, setCountdown] = useState(0);

    // --- Remote Navigation & Control Logic ---
    const handleRemoteCommand = useCallback((command: any) => {
        if (!command) return;

        // Navigation Helper function
        const navigateFocus = (direction: 'next' | 'prev') => {
            // Include inputs, buttons, and anything with tabIndex
            const focusableElements = document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            const focusableArray = Array.from(focusableElements) as HTMLElement[];

            if (focusableArray.length === 0) return;

            const currentIndex = focusableArray.indexOf(document.activeElement as HTMLElement);
            let nextIndex = 0;

            if (direction === 'next') {
                nextIndex = currentIndex + 1 >= focusableArray.length ? 0 : currentIndex + 1;
            } else {
                nextIndex = currentIndex - 1 < 0 ? focusableArray.length - 1 : currentIndex - 1;
            }

            focusableArray[nextIndex].focus();
        };

        const enterFocus = () => {
            const active = document.activeElement as HTMLElement;
            if (active) {
                active.click();
            }
        };

        const handleInputText = (text: string) => {
            const active = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
            if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
                // Programmatically set value and dispatch events for React to pick it up
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                    window.HTMLInputElement.prototype,
                    "value"
                )?.set;

                if (nativeInputValueSetter) {
                    nativeInputValueSetter.call(active, text);
                    const event = new Event('input', { bubbles: true });
                    active.dispatchEvent(event);
                } else {
                    // Fallback
                    active.value = text;
                    const event = new Event('input', { bubbles: true });
                    active.dispatchEvent(event);
                }
            }
        };

        // NEW: Handle update commands from remote
        const handleUpdateData = async (payload: any) => {
            if (!payload) return;

            let newSettings = { ...settings };

            const isNonEmptyString = (value: unknown) =>
                typeof value === 'string' && value.trim().length > 0;

            const toSafeString = (value: unknown, maxLen: number) => {
                if (!isNonEmptyString(value)) return null;
                return value.trim().slice(0, maxLen);
            };

            const toSafeNumber = (value: unknown) => {
                const num = typeof value === 'number' ? value : Number(value);
                return Number.isFinite(num) ? num : null;
            };

            const toSafeInt = (value: unknown) => {
                const num = toSafeNumber(value);
                if (num === null) return null;
                return Math.round(num);
            };

            const isTimeString = (value: unknown) => {
                if (typeof value !== 'string') return false;
                const match = value.match(/^(\d{1,2}):(\d{2})$/);
                if (!match) return false;
                const hours = Number(match[1]);
                const minutes = Number(match[2]);
                return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
            };

            const isSafeUrl = (value: unknown) => {
                if (!isNonEmptyString(value)) return false;
                try {
                    const url = new URL(value);
                    return url.protocol === 'http:' || url.protocol === 'https:';
                } catch (e) {
                    return false;
                }
            };

            const allowedCalculationMethods = new Set([0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 99]);

            // Merge simple properties
            const mosqueName = toSafeString(payload.mosqueName, 80);
            if (mosqueName) newSettings.mosqueName = mosqueName;
            const city = toSafeString(payload.city, 80);
            if (city) newSettings.city = city;
            if (payload.theme === 'light' || payload.theme === 'dark') newSettings.theme = payload.theme;
            if (payload.displayMode === 'landscape' || payload.displayMode === 'portrait') newSettings.displayMode = payload.displayMode;
            const calcMethod = toSafeNumber(payload.calculationMethod);
            if (calcMethod !== null && allowedCalculationMethods.has(Math.round(calcMethod))) newSettings.calculationMethod = Math.round(calcMethod);
            const madhab = toSafeNumber(payload.madhab);
            if (madhab === 0 || madhab === 1) newSettings.madhab = madhab;
            if (isTimeString(payload.manualFridayTime)) newSettings.manualFridayTime = payload.manualFridayTime;
            const khutbahTitle = toSafeString(payload.khutbahMessageTitle, 120);
            if (khutbahTitle) newSettings.khutbahMessageTitle = khutbahTitle;
            if (payload.fridayStreamMode === 'off' || payload.fridayStreamMode === 'makkah' || payload.fridayStreamMode === 'madinah' || payload.fridayStreamMode === 'custom') {
                newSettings.fridayStreamMode = payload.fridayStreamMode;
            }
            if (payload.makkahStreamUrl !== undefined && isSafeUrl(payload.makkahStreamUrl)) newSettings.makkahStreamUrl = payload.makkahStreamUrl;
            if (payload.madinahStreamUrl !== undefined && isSafeUrl(payload.madinahStreamUrl)) newSettings.madinahStreamUrl = payload.madinahStreamUrl;
            if (payload.customStreamUrl !== undefined && isSafeUrl(payload.customStreamUrl)) newSettings.customStreamUrl = payload.customStreamUrl;
            if (payload.muteFridayStream !== undefined) newSettings.muteFridayStream = !!payload.muteFridayStream;

            // Merge nested objects (Corrections/Offsets)
            if (payload.adjustments) {
                const nextAdjustments = { ...newSettings.adjustments };
                for (const key of Object.keys(payload.adjustments)) {
                    if (!PRAYER_NAMES.includes(key as any)) continue;
                    const value = toSafeInt(payload.adjustments[key]);
                    if (value === null) continue;
                    if (value < -30 || value > 30) continue;
                    nextAdjustments[key as keyof typeof nextAdjustments] = value;
                }
                newSettings.adjustments = nextAdjustments;
            }
            if (payload.iqamahOffsets) {
                const nextOffsets = { ...newSettings.iqamahOffsets };
                for (const key of Object.keys(payload.iqamahOffsets)) {
                    if (!PRAYER_NAMES.includes(key as any)) continue;
                    const value = toSafeInt(payload.iqamahOffsets[key]);
                    if (value === null) continue;
                    if (value < 0 || value > 60) continue;
                    nextOffsets[key as keyof typeof nextOffsets] = value;
                }
                newSettings.iqamahOffsets = nextOffsets;
            }

            // Running Text Logic
            if (payload.runningText) {
                // Update first custom text item or create one
                const currentCustoms = [...(newSettings.customTexts || [])];
                const safeText = toSafeString(payload.runningText, 500);
                if (safeText) {
                    if (currentCustoms.length > 0) {
                        currentCustoms[0] = { ...currentCustoms[0], content: safeText };
                    } else {
                        currentCustoms.push({ id: `remote-${Date.now()}`, content: safeText });
                    }
                    newSettings.customTexts = currentCustoms;
                    newSettings.enableRunningText = true;
                    newSettings.runningTextMode = 'custom';
                }
            }

            // Wallpaper logic (same as before)
            if (payload.wallpaper) {
                if (payload.wallpaper.startsWith('data:image')) {
                    try {
                        const res = await fetch(payload.wallpaper);
                        const blob = await res.blob();
                        const id = await db.assets.add({
                            blob: blob,
                            type: blob.type,
                            created: Date.now()
                        });
                        newSettings.wallpaper = `local-asset:${id}`;
                    } catch (e) {
                        console.error("Failed to save remote wallpaper", e);
                    }
                } else if (payload.wallpaper.startsWith('#') || isSafeUrl(payload.wallpaper)) {
                    newSettings.wallpaper = payload.wallpaper;
                }
            }

            saveSettings(newSettings);
        };

        switch (command.type) {
            case 'OPEN_SETTINGS':
                setCurrentView('settings');
                break;
            case 'CLOSE_SETTINGS':
                setCurrentView('main');
                break;
            case 'NAV_DOWN':
            case 'NAV_RIGHT':
                navigateFocus('next');
                break;
            case 'NAV_UP':
            case 'NAV_LEFT':
                navigateFocus('prev');
                break;
            case 'NAV_ENTER':
                enterFocus();
                break;
            case 'SEND_TEXT':
                if (command.payload) {
                    handleInputText(command.payload);
                }
                break;
            case 'UPDATE_DATA':
                handleUpdateData(command.payload);
                break;
            case 'REQUEST_SETTINGS':
                // Send current settings back to remote (sanitize images if needed to save bandwidth)
                // For now sending full object but we might want to strip 'slides' images if too heavy
                // To keep it simple, we send most things.
                const snapshot = {
                    mosqueName: settings.mosqueName,
                    city: settings.city,
                    runningText: settings.customTexts?.[0]?.content || '',
                    theme: settings.theme,
                    displayMode: settings.displayMode,
                    calculationMethod: settings.calculationMethod,
                    madhab: settings.madhab,
                    adjustments: settings.adjustments,
                    iqamahOffsets: settings.iqamahOffsets,
                    manualFridayTime: settings.manualFridayTime,
                    khutbahMessageTitle: settings.khutbahMessageTitle,
                    enableFridayMakkahStream: settings.fridayStreamMode !== 'off', // Backward compat for old remote if needed, but snapshots might be used
                    fridayStreamMode: settings.fridayStreamMode,
                    makkahStreamUrl: settings.makkahStreamUrl,
                    madinahStreamUrl: settings.madinahStreamUrl,
                    customStreamUrl: settings.customStreamUrl,
                    muteFridayStream: settings.muteFridayStream
                };
                sendCommand({ type: 'SETTINGS_SNAPSHOT', payload: snapshot, timestamp: Date.now() });
                break;
        }
    }, [settings, saveSettings, sendCommand]);

    useEffect(() => {
        if (!lastCommand) return;
        handleRemoteCommand(lastCommand);
    }, [lastCommand, handleRemoteCommand]);

    useEffect(() => {
        if (Capacitor.getPlatform() !== 'android') return;
        let removeListener: (() => void) | null = null;

        const startHost = async () => {
            if (!settings.enableBluetoothRemote) return;
            try {
                await BluetoothRemote.startHost();
                const listener = await BluetoothRemote.addListener('command', (event) => {
                    if (!event?.payload) return;
                    try {
                        const parsed = JSON.parse(event.payload);
                        if (parsed && parsed.type) {
                            handleRemoteCommand({ type: parsed.type, payload: parsed.payload, timestamp: parsed.timestamp || Date.now() });
                        }
                    } catch (e) {
                        // ignore malformed payload
                    }
                });
                removeListener = listener.remove;
            } catch (e) {
                console.error('Failed to start Bluetooth remote host', e);
            }
        };

        const stopHost = async () => {
            try {
                if (removeListener) removeListener();
                await BluetoothRemote.stopHost();
            } catch (e) {
                // ignore
            }
        };

        if (settings.enableBluetoothRemote) {
            startHost();
        } else {
            stopHost();
        }

        return () => {
            stopHost();
        };
    }, [settings.enableBluetoothRemote, sendCommand]);

    useEffect(() => {
        const checkWelcomeStatus = async () => {
            try {
                const hasSeenWelcome = await db.appState.get('hasSeenWelcome');
                if (!hasSeenWelcome) {
                    setShowWelcomeModal(true);
                }
            } catch (error) {
                console.error("Could not access IndexedDB", error);
            } finally {
                setLoading(false);
            }
        };
        checkWelcomeStatus();
    }, []);

    const handleCloseWelcome = async () => {
        try {
            await db.appState.put({ key: 'hasSeenWelcome', value: true });
        } catch (error) {
            console.error("Could not set item in IndexedDB", error);
        }
        setShowWelcomeModal(false);
    };

    const handleGoToGuide = () => {
        handleCloseWelcome();
        setInfoDefaultTab('guide');
        setCurrentView('info');
    };

    const handleInfoClick = () => {
        setInfoDefaultTab('about');
        setCurrentView('info');
    };

    const handleGoToServices = () => {
        setInfoDefaultTab('services');
        setCurrentView('info');
    };

    const isRemoteMode = useMemo(() => {
        const params = new URLSearchParams(window.location.search);
        return !!params.get('remote');
    }, []);

    const key = useMemo(() => language, [language]);

    if (loading) {
        return <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 text-white">Initializing...</div>;
    }

    if (showWelcomeModal && !isRemoteMode) {
        return <WelcomeModal onClose={handleCloseWelcome} onGoToGuide={handleGoToGuide} />;
    }

    if (isRemoteMode) {
        return <RemoteView />;
    }

    return (
        <DynamicBackgroundView prayerTimes={prayerTimes} displayState={displayState}>
            <SleepOverlay />
            {(() => {
                switch (currentView) {
                    case 'settings':
                        return <SettingsPage key={key} onBack={() => setCurrentView('main')} onGoToServices={handleGoToServices} />;
                    case 'info':
                        return <InfoPage key={key} onBack={() => setCurrentView('main')} defaultTab={infoDefaultTab} />;
                    default:
                        return (
                            <MainViewLayout
                                prayerTimes={prayerTimes}
                                stale={stale}
                                onSettingsClick={() => setCurrentView('settings')}
                                onInfoClick={handleInfoClick}
                                displayState={displayState}
                                setDisplayState={setDisplayState}
                                activePrayer={activePrayer}
                                setActivePrayer={setActivePrayer}
                                countdown={countdown}
                                setCountdown={setCountdown}
                            />
                        );
                }
            })()}
        </DynamicBackgroundView>
    );
};

const App = () => (
    <LanguageProvider>
        <SettingsProvider>
            <RemoteProvider>
                <GlobalThemeApplicator />
                <AppContent />
            </RemoteProvider>
        </SettingsProvider>
    </LanguageProvider>
);

export default App;
