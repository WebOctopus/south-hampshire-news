import React, { useState, useEffect } from 'react';
import { X, MapPin, Home, Mail, Newspaper, Target, Mailbox, Calendar } from 'lucide-react';
import { editionAreas, EditionArea, getTotalHomes } from '@/data/editionAreas';
import { cn } from '@/lib/utils';

// Import map images
import mapBackground from '@/assets/map/map-background.png';

// Import ALL 23 PNG files for debug grid
const allPngFiles = [
  '107.png', '205.png', '319.png', '325.png', '328.png', '332.png',
  '450.png', '451.png', '655.png', '662.png', '665.png', '708.png',
  '711.png', '749.png', '758.png', '763.png', '770.png', '774.png',
  '837.png', '861.png', '863.png', '868.png', '870.png'
];

// Import highlight images dynamically - ALL 23 files
const highlightImages: Record<string, string> = {
  '107.png': new URL('@/assets/map/107.png', import.meta.url).href,
  '205.png': new URL('@/assets/map/205.png', import.meta.url).href,
  '319.png': new URL('@/assets/map/319.png', import.meta.url).href,
  '325.png': new URL('@/assets/map/325.png', import.meta.url).href,
  '328.png': new URL('@/assets/map/328.png', import.meta.url).href,
  '332.png': new URL('@/assets/map/332.png', import.meta.url).href,
  '450.png': new URL('@/assets/map/450.png', import.meta.url).href,
  '451.png': new URL('@/assets/map/451.png', import.meta.url).href,
  '655.png': new URL('@/assets/map/655.png', import.meta.url).href,
  '662.png': new URL('@/assets/map/662.png', import.meta.url).href,
  '665.png': new URL('@/assets/map/665.png', import.meta.url).href,
  '708.png': new URL('@/assets/map/708.png', import.meta.url).href,
  '711.png': new URL('@/assets/map/711.png', import.meta.url).href,
  '749.png': new URL('@/assets/map/749.png', import.meta.url).href,
  '758.png': new URL('@/assets/map/758.png', import.meta.url).href,
  '763.png': new URL('@/assets/map/763.png', import.meta.url).href,
  '770.png': new URL('@/assets/map/770.png', import.meta.url).href,
  '774.png': new URL('@/assets/map/774.png', import.meta.url).href,
  '837.png': new URL('@/assets/map/837.png', import.meta.url).href,
  '861.png': new URL('@/assets/map/861.png', import.meta.url).href,
  '863.png': new URL('@/assets/map/863.png', import.meta.url).href,
  '868.png': new URL('@/assets/map/868.png', import.meta.url).href,
  '870.png': new URL('@/assets/map/870.png', import.meta.url).href,
};

const sellingPoints = [
  { title: "The Biggest, Little Local Magazine", icon: Newspaper },
  { title: "Target Where to Advertise", icon: Target, underline: true },
  { title: "100% Letterbox Delivered", icon: Mailbox },
  { 
    title: "Bi-monthly Print:", 
    subtitle: "Jan | Mar | May | Jul | Sep | Nov", 
    subtitle2: "Feb | Apr | Jun | Aug | Oct | Dec",
    icon: Calendar 
  },
];

interface InteractiveMediaInfoProps {
  onAreaSelect?: (areaId: number) => void;
  className?: string;
}

