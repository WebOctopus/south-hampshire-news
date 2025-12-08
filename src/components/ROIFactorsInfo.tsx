import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
  TrendingUp
} from 'lucide-react';

const ROIFactorsInfo: React.FC = () => {
  const productPoints = [
    {
      icon: BarChart3,
      title: "Circulation",
      description: "How many copies are printed—the more printed, the more potential readers and customers (always ask for proof of circulation)"
    },
    {
      icon: MapPin,
      title: "Distribution Method",
      description: "How are magazines reaching readers? Targeted letterbox delivery vs untargeted pick-up (prone to waste)"
    },
    {
      icon: User,
      title: "Audience Targeting",
      description: "Who is the magazine aimed at? Where exactly is it delivered or available?"
    },
    {
      icon: CheckCircle,
      title: "Delivery Reliability",
      description: "Is delivery tracked? Is it reliable? (ask for proof of route monitoring)"
    },
    {
      icon: BookOpen,
      title: "Editorial Balance",
      description: "How much editorial is included? Too many adverts and it's a directory, not a magazine people read"
    },
    {
      icon: Sparkles,
      title: "Editorial Quality",
      description: "Is it varied, interesting, local, and topical content?"
    }
  ];

  const advertiserPoints = [
    {
      icon: Maximize2,
      title: "Right Ad Size",
      description: "Is the advert the right size for your type of business? Too small or too big?"
    },
    {
      icon: Palette,
      title: "Design Quality",
      description: "Is the advert selling or just telling? Is it a well-designed advert?"
    },
    {
      icon: Phone,
      title: "Response Management",
      description: "Are you receiving calls to action? Unanswered calls going to voicemail is not well-managed response"
    },
    {
      icon: TrendingUp,
      title: "Measuring Correctly",
      description: "Are you measuring response or only the result? Advertising generates response, you create the result"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          The all important question: How much does it cost to advertise in Discover?
        </h2>
        <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
          The real question—and impossible to know for sure—is <span className="text-primary font-semibold">return on investment</span>. 
          What we do know is that ROI depends on several factors:
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* The Product */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <Newspaper className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">The Product</h3>
            </div>
            
            <ul className="space-y-4">
              {productPoints.map((point, index) => (
                <li key={index} className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <point.icon className="h-5 w-5 text-primary/70" />
                  </div>
                  <div>
                    <span className="font-medium text-foreground">{point.title}:</span>{' '}
                    <span className="text-muted-foreground text-sm">{point.description}</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* The Advertiser */}
        <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-lg bg-secondary/20">
                <User className="h-6 w-6 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground">The Advertiser (You!)</h3>
            </div>
            
            <ul className="space-y-4">
              {advertiserPoints.map((point, index) => (
                <li key={index} className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <point.icon className="h-5 w-5 text-secondary-foreground/70" />
                  </div>
                  <div>
                    <span className="font-medium text-foreground">{point.title}:</span>{' '}
                    <span className="text-muted-foreground text-sm">{point.description}</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ROIFactorsInfo;