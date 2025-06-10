import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();
  const supabaseUrl = "https://qajegkbvbpekdggtrupv.supabase.co";
  const videoUrl = `${supabaseUrl}/storage/v1/object/public/websitevideo/Monthly-Community-Mag.mp4`;

  return (
    <section id="home" className="relative overflow-hidden">
      {/* Hero Video Section */}
      <div className="relative w-full h-screen">
        <video 
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay 
          muted 
          loop 
          playsInline
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Video Overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60"></div>
      </div>
      
      {/* Content Section Below Video */}
      <div className="relative bg-gradient-to-br from-slate-900 via-community-navy to-slate-800 py-20">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-community-green/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-community-green/5 rounded-full blur-3xl animate-pulse delay-700"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Main Heading with Enhanced Styling */}
            <div className="mb-12">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-6 py-2 mb-8">
                <div className="w-2 h-2 bg-community-green rounded-full animate-pulse"></div>
                <span className="text-white font-medium tracking-wider">DISCOVER MAGAZINE</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-heading font-bold text-white mb-8 leading-tight">
                Letterbox delivered to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-community-green to-green-400 animate-pulse">
                  158,000 homes
                </span>
                <span className="block mt-4 text-3xl sm:text-4xl lg:text-6xl text-gray-300">
                  across SO & PO postcodes
                </span>
              </h1>
            </div>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Button 
                size="lg" 
                className="group bg-gradient-to-r from-community-green to-green-600 hover:from-green-600 hover:to-community-green text-white px-10 py-4 text-xl font-bold rounded-2xl shadow-2xl shadow-community-green/30 hover:shadow-community-green/50 transform hover:scale-105 transition-all duration-300 border border-green-400/20"
                onClick={() => navigate('/add-event')}
              >
                <span className="group-hover:scale-110 transition-transform duration-200">
                  Submit an Event
                </span>
              </Button>
              <Button 
                size="lg"
                className="group bg-gradient-to-r from-community-navy to-slate-700 hover:from-slate-700 hover:to-community-navy text-white px-10 py-4 text-xl font-bold rounded-2xl shadow-2xl shadow-community-navy/30 hover:shadow-community-navy/50 transform hover:scale-105 transition-all duration-300 border border-slate-400/20"
                onClick={() => navigate('/contact')}
              >
                <span className="group-hover:scale-110 transition-transform duration-200">
                  Submit a Story
                </span>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="group border-2 border-white/30 text-white hover:bg-white hover:text-community-navy px-10 py-4 text-xl font-bold rounded-2xl backdrop-blur-sm hover:shadow-2xl hover:shadow-white/20 transform hover:scale-105 transition-all duration-300"
                onClick={() => navigate('/advertising')}
              >
                <span className="group-hover:scale-110 transition-transform duration-200">
                  Advertising Enquiry
                </span>
              </Button>
            </div>

            {/* Additional Visual Elements */}
            <div className="flex justify-center items-center gap-8 text-gray-300">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-community-green rounded-full animate-pulse"></div>
                <span className="text-lg font-medium">Local News & Stories</span>
              </div>
              <div className="hidden sm:block w-px h-8 bg-white/20"></div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-community-green rounded-full animate-pulse delay-300"></div>
                <span className="text-lg font-medium">Community Events</span>
              </div>
              <div className="hidden sm:block w-px h-8 bg-white/20"></div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-community-green rounded-full animate-pulse delay-700"></div>
                <span className="text-lg font-medium">Business Directory</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;