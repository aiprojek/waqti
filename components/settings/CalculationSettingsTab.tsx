
import React, { useState } from 'react';
import type { Settings, PrayerName } from '../../types';
import { CollapsibleSection, Input, Select, Checkbox } from './Shared';
import { PRAYER_NAMES, IQAMAH_PRAYERS } from '../../constants';
import { t, getLocale } from '../../i18n';

interface CalculationSettingsTabProps {
    localSettings: Settings;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    handleNestedChange: (category: keyof Settings, key: string, value: string | number) => void;
    // New props moved from General
    citySearch: string;
    setCitySearch: React.Dispatch<React.SetStateAction<string>>;
    handleLocationSearch: () => void;
    isSearching: boolean;
    locationStatus: { message: string; type: 'success' | 'error' | 'info' };
    locationStatusColor: string;
}

export const CalculationSettingsTab: React.FC<CalculationSettingsTabProps> = ({
    localSettings,
    handleInputChange,
    handleNestedChange,
    citySearch,
    setCitySearch,
    handleLocationSearch,
    isSearching,
    locationStatus,
    locationStatusColor
}) => {
    const localeData = getLocale();
    const CALCULATION_METHODS = localeData.defaults.calculationMethods;
    const MADHAB_OPTIONS = localeData.defaults.madhabOptions;
    const HIGH_LATITUDE_RULES = localeData.defaults.highLatitudeRules;
    const [detectingLocation, setDetectingLocation] = useState(false);
    const [locationError, setLocationError] = useState('');

    const handleDetectLocation = () => {
        setDetectingLocation(true);
        setLocationError('');
        
        if (!navigator.geolocation) {
            setLocationError(t('settings.calculation.source.detectError'));
            setDetectingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                
                const latEvent = {
                    target: { name: 'latitude', value: latitude.toString(), type: 'number' }
                } as unknown as React.ChangeEvent<HTMLInputElement>;
                
                const lngEvent = {
                    target: { name: 'longitude', value: longitude.toString(), type: 'number' }
                } as unknown as React.ChangeEvent<HTMLInputElement>;

                handleInputChange(latEvent);
                handleInputChange(lngEvent);
                
                // Reverse Geocoding to get City Name
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await response.json();
                    if (data && data.address) {
                        const address = data.address;
                        // Prioritize city-level names
                        const cityName = address.city || address.town || address.village || address.county || address.state_district || '';
                        
                        if (cityName) {
                            // Update the 'city' setting
                            const cityEvent = {
                                target: { name: 'city', value: cityName, type: 'text' }
                            } as unknown as React.ChangeEvent<HTMLInputElement>;
                            handleInputChange(cityEvent);
                            
                            // Update the search box
                            setCitySearch(cityName);
                        }
                    }
                } catch (e) {
                    console.error("Failed to reverse geocode", e);
                }
                
                setDetectingLocation(false);
            },
            (error) => {
                console.error(error);
                setLocationError(t('settings.calculation.source.detectError'));
                setDetectingLocation(false);
            }
        );
    };

    return (
        <>
            <CollapsibleSection title={t('settings.calculation.source.title')} defaultOpen={true}>
                 <div className="grid grid-cols-1 gap-6">
                    {/* 1. Location Search / Detection */}
                    <div>
                        <label className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300 block">{t('settings.calculation.source.searchCity')}</label>
                        <div className="flex gap-2 mb-2">
                            <input 
                                value={citySearch} 
                                onChange={(e) => setCitySearch(e.target.value)} 
                                placeholder={t('settings.calculation.source.searchCityPlaceholder')} 
                                className="flex-grow bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md p-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]" 
                            />
                            <button 
                                onClick={handleLocationSearch} 
                                disabled={isSearching} 
                                className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-md hover:opacity-90 transition-colors font-semibold disabled:bg-slate-500 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                                {isSearching ? t('settings.general.searching') : t('settings.general.search')}
                            </button>
                        </div>
                        <p className={`text-xs mt-1 px-1 ${locationStatusColor}`}>{locationStatus.message}</p>
                    </div>

                    <div className="p-4 bg-slate-200/50 dark:bg-slate-700/30 rounded-lg border border-slate-300 dark:border-slate-600">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                            <h5 className="font-semibold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('settings.calculation.source.currentCoordinates')}</h5>
                            <button 
                                type="button" 
                                onClick={handleDetectLocation} 
                                disabled={detectingLocation}
                                className="text-sm bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-white px-3 py-1.5 rounded hover:bg-slate-400 dark:hover:bg-slate-500 transition-colors flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
                                {detectingLocation ? t('settings.calculation.source.detecting') : t('settings.calculation.source.detect')}
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <Input 
                                label={t('settings.calculation.source.latitude')} 
                                name="latitude" 
                                type="number" 
                                step="any"
                                value={localSettings.latitude} 
                                onChange={handleInputChange} 
                            />
                            <Input 
                                label={t('settings.calculation.source.longitude')} 
                                name="longitude" 
                                type="number" 
                                step="any"
                                value={localSettings.longitude} 
                                onChange={handleInputChange} 
                            />
                        </div>
                        {locationError && <p className="text-xs text-red-500 mt-2">{locationError}</p>}
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">
                            {t('settings.calculation.source.manualHelp')}
                        </p>
                    </div>

                    {/* 2. Calculation Source Selection */}
                    <div>
                        <Select 
                            label={t('settings.calculation.source.source')} 
                            name="calculationSource" 
                            value={localSettings.calculationSource || 'api'} 
                            onChange={handleInputChange}
                        >
                            <option value="api">{t('settings.calculation.source.api')}</option>
                            <option value="calculated">{t('settings.calculation.source.calculated')}</option>
                        </Select>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {t('settings.calculation.source.modeHelp')}
                        </p>
                    </div>
                 </div>
            </CollapsibleSection>

            <CollapsibleSection title={t('settings.calculation.title')}>
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm text-blue-800 dark:text-blue-200">
                    {t('settings.calculation.methodHelp')}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select label={t('settings.calculation.method')} name="calculationMethod" value={localSettings.calculationMethod} onChange={handleInputChange}>
                        {CALCULATION_METHODS.map(method => (
                            <option key={method.id} value={method.id}>{method.name}</option>
                        ))}
                    </Select>
                    <Select label={t('settings.calculation.madhab')} name="madhab" value={localSettings.madhab} onChange={handleInputChange}>
                        {MADHAB_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                    </Select>
                    <Select label={t('settings.calculation.highLatitude')} name="highLatitudeRule" value={localSettings.highLatitudeRule} onChange={handleInputChange}>
                        {HIGH_LATITUDE_RULES.map(rule => <option key={rule.id} value={rule.id}>{rule.name}</option>)}
                    </Select>
                </div>
                <div className={`mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 ${localSettings.calculationMethod !== 99 ? 'opacity-50' : ''}`}>
                    <Input label={t('settings.calculation.fajrAngle')} name="fajrAngle" type="number" step="0.1" value={localSettings.fajrAngle} onChange={handleInputChange} disabled={localSettings.calculationMethod !== 99} />
                    <Input label={t('settings.calculation.ishaAngle')} name="ishaAngle" type="number" step="0.1" value={localSettings.ishaAngle} onChange={handleInputChange} disabled={localSettings.calculationMethod !== 99} />
                </div>
                {localSettings.calculationMethod !== 99 && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{t('settings.calculation.customNote')}</p>}
            </CollapsibleSection>
            
            <CollapsibleSection title={t('settings.calculation.corrections.title')}>
                <Checkbox label={t('settings.calculation.corrections.useManual')} name="useManualTimes" checked={localSettings.useManualTimes} onChange={handleInputChange} />
                {localSettings.useManualTimes && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                        {PRAYER_NAMES.map(name => (
                            <Input 
                                key={name} 
                                label={t(`prayerNames.${name}`)}
                                type="time" 
                                value={localSettings.manualPrayerTimes[name]} 
                                onChange={(e) => handleNestedChange('manualPrayerTimes', name, e.target.value)} 
                            />
                        ))}
                    </div>
                )}
                
                <h4 className="font-semibold mt-6 mb-2">{t('settings.calculation.corrections.correction')}</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {PRAYER_NAMES.map(name => (
                        <Input 
                            key={name}
                            label={t(`prayerNames.${name}`)}
                            type="number"
                            value={localSettings.adjustments[name]}
                            onChange={(e) => handleNestedChange('adjustments', name, Number(e.target.value))}
                        />
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                        <h4 className="font-semibold mb-2">{t('settings.calculation.corrections.iqamah')}</h4>
                        <div className="grid grid-cols-2 gap-4">
                            {IQAMAH_PRAYERS.map(name => (
                                <Input 
                                    key={name}
                                    label={t(`prayerNames.${name}`)}
                                    type="number"
                                    value={localSettings.iqamahOffsets[name]}
                                    onChange={(e) => handleNestedChange('iqamahOffsets', name, Number(e.target.value))}
                                />
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">{t('settings.calculation.corrections.hijri')}</h4>
                        <Input 
                            label={t('settings.calculation.corrections.hijri')}
                            name="hijriDateOffset"
                            type="number"
                            value={localSettings.hijriDateOffset}
                            onChange={handleInputChange}
                            help={t('settings.calculation.corrections.hijriHelp')}
                        />
                    </div>
                </div>
            </CollapsibleSection>
        </>
    );
};
