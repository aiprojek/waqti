
import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';

const HIJRI_MONTHS_LATIN = [
    "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
    "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
    "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
];

const useClock = () => {
    const [time, setTime] = useState(new Date());
    const { language } = useLanguage();
    const { settings } = useSettings();
    const locale = language === 'id' ? 'id-ID' : 'en-US';

    // Optimize: Memoize the formatters to avoid recreating them every second
    const hijriFormatter = useMemo(() => {
        try {
            return new Intl.DateTimeFormat('en-u-ca-islamic', {
                day: 'numeric',
                month: 'numeric',
                year: 'numeric'
            });
        } catch (e) {
            return null;
        }
    }, []);

    useEffect(() => {
        const timerId = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => {
            clearInterval(timerId);
        };
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    };

    const formatDateParts = (date: Date) => {
        const day = new Intl.DateTimeFormat(locale, {
            weekday: 'long',
        }).format(date);
        
        const fullDate = new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(date);

        // Remove the day part from the full date string if it exists
        const justTheDate = fullDate.replace(day + ', ', '');

        return { day, date: justTheDate };
    };
    
    const formatHijriDate = (date: Date) => {
         // Apply offset
         const offset = settings.hijriDateOffset || 0;
         const adjustedDate = new Date(date);
         adjustedDate.setDate(adjustedDate.getDate() + offset);

         try {
            if (!hijriFormatter) throw new Error("Intl not supported");

            // formatToParts is more robust for extracting specific date components
            const parts = hijriFormatter.formatToParts(adjustedDate);
            const day = parts.find(p => p.type === 'day')?.value;
            const monthIndex = parseInt(parts.find(p => p.type === 'month')?.value || '1', 10) - 1;
            const year = parts.find(p => p.type === 'year')?.value?.split(' ')[0]; // Removes "AH" suffix

            // Construct the date string using the standard transliteration
            if (day && monthIndex >= 0 && monthIndex < 12 && year) {
                const monthName = HIJRI_MONTHS_LATIN[monthIndex];
                return `${day} ${monthName} ${year}`;
            }
            
            // Fallback to the old method if for some reason parts parsing fails
            return new Intl.DateTimeFormat(`${locale}-u-ca-islamic`, {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }).format(adjustedDate).replace(/ AH$/, '').trim();

        } catch (e) {
            // Fallback for older browsers or environments without full Intl support
            console.error("Hijri date formatting failed:", e);
            const year = adjustedDate.getFullYear();
            if (year < 622) return "Before Hijri";
            return "Hijri date unavailable";
        }
    };

    const { day, date } = formatDateParts(time);

    return {
        currentTime: time,
        formattedTime: formatTime(time),
        hours: String(time.getHours()).padStart(2, '0'),
        minutes: String(time.getMinutes()).padStart(2, '0'),
        seconds: String(time.getSeconds()).padStart(2, '0'),
        formattedDay: day,
        formattedFullDate: date,
        formattedHijriDate: formatHijriDate(time),
    };
};

export default useClock;
