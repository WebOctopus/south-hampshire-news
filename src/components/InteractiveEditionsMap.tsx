import React, { useState, useRef, useEffect } from 'react';
import { X, MapPin, Home, Mail } from 'lucide-react';
import { editionAreas, EditionArea } from '@/data/editionAreas';
import { cn } from '@/lib/utils';

// Import map images
import mapBackground from '@/assets/map/map-background.png';

// Import highlight images dynamically
const highlightImages: Record<string, string> = {
  '870.png': new URL('@/assets/map/870.png', import.meta.url).href,
  '868.png': new URL('@/assets/map/868.png', import.meta.url).href,
  '863.png': new URL('@/assets/map/863.png', import.meta.url).href,
  '861.png': new URL('@/assets/map/861.png', import.meta.url).href,
  '837.png': new URL('@/assets/map/837.png', import.meta.url).href,
  '774.png': new URL('@/assets/map/774.png', import.meta.url).href,
  '770.png': new URL('@/assets/map/770.png', import.meta.url).href,
  '763.png': new URL('@/assets/map/763.png', import.meta.url).href,
  '758.png': new URL('@/assets/map/758.png', import.meta.url).href,
  '749.png': new URL('@/assets/map/749.png', import.meta.url).href,
  '711.png': new URL('@/assets/map/711.png', import.meta.url).href,
  '708.png': new URL('@/assets/map/708.png', import.meta.url).href,
  '665.png': new URL('@/assets/map/665.png', import.meta.url).href,
  '662.png': new URL('@/assets/map/662.png', import.meta.url).href,
};

interface InteractiveEditionsMapProps {
  onAreaClick?: (areaId: number) => void;
  className?: string;
}

const InteractiveEditionsMap: React.FC<InteractiveEditionsMapProps> = ({ 
  onAreaClick,
  className 
}) => {
  const [selectedArea, setSelectedArea] = useState<EditionArea | null>(null);
  const [hoveredArea, setHoveredArea] = useState<EditionArea | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleAreaClick = (area: EditionArea) => {
    setSelectedArea(area);
    onAreaClick?.(area.id);
  };

  const handleClose = () => {
    setSelectedArea(null);
  };

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {/* Map Container with aspect ratio */}
      <div className="relative w-full" style={{ paddingBottom: '52.89%' /* 595/1125 */ }}>
        {/* Background Map */}
        <img
          src={mapBackground}
          alt="Distribution Areas Map - 14 Areas across South Hampshire"
          className="absolute inset-0 w-full h-full object-contain rounded-lg"
        />

        {/* Highlighted Area Overlay */}
        {(selectedArea || hoveredArea) && (
          <img
            src={highlightImages[(selectedArea || hoveredArea)!.highlightImage]}
            alt={`${(selectedArea || hoveredArea)!.name} highlighted`}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-200"
            style={{ opacity: selectedArea ? 1 : 0.7 }}
          />
        )}

        {/* Clickable Area Buttons */}
        {editionAreas.map((area) => (
          <button
            key={area.id}
            onClick={() => handleAreaClick(area)}
            onMouseEnter={() => setHoveredArea(area)}
            onMouseLeave={() => setHoveredArea(null)}
            className={cn(
              "absolute w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center",
              "text-white text-xs md:text-sm font-bold",
              "transition-all duration-200 transform hover:scale-110",
              "focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2",
              "shadow-lg hover:shadow-xl",
              selectedArea?.id === area.id && "ring-2 ring-white scale-110"
            )}
            style={{
              top: `${area.buttonPosition.top}%`,
              left: `${area.buttonPosition.left}%`,
              backgroundColor: area.color,
              transform: 'translate(-50%, -50%)',
            }}
            aria-label={`View ${area.name} - ${area.homes.toLocaleString()} homes`}
          >
            {area.id}
          </button>
        ))}

        {/* Hover Tooltip */}
        {hoveredArea && !selectedArea && (
          <div
            className="absolute z-20 bg-white rounded-lg shadow-xl p-3 pointer-events-none min-w-[180px]"
            style={{
              top: `${hoveredArea.buttonPosition.top}%`,
              left: `${hoveredArea.buttonPosition.left}%`,
              transform: 'translate(-50%, -120%)',
            }}
          >
            <p className="font-bold text-community-navy text-sm">{hoveredArea.name}</p>
            <p className="text-xs text-muted-foreground">{hoveredArea.postcodes}</p>
            <p className="text-community-green font-semibold text-sm mt-1">
              {hoveredArea.homes.toLocaleString()} homes
            </p>
          </div>
        )}
      </div>

      {/* Selected Area Info Panel */}
      {selectedArea && (
        <div className="mt-4 bg-white rounded-xl shadow-xl border overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div 
            className="p-4 text-white relative"
            style={{ backgroundColor: selectedArea.color }}
          >
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              aria-label="Close details"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center">
                <span className="text-xl font-bold">{selectedArea.id}</span>
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">{selectedArea.name}</h3>
                <p className="text-white/90 text-sm">{selectedArea.postcodes}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-community-green" />
                <div>
                  <p className="text-2xl font-bold text-community-green">
                    {selectedArea.homes.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Homes Reached</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  {selectedArea.leafletService.available ? (
                    <>
                      <p className="text-2xl font-bold text-primary">
                        {selectedArea.leafletService.homes?.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Leaflet Homes {selectedArea.leafletService.note && `(${selectedArea.leafletService.note})`}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-muted-foreground">Not Available</p>
                      <p className="text-xs text-muted-foreground">Leaflet Service</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Coverage Details */}
            <div>
              <h4 className="font-semibold text-community-navy mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Coverage Details
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {selectedArea.coverageDetails}
              </p>
            </div>

            {/* Leaflet Service Badge */}
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Leaflet Service</span>
                {selectedArea.leafletService.available ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-community-green/10 text-community-green text-sm font-semibold">
                    ✓ Available
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-600 text-sm font-semibold">
                    ✗ Not Available
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <p className="text-sm text-muted-foreground text-center mt-4">
        Click on a numbered area to view details • 14 Distribution Areas across South Hampshire
      </p>
    </div>
  );
};

export default InteractiveEditionsMap;
