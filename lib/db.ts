import type { Settings } from '../types';

// Let TypeScript know that Dexie is available globally from the CDN script
declare var Dexie: any;

// FIX: Define a local interface for Dexie's Table and use it to type the table properties.
// This avoids the "Cannot find namespace 'Dexie'" error that occurs when using `Dexie.Table`
// with `declare var Dexie: any;`, while still providing type safety for database operations.
interface DexieTable<T, TKey> {
    get(key: TKey): Promise<T | undefined>;
    put(item: T, key?: TKey): Promise<TKey>;
    add(item: T, key?: TKey): Promise<TKey>;
    clear(): Promise<void>;
    toCollection(): { first(): Promise<T | undefined> };
}

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
    settings: DexieTable<StoredSettings, number>;
    prayerTimesCache: DexieTable<PrayerTimesCache, string>;
    appState: DexieTable<AppState, string>;
    assets: DexieTable<StoredAsset, number>; // New Table

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