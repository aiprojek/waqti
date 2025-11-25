
import React, { useMemo } from 'react';
import usePrayerTimes from '../hooks/usePrayerTimes';
import { useSettings } from '../contexts/SettingsContext';
import { PRAYER_NAMES, IQAMAH_PRAYERS } from '../constants';
import type { PrayerName } from '../types';
import useClock from '../hooks/useClock';
import { parseTimeToDate } from '../utils';
import { t } from '../i18n';

interface PrayerTimeCardProps {
    name: PrayerName;
    time: string;
    isNext: boolean;
    isFriday: boolean;
}

const PrayerTimeCard: React.FC<PrayerTimeCardProps> = ({ name, time, isNext, isFriday }) => {
    const { settings } = useSettings();
    const accentColor = settings.accentColor || '#8B5CF6';

    const cardStyle: React.CSSProperties = {
        boxShadow: isNext ? `0 0 20px ${accentColor}` : 'none',
        borderColor: isNext ? accentColor : undefined,
        borderWidth: isNext ? '2px' : undefined,
    };
    
    const textShadow = isNext ? '0 1px 3px rgba(0,0,0,0.5)' : '0 1px 3px rgba(0,0,0,0.3)';
    const displayName = isFriday && settings.enableFridayMode && name === 'Dhuhr' ? t('general.jumat') : t(`prayerNames.${name}`);

    return (
        <div style={cardStyle} className="rounded-2xl p-4 text-center transition-all duration-300 backdrop-blur-sm bg-white/20 dark:bg-black/20 border border-black/10 dark:border-white/10 flex flex-col justify-center">
            <p style={{textShadow, fontSize: 'clamp(0.8rem, 2.5vw, 2.2rem)'}} className="font-semibold text-slate-700 dark:text-white/90">{displayName}</p>
            <p style={{textShadow, fontSize: 'clamp(1.5rem, 5vw, 4.5rem)'}} className="font-bold tracking-wider text-slate-800 dark:text-white">{time}</p>
        </div>
    );
};

export const PrayerTimesDisplay = () => {
    const { prayerTimes, loading, error } = usePrayerTimes();
    const { settings } = useSettings();
    const { currentTime } = useClock();
    const isFriday = currentTime.getDay() === 5;
    const dayOfMonth = currentTime.getDate();

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
    }, [prayerTimesToUse, dayOfMonth]); // Add dayOfMonth so dates are refreshed daily

    const nextPrayer = useMemo(() => {
        if (sortedPrayerTimes.length === 0) return null;
        const now = currentTime.getTime();
        const futurePrayers = sortedPrayerTimes.filter(p => p.time.getTime() > now);
        return futurePrayers.length > 0 ? futurePrayers[0] : sortedPrayerTimes[0];
    }, [currentTime, sortedPrayerTimes]);
    
    const nextPrayerName = nextPrayer?.name;

    if (loading) return <div className="text-center text-lg">{t('main.loading')}...</div>;
    if (error) return <div className="text-center text-lg text-red-400">{t('main.error')}: {error}</div>;
    if (!prayerTimesToUse) return null;

    return (
        <div className={`grid ${settings.displayMode === 'landscape' ? 'grid-cols-6' : 'grid-cols-3'} gap-2 md:gap-4 w-full mx-auto px-4`}>
            {PRAYER_NAMES.map(name => (
                <PrayerTimeCard 
                    key={name}
                    name={name}
                    time={prayerTimesToUse[name]}
                    isNext={name === nextPrayerName}
                    isFriday={isFriday}
                />
            ))}
        </div>
    );
};
