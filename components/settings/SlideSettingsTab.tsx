import React from 'react';
import type { Settings, Slide, ImageSlide, ScheduleSlide, ScheduleItem, FinanceInfo, FinanceSlide } from '../../types';
import { CollapsibleSection, Input, QuillEditor, QRCodeManager, Checkbox } from './Shared';
import { t } from '../../i18n';
import { db } from '../../lib/db';
import { useBlobUrl } from '../../hooks/useBlobUrl';

// Helper component to resolve and display the image within the settings
const SlideImagePreview: React.FC<{ url: string, alt: string }> = ({ url, alt }) => {
    const resolvedUrl = useBlobUrl(url);
    return <img src={resolvedUrl || url} alt={alt} className="w-full h-full object-cover" />;
};

interface SlideSettingsTabProps {
    localSettings: Settings;
    addSlide: (type: 'text' | 'image' | 'schedule' | 'finance') => void;
    removeSlide: (index: number) => void;
    handleSlideChange: (index: number, field: string, value: any) => void;
    handleScheduleItemChange: (slideIndex: number, itemIndex: number, field: keyof ScheduleItem, value: string) => void;
    addScheduleItem: (slideIndex: number) => void;
    removeScheduleItem: (slideIndex: number, itemIndex: number) => void;
    handleFinanceInfoChange: (slideIndex: number, field: keyof Omit<FinanceInfo, 'lastUpdated' | 'currentBalance'>, value: string | number) => void;
    slideImageTypes: Record<string, 'url' | 'upload'>;
    handleSlideImageTypeChange: (index: number, type: 'url' | 'upload') => void;
    slideFileInputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
    // handleSlideImageChange replaced by internal logic for DB save
}

