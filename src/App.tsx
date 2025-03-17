
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";

// Pages
import Index from "./pages/Index";
import Estimates from "./pages/Estimates";
import Projects from "./pages/Projects";
import Contacts from "./pages/Contacts";
import TimeTracking from "./pages/TimeTracking";
import NotFound from "./pages/NotFound";

// Layout
import { SidebarProvider } from "./components/layout/SidebarContext";
import Sidebar from "./components/layout/Sidebar";

const queryClient = new QueryClient();

const App = () => {
  // Set document title
  useEffect(() => {
    document.title = "AKC LLC - Construction Management";
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="flex h-screen w-full overflow-hidden">
              <Sidebar />
              <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/estimates" element={<Estimates />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/contacts" element={<Contacts />} />
                    <Route path="/time-tracking" element={<TimeTracking />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AnimatePresence>
              </div>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
