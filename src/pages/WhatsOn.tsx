import Navigation from '../components/Navigation';
import WhatsOnSection from '../components/WhatsOnSection';
import Footer from '../components/Footer';
import StickyDownloadForm from '../components/StickyDownloadForm';

const WhatsOn = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <WhatsOnSection />
      </main>
      <Footer />
      <StickyDownloadForm />
    </div>
  );
};

export default WhatsOn;