const InteractiveMediaInfo: React.FC<InteractiveMediaInfoProps> = ({ 
  onAreaSelect,
  className 
}) => {
  const [selectedArea, setSelectedArea] = useState<EditionArea | null>(null);
  const [hoveredArea, setHoveredArea] = useState<EditionArea | null>(null);

  const handleAreaClick = (area: EditionArea) => {
    setSelectedArea(area);
    onAreaSelect?.(area.id);
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
    <section className={cn("py-12 bg-gradient-to-b from-slate-50 to-white", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Dynamic based on selection */}
        <div className="text-center mb-8">
          {selectedArea ? (
            <h2 className="text-xl md:text-2xl font-heading font-bold">
              <span className="text-community-navy">Area {selectedArea.id}</span>
              <span className="mx-2 text-muted-foreground">-</span>
              <span className="text-community-green">{selectedArea.name}</span>
              <span className="mx-2 text-muted-foreground">-</span>
              <span className="text-community-navy">{selectedArea.homes.toLocaleString()}</span>
            </h2>
          ) : (
            <h2 className="text-xl md:text-2xl font-heading font-bold text-community-navy">
              Welcome to Discover's Interactive Media Info - <span className="text-community-green">CLICK ANY BUTTON</span>
            </h2>
          )}
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_220px] gap-6 items-start">
          
          {/* Left Column - Edition List */}
          <div className="bg-white rounded-xl shadow-lg p-4 order-2 lg:order-1">
            <div className="space-y-1">
              {editionAreas.map((area) => (
                <button
                  key={area.id}
                  onClick={() => handleAreaClick(area)}
                  onMouseEnter={() => setHoveredArea(area)}
                  onMouseLeave={() => setHoveredArea(null)}
                  className={cn(
                    "w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-200 text-left",
                    "hover:bg-gray-50 hover:shadow-sm",
                    selectedArea?.id === area.id && "bg-gray-100 ring-2 ring-community-green/30"
                  )}
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold shadow-sm"
                    style={{ backgroundColor: area.color }}
                  >
                    {area.id}
                  </div>
                  <span className="text-xs font-medium text-community-navy leading-tight flex-1">
                    {area.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Center Column - Interactive Map */}
          <div className="order-1 lg:order-2">
            <div className="relative bg-white rounded-xl shadow-lg p-4">
              {/* DEBUG GRID - All 23 PNG Files */}
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
                <p className="text-sm font-bold text-yellow-800 mb-1">🔧 DEBUG MODE: All 23 PNG Files</p>
                <p className="text-xs text-yellow-700">Compare these shapes to your reference map and note which filename matches each area number.</p>
              </div>
              
              <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {allPngFiles.map((filename, index) => (
                  <div 
                    key={filename}
                    className="relative bg-slate-100 rounded-lg p-2 border-2 border-slate-300 hover:border-community-green transition-colors"
                  >
                    <div className="bg-community-navy text-white text-xs font-bold px-2 py-1 rounded mb-2 text-center">
                      #{index + 1}: {filename}
                    </div>
                    <div className="aspect-square flex items-center justify-center bg-white rounded">
                      <img
                        src={highlightImages[filename]}
                        alt={filename}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Reference note */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-300 rounded-lg">
                <p className="text-sm font-bold text-blue-800 mb-1">📋 How to identify:</p>
                <p className="text-xs text-blue-700">Look at each shape above and compare to your reference map. Then tell me which filename corresponds to which area number (1-14).</p>
                <p className="text-xs text-blue-700 mt-1">Example: "Area 1 (Southampton) = 319.png, Area 2 (Eastleigh) = 107.png"</p>
              </div>
            </div>

            {/* Selected Area Detail Panel */}
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
          </div>

          {/* Right Column - Selling Points */}
          <div className="bg-white rounded-xl shadow-lg p-4 order-3">
            <div className="space-y-4">
              {sellingPoints.map((point, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="bg-community-green/10 rounded-full p-2 flex-shrink-0">
                    <point.icon className="h-5 w-5 text-community-green" />
                  </div>
                  <div>
                    <p className={cn(
                      "font-semibold text-community-navy text-sm",
                      point.underline && "underline decoration-community-green decoration-2 underline-offset-2"
                    )}>
                      {point.title}
                    </p>
                    {point.subtitle && (
                      <p className="text-xs text-muted-foreground mt-1">{point.subtitle}</p>
                    )}
                    {point.subtitle2 && (
                      <p className="text-xs text-muted-foreground">{point.subtitle2}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Total Stats */}
              <div className="mt-6 pt-4 border-t">
                <div className="text-center">
                  <p className="text-3xl font-bold text-community-green">
                    {getTotalHomes().toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Homes Reached</p>
                </div>
              </div>

              {/* Partner Logos Placeholder */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-center text-muted-foreground mb-3">Distribution Partners</p>
                <div className="flex flex-col gap-2">
                  <div className="h-10 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-400">Hampshire Leaflets</span>
                  </div>
                  <div className="h-10 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-400">Royal Mail</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <p className="text-sm text-muted-foreground text-center mt-6">
          Click on a numbered button or area name to view detailed distribution information
        </p>
      </div>
    </section>
  );
};

export default InteractiveMediaInfo;
