import Navigation from '../components/Navigation';
import HeroSection from '../components/HeroSection';
import IconCardsSection from '../components/IconCardsSection';
import TestimonialsCarousel from '../components/TestimonialsCarousel';
import LatestStoriesGrid from '../components/LatestStoriesGrid';
import FeaturedAdvertisersSection from '../components/FeaturedAdvertisersSection';
import NewsletterSignup from '../components/NewsletterSignup';
import StickyDownloadForm from '../components/StickyDownloadForm';
import Footer from '../components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <HeroSection />
        <IconCardsSection />
        <TestimonialsCarousel />
        <LatestStoriesGrid />
        <FeaturedAdvertisersSection />
        <NewsletterSignup />
      </main>
      <Footer />
      <StickyDownloadForm />
    </div>
  );
};

export default Index;