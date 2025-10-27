import React, { useRef, useEffect, useState } from 'react';
import type { Slide, QRCodePosition } from '../../types';
// FIX: Replaced DEFAULT_SETTINGS with getDefaultSettings and useLanguage hook to get dynamic default settings.
import { getDefaultSettings } from '../../constants';
import { useLanguage } from '../../contexts/LanguageContext';
import { t } from '../../i18n';

// Let TypeScript know that Quill is available globally from the CDN script
declare var Quill: any;

// --- Quill Editor Component ---
interface QuillEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export const QuillEditor: React.FC<QuillEditorProps> = ({ value, onChange }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const quillInstance = useRef<any>(null);

    useEffect(() => {
        if (editorRef.current && !quillInstance.current) {
            const toolbarOptions = [
                ['bold', 'italic', 'underline'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'align': '' }, { 'align': 'center' }, { 'align': 'right' }, { 'align': 'justify' }],
                [{ 'color': [] }, { 'background': [] }],
                ['clean']
            ];

            quillInstance.current = new Quill(editorRef.current, {
                theme: 'snow',
                modules: {
                    toolbar: toolbarOptions
                }
            });

            // FIX (Robust): Use a setTimeout to ensure blur() is called
            // after any potential auto-focus logic from Quill has run. This
            // prevents a race condition that caused the page to scroll.
            setTimeout(() => {
                if (quillInstance.current) {
                    quillInstance.current.blur();
                }
            }, 0);

            if (value) {
                 quillInstance.current.clipboard.dangerouslyPasteHTML(value);
            }

            quillInstance.current.on('text-change', (_delta: any, _oldDelta: any, source: string) => {
                if (source === 'user') {
                    onChange(quillInstance.current.root.innerHTML);
                }
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="quill-editor-container">
            <div ref={editorRef} />
        </div>
    );
};


// Reusable components for the form
export const Input = ({ label, help, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; help?: string }) => (
    <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-300">{label}</label>
        <input {...props} className="bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md p-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] disabled:opacity-50" />
        {help && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{help}</p>}
    </div>
);

export const Select = ({ label, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }) => (
    <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-300">{label}</label>
        <select {...props} className="bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md p-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] appearance-none">
            {children}
        </select>
    </div>
);

export const Checkbox = ({ label, help, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; help?: string }) => (
    <div>
        <label className="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" {...props} className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-[var(--accent-color)] focus:ring-[var(--accent-color)]" />
            <span className="text-slate-700 dark:text-slate-300">{label}</span>
        </label>
        {help && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-7">{help}</p>}
    </div>
);


// --- Sound Picker Component ---
interface SoundPickerProps {
    name: string;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export const SoundPicker: React.FC<SoundPickerProps> = ({ name, value, onChange, disabled }) => {
    const { language } = useLanguage();
    const DEFAULT_SETTINGS = getDefaultSettings(language);
    const [soundType, setSoundType] = useState<'default' | 'url' | 'upload'>('default');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [status, setStatus] = useState<{message: string, type: 'success' | 'error' | 'info'}>({message: '', type: 'info'});
    const statusColor = {
        success: 'text-green-500 dark:text-green-400',
        error: 'text-red-500 dark:text-red-400',
        info: 'text-slate-500 dark:text-slate-400'
    }[status.type];

    useEffect(() => {
        const isDefault = value === DEFAULT_SETTINGS.adhanAlarmSound;
        const isData = value.startsWith('data:audio');
        if (isDefault) {
            setSoundType('default');
        } else if (isData) {
            setSoundType('upload');
        } else {
            setSoundType('url');
        }
    }, [value, DEFAULT_SETTINGS.adhanAlarmSound]);


    const handleTypeChange = (type: 'default' | 'url' | 'upload') => {
        setSoundType(type);
        if (type === 'default') {
            onChange(DEFAULT_SETTINGS.adhanAlarmSound);
        } else {
            onChange('');
        }
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
        if (file.size > MAX_FILE_SIZE) {
            setStatus({message: 'Ukuran file maks 2MB.', type: 'error'});
            return;
        }
        if (!file.type.startsWith('audio/')) {
            setStatus({message: 'Format file tidak didukung.', type: 'error'});
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            onChange(reader.result as string);
            setStatus({message: 'Audio berhasil diunggah.', type: 'success'});
        };
        reader.onerror = () => setStatus({message: 'Gagal membaca file.', type: 'error'});
        reader.readAsDataURL(file);
    };

    const isDataUrl = value.startsWith('data:audio');

    return (
        <div className={`space-y-3 transition-opacity ${disabled ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-4">
                {(['default', 'url', 'upload'] as const).map(type => (
                    <label key={type} className="flex items-center space-x-2 cursor-pointer text-sm">
                        <input 
                            type="radio" 
                            name={name}
                            value={type} 
                            checked={soundType === type} 
                            onChange={() => handleTypeChange(type)} 
                            disabled={disabled}
                            className="w-4 h-4 text-[var(--accent-color)] focus:ring-[var(--accent-color)]" 
                        />
                        <span>{t(`settings.alarm.sound.${type}`)}</span>
                    </label>
                ))}
            </div>

            {soundType === 'url' && (
                <Input 
                    label="URL Suara Alarm" 
                    value={isDataUrl ? '' : value} 
                    onChange={e => onChange(e.target.value)} 
                    placeholder="https://..." 
                    disabled={disabled}
                />
            )}
            {soundType === 'upload' && (
                <div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="audio/*"
                        className="hidden"
                        disabled={disabled}
                    />
                    <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={disabled}
                        className="w-full px-4 py-2 bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-slate-800 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                        Pilih File Audio...
                    </button>
                    {status.message && <p className={`text-xs mt-1 px-1 ${statusColor}`}>{status.message}</p>}
                </div>
            )}
            
            {(value && soundType !== 'default') && (
                <div className="flex items-center gap-3">
                    <audio controls src={value} className="w-full max-w-xs h-8" />
                    <button 
                        onClick={() => handleTypeChange('default')} 
                        className="text-xs text-red-500 hover:underline"
                        disabled={disabled}
                    >
                        Hapus
                    </button>
                </div>
            )}
        </div>
    );
};


interface QRCodeManagerProps {
    slide: Slide;
    onSlideChange: (field: keyof Slide, value: any) => void;
}

export const QRCodeManager: React.FC<QRCodeManagerProps> = ({ slide, onSlideChange }) => {
    const qrCodeFileInputRef = useRef<HTMLInputElement>(null);
    const [qrUploadStatus, setQrUploadStatus] = useState('');

    const handleQRCodeFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 1024 * 1024) { // 1MB limit
            setQrUploadStatus('Error: Ukuran file maks 1MB.');
            return;
        }
        if (!file.type.startsWith('image/')) {
            setQrUploadStatus('Error: Format file tidak didukung.');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            onSlideChange('qrCodeUrl', reader.result as string);
            setQrUploadStatus('Berhasil diunggah.');
        };
        reader.onerror = () => setQrUploadStatus('Error: Gagal membaca file.');
        reader.readAsDataURL(file);
    };

    return (
        <div className="mt-4 pt-4 border-t border-slate-300 dark:border-slate-600 space-y-3">
            <h5 className="font-semibold">Kode QR (Opsional)</h5>
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-grow">
                    <button
                        type="button"
                        onClick={() => qrCodeFileInputRef.current?.click()}
                        className="w-full px-4 py-2 bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-slate-800 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                        Unggah Gambar QR...
                    </button>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={qrCodeFileInputRef}
                        onChange={handleQRCodeFileChange}
                    />
                    {qrUploadStatus && <p className="text-xs mt-1">{qrUploadStatus}</p>}
                </div>
                {slide.qrCodeUrl && (
                     <div className="relative group w-16 h-16 rounded-md overflow-hidden border border-slate-300 dark:border-slate-600 flex-shrink-0">
                        <img src={slide.qrCodeUrl} alt="QR Code Preview" className="w-full h-full object-cover" />
                        <button 
                            onClick={() => onSlideChange('qrCodeUrl', undefined)}
                            className="absolute inset-0 w-full h-full bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold"
                        >
                            Hapus
                        </button>
                    </div>
                )}
            </div>
             <Select
                label="Posisi Kode QR"
                value={slide.qrCodePosition || 'bottom-right'}
                onChange={e => onSlideChange('qrCodePosition', e.target.value as QRCodePosition)}
            >
                <option value="bottom-right">Kanan Bawah</option>
                <option value="bottom-left">Kiri Bawah</option>
                <option value="top-right">Kanan Atas</option>
                <option value="top-left">Kiri Atas</option>
                <option value="side-right">Sisi Kanan (Teks)</option>
                <option value="side-left">Sisi Kiri (Teks)</option>
            </Select>
        </div>
    );
}

const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
);

interface CollapsibleSectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="bg-white/50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 bg-slate-100/50 dark:bg-slate-900/20 hover:bg-slate-200/50 dark:hover:bg-slate-900/40 transition-colors"
                aria-expanded={isOpen}
            >
                <h3 className="text-lg font-bold">{title}</h3>
                <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                    <ChevronDownIcon />
                </span>
            </button>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[9999px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};