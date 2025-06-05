const Footer = () => {
  return (
    <footer id="contact" className="bg-community-navy text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-heading font-bold mb-4">
              Discover Magazine
            </h3>
            <p className="text-gray-300 font-body mb-4 max-w-md">
              South Hampshire's Biggest Little Magazine - connecting communities, 
              celebrating local stories, and helping businesses thrive.
            </p>
            <div className="text-sm text-gray-400 font-body">
              <p>Circulation: 25,000+ homes monthly</p>
              <p>Established: 2010</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-heading font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 font-body">
              <li><a href="#events" className="text-gray-300 hover:text-community-green transition-colors">What's On</a></li>
              <li><a href="#competitions" className="text-gray-300 hover:text-community-green transition-colors">Competitions</a></li>
              <li><a href="#advertising" className="text-gray-300 hover:text-community-green transition-colors">Advertise</a></li>
              <li><a href="#distribute" className="text-gray-300 hover:text-community-green transition-colors">Distribute</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-heading font-semibold mb-4">Get in Touch</h4>
            <div className="space-y-2 font-body text-gray-300">
              <p>📞 02380 123 456</p>
              <p>✉️ hello@discover-magazine.co.uk</p>
              <p>📍 Southampton, Hampshire</p>
              <div className="pt-4">
                <p className="text-sm">Business Hours:</p>
                <p className="text-sm">Mon-Fri: 9am-5pm</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-8 pt-8 text-center">
          <p className="text-gray-400 font-body">
            © 2024 Discover Magazine. All rights reserved. | 
            <span className="text-community-green"> Proudly serving South Hampshire</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;