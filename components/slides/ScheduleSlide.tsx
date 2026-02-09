import React, { useState, useEffect } from 'react';
import type { ScheduleSlide, ScheduleItem } from '../../types';
import { t } from '../../i18n';
import { BookOpenIcon, SpeakerIcon, ClockIcon } from './Shared';

const ScheduleCard: React.FC<{ item: ScheduleItem }> = ({ item }) => (
    <div className="bg-gradient-to-br from-black/30 to-black/40 p-6 rounded-2xl border border-white/20 shadow-lg flex flex-col gap-4 w-full max-w-md">
        <div className="flex items-start gap-4">
            <div className="text-[var(--accent-color)] mt-1"><BookOpenIcon/></div>
            <div>
                <p className="text-sm uppercase text-white/70 tracking-wider">{t('settings.slides.schedule.topic')}</p>
                <h2 className="text-2xl font-bold text-white">{item.topic}</h2>
            </div>
        </div>
        <div className="flex items-start gap-4">
            <div className="text-[var(--accent-color)] mt-1"><SpeakerIcon/></div>
            <div>
                <p className="text-sm uppercase text-white/70 tracking-wider">{t('settings.slides.schedule.speaker')}</p>
                <h3 className="text-xl font-medium text-white/90">{item.speaker}</h3>
            </div>
        </div>
        <div className="flex items-start gap-4 mt-2 pt-4 border-t border-white/20">
            <div className="text-[var(--accent-color)] mt-1"><ClockIcon/></div>
            <div>
                <p className="text-sm uppercase text-white/70 tracking-wider">{t('settings.slides.schedule.time')}</p>
                <p className="text-xl font-semibold text-white/90">{item.day}, {item.time}</p>
            </div>
        </div>
    </div>
);

const ScheduleCarousel: React.FC<{ items: ScheduleItem[] }> = ({ items }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        if (items.length <= 1) return;

        const timer = setInterval(() => {
            setActiveIndex(prevIndex => (prevIndex + 1) % items.length);
        }, 5000); // Rotate every 5 seconds

        return () => clearInterval(timer);
    }, [items.length]);

    return (
        <div className="relative w-full h-[450px] mt-4 flex items-center justify-center overflow-hidden">
            {items.map((item, index) => {
                const totalItems = items.length;
                let offset = index - activeIndex;

                // Handle circular wrapping
                if (offset > totalItems / 2) {
                    offset -= totalItems;
                }
                if (offset < -totalItems / 2) {
                    offset += totalItems;
                }

                const isActive = offset === 0;
                const isAdjacent = Math.abs(offset) === 1;

                const style: React.CSSProperties = {
                    transform: `translateX(${offset * 55}%) scale(${isActive ? 1.1 : 0.7})`,
                    opacity: isActive ? 1 : (isAdjacent ? 0.5 : 0),
                    zIndex: isActive ? 10 : 0,
                    pointerEvents: isActive ? 'auto' : 'none',
                    transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                };
                
                return (
                    <div
                        key={item.id}
                        className="absolute w-full flex justify-center px-4"
                        style={style}
                    >
                        <ScheduleCard item={item} />
                    </div>
                );
            })}
        </div>
    );
};

interface ScheduleSlideProps {
    slide: ScheduleSlide;
}

export const ScheduleSlideDisplay: React.FC<ScheduleSlideProps> = ({ slide }) => {
    const useCarousel = slide.scheduleItems.length > 3;
    
    return (
        <div className="w-full flex flex-col justify-center items-center p-8">
            <div className="w-full max-w-7xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-bold text-white text-shadow-lg mb-8 text-center" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.7)'}}>
                    {slide.title}
                </h1>
                {useCarousel ? (
                    <ScheduleCarousel items={slide.scheduleItems} />
                ) : (
                    <div className="flex flex-wrap justify-center gap-6">
                        {slide.scheduleItems.map(item => (
                            <div key={item.id} className="transform hover:scale-105 transition-transform duration-300 md:basis-[45%] xl:basis-[31%] flex-grow">
                                <ScheduleCard item={item} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};