import React from 'react';
import { 
  Newspaper, 
  User, 
  BarChart3, 
  MapPin, 
  CheckCircle, 
  BookOpen, 
  Sparkles,
  Maximize2,
  Palette,
  Phone,
  TrendingUp,
  HelpCircle
} from 'lucide-react';
import { EditableText } from '@/components/inline-editor';
import { AdvertisingContent, defaultAdvertisingContent } from '@/hooks/useAdvertisingContent';

interface ROIFactorsInfoProps {
  content?: AdvertisingContent;
  updateField: (path: string, value: string) => void;
  updateFeature: (section: 'productSection' | 'advertiserSection', index: number, field: 'title' | 'description', value: string) => void;
}

const productIcons = [BarChart3, MapPin, User, CheckCircle, BookOpen, Sparkles];
const advertiserIcons = [Maximize2, Palette, Phone, TrendingUp];

const ROIFactorsInfo: React.FC<ROIFactorsInfoProps> = ({ content, updateField, updateFeature }) => {
  // Use defaults if content not yet loaded
  const safeContent = content || defaultAdvertisingContent;
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-community-navy via-slate-800 to-community-navy p-8 md:p-10 text-center">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-community-green/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-community-green/10 rounded-full blur-3xl" />
        
        <div className="relative">
          <div className="inline-flex items-center justify-center p-3 bg-community-green/20 rounded-full mb-4">
            <HelpCircle className="h-8 w-8 text-community-green" />
          </div>
          <EditableText
            value={safeContent.roiSection.mainHeading}
            onSave={(val) => updateField('roiSection.mainHeading', val)}
            as="h2"
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4"
          />
          <p className="text-2xl md:text-3xl lg:text-4xl font-black text-community-green leading-tight">
            <EditableText
              value={safeContent.roiSection.subHeading1}
              onSave={(val) => updateField('roiSection.subHeading1', val)}
              as="span"
              className="block"
            />
            <EditableText
              value={safeContent.roiSection.subHeading2}
              onSave={(val) => updateField('roiSection.subHeading2', val)}
              as="span"
              className="block"
            />
          </p>
          <EditableText
            value={safeContent.roiSection.description}
            onSave={(val) => updateField('roiSection.description', val)}
            as="p"
            multiline
            className="text-slate-300 text-lg mt-4 max-w-3xl mx-auto"
          />
        </div>
      </div>

      {/* Two Column Decision Explainer */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* The Product Card - Light Theme */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 shadow-xl">
          {/* Accent bar */}
          <div className="h-2 bg-gradient-to-r from-community-green to-emerald-400" />
          
          <div className="p-6 md:p-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-community-green shadow-lg shadow-community-green/20">
                <Newspaper className="h-7 w-7 text-white" />
              </div>
              <div>
                <EditableText
                  value={safeContent.productSection.title}
                  onSave={(val) => updateField('productSection.title', val)}
                  as="h3"
                  className="text-2xl font-black text-community-navy"
                />
                <EditableText
                  value={safeContent.productSection.subtitle}
                  onSave={(val) => updateField('productSection.subtitle', val)}
                  as="p"
                  className="text-sm text-muted-foreground"
                />
              </div>
            </div>
            
            {/* Points */}
            <ul className="space-y-4">
              {safeContent.productSection.features.map((point, index) => {
                const IconComponent = productIcons[index] || BarChart3;
                return (
                  <li key={index} className="flex gap-4 p-3 rounded-lg bg-white border border-slate-100 hover:border-community-green/30 hover:shadow-md transition-all duration-200">
                    <div className="flex-shrink-0">
                      <div className="p-2 rounded-lg bg-community-green/10">
                        <IconComponent className="h-5 w-5 text-community-green" />
                      </div>
                    </div>
                    <div>
                      <EditableText
                        value={point.title}
                        onSave={(val) => updateFeature('productSection', index, 'title', val)}
                        as="span"
                        className="font-bold text-community-navy block"
                      />
                      <EditableText
                        value={point.description}
                        onSave={(val) => updateFeature('productSection', index, 'description', val)}
                        as="span"
                        className="text-muted-foreground text-sm"
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* The Advertiser Card - Dark Theme */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-community-navy via-slate-800 to-community-navy shadow-xl">
          {/* Accent bar */}
          <div className="h-2 bg-gradient-to-r from-community-green to-emerald-400" />
          
          <div className="p-6 md:p-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-community-green shadow-lg shadow-community-green/20">
                <User className="h-7 w-7 text-white" />
              </div>
              <div>
                <EditableText
                  value={safeContent.advertiserSection.title}
                  onSave={(val) => updateField('advertiserSection.title', val)}
                  as="h3"
                  className="text-2xl font-black text-white"
                />
                <EditableText
                  value={safeContent.advertiserSection.subtitle}
                  onSave={(val) => updateField('advertiserSection.subtitle', val)}
                  as="p"
                  className="text-sm text-slate-400"
                />
              </div>
            </div>
            
            {/* Points */}
            <ul className="space-y-4">
              {safeContent.advertiserSection.features.map((point, index) => {
                const IconComponent = advertiserIcons[index] || Maximize2;
                return (
                  <li key={index} className="flex gap-4 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-community-green/30 hover:bg-white/10 transition-all duration-200">
                    <div className="flex-shrink-0">
                      <div className="p-2 rounded-lg bg-community-green/20">
                        <IconComponent className="h-5 w-5 text-community-green" />
                      </div>
                    </div>
                    <div>
                      <EditableText
                        value={point.title}
                        onSave={(val) => updateFeature('advertiserSection', index, 'title', val)}
                        as="span"
                        className="font-bold text-white block"
                      />
                      <EditableText
                        value={point.description}
                        onSave={(val) => updateFeature('advertiserSection', index, 'description', val)}
                        as="span"
                        className="text-slate-400 text-sm"
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
            
            {/* Emphasis footer */}
            <div className="mt-6 p-4 rounded-xl bg-community-green/20 border border-community-green/30">
              <EditableText
                value={safeContent.advertiserSection.footerText}
                onSave={(val) => updateField('advertiserSection.footerText', val)}
                as="p"
                className="text-white text-sm text-center"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ROIFactorsInfo;
