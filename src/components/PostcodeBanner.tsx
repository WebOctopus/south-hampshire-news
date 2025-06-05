const PostcodeBanner = () => {
  const scrollText = "Southampton SO15 SO16 SO17 SO18 SO19 Romsey/Test Valley/ North Baddesley SO51 SO52 SO20 Winchester SO21 SO22 SO23 Hedge End/Botley SO30 Locks Heath SO31 Meons/Whiteley SO32 PO17 Waterside/Totton SO40 SO45 New Forest SO41 SO42 SO43 BH24 Eastleigh SO50 Chandler's Ford SO53 Fareham PO13 PO14 PO15 PO16";

  return (
    <div className="pt-8 pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Scrolling ticker */}
        <div className="overflow-hidden bg-community-navy rounded-lg py-3">
          <div className="animate-[marquee_30s_linear_infinite] whitespace-nowrap">
            <span className="text-white font-medium">
              {/* Duplicate the text to create seamless loop */}
              <span className="mr-8">{scrollText}</span>
              <span className="mr-8">{scrollText}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostcodeBanner;