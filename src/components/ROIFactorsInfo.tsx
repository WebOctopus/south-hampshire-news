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

const ROIFactorsInfo: React.FC = () => {
  const productPoints = [
    {
      icon: BarChart3,
      title: "Circulation",
      description: "How many copies are printed—the more printed, the more potential readers and customers"
    },
    {
      icon: MapPin,
      title: "Distribution Method",
      description: "Targeted letterbox delivery vs untargeted pick-up (prone to waste)"
    },
    {
      icon: User,
      title: "Audience Targeting",
      description: "Who is the magazine aimed at? Where exactly is it delivered?"
    },
    {
      icon: CheckCircle,
      title: "Delivery Reliability",
      description: "Is delivery tracked? Is it reliable?"
    },
    {
      icon: BookOpen,
      title: "Editorial Balance",
      description: "Good ratio of editorial to adverts = engaged readers"
    },
    {
      icon: Sparkles,
      title: "Editorial Quality",
      description: "Varied, interesting, local, and topical content"
    }
  ];

  const advertiserPoints = [
    {
      icon: Maximize2,
      title: "Right Ad Size",
      description: "Is the advert the right size for your type of business?"
    },
    {
      icon: Palette,
      title: "Design Quality",
      description: "Is the advert selling or just telling? Professional design matters"
    },
    {
      icon: Phone,
      title: "Response Management",
      description: "Unanswered calls going to voicemail is not well-managed response"
    },
    {
      icon: TrendingUp,
      title: "Measuring Correctly",
      description: "Are you measuring response or only the result?"
    }
  ];

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
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
            The all important question:
          </h2>
          <p className="text-3xl md:text-4xl lg:text-5xl font-black text-community-green">
            What will your ROI be?
          </p>
          <p className="text-slate-300 text-lg mt-4 max-w-2xl mx-auto">
            The real question—and impossible to know for sure—is return on investment. 
            What we do know is that <span className="text-white font-semibold">ROI depends on two key factors:</span>
          </p>
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
                <h3 className="text-2xl font-black text-community-navy">The Product</h3>
                <p className="text-sm text-muted-foreground">What makes a magazine effective</p>
              </div>
            </div>
            
            {/* Points */}
            <ul className="space-y-4">
              {productPoints.map((point, index) => (
                <li key={index} className="flex gap-4 p-3 rounded-lg bg-white border border-slate-100 hover:border-community-green/30 hover:shadow-md transition-all duration-200">
                  <div className="flex-shrink-0">
                    <div className="p-2 rounded-lg bg-community-green/10">
                      <point.icon className="h-5 w-5 text-community-green" />
                    </div>
                  </div>
                  <div>
                    <span className="font-bold text-community-navy block">{point.title}</span>
                    <span className="text-muted-foreground text-sm">{point.description}</span>
                  </div>
                </li>
              ))}
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
                <h3 className="text-2xl font-black text-white">The Advertiser</h3>
                <p className="text-sm text-slate-400">What you bring to the table</p>
              </div>
            </div>
            
            {/* Points */}
            <ul className="space-y-4">
              {advertiserPoints.map((point, index) => (
                <li key={index} className="flex gap-4 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-community-green/30 hover:bg-white/10 transition-all duration-200">
                  <div className="flex-shrink-0">
                    <div className="p-2 rounded-lg bg-community-green/20">
                      <point.icon className="h-5 w-5 text-community-green" />
                    </div>
                  </div>
                  <div>
                    <span className="font-bold text-white block">{point.title}</span>
                    <span className="text-slate-400 text-sm">{point.description}</span>
                  </div>
                </li>
              ))}
            </ul>
            
            {/* Emphasis footer */}
            <div className="mt-6 p-4 rounded-xl bg-community-green/20 border border-community-green/30">
              <p className="text-white text-sm text-center">
                <span className="font-bold">Remember:</span> Advertising generates response, <span className="text-community-green font-semibold">you</span> create the result
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ROIFactorsInfo;