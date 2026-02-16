
import React, { useRef, useState } from 'react';
import useClock from '../hooks/useClock';
import { useSettings } from '../contexts/SettingsContext';

interface AnalogClockProps {
    size?: string; // e.g. "300px" or "100%"
}

export const AnalogClock: React.FC<AnalogClockProps> = ({ size = "100%" }) => {
    const { hours, minutes, seconds } = useClock();
    const { settings } = useSettings();

    const h = parseInt(hours);
    const m = parseInt(minutes);
    const s = parseInt(seconds);

    // --- LOGIC FIX: Continuous Rotation ---
    const [secOffset, setSecOffset] = useState(0);
    const [minOffset, setMinOffset] = useState(0);
    
    const prevSec = useRef(s);
    const prevMin = useRef(m);
    
    // Check for wrapping (e.g., 59 -> 0)
    if (s < prevSec.current) {
        setSecOffset(prev => prev + 360);
    }
    prevSec.current = s;

    if (m < prevMin.current) {
        setMinOffset(prev => prev + 360);
    }
    prevMin.current = m;

    const secondDeg = (s * 6) + secOffset;
    const minuteDeg = (m * 6 + s * 0.1) + minOffset;
    const hourDeg = (h % 12) * 30 + m * 0.5;

    return (
        <div 
            className="relative flex items-center justify-center animate-fade-in" 
            style={{ width: size, height: size, maxWidth: '100%', maxHeight: '100%', aspectRatio: '1/1' }}
        >
            <svg 
                viewBox="0 0 200 200" 
                className="w-full h-full drop-shadow-2xl"
                shapeRendering="geometricPrecision" 
            >
                <defs>
                    <linearGradient id="rimGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
                    </linearGradient>
                    {/* Shadow filter removed from hands to prevent rendering artifacts/twitching */}
                </defs>

                {/* --- 1. CLOCK FACE & RIM --- */}
                <circle cx="100" cy="100" r="98" fill="url(#rimGradient)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <circle cx="100" cy="100" r="90" fill="rgba(0,0,0,0.4)" stroke="var(--accent-color)" strokeWidth="2" strokeOpacity="0.6" />

                {/* --- 2. ORNAMENTS (Islamic Geometric Star / Rub el Hizb style) --- */}
                {/* Made slightly more visible (opacity 0.15 -> 0.25) and added fill for better aesthetics */}
                <g transform="translate(100, 100)" opacity="0.25" fill="rgba(255,255,255,0.05)" stroke="white" strokeWidth="0.5">
                    <rect x="-40" y="-40" width="80" height="80" transform="rotate(0)" />
                    <rect x="-40" y="-40" width="80" height="80" transform="rotate(45)" />
                    <circle r="30" stroke="var(--accent-color)" strokeWidth="0.5" fill="none" />
                    <circle r="55" stroke="white" strokeWidth="0.5" strokeDasharray="2 4" fill="none" opacity="0.5" />
                </g>

                <text x="100" y="65" textAnchor="middle" fill="white" fontSize="8" opacity="0.8" style={{ fontFamily: 'Amiri, serif', letterSpacing: '2px', fontWeight: 'bold' }}>
                    WAQTI
                </text>

                {/* --- 3. TICKS --- */}
                {Array.from({ length: 60 }).map((_, i) => {
                    if (i % 5 === 0) return null;
                    return (
                        <line
                            key={`min-${i}`}
                            x1="100"
                            y1="18"
                            x2="100"
                            y2="20"
                            stroke="rgba(255,255,255,0.5)"
                            strokeWidth="1"
                            transform={`rotate(${i * 6} 100 100)`}
                        />
                    );
                })}

                {Array.from({ length: 12 }).map((_, i) => {
                    const rotation = i * 30;
                    return (
                        <g key={`hr-${i}`} transform={`rotate(${rotation} 100 100)`}>
                            <line
                                x1="100"
                                y1="15"
                                x2="100"
                                y2={i % 3 === 0 ? "28" : "22"}
                                stroke={i % 3 === 0 ? "var(--accent-color)" : "white"}
                                strokeWidth={i % 3 === 0 ? "3" : "2"}
                                strokeLinecap="round"
                            />
                            {i % 3 === 0 && (
                                <text
                                    x="100"
                                    y="42"
                                    fill="white"
                                    fontSize="12"
                                    fontWeight="bold"
                                    textAnchor="middle"
                                    transform={`rotate(${-rotation} 100 42)`}
                                    style={{ fontFamily: 'ui-sans-serif, system-ui' }}
                                >
                                    {i === 0 ? 12 : i}
                                </text>
                            )}
                        </g>
                    );
                })}

                {/* --- 4. HANDS --- */}
                {/* 
                    OPTIMIZATIONS FOR SMOOTHNESS:
                    1. Removed filter="url(#shadow)" from moving parts.
                    2. Added willChange: 'transform'.
                    3. Increased minimum strokeWidth to 2 to prevent sub-pixel aliasing flickering.
                    4. Used Path logic or overlapping lines to ensure solidity.
                */}

                {/* Hour Hand */}
                <g 
                    transform={`rotate(${hourDeg} 100 100)`} 
                    style={{ 
                        transition: 'transform 0.5s cubic-bezier(0.4, 2.08, 0.55, 0.44)',
                        willChange: 'transform'
                    }}
                >
                    <path d="M100 100 L100 55" stroke="white" strokeWidth="6" strokeLinecap="round" />
                    <path d="M100 58 L100 50" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </g>

                {/* Minute Hand */}
                <g 
                    transform={`rotate(${minuteDeg} 100 100)`} 
                    style={{ 
                        transition: 'transform 0.5s cubic-bezier(0.4, 2.08, 0.55, 0.44)', 
                        willChange: 'transform'
                    }}
                >
                    {/* Main body */}
                    <path d="M100 100 L100 35" stroke="white" strokeWidth="4" strokeLinecap="round" />
                    {/* Tip - Thickened to 2px to prevent flickering/disappearing */}
                    <path d="M100 38 L100 25" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </g>

                {/* Second Hand */}
                <g 
                    transform={`rotate(${secondDeg} 100 100)`} 
                    style={{ 
                        transition: 'transform 0.2s cubic-bezier(0.4, 2.08, 0.55, 0.44)',
                        willChange: 'transform'
                    }}
                >
                    <line x1="100" y1="118" x2="100" y2="25" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
                    <circle cx="100" cy="118" r="2" fill="var(--accent-color)" />
                    <circle cx="100" cy="25" r="2" fill="var(--accent-color)" />
                </g>
                
                {/* Center Cap */}
                <circle cx="100" cy="100" r="5" fill="white" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
                <circle cx="100" cy="100" r="2" fill="var(--accent-color)" />
            </svg>
        </div>
    );
};
