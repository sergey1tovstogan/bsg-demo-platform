import { InteractiveDiagramSection as InteractiveDiagramType, ClickAction } from '@/lib/template-types';
import { useNavigation } from '@/components/template-navigation/NavigationProvider';

interface InteractiveDiagramSectionProps {
    section: InteractiveDiagramType;
}

export function InteractiveDiagramSection({ section }: InteractiveDiagramSectionProps) {
    const { navigateToPage, showPopup } = useNavigation();

    const handleClick = (action: ClickAction) => {
        switch (action.type) {
            case 'navigate_to_subpage':
                if (action.target) {
                    navigateToPage(action.target);
                }
                break;
            case 'show_popup':
                if (action.popup_id) {
                    showPopup(action.popup_id);
                }
                break;
            case 'external_link':
                if (action.target) {
                    if (action.open_in_new_tab) {
                        window.open(action.target, '_blank', 'noopener,noreferrer');
                    } else {
                        window.location.href = action.target;
                    }
                }
                break;
        }
    };

    return (
        <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 my-8">
            <div className="relative w-full">
                <img
                    src={section.image}
                    alt="Interactive Diagram"
                    className="w-full h-auto"
                />

                {/* Hotspots */}
                {section.hotspots.map((hotspot, index) => {
                    const diameter = hotspot.radius * 2;
                    return (
                        <button
                            key={`${hotspot.x}-${hotspot.y}-${index}`}
                            onClick={() => handleClick(hotspot.click_action)}
                            title={hotspot.hover_text}
                            className="absolute group z-10 -translate-x-1/2 -translate-y-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full cursor-pointer"
                            style={{
                                left: `${hotspot.x}%`,
                                top: `${hotspot.y}%`,
                                width: `${diameter}px`,
                                height: `${diameter}px`,
                            }}
                            aria-label={hotspot.hover_text || `Hotspot ${index + 1}`}
                        >
                            {/* Invisible hotspot - cursor changes on hover */}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
