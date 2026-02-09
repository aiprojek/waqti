import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { QRCodePosition } from '../../types';

// --- Icons ---
export const SpeakerIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
export const BookOpenIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>);
export const ClockIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);

// --- Helpers ---
export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

export const useFormatUpdateDate = () => {
    const { language } = useLanguage();
    const locale = language === 'id' ? 'id-ID' : 'en-US';

    return (isoString?: string): string | null => {
        if (!isoString) return null;
        try {
            const date = new Date(isoString);
            const gregorianDate = new Intl.DateTimeFormat(locale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }).format(date);

            const hijriDate = new Intl.DateTimeFormat(`${locale}-u-ca-islamic`, {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }).format(date);
            
            return `${gregorianDate} / ${hijriDate}`;
        } catch (e) {
            console.error("Error formatting date:", e);
            return null;
        }
    };
};

export const getQrCodePositionClass = (position?: QRCodePosition) => {
    switch (position) {
        case 'top-left':
            return 'top-4 left-4';
        case 'top-right':
            return 'top-4 right-4';
        case 'bottom-left':
            return 'bottom-4 left-4';
        case 'bottom-right':
            return 'bottom-4 right-4';
        default:
            return 'bottom-4 right-4'; // Default position
    }
};
