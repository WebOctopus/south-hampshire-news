import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Phone, Send } from "lucide-react";

const businessSectors = [
  "Retail",
  "Food & Hospitality",
  "Health & Beauty",
  "Home & Garden",
  "Professional Services",
  "Trades & Construction",
  "Education & Training",
  "Entertainment & Leisure",
  "Automotive",
  "Other",
];

export const EnquiryFormSection = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    surname: "",
    businessName: "",
    website: "",
    addressLine1: "",
    addressLine2: "",
    addressLine3: "",
    postalTown: "",
    sector: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.firstName || !formData.surname || !formData.businessName || 
        !formData.website || !formData.addressLine1 || !formData.postalTown || !formData.sector) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields marked with *",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Enquiry submitted!",
        description: "Thank you for your interest. Our team will be in touch shortly.",
      });
      setFormData({
        firstName: "",
        surname: "",
        businessName: "",
        website: "",
        addressLine1: "",
        addressLine2: "",
        addressLine3: "",
        postalTown: "",
        sector: "",
      });
      setIsSubmitting(false);
    }, 1000);
  };

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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: First Name & Surname */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-community-navy font-medium">
                First name <span className="text-pink-500">*</span>
              </Label>
              <Input
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder=""
                className="bg-blue-50/80 border-0 rounded-lg focus:ring-2 focus:ring-community-green"
              />
              <p className="text-sm text-gray-500">First name only (no middle names)</p>
            </div>
            <div className="space-y-2">
              <Label className="text-community-navy font-medium">
                Your Surname <span className="text-pink-500">*</span>
              </Label>
              <Input
                value={formData.surname}
                onChange={(e) => handleInputChange("surname", e.target.value)}
                placeholder=""
                className="bg-blue-50/80 border-0 rounded-lg focus:ring-2 focus:ring-community-green"
              />
              <p className="text-sm text-gray-500">Last name only (no middle names)</p>
            </div>
          </div>

          {/* Row 2: Business Name & Website */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-community-navy font-medium">
                Business name <span className="text-pink-500">*</span>
              </Label>
              <Input
                value={formData.businessName}
                onChange={(e) => handleInputChange("businessName", e.target.value)}
                placeholder=""
                className="bg-blue-50/80 border-0 rounded-lg focus:ring-2 focus:ring-community-green"
              />
              <p className="text-sm text-gray-500">if sole trader please enter 'your name trading as XYZ'</p>
            </div>
            <div className="space-y-2">
              <Label className="text-community-navy font-medium">
                Your business Website <span className="text-pink-500">*</span>
              </Label>
              <Input
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder=""
                className="bg-blue-50/80 border-0 rounded-lg focus:ring-2 focus:ring-community-green"
              />
            </div>
          </div>

          {/* Row 3: Address Line 1 & Business Sector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-community-navy font-medium">
                Address line 1 <span className="text-pink-500">*</span>
              </Label>
              <Input
                value={formData.addressLine1}
                onChange={(e) => handleInputChange("addressLine1", e.target.value)}
                placeholder=""
                className="bg-blue-50/80 border-0 rounded-lg focus:ring-2 focus:ring-community-green"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-community-navy font-medium">
                Business Sector <span className="text-pink-500">*</span>
              </Label>
              <Select
                value={formData.sector}
                onValueChange={(value) => handleInputChange("sector", value)}
              >
                <SelectTrigger className="bg-blue-50/80 border-0 rounded-lg focus:ring-2 focus:ring-community-green">
                  <SelectValue placeholder="Select a sector" />
                </SelectTrigger>
                <SelectContent>
                  {businessSectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 4: Address Line 2 & 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-community-navy font-medium">
                Street Address 2
              </Label>
              <Input
                value={formData.addressLine2}
                onChange={(e) => handleInputChange("addressLine2", e.target.value)}
                placeholder=""
                className="bg-blue-50/80 border-0 rounded-lg focus:ring-2 focus:ring-community-green"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-community-navy font-medium">
                Street address 3
              </Label>
              <Input
                value={formData.addressLine3}
                onChange={(e) => handleInputChange("addressLine3", e.target.value)}
                placeholder=""
                className="bg-blue-50/80 border-0 rounded-lg focus:ring-2 focus:ring-community-green"
              />
            </div>
          </div>

          {/* Row 5: Postal Town */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-community-navy font-medium">
                Postal Town / City <span className="text-pink-500">*</span>
              </Label>
              <Input
                value={formData.postalTown}
                onChange={(e) => handleInputChange("postalTown", e.target.value)}
                placeholder=""
                className="bg-blue-50/80 border-0 rounded-lg focus:ring-2 focus:ring-community-green"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-community-green hover:bg-community-green/90 text-white font-semibold px-8 py-3 rounded-full"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? "Submitting..." : "Submit Enquiry"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};
