
import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import type { Settings } from '../../types';
import { CollapsibleSection, Input } from './Shared';
import { t } from '../../i18n';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { useRemote } from '../../contexts/RemoteContext';
import { Capacitor } from '@capacitor/core';
import { BluetoothRemote } from '../../lib/bluetoothRemote';
import { db } from '../../lib/db';

// Optional media assets for offline use (download on demand)
const CRITICAL_ASSETS = [
    // Libraries
    // Default Sound
    'https://cdn.pixabay.com/download/audio/2022/03/15/audio_32283e5329.mp3?filename=alarm-clock-90867.mp3',
    // Default Images
    'https://cdn.pixabay.com/photo/2018/04/24/17/57/masjid-nabawi-3347602_960_720.jpg',
    'https://cdn.pixabay.com/photo/2019/10/04/09/20/mosque-4525144_960_720.jpg',
    'https://cdn.pixabay.com/photo/2019/11/27/21/06/jerusalem-4657867_960_720.jpg',
    'https://images.pexels.com/photos/2291789/pexels-photo-2291789.jpeg',
    'https://cdn.pixabay.com/photo/2013/05/08/14/07/mecca-109852_960_720.jpg',
    'https://images.pexels.com/photos/15463931/pexels-photo-15463931.jpeg',
    'https://images.pexels.com/photos/35236668/pexels-photo-35236668.jpeg'
];

interface GeneralSettingsTabProps {
    localSettings: Settings;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    handleExportData: () => void;
    handleImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
    importFileRef: React.RefObject<HTMLInputElement>;
    onGoToServices: () => void;
    isRemote?: boolean;
}

