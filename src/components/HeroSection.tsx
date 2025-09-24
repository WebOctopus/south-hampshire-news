import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section id="home" className="relative py-16 lg:py-24 overflow-hidden">
      {/* Peacock Background Image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/lovable-uploads/2f7e4e32-acda-49e5-ab66-17e0059b39fc.png)'
        }}
      ></div>
      
      {/* Dark Overlay for Text Readability */}
      <div className="absolute inset-0 bg-black/50"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl lg:text-5xl font-heading font-bold text-white mb-6">
            Letterbox delivered to <span className="text-community-green">142,000 homes</span>
            <span className="block">across SO & PO postcodes</span>
          </h1>

          {/* Three CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-community-green hover:bg-green-600 text-white px-8 py-3 text-lg font-medium rounded-lg shadow-lg"
              onClick={() => navigate('/add-event')}
            >
              Submit an Event
            </Button>
            <Button 
              size="lg"
              className="bg-community-navy hover:bg-slate-700 text-white px-8 py-3 text-lg font-medium rounded-lg shadow-lg"
              onClick={() => navigate('/contact')}
            >
              Submit a Story
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-white text-black hover:bg-white hover:text-community-navy px-8 py-3 text-lg font-medium rounded-lg"
              onClick={() => navigate('/advertising')}
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