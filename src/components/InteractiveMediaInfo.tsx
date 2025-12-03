import React, { useState, useEffect } from 'react';
import { X, MapPin, Home, Mail, Newspaper, Target, Mailbox, Calendar } from 'lucide-react';
import { editionAreas, EditionArea, getTotalHomes } from '@/data/editionAreas';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Import main map image
import mainMapImage from '@/assets/map/450.png';

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

// Map location labels with positions matching the reference image
const mapLabels = [
  { name: "Stockbridge", top: 15, left: 28, size: "md", dotPosition: "right", dotColor: "#4ade80" },
  { name: "Winchester", top: 24, left: 48, size: "md", dotPosition: "right", dotColor: "#4ade80" },
  { name: "Chandler's Ford", top: 34, left: 44, size: "sm" },
  { name: "Eastleigh", top: 38, left: 52, size: "sm" },
  { name: "Romsey", top: 38, left: 32, size: "md", dotPosition: "right", dotColor: "#4ade80" },
  { name: "Southampton", top: 46, left: 34, size: "lg" },
  { name: "Meon Valley", top: 32, left: 70, size: "sm" },
  { name: "Bishop's Waltham", top: 42, left: 70, size: "md", dotPosition: "left", dotColor: "#4ade80" },
  { name: "Totton", top: 56, left: 32, size: "sm" },
  { name: "Hedge End", top: 54, left: 56, size: "sm" },
  { name: "Wickham", top: 52, left: 70, size: "md", dotPosition: "left", dotColor: "#4ade80" },
  { name: "Hythe", top: 62, left: 34, size: "md", dotPosition: "right", dotColor: "#4ade80" },
  { name: "New Forest", top: 66, left: 26, size: "lg" },
  { name: "Locks Heath", top: 72, left: 56, size: "sm" },
  { name: "Fareham", top: 78, left: 70, size: "md", dotPosition: "left", dotColor: "#3b82f6" },
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
    <TooltipProvider delayDuration={100}>
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
                {/* Main Map Container */}
                <div className="relative w-full">
                  {/* Map Image */}
                  <img
                    src={mainMapImage}
                    alt="Discover Local Editions Map"
                    className="w-full h-auto"
                  />
                  
                  {/* Clickable Hotspots */}
                  {editionAreas.map((area) => (
                    <Tooltip key={area.id}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleAreaClick(area)}
                          onMouseEnter={() => setHoveredArea(area)}
                          onMouseLeave={() => setHoveredArea(null)}
                          className={cn(
                            "absolute w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center",
                            "text-white text-xs md:text-sm font-bold shadow-lg",
                            "transition-all duration-200 hover:scale-125 hover:z-10",
                            "ring-2 ring-white/50",
                            selectedArea?.id === area.id && "scale-125 ring-4 ring-white z-10",
                            hoveredArea?.id === area.id && "scale-110"
                          )}
                          style={{ 
                            backgroundColor: area.color,
                            top: `${area.buttonPosition.top}%`,
                            left: `${area.buttonPosition.left}%`,
                            transform: 'translate(-50%, -50%)'
                          }}
                          aria-label={`Select ${area.name} edition`}
                        >
                          {area.id}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent 
                        side="top" 
                        className="bg-white border shadow-xl px-3 py-2"
                      >
                        <div className="text-center">
                          <p className="font-bold text-community-navy">
                            Area {area.id} - {area.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {area.homes.toLocaleString()} homes
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {area.postcodes}
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}

                  {/* Location Name Labels */}
                  {mapLabels.map((label, index) => (
                    <div
                      key={index}
                      className={cn(
                        "absolute flex items-center gap-1 pointer-events-none",
                        label.size === "lg" && "text-sm md:text-base font-bold",
                        label.size === "md" && "text-xs md:text-sm font-semibold",
                        label.size === "sm" && "text-[10px] md:text-xs font-medium"
                      )}
                      style={{
                        top: `${label.top}%`,
                        left: `${label.left}%`,
                        transform: 'translate(-50%, -50%)',
                        color: '#1e3a5f',
                        textShadow: '0 0 3px white, 0 0 3px white, 0 0 3px white'
                      }}
                    >
                      {label.dotPosition === 'left' && label.dotColor && (
                        <span 
                          className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: label.dotColor }}
                        />
                      )}
                      <span>{label.name}</span>
                      {label.dotPosition === 'right' && label.dotColor && (
                        <span 
                          className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: label.dotColor }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Area Details & Selling Points */}
            <div className="bg-white rounded-xl shadow-lg p-4 order-3 space-y-4">
              {/* Selected Area Detail Panel - Shows when area is selected (NOW ON TOP) */}
              {selectedArea && (
                <div className="pb-4 border-b animate-in slide-in-from-top-4 duration-300">
                  {/* Header */}
                  <div 
                    className="p-3 text-white relative rounded-lg mb-3"
                    style={{ backgroundColor: selectedArea.color }}
                  >
                    <button
                      onClick={handleClose}
                      className="absolute top-2 right-2 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                      aria-label="Close details"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <div className="flex items-center gap-2">
                      <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold">{selectedArea.id}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-sm leading-tight">{selectedArea.name}</h3>
                        <p className="text-white/90 text-xs">{selectedArea.postcodes}</p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    {/* Stats Row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-community-green flex-shrink-0" />
                        <div>
                          <p className="text-lg font-bold text-community-green">
                            {selectedArea.homes.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-muted-foreground">Homes Reached</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                        <div>
                          {selectedArea.leafletService.available ? (
                            <>
                              <p className="text-lg font-bold text-primary">
                                {selectedArea.leafletService.homes?.toLocaleString()}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                Leaflet {selectedArea.leafletService.note && `(${selectedArea.leafletService.note})`}
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-xs font-semibold text-muted-foreground">Not Available</p>
                              <p className="text-[10px] text-muted-foreground">Leaflet Service</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Coverage Details */}
                    <div>
                      <h4 className="font-semibold text-community-navy text-xs mb-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Coverage Details
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {selectedArea.coverageDetails}
                      </p>
                    </div>

                    {/* Leaflet Service Badge */}
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Leaflet Service</span>
                        {selectedArea.leafletService.available ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-community-green/10 text-community-green text-xs font-semibold">
                            ✓ Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-semibold">
                            ✗ Not Available
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Selling Points - Always visible (NOW BELOW) */}
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
    </TooltipProvider>
  );
};

export default InteractiveMediaInfo;
