import React, { useState, useEffect, useRef, memo, useMemo, useCallback } from 'react';
import DOMPurify from 'dompurify';
import { useSettings } from '../contexts/SettingsContext';
import { QURAN_THEMES_CONTENT, HADITH_THEMES_CONTENT } from '../constants';
import { t } from '../i18n';

const FooterComponent: React.FC = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const { settings } = useSettings();

    const [contentList, setContentList] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);
    const textMeasureRef = useRef<HTMLSpanElement>(null);
    const [textWidth, setTextWidth] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);

    // --- Network Status Logic (Improved with Active Ping) ---
    useEffect(() => {
        const checkConnectivity = async () => {
            // 1. Cek status dasar browser. Jika browser bilang offline, pasti offline.
            if (!navigator.onLine) {
                setIsOnline(false);
                return;
            }

            // 2. Jika browser bilang online, verifikasi dengan ping ke internet (Google)
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);
                // Fetch ke resource kecil dan publik dengan no-cors (opaque response)
                // Cache: no-store agar tidak mengambil dari cache dan tidak disajikan SW
                // Random time query param untuk menghindari caching
                await fetch(`https://clients3.google.com/generate_204?ts=${Date.now()}`, {
                    mode: 'no-cors',
                    cache: 'no-store',
                    method: 'GET',
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                setIsOnline(true);
            } catch (error) {
                // Jika fetch gagal (network error), berarti tidak ada internet
                setIsOnline(false);
            }
        };

        // Cek saat komponen dimuat
        checkConnectivity();

        // Event listener browser
        const handleOnline = () => checkConnectivity(); // Verifikasi ulang saat browser mendeteksi koneksi
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Polling setiap 10 detik untuk menangani kasus "Wifi Connect tapi No Internet"
        const intervalId = setInterval(checkConnectivity, 10000);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(intervalId);
        };
    }, []);

    // 1. Build the list of texts to display based on settings
    useEffect(() => {
        if (!settings.enableRunningText) {
            setContentList([]);
            return;
        }

        let list: string[] = [];

        if (settings.runningTextMode === 'themed') {
            let availableContent: { text: string; source: string }[] = [];
        
            const selectedQuranThemes = settings.runningTextThemes
                .filter(t => t.startsWith('quran-'))
                .map(t => t.replace('quran-', ''));
                
            const selectedHadithThemes = settings.runningTextThemes
                .filter(t => t.startsWith('hadith-'))
                .map(t => t.replace('hadith-', ''));

            if (selectedQuranThemes.includes('random')) {
                 availableContent.push(...Object.values(QURAN_THEMES_CONTENT).flat());
            } else {
                selectedQuranThemes.forEach(theme => {
                    if (QURAN_THEMES_CONTENT[theme]) {
                        availableContent.push(...QURAN_THEMES_CONTENT[theme]);
                    }
                });
            }
            
            if (selectedHadithThemes.includes('random')) {
                 availableContent.push(...Object.values(HADITH_THEMES_CONTENT).flat());
            } else {
                 selectedHadithThemes.forEach(theme => {
                    if (HADITH_THEMES_CONTENT[theme]) {
                        availableContent.push(...HADITH_THEMES_CONTENT[theme]);
                    }
                });
            }

            // Remove duplicates
            availableContent = Array.from(new Set(availableContent.map(a => JSON.stringify(a)))).map(s => JSON.parse(s));
            
            if (availableContent.length > 0) {
                list = availableContent.map(content => `"${content.text}" <span class="opacity-80 italic text-xs">(${content.source})</span>`);
            } else {
                list = [t('general.noContent')];
            }
        } else { // 'custom' mode
            const validCustoms = (settings.customTexts || []).filter(t => t.content && t.content.trim() && t.content.trim() !== '<p><br></p>');
            if (validCustoms.length > 0) {
                list = validCustoms.map(t => t.content);
            } else {
                list = [t('general.customTextPlaceholder')];
            }
        }
        
        setContentList(list);
        setCurrentIndex(0); // Reset index when content changes
    }, [settings.runningTextMode, settings.runningTextThemes, settings.customTexts, settings.enableRunningText]);

    const currentText = useMemo(() => {
        const rawText = contentList[currentIndex] || '';
        return typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(rawText) : rawText;
    }, [contentList, currentIndex]);
    
    // 2. Function to advance to the next text
    const advanceToNextText = useCallback(() => {
        if (contentList.length > 1) {
            setCurrentIndex(prevIndex => (prevIndex + 1) % contentList.length);
        }
    }, [contentList.length]);

    // 3. Measure container and text widths for animation decision
    useEffect(() => {
        if (!settings.enableRunningText) return;
        const measure = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
            if (textMeasureRef.current) {
                setTextWidth(textMeasureRef.current.offsetWidth);
            }
        };

        measure();
        const observer = new ResizeObserver(measure);
        const currentContainer = containerRef.current;
        if (currentContainer) {
            observer.observe(currentContainer);
        }
        const timeoutId = setTimeout(measure, 50);

        return () => {
            if (currentContainer) observer.unobserve(currentContainer);
            clearTimeout(timeoutId);
        };
    }, [currentText, settings.enableRunningText]);

    const isAnimating = textWidth > containerWidth && containerWidth > 0;

    // 4. Handle timing for static (non-animating) text
    useEffect(() => {
        if (!isAnimating && currentText && contentList.length > 1) {
            const timer = setTimeout(advanceToNextText, (settings.runningTextSpeed || 30) * 1000);
            return () => clearTimeout(timer);
        }
    }, [isAnimating, currentText, advanceToNextText, settings.runningTextSpeed, contentList.length]);
    
    const marqueeStyle: React.CSSProperties = {
        animationName: 'marquee-run-once',
        animationDuration: `${settings.runningTextSpeed || 30}s`,
        animationTimingFunction: 'linear',
        whiteSpace: 'nowrap',
    };
    
    const maskStyle: React.CSSProperties = {
        maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
    };

    return (
        <footer 
            className="w-full backdrop-blur-lg p-3 text-sm md:text-base flex items-center justify-between gap-4 border-t border-white/20 dark:border-white/10 text-slate-800 dark:text-white bg-white/10 dark:bg-black/10"
        >
            {/* Left side: Status */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 shadow-green-400' : 'bg-red-500 shadow-red-400'} shadow-[0_0_5px_currentColor]`}></div>
                <span className="opacity-90">{isOnline ? t('general.online') : t('general.offline')}</span>
            </div>

            {/* Hidden element to measure the actual width of the text */}
            <span ref={textMeasureRef} className="absolute invisible left-[-9999px] whitespace-nowrap" dangerouslySetInnerHTML={{ __html: currentText }} />

            {/* Middle: Running Text Container */}
            {settings.enableRunningText ? (
                <div 
                    ref={containerRef} 
                    style={maskStyle}
                    className="flex-grow min-w-0 h-full overflow-hidden relative flex items-center border-l border-r border-white/10 px-4"
                >
                     {currentText && (
                        isAnimating ? (
                             <span
                                key={currentIndex}
                                onAnimationEnd={advanceToNextText}
                                style={marqueeStyle}
                                className="inline-block" // Allows transform to work
                                dangerouslySetInnerHTML={{ __html: currentText }}
                            />
                        ) : (
                            <span
                                key={currentIndex}
                                className="w-full text-center whitespace-nowrap"
                                dangerouslySetInnerHTML={{ __html: currentText }}
                            />
                        )
                    )}
                </div>
            ) : (
                 <div className="flex-grow min-w-0"></div>
            )}


            {/* Right side: Credit */}
            <div className="flex-shrink-0 text-xs md:text-sm whitespace-nowrap opacity-80">
                {t('general.credit')}
            </div>
        </footer>
    );
};

export const Footer = memo(FooterComponent);
