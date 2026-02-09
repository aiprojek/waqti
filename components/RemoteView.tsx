
import React, { useEffect, useState, useRef } from 'react';
import { useRemote } from '../contexts/RemoteContext';
import { t } from '../i18n';

export const RemoteView: React.FC = () => {
    const { connectionStatus, sendCommand, resetConnection } = useRemote();
    const [showRetry, setShowRetry] = useState(false);
    const wakeLockRef = useRef<any>(null);

    // --- Wake Lock Logic (Keep Screen On) ---
    useEffect(() => {
        const requestWakeLock = async () => {
            if ('wakeLock' in navigator) {
                try {
                    wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
                    console.log('Wake Lock is active');
                    
                    wakeLockRef.current.addEventListener('release', () => {
                        console.log('Wake Lock released');
                    });
                } catch (err: any) {
                    console.error(`${err.name}, ${err.message}`);
                }
            }
        };

        // Request when component mounts
        requestWakeLock();

        // Re-request if visibility changes (user switches tabs and comes back)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                requestWakeLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (wakeLockRef.current) {
                wakeLockRef.current.release();
            }
        };
    }, []);

    // Effect to show retry button if connecting takes too long
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (connectionStatus === 'connecting') {
            setShowRetry(false);
            timer = setTimeout(() => {
                setShowRetry(true);
            }, 5000); // Show retry after 5 seconds
        } else {
            setShowRetry(false);
        }
        return () => clearTimeout(timer);
    }, [connectionStatus]);

    const handleCommand = (type: 'NEXT_SLIDE' | 'PREV_SLIDE' | 'STOP_ALARM' | 'REFRESH') => {
        // Vibrate for feedback
        if (navigator.vibrate) navigator.vibrate(50);
        
        sendCommand({
            type,
            timestamp: Date.now()
        });
    };

    if (connectionStatus !== 'connected') {
        return (
            <div className="h-screen w-full bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                <h2 className="text-xl font-bold mb-2">
                    {connectionStatus === 'connecting' ? 'Menghubungkan ke Layar...' : 'Terputus'}
                </h2>
                <p className="text-slate-400 mb-6 text-sm">
                    Pastikan HP dan TV terhubung ke jaringan internet/WiFi yang sama.
                    <br/><br/>
                    <span className="text-yellow-500 text-xs">Tips: Jika menggunakan Hotspot HP, jangan biarkan layar HP mati.</span>
                </p>
                
                {(showRetry || connectionStatus === 'disconnected') && (
                    <button 
                        onClick={resetConnection}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-full font-semibold transition-colors shadow-lg animate-fade-in"
                    >
                        Coba Hubungkan Lagi
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-slate-900 text-white flex flex-col p-4">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
                <h1 className="text-xl font-bold text-[var(--accent-color)]">Waqti Remote</h1>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_5px_currentColor]"></div>
                    <span className="text-xs uppercase tracking-wider">Terhubung</span>
                </div>
            </div>

            <div className="flex-grow grid grid-cols-2 gap-4">
                <button 
                    onClick={() => handleCommand('PREV_SLIDE')}
                    className="bg-slate-800 rounded-xl flex flex-col items-center justify-center gap-2 active:bg-slate-700 active:scale-95 transition-all shadow-lg border border-slate-700"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    <span className="font-semibold">Slide Sebelumnya</span>
                </button>

                <button 
                    onClick={() => handleCommand('NEXT_SLIDE')}
                    className="bg-slate-800 rounded-xl flex flex-col items-center justify-center gap-2 active:bg-slate-700 active:scale-95 transition-all shadow-lg border border-slate-700"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    <span className="font-semibold">Slide Berikutnya</span>
                </button>

                <button 
                    onClick={() => handleCommand('STOP_ALARM')}
                    className="col-span-2 bg-red-600/90 rounded-xl flex flex-col items-center justify-center gap-2 active:bg-red-700 active:scale-95 transition-all shadow-lg py-12"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13.73 21a2 2 0 0 1-3.46 0"/><path d="M18.63 13A17.89 17.89 0 0 1 18 8"/><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"/><path d="M18 8a6 6 0 0 0-9.33-5"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    <span className="text-xl font-bold">Matikan Alarm</span>
                </button>

                <button 
                    onClick={() => handleCommand('REFRESH')}
                    className="col-span-2 bg-blue-600/90 rounded-xl flex flex-col items-center justify-center gap-2 active:bg-blue-700 active:scale-95 transition-all shadow-lg py-4 mt-auto"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                    <span className="font-semibold">Muat Ulang Display</span>
                </button>
            </div>
            
            <p className="text-center text-slate-500 text-xs mt-6">
                Waqti Remote Control &bull; Powered by PeerJS
            </p>
        </div>
    );
};
