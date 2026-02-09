import React from 'react';
import type { Slide } from '../../types';
import { getQrCodePositionClass } from './Shared';

export const QRCodeDisplay: React.FC<{ slide: Slide }> = ({ slide }) => {
    if (!slide.qrCodeUrl) return null;

    const positionClass = getQrCodePositionClass(slide.qrCodePosition);

    return (
        <div className={`absolute ${positionClass} z-20 p-2 bg-white rounded-lg shadow-2xl w-28 h-28 md:w-40 md:h-40`}>
            <img src={slide.qrCodeUrl} alt="QR Code" className="w-full h-full object-contain" />
        </div>
    );
};
