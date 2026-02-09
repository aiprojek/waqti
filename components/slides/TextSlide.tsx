import React from 'react';
import type { TextSlide } from '../../types';

declare const DOMPurify: any;

interface TextSlideProps {
    slide: TextSlide;
}

export const TextSlideDisplay: React.FC<TextSlideProps> = ({ slide }) => {
    const isSideQr = slide.qrCodeUrl && (slide.qrCodePosition === 'side-left' || slide.qrCodePosition === 'side-right');

    const QrComponent = () => (
        <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-2xl w-48 h-48 md:w-56 md:h-56">
            <img src={slide.qrCodeUrl!} alt="QR Code" className="w-full h-full object-contain" />
        </div>
    );

    // Sanitize content to prevent XSS
    const sanitizedContent = typeof DOMPurify !== 'undefined' 
        ? DOMPurify.sanitize(slide.content || '') 
        : (slide.content || '');

    const TextComponent = () => (
            <div className={`w-full ${isSideQr ? 'max-w-3xl text-left' : 'max-w-5xl text-center'}`}>
            {slide.title && (
                <h1 className="text-4xl md:text-6xl font-bold text-shadow-lg mb-4" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.7)'}}>
                    {slide.title}
                </h1>
            )}
            <div 
                className="ql-editor text-xl md:text-3xl text-slate-800 dark:text-white/90 text-shadow" 
                style={{textShadow: '1px 1px 5px rgba(0,0,0,0.7)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: 'none', border: 'none' }}
                dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
            />
        </div>
    );
    
    if (isSideQr) {
            return (
            <div className="w-full flex justify-center items-center p-8 gap-8">
                    {slide.qrCodePosition === 'side-left' && <QrComponent />}
                    <TextComponent />
                    {slide.qrCodePosition === 'side-right' && <QrComponent />}
            </div>
        )
    }

    return (
        <div className="w-full flex flex-col justify-center items-center p-8">
            <TextComponent />
        </div>
    );
};
