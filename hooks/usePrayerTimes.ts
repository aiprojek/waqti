
import { useState, useEffect } from 'react';
import type { PrayerTimes } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import { PRAYER_NAMES } from '../constants';
import { t } from '../i18n';
import { db } from '../lib/db';

// URL Library Adhan (Sama persis dengan yang di service-worker.js)
const ADHAN_URL = 'https://cdn.jsdelivr.net/npm/adhan@4.4.4/Bundles/adhan.min.js';
const ADHAN_URL_BACKUP = 'https://unpkg.com/adhan@4.4.4/Bundles/adhan.min.js';

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

    // Helper: Load script manual jika HTML script tag gagal
    const loadAdhanScript = async (): Promise<any> => {
        if ((window as any).adhan) return (window as any).adhan;

        const load = (src: string) => new Promise<void>((resolve, reject) => {
            // Cek jika script sudah ada di DOM tapi mungkin belum selesai load
            const existing = document.querySelector(`script[src="${src}"]`);
            if (existing) {
                existing.addEventListener('load', () => resolve());
                existing.addEventListener('error', () => reject(new Error("Script load failed")));
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load ${src}`));
            document.body.appendChild(script);
        });

        try {
            await load(ADHAN_URL);
        } catch (e) {
            console.warn("Primary CDN failed, trying backup...");
            await load(ADHAN_URL_BACKUP);
        }

        if (!(window as any).adhan) {
            throw new Error("Adhan.js could not be loaded. Please check connection.");
        }
        return (window as any).adhan;
    };

    useEffect(() => {
        const fetchPrayerTimes = async () => {
            if (settings.useManualTimes) {
                setPrayerTimes(settings.manualPrayerTimes);
                setLoading(false);
                setError(null);
                setStale(false);
                return;
            }

            if (prayerTimes) setStale(true);
            else setLoading(true);
            setError(null);

            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;
            const day = now.getDate();

            // --- OFFLINE CALCULATION MODE (via Adhan.js) ---
            if (settings.calculationSource === 'calculated') {
                try {
                    // Dapatkan library dengan mekanisme retry
                    const adhanLib = await loadAdhanScript();

                    if (!settings.latitude || !settings.longitude) {
                        throw new Error("Coordinates missing. Please update settings.");
                    }

                    const coordinates = new adhanLib.Coordinates(settings.latitude, settings.longitude);
                    const date = new Date(); 
                    
                    let params;
                    switch (settings.calculationMethod) {
                        case 0: params = adhanLib.CalculationMethod.Tehran(); break;
                        case 1: params = adhanLib.CalculationMethod.Karachi(); break;
                        case 2: params = adhanLib.CalculationMethod.NorthAmerica(); break;
                        case 3: params = adhanLib.CalculationMethod.MuslimWorldLeague(); break;
                        case 4: params = adhanLib.CalculationMethod.UmmAlQura(); break;
                        case 5: params = adhanLib.CalculationMethod.Egyptian(); break;
                        case 7: params = adhanLib.CalculationMethod.Tehran(); break;
                        case 8: params = adhanLib.CalculationMethod.Gulf(); break;
                        case 9: params = adhanLib.CalculationMethod.Kuwait(); break;
                        case 10: params = adhanLib.CalculationMethod.Qatar(); break;
                        case 11: params = adhanLib.CalculationMethod.Singapore(); break;
                        case 12: params = adhanLib.CalculationMethod.Other(); break;
                        case 13: params = adhanLib.CalculationMethod.Turkey(); break;
                        case 14: params = adhanLib.CalculationMethod.Other(); break;
                        case 15: params = adhanLib.CalculationMethod.MoonsightingCommittee(); break;
                        case 16: params = adhanLib.CalculationMethod.Dubai(); break;
                        case 17: params = new adhanLib.CalculationParameters(20, 18); break;
                        case 99: params = new adhanLib.CalculationParameters(settings.fajrAngle || 18, settings.ishaAngle || 18); break;
                        default: params = adhanLib.CalculationMethod.MuslimWorldLeague();
                    }

                    if (settings.madhab === 1) params.madhab = adhanLib.Madhab.Hanafi;
                    else params.madhab = adhanLib.Madhab.Shafi;

                    switch (settings.highLatitudeRule) {
                        case 'MiddleOfTheNight': params.highLatitudeRule = adhanLib.HighLatitudeRule.MiddleOfTheNight; break;
                        case 'OneSeventh': params.highLatitudeRule = adhanLib.HighLatitudeRule.SeventhOfTheNight; break;
                        case 'AngleBased': params.highLatitudeRule = adhanLib.HighLatitudeRule.TwilightAngle; break;
                        default: params.highLatitudeRule = adhanLib.HighLatitudeRule.MiddleOfTheNight;
                    }
                    
                    params.adjustments.fajr = settings.adjustments.Fajr;
                    params.adjustments.sunrise = settings.adjustments.Sunrise;
                    params.adjustments.dhuhr = settings.adjustments.Dhuhr;
                    params.adjustments.asr = settings.adjustments.Asr;
                    params.adjustments.maghrib = settings.adjustments.Maghrib;
                    params.adjustments.isha = settings.adjustments.Isha;

                    const prayerTimesObj = new adhanLib.PrayerTimes(coordinates, date, params);

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

                    setPrayerTimes(formattedTimes);
                    setLoading(false);
                    setStale(false);

                } catch (err) {
                    console.error(err);
                    setError((err instanceof Error ? err.message : String(err)));
                    setPrayerTimes(null);
                    setLoading(false);
                    setStale(false);
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
                    
                    if (hasCoords) {
                        apiUrl = `https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${settings.latitude}&longitude=${settings.longitude}&method=${settings.calculationMethod}&school=${settings.madhab}&latitudeAdjustmentMethod=${settings.highLatitudeRule}&tune=${tuneString}`;
                    } else {
                        apiUrl = `https://api.aladhan.com/v1/calendarByCity?city=${settings.city}&country=Indonesia&method=${settings.calculationMethod}&month=${month}&year=${year}&school=${settings.madhab}&latitudeAdjustmentMethod=${settings.highLatitudeRule}&tune=${tuneString}`;
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
                        if (settings.latitude !== newLat || settings.longitude !== newLng) {
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
                    setPrayerTimes(formattedTimes);
                } else {
                     throw new Error(t('main.error') + ` (${day}/${month}/${year})`);
                }
            } catch (err) {
                const anyCache = await db.prayerTimesCache.toCollection().first();
                if (anyCache) {
                    try {
                        const oldMonthlyData = anyCache.data;
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
                            setPrayerTimes(formattedTimes);
                            setError(t('main.error'));
                        } else {
                             throw err;
                        }
                    } catch (finalError) {
                         if (err instanceof Error) {
                            setError(err.message);
                        } else {
                            setError(t('main.error'));
                        }
                        setPrayerTimes(null);
                    }
                } else {
                    if (err instanceof Error) {
                        setError(err.message);
                    } else {
                        setError(t('main.error'));
                    }
                    setPrayerTimes(null);
                }
            } finally {
                setLoading(false);
                setStale(false);
            }
        };

        if (settings) {
            fetchPrayerTimes();
        }
    }, [
        settings,
        dateTicker,
        saveSettings
    ]);

    return { prayerTimes, loading, error, stale };
};

export default usePrayerTimes;
