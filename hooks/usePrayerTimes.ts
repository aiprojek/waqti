
import { useState, useEffect } from 'react';
import type { PrayerTimes } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import { PRAYER_NAMES } from '../constants';
import { t } from '../i18n';
import { db } from '../lib/db';

// Declare adhan as a global variable since it is loaded via script tag
declare var adhan: any;

const usePrayerTimes = () => {
    const { settings, saveSettings } = useSettings();
    const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stale, setStale] = useState(false); // UX Improvement: for graceful loading
    
    // NEW: Track the current day of the month to trigger refreshes automatically at midnight
    const [dateTicker, setDateTicker] = useState(new Date().getDate());

    useEffect(() => {
        // Check for date change every minute
        const timer = setInterval(() => {
            const now = new Date();
            if (now.getDate() !== dateTicker) {
                setDateTicker(now.getDate());
            }
        }, 60000);
        return () => clearInterval(timer);
    }, [dateTicker]);

    useEffect(() => {
        const fetchPrayerTimes = async () => {
            if (settings.useManualTimes) {
                setPrayerTimes(settings.manualPrayerTimes);
                setLoading(false);
                setError(null);
                setStale(false);
                return;
            }

            if (prayerTimes) {
                setStale(true);
            } else {
                setLoading(true);
            }
            setError(null);

            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;
            const day = now.getDate();

            // --- OFFLINE CALCULATION MODE (via Adhan.js) ---
            if (settings.calculationSource === 'calculated') {
                try {
                    if (typeof adhan === 'undefined') {
                        throw new Error("Library Adhan.js not loaded.");
                    }

                    if (!settings.latitude || !settings.longitude) {
                        throw new Error("Coordinates missing. Please update settings.");
                    }

                    const coordinates = new adhan.Coordinates(settings.latitude, settings.longitude);
                    const date = new Date(); // Today
                    
                    // Map settings ID to Adhan calculation method
                    let params;
                    // Mapping logic based on Aladhan API method IDs to Adhan.js methods
                    switch (settings.calculationMethod) {
                        case 0: params = adhan.CalculationMethod.Tehran(); break; // Shia Ithna-Ansari -> Tehran (approx)
                        case 1: params = adhan.CalculationMethod.Karachi(); break;
                        case 2: params = adhan.CalculationMethod.NorthAmerica(); break;
                        case 3: params = adhan.CalculationMethod.MuslimWorldLeague(); break;
                        case 4: params = adhan.CalculationMethod.UmmAlQura(); break;
                        case 5: params = adhan.CalculationMethod.Egyptian(); break;
                        case 7: params = adhan.CalculationMethod.Tehran(); break;
                        case 8: params = adhan.CalculationMethod.Gulf(); break;
                        case 9: params = adhan.CalculationMethod.Kuwait(); break;
                        case 10: params = adhan.CalculationMethod.Qatar(); break;
                        case 11: params = adhan.CalculationMethod.Singapore(); break;
                        case 12: params = adhan.CalculationMethod.Other(); break; // UOIF (France) not directly standard, use Other or closest
                        case 13: params = adhan.CalculationMethod.Turkey(); break;
                        case 14: params = adhan.CalculationMethod.Other(); break; // Russia
                        case 15: params = adhan.CalculationMethod.MoonsightingCommittee(); break;
                        case 16: params = adhan.CalculationMethod.Dubai(); break;
                        case 17: // Kemenag RI
                            // Custom parameters for Indonesia: Fajr 20 deg, Isha 18 deg
                            params = new adhan.CalculationParameters(20, 18);
                            // Optimization: Adhan.js doesn't have a direct "Indonesia" preset that matches exact adjustments perfectly everywhere,
                            // but 20/18 is the standard angle.
                            break;
                        case 99: // Custom
                             params = new adhan.CalculationParameters(settings.fajrAngle || 18, settings.ishaAngle || 18);
                             break;
                        default: params = adhan.CalculationMethod.MuslimWorldLeague();
                    }

                    // Set Madhab
                    if (settings.madhab === 1) {
                        params.madhab = adhan.Madhab.Hanafi;
                    } else {
                        params.madhab = adhan.Madhab.Shafi;
                    }

                    // Set High Latitude Rule
                    switch (settings.highLatitudeRule) {
                        case 'MiddleOfTheNight': params.highLatitudeRule = adhan.HighLatitudeRule.MiddleOfTheNight; break;
                        case 'OneSeventh': params.highLatitudeRule = adhan.HighLatitudeRule.SeventhOfTheNight; break;
                        case 'AngleBased': params.highLatitudeRule = adhan.HighLatitudeRule.TwilightAngle; break;
                        default: params.highLatitudeRule = adhan.HighLatitudeRule.MiddleOfTheNight; // Default/Auto
                    }
                    
                    // Set Adjustments (minutes)
                    params.adjustments.fajr = settings.adjustments.Fajr;
                    params.adjustments.sunrise = settings.adjustments.Sunrise;
                    params.adjustments.dhuhr = settings.adjustments.Dhuhr;
                    params.adjustments.asr = settings.adjustments.Asr;
                    params.adjustments.maghrib = settings.adjustments.Maghrib;
                    params.adjustments.isha = settings.adjustments.Isha;

                    const prayerTimesObj = new adhan.PrayerTimes(coordinates, date, params);

                    // Helper to format date to HH:mm
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
                    setError("Calculation Error: " + (err instanceof Error ? err.message : String(err)));
                    setPrayerTimes(null);
                    setLoading(false);
                    setStale(false);
                }
                return;
            }

            // --- ONLINE API MODE ---
            // If coordinates are set, prefer them over city name for better precision
            const hasCoords = settings.latitude && settings.longitude && settings.latitude !== 0 && settings.longitude !== 0;
            const cacheKey = hasCoords
                ? `prayerTimesCache-${settings.latitude}-${settings.longitude}-${year}-${month}`
                : `prayerTimesCache-${settings.city}-${year}-${month}`;

            try {
                // 1. Coba dapatkan dari cache IndexedDB terlebih dahulu
                const cachedEntry = await db.prayerTimesCache.get(cacheKey);
                let monthlyData: any[] | null = null;

                if (cachedEntry) {
                    monthlyData = cachedEntry.data;
                } else {
                    // 2. Jika tidak ada di cache, ambil dari API
                    // Bersihkan cache lama sebelum mengambil yang baru
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

                // 3. Ekstrak waktu shalat hari ini dari data bulanan
                const todayData = monthlyData?.find(d => parseInt(d.date.gregorian.day, 10) === day);

                if (todayData) {
                    // FEATURE: Auto-save coordinates if missing, to enable easy switch to offline mode later
                    if (todayData.meta && todayData.meta.latitude && todayData.meta.longitude) {
                        const newLat = parseFloat(todayData.meta.latitude);
                        const newLng = parseFloat(todayData.meta.longitude);
                        // Only update if coords are different or missing
                        if (settings.latitude !== newLat || settings.longitude !== newLng) {
                            // Using setTimeout to avoid update loop during render cycle
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
                 // Jika terjadi error (misal, offline), coba gunakan cache lama jika ada
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
        dateTicker, // NEW: Re-run when the day changes
        saveSettings // Dependency for coordinate auto-save
    ]);

    return { prayerTimes, loading, error, stale };
};

export default usePrayerTimes;