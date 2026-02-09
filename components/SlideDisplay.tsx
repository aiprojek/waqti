
import React from 'react';
import type { Slide } from '../types';
import { QRCodeDisplay } from './slides/QRCodeDisplay';
import { FinanceSlideDisplay } from './slides/FinanceSlide';
import { ScheduleSlideDisplay } from './slides/ScheduleSlide';
import { ImageSlideDisplay } from './slides/ImageSlide';
import { TextSlideDisplay } from './slides/TextSlide';
import { FridayOfficerSlideDisplay } from './slides/FridayOfficerSlide';

interface SlideDisplayProps {
    slide: Slide;
}

export const SlideDisplay: React.FC<SlideDisplayProps> = ({ slide }) => {
    if (!slide) return null;

    const renderSlideContent = () => {
        switch (slide.type) {
            case 'finance':
                return <FinanceSlideDisplay slide={slide} />;
            case 'schedule':
                return <ScheduleSlideDisplay slide={slide} />;
            case 'image':
                return <ImageSlideDisplay slide={slide} />;
            case 'friday-officer':
                return <FridayOfficerSlideDisplay slide={slide} />;
            case 'text':
            default:
                return <TextSlideDisplay slide={slide} />;
        }
    };

    // Determine if the QR code is handled internally by the slide component (Side Layout)
    const isSideQr = slide.type === 'text' && slide.qrCodeUrl && (slide.qrCodePosition === 'side-left' || slide.qrCodePosition === 'side-right');

    return (
        <div className="w-full max-h-full relative overflow-y-auto">
            {renderSlideContent()}
            {/* Render floating QR Code only if it's not a side-by-side layout handled by TextSlide */}
            {!isSideQr && <QRCodeDisplay slide={slide} />}
        </div>
    );
};
