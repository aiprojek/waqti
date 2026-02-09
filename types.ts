
// FIX: Populating the content for this file which was a placeholder.

export type PrayerName = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export type IqamahPrayerName = Exclude<PrayerName, 'Sunrise'>;

export type PrayerTimes = Record<PrayerName, string>;

// --- New Slide Structures ---

export interface ScheduleItem {
    id: string;
    topic: string;
    speaker: string;
    day: string;
    time: string;
}

export interface FinanceInfo {
    title: string;
    lastBalance: number;
    income: number;
    expense: number;
    currentBalance: number;
    donationTarget?: number;
    lastUpdated?: string; // NEW: Timestamp for the last update
}

export type QRCodePosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'side-left' | 'side-right';

interface BaseSlide {
    id: string;
    qrCodeUrl?: string;
    qrCodePosition?: QRCodePosition;
    enabled: boolean;
    duration: number; // in seconds
    fridayOnly?: boolean; // NEW: Friday mode slide flag
}

export interface TextSlide extends BaseSlide {
    type: 'text';
    title?: string;
    content?: string;
}

export interface ImageSlide extends BaseSlide {
    type: 'image';
    imageUrl?: string;
}

export interface ScheduleSlide extends BaseSlide {
    type: 'schedule';
    title: string;
    scheduleItems: ScheduleItem[];
}

export interface FinanceSlide extends BaseSlide {
    type: 'finance';
    financeInfo: FinanceInfo;
}

export type Slide = TextSlide | ImageSlide | ScheduleSlide | FinanceSlide;


// New: Interface for a single Dhikr item
export interface Dhikr {
    id: string;
    arabic: string;
    latin: string;
}

// NEW: Define Layout Template types
export type LayoutTemplate = 'focus-jam' | 'dashboard-info' | 'minimalis';

export type CalculationSource = 'api' | 'calculated';

export interface Settings {
    mosqueName: string;
    city: string;
    // NEW: Offline Calculation Support
    calculationSource: CalculationSource;
    latitude: number;
    longitude: number;
    
    calculationMethod: number;
    madhab: number; // 0 for Standard (Shafii, Maliki, Hanbali), 1 for Hanafi
    highLatitudeRule: string; // e.g., 'auto', 'middleofthenight', 'oneseventh', 'anglebased'
    fajrAngle: number;
    ishaAngle: number;
    useManualTimes: boolean;
    manualPrayerTimes: PrayerTimes;
    adjustments: Record<PrayerName, number>; // Time adjustments in minutes
    iqamahOffsets: Record<PrayerName, number>;
    prayerDurations: Record<PrayerName, number>; // in minutes, per prayer
    dhikrDuration: number; // in minutes
    enableDhikr: boolean;
    dhikrList: Dhikr[]; // New: Customizable list of Dhikr
    selectedDhikr: string[]; // Now stores array of Dhikr IDs
    theme: 'light' | 'dark';
    accentColor: string;
    wallpaper: string;
    // NEW: Contextual Wallpaper settings
    enableContextualWallpapers: boolean;
    contextualWallpapers: Record<IqamahPrayerName, string>;
    displayMode: 'landscape' | 'portrait';
    // NEW: Layout Template setting
    layoutTemplate: LayoutTemplate;
    enableMinimalistSwap: boolean; // NEW: Minimalist specific setting
    minimalistSwapInterval: number; // NEW: Interval in minutes
    enableBackgroundAnimation: boolean;
    enableDimScreen: boolean;
    customTexts: Array<{ id: string; content: string; }>; // Replaces runningText
    enableRunningText: boolean; // NEW: On/Off switch for the running text feature
    runningTextMode: 'custom' | 'themed'; // Renamed 'static' to 'custom'
    runningTextThemes: string[]; // New property for selected themes
    runningTextSpeed: number; // in seconds
    slides: Slide[];
    // NEW: Alarm settings
    enableAdhanAlarm: boolean;
    adhanAlarmSound: string;
    enableIqamahAlarm: boolean;
    iqamahAlarmSound: string;
    // NEW: Friday Mode settings
    enableFridayMode: boolean;
    fridayTimeSource: 'dhuhr' | 'manual';
    manualFridayTime: string;
    khutbahMessageTitle: string;
    khutbahMessageTagline: string;
    fridayPrayerDuration: number; // in minutes, for khutbah display
    enableFridaySlides: boolean;
}

export enum DisplayState {
    Clock,
    PrayerTime,
    IqamahCountdown,
    PrayerInProgress,
    DimScreen,
    Dhikr,
    KhutbahInProgress, // NEW: For Friday prayer
}

// NEW: Remote Control Types
export type RemoteCommandType = 'NEXT_SLIDE' | 'PREV_SLIDE' | 'STOP_ALARM' | 'REFRESH';

export interface RemoteCommand {
    type: RemoteCommandType;
    timestamp: number;
}
