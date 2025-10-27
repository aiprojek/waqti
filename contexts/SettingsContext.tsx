import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Settings, Slide } from '../types';
import { getDefaultSettings, IQAMAH_PRAYERS, getDefaultFridaySlides } from '../constants';
import { useLanguage } from './LanguageContext';
import { db } from '../lib/db';
import { en } from '../i18n/locales/en';
// FIX: Aliased the 'id' import to 'idLocale' to prevent variable shadowing from 'const { id, ... }' below.
import { id as idLocale } from '../i18n/locales/id';


interface SettingsContextType {
    settings: Settings;
    setSettings: React.Dispatch<React.SetStateAction<Settings>>;
    saveSettings: (newSettings: Settings) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { language } = useLanguage();
    const [settings, setSettings] = useState<Settings | null>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const loadAndMigrateSettings = async () => {
            let finalSettings: Settings | null = null;
            const DEFAULT_SETTINGS = getDefaultSettings(language);
            
            // 1. Coba dapatkan dari IndexedDB
            const settingsFromDB = await db.settings.get(1);
            if (settingsFromDB) {
                const { id, ...savedSettings } = settingsFromDB;

                // --- SMART MERGE LOGIC TO HANDLE LANGUAGE CHANGE ---
                
                // 1. Handle default translatable strings like khutbah title
                const enKhutbahTitle = en.defaults.khutbah.title;
                const idKhutbahTitle = idLocale.defaults.khutbah.title;
                if (savedSettings.khutbahMessageTitle === enKhutbahTitle || savedSettings.khutbahMessageTitle === idKhutbahTitle) {
                    savedSettings.khutbahMessageTitle = DEFAULT_SETTINGS.khutbahMessageTitle;
                }

                const enKhutbahTagline = en.defaults.khutbah.tagline;
                const idKhutbahTagline = idLocale.defaults.khutbah.tagline;
                if (savedSettings.khutbahMessageTagline === enKhutbahTagline || savedSettings.khutbahMessageTagline === idKhutbahTagline) {
                    savedSettings.khutbahMessageTagline = DEFAULT_SETTINGS.khutbahMessageTagline;
                }
                
                // 2. Handle default translatable slides
                const defaultSlidesId = getDefaultFridaySlides('id');
                const defaultSlidesEn = getDefaultFridaySlides('en');
                const defaultSlidesIdMap = new Map(defaultSlidesId.map(s => [s.id, s]));
                const defaultSlidesEnMap = new Map(defaultSlidesEn.map(s => [s.id, s]));
                const defaultSlidesCurrentLang = getDefaultFridaySlides(language);

                const savedSlides = savedSettings.slides || [];
                const finalSlides: Slide[] = [];

                // Process default slides first to maintain order
                for (const defaultSlide of defaultSlidesCurrentLang) {
                    const savedVersion = savedSlides.find(s => s.id === defaultSlide.id);
                    if (savedVersion) {
                        const defaultIdVersion = defaultSlidesIdMap.get(savedVersion.id);
                        const defaultEnVersion = defaultSlidesEnMap.get(savedVersion.id);
                        
                        // FIX: Added type checks to ensure we only access 'content' and 'title' on 'text' slides.
                        const isUnmodifiedId = defaultIdVersion && savedVersion.type === 'text' && defaultIdVersion.type === 'text' && savedVersion.content === defaultIdVersion.content && savedVersion.title === defaultIdVersion.title;
                        const isUnmodifiedEn = defaultEnVersion && savedVersion.type === 'text' && defaultEnVersion.type === 'text' && savedVersion.content === defaultEnVersion.content && savedVersion.title === defaultEnVersion.title;

                        if (isUnmodifiedId || isUnmodifiedEn) {
                            finalSlides.push(defaultSlide); // Use freshly translated version
                        } else {
                            finalSlides.push(savedVersion); // Use user-modified version
                        }
                    } else {
                        finalSlides.push(defaultSlide); // Add new default slide if not in saved data
                    }
                }

                // Add user-created slides at the end
                const userAddedSlides = savedSlides.filter(s => !s.id.startsWith('friday-slide-'));
                finalSlides.push(...userAddedSlides);
                
                savedSettings.slides = finalSlides;
                
                // NEW: Migration for Istighfar typo in dhikrList
                if (savedSettings.dhikrList && Array.isArray(savedSettings.dhikrList)) {
                    const typoIstighfar = "أَسْتَغْfِرُ اللَّهَ الْعَظِيمَ (٣×)";
                    const correctIstighfar = "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ (٣×)";
                    savedSettings.dhikrList = savedSettings.dhikrList.map(dhikr => {
                        if (dhikr.id === 'dhikr-1' && dhikr.arabic === typoIstighfar) {
                            return { ...dhikr, arabic: correctIstighfar };
                        }
                        return dhikr;
                    });
                }

                finalSettings = { ...DEFAULT_SETTINGS, ...savedSettings };

            } else {
                // 2. Jika tidak ada, coba migrasi dari localStorage
                let settingsFromLS = localStorage.getItem('waqtiPrayerTimesSettings');
                if (!settingsFromLS) {
                     settingsFromLS = localStorage.getItem('prayerTimesSettings'); // Kunci lama
                }
                
                if (settingsFromLS) {
                    try {
                        console.log("Migrating settings from localStorage to IndexedDB...");
                        const parsed = JSON.parse(settingsFromLS);

                        // --- Jalankan logika migrasi yang ada ---
                        if (parsed.prayerDuration && !parsed.prayerDurations) {
                            parsed.prayerDurations = {};
                            IQAMAH_PRAYERS.forEach(p => {
                                parsed.prayerDurations[p] = parsed.prayerDuration;
                            });
                            delete parsed.prayerDuration;
                        }
                        if (parsed.slides && Array.isArray(parsed.slides)) {
                             parsed.slides = parsed.slides.map((slide: any) => {
                                if (slide.textAlign) delete slide.textAlign;
                                return {
                                    ...slide,
                                    enabled: slide.enabled === undefined ? true : slide.enabled,
                                    duration: slide.duration === undefined ? (parsed.slideInterval || 15) : slide.duration,
                                    type: slide.type || 'text',
                                };
                            });
                        }
                        if (parsed.slideInterval) delete parsed.slideInterval;
                        if (parsed.runningText && typeof parsed.runningText === 'string' && !parsed.customTexts) {
                            parsed.customTexts = [{ id: 'migrated-1', content: parsed.runningText }];
                            delete parsed.runningText;
                        }
                        if (parsed.runningTextMode === 'static') parsed.runningTextMode = 'custom';
                        if (!parsed.dhikrList || !Array.isArray(parsed.dhikrList)) {
                            parsed.dhikrList = DEFAULT_SETTINGS.dhikrList;
                            parsed.selectedDhikr = DEFAULT_SETTINGS.selectedDhikr;
                        }

                        // NEW: Migration for Istighfar typo in dhikrList from localStorage
                        if (parsed.dhikrList && Array.isArray(parsed.dhikrList)) {
                            const typoIstighfar = "أَسْتَغْfِرُ اللَّهَ الْعَظِيمَ (٣×)";
                            const correctIstighfar = "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ (٣×)";
                            parsed.dhikrList = parsed.dhikrList.map((dhikr: any) => {
                                if (dhikr.id === 'dhikr-1' && dhikr.arabic === typoIstighfar) {
                                    return { ...dhikr, arabic: correctIstighfar };
                                }
                                return dhikr;
                            });
                        }
                        
                        const migratedSettings = { ...DEFAULT_SETTINGS, ...parsed };
                        
                        // Simpan ke IndexedDB
                        await db.settings.put({ ...migratedSettings, id: 1 });
                        
                        // Hapus dari localStorage
                        localStorage.removeItem('waqtiPrayerTimesSettings');
                        localStorage.removeItem('prayerTimesSettings');
                        
                        finalSettings = migratedSettings;
                        console.log("Migration successful.");
                    } catch (e) {
                        console.error("Failed to migrate settings from localStorage", e);
                    }
                }
            }
            
            // 3. Jika masih belum ada pengaturan, gunakan default
            if (!finalSettings) {
                console.log("No existing settings found, using defaults.");
                finalSettings = DEFAULT_SETTINGS;
                await db.settings.put({ ...finalSettings, id: 1 });
            }
            
            setSettings(finalSettings);
            setLoading(false);
        };
    
        loadAndMigrateSettings();
    }, [language]);

    const saveSettings = useCallback(async (newSettings: Settings) => {
        try {
            await db.settings.put({ ...newSettings, id: 1 });
            setSettings(newSettings); // Update state lokal
        } catch (error) {
            console.error("Failed to save settings to IndexedDB", error);
        }
    }, []);

    if (loading || !settings) {
        return <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 text-white">Loading Settings...</div>;
    }

    return (
        <SettingsContext.Provider value={{ settings, setSettings, saveSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};