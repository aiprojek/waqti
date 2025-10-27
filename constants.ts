import type { PrayerTimes, PrayerName, Settings, Dhikr, Slide } from './types';
import { getRawLocale, Language } from './i18n';


// FIX: Replaced 'Dhr' with 'Dhuhr' to match the PrayerName type.
export const PRAYER_NAMES: PrayerName[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
// FIX: Replaced 'Dhr' with 'Dhuhr' to match the PrayerName type.
export const IQAMAH_PRAYERS: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

// DEPRECATED: PRAYER_NAMES_ID is now handled by i18n: t('prayerNames.Fajr')

// --- Kumpulan Dzikir Setelah Shalat (Updated Default List) ---
export const DHIKR_LIST: Dhikr[] = [
    { id: 'dhikr-1', arabic: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ (٣×)", latin: "Astaghfirullahal 'adziim (3x)" },
    { id: 'dhikr-2', arabic: "اللَّهُمَّ أَنْتَ السَّلَامُ، وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ", latin: "Allahumma antas salaam wa minkas salaam tabaarokta yaa dzal jalaali wal ikroom." },
    { id: 'dhikr-3', arabic: "سُبْحَانَ اللَّهِ (٣٣×)", latin: "Subhanallah (33x)" },
    { id: 'dhikr-4', arabic: "الْحَمْدُ لِلَّهِ (٣٣×)", latin: "Alhamdulillah (33x)" },
    { id: 'dhikr-5', arabic: "اللَّهُ أَكْبَرُ (٣٣×)", latin: "Allahu Akbar (33x)" },
    { id: 'dhikr-6', arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", latin: "Laa ilaha illallah wahdahu la syarika lah, lahul mulku wa lahul hamdu wa huwa 'ala kulli syai-in qodiir." }
];


// --- Database Internal untuk Teks Berjalan ---
type ThemedContent = { text: string; source: string };

export const QURAN_THEMES_CONTENT: Record<string, ThemedContent[]> = {
    tauhid: [
        { text: "Katakanlah (Muhammad), 'Dialah Allah, Yang Maha Esa. Allah tempat meminta segala sesuatu. (Allah) tidak beranak dan tidak pula diperanakkan. Dan tidak ada sesuatu yang setara dengan Dia.'", source: "Q.S. Al-Ikhlas: 1-4" },
        { text: "Allah, tidak ada tuhan selain Dia. Yang Mahahidup, Yang terus menerus mengurus (makhluk-Nya), tidak mengantuk dan tidak tidur.", source: "Q.S. Al-Baqarah: 255" },
    ],
    akhlaq: [
        { text: "Dan sesungguhnya engkau benar-benar berbudi pekerti yang luhur.", source: "Q.S. Al-Qalam: 4" },
        { text: "Wahai orang-orang yang beriman! Jauhilah banyak dari prasangka, sesungguhnya sebagian prasangka itu dosa...", source: "Q.S. Al-Hujurat: 12" },
    ],
    fikih: [
        { text: "Wahai orang-orang yang beriman! Apabila kamu hendak melaksanakan salat, maka basuhlah wajahmu dan tanganmu sampai ke siku, dan sapulah kepalamu dan (basuh) kedua kakimu sampai ke kedua mata kaki.", source: "Q.S. Al-Ma'idah: 6" },
        { text: "Sesungguhnya shalat itu adalah kewajiban yang ditentukan waktunya atas orang-orang yang beriman.", source: "Q.S. An-Nisa: 103" },
    ],
};

export const HADITH_THEMES_CONTENT: Record<string, ThemedContent[]> = {
    tauhid: [
        { text: "Barangsiapa yang akhir perkataannya adalah 'Laa ilaaha illallaah' maka dia akan masuk surga.", source: "HR. Abu Daud" },
        { text: "Hak Allah atas hamba-Nya adalah mereka beribadah kepada-Nya dan tidak menyekutukan-Nya dengan sesuatu apapun.", source: "Muttafaqun 'alaih" },
    ],
    akhlaq: [
        { text: "Orang mukmin yang paling sempurna imannya adalah yang paling baik akhlaknya.", source: "HR. Tirmidzi" },
        { text: "Senyummu di hadapan saudaramu adalah sedekah.", source: "HR. Tirmidzi" }
    ],
    fikih: [
        { text: "Shalatlah kalian sebagaimana kalian melihat aku shalat.", source: "HR. Bukhari" },
        { text: "Amal itu tergantung niatnya, dan setiap orang hanya mendapatkan sesuai niatnya.", source: "HR. Bukhari & Muslim" },
    ],
};
// --- End of Database ---

export const DEFAULT_PRAYER_TIMES: PrayerTimes = {
    Fajr: "04:30",
    Sunrise: "06:00",
    Dhuhr: "12:00",
    Asr: "15:30",
    Maghrib: "18:00",
    Isha: "19:30",
};

const DEFAULT_ALARM_SOUND = 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_32283e5329.mp3?filename=alarm-clock-90867.mp3';

// Function to get default slides based on language
export const getDefaultFridaySlides = (lang: Language): Slide[] => {
    const locale = getRawLocale(lang);
    return locale.defaults.fridaySlides.map((slideContent, index) => ({
        id: `friday-slide-${index + 1}`,
        type: 'text',
        title: slideContent.title,
        content: slideContent.content,
        enabled: true,
        duration: [20, 25, 25, 20, 30][index] || 20,
        fridayOnly: true,
    }));
};

// Function to generate default settings based on the current language locale
export const getDefaultSettings = (lang: Language): Settings => {
    const locale = getRawLocale(lang);
    return {
        mosqueName: "Waqti",
        city: "Jakarta",
        calculationMethod: 17, // Kementerian Agama Republik Indonesia
        madhab: 0,
        highLatitudeRule: 'auto',
        fajrAngle: 18,
        ishaAngle: 18,
        useManualTimes: false,
        manualPrayerTimes: DEFAULT_PRAYER_TIMES,
        adjustments: {
            Fajr: 0,
            Sunrise: 0,
            Dhuhr: 0,
            Asr: 0,
            Maghrib: 0,
            Isha: 0,
        },
        iqamahOffsets: {
            Fajr: 15,
            Sunrise: 0,
            Dhuhr: 15,
            Asr: 15,
            Maghrib: 10,
            Isha: 15,
        },
        prayerDurations: {
            Fajr: 7,
            Sunrise: 0,
            Dhuhr: 10,
            Asr: 10,
            Maghrib: 8,
            Isha: 10,
        },
        dhikrDuration: 10, // minutes
        enableDhikr: true,
        dhikrList: DHIKR_LIST,
        selectedDhikr: DHIKR_LIST.map(d => d.id), // Default to all selected by ID
        theme: 'dark',
        accentColor: '#8B5CF6',
        wallpaper: 'https://cdn.pixabay.com/photo/2018/04/24/17/57/masjid-nabawi-3347602_960_720.jpg',
        enableContextualWallpapers: true,
        contextualWallpapers: {
            Fajr: 'https://cdn.pixabay.com/photo/2019/10/04/09/20/mosque-4525144_960_720.jpg',
            Dhuhr: 'https://cdn.pixabay.com/photo/2019/11/27/21/06/jerusalem-4657867_960_720.jpg',
            Asr: 'https://images.pexels.com/photos/2291789/pexels-photo-2291789.jpeg',
            Maghrib: 'https://cdn.pixabay.com/photo/2013/05/08/14/07/mecca-109852_960_720.jpg',
            Isha: 'https://images.pexels.com/photos/15463931/pexels-photo-15463931.jpeg',
        },
        displayMode: 'landscape',
        layoutTemplate: 'focus-jam',
        enableBackgroundAnimation: true,
        enableDimScreen: false,
        customTexts: [{ 
            id: 'default-1', 
            content: `"${locale.footer.runningText.text}" <span class="opacity-80 italic text-xs">(${locale.footer.runningText.source})</span>`
        }],
        enableRunningText: false,
        runningTextMode: 'custom',
        runningTextThemes: [],
        runningTextSpeed: 30,
        slides: getDefaultFridaySlides(lang),
        enableAdhanAlarm: false,
        adhanAlarmSound: DEFAULT_ALARM_SOUND,
        enableIqamahAlarm: false,
        iqamahAlarmSound: DEFAULT_ALARM_SOUND,
        enableFridayMode: true,
        fridayTimeSource: 'dhuhr',
        manualFridayTime: '12:15',
        khutbahMessageTitle: locale.defaults.khutbah.title,
        khutbahMessageTagline: locale.defaults.khutbah.tagline,
        fridayPrayerDuration: 20,
        enableFridaySlides: true,
    };
};