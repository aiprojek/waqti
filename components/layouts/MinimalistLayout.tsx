
import React, { useState, useEffect, useMemo } from 'react';
import useClock from '../../hooks/useClock';
import { useSettings } from '../../contexts/SettingsContext';
import { PRAYER_NAMES } from '../../constants';
import type { PrayerName, PrayerTimes } from '../../types';
import { t } from '../../i18n';
import { AnalogClock } from '../AnalogClock';

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

// Helper untuk menghitung waktu Iqamah
const getIqamahTime = (prayerTime: string, offsetMinutes: number): string => {
    if (!prayerTime) return '--:--';
    const [hours, minutes] = prayerTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes + offsetMinutes);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// Komponen Kartu Tunggal yang Berputar
const MinimalistInfoCard: React.FC<{
    prayerName: PrayerName;
    prayerTime: string;
    isNext: boolean;
    timeToNextPrayer: string;
    isFriday: boolean;
    iqamahTime: string;
}> = ({ prayerName, prayerTime, isNext, timeToNextPrayer, isFriday, iqamahTime }) => {
    const { settings } = useSettings();
    
    const displayName = isFriday && settings.enableFridayMode && prayerName === 'Dhuhr' 
        ? t('general.jummah') 
        : t(`prayerNames.${prayerName}`);

    // Jangan tampilkan Iqamah untuk Terbit atau jika offsetnya 0 (opsional, tapi biasanya Terbit tidak ada iqamah)
    const showIqamah = prayerName !== 'Sunrise' && !(isFriday && settings.enableFridayMode && prayerName === 'Dhuhr');

    return (
        <div 
            key={prayerName} // Key triggers animation on change
            className={`text-center bg-black/20 backdrop-blur-md border-2 rounded-3xl p-6 w-full max-w-sm transition-all duration-500 overflow-hidden relative flex flex-col justify-center items-center animate-fade-in ${isNext ? 'border-[var(--accent-color)] animate-pulse-glow bg-[var(--accent-color)]/10' : 'border-white/10'}`}
            style={{ minHeight: '240px' }}
        >
            <p className="text-sm uppercase tracking-widest text-white font-bold mb-2" style={isNext ? { textShadow: '0 0 8px var(--accent-color), 0 0 4px rgba(0,0,0,0.6)' } : { opacity: 0.7 }}>
                {isNext ? t('main.upNext') : t('main.prayerTime')}
            </p>
            <h2 className="text-[clamp(2rem,8vw,3.5rem)] font-bold my-1 text-white leading-tight">{displayName}</h2>
            <p className="font-mono font-bold text-[clamp(2.5rem,10vw,5rem)] leading-none my-2 text-white">{prayerTime}</p>
            
            {/* Iqamah Indicator */}
            {showIqamah && (
                <div className="mt-1 mb-3 flex items-center justify-center gap-2 text-white/80">
                    <span className="text-xs uppercase tracking-wide opacity-70">{t('main.iqamahIn').split(' ')[0]}</span>
                    <span className="font-mono font-bold text-xl">{iqamahTime}</span>
                </div>
            )}

            {isNext ? (
                <p className="font-mono text-lg text-white/90 bg-black/20 px-3 py-1 rounded-full mt-auto">
                    {t('main.in')} {timeToNextPrayer}
                </p>
            ) : (
                <div className="h-9 mt-auto"></div> // Spacer to keep height consistent
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
    
    // State untuk mengontrol shalat mana yang ditampilkan
    const [displayIndex, setDisplayIndex] = useState(0);

    // Reset index ke Next Prayer saat nextPrayer berubah
    useEffect(() => {
        if (nextPrayer) {
            // Gunakan PRAYER_NAMES agar Sunrise termasuk
            const idx = PRAYER_NAMES.indexOf(nextPrayer.name as any);
            if (idx !== -1) {
                setDisplayIndex(idx);
            }
        }
    }, [nextPrayer?.name]);

    // Efek Rotasi Kartu
    useEffect(() => {
        if (!settings.enableMinimalistSwap) return;

        // Interval dalam milidetik (dari detik di pengaturan)
        const intervalMs = Math.max(3, settings.minimalistSwapInterval) * 1000;

        const timer = setInterval(() => {
            setDisplayIndex(prev => (prev + 1) % PRAYER_NAMES.length);
        }, intervalMs);

        return () => clearInterval(timer);
    }, [settings.enableMinimalistSwap, settings.minimalistSwapInterval]);

    // Efek Toggle Tanggal Hijriah
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

    const dateToShow = isShowingHijri ? formattedHijriDate : formattedFullDate;
    
    // Tentukan data untuk kartu yang sedang tampil
    const currentPrayerName = PRAYER_NAMES[displayIndex];
    const isNext = nextPrayer?.name === currentPrayerName;
    const timeStr = prayerTimes ? prayerTimes[currentPrayerName] : '--:--';
    
    // Hitung waktu Iqamah
    const offset = settings.iqamahOffsets[currentPrayerName] || 0;
    const iqamahTime = getIqamahTime(timeStr, offset);

    // --- Portrait Layout ---
    if (settings.displayMode === 'portrait') {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 gap-8">
                <div className="flex-shrink-0 flex flex-col items-center">
                    {settings.clockStyle === 'analog' ? (
                        <div className="mb-4">
                            <AnalogClock size="280px" />
                        </div>
                    ) : (
                        <h1 
                            className="font-mono font-bold tracking-tight text-shadow-lg text-[clamp(4rem,22vw,10rem)] leading-none flex items-baseline justify-center"
                            style={{textShadow: '3px 3px 25px rgba(0,0,0,0.6)'}}
                        >
                            <AnimatedDigit value={hours} />
                            <span className="animate-pulse">:</span>
                            <AnimatedDigit value={minutes} />
                        </h1>
                    )}
                    <p className="text-[clamp(1rem,4vw,1.5rem)] tracking-wide text-slate-700 dark:text-white/90 mt-2">
                        <span className="transition-opacity duration-300" style={{ opacity: dateOpacity }}>
                            {formattedDay}, {dateToShow}
                        </span>
                    </p>
                </div>

                <MinimalistInfoCard 
                    prayerName={currentPrayerName}
                    prayerTime={timeStr}
                    isNext={isNext}
                    timeToNextPrayer={timeToNextPrayer}
                    isFriday={isFriday}
                    iqamahTime={iqamahTime}
                />
            </div>
        );
    }

    // --- Landscape Layout ---
    return (
        <div className="w-full h-full flex flex-col md:flex-row items-center justify-center text-center p-4 md:p-8 gap-8 md:gap-12">
            <div className="flex-shrink-0 flex flex-col items-center">
                 {settings.clockStyle === 'analog' ? (
                    <div className="mb-4">
                        <AnalogClock size="350px" />
                    </div>
                 ) : (
                    <h1 
                        className="font-mono font-bold tracking-tight text-shadow-lg text-[clamp(4rem,22vw,10rem)] leading-none flex items-baseline justify-center"
                        style={{textShadow: '3px 3px 25px rgba(0,0,0,0.6)'}}
                    >
                        <AnimatedDigit value={hours} />
                        <span className="animate-pulse">:</span>
                        <AnimatedDigit value={minutes} />
                    </h1>
                 )}
                <p className="text-[clamp(1rem,4vw,1.5rem)] tracking-wide text-slate-700 dark:text-white/90 mt-2">
                     <span className="transition-opacity duration-300" style={{ opacity: dateOpacity }}>
                        {formattedDay}, {dateToShow}
                    </span>
                </p>
            </div>

            <MinimalistInfoCard 
                prayerName={currentPrayerName}
                prayerTime={timeStr}
                isNext={isNext}
                timeToNextPrayer={timeToNextPrayer}
                isFriday={isFriday}
                iqamahTime={iqamahTime}
            />
        </div>
    );
};
