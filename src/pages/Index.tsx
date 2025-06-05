import Navigation from '../components/Navigation';
import HeroSection from '../components/HeroSection';
import FeaturedSection from '../components/FeaturedSection';
import BusinessSection from '../components/BusinessSection';
import Footer from '../components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <HeroSection />
        <FeaturedSection />
        <BusinessSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;