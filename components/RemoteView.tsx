
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useRemote } from '../contexts/RemoteContext';
import { Settings, ScheduleItem, FinanceInfo, Slide, FridayOfficerSlide } from '../types';
import { getDefaultSettings } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n';

// Import actual settings tabs to mirror the main app experience
import { GeneralSettingsTab } from './settings/GeneralSettingsTab';
import { CalculationSettingsTab } from './settings/CalculationSettingsTab';
import { DisplaySettingsTab } from './settings/DisplaySettingsTab';
import { AlarmSettingsTab } from './settings/AlarmSettingsTab';
import { SlideSettingsTab } from './settings/SlideSettingsTab';

// Simple Icons
const PlaybackIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>);
const MenuIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>);
const SettingsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>);
const ArrowUp = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>);
const ArrowDown = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>);
const ArrowLeft = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>);
const ArrowRight = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>);
const CloseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
const SendIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>);
const DownloadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>);

const TABS = ['general', 'calculation', 'display', 'alarm', 'slides'];
type TabNameKey = (typeof TABS)[number];

export const RemoteView: React.FC = () => {
    const { connectionStatus, sendCommand, resetConnection, lastCommand } = useRemote();
    const { language } = useLanguage();
    const [showRetry, setShowRetry] = useState(false);
    const wakeLockRef = useRef<any>(null);
    const [activeTab, setActiveTab] = useState<'playback' | 'nav' | 'settings'>('playback');
    const [inputText, setInputText] = useState('');

    // --- Settings State Management (Mirroring SettingsContext) ---
    const [localSettings, setLocalSettings] = useState<Settings>(() => getDefaultSettings(language));
    const [settingsTab, setSettingsTab] = useState<TabNameKey>('general');
    const [isSending, setIsSending] = useState(false);

    // --- Helpers for Display Tab ---
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadStatus, setUploadStatus] = useState<{ message: string; type: 'success' | 'error' | 'info' }>({ message: '', type: 'info' });
    const [wallpaperType, setWallpaperType] = useState<'url' | 'upload'>('url');
    const uploadStatusColor = useMemo(() => ({
        success: 'text-green-500',
        error: 'text-red-500',
        info: 'text-slate-500'
    }[uploadStatus.type]), [uploadStatus.type]);

    // --- Helpers for Calculation Tab ---
    const [citySearch, setCitySearch] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [locationStatus, setLocationStatus] = useState<{ message: string; type: 'success' | 'error' | 'info' }>({ message: '', type: 'info' });
    const locationStatusColor = useMemo(() => ({
        success: 'text-green-500',
        error: 'text-red-500',
        info: 'text-slate-500'
    }[locationStatus.type]), [locationStatus.type]);

    // --- Helpers for Alarm Tab ---
    const [newDhikrArabic, setNewDhikrArabic] = useState('');
    const [newDhikrLatin, setNewDhikrLatin] = useState('');

    // --- Helpers for Slide Tab ---
    const slideFileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [slideImageTypes, setSlideImageTypes] = useState<Record<string, 'url' | 'upload'>>({});

    // --- General Tab Dummy Refs ---
    const importFileRef = useRef<HTMLInputElement>(null);

    // --- Listen for Data from TV ---
    useEffect(() => {
        if (lastCommand && lastCommand.type === 'SETTINGS_SNAPSHOT' && lastCommand.payload) {
            // Merge received snapshot with default settings structure to ensure type safety
            setLocalSettings(prev => ({
                ...prev,
                ...lastCommand.payload
            }));
            alert('Data berhasil disinkronkan dari TV!');
        }
    }, [lastCommand]);

    // --- Image Compression Helper ---
    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800; 
                    const scaleSize = MAX_WIDTH / img.width;
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scaleSize;
                    
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                    
                    // Compress to JPEG 0.5 (medium quality)
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
                    resolve(dataUrl);
                };
            };
            reader.onerror = error => reject(error);
        });
    };

    // --- Event Handlers (Mirrored from SettingsModal) ---
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        let processedValue: string | number | boolean = value;
        if (type === 'checkbox') processedValue = (e.target as HTMLInputElement).checked;
        else if (type === 'number') processedValue = value === '' ? '' : Number(value);

        setLocalSettings(prev => ({ ...prev, [name]: processedValue }));
    }, []);

    const handleNestedChange = useCallback((category: keyof Settings, key: string, value: string | number) => {
        setLocalSettings(prev => {
            const categoryObject = prev[category];
            if (typeof categoryObject === 'object' && !Array.isArray(categoryObject) && categoryObject !== null) {
                return { ...prev, [category]: { ...(categoryObject as object), [key]: value } };
            }
            return prev;
        });
    }, []);

    // --- Display Tab Logic ---
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setUploadStatus({ message: 'Compressing & Saving...', type: 'info' });
        try {
            const compressedBase64 = await compressImage(file);
            setLocalSettings(prev => ({...prev, wallpaper: compressedBase64}));
            setUploadStatus({ message: 'Ready to send.', type: 'success' });
        } catch (e) {
            setUploadStatus({ message: 'Failed to process image.', type: 'error' });
        }
    };

    const handleThemeCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setLocalSettings(p => {
            const currentThemes = p.runningTextThemes || [];
            return checked 
                ? {...p, runningTextThemes: [...currentThemes, value]} 
                : {...p, runningTextThemes: currentThemes.filter(t => t !== value)};
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
            ...p, customTexts: [...(p.customTexts || []), { id: `custom-${Date.now()}`, content: '' }]
        }));
    };

    const removeCustomText = (index: number) => {
         setLocalSettings(p => ({
            ...p, customTexts: (p.customTexts || []).filter((_, i) => i !== index)
        }));
    };

    // --- Alarm Tab Logic ---
    const handleDhikrSelectionChange = (dhikrId: string, isChecked: boolean) => {
        setLocalSettings(prev => {
            const selected = new Set(prev.selectedDhikr || []);
            if (isChecked) selected.add(dhikrId); else selected.delete(dhikrId);
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
        if (!newDhikrArabic.trim() || !newDhikrLatin.trim()) return;
        const newDhikr = { id: `dhikr-${Date.now()}`, arabic: newDhikrArabic.trim(), latin: newDhikrLatin.trim() };
        setLocalSettings(prev => ({
            ...prev,
            dhikrList: [...(prev.dhikrList || []), newDhikr],
            selectedDhikr: [...(prev.selectedDhikr || []), newDhikr.id]
        }));
        setNewDhikrArabic('');
        setNewDhikrLatin('');
    };

    // --- Slide Tab Logic ---
    const addSlide = (type: 'text' | 'image' | 'schedule' | 'finance' | 'friday-officer') => {
        let newSlide: Slide;
        const base = { id: `slide-${Date.now()}`, enabled: true, duration: 15 };
        switch (type) {
            case 'image': newSlide = { ...base, type, imageUrl: '', qrCodeUrl: '' }; break;
            case 'schedule': newSlide = { ...base, type, title: 'Jadwal', scheduleItems: [] }; break;
            case 'finance': newSlide = { ...base, type, financeInfo: { title: 'Keuangan', lastBalance: 0, income: 0, expense: 0, currentBalance: 0 } }; break;
            case 'friday-officer': newSlide = { ...base, type, title: 'Petugas Jumat', officers: { khotib: '', imam: '', muadzin: '', bilal: '' }, fridayOnly: true }; break;
            case 'text': default: newSlide = { ...base, type, title: '', content: '', qrCodeUrl: '' }; break;
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
            const slide = newSlides[slideIndex] as any; // Cast for simpler handling
            const newItems = [...slide.scheduleItems];
            newItems[itemIndex] = {...newItems[itemIndex], [field]: value};
            newSlides[slideIndex] = {...slide, scheduleItems: newItems};
            return {...p, slides: newSlides};
        });
    };

    const addScheduleItem = (slideIndex: number) => {
         setLocalSettings(p => {
            const newSlides = [...p.slides];
            const slide = newSlides[slideIndex] as any;
            const newItem: ScheduleItem = { id: `item-${Date.now()}`, topic: '', speaker: '', day: '', time: '' };
            newSlides[slideIndex] = {...slide, scheduleItems: [...slide.scheduleItems, newItem]};
            return {...p, slides: newSlides};
        });
    };

    const removeScheduleItem = (slideIndex: number, itemIndex: number) => {
        setLocalSettings(p => {
            const newSlides = [...p.slides];
            const slide = newSlides[slideIndex] as any;
            newSlides[slideIndex] = {...slide, scheduleItems: slide.scheduleItems.filter((_: any, i: number) => i !== itemIndex)};
            return {...p, slides: newSlides};
        });
    };

    const handleFinanceInfoChange = (slideIndex: number, field: keyof Omit<FinanceInfo, 'lastUpdated' | 'currentBalance'>, value: string | number) => {
        setLocalSettings(p => {
            const newSlides = [...p.slides];
            const slide = newSlides[slideIndex] as any;
            const newInfo = { ...slide.financeInfo, [field]: Number(value) || 0 };
            newInfo.currentBalance = (newInfo.lastBalance || 0) + (newInfo.income || 0) - (newInfo.expense || 0);
            newSlides[slideIndex] = { ...slide, financeInfo: newInfo };
            return { ...p, slides: newSlides };
        });
    };

    const handleSlideImageTypeChange = (index: number, type: 'url' | 'upload') => {
        const slideId = localSettings.slides[index].id;
        setSlideImageTypes(p => ({...p, [slideId]: type}));
    };

    const handleSlideImageChange = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            const compressedBase64 = await compressImage(file);
            handleSlideChange(index, 'imageUrl', compressedBase64);
        } catch(e) {
            alert('Failed to process image');
        }
    };

    // --- Main Actions ---
    const handleCommand = (type: any, payload?: any) => {
        if (navigator.vibrate) navigator.vibrate(50);
        sendCommand({ type, payload, timestamp: Date.now() });
    };

    const handleSendText = (e: React.FormEvent) => {
        e.preventDefault();
        handleCommand('SEND_TEXT', inputText);
        setInputText('');
    };

    const requestSettings = () => {
        handleCommand('REQUEST_SETTINGS');
    };

    const handleSaveSettings = () => {
        setIsSending(true);
        // Send the entire localSettings object as UPDATE_DATA payload
        // The host app's logic in App.tsx needs to handle bulk updates, which we improved previously.
        handleCommand('UPDATE_DATA', localSettings);
        setTimeout(() => {
            setIsSending(false);
            alert('Pengaturan dikirim ke TV!');
        }, 1000);
    };

    // --- Wake Lock ---
    useEffect(() => {
        const requestWakeLock = async () => {
            if ('wakeLock' in navigator) {
                try {
                    wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
                } catch (err) { console.error(err); }
            }
        };
        requestWakeLock();
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') requestWakeLock();
        });
    }, []);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (connectionStatus === 'connecting') {
            setShowRetry(false);
            timer = setTimeout(() => setShowRetry(true), 5000);
        } else setShowRetry(false);
        return () => clearTimeout(timer);
    }, [connectionStatus]);


    if (connectionStatus !== 'connected') {
        return (
            <div className="h-screen w-full bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                <h2 className="text-xl font-bold mb-2">{connectionStatus === 'connecting' ? 'Menghubungkan...' : 'Terputus'}</h2>
                <p className="text-slate-400 mb-6 text-sm">Pastikan satu jaringan & layar HP tetap nyala.</p>
                {(showRetry || connectionStatus === 'disconnected') && (
                    <button onClick={resetConnection} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-full font-semibold transition-colors shadow-lg animate-fade-in">Coba Lagi</button>
                )}
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-slate-900 text-white flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800/50 backdrop-blur-md">
                <h1 className="text-lg font-bold text-[var(--accent-color)]">Waqti Remote</h1>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_currentColor]"></div>
                    <span className="text-[10px] uppercase tracking-wider">Online</span>
                </div>
            </div>

            <div className="flex-grow p-4 overflow-y-auto pb-20">
                {activeTab === 'playback' && (
                    <div className="grid grid-cols-2 gap-4 h-full content-start">
                        <button onClick={() => handleCommand('PREV_SLIDE')} className="bg-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3 p-6 active:bg-slate-700 active:scale-95 transition-all shadow-lg border border-slate-700 aspect-square"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg><span className="font-semibold text-sm">Slide Mundur</span></button>
                        <button onClick={() => handleCommand('NEXT_SLIDE')} className="bg-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3 p-6 active:bg-slate-700 active:scale-95 transition-all shadow-lg border border-slate-700 aspect-square"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg><span className="font-semibold text-sm">Slide Maju</span></button>
                        <button onClick={() => handleCommand('STOP_ALARM')} className="col-span-2 bg-red-600/90 rounded-2xl flex flex-col items-center justify-center gap-3 p-8 active:bg-red-700 active:scale-95 transition-all shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13.73 21a2 2 0 0 1-3.46 0"/><path d="M18.63 13A17.89 17.89 0 0 1 18 8"/><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"/><path d="M18 8a6 6 0 0 0-9.33-5"/><line x1="1" y1="1" x2="23" y2="23"/></svg><span className="text-xl font-bold">Matikan Alarm</span></button>
                        <button onClick={() => handleCommand('REFRESH')} className="col-span-2 bg-blue-600/90 rounded-2xl flex flex-col items-center justify-center gap-3 p-4 active:bg-blue-700 active:scale-95 transition-all shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg><span className="font-semibold text-sm">Muat Ulang Display</span></button>
                    </div>
                )} 
                
                {activeTab === 'nav' && (
                    <div className="flex flex-col h-full gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => handleCommand('OPEN_SETTINGS')} className="bg-slate-700 p-4 rounded-xl flex items-center justify-center gap-2 active:bg-slate-600"><SettingsIcon /> Buka Menu</button>
                            <button onClick={() => handleCommand('CLOSE_SETTINGS')} className="bg-slate-700 p-4 rounded-xl flex items-center justify-center gap-2 active:bg-slate-600"><CloseIcon /> Tutup Menu</button>
                        </div>
                        <div className="flex-grow flex items-center justify-center py-4">
                            <div className="relative w-64 h-64 bg-slate-800 rounded-full shadow-2xl flex items-center justify-center border border-slate-700">
                                <button onClick={() => handleCommand('NAV_UP')} className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center active:bg-slate-600 shadow-md"><ArrowUp /></button>
                                <button onClick={() => handleCommand('NAV_DOWN')} className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center active:bg-slate-600 shadow-md"><ArrowDown /></button>
                                <button onClick={() => handleCommand('NAV_LEFT')} className="absolute left-2 top-1/2 -translate-y-1/2 w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center active:bg-slate-600 shadow-md"><ArrowLeft /></button>
                                <button onClick={() => handleCommand('NAV_RIGHT')} className="absolute right-2 top-1/2 -translate-y-1/2 w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center active:bg-slate-600 shadow-md"><ArrowRight /></button>
                                <button onClick={() => handleCommand('NAV_ENTER')} className="w-20 h-20 bg-[var(--accent-color)] rounded-full flex items-center justify-center font-bold text-xl shadow-lg active:scale-95 transition-transform">OK</button>
                            </div>
                        </div>
                        <form onSubmit={handleSendText} className="flex gap-2 bg-slate-800 p-2 rounded-xl">
                            <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Ketik navigasi lalu kirim..." className="flex-grow bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[var(--accent-color)]" />
                            <button type="submit" className="bg-[var(--accent-color)] p-3 rounded-lg flex items-center justify-center"><SendIcon /></button>
                        </form>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="flex flex-col h-full bg-slate-800 rounded-xl overflow-hidden shadow-xl border border-slate-700">
                        {/* Settings Toolbar */}
                        <div className="p-3 bg-slate-700/50 flex gap-2 overflow-x-auto no-scrollbar border-b border-slate-600">
                            {TABS.map(tabKey => (
                                <button
                                    key={tabKey}
                                    onClick={() => setSettingsTab(tabKey as TabNameKey)}
                                    className={`px-4 py-2 rounded-md text-sm font-semibold whitespace-nowrap transition-colors ${
                                        settingsTab === tabKey 
                                        ? 'bg-[var(--accent-color)] text-white' 
                                        : 'bg-slate-600/50 text-slate-300 hover:bg-slate-600'
                                    }`}
                                >
                                    {t(`settings.tabs.${tabKey}`)}
                                </button>
                            ))}
                        </div>

                        {/* Settings Content Area */}
                        <div className="flex-grow p-4 overflow-y-auto bg-slate-200 dark:bg-slate-900 text-slate-900 dark:text-white">
                            {settingsTab === 'general' && (
                                <GeneralSettingsTab 
                                    localSettings={localSettings} 
                                    handleInputChange={handleInputChange} 
                                    handleExportData={() => {}} // Not applicable on remote
                                    handleImportData={() => {}} // Not applicable on remote
                                    importFileRef={importFileRef}
                                    onGoToServices={() => {}} // Handled separately
                                />
                            )}
                            {settingsTab === 'calculation' && (
                                <CalculationSettingsTab 
                                    localSettings={localSettings} 
                                    handleInputChange={handleInputChange} 
                                    handleNestedChange={handleNestedChange}
                                    citySearch={citySearch}
                                    setCitySearch={setCitySearch}
                                    handleLocationSearch={() => { /* Simple mock for location search could be added if needed */ }}
                                    isSearching={isSearching}
                                    locationStatus={locationStatus}
                                    locationStatusColor={locationStatusColor}
                                />
                            )}
                            {settingsTab === 'display' && (
                                <DisplaySettingsTab 
                                    localSettings={localSettings} 
                                    setLocalSettings={setLocalSettings} 
                                    handleInputChange={handleInputChange}
                                    handleThemeCheckboxChange={handleThemeCheckboxChange}
                                    handleCustomTextChange={handleCustomTextChange}
                                    addCustomText={addCustomText}
                                    removeCustomText={removeCustomText}
                                    uploadStatus={uploadStatus}
                                    fileInputRef={fileInputRef}
                                    handleFileChange={handleFileChange}
                                    uploadStatusColor={uploadStatusColor}
                                />
                            )}
                            {settingsTab === 'alarm' && (
                                <AlarmSettingsTab 
                                    localSettings={localSettings}
                                    setLocalSettings={setLocalSettings}
                                    handleInputChange={handleInputChange}
                                    handleNestedChange={handleNestedChange}
                                    handleDhikrSelectionChange={handleDhikrSelectionChange}
                                    handleMoveDhikr={handleMoveDhikr}
                                    handleRemoveDhikr={handleRemoveDhikr}
                                    newDhikrArabic={newDhikrArabic}
                                    setNewDhikrArabic={setNewDhikrArabic}
                                    newDhikrLatin={newDhikrLatin}
                                    setNewDhikrLatin={setNewDhikrLatin}
                                    handleAddDhikr={handleAddDhikr}
                                />
                            )}
                            {settingsTab === 'slides' && (
                                <SlideSettingsTab 
                                    localSettings={localSettings}
                                    addSlide={addSlide}
                                    removeSlide={removeSlide}
                                    handleSlideChange={handleSlideChange}
                                    handleScheduleItemChange={handleScheduleItemChange}
                                    addScheduleItem={addScheduleItem}
                                    removeScheduleItem={removeScheduleItem}
                                    handleFinanceInfoChange={handleFinanceInfoChange}
                                    slideImageTypes={slideImageTypes}
                                    handleSlideImageTypeChange={handleSlideImageTypeChange}
                                    slideFileInputRefs={slideFileInputRefs}
                                    // Custom image handling for remote (compression + base64)
                                    // We override the internal handling by passing refs but logic handles 'imageUrl' update manually in slide display
                                />
                            )}
                        </div>

                        {/* Save / Sync Footer */}
                        <div className="p-4 bg-slate-800 border-t border-slate-700 flex gap-4">
                            <button 
                                onClick={requestSettings} 
                                className="px-4 py-3 bg-slate-600 rounded-lg text-white font-bold flex items-center gap-2 hover:bg-slate-500"
                            >
                                <DownloadIcon /> Sync dari TV
                            </button>
                            <button 
                                onClick={handleSaveSettings} 
                                disabled={isSending}
                                className="flex-grow px-4 py-3 bg-[var(--accent-color)] rounded-lg text-white font-bold shadow-lg hover:opacity-90 disabled:opacity-50 flex justify-center items-center gap-2"
                            >
                                {isSending ? 'Mengirim...' : 'Kirim Perubahan ke TV'} <SendIcon />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex border-t border-slate-700 bg-slate-800">
                <button onClick={() => setActiveTab('playback')} className={`flex-1 py-4 flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === 'playback' ? 'text-[var(--accent-color)] bg-slate-700/50' : 'text-slate-400'}`}><PlaybackIcon /><span className="text-xs font-semibold">Playback</span></button>
                <div className="w-px bg-slate-700"></div>
                <button onClick={() => setActiveTab('settings')} className={`flex-1 py-4 flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === 'settings' ? 'text-[var(--accent-color)] bg-slate-700/50' : 'text-slate-400'}`}><SettingsIcon /><span className="text-xs font-semibold">Pengaturan</span></button>
                <div className="w-px bg-slate-700"></div>
                <button onClick={() => setActiveTab('nav')} className={`flex-1 py-4 flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === 'nav' ? 'text-[var(--accent-color)] bg-slate-700/50' : 'text-slate-400'}`}><MenuIcon /><span className="text-xs font-semibold">Navigasi</span></button>
            </div>
        </div>
    );
};
