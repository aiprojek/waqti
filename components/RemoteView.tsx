
import React, { useEffect, useState, useRef } from 'react';
import { useRemote } from '../contexts/RemoteContext';
import { PRAYER_NAMES, IQAMAH_PRAYERS } from '../constants';
import { t } from '../i18n';

// Simple Icons
const PlaybackIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>);
const MenuIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>);
const SettingsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>);
const InputIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>);
const ArrowUp = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>);
const ArrowDown = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>);
const ArrowLeft = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>);
const ArrowRight = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>);
const CloseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
const SendIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>);
const DownloadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>);
const ChevronDown = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>);

export const RemoteView: React.FC = () => {
    const { connectionStatus, sendCommand, resetConnection, lastCommand } = useRemote();
    const [showRetry, setShowRetry] = useState(false);
    const wakeLockRef = useRef<any>(null);
    const [activeTab, setActiveTab] = useState<'playback' | 'nav' | 'input'>('playback');
    const [inputText, setInputText] = useState('');

    // --- Expanded Settings State ---
    const [settingsState, setSettingsState] = useState({
        mosqueName: '',
        city: '',
        runningText: '',
        theme: 'dark', // 'dark' | 'light'
        displayMode: 'landscape', // 'landscape' | 'portrait'
        calculationMethod: 17,
        madhab: 0,
        manualFridayTime: '12:00',
        khutbahMessageTitle: '',
        adjustments: { Fajr: 0, Sunrise: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 } as Record<string, number>,
        iqamahOffsets: { Fajr: 10, Dhuhr: 10, Asr: 10, Maghrib: 10, Isha: 10 } as Record<string, number>,
        wallpaper: ''
    });
    
    // Collapse States
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        info: true,
        display: false,
        schedule: false,
        friday: false
    });

    const toggleSection = (key: string) => {
        setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const [isSending, setIsSending] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Listen for Data from TV ---
    useEffect(() => {
        if (lastCommand && lastCommand.type === 'SETTINGS_SNAPSHOT' && lastCommand.payload) {
            const data = lastCommand.payload;
            setSettingsState(prev => ({
                ...prev,
                mosqueName: data.mosqueName || '',
                city: data.city || '',
                runningText: data.runningText || '',
                theme: data.theme || 'dark',
                displayMode: data.displayMode || 'landscape',
                calculationMethod: data.calculationMethod || 17,
                madhab: data.madhab || 0,
                adjustments: data.adjustments || prev.adjustments,
                iqamahOffsets: data.iqamahOffsets || prev.iqamahOffsets,
                manualFridayTime: data.manualFridayTime || '12:00',
                khutbahMessageTitle: data.khutbahMessageTitle || ''
            }));
            alert('Data berhasil dimuat dari TV!');
        }
    }, [lastCommand]);

    // --- Wake Lock ---
    useEffect(() => {
        const requestWakeLock = async () => {
            if ('wakeLock' in navigator) {
                try {
                    wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
                    wakeLockRef.current.addEventListener('release', () => {});
                } catch (err: any) {
                    console.error(`${err.name}, ${err.message}`);
                }
            }
        };
        requestWakeLock();
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') requestWakeLock();
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (wakeLockRef.current) wakeLockRef.current.release();
        };
    }, []);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (connectionStatus === 'connecting') {
            setShowRetry(false);
            timer = setTimeout(() => setShowRetry(true), 5000);
        } else {
            setShowRetry(false);
        }
        return () => clearTimeout(timer);
    }, [connectionStatus]);

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

    // Helper to resize image
    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800; // Cukup untuk wallpaper TV jika dilihat dari jauh
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

    const handleFormSubmit = async () => {
        setIsSending(true);
        const payload: any = {
            mosqueName: settingsState.mosqueName,
            city: settingsState.city,
            runningText: settingsState.runningText,
            theme: settingsState.theme,
            displayMode: settingsState.displayMode,
            calculationMethod: settingsState.calculationMethod,
            madhab: settingsState.madhab,
            adjustments: settingsState.adjustments,
            iqamahOffsets: settingsState.iqamahOffsets,
            manualFridayTime: settingsState.manualFridayTime,
            khutbahMessageTitle: settingsState.khutbahMessageTitle
        };

        // Handle Image
        const file = fileInputRef.current?.files?.[0];
        if (file) {
            try {
                const compressedBase64 = await compressImage(file);
                payload.wallpaper = compressedBase64;
            } catch (e) {
                console.error("Gagal kompres gambar", e);
                alert("Gagal memproses gambar");
            }
        }

        handleCommand('UPDATE_DATA', payload);
        alert('Data dikirim ke TV!');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setIsSending(false);
    };

    const handleChange = (field: string, value: any) => {
        setSettingsState(prev => ({ ...prev, [field]: value }));
    };

    const handleNestedChange = (category: 'adjustments' | 'iqamahOffsets', key: string, value: any) => {
        setSettingsState(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: Number(value)
            }
        }));
    };

    if (connectionStatus !== 'connected') {
        return (
            <div className="h-screen w-full bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                <h2 className="text-xl font-bold mb-2">
                    {connectionStatus === 'connecting' ? 'Menghubungkan...' : 'Terputus'}
                </h2>
                <p className="text-slate-400 mb-6 text-sm">Pastikan satu jaringan & layar HP tetap nyala.</p>
                {(showRetry || connectionStatus === 'disconnected') && (
                    <button onClick={resetConnection} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-full font-semibold transition-colors shadow-lg animate-fade-in">
                        Coba Lagi
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-slate-900 text-white flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800/50 backdrop-blur-md">
                <h1 className="text-lg font-bold text-[var(--accent-color)]">Waqti Remote</h1>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_currentColor]"></div>
                    <span className="text-[10px] uppercase tracking-wider">Online</span>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-grow p-4 overflow-y-auto pb-20">
                {activeTab === 'playback' && (
                    <div className="grid grid-cols-2 gap-4 h-full content-start">
                        <button onClick={() => handleCommand('PREV_SLIDE')} className="bg-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3 p-6 active:bg-slate-700 active:scale-95 transition-all shadow-lg border border-slate-700 aspect-square">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                            <span className="font-semibold text-sm">Slide Mundur</span>
                        </button>

                        <button onClick={() => handleCommand('NEXT_SLIDE')} className="bg-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3 p-6 active:bg-slate-700 active:scale-95 transition-all shadow-lg border border-slate-700 aspect-square">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            <span className="font-semibold text-sm">Slide Maju</span>
                        </button>

                        <button onClick={() => handleCommand('STOP_ALARM')} className="col-span-2 bg-red-600/90 rounded-2xl flex flex-col items-center justify-center gap-3 p-8 active:bg-red-700 active:scale-95 transition-all shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13.73 21a2 2 0 0 1-3.46 0"/><path d="M18.63 13A17.89 17.89 0 0 1 18 8"/><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"/><path d="M18 8a6 6 0 0 0-9.33-5"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                            <span className="text-xl font-bold">Matikan Alarm</span>
                        </button>

                        <button onClick={() => handleCommand('REFRESH')} className="col-span-2 bg-blue-600/90 rounded-2xl flex flex-col items-center justify-center gap-3 p-4 active:bg-blue-700 active:scale-95 transition-all shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                            <span className="font-semibold text-sm">Muat Ulang Display</span>
                        </button>
                    </div>
                )} 
                
                {activeTab === 'nav' && (
                    <div className="flex flex-col h-full gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => handleCommand('OPEN_SETTINGS')} className="bg-slate-700 p-4 rounded-xl flex items-center justify-center gap-2 active:bg-slate-600">
                                <SettingsIcon /> Buka Menu
                            </button>
                            <button onClick={() => handleCommand('CLOSE_SETTINGS')} className="bg-slate-700 p-4 rounded-xl flex items-center justify-center gap-2 active:bg-slate-600">
                                <CloseIcon /> Tutup Menu
                            </button>
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

                {activeTab === 'input' && (
                    <div className="flex flex-col gap-4 h-full">
                        <div className="bg-slate-800 p-4 rounded-lg flex justify-between items-center shadow-md">
                            <div>
                                <h3 className="font-bold text-lg">Pengaturan</h3>
                                <p className="text-xs text-slate-400">Edit data dan kirim ke TV.</p>
                            </div>
                            <button onClick={requestSettings} className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 active:bg-indigo-700 hover:bg-indigo-500 transition-colors">
                                <DownloadIcon /> Load
                            </button>
                        </div>

                        {/* Section 1: Info Umum */}
                        <div className="bg-slate-800 rounded-lg border border-slate-700 shadow-sm">
                            <button type="button" onClick={() => toggleSection('info')} className="w-full p-4 flex justify-between items-center bg-slate-700/50 font-semibold rounded-t-lg active:bg-slate-700 transition-colors">
                                <span>Info Masjid & Umum</span>
                                <span className={`transform transition-transform duration-200 ${openSections.info ? 'rotate-180' : ''}`}><ChevronDown /></span>
                            </button>
                            {openSections.info && (
                                <div className="p-4 space-y-4 border-t border-slate-700">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Nama Masjid</label>
                                        <input type="text" value={settingsState.mosqueName} onChange={(e) => handleChange('mosqueName', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white mt-1 focus:border-[var(--accent-color)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Kota (Auto-Update Jadwal)</label>
                                        <input type="text" value={settingsState.city} onChange={(e) => handleChange('city', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white mt-1 focus:border-[var(--accent-color)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Teks Berjalan</label>
                                        <textarea value={settingsState.runningText} onChange={(e) => handleChange('runningText', e.target.value)} rows={3} className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white mt-1 focus:border-[var(--accent-color)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Section 2: Tampilan */}
                        <div className="bg-slate-800 rounded-lg border border-slate-700 shadow-sm">
                            <button type="button" onClick={() => toggleSection('display')} className="w-full p-4 flex justify-between items-center bg-slate-700/50 font-semibold rounded-t-lg active:bg-slate-700 transition-colors">
                                <span>Tampilan</span>
                                <span className={`transform transition-transform duration-200 ${openSections.display ? 'rotate-180' : ''}`}><ChevronDown /></span>
                            </button>
                            {openSections.display && (
                                <div className="p-4 space-y-4 border-t border-slate-700">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Tema</label>
                                            <select value={settingsState.theme} onChange={(e) => handleChange('theme', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white mt-1 focus:border-[var(--accent-color)] focus:outline-none">
                                                <option value="dark">Gelap</option>
                                                <option value="light">Terang</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Mode Layar</label>
                                            <select value={settingsState.displayMode} onChange={(e) => handleChange('displayMode', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white mt-1 focus:border-[var(--accent-color)] focus:outline-none">
                                                <option value="landscape">Landscape</option>
                                                <option value="portrait">Portrait</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Ganti Wallpaper</label>
                                        <input type="file" accept="image/*" ref={fileInputRef} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--accent-color)] file:text-white" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Section 3: Jadwal & Koreksi */}
                        <div className="bg-slate-800 rounded-lg border border-slate-700 shadow-sm">
                            <button type="button" onClick={() => toggleSection('schedule')} className="w-full p-4 flex justify-between items-center bg-slate-700/50 font-semibold rounded-t-lg active:bg-slate-700 transition-colors">
                                <span>Jadwal & Koreksi</span>
                                <span className={`transform transition-transform duration-200 ${openSections.schedule ? 'rotate-180' : ''}`}><ChevronDown /></span>
                            </button>
                            {openSections.schedule && (
                                <div className="p-4 space-y-4 border-t border-slate-700">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Metode</label>
                                            <select value={settingsState.calculationMethod} onChange={(e) => handleChange('calculationMethod', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white mt-1 text-sm focus:border-[var(--accent-color)] focus:outline-none">
                                                <option value="17">Kemenag RI</option>
                                                <option value="3">Muslim World League</option>
                                                <option value="5">Egyptian</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Mazhab (Ashar)</label>
                                            <select value={settingsState.madhab} onChange={(e) => handleChange('madhab', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white mt-1 text-sm focus:border-[var(--accent-color)] focus:outline-none">
                                                <option value="0">Syafi'i (Standar)</option>
                                                <option value="1">Hanafi</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Koreksi Waktu (Menit)</p>
                                        <div className="grid grid-cols-3 gap-3">
                                            {PRAYER_NAMES.map(name => (
                                                <div key={`adj-${name}`}>
                                                    <label className="text-[10px] text-slate-500 uppercase block mb-1">{name}</label>
                                                    <input type="number" value={settingsState.adjustments[name]} onChange={(e) => handleNestedChange('adjustments', name, e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-center text-white focus:border-[var(--accent-color)] focus:outline-none" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Jeda Iqamah (Menit)</p>
                                        <div className="grid grid-cols-3 gap-3">
                                            {IQAMAH_PRAYERS.map(name => (
                                                <div key={`iqm-${name}`}>
                                                    <label className="text-[10px] text-slate-500 uppercase block mb-1">{name}</label>
                                                    <input type="number" value={settingsState.iqamahOffsets[name]} onChange={(e) => handleNestedChange('iqamahOffsets', name, e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-center text-white focus:border-[var(--accent-color)] focus:outline-none" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Section 4: Jumat */}
                        <div className="bg-slate-800 rounded-lg border border-slate-700 shadow-sm">
                            <button type="button" onClick={() => toggleSection('friday')} className="w-full p-4 flex justify-between items-center bg-slate-700/50 font-semibold rounded-t-lg active:bg-slate-700 transition-colors">
                                <span>Info Jum'at</span>
                                <span className={`transform transition-transform duration-200 ${openSections.friday ? 'rotate-180' : ''}`}><ChevronDown /></span>
                            </button>
                            {openSections.friday && (
                                <div className="p-4 space-y-4 border-t border-slate-700">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Judul Pesan Khutbah</label>
                                        <input type="text" value={settingsState.khutbahMessageTitle} onChange={(e) => handleChange('khutbahMessageTitle', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white mt-1 focus:border-[var(--accent-color)] focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Waktu Manual (Jika Perlu)</label>
                                        <input type="time" value={settingsState.manualFridayTime} onChange={(e) => handleChange('manualFridayTime', e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white mt-1 focus:border-[var(--accent-color)] focus:outline-none" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={handleFormSubmit}
                            disabled={isSending}
                            className="w-full py-4 bg-[var(--accent-color)] rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all flex justify-center items-center gap-2 mb-8"
                        >
                            {isSending ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Mengirim...
                                </>
                            ) : (
                                <>
                                    <SendIcon /> Simpan Perubahan
                                </>
                            )}
                        </button>
                        
                        <p className="text-xs text-center text-slate-500 pb-4">
                            Catatan: Pengaturan Slide & Keuangan sebaiknya diatur lewat PC/TV langsung.
                        </p>
                    </div>
                )}
            </div>

            {/* Bottom Navigation */}
            <div className="flex border-t border-slate-700 bg-slate-800">
                <button onClick={() => setActiveTab('playback')} className={`flex-1 py-4 flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === 'playback' ? 'text-[var(--accent-color)] bg-slate-700/50' : 'text-slate-400'}`}>
                    <PlaybackIcon /><span className="text-xs font-semibold">Playback</span>
                </button>
                <div className="w-px bg-slate-700"></div>
                <button onClick={() => setActiveTab('input')} className={`flex-1 py-4 flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === 'input' ? 'text-[var(--accent-color)] bg-slate-700/50' : 'text-slate-400'}`}>
                    <SettingsIcon /><span className="text-xs font-semibold">Pengaturan</span>
                </button>
                <div className="w-px bg-slate-700"></div>
                <button onClick={() => setActiveTab('nav')} className={`flex-1 py-4 flex flex-col items-center justify-center gap-1 transition-colors ${activeTab === 'nav' ? 'text-[var(--accent-color)] bg-slate-700/50' : 'text-slate-400'}`}>
                    <MenuIcon /><span className="text-xs font-semibold">Navigasi</span>
                </button>
            </div>
        </div>
    );
};
