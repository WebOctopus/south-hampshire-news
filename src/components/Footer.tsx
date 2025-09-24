import { Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer id="contact" className="bg-community-navy text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          {/* Brand & Company Info */}
          <div className="lg:col-span-2">
            <h3 className="text-3xl font-heading font-bold mb-2">
              Discover Magazines Ltd
            </h3>
            <p className="text-xl font-semibold text-community-green mb-4">
              South Hampshire's Biggest, Little (and Best!) Magazine
            </p>
            <p className="text-gray-300 font-body mb-6 max-w-md leading-relaxed">
              Connecting communities, celebrating local stories and helping businesses thrive
            </p>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-community-green font-semibold">Circulation</p>
                <p className="text-white font-bold text-lg">142,000 homes</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-community-green font-semibold">Frequency</p>
                <p className="text-white font-bold text-lg">Bi-monthly</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-community-green font-semibold">Established</p>
                <p className="text-white font-bold text-lg">2005</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-heading font-semibold mb-6 text-community-green">Quick Links</h4>
            <ul className="space-y-3 font-body">
              <li><a href="/whats-on" className="text-gray-300 hover:text-community-green transition-colors hover:translate-x-1 transform duration-200 block">Events & What's On</a></li>
              <li><a href="/competitions" className="text-gray-300 hover:text-community-green transition-colors hover:translate-x-1 transform duration-200 block">Competitions</a></li>
              <li><a href="/business-directory" className="text-gray-300 hover:text-community-green transition-colors hover:translate-x-1 transform duration-200 block">Directory</a></li>
              <li><a href="/advertising" className="text-gray-300 hover:text-community-green transition-colors hover:translate-x-1 transform duration-200 block">Advertising</a></li>
              <li><a href="/apply-to-distribute" className="text-gray-300 hover:text-community-green transition-colors hover:translate-x-1 transform duration-200 block">Distribution</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-community-green transition-colors hover:translate-x-1 transform duration-200 block">Contact</a></li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-lg font-heading font-semibold mb-6 text-community-green">Get in Touch</h4>
            <div className="space-y-4 font-body">
              <div className="flex items-start gap-3">
                <div className="bg-community-green/20 rounded-full p-2 mt-1">
                  <Phone className="h-4 w-4 text-community-green" />
                </div>
                <div>
                  <p className="text-white font-semibold">023 8026 6388</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-community-green/20 rounded-full p-2 mt-1">
                  <Mail className="h-4 w-4 text-community-green" />
                </div>
                <div>
                  <p className="text-white font-semibold">discover@discovermagazines.co.uk</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-community-green/20 rounded-full p-2 mt-1">
                  <MapPin className="h-4 w-4 text-community-green" />
                </div>
                <div>
                  <p className="text-white font-semibold">Eastleigh, Hampshire</p>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4 mt-6">
                <p className="text-community-green font-semibold mb-2">Business Hours</p>
                <p className="text-gray-300 text-sm">Mon-Thurs: 9am-5pm</p>
                <p className="text-gray-300 text-sm">Fri: 9am-3pm</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-12 pt-8 text-center">
          <p className="text-gray-400 font-body">
            © 2024 Discover Magazines Ltd. All rights reserved. | 
            <span className="text-community-green"> Proudly serving South Hampshire since 2005</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;