export const SlideSettingsTab: React.FC<SlideSettingsTabProps> = ({
    localSettings,
    addSlide,
    removeSlide,
    handleSlideChange,
    handleScheduleItemChange,
    addScheduleItem,
    removeScheduleItem,
    handleFinanceInfoChange,
    slideImageTypes,
    handleSlideImageTypeChange,
    slideFileInputRefs,
}) => {
    
    const getSlideTitle = (slide: Slide): string => {
        switch (slide.type) {
            case 'text': return slide.title || t('settings.slides.type.text');
            case 'image': return t('settings.slides.type.image');
            case 'schedule': return slide.title || t('settings.slides.type.schedule');
            case 'finance': return slide.financeInfo.title || t('settings.slides.type.finance');
            default: return t('settings.slides.slide');
        }
    }

    const handleSlideImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert(t('settings.display.wallpaper.maxSize'));
            return;
        }
        if (!file.type.startsWith('image/')) {
            alert('Unsupported file format');
            return;
        }

        try {
            const id = await db.assets.add({
                blob: file,
                type: file.type,
                created: Date.now()
            });
            handleSlideChange(index, 'imageUrl', `local-asset:${id}`);
        } catch (error) {
            console.error(error);
            alert('Failed to save image.');
        }
    };

    return (
        <CollapsibleSection title={t('settings.slides.title')} defaultOpen={true}>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <h3 className="text-xl font-bold">{t('settings.slides.list')}</h3>
                <div className="flex flex-wrap justify-start sm:justify-end gap-2">
                    <button onClick={() => addSlide('text')} className="px-3 py-1 bg-sky-600 text-white rounded-md hover:opacity-90 transition-colors text-sm font-semibold">
                        {t('settings.slides.add.text')}
                    </button>
                    <button onClick={() => addSlide('image')} className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:opacity-90 transition-colors text-sm font-semibold">
                        {t('settings.slides.add.image')}
                    </button>
                    <button onClick={() => addSlide('schedule')} className="px-3 py-1 bg-amber-600 text-white rounded-md hover:opacity-90 transition-colors text-sm font-semibold">
                        {t('settings.slides.add.schedule')}
                    </button>
                    <button onClick={() => addSlide('finance')} className="px-3 py-1 bg-emerald-600 text-white rounded-md hover:opacity-90 transition-colors text-sm font-semibold">
                        {t('settings.slides.add.finance')}
                    </button>
                </div>
            </div>
            
            <div className="space-y-4">
                {localSettings.slides.map((slide, index) => (
                    <CollapsibleSection key={slide.id} title={`${t('settings.slides.slide')} ${index + 1}: ${getSlideTitle(slide)}`}>
                        <div className="space-y-4">
                            <div className="space-y-4 p-4 bg-slate-200/50 dark:bg-slate-900/30 rounded-lg">
                                {/* First row: Checkbox and Delete button */}
                                <div className="flex justify-between items-center">
                                    <Checkbox 
                                        label={t('settings.slides.enable')}
                                        checked={slide.enabled}
                                        onChange={e => handleSlideChange(index, 'enabled', (e.target as HTMLInputElement).checked)}
                                    />
                                    <button 
                                        onClick={() => removeSlide(index)} 
                                        aria-label={t('settings.slides.remove')}
                                        className="p-2 sm:px-3 sm:py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-semibold flex items-center flex-shrink-0"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        <span className="hidden sm:inline ml-2">{t('settings.slides.remove')}</span>
                                    </button>
                                </div>
                                
                                {/* Second row: Duration */}
                                <div className="flex items-center gap-2">
                                    <label htmlFor={`duration-${slide.id}`} className="text-sm font-medium text-slate-600 dark:text-slate-300 flex-shrink-0">
                                        {t('settings.slides.duration')}
                                    </label>
                                    <input 
                                        id={`duration-${slide.id}`}
                                        type="number"
                                        min="1"
                                        value={slide.duration}
                                        onChange={e => handleSlideChange(index, 'duration', Number(e.target.value))}
                                        className="w-20 bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                                    />
                                    <span className="text-sm text-slate-500 dark:text-slate-400">{t('settings.slides.seconds')}</span>
                                </div>
                                {/* Third Row: Friday Only */}
                                <div className="pt-2">
                                     <Checkbox 
                                        label={t('settings.slides.fridayOnly')}
                                        checked={slide.fridayOnly || false}
                                        onChange={e => handleSlideChange(index, 'fridayOnly', (e.target as HTMLInputElement).checked)}
                                        disabled={!localSettings.enableFridaySlides}
                                    />
                                    {!localSettings.enableFridaySlides && (
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-7">
                                            {t('settings.slides.fridayOnlyHelp')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        
                            {slide.type === 'text' && (
                                <>
                                    <Input label={t('settings.slides.titleInput')} value={slide.title || ''} onChange={e => handleSlideChange(index, 'title', e.target.value)} />
                                    <div>
                                        <label className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-300 block">{t('settings.slides.content')}</label>
                                        <QuillEditor
                                            value={slide.content || ''}
                                            onChange={html => handleSlideChange(index, 'content', html)}
                                        />
                                    </div>
                                    <QRCodeManager slide={slide} onSlideChange={(field, value) => handleSlideChange(index, field, value)} />
                                </>
                            )}
                            {slide.type === 'image' && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-4">
                                            <label className="flex items-center space-x-2 cursor-pointer text-sm">
                                            <input type="radio" name={`slideImageType-${slide.id}`} value="url" checked={(slideImageTypes[slide.id] || 'url') === 'url'} onChange={() => handleSlideImageTypeChange(index, 'url')} className="w-4 h-4 text-[var(--accent-color)] focus:ring-[var(--accent-color)]" />
                                            <span>{t('settings.display.wallpaper.useUrl')}</span>
                                            </label>
                                            <label className="flex items-center space-x-2 cursor-pointer text-sm">
                                            <input type="radio" name={`slideImageType-${slide.id}`} value="upload" checked={slideImageTypes[slide.id] === 'upload'} onChange={() => handleSlideImageTypeChange(index, 'upload')} className="w-4 h-4 text-[var(--accent-color)] focus:ring-[var(--accent-color)]" />
                                            <span>{t('settings.display.wallpaper.upload')}</span>
                                            </label>
                                    </div>

                                    {(slideImageTypes[slide.id] || 'url') === 'url' ? (
                                        <Input label={t('settings.slides.imageUrl')} value={slide.imageUrl?.startsWith('local-asset:') || slide.imageUrl?.startsWith('data:image') ? '' : slide.imageUrl || ''} onChange={e => handleSlideChange(index, 'imageUrl', e.target.value)} placeholder="https://..." />
                                    ) : (
                                        <div>
                                            <label className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-300 block">{t('settings.slides.image')}</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                ref={el => { slideFileInputRefs.current[index] = el; }}
                                                onChange={e => handleSlideImageUpload(e, index)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => slideFileInputRefs.current[index]?.click()}
                                                className="w-full px-4 py-2 bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-slate-800 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                            >
                                                {t('settings.slides.selectFile')}
                                            </button>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('settings.display.wallpaper.maxSize')}</p>
                                        </div>
                                    )}

                                    {slide.imageUrl && (
                                        <div className="relative group w-24 h-16 rounded-md overflow-hidden border border-slate-300 dark:border-slate-600 flex-shrink-0">
                                            <SlideImagePreview url={slide.imageUrl} alt={`Slide ${index + 1} preview`} />
                                            <button 
                                                onClick={() => handleSlideChange(index, 'imageUrl', '')}
                                                className="absolute inset-0 w-full h-full bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold"
                                            >
                                                {t('settings.slides.remove')}
                                            </button>
                                        </div>
                                    )}
                                    <QRCodeManager slide={slide} onSlideChange={(field, value) => handleSlideChange(index, field, value)} />
                                </div>
                            )}
                            {slide.type === 'schedule' && (
                                <div className="space-y-4">
                                    <Input label={t('settings.slides.titleInput')} value={slide.title} onChange={e => handleSlideChange(index, 'title', e.target.value)} />
                                    {slide.scheduleItems.map((item, itemIndex) => (
                                        <div key={item.id} className="grid grid-cols-1 sm:grid-cols-4 gap-2 p-3 bg-slate-100 dark:bg-slate-800/60 rounded-md border border-slate-300 dark:border-slate-600 relative">
                                            <Input label={t('settings.slides.schedule.topic')} value={item.topic} onChange={e => handleScheduleItemChange(index, itemIndex, 'topic', e.target.value)} />
                                            <Input label={t('settings.slides.schedule.speaker')} value={item.speaker} onChange={e => handleScheduleItemChange(index, itemIndex, 'speaker', e.target.value)} />
                                            <Input label={t('settings.slides.schedule.day')} value={item.day} onChange={e => handleScheduleItemChange(index, itemIndex, 'day', e.target.value)} />
                                            <Input label={t('settings.slides.schedule.time')} value={item.time} onChange={e => handleScheduleItemChange(index, itemIndex, 'time', e.target.value)} />
                                            <button onClick={() => removeScheduleItem(index, itemIndex)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">&times;</button>
                                        </div>
                                    ))}
                                    <button onClick={() => addScheduleItem(index)} className="px-3 py-1 bg-[var(--accent-color)] text-white rounded-md hover:opacity-90 text-sm">{t('settings.slides.schedule.add')}</button>
                                </div>
                            )}
                             {slide.type === 'finance' && (
                                <div className="space-y-4">
                                    <Input label={t('settings.slides.finance.reportTitle')} value={slide.financeInfo.title} onChange={e => handleFinanceInfoChange(index, 'title', e.target.value)} />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input label={t('settings.slides.finance.initialBalance')} type="number" value={slide.financeInfo.lastBalance ?? ''} onChange={e => handleFinanceInfoChange(index, 'lastBalance', e.target.value)} />
                                        <Input label={t('settings.slides.finance.income')} type="number" value={slide.financeInfo.income ?? ''} onChange={e => handleFinanceInfoChange(index, 'income', e.target.value)} />
                                        <Input label={t('settings.slides.finance.expense')} type="number" value={slide.financeInfo.expense ?? ''} onChange={e => handleFinanceInfoChange(index, 'expense', e.target.value)} />
                                        <div className="flex flex-col">
                                            <label className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-300">{t('settings.slides.finance.finalBalance')}</label>
                                            <p className="bg-slate-200 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-md p-2 font-mono">{slide.financeInfo.currentBalance.toLocaleString('id-ID')}</p>
                                        </div>
                                    </div>
                                    <Input label={t('settings.slides.finance.donationTarget')} type="number" value={slide.financeInfo.donationTarget ?? ''} onChange={e => handleFinanceInfoChange(index, 'donationTarget', e.target.value)} />
                                </div>
                            )}
                        </div>
                    </CollapsibleSection>
                ))}
                {localSettings.slides.length === 0 && (
                     <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">{t('settings.slides.empty')}</p>
                )}
            </div>
        </CollapsibleSection>
    );
};
