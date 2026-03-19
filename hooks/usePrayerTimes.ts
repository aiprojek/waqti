
import { useState, useEffect } from 'react';
import type { PrayerTimes } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import { PRAYER_NAMES } from '../constants';
import { t } from '../i18n';
import { db } from '../lib/db';

// Import local implementation directly
import { 
    Coordinates, 
    CalculationMethod, 
    PrayerTimes as AdhanPrayerTimes, 
    Madhab, 
    HighLatitudeRule, 
    CalculationParameters 
} from '../lib/adhan';

const usePrayerTimes = () => {
    const { settings, saveSettings } = useSettings();
    const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stale, setStale] = useState(false);
    
    const [dateTicker, setDateTicker] = useState(new Date().getDate());

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            if (now.getDate() !== dateTicker) {
                setDateTicker(now.getDate());
            }
        }, 60000);
        return () => clearInterval(timer);
    }, [dateTicker]);

    useEffect(() => {
        let isMounted = true;

        const fetchPrayerTimes = async () => {
            if (settings.useManualTimes) {
                if (isMounted) {
                    setPrayerTimes(settings.manualPrayerTimes);
                    setLoading(false);
                    setError(null);
                    setStale(false);
                }
                return;
            }

            if (isMounted) {
                if (prayerTimes) setStale(true);
                else setLoading(true);
                setError(null);
            }

            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;
            const day = now.getDate();

            // --- OFFLINE CALCULATION MODE (Using local library) ---
            if (settings.calculationSource === 'calculated') {
                try {
                    if (!settings.latitude || !settings.longitude) {
                        throw new Error(t('settings.calculation.source.detectError'));
                    }

                    const coordinates = new Coordinates(settings.latitude, settings.longitude);
                    const date = new Date(); 
                    
                    let params: CalculationParameters;
                    switch (settings.calculationMethod) {
                        case 0: params = CalculationMethod.Tehran(); break;
                        case 1: params = CalculationMethod.Karachi(); break;
                        case 2: params = CalculationMethod.NorthAmerica(); break;
                        case 3: params = CalculationMethod.MuslimWorldLeague(); break;
                        case 4: params = CalculationMethod.UmmAlQura(); break;
                        case 5: params = CalculationMethod.Egyptian(); break;
                        case 7: params = CalculationMethod.Tehran(); break;
                        case 8: params = CalculationMethod.Gulf(); break;
                        case 9: params = CalculationMethod.Kuwait(); break;
                        case 10: params = CalculationMethod.Qatar(); break;
                        case 11: params = CalculationMethod.Singapore(); break;
                        case 12: params = CalculationMethod.Other(); break;
                        case 13: params = CalculationMethod.Turkey(); break;
                        case 14: params = CalculationMethod.Other(); break;
                        case 15: params = CalculationMethod.MoonsightingCommittee(); break;
                        case 16: params = CalculationMethod.Dubai(); break;
                        case 17: params = new CalculationParameters(20, 18, "Indonesia"); break;
                        case 99: params = new CalculationParameters(settings.fajrAngle || 18, settings.ishaAngle || 18, "Custom"); break;
                        default: params = CalculationMethod.MuslimWorldLeague();
                    }

                    // Map settings ID to local Enum
                    if (settings.madhab === 1) params.madhab = Madhab.Hanafi;
                    else params.madhab = Madhab.Shafi;

                    switch (settings.highLatitudeRule) {
                        case 'MiddleOfTheNight': params.highLatitudeRule = HighLatitudeRule.MiddleOfTheNight; break;
                        case 'OneSeventh': params.highLatitudeRule = HighLatitudeRule.SeventhOfTheNight; break;
                        case 'AngleBased': params.highLatitudeRule = HighLatitudeRule.TwilightAngle; break;
                        default: params.highLatitudeRule = HighLatitudeRule.MiddleOfTheNight;
                    }
                    
                    params.adjustments.Fajr = settings.adjustments.Fajr;
                    params.adjustments.Sunrise = settings.adjustments.Sunrise;
                    params.adjustments.Dhuhr = settings.adjustments.Dhuhr;
                    params.adjustments.Asr = settings.adjustments.Asr;
                    params.adjustments.Maghrib = settings.adjustments.Maghrib;
                    params.adjustments.Isha = settings.adjustments.Isha;

                    const prayerTimesObj = new AdhanPrayerTimes(coordinates, date, params);

                    const formatTime = (d: Date) => {
                         const h = d.getHours().toString().padStart(2, '0');
                         const m = d.getMinutes().toString().padStart(2, '0');
                         return `${h}:${m}`;
                    };

                    const formattedTimes: PrayerTimes = {
                        Fajr: formatTime(prayerTimesObj.fajr),
                        Sunrise: formatTime(prayerTimesObj.sunrise),
                        Dhuhr: formatTime(prayerTimesObj.dhuhr),
                        Asr: formatTime(prayerTimesObj.asr),
                        Maghrib: formatTime(prayerTimesObj.maghrib),
                        Isha: formatTime(prayerTimesObj.isha),
                    };

                    if (isMounted) {
                        setPrayerTimes(formattedTimes);
                    }

                } catch (err) {
                    console.error(err);
                    if (isMounted) {
                        setError((err instanceof Error ? err.message : String(err)));
                    }
                } finally {
                    if (isMounted) {
                        setLoading(false);
                        setStale(false);
                    }
                }
                return;
            }

            // --- ONLINE API MODE ---
            const hasCoords = settings.latitude && settings.longitude && settings.latitude !== 0 && settings.longitude !== 0;
            const cacheKey = hasCoords
                ? `prayerTimesCache-${settings.latitude}-${settings.longitude}-${year}-${month}`
                : `prayerTimesCache-${settings.city}-${year}-${month}`;

            try {
                const cachedEntry = await db.prayerTimesCache.get(cacheKey);
                let monthlyData: any[] | null = null;

                if (cachedEntry) {
                    monthlyData = cachedEntry.data;
                } else {
                    await db.prayerTimesCache.clear();

                    const tuneString = PRAYER_NAMES.map(name => settings.adjustments[name] || 0).join(',');
                    let apiUrl = '';
                    const highLatitudeMap: Record<string, number> = {
                        MiddleOfTheNight: 1,
                        OneSeventh: 2,
                        AngleBased: 3
                    };
                    const highLatitudeParam = highLatitudeMap[settings.highLatitudeRule];
                    
                    if (hasCoords) {
                        apiUrl = `https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${settings.latitude}&longitude=${settings.longitude}&method=${settings.calculationMethod}&school=${settings.madhab}&tune=${tuneString}`;
                    } else {
                        apiUrl = `https://api.aladhan.com/v1/calendarByCity?city=${encodeURIComponent(settings.city)}&country=Indonesia&method=${settings.calculationMethod}&month=${month}&year=${year}&school=${settings.madhab}&tune=${tuneString}`;
                    }

                    if (highLatitudeParam !== undefined) {
                        apiUrl += `&latitudeAdjustmentMethod=${highLatitudeParam}`;
                    }

                    if (settings.calculationMethod === 99) {
                        apiUrl += `&methodSettings=${settings.fajrAngle},,${settings.ishaAngle}`;
                    }
                    
                    const response = await fetch(apiUrl);

                    if (!response.ok) {
                        throw new Error(`API error: ${response.statusText}`);
                    }
                    const data = await response.json();

                    if (data.code === 200 && data.data) {
                        monthlyData = data.data;
                        await db.prayerTimesCache.put({ key: cacheKey, data: monthlyData });
                    } else {
                        throw new Error(data.data || data.status || 'Could not fetch prayer times.');
                    }
                }

                const todayData = monthlyData?.find(d => parseInt(d.date.gregorian.day, 10) === day);

                if (todayData) {
                    if (todayData.meta && todayData.meta.latitude && todayData.meta.longitude) {
                        const newLat = parseFloat(todayData.meta.latitude);
                        const newLng = parseFloat(todayData.meta.longitude);
                        // Only auto-update if coords are 0 (not set yet) to avoid overriding user custom coords
                        if ((settings.latitude === 0 || settings.longitude === 0) && (settings.latitude !== newLat || settings.longitude !== newLng)) {
                            setTimeout(() => {
                                saveSettings({
                                    ...settings,
                                    latitude: newLat,
                                    longitude: newLng
                                });
                            }, 0);
                        }
                    }

                    const timings = todayData.timings;
                    const formattedTimes: PrayerTimes = {
                        Fajr: timings.Fajr.split(' ')[0],
                        Sunrise: timings.Sunrise.split(' ')[0],
                        Dhuhr: timings.Dhuhr.split(' ')[0],
                        Asr: timings.Asr.split(' ')[0],
                        Maghrib: timings.Maghrib.split(' ')[0],
                        Isha: timings.Isha.split(' ')[0],
                    };
                    if (isMounted) setPrayerTimes(formattedTimes);
                } else {
                     throw new Error(t('main.error') + ` (${day}/${month}/${year})`);
                }
            } catch (err) {
                // Fallback to cache for the same location + month only
                const fallbackEntry = await db.prayerTimesCache.get(cacheKey);
                if (fallbackEntry) {
                    try {
                        const oldMonthlyData = fallbackEntry.data;
                        const todayInOldData = oldMonthlyData?.find((d: any) => parseInt(d.date.gregorian.day, 10) === day && parseInt(d.date.gregorian.month.number, 10) === month);
                        if (todayInOldData) {
                            const timings = todayInOldData.timings;
                            const formattedTimes: PrayerTimes = {
                                Fajr: timings.Fajr.split(' ')[0],
                                Sunrise: timings.Sunrise.split(' ')[0],
                                Dhuhr: timings.Dhuhr.split(' ')[0],
                                Asr: timings.Asr.split(' ')[0],
                                Maghrib: timings.Maghrib.split(' ')[0],
                                Isha: timings.Isha.split(' ')[0],
                            };
                            if (isMounted) {
                                setPrayerTimes(formattedTimes);
                                setError(t('main.offlineUsingCache')); // Show error but display cached data
                            }
                        } else {
                            throw err;
                        }
                    } catch (finalError) {
                        if (isMounted) {
                            setError(err instanceof Error ? err.message : t('main.error'));
                        }
                    }
                } else {
                    if (isMounted) {
                        setError(err instanceof Error ? err.message : t('main.error'));
                    }
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                    setStale(false);
                }
            }
        };

        if (settings) {
            fetchPrayerTimes();
        }

        return () => { isMounted = false; };
    }, [
        settings,
        dateTicker,
        saveSettings
    ]);

    return { prayerTimes, loading, error, stale };
};

export default usePrayerTimes;
