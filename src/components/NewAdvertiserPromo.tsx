import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Gift, Sparkles, Star, CheckCircle } from 'lucide-react';
import { EditableText } from '@/components/inline-editor';
import { AdvertisingContent, defaultAdvertisingContent } from '@/hooks/useAdvertisingContent';

interface NewAdvertiserPromoProps {
  content?: AdvertisingContent;
  updateField: (path: string, value: string) => void;
  updateBogofBenefit: (index: number, value: string) => void;
}

const NewAdvertiserPromo: React.FC<NewAdvertiserPromoProps> = ({ 
  content, 
  updateField, 
  updateBogofBenefit 
}) => {
  // Use defaults if content not yet loaded
  const safeContent = content || defaultAdvertisingContent;
  const offerTiles = [
    { paid: 1, free: 1 },
    { paid: 3, free: 3 },
    { paid: 5, free: 5 },
    { paid: 7, free: 7 },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Full-width dark background */}
      <div className="absolute inset-0 bg-gradient-to-br from-community-navy via-slate-900 to-black" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-community-green/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-pink-500/20 rounded-full blur-[80px] translate-x-1/3 translate-y-1/3" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-community-green/10 rounded-full blur-[60px] -translate-x-1/2 -translate-y-1/2" />
      
      {/* Content */}
      <div className="relative p-8 md:p-12 lg:p-16">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <Badge className="px-6 py-2 text-base font-bold bg-gradient-to-r from-yellow-400 to-amber-500 text-black border-0 shadow-lg shadow-yellow-500/30 animate-pulse-subtle">
            <Star className="h-4 w-4 mr-2 fill-current" />
            <EditableText
              value={safeContent.bogofPromo.badge}
              onSave={(val) => updateField('bogofPromo.badge', val)}
              as="span"
            />
            <Star className="h-4 w-4 ml-2 fill-current" />
          </Badge>
        </div>

        {/* Main Headline */}
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight">
            <EditableText
              value={safeContent.bogofPromo.headline}
              onSave={(val) => updateField('bogofPromo.headline', val)}
              as="span"
              className="text-transparent bg-clip-text bg-gradient-to-r from-community-green to-emerald-400"
            />
          </h2>
          <EditableText
            value={safeContent.bogofPromo.offerDescription}
            onSave={(val) => updateField('bogofPromo.offerDescription', val)}
            as="p"
            className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto"
          />
        </div>

        {/* Offer Tiles */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-10">
          {offerTiles.map((tile, index) => (
            <div 
              key={index} 
              className="group relative"
            >
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-community-green to-pink-500 rounded-2xl blur opacity-40 group-hover:opacity-75 transition-opacity duration-300" />
              
              {/* Tile */}
              <div className="relative flex items-center gap-2 md:gap-3 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 md:p-6 border border-white/10">
                <span className="text-4xl md:text-5xl lg:text-6xl font-black text-white">
                  {tile.paid}
                </span>
                <span className="text-3xl md:text-4xl lg:text-5xl font-bold text-community-green">
                  +
                </span>
                <span className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-500">
                  {tile.free}
                </span>
                
                {/* FREE label */}
                <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
                  FREE
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Subheader & Benefits */}
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Gift className="h-6 w-6 text-community-green" />
            <EditableText
              value={safeContent.bogofPromo.packageHeading}
              onSave={(val) => updateField('bogofPromo.packageHeading', val)}
              as="h3"
              className="text-xl md:text-2xl font-bold text-white"
            />
          </div>
          
          {/* Benefits Grid */}
          <div className="grid sm:grid-cols-2 gap-3">
            {safeContent.bogofPromo.benefits.map((benefit, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <CheckCircle className="h-5 w-5 text-community-green flex-shrink-0 mt-0.5" />
                <EditableText
                  value={benefit}
                  onSave={(val) => updateBogofBenefit(index, val)}
                  as="span"
                  className="text-slate-300 text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom sparkle accent */}
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2 text-slate-500">
            <Sparkles className="h-4 w-4" />
            <EditableText
              value={safeContent.bogofPromo.footerTagline}
              onSave={(val) => updateField('bogofPromo.footerTagline', val)}
              as="span"
              className="text-sm"
            />
            <Sparkles className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewAdvertiserPromo;
