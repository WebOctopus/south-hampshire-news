const FeaturedAdvertisersSection = () => {
  // Mock advertiser logos - in a real app these would be dynamic
  const advertisers = [
    { name: 'Local Garage', logo: '/placeholder.svg' },
    { name: 'Community Bank', logo: '/placeholder.svg' },
    { name: 'Garden Centre', logo: '/placeholder.svg' },
    { name: 'Dental Practice', logo: '/placeholder.svg' },
    { name: 'Estate Agent', logo: '/placeholder.svg' },
    { name: 'Restaurant', logo: '/placeholder.svg' },
    { name: 'Fitness Centre', logo: '/placeholder.svg' },
    { name: 'Hair Salon', logo: '/placeholder.svg' }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-community-navy mb-4">
            Featured Advertisers
          </h2>
          <p className="text-xl text-gray-600 font-body">
            Supporting local businesses that make our community thrive
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8 items-center">
          {advertisers.map((advertiser, index) => (
            <div 
              key={index} 
              className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <img 
                src={advertiser.logo} 
                alt={advertiser.name}
                className="max-w-full max-h-16 object-contain grayscale hover:grayscale-0 transition-all duration-300"
              />
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-600 font-body mb-4">
            Want to feature your business here?
          </p>
          <button className="text-community-green font-semibold hover:text-green-600 transition-colors">
            Learn about our advertising options →
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedAdvertisersSection;