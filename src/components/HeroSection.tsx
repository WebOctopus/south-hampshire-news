import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <section id="home" className="bg-gradient-to-br from-gray-50 to-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl lg:text-6xl font-heading font-bold text-community-navy mb-6">
            South Hampshire's
            <span className="block text-community-green">Biggest Little Magazine</span>
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto font-body">
            Your local source for community stories, exciting events, and connecting 
            businesses with neighbors who matter most.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-community-green hover:bg-green-600 text-white px-8 py-3 text-lg font-medium rounded-lg shadow-lg"
            >
              Read Latest Stories
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-community-navy text-community-navy hover:bg-community-navy hover:text-white px-8 py-3 text-lg font-medium rounded-lg"
            >
              Advertise With Us
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;