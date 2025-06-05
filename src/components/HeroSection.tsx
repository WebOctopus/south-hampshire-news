import { Button } from '@/components/ui/button';

const HeroSection = () => {
  const postcodes = [
    'SO14', 'SO15', 'SO16', 'SO17', 'SO18', 'SO19', 'SO30', 'SO31', 'SO32', 'SO40', 'SO41', 'SO42', 'SO43', 'SO45',
    'PO7', 'PO8', 'PO9', 'PO10', 'PO11', 'PO12', 'PO13', 'PO14', 'PO15', 'PO16', 'PO17'
  ];

  return (
    <section id="home" className="bg-gradient-to-br from-gray-50 to-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl lg:text-5xl font-heading font-bold text-community-navy mb-6">
            Letterbox delivered to <span className="text-community-green">158,000 homes</span>
            <span className="block">across SO & PO postcodes</span>
          </h1>
          
          {/* Scrolling ticker */}
          <div className="mb-8 overflow-hidden bg-community-navy rounded-lg py-3">
            <div className="animate-[marquee_30s_linear_infinite] whitespace-nowrap">
              <span className="text-white font-medium">
                {postcodes.concat(postcodes).map((postcode, index) => (
                  <span key={index} className="mx-4">{postcode}</span>
                ))}
              </span>
            </div>
          </div>

          {/* Three CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-community-green hover:bg-green-600 text-white px-8 py-3 text-lg font-medium rounded-lg shadow-lg"
            >
              Submit an Event
            </Button>
            <Button 
              size="lg"
              className="bg-community-navy hover:bg-slate-700 text-white px-8 py-3 text-lg font-medium rounded-lg shadow-lg"
            >
              Submit a Story
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-community-navy text-community-navy hover:bg-community-navy hover:text-white px-8 py-3 text-lg font-medium rounded-lg"
            >
              Advertising Enquiry
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;