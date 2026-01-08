import { useState, useEffect } from 'react';
import { X, Download, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const StickyDownloadForm = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: ''
  });

  // Delay appearance by 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Download request:', formData);
    setIsVisible(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isVisible) return null;

  // Mobile: collapsed floating button that expands to bottom sheet
  // Desktop: traditional sticky form
  return (
    <>
      {/* Mobile Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        {isExpanded ? (
          <Card className="rounded-t-2xl rounded-b-none shadow-2xl border-t-2 border-x-2 border-community-green animate-in slide-in-from-bottom duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-heading text-community-navy flex items-center gap-2">
                  <Download size={18} className="text-community-green" />
                  2026 Advertising Info
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="p-2 h-10 w-10 min-h-[44px] min-w-[44px]"
                  aria-label="Collapse form"
                >
                  <ChevronUp size={20} />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0 pb-6">
              <p className="text-sm text-muted-foreground mb-4 font-body">
                Get our complete advertising guide with rates and specifications.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <Label htmlFor="name-mobile" className="text-xs">Name *</Label>
                  <Input
                    id="name-mobile"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    className="h-11 text-base"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email-mobile" className="text-xs">Email *</Label>
                  <Input
                    id="email-mobile"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="h-11 text-base"
                  />
                </div>
                
                <div>
                  <Label htmlFor="company-mobile" className="text-xs">Company</Label>
                  <Input
                    id="company-mobile"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="h-11 text-base"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-community-green hover:bg-green-600 text-white h-12 text-base"
                >
                  Download Now
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="p-4 flex justify-end gap-2">
            <Button
              onClick={() => setIsExpanded(true)}
              className="bg-community-green hover:bg-green-600 text-white rounded-full shadow-lg h-14 px-5 flex items-center gap-2 min-h-[56px]"
            >
              <Download size={20} />
              <span className="font-medium">Get Info Pack</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsVisible(false)}
              className="rounded-full h-14 w-14 p-0 min-h-[56px] min-w-[56px] bg-background"
              aria-label="Close"
            >
              <X size={20} />
            </Button>
          </div>
        )}
      </div>

      {/* Desktop Sticky Card */}
      <div className="hidden md:block fixed bottom-6 right-6 z-50 w-80">
        <Card className="shadow-2xl border-2 border-community-green">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-heading text-community-navy flex items-center gap-2">
                <Download size={20} className="text-community-green" />
                2026 Advertising Info
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="p-2 h-8 w-8"
                aria-label="Close form"
              >
                <X size={16} />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground mb-4 font-body">
              Get our complete advertising guide with rates, specifications, and deadlines.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label htmlFor="name-desktop" className="text-xs">Name *</Label>
                <Input
                  id="name-desktop"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className="h-8 text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor="email-desktop" className="text-xs">Email *</Label>
                <Input
                  id="email-desktop"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="h-8 text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor="company-desktop" className="text-xs">Company</Label>
                <Input
                  id="company-desktop"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-community-green hover:bg-green-600 text-white h-8 text-sm"
              >
                Download Now
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default StickyDownloadForm;
