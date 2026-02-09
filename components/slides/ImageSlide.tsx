import React from 'react';
import type { ImageSlide } from '../../types';
import { useSettings } from '../../contexts/SettingsContext';
import { useBlobUrl } from '../../hooks/useBlobUrl';

interface ImageSlideProps {
    slide: ImageSlide;
}

export const ImageSlideDisplay: React.FC<ImageSlideProps> = ({ slide }) => {
    const { settings } = useSettings();
    const resolvedUrl = useBlobUrl(slide.imageUrl);

    return (
        <div className="w-full flex items-center justify-center p-4">
            <img
                src={resolvedUrl || slide.imageUrl}
                alt={'Slide Image'}
                className={`max-w-full max-h-full object-contain rounded-lg shadow-lg ${
                    settings.displayMode === 'portrait' ? 'w-full h-auto' : 'h-full w-auto'
                }`}
            />
        </div>
    );
};
