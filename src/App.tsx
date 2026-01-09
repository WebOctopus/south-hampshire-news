
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import BusinessDirectory from "./pages/BusinessDirectory";
import WhatsOn from "./pages/WhatsOn";
import EventsArchive from "./pages/EventsArchive";
import Competitions from "./pages/Competitions";
import Advertising from "./pages/Advertising";
import ApplyToDistribute from "./pages/ApplyToDistribute";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AddEvent from "./pages/AddEvent";
import EventDetail from "./pages/EventDetail";
import Story from "./pages/Story";
import StoriesArchive from "./pages/StoriesArchive";
import BusinessDetail from "./pages/BusinessDetail";
import Support from "./pages/Support";
import PaymentSetup from "./pages/PaymentSetup";

import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import NotFound from "./pages/NotFound";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        
        <Route path="/whats-on" element={<WhatsOn />} />
        <Route path="/whats-on/archive" element={<EventsArchive />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/competitions" element={<Competitions />} />
        <Route path="/advertising" element={<Advertising />} />
        <Route path="/apply-to-distribute" element={<ApplyToDistribute />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/support" element={<Support />} />
        <Route path="/business-directory" element={<BusinessDirectory />} />
        <Route path="/business/:id" element={<BusinessDetail />} />
        <Route path="/stories" element={<StoriesArchive />} />
        <Route path="/story/:id" element={<Story />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/add-event" element={
          <ProtectedRoute>
            <AddEvent />
          </ProtectedRoute>
        } />
        <Route path="/payment-setup" element={<PaymentSetup />} />
        
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
