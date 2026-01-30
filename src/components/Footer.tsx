import { useState } from "react";
import { Phone, Mail, MapPin, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const Footer = () => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <footer id="contact" className="bg-community-navy text-white py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Grid Layout */}
        <div className="hidden md:grid lg:grid-cols-[2fr_1fr_1.5fr] md:grid-cols-2 gap-8">
          {/* Brand & Company Info */}
          <div>
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
              <a href="tel:02380266388" className="flex items-start gap-3 group">
                <div className="bg-community-green/20 rounded-full p-2 mt-1">
                  <Phone className="h-4 w-4 text-community-green" />
                </div>
                <p className="text-white font-semibold group-hover:text-community-green transition-colors">023 8026 6388</p>
              </a>
              
              <a href="mailto:discover@discovermagazines.co.uk" className="flex items-start gap-3 group">
                <div className="bg-community-green/20 rounded-full p-2 mt-1">
                  <Mail className="h-4 w-4 text-community-green" />
                </div>
                <p className="text-white font-semibold group-hover:text-community-green transition-colors break-all">discover@discovermagazines.co.uk</p>
              </a>
              
              <div className="flex items-start gap-3">
                <div className="bg-community-green/20 rounded-full p-2 mt-1">
                  <MapPin className="h-4 w-4 text-community-green" />
                </div>
                <p className="text-white font-semibold">30 Leigh Road, Eastleigh, SO50 9DT Hampshire</p>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4 mt-6">
                <p className="text-community-green font-semibold mb-2">Business Hours</p>
                <p className="text-gray-300 text-sm">Mon-Thurs: 9am-5pm</p>
                <p className="text-gray-300 text-sm">Fri: 9am-3pm</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Accordion Layout */}
        <div className="md:hidden space-y-4">
          {/* Brand Header - Always visible */}
          <div className="text-center pb-4 border-b border-white/10">
            <h3 className="text-2xl font-heading font-bold mb-1">
              Discover Magazines Ltd
            </h3>
            <p className="text-sm text-community-green font-semibold">
              South Hampshire's Biggest, Little (and Best!) Magazine
            </p>
          </div>

          {/* Stats - 2 column grid */}
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <p className="text-community-green text-xs font-semibold">Circulation</p>
              <p className="text-white font-bold">142k homes</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <p className="text-community-green text-xs font-semibold">Since</p>
              <p className="text-white font-bold">2005</p>
            </div>
          </div>

          {/* Collapsible Quick Links */}
          <Collapsible open={openSections.links} onOpenChange={() => toggleSection('links')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-3 border-b border-white/10">
              <span className="text-lg font-heading font-semibold text-community-green">Quick Links</span>
              <ChevronDown className={`h-5 w-5 text-community-green transition-transform ${openSections.links ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="py-3 space-y-3">
              <a href="/whats-on" className="block py-2 text-gray-300 hover:text-community-green min-h-[44px] flex items-center">Events & What's On</a>
              <a href="/competitions" className="block py-2 text-gray-300 hover:text-community-green min-h-[44px] flex items-center">Competitions</a>
              <a href="/business-directory" className="block py-2 text-gray-300 hover:text-community-green min-h-[44px] flex items-center">Directory</a>
              <a href="/advertising" className="block py-2 text-gray-300 hover:text-community-green min-h-[44px] flex items-center">Advertising</a>
              <a href="/apply-to-distribute" className="block py-2 text-gray-300 hover:text-community-green min-h-[44px] flex items-center">Distribution</a>
              <a href="/contact" className="block py-2 text-gray-300 hover:text-community-green min-h-[44px] flex items-center">Contact</a>
            </CollapsibleContent>
          </Collapsible>

          {/* Collapsible Contact */}
          <Collapsible open={openSections.contact} onOpenChange={() => toggleSection('contact')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full py-3 border-b border-white/10">
              <span className="text-lg font-heading font-semibold text-community-green">Contact Us</span>
              <ChevronDown className={`h-5 w-5 text-community-green transition-transform ${openSections.contact ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="py-4 space-y-4">
              <a href="tel:02380266388" className="flex items-center gap-3 py-2 min-h-[44px]">
                <div className="bg-community-green/20 rounded-full p-2">
                  <Phone className="h-5 w-5 text-community-green" />
                </div>
                <span className="text-white font-semibold">023 8026 6388</span>
              </a>
              
              <a href="mailto:discover@discovermagazines.co.uk" className="flex items-center gap-3 py-2 min-h-[44px]">
                <div className="bg-community-green/20 rounded-full p-2">
                  <Mail className="h-5 w-5 text-community-green" />
                </div>
                <span className="text-white font-semibold text-sm break-all">discover@discovermagazines.co.uk</span>
              </a>
              
              <div className="flex items-center gap-3 py-2">
                <div className="bg-community-green/20 rounded-full p-2">
                  <MapPin className="h-5 w-5 text-community-green" />
                </div>
                <span className="text-white font-semibold">30 Leigh Road, Eastleigh, SO50 9DT Hampshire</span>
              </div>

              <div className="bg-white/5 rounded-lg p-4 mt-2">
                <p className="text-community-green font-semibold mb-1">Business Hours</p>
                <p className="text-gray-300 text-sm">Mon-Thurs: 9am-5pm | Fri: 9am-3pm</p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="border-t border-gray-600 mt-8 md:mt-12 pt-6 md:pt-8 text-center">
          <p className="text-gray-400 font-body text-sm md:text-base">
            © 2024 Discover Magazines Ltd. All rights reserved.
          </p>
          <p className="text-community-green text-sm mt-1">
            Proudly serving South Hampshire since 2005
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