export const GeneralSettingsTab: React.FC<GeneralSettingsTabProps> = ({
    localSettings,
    handleInputChange,
    handleExportData,
    handleImportData,
    importFileRef,
    onGoToServices,
    isRemote = false
}) => {
    const [assetsStatus, setAssetsStatus] = useState<'checking' | 'ready' | 'missing'>('checking');
    const [downloadProgress, setDownloadProgress] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    
    // Remote Control Hooks
    const { peerId, connectionStatus, isHost, pairingToken } = useRemote();
    const qrCodeRef = useRef<HTMLDivElement>(null);
    const [isScanning, setIsScanning] = useState(false);
    const scannerRef = useRef<any>(null);
    const [manualRemoteId, setManualRemoteId] = useState('');
    const html5QrCtorRef = useRef<any>(null);
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
    const isAndroid = Capacitor.getPlatform() === 'android';
    const isNative = Capacitor.isNativePlatform?.() || !!(window as any).__TAURI__;
    const [bluetoothHostStatus, setBluetoothHostStatus] = useState<'unknown' | 'on' | 'off' | 'unsupported' | 'error'>('unknown');
    const [bluetoothHostDetail, setBluetoothHostDetail] = useState('');

    useEffect(() => {
        if (!isAndroid) return;
        let isMounted = true;
        let pollId: ReturnType<typeof setInterval> | null = null;

        const refreshStatus = async () => {
            try {
                const supported = await BluetoothRemote.isSupported();
                if (!supported.supported) {
                    if (isMounted) setBluetoothHostStatus('unsupported');
                    return;
                }
                const status = await BluetoothRemote.getStatus();
                if (isMounted) {
                    setBluetoothHostStatus(status.started ? 'on' : 'off');
                    setBluetoothHostDetail('');
                }
            } catch (e) {
                if (isMounted) {
                    setBluetoothHostStatus('error');
                    setBluetoothHostDetail(t('settings.general.remote.bluetoothError'));
                }
            }
        };

        refreshStatus();
        pollId = setInterval(refreshStatus, 5000);

        return () => {
            isMounted = false;
            if (pollId) clearInterval(pollId);
        };
    }, [isAndroid, localSettings.enableBluetoothRemote]);

    useEffect(() => {
        const renderQr = async () => {
            if (!isRemote && peerId && isHost && !isScanning) {
                const tokenParam = pairingToken ? `&token=${encodeURIComponent(pairingToken)}` : '';
                const remoteUrl = `${window.location.origin}${window.location.pathname}?remote=${peerId}${tokenParam}`;
                try {
                    const dataUrl = await QRCode.toDataURL(remoteUrl, {
                        width: 128,
                        margin: 1,
                        color: {
                            dark: '#000000',
                            light: '#FFFFFF'
                        }
                    });
                    setQrCodeDataUrl(dataUrl);
                } catch (e) {
                    console.error('Failed to generate QR code', e);
                    setQrCodeDataUrl('');
                }
            } else {
                setQrCodeDataUrl('');
            }
        };
        renderQr();
    }, [peerId, isHost, isRemote, isScanning, pairingToken]);

    // Handle Scanner Logic
    const startScanner = async () => {
        setIsScanning(true);
        // Add a small delay to ensure the DOM element #qr-reader is rendered
        setTimeout(async () => {
            try {
                if (!html5QrCtorRef.current) {
                    const mod: any = await import('html5-qrcode');
                    html5QrCtorRef.current = mod?.Html5Qrcode || mod?.default || mod;
                }
                const Html5QrcodeCtor = html5QrCtorRef.current;
                if (!Html5QrcodeCtor) throw new Error('Html5Qrcode not available');

                const html5QrCode = new Html5QrcodeCtor("qr-reader");
                scannerRef.current = html5QrCode;
                
                const config = { fps: 10, qrbox: { width: 250, height: 250 } };
                
                html5QrCode.start({ facingMode: "environment" }, config, (decodedText: string) => {
                    try {
                        const url = new URL(decodedText);
                        const sameOrigin = url.origin === window.location.origin;
                        const hasRemote = url.searchParams.get('remote');
                        if (sameOrigin && hasRemote) {
                        html5QrCode.stop().then(() => {
                            scannerRef.current = null;
                            setIsScanning(false);
                            window.location.href = url.toString();
                        });
                        }
                    } catch (e) {
                        // Ignore invalid QR content
                    }
                }, (_errorMessage: string) => {
                    // scanning...
                }).catch((err: any) => {
                    console.error("Error starting scanner", err);
                    setIsScanning(false);
                    alert("Could not start camera. Please ensure camera permissions are granted.");
                });
            } catch (err) {
                console.error("Error preparing scanner", err);
                setIsScanning(false);
                alert("QR scanner is not available.");
            }
        }, 100);
    };

    const stopScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.stop().then(() => {
                scannerRef.current = null;
                setIsScanning(false);
            }).catch((err: any) => {
                console.error("Failed to stop scanner", err);
                setIsScanning(false);
            });
        } else {
            setIsScanning(false);
        }
    };

    const handleManualConnect = () => {
        if (manualRemoteId.trim()) {
            const tokenParam = pairingToken ? `&token=${encodeURIComponent(pairingToken)}` : '';
            window.location.href = `?remote=${manualRemoteId.trim()}${tokenParam}`;
        }
    };

    const checkOfflineReadiness = async () => {
        if (!('caches' in window)) return;
        
        try {
            const cacheName = 'waqti-cache-v3';
            const cache = await caches.open(cacheName);
            let foundCount = 0;

            for (const url of CRITICAL_ASSETS) {
                const match = await cache.match(url);
                if (match) foundCount += 1;
            }

            const allFound = foundCount === CRITICAL_ASSETS.length;
            setAssetsStatus(allFound ? 'ready' : 'missing');
            setStatusMessage(t('settings.status.assetsProgress', { cached: foundCount, total: CRITICAL_ASSETS.length }));
        } catch (e) {
            console.error('Error checking cache:', e);
            setAssetsStatus('missing');
            setStatusMessage(t('settings.status.assetsCheckError'));
        }
    };

    const checkAppShellReady = async (): Promise<boolean> => {
        if (!('caches' in window)) return false;
        try {
            const cacheName = 'waqti-cache-v3';
            const cache = await caches.open(cacheName);
            // Check for both root and index.html to be robust
            const matchRoot = await cache.match('/');
            const matchIndex = await cache.match('/index.html');
            return !!(matchRoot || matchIndex);
        } catch (e) {
            return false;
        }
    };

    const checkPrayerTimesReady = async (): Promise<boolean> => {
        try {
            const anyCache = await db.prayerTimesCache.toCollection().first();
            return !!anyCache;
        } catch (e) {
            return false;
        }
    };

    const [shellReady, setShellReady] = useState<'unknown' | 'ready' | 'missing'>('unknown');
    const [prayerReady, setPrayerReady] = useState<'unknown' | 'ready' | 'missing'>('unknown');

    useEffect(() => {
        if (!isRemote) {
            checkOfflineReadiness();
            checkAppShellReady().then(ok => setShellReady(ok ? 'ready' : 'missing'));
            checkPrayerTimesReady().then(ok => setPrayerReady(ok ? 'ready' : 'missing'));
        }
    }, [isRemote]);

    const handleDownloadAssets = async () => {
        setDownloadProgress(true);
        setStatusMessage(t('settings.general.offlineAssets.downloading'));
        
        if (!('caches' in window)) {
            setStatusMessage(t('settings.status.browserNoSupport'));
            setDownloadProgress(false);
            return;
        }

        try {
            const cacheName = 'waqti-cache-v3';
            const cache = await caches.open(cacheName);
            
            await Promise.all(CRITICAL_ASSETS.map(async (url) => {
                try {
                    const response = await fetch(url, { mode: 'cors' });
                    if (response.ok) {
                        await cache.put(url, response);
                    } else {
                        throw new Error(`Failed to fetch ${url}`);
                    }
                } catch (e) {
                    try {
                        const response = await fetch(url, { mode: 'no-cors' });
                        await cache.put(url, response);
                    } catch (err2) {
                        console.error(`Failed to cache ${url}`, err2);
                    }
                }
            }));

            await checkOfflineReadiness();
            setStatusMessage(t('settings.general.offlineAssets.success'));
        } catch (e) {
            console.error(e);
            setStatusMessage(t('main.error'));
        } finally {
            setDownloadProgress(false);
        }
    };

    return (
        <>
            <CollapsibleSection title={t('settings.general.title')} defaultOpen={true}>
                <div className="grid grid-cols-1 gap-4">
                    <Input label={t('settings.general.mosqueName')} name="mosqueName" value={localSettings.mosqueName} onChange={handleInputChange} />
                    <div>
                        <label className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-300 block text-left">{t('settings.general.language')}</label>
                        <LanguageSwitcher />
                    </div>
                </div>
            </CollapsibleSection>
            
            {!isRemote && (
                <>
                    <CollapsibleSection title={t('settings.general.remote.title')}>
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="flex-shrink-0 bg-white p-2 rounded-lg mx-auto md:mx-0 w-[144px] h-[144px] flex items-center justify-center overflow-hidden relative">
                                {isScanning ? (
                                    <div id="qr-reader" className="w-full h-full"></div>
                                ) : (
                                    <div ref={qrCodeRef} className="w-[128px] h-[128px] bg-gray-200 flex items-center justify-center">
                                        {qrCodeDataUrl ? (
                                            <img src={qrCodeDataUrl} alt="QR Code" className="w-full h-full object-contain" />
                                        ) : null}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-4 text-center md:text-left flex-grow w-full">
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                                        {t('settings.general.remote.description')}
                                    </p>
                                    {!peerId && (
                                        <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">
                                            {t('settings.general.remote.unavailable')}
                                        </p>
                                    )}
                                    {!isScanning && (
                                        <div className="bg-slate-200 dark:bg-slate-700 p-3 rounded-lg inline-block">
                                            <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{t('settings.general.remote.pairingCode')}</p>
                                            <p className="text-2xl font-mono font-bold tracking-widest text-[var(--accent-color)]">{peerId || '...'}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                                    {isAndroid && (
                                        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                            <input
                                                type="checkbox"
                                                name="enableBluetoothRemote"
                                                checked={localSettings.enableBluetoothRemote}
                                                onChange={handleInputChange}
                                                className="w-4 h-4"
                                            />
                                            {t('settings.general.remote.bluetoothEnable')}
                                        </label>
                                    )}
                                    {isAndroid && (
                                        <div className="mt-2 text-xs">
                                            <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full ${
                                                bluetoothHostStatus === 'on'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                    : bluetoothHostStatus === 'off'
                                                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                                        : bluetoothHostStatus === 'unsupported'
                                                            ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                                            : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                            }`}>
                                                <span className="w-2 h-2 rounded-full bg-current"></span>
                                                {bluetoothHostStatus === 'on' && t('settings.general.remote.bluetoothHostOn')}
                                                {bluetoothHostStatus === 'off' && t('settings.general.remote.bluetoothHostOff')}
                                                {bluetoothHostStatus === 'unsupported' && t('settings.general.remote.bluetoothHostUnsupported')}
                                                {bluetoothHostStatus === 'error' && (bluetoothHostDetail || t('settings.general.remote.bluetoothHostError'))}
                                                {bluetoothHostStatus === 'unknown' && t('settings.general.remote.bluetoothHostUnknown')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex flex-col md:flex-row items-center gap-3 justify-center md:justify-start">
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${connectionStatus === 'connected' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'}`}>
                                        <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                        <span className="text-sm font-medium">
                                            {connectionStatus === 'connected' ? t('settings.general.remote.statusConnected') : t('settings.general.remote.statusWaiting')}
                                        </span>
                                    </div>
                                    
                                    <div className="h-px w-full md:w-px md:h-8 bg-slate-300 dark:bg-slate-600 hidden md:block"></div>

                                    {isScanning ? (
                                        <button 
                                            onClick={stopScanner}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-semibold whitespace-nowrap"
                                        >
                                            Stop Scan
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={startScanner}
                                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-semibold whitespace-nowrap"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><rect x="7" y="7" width="10" height="10" rx="1"/></svg>
                                            {t('settings.general.remote.scanButton')}
                                        </button>
                                    )}
                                </div>

                                {/* Manual Input Section */}
                                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 mt-2">
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase">{t('settings.general.remote.manualInputLabel')}</p>
                                    <div className="flex gap-2 max-w-sm mx-auto md:mx-0">
                                        <input 
                                            type="text" 
                                            value={manualRemoteId}
                                            onChange={(e) => setManualRemoteId(e.target.value)}
                                            placeholder={t('settings.general.remote.manualInputPlaceholder')}
                                            className="flex-grow bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] uppercase font-mono"
                                        />
                                        <button 
                                            onClick={handleManualConnect}
                                            disabled={!manualRemoteId}
                                            className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors text-sm font-semibold disabled:opacity-50"
                                        >
                                            {t('settings.general.remote.connectButton')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection title={t('settings.general.offlineAssets.title')}>
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                {isNative ? t('settings.general.offlineAssets.descriptionNative') : t('settings.general.offlineAssets.description')}
                            </p>
                            {isNative && (
                                <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                                    {t('settings.general.offlineAssets.nativeBadge')}
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                            <div className={`p-3 rounded-lg border ${shellReady === 'ready' ? 'border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-300' : 'border-slate-300 dark:border-slate-700 text-slate-500'}`}>
                                <p className="text-xs uppercase tracking-wide mb-1">{t('settings.general.offlineAssets.shellTitle')}</p>
                                <p className="text-sm font-semibold" title={t('settings.general.offlineAssets.shellTooltip')}>
                                    {shellReady === 'ready' ? t('settings.general.offlineAssets.shellReady') : t('settings.general.offlineAssets.shellMissing')}
                                </p>
                            </div>
                            <div className={`p-3 rounded-lg border ${assetsStatus === 'ready' ? 'border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-300' : 'border-slate-300 dark:border-slate-700 text-slate-500'}`}>
                                <p className="text-xs uppercase tracking-wide mb-1">{t('settings.general.offlineAssets.mediaTitle')}</p>
                                <p className="text-sm font-semibold" title={t('settings.general.offlineAssets.mediaTooltip')}>
                                    {assetsStatus === 'ready' ? t('settings.general.offlineAssets.mediaReady') : t('settings.general.offlineAssets.mediaMissing')}
                                </p>
                            </div>
                            <div className={`p-3 rounded-lg border ${prayerReady === 'ready' ? 'border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-300' : 'border-slate-300 dark:border-slate-700 text-slate-500'}`}>
                                <p className="text-xs uppercase tracking-wide mb-1">{t('settings.general.offlineAssets.prayerTitle')}</p>
                                <p className="text-sm font-semibold" title={t('settings.general.offlineAssets.prayerTooltip')}>
                                    {prayerReady === 'ready' ? t('settings.general.offlineAssets.prayerReady') : t('settings.general.offlineAssets.prayerMissing')}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${assetsStatus === 'ready' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
                                <div className={`w-2 h-2 rounded-full ${assetsStatus === 'ready' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-sm font-medium">
                                    {assetsStatus === 'ready' ? t('settings.general.offlineAssets.ready') : t('settings.status.assetsMissing')}
                                </span>
                            </div>

                            <button 
                                onClick={handleDownloadAssets}
                                disabled={downloadProgress}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
                            >
                                {downloadProgress ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        {t('settings.general.offlineAssets.downloading')}
                                    </>
                                ) : (
                                    isNative ? t('settings.general.offlineAssets.downloadNative') : t('settings.general.offlineAssets.download')
                                )}
                            </button>
                        </div>
                        {statusMessage && <p className="text-xs text-slate-500 mt-2">{statusMessage}</p>}
                    </CollapsibleSection>

                    <CollapsibleSection title={t('settings.general.dataManagement.title')}>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{t('settings.general.dataManagement.description')}</p>
                        <div className="flex gap-4">
                            <button onClick={handleExportData} className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-sm font-semibold">
                                {t('settings.general.dataManagement.export')}
                            </button>
                            <div className="relative">
                                <input 
                                    type="file" 
                                    ref={importFileRef}
                                    onChange={handleImportData}
                                    accept=".json"
                                    className="hidden"
                                />
                                <button onClick={() => importFileRef.current?.click()} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-semibold">
                                    {t('settings.general.dataManagement.import')}
                                </button>
                            </div>
                        </div>
                    </CollapsibleSection>
                </>
            )}
            
            {/* Promo Hook Banner */}
            {!isRemote && (
                <div className="mt-4 p-6 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 rounded-lg border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                        <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-1">{t('settings.general.promo.title')}</h3>
                        <p className="text-sm text-amber-800 dark:text-amber-200/80">{t('settings.general.promo.description')}</p>
                    </div>
                    <button 
                        onClick={onGoToServices}
                        className="px-5 py-2.5 bg-amber-600 text-white rounded-full font-bold shadow-lg hover:bg-amber-700 hover:shadow-xl transition-all whitespace-nowrap text-sm"
                    >
                        {t('settings.general.promo.button')}
                    </button>
                </div>
            )}
        </>
    );
};
