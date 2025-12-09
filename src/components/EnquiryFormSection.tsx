import { useEffect, useRef } from "react";

declare global {
  interface Window {
    hbspt?: {
      forms: {
        create: (config: {
          portalId: string;
          formId: string;
          region: string;
          target?: string;
        }) => void;
      };
    };
  }
}

export const EnquiryFormSection = () => {
  const formContainerRef = useRef<HTMLDivElement>(null);
  const formCreatedRef = useRef(false);

  useEffect(() => {
    // Only create form once
    if (formCreatedRef.current) return;

    const loadHubSpotForm = () => {
      if (window.hbspt && formContainerRef.current) {
        window.hbspt.forms.create({
          portalId: "25481513",
          formId: "ad2b2025-fd37-4f0a-9016-1f1418fbdf0e",
          region: "eu1",
          target: "#hubspot-form-container",
        });
        formCreatedRef.current = true;
      }
    };

    // Check if script already exists
    const existingScript = document.querySelector(
      'script[src="//js-eu1.hsforms.net/forms/embed/v2.js"]'
    );

    if (existingScript) {
      // Script already loaded, just create form
      loadHubSpotForm();
    } else {
      // Load the HubSpot script
      const script = document.createElement("script");
      script.src = "//js-eu1.hsforms.net/forms/embed/v2.js";
      script.charset = "utf-8";
      script.async = true;
      script.onload = loadHubSpotForm;
      document.body.appendChild(script);
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-community-magenta mb-2">
            Or Call{" "}
            <a
              href="tel:02380276396"
              className="text-community-navy hover:underline"
            >
              023 8027 6396
            </a>{" "}
            for an Instant Quote
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            If you would like one of our team to contact you to discuss your requirements, 
            we very politely request your contact details below. By filling out this form, 
            you consent to be contacted by a member of our sales team.
          </p>
        </div>

        {/* HubSpot Form Container */}
        <div 
          id="hubspot-form-container" 
          ref={formContainerRef}
          className="min-h-[400px]"
        />
      </div>
    </section>
  );
};
