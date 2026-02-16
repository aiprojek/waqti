
import React, { useMemo, useState, useEffect } from 'react';
import useClock from '../../hooks/useClock';
import { useSettings } from '../../contexts/SettingsContext';
import type { PrayerName, PrayerTimes, ScheduleSlide, FinanceSlide, ScheduleItem } from '../../types';
import { PRAYER_NAMES, IQAMAH_PRAYERS } from '../../constants';
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

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

const ScheduleSlider: React.FC<{ slide: ScheduleSlide }> = ({ slide }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [opacity, setOpacity] = useState(1);
    const items = slide.scheduleItems;

    useEffect(() => {
        if (items.length <= 1) return;

        const interval = setInterval(() => {
            setOpacity(0);
            setTimeout(() => {
                setCurrentIndex(prevIndex => (prevIndex + 1) % items.length);
                setOpacity(1);
            }, 300); // fade transition duration
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, [items.length]);

    const currentItem = items.length > 0 ? items[currentIndex] : null;

    return (
        <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 flex flex-col h-full">
            <h2 className="text-xl font-bold text-center mb-2 flex-shrink-0">{slide.title || t('settings.slides.type.schedule')}</h2>
            {currentItem ? (
                <div 
                    className="space-y-2 overflow-y-auto flex-grow flex flex-col justify-center transition-opacity duration-300"
                    style={{ opacity }}
                >
                    <div className="p-2 bg-black/20 rounded-lg text-center">
                        <p className="font-bold text-[var(--accent-color)] text-lg truncate">{currentItem.topic}</p>
                        <p className="text-base text-white/90 truncate">{currentItem.speaker}</p>
                        <p className="text-sm text-white/70">{currentItem.day}, {currentItem.time}</p>
                    </div>
                </div>
            ) : (
                <div className="flex-grow flex items-center justify-center">
                    <p className="text-center text-white/70">{t('general.noContent')}</p>
                </div>
            )}
        </div>
    );
};

const FinanceInfoDisplay: React.FC<{ slide: FinanceSlide }> = ({ slide }) => {
    const { financeInfo } = slide;
    const hasDonationTarget = financeInfo.donationTarget && financeInfo.donationTarget > 0;
    const collectedAmount = Math.max(0, financeInfo.income || 0);
    const progress = hasDonationTarget ? Math.min((collectedAmount / financeInfo.donationTarget!) * 100, 100) : 0;
    
    return (
         <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 flex flex-col h-full">
            <h2 className="text-xl font-bold text-center mb-2 flex-shrink-0">{financeInfo.title || t('settings.slides.type.finance')}</h2>
            {financeInfo && (financeInfo.lastBalance || financeInfo.income || financeInfo.expense) ? (
                hasDonationTarget ? (
                    <div className="space-y-2 flex-grow flex flex-col justify-center">
                        <div>
                            <div className="flex justify-between items-end text-sm mb-1">
                                <span className="text-white/80">{t('settings.slides.finance.income')}</span>
                                <span className="font-mono font-semibold">{formatCurrency(collectedAmount)}</span>
                            </div>
                            <div className="w-full bg-black/30 rounded-full h-5">
                                <div 
                                    className="bg-[var(--accent-color)] h-5 rounded-full text-center text-white text-xs font-bold flex items-center justify-center"
                                    style={{ width: `${progress}%` }}
                                >
                                    {progress.toFixed(0)}%
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-end text-sm pt-1">
                            <span className="text-white/80">{t('settings.slides.finance.donationTarget')}</span>
                            <span className="font-mono font-semibold">{formatCurrency(financeInfo.donationTarget!)}</span>
                        </div>
                         {collectedAmount < financeInfo.donationTarget! && (
                            <div className="text-center pt-2">
                                <p className="text-xs text-white/80">Sisa Kebutuhan:</p>
                                <p className="text-base font-bold font-mono text-amber-400">{formatCurrency(financeInfo.donationTarget! - collectedAmount)}</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-1 text-center flex-grow flex flex-col justify-center">
                        <div className="pt-1">
                            <p className="text-sm uppercase text-white/80">{t('settings.slides.finance.finalBalance')}</p>
                            <p className="font-mono text-2xl font-bold text-[var(--accent-color)]">{formatCurrency(financeInfo.currentBalance)}</p>
                        </div>
                    </div>
                )
            ) : (
                 <div className="flex-grow flex items-center justify-center">
                    <p className="text-center text-white/70">{t('general.noContent')}</p>
                </div>
            )}
        </div>
    );
};

const InfoPlaceholder: React.FC<{ title: string }> = ({ title }) => (
    <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 flex flex-col h-full items-center justify-center">
        <h2 className="text-xl font-bold text-center mb-2 flex-shrink-0">{title}</h2>
        <div className="flex-grow flex items-center justify-center">
            <p className="text-center text-sm text-white/70">{t('general.noContent')}</p>
        </div>
    </div>
);

export const DashboardInfoLayout: React.FC<LayoutProps> = ({
    prayerTimes,
    nextPrayer,
    timeToNextPrayer,
    isFriday
}) => {
    const { hours, minutes, seconds, formattedDay, formattedFullDate, formattedHijriDate } = useClock();
    const { settings } = useSettings();
    const isPortrait = settings.displayMode === 'portrait';

    const scheduleSlide = useMemo(() => settings.slides.find(s => s.type === 'schedule' && s.enabled) as ScheduleSlide | undefined, [settings.slides]);
    const financeSlide = useMemo(() => settings.slides.find(s => s.type === 'finance' && s.enabled) as FinanceSlide | undefined, [settings.slides]);
    
    // --- Logic for Portrait Mode Alternating Info Box ---
    const [infoBoxIndex, setInfoBoxIndex] = useState(0);
    const availableInfoSlides = useMemo(() => {
        const slides = [];
        if (scheduleSlide) slides.push(scheduleSlide);
        if (financeSlide) slides.push(financeSlide);
        return slides;
    }, [scheduleSlide, financeSlide]);
    
    useEffect(() => {
        if (isPortrait && availableInfoSlides.length > 1) {
            const interval = setInterval(() => {
                setInfoBoxIndex(prev => (prev + 1) % availableInfoSlides.length);
            }, 8000); // Ganti info setiap 8 detik
            return () => clearInterval(interval);
        }
    }, [isPortrait, availableInfoSlides.length]);

    // --- PORTRAIT LAYOUT ---
    if (isPortrait) {
        const nextPrayerName = nextPrayer ? (isFriday && settings.enableFridayMode && nextPrayer.name === 'Dhuhr' ? t('general.jummah') : t(`prayerNames.${nextPrayer.name}`)) : '';
        const currentInfoSlide = availableInfoSlides[infoBoxIndex % availableInfoSlides.length];

        return (
            <div className="w-full h-full p-2 flex flex-col gap-4">
                {/* 1. Clock & Date */}
                <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 flex flex-col justify-center items-center text-center flex-shrink-0">
                     {settings.clockStyle === 'analog' ? (
                        <div className="py-2">
                            <AnalogClock size="180px" />
                        </div>
                     ) : (
                        <h1 className="font-mono font-bold tracking-tight text-shadow-lg text-[clamp(3.5rem,15vh,7rem)] leading-none flex items-baseline justify-center">
                            <AnimatedDigit value={hours} />
                            <span>:</span>
                            <AnimatedDigit value={minutes} />
                        </h1>
                     )}
                    <p className="text-[clamp(0.9rem,2.5vh,1.2rem)]">{formattedDay}, {formattedFullDate}</p>
                    <p className="text-[clamp(0.8rem,2vh,1rem)] text-white/80">{formattedHijriDate}</p>
                </div>

                {/* 2. Next Prayer */}
                {nextPrayer && (
                    <div className="text-center bg-black/20 backdrop-blur-md border border-[var(--accent-color)] rounded-3xl p-4 animate-pulse-glow flex-shrink-0">
                        <p className="text-sm uppercase tracking-widest text-white font-bold" style={{ textShadow: '0 0 8px var(--accent-color), 0 0 4px rgba(0,0,0,0.6)' }}>
                            {t('main.upNext')}
                        </p>
                        <h2 className="text-[clamp(1.8rem,6vw,3rem)] font-bold">{nextPrayerName}</h2>
                        <p className="font-mono font-bold text-[clamp(2.2rem,8vw,4rem)] leading-none my-1">{prayerTimes ? prayerTimes[nextPrayer.name] : '--:--'}</p>
                        <p className="font-mono text-base opacity-80">{t('main.in')} {timeToNextPrayer}</p>
                    </div>
                )}
                
                {/* 3. Alternating Info Box */}
                <div className="flex-grow min-h-0">
                    {currentInfoSlide?.type === 'schedule' && <ScheduleSlider slide={currentInfoSlide as ScheduleSlide} />}
                    {currentInfoSlide?.type === 'finance' && <FinanceInfoDisplay slide={currentInfoSlide as FinanceSlide} />}
                    {!currentInfoSlide && <InfoPlaceholder title={t('general.noContent')} />}
                </div>
            </div>
        );
    }
    
    // --- LANDSCAPE LAYOUT ---
    return (
        <div className={`w-full h-full p-2 md:p-4 flex gap-4 md:gap-6`}>
            {/* Left Column: Clock & Info */}
            <div className={`flex flex-col gap-4 md:gap-6 flex-[2]`}>
                <div className={`bg-black/20 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-center items-center text-center flex-grow`}>
                    {settings.clockStyle === 'analog' ? (
                        <div className="flex-grow flex items-center justify-center py-4">
                            <AnalogClock size="280px" />
                        </div>
                    ) : (
                        <h1 className="font-mono font-bold tracking-tight text-shadow-lg text-[clamp(3.5rem,18vh,9rem)] leading-none flex items-baseline justify-center">
                            <AnimatedDigit value={hours} />
                            <span>:</span>
                            <AnimatedDigit value={minutes} />
                            <span className="text-[clamp(1.2rem,5vh,2.5rem)] w-auto px-2">:
                                <AnimatedDigit value={seconds} />
                            </span>
                        </h1>
                    )}
                    <div className="mt-2">
                        <p className="text-[clamp(1rem,3vh,1.5rem)]">{formattedDay}, {formattedFullDate}</p>
                        <p className="text-[clamp(0.9rem,2.5vh,1.2rem)] text-white/80">{formattedHijriDate}</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    {scheduleSlide ? <ScheduleSlider slide={scheduleSlide} /> : <InfoPlaceholder title={t('settings.slides.type.schedule')} />}
                    {financeSlide ? <FinanceInfoDisplay slide={financeSlide} /> : <InfoPlaceholder title={t('settings.slides.type.finance')} />}
                </div>
            </div>

            {/* Right Column: Prayer Times */}
            <div className={`bg-black/20 backdrop-blur-md rounded-2xl p-4 flex flex-col justify-between gap-2 min-h-0 flex-[1]`}>
                {PRAYER_NAMES.map(name => {
                    const isNext = name === nextPrayer?.name;
                    const time = prayerTimes ? prayerTimes[name] : '--:--';
                    const displayName = isFriday && settings.enableFridayMode && name === 'Dhuhr' ? t('general.jummah') : t(`prayerNames.${name}`);
                    const showIqamahInfo = IQAMAH_PRAYERS.includes(name) && !(isFriday && settings.enableFridayMode && name === 'Dhuhr');

                    return (
                        <div 
                            key={name} 
                            className={`flex justify-between items-center p-4 rounded-xl backdrop-blur-sm transition-all duration-300 border ${
                                isNext 
                                ? 'bg-[var(--accent-color)]/50 border-[var(--accent-color)] animate-pulse-glow' 
                                : 'bg-black/20 border-white/10'
                            }`}
                        >
                            <div>
                                <p className={`font-semibold text-lg ${isNext ? 'text-white' : 'text-white/90'}`}>{displayName}</p>
                                {isNext && (
                                    <p className="text-xs text-white/90 font-mono">
                                        {t('main.in')} {timeToNextPrayer}
                                    </p>
                                )}
                                {!isNext && showIqamahInfo && (
                                     <p className="text-xs text-white/70">
                                         {t('main.iqamahOffset', { minutes: settings.iqamahOffsets[name].toString() })}
                                     </p>
                                )}
                            </div>
                            <span className={`font-mono font-bold text-xl text-white`}>{time}</span>
                        </div>
                    );
                })}
            </div>

        </div>
    );
};
