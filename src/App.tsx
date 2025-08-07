
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
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AddEvent from "./pages/AddEvent";
import Story from "./pages/Story";
import StoriesArchive from "./pages/StoriesArchive";
import BusinessDetail from "./pages/BusinessDetail";
import CalculatorTest from "./pages/CalculatorTest";
import AdvertisingNew from "./pages/AdvertisingNew";
import ProtectedRoute from "./components/ProtectedRoute";
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
          
          <Route path="/whats-on" element={<WhatsOn />} />
          <Route path="/competitions" element={<Competitions />} />
          <Route path="/advertising" element={<Advertising />} />
          <Route path="/apply-to-distribute" element={<ApplyToDistribute />} />
          <Route path="/contact" element={<Contact />} />
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
          <Route path="/calculator-test" element={<CalculatorTest />} />
          <Route path="/advertising-new" element={<AdvertisingNew />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
