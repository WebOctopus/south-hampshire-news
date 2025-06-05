import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import BusinessDirectory from "./pages/BusinessDirectory";
import WhatsOn from "./pages/WhatsOn";
import Competitions from "./pages/Competitions";
import Advertising from "./pages/Advertising";
import ApplyToDistribute from "./pages/ApplyToDistribute";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/directory" element={<BusinessDirectory />} />
          <Route path="/whats-on" element={<WhatsOn />} />
          <Route path="/competitions" element={<Competitions />} />
          <Route path="/advertising" element={<Advertising />} />
          <Route path="/apply-to-distribute" element={<ApplyToDistribute />} />
          <Route path="/contact" element={<Contact />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
