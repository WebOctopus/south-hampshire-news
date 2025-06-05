import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <section id="home" className="relative py-16 lg:py-24 overflow-hidden">
      {/* YouTube Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <iframe
          src="https://www.youtube.com/embed/Nbvbgvro2G0?autoplay=1&mute=1&loop=1&playlist=Nbvbgvro2G0&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&start=0"
          className="absolute top-1/2 left-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          allow="autoplay; encrypted-media"
          title="Background Video"
        />
      </div>
      
      {/* Dark Overlay for Text Readability */}
      <div className="absolute inset-0 bg-black/50"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl lg:text-5xl font-heading font-bold text-white mb-6">
            Letterbox delivered to <span className="text-community-green">158,000 homes</span>
            <span className="block">across SO & PO postcodes</span>
          </h1>

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
              className="border-2 border-white text-black hover:bg-white hover:text-community-navy px-8 py-3 text-lg font-medium rounded-lg"
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