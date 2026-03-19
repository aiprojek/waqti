import Dexie, { Table } from 'dexie';
import type { Settings } from '../types';

interface StoredSettings extends Settings {
    id: number;
}

interface PrayerTimesCache {
    key: string;
    data: any[];
}

interface AppState {
    key: string;
    value: any;
}

// NEW: Interface for storing assets (images/sounds) as Blobs
export interface StoredAsset {
    id?: number;
    blob: Blob;
    type: string; // 'image/png', 'audio/mp3', etc.
    created: number;
}

class WaqtiDB extends Dexie {
    settings!: Table<StoredSettings, number>;
    prayerTimesCache!: Table<PrayerTimesCache, string>;
    appState!: Table<AppState, string>;
    assets!: Table<StoredAsset, number>; // New Table

    constructor() {
        super('waqtiDB');
        this.version(2).stores({ // Upgraded to version 2
            settings: 'id',
            prayerTimesCache: 'key',
            appState: 'key',
            assets: '++id, type, created' // Auto-incrementing ID
        });
        this.settings = this.table('settings');
        this.prayerTimesCache = this.table('prayerTimesCache');
        this.appState = this.table('appState');
        this.assets = this.table('assets');
    }
}

export const db = new WaqtiDB();
