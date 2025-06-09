const FeaturedAdvertisersSection = () => {
  // Featured local business advertisers
  const advertisers = [
    { name: 'DJ Summers Plumbing & Heating', logo: '/lovable-uploads/3457943e-ae98-43c0-b6cb-556d1d936472.png' },
    { name: 'Edwards Conservatory & Gutter Cleaning', logo: '/lovable-uploads/f6d05495-f433-4146-a6c5-b4332e7616bf.png' },
    { name: 'Acorn Tree Specialist Ltd', logo: '/lovable-uploads/0fd435d2-73a9-43e4-94cb-ee201a129979.png' },
    { name: 'The Little Curtain and Blind Company', logo: '/lovable-uploads/9940534b-25e0-4a76-9769-8f048532d0a5.png' },
    { name: 'Jon Callen Podiatrist', logo: '/lovable-uploads/6ce5a96b-19dd-49ab-aa34-4a048c3c22d2.png' },
    { name: 'Mark Parsons Decorating Services', logo: '/lovable-uploads/5c775c6a-2d81-439b-871e-56243f2f1686.png' },
    { name: 'Martin Langley Carpentry', logo: '/lovable-uploads/5d7d823c-c298-48e4-81ca-f206cfb9e6f9.png' },
    { name: 'W.A.G Decorating Services', logo: '/lovable-uploads/3bf54723-bde1-45e5-ba7d-fa1c6a9a1a1a.png' }
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