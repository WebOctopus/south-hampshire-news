import React from 'react';

const NewAdvertiserPromo: React.FC = () => {
  const numberPairs = [
    { left: 1, right: 1 },
    { left: 3, right: 3 },
    { left: 5, right: 5 },
    { left: 7, right: 7 },
  ];

  return (
    <div className="w-full overflow-hidden rounded-xl shadow-lg">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px]">
        {/* Left Section - Light Background */}
        <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 p-8 lg:p-10">
          {/* Header */}
          <h2 className="text-2xl md:text-3xl font-black text-community-navy uppercase tracking-tight mb-6">
            Exclusively for New Advertisers
          </h2>

          {/* Number Pairs Row */}
          <div className="flex flex-wrap gap-4 md:gap-8 mb-6">
            {numberPairs.map((pair, index) => (
              <div key={index} className="flex items-center text-4xl md:text-5xl lg:text-6xl font-black">
                <span className="text-community-navy">{pair.left}</span>
                <span className="text-community-navy mx-1 md:mx-2">+</span>
                <span className="text-pink-500">{pair.right}</span>
              </div>
            ))}
          </div>

          {/* BOGOF Tagline */}
          <div className="mb-6">
            <p className="text-xl md:text-2xl font-bold text-community-navy">
              For <span className="line-through text-gray-400">Every Area Booked*</span>{' '}
              We Give You{' '}
              <span className="text-pink-500">One Area Free</span>{' '}
              for 6 months
            </p>
          </div>

          {/* Subheader */}
          <h3 className="text-lg md:text-xl font-bold text-community-navy mb-4">
            3+ Repeat Package for New Advertisers
          </h3>

          {/* Bullet Points */}
          <ul className="space-y-2 text-gray-600 text-sm md:text-base">
            <li className="flex items-start gap-2">
              <span className="text-community-green font-bold mt-0.5">•</span>
              <span>Minimum commitment is 3 consecutive issues = 6 months advertising</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-community-green font-bold mt-0.5">•</span>
              <span>Great opportunity to test and trial areas</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-community-green font-bold mt-0.5">•</span>
              <span>Mix the advert sizes, advert designs to experiment and see what works best</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-community-green font-bold mt-0.5">•</span>
              <span>Paid on monthly payment plan</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-community-green font-bold mt-0.5">•</span>
              <span>After six months you can (1) continue (2) change areas, ad size or (3) cancel</span>
            </li>
          </ul>
        </div>

        {/* Right Section - Black Background with Seeing Double */}
        <div className="bg-black p-8 lg:p-10 flex flex-col items-center justify-center min-h-[200px] lg:min-h-0">
          <div className="text-center">
            {/* Main Text */}
            <div className="space-y-1">
              <p className="text-white text-3xl md:text-4xl font-black tracking-wider">SEEING</p>
              <p className="text-white text-3xl md:text-4xl font-black tracking-wider">DOUBLE</p>
            </div>
            
            {/* Reflection Effect */}
            <div 
              className="space-y-1 mt-2 opacity-30"
              style={{ 
                transform: 'scaleY(-1)',
                maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
                WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)'
              }}
            >
              <p className="text-white text-3xl md:text-4xl font-black tracking-wider">DOUBLE</p>
              <p className="text-white text-3xl md:text-4xl font-black tracking-wider">SEEING</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewAdvertiserPromo;
