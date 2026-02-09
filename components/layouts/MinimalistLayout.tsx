
import React, { useState, useEffect } from 'react';
import useClock from '../../hooks/useClock';
import { useSettings } from '../../contexts/SettingsContext';
import { PRAYER_NAMES } from '../../constants';
import type { PrayerName, PrayerTimes } from '../../types';
import { t } from '../../i18n';

interface LayoutProps {
    prayerTimes: PrayerTimes | null;
    nextPrayer: { name: PrayerName; time: Date; } | null;
    timeToNextPrayer: string;
    isFriday: boolean;
}

const AnimatedDigit: React.FC<{ value: string }> = ({ value }) => {
    const tens = value[0];
    const units = value[1];
    return (
        <>
            <span key={`t-${tens}`} className="inline-block animate-fade-in w-[0.55em] text-center">{tens}</span>
            <span key={`u-${units}`} className="inline-block animate-fade-in w-[0.55em] text-center">{units}</span>
        </>
    );
};

// Komponen Kartu yang Diekstrak agar stabil (tidak re-mount setiap detik)
const MinimalistInfoCard: React.FC<{
    showSchedule: boolean;
    setShowSchedule: (show: boolean) => void;
    prayerTimes: PrayerTimes | null;
    nextPrayer: { name: PrayerName; time: Date; } | null;
    timeToNextPrayer: string;
    isFriday: boolean;
}> = ({ showSchedule, setShowSchedule, prayerTimes, nextPrayer, timeToNextPrayer, isFriday }) => {
    const { settings } = useSettings();
    const nextPrayerName = nextPrayer ? (isFriday && settings.enableFridayMode && nextPrayer.name === 'Dhuhr' ? t('general.jummah') : t(`prayerNames.${nextPrayer.name}`)) : '';

    return (
        <div 
            className="text-center bg-black/20 backdrop-blur-md border-2 border-[var(--accent-color)] rounded-3xl p-6 animate-pulse-glow w-full max-w-sm transition-all duration-500 overflow-hidden relative cursor-pointer"
            style={{ minHeight: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
            onClick={() => setShowSchedule(!showSchedule)}
        >
            {showSchedule ? (
                // Tampilan Jadwal Lengkap
                <div className="w-full animate-fade-in space-y-2">
                    <p className="text-sm uppercase tracking-widest text-white/80 font-bold mb-3 border-b border-white/20 pb-2">
                        {t('main.otherPrayerTimes')}
                    </p>
                    <div className="flex flex-col gap-1 w-full">
                        {PRAYER_NAMES.filter(n => n !== 'Sunrise').map(name => {
                            const isNext = name === nextPrayer?.name;
                            const displayName = isFriday && settings.enableFridayMode && name === 'Dhuhr' ? t('general.jummah') : t(`prayerNames.${name}`);
                            return (
                                <div key={name} className={`flex justify-between items-center px-2 py-1 rounded ${isNext ? 'bg-[var(--accent-color)]/40 font-bold' : 'text-white/80'}`}>
                                    <span className="text-sm">{displayName}</span>
                                    <span className="font-mono text-base">{prayerTimes ? prayerTimes[name] : '--:--'}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                // Tampilan Next Prayer (Default)
                <div className="animate-fade-in w-full">
                    {nextPrayer && (
                        <>
                            <p className="text-base uppercase tracking-widest text-white font-bold" style={{ textShadow: '0 0 8px var(--accent-color), 0 0 4px rgba(0,0,0,0.6)' }}>
                                {t('main.upNext')}
                            </p>
                            <h2 className="text-[clamp(2rem,8vw,3.5rem)] font-bold my-1">{nextPrayerName}</h2>
                            <p className="font-mono font-bold text-[clamp(2.5rem,10vw,5rem)] leading-none my-2">{prayerTimes ? prayerTimes[nextPrayer.name] : '--:--'}</p>
                            <p className="font-mono text-lg opacity-80">{t('main.in')} {timeToNextPrayer}</p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export const MinimalistLayout: React.FC<LayoutProps> = ({
    prayerTimes,
    nextPrayer,
    timeToNextPrayer,
    isFriday
}) => {
    const { hours, minutes, formattedDay, formattedFullDate, formattedHijriDate } = useClock();
    const { settings } = useSettings();
    const [isShowingHijri, setIsShowingHijri] = useState(false);
    const [dateOpacity, setDateOpacity] = useState(1);
    
    // State untuk mengontrol tampilan jadwal vs next prayer
    const [showSchedule, setShowSchedule] = useState(false);

    // Efek untuk tanggal Hijriah/Masehi
    useEffect(() => {
        const interval = setInterval(() => {
            setDateOpacity(0);
            setTimeout(() => {
                setIsShowingHijri(prev => !prev);
                setDateOpacity(1);
            }, 300);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Efek untuk merotasi kartu Next Prayer ke Jadwal Shalat berdasarkan interval di pengaturan
    useEffect(() => {
        if (!settings.enableMinimalistSwap) {
            setShowSchedule(false);
            return;
        }

        const intervalMs = Math.max(1, settings.minimalistSwapInterval) * 60 * 1000;

        const scheduleInterval = setInterval(() => {
            setShowSchedule(true);
            // Tampilkan jadwal selama 20 detik, lalu kembali ke next prayer
            setTimeout(() => {
                setShowSchedule(false);
            }, 20000); 
        }, intervalMs);

        return () => clearInterval(scheduleInterval);
    }, [settings.enableMinimalistSwap, settings.minimalistSwapInterval]);

    const dateToShow = isShowingHijri ? formattedHijriDate : formattedFullDate;

    // --- Portrait Layout ---
    if (settings.displayMode === 'portrait') {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 gap-8">
                {/* Main Time & Date */}
                <div className="flex-shrink-0">
                    <h1 
                        className="font-mono font-bold tracking-tight text-shadow-lg text-[clamp(4rem,22vw,10rem)] leading-none flex items-baseline justify-center"
                        style={{textShadow: '3px 3px 25px rgba(0,0,0,0.6)'}}
                    >
                        <AnimatedDigit value={hours} />
                        <span className="animate-pulse">:</span>
                        <AnimatedDigit value={minutes} />
                    </h1>
                    <p className="text-[clamp(1rem,4vw,1.5rem)] tracking-wide text-slate-700 dark:text-white/90 mt-2">
                        <span className="transition-opacity duration-300" style={{ opacity: dateOpacity }}>
                            {formattedDay}, {dateToShow}
                        </span>
                    </p>
                </div>

                <MinimalistInfoCard 
                    showSchedule={showSchedule}
                    setShowSchedule={setShowSchedule}
                    prayerTimes={prayerTimes}
                    nextPrayer={nextPrayer}
                    timeToNextPrayer={timeToNextPrayer}
                    isFriday={isFriday}
                />
            </div>
        );
    }

    // --- Landscape Layout ---
    return (
        <div className="w-full h-full flex flex-col md:flex-row items-center justify-center text-center p-4 md:p-8 gap-8 md:gap-12">
            {/* Main Time & Date */}
            <div className="flex-shrink-0">
                 <h1 
                    className="font-mono font-bold tracking-tight text-shadow-lg text-[clamp(4rem,22vw,10rem)] leading-none flex items-baseline justify-center"
                    style={{textShadow: '3px 3px 25px rgba(0,0,0,0.6)'}}
                >
                    <AnimatedDigit value={hours} />
                    <span className="animate-pulse">:</span>
                    <AnimatedDigit value={minutes} />
                </h1>
                <p className="text-[clamp(1rem,4vw,1.5rem)] tracking-wide text-slate-700 dark:text-white/90 mt-2">
                     <span className="transition-opacity duration-300" style={{ opacity: dateOpacity }}>
                        {formattedDay}, {dateToShow}
                    </span>
                </p>
            </div>

            <MinimalistInfoCard 
                showSchedule={showSchedule}
                setShowSchedule={setShowSchedule}
                prayerTimes={prayerTimes}
                nextPrayer={nextPrayer}
                timeToNextPrayer={timeToNextPrayer}
                isFriday={isFriday}
            />
        </div>
    );
};
