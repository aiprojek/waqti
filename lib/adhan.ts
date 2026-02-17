
// Implementasi Lokal Adhan.js (Porting Ringan untuk TypeScript)
// Menghilangkan ketergantungan pada CDN eksternal.

export enum Madhab {
    Shafi = 1,
    Hanafi = 2
}

export enum HighLatitudeRule {
    MiddleOfTheNight = 1,
    SeventhOfTheNight = 2,
    TwilightAngle = 3
}

export class Coordinates {
    constructor(public latitude: number, public longitude: number) {}
}

export class CalculationParameters {
    method: string = "Other";
    fajrAngle: number;
    ishaAngle: number;
    ishaInterval: number = 0;
    madhab: Madhab = Madhab.Shafi;
    highLatitudeRule: HighLatitudeRule = HighLatitudeRule.MiddleOfTheNight;
    adjustments: { [key: string]: number } = { Fajr: 0, Sunrise: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 };

    constructor(fajrAngle: number | null, ishaAngle: number | null, method: string = "Other") {
        this.fajrAngle = fajrAngle || 18;
        this.ishaAngle = ishaAngle || 18;
        this.method = method;
    }
}

export const CalculationMethod = {
    MuslimWorldLeague: () => new CalculationParameters(18, 17, "MWL"),
    Egyptian: () => new CalculationParameters(19.5, 17.5, "Egyptian"),
    Karachi: () => new CalculationParameters(18, 18, "Karachi"),
    UmmAlQura: () => {
        const params = new CalculationParameters(18.5, 0, "UmmAlQura"); 
        params.ishaInterval = 90; 
        return params; 
    },
    Dubai: () => new CalculationParameters(18.2, 18.2, "Dubai"),
    MoonsightingCommittee: () => new CalculationParameters(18, 18, "Moonsighting"),
    NorthAmerica: () => new CalculationParameters(15, 15, "ISNA"),
    Kuwait: () => new CalculationParameters(18, 17.5, "Kuwait"),
    Qatar: () => {
        const params = new CalculationParameters(18, 0, "Qatar");
        params.ishaInterval = 90;
        return params;
    },
    Singapore: () => new CalculationParameters(20, 18, "Singapore"),
    Tehran: () => new CalculationParameters(17.7, 14, "Tehran"),
    Turkey: () => new CalculationParameters(18, 17, "Turkey"),
    Gulf: () => {
        const params = new CalculationParameters(19.5, 0, "Gulf");
        params.ishaInterval = 90;
        return params;
    },
    Other: () => new CalculationParameters(0, 0, "Other") // Custom handled outside
};

// --- Math & Astronomy Helpers ---

function dtr(d: number) { return (d * Math.PI) / 180.0; }
function rtd(r: number) { return (r * 180.0) / Math.PI; }
function sin(d: number) { return Math.sin(dtr(d)); }
function cos(d: number) { return Math.cos(dtr(d)); }
function tan(d: number) { return Math.tan(dtr(d)); }
function arcsin(d: number) { return rtd(Math.asin(d)); }
function arccos(d: number) { return rtd(Math.acos(d)); }
function arctan(d: number) { return rtd(Math.atan(d)); }
function arccot(x: number) { return rtd(Math.atan(1.0 / x)); }
function fixHour(a: number) { 
    a = a - 24.0 * (Math.floor(a / 24.0)); 
    a = a < 0 ? a + 24.0 : a; 
    return a; 
}

// Astronomical Calculations (Simplified for brevity but accurate)
function julian(year: number, month: number, day: number) {
    if (month <= 2) { year -= 1; month += 12; }
    const A = Math.floor(year / 100);
    const B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

function sunPosition(jd: number) {
    const D = jd - 2451545.0;
    const g = fixHour(357.529 + 0.98560028 * D);
    const q = fixHour(280.459 + 0.98564736 * D);
    const L = fixHour(q + 1.915 * sin(g) + 0.020 * sin(2 * g));
    const e = 23.439 - 0.00000036 * D;
    const RA = arctan(cos(e) * tan(L)) / 15.0;
    const eqt = q / 15.0 - fixHour(RA);
    const decl = arcsin(sin(e) * sin(L));
    return { decl: decl, eqt: eqt };
}

export class PrayerTimes {
    fajr!: Date;
    sunrise!: Date;
    dhuhr!: Date;
    asr!: Date;
    maghrib!: Date;
    isha!: Date;

    constructor(coordinates: Coordinates, date: Date, params: CalculationParameters) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const jd = julian(year, month, day);
        const sun = sunPosition(jd);
        const latitude = coordinates.latitude;
        const longitude = coordinates.longitude;
        const timeZone = -date.getTimezoneOffset() / 60; // Local timezone offset

        // Dhuhr
        const dhuhrTime = fixHour(12 + timeZone - longitude / 15 - sun.eqt);
        
        // Sun Angle Calculations
        const computeTime = (angle: number, time: number, direction: 'ccw' | 'cw' = 'ccw') => {
            try {
                const D = sun.decl;
                const Z = fixHour(12 + timeZone - longitude / 15 - sun.eqt);
                const V = (1 / 15) * arccos((-sin(angle) - sin(D) * sin(latitude)) / (cos(D) * cos(latitude)));
                return direction === 'ccw' ? Z - V : Z + V;
            } catch (e) { return 0; } // Extreme latitude fallback
        };

        // Asr (Shadow Length)
        const computeAsr = (factor: number, time: number) => {
             try {
                const D = sun.decl;
                const Z = fixHour(12 + timeZone - longitude / 15 - sun.eqt);
                const V = (1 / 15) * arccos((sin(arccot(factor + tan(Math.abs(latitude - D)))) - sin(D) * sin(latitude)) / (cos(D) * cos(latitude)));
                return Z + V;
            } catch (e) { return 0; }
        }

        const fajrTime = computeTime(params.fajrAngle, dhuhrTime, 'ccw');
        const sunriseTime = computeTime(0.833, dhuhrTime, 'ccw'); // Sunrise angle (0.833 for refraction)
        const maghribTime = computeTime(0.833, dhuhrTime, 'cw');
        const ishaTime = params.ishaInterval > 0 
            ? maghribTime + params.ishaInterval / 60 
            : computeTime(params.ishaAngle, dhuhrTime, 'cw');
        
        const asrFactor = params.madhab === Madhab.Hanafi ? 2 : 1;
        const asrTime = computeAsr(asrFactor, dhuhrTime);

        // Helper to convert decimal hours to Date object
        const timeToDate = (t: number) => {
            const hours = Math.floor(t);
            const minutes = Math.floor((t - hours) * 60);
            const seconds = Math.floor(((t - hours) * 60 - minutes) * 60);
            const d = new Date(date);
            d.setHours(hours, minutes, seconds, 0);
            return d;
        };

        // Apply Adjustments
        const addMinutes = (d: Date, min: number) => new Date(d.getTime() + min * 60000);

        this.fajr = addMinutes(timeToDate(fajrTime), params.adjustments.Fajr);
        this.sunrise = addMinutes(timeToDate(sunriseTime), params.adjustments.Sunrise);
        this.dhuhr = addMinutes(timeToDate(dhuhrTime), params.adjustments.Dhuhr);
        this.asr = addMinutes(timeToDate(asrTime), params.adjustments.Asr);
        this.maghrib = addMinutes(timeToDate(maghribTime), params.adjustments.Maghrib);
        this.isha = addMinutes(timeToDate(ishaTime), params.adjustments.Isha);
    }
}
