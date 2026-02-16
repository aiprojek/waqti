
import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import type { Settings, Slide, ScheduleSlide, ScheduleItem, FinanceSlide, FinanceInfo } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import { getDefaultSettings } from '../constants';
import { GeneralSettingsTab } from './settings/GeneralSettingsTab';
import { CalculationSettingsTab } from './settings/CalculationSettingsTab';
import { DisplaySettingsTab } from './settings/DisplaySettingsTab';
import { AlarmSettingsTab } from './settings/AlarmSettingsTab';
import { SlideSettingsTab } from './settings/SlideSettingsTab';
import { NotificationModal } from './NotificationModal';
import { t } from '../i18n';
import { useLanguage } from '../contexts/LanguageContext';

const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
        <polyline points="17 21 17 13 7 13 7 21"></polyline>
        <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
);

const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
);


const TABS = ['general', 'calculation', 'display', 'alarm', 'slides'];
type TabNameKey = (typeof TABS)[number];

interface PageProps {
    onBack: () => void;
    onGoToServices: () => void;
}

export const SettingsPage: React.FC<PageProps> = ({ onBack, onGoToServices }) => {
    const { settings, saveSettings } = useSettings();
    const { language } = useLanguage();
    const [localSettings, setLocalSettings] = useState<Settings>(() => JSON.parse(JSON.stringify(settings)));
    const [activeTab, setActiveTab] = useState<TabNameKey>('general');
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    // --- General Settings States & Handlers ---
    const [citySearch, setCitySearch] = useState(settings.city);
    const [isSearching, setIsSearching] = useState(false);
    // FIX: Explicitly type the state to allow 'success', 'error', and 'info' types.
    const [locationStatus, setLocationStatus] = useState<{ message: string; type: 'success' | 'error' | 'info' }>({ message: t('settings.general.currentCity', { city: settings.city }), type: 'info' });
    const importFileRef = useRef<HTMLInputElement>(null);

    const locationStatusColor = useMemo(() => ({
        success: 'text-green-500 dark:text-green-400',
        error: 'text-red-500 dark:text-red-400',
        info: 'text-slate-500 dark:text-slate-400'
    }[locationStatus.type]), [locationStatus.type]);

    useEffect(() => {
        setLocalSettings(JSON.parse(JSON.stringify(settings)));
        setCitySearch(settings.city);
    }, [settings]);

    const handleSave = () => {
        try {
            saveSettings(localSettings);
            setNotification({ message: t('general.saved'), type: 'success' });
            setTimeout(onBack, 1000);
        } catch (error) {
            console.error("Error saving settings:", error);
            setNotification({ message: t('general.saveError'), type: 'error' });
        }
    };
    
    // --- Generic Handlers ---
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        let processedValue: string | number | boolean = value;

        if (type === 'checkbox') {
            processedValue = (e.target as HTMLInputElement).checked;
        } else if (type === 'number') {
            processedValue = value === '' ? '' : Number(value);
        }

        setLocalSettings(prev => ({
            ...prev,
            [name]: processedValue
        }));
    }, []);
    
    const handleNestedChange = useCallback((category: keyof Settings, key: string, value: string | number) => {
        setLocalSettings(prev => {
            const categoryObject = prev[category];
            if (typeof categoryObject === 'object' && !Array.isArray(categoryObject) && categoryObject !== null) {
                return {
                    ...prev,
                    [category]: {
                        ...(categoryObject as object),
                        [key]: value
                    }
                };
            }
            return prev;
        });
    }, []);

    // --- General Tab (Modified for Dual Mode Support) ---
    const handleLocationSearch = useCallback(async () => {
        const searchTerm = citySearch.trim();
        if (searchTerm.length <= 2) {
             setLocationStatus({ message: t('settings.general.cityTooShort'), type: 'error' });
             return;
        }

        setIsSearching(true);
        setLocationStatus({ message: t('settings.general.searching'), type: 'info' });
        
        try {
            // Geocoding: Fetch coordinates from the city name
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&limit=1`);
            const data = await response.json();

            if (data && data.length > 0) {
                const { lat, lon, display_name } = data[0];
                
                // Extract a simpler city name from display_name if possible, otherwise use search term
                const simpleCityName = display_name.split(',')[0];

                setLocalSettings(p => ({
                    ...p, 
                    city: simpleCityName, // Update Name
                    latitude: parseFloat(lat), // Update Coord
                    longitude: parseFloat(lon), // Update Coord
                    useManualTimes: false
                }));
                
                // Update the search box to match the found name
                setCitySearch(simpleCityName);

                setLocationStatus({ 
                    message: t('settings.calculation.source.searchSuccess', { city: simpleCityName }), 
                    type: 'success' 
                });
            } else {
                // Fallback: If coordinates not found, just save the name (Online mode might still work roughly)
                // but warn the user.
                setLocalSettings(p => ({...p, city: searchTerm, useManualTimes: false}));
                setLocationStatus({ message: t('settings.calculation.source.searchNotFound') + " (Offline mode unavailable)", type: 'error' });
            }
        } catch (error) {
            console.error("Geocoding failed:", error);
            // Fallback for offline/error
            setLocalSettings(p => ({...p, city: searchTerm, useManualTimes: false}));
            setLocationStatus({ message: t('main.error'), type: 'error' });
        } finally {
            setIsSearching(false);
        }
    }, [citySearch]);

    const handleExportData = () => {
        try {
            const settingsString = JSON.stringify(settings, null, 2);
            const blob = new Blob([settingsString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `waqti-settings-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setNotification({ message: t('general.exported'), type: 'success' });
        } catch (error) {
            setNotification({ message: t('general.exportError'), type: 'error' });
        }
    };
    
    const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("Invalid file content");
                const importedSettings = JSON.parse(text);
                
                if (importedSettings.mosqueName && importedSettings.city) {
                    const mergedSettings = { ...getDefaultSettings(language), ...importedSettings };
                    saveSettings(mergedSettings); // Save directly and let context handle update
                    setNotification({ message: t('general.imported'), type: 'success' });
                    setTimeout(() => window.location.reload(), 3000);
                } else {
                    throw new Error("Invalid file.");
                }
            } catch (error) {
                 setNotification({ message: t('general.importError'), type: 'error' });
            } finally {
                if(importFileRef.current) importFileRef.current.value = "";
            }
        };
        reader.readAsText(file);
    };

    // --- Display Tab ---
    const [wallpaperType, setWallpaperType] = useState<'url' | 'upload'>(localSettings.wallpaper?.startsWith('data:image') ? 'upload' : 'url');
    // FIX: Explicitly type the state to allow 'success', 'error', and 'info' types.
    const [uploadStatus, setUploadStatus] = useState<{ message: string; type: 'success' | 'error' | 'info' }>({ message: '', type: 'info' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const uploadStatusColor = useMemo(() => ({
        success: 'text-green-500 dark:text-green-400',
        error: 'text-red-500 dark:text-red-400',
        info: 'text-slate-500 dark:text-slate-400'
    }[uploadStatus.type]), [uploadStatus.type]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
        if (file.size > MAX_FILE_SIZE) {
            setUploadStatus({message: t('settings.display.wallpaper.maxSize'), type: 'error'});
            return;
        }
        if (!file.type.startsWith('image/')) {
            setUploadStatus({message: 'Unsupported file format.', type: 'error'});
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setLocalSettings(prev => ({...prev, wallpaper: reader.result as string}));
            setUploadStatus({message: 'Image uploaded successfully.', type: 'success'});
        };
        reader.onerror = () => setUploadStatus({message: 'Failed to read file.', type: 'error'});
        reader.readAsDataURL(file);
    };

    const handleThemeCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setLocalSettings(p => {
            const currentThemes = p.runningTextThemes || [];
            if (checked) {
                return {...p, runningTextThemes: [...currentThemes, value]};
            } else {
                return {...p, runningTextThemes: currentThemes.filter(t => t !== value)};
            }
        });
    };

    const handleCustomTextChange = (index: number, html: string) => {
        setLocalSettings(p => {
            const newCustomTexts = [...(p.customTexts || [])];
            newCustomTexts[index] = {...newCustomTexts[index], content: html};
            return {...p, customTexts: newCustomTexts};
        });
    };

    const addCustomText = () => {
        setLocalSettings(p => ({
            ...p,
            customTexts: [...(p.customTexts || []), { id: `custom-${Date.now()}`, content: '<p><br></p>' }]
        }));
    };

    const removeCustomText = (index: number) => {
         setLocalSettings(p => ({
            ...p,
            customTexts: (p.customTexts || []).filter((_, i) => i !== index)
        }));
    };
    
    // --- Alarm & Dhikr Tab ---
    const [newDhikrArabic, setNewDhikrArabic] = useState('');
    const [newDhikrLatin, setNewDhikrLatin] = useState('');
    
    const handleDhikrSelectionChange = (dhikrId: string, isChecked: boolean) => {
        setLocalSettings(prev => {
            const selected = new Set(prev.selectedDhikr || []);
            if (isChecked) {
                selected.add(dhikrId);
            } else {
                selected.delete(dhikrId);
            }
            return { ...prev, selectedDhikr: Array.from(selected) };
        });
    };

    const handleMoveDhikr = (index: number, direction: 'up' | 'down') => {
        const list = [...(localSettings.dhikrList || [])];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= list.length) return;
        [list[index], list[newIndex]] = [list[newIndex], list[index]];
        setLocalSettings(prev => ({ ...prev, dhikrList: list }));
    };

    const handleRemoveDhikr = (idToRemove: string) => {
        setLocalSettings(prev => ({
            ...prev,
            dhikrList: (prev.dhikrList || []).filter(d => d.id !== idToRemove),
            selectedDhikr: (prev.selectedDhikr || []).filter(id => id !== idToRemove),
        }));
    };

    const handleAddDhikr = () => {
        if (!newDhikrArabic.trim() || !newDhikrLatin.trim()) {
            setNotification({ message: t('settings.alarm.duration.emptyFields'), type: 'error' });
            return;
        }
        const newDhikr = {
            id: `dhikr-${Date.now()}`,
            arabic: newDhikrArabic.trim(),
            latin: newDhikrLatin.trim(),
        };
        const newList = [...(localSettings.dhikrList || []), newDhikr];
        const newSelected = [...(localSettings.selectedDhikr || []), newDhikr.id];
        setLocalSettings(prev => ({...prev, dhikrList: newList, selectedDhikr: newSelected}));
        setNewDhikrArabic('');
        setNewDhikrLatin('');
    };

    // --- Slide Tab ---
    const [slideImageTypes, setSlideImageTypes] = useState<Record<string, 'url' | 'upload'>>(() => 
        (localSettings.slides || []).reduce((acc, slide) => {
            if (slide.type === 'image' && slide.imageUrl?.startsWith('data:image')) {
                acc[slide.id] = 'upload';
            }
            return acc;
        }, {} as Record<string, 'url' | 'upload'>)
    );
    const slideFileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const addSlide = (type: 'text' | 'image' | 'schedule' | 'finance' | 'friday-officer') => {
        let newSlide: Slide;
        const base = { id: `slide-${Date.now()}`, enabled: true, duration: 15 };
        switch (type) {
            case 'image':
                newSlide = { ...base, type, imageUrl: '', qrCodeUrl: '' };
                break;
            case 'schedule':
                newSlide = { ...base, type, title: t('settings.slides.type.schedule'), scheduleItems: [] };
                break;
             case 'finance':
                newSlide = { ...base, type, financeInfo: { title: t('settings.slides.type.finance'), lastBalance: 0, income: 0, expense: 0, currentBalance: 0, lastUpdated: new Date().toISOString() } };
                break;
            case 'friday-officer':
                newSlide = { ...base, type, title: t('settings.slides.type.friday-officer'), officers: { khotib: '', imam: '', muadzin: '', bilal: '' }, fridayOnly: true };
                break;
            case 'text':
            default:
                newSlide = { ...base, type, title: '', content: '<p><br></p>', qrCodeUrl: '' };
                break;
        }
        setLocalSettings(p => ({ ...p, slides: [...(p.slides || []), newSlide] }));
    };

    const removeSlide = (index: number) => {
        setLocalSettings(p => ({...p, slides: p.slides.filter((_, i) => i !== index) }));
    };
    
    const handleSlideChange = (index: number, field: string, value: any) => {
        setLocalSettings(p => {
            const newSlides = [...p.slides];
            newSlides[index] = { ...newSlides[index], [field]: value };
            return { ...p, slides: newSlides };
        });
    };
    
    const handleScheduleItemChange = (slideIndex: number, itemIndex: number, field: keyof ScheduleItem, value: string) => {
        setLocalSettings(p => {
            const newSlides = [...p.slides];
            const slide = newSlides[slideIndex] as ScheduleSlide;
            const newItems = [...slide.scheduleItems];
            newItems[itemIndex] = {...newItems[itemIndex], [field]: value};
            newSlides[slideIndex] = {...slide, scheduleItems: newItems};
            return {...p, slides: newSlides};
        });
    };

    const addScheduleItem = (slideIndex: number) => {
         setLocalSettings(p => {
            const newSlides = [...p.slides];
            const slide = newSlides[slideIndex] as ScheduleSlide;
            const newItem: ScheduleItem = { id: `item-${Date.now()}`, topic: '', speaker: '', day: '', time: '' };
            newSlides[slideIndex] = {...slide, scheduleItems: [...slide.scheduleItems, newItem]};
            return {...p, slides: newSlides};
        });
    };

    const removeScheduleItem = (slideIndex: number, itemIndex: number) => {
        setLocalSettings(p => {
            const newSlides = [...p.slides];
            const slide = newSlides[slideIndex] as ScheduleSlide;
            newSlides[slideIndex] = {...slide, scheduleItems: slide.scheduleItems.filter((_, i) => i !== itemIndex)};
            return {...p, slides: newSlides};
        });
    };

    const handleFinanceInfoChange = (slideIndex: number, field: keyof Omit<FinanceInfo, 'lastUpdated' | 'currentBalance'>, value: string | number) => {
        setLocalSettings(p => {
            const newSlides = [...p.slides];
            const slide = newSlides[slideIndex] as FinanceSlide;
            const newInfo = { ...slide.financeInfo, [field]: Number(value) || 0 };
            newInfo.currentBalance = (newInfo.lastBalance || 0) + (newInfo.income || 0) - (newInfo.expense || 0);
            newInfo.lastUpdated = new Date().toISOString();
            newSlides[slideIndex] = { ...slide, financeInfo: newInfo };
            return { ...p, slides: newSlides };
        });
    };

    const handleSlideImageTypeChange = (index: number, type: 'url' | 'upload') => {
        const slideId = localSettings.slides[index].id;
        setSlideImageTypes(p => ({...p, [slideId]: type}));
    };

    const handleSlideImageChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            setNotification({message: t('settings.display.wallpaper.maxSize'), type: 'error'});
            return;
        }
        if (!file.type.startsWith('image/')) {
            setNotification({message: 'Unsupported file format.', type: 'error'});
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            handleSlideChange(index, 'imageUrl', reader.result as string);
        };
        reader.onerror = () => setNotification({message: 'Failed to read file.', type: 'error'});
        reader.readAsDataURL(file);
    };

    const TAB_COMPONENTS: Record<TabNameKey, React.ReactNode> = {
        'general': <GeneralSettingsTab {...{ localSettings, handleInputChange, handleExportData, handleImportData, importFileRef, onGoToServices }} />,
        'calculation': <CalculationSettingsTab {...{ localSettings, handleInputChange, handleNestedChange, citySearch, setCitySearch, handleLocationSearch, isSearching, locationStatus, locationStatusColor }} />,
        'display': <DisplaySettingsTab {...{ localSettings, setLocalSettings, handleInputChange, handleThemeCheckboxChange, handleCustomTextChange, addCustomText, removeCustomText, wallpaperType, setWallpaperType, uploadStatus, fileInputRef, handleFileChange, uploadStatusColor }} />,
        'alarm': <AlarmSettingsTab {...{ localSettings, setLocalSettings, handleInputChange, handleNestedChange, handleDhikrSelectionChange, handleMoveDhikr, handleRemoveDhikr, newDhikrArabic, setNewDhikrArabic, newDhikrLatin, setNewDhikrLatin, handleAddDhikr }} />,
        'slides': <SlideSettingsTab {...{ localSettings, addSlide, removeSlide, handleSlideChange, handleScheduleItemChange, addScheduleItem, removeScheduleItem, handleFinanceInfoChange, slideImageTypes, handleSlideImageTypeChange, slideFileInputRefs, handleSlideImageChange }} />,
    };

    return (
        <div className="h-screen bg-white/80 dark:bg-black/60 backdrop-blur-md flex flex-col">
             <NotificationModal 
                message={notification?.message || ''}
                type={notification?.type || 'info'}
                onClose={() => setNotification(null)}
            />

            <header className="bg-white/80 dark:bg-slate-900/80 p-4 flex items-center border-b border-slate-200 dark:border-slate-700 z-10 flex-shrink-0">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
                    <BackIcon />
                </button>
                <h2 className="text-2xl font-bold text-center flex-grow">{t('settings.title')}</h2>
                <button onClick={handleSave} className="p-2 bg-[var(--accent-color)] text-white rounded-full hover:opacity-90 transition-opacity flex items-center gap-2">
                    <SaveIcon />
                </button>
            </header>
            
            <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
                <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 p-4 flex-shrink-0">
                    {/* Mobile Dropdown */}
                    <div className="md:hidden relative">
                        <button
                            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                            className="w-full flex justify-between items-center p-3 rounded-md font-semibold bg-slate-200/50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600"
                        >
                            <span>{t(`settings.tabs.${activeTab}`)}</span>
                            <span className={`transform transition-transform duration-200 ${isMobileNavOpen ? 'rotate-180' : ''}`}>
                                <ChevronDownIcon />
                            </span>
                        </button>
                        {isMobileNavOpen && (
                            <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsMobileNavOpen(false)}></div>
                            <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 rounded-md shadow-lg z-20 border border-slate-200 dark:border-slate-700 py-1">
                                {TABS.map(tabKey => (
                                    <button
                                        key={tabKey}
                                        onClick={() => {
                                            setActiveTab(tabKey as TabNameKey);
                                            setIsMobileNavOpen(false);
                                        }}
                                        className={`w-full text-left p-3 text-sm font-medium transition-colors ${
                                            activeTab === tabKey 
                                            ? 'bg-[var(--accent-color)] text-white' 
                                            : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        {t(`settings.tabs.${tabKey}`)}
                                    </button>
                                ))}
                            </div>
                            </>
                        )}
                    </div>

                    {/* Desktop Sidebar */}
                    <nav className="hidden md:flex flex-col gap-2">
                        {TABS.map(tabKey => (
                            <button
                                key={tabKey}
                                onClick={() => setActiveTab(tabKey as TabNameKey)}
                                className={`w-full text-left p-3 rounded-md text-sm font-semibold transition-colors ${
                                    activeTab === tabKey 
                                    ? 'bg-[var(--accent-color)] text-white' 
                                    : 'hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                                }`}
                            >
                                {t(`settings.tabs.${tabKey}`)}
                            </button>
                        ))}
                    </nav>
                </aside>

                <main className="flex-grow p-6 overflow-y-auto">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {TAB_COMPONENTS[activeTab]}
                    </div>
                </main>
            </div>
        </div>
    );
};
