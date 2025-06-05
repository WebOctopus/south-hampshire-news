const PostcodeBanner = () => {
  const postcodes = [
    'SO14', 'SO15', 'SO16', 'SO17', 'SO18', 'SO19', 'SO30', 'SO31', 'SO32', 'SO40', 'SO41', 'SO42', 'SO43', 'SO45',
    'PO7', 'PO8', 'PO9', 'PO10', 'PO11', 'PO12', 'PO13', 'PO14', 'PO15', 'PO16', 'PO17'
  ];

  return (
    <div className="pt-8 pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Scrolling ticker */}
        <div className="overflow-hidden bg-community-navy rounded-lg py-3">
          <div className="animate-[marquee_30s_linear_infinite] whitespace-nowrap">
            <span className="text-white font-medium">
              {postcodes.concat(postcodes).map((postcode, index) => (
                <span key={index} className="mx-4">{postcode}</span>
              ))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostcodeBanner;