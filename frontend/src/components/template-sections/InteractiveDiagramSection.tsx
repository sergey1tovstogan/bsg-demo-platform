import React from 'react';
import { useClickAction } from '@/hooks/useClickAction';
import { InteractiveDiagramSection as InteractiveDiagramType } from '@/lib/template-types';

interface InteractiveDiagramSectionProps {
    section: InteractiveDiagramType;
}

export function InteractiveDiagramSection({ section }: InteractiveDiagramSectionProps) {
    const { handleClick } = useClickAction();

    return (
        <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 my-8">
            <div className="relative w-full aspect-video">
                <img
                    src={section.image}
                    alt="Interactive Diagram"
                    className="w-full h-full object-cover"
                />

                {/* Hotspots */}
                {section.hotspots.map((hotspot, index) => {
                    const diameter = hotspot.radius * 2;
                    return (
                        <button
                            key={`${hotspot.x}-${hotspot.y}-${index}`}
                            onClick={() => handleClick(hotspot.click_action)}
                            title={hotspot.hover_text}
                            className="absolute group z-10 -translate-x-1/2 -translate-y-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
                            style={{
                                left: `${hotspot.x}%`,
                                top: `${hotspot.y}%`,
                                width: `${diameter}px`,
                                height: `${diameter}px`,
                            }}
                            aria-label={hotspot.hover_text || `Hotspot ${index + 1}`}
                        >
                            {/* Hotspot Visuals */}
                            <div className="w-full h-full relative">
                                <div className="absolute inset-0 bg-blue-500/30 rounded-full border-2 border-blue-500 animate-pulse group-hover:bg-blue-500/50 group-hover:scale-110 transition-all duration-300" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full shadow-sm" />
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
