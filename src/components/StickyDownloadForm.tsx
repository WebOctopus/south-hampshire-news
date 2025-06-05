import { useState } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const StickyDownloadForm = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission - would connect to backend
    console.log('Download request:', formData);
    // Show success and hide form
    setIsVisible(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 max-w-[calc(100vw-3rem)]">
      <Card className="shadow-2xl border-2 border-community-green">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-heading text-community-navy flex items-center gap-2">
              <Download size={20} className="text-community-green" />
              {isMinimized ? 'Download Info' : '2025 Advertising Info'}
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 h-6 w-6"
              >
                {isMinimized ? '□' : '−'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="p-1 h-6 w-6"
              >
                <X size={14} />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {!isMinimized && (
          <CardContent className="pt-0">
            <p className="text-sm text-gray-600 mb-4 font-body">
              Get our complete advertising guide with rates, specifications, and deadlines.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label htmlFor="name" className="text-xs">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className="h-8 text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-xs">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="h-8 text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor="company" className="text-xs">Company</Label>
                <Input
                  id="company"
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
        )}
      </Card>
    </div>
  );
};

export default StickyDownloadForm;