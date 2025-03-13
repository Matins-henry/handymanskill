import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import JobDetails from "@/pages/JobDetails";
import ProfilePage from "@/pages/ProfilePage";
import PortfolioPage from "@/pages/PortfolioPage";
import JobMatchesPage from "@/pages/JobMatchesPage";
import AuthPages from "@/pages/AuthPages";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";

// Simple animation for page transitions
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1.0]
    }
  },
  exit: { 
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3
    }
  }
};

function Router() {
  const [location] = useLocation();
  
  // Check if we're on an auth page
  const isAuthPage = location === "/login" || location === "/register" || location === "/forgot-password";
  
  return (
    <div className="flex flex-col min-h-screen">
      {!isAuthPage && <Navbar />}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={location}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
            className="w-full h-full"
          >
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/jobs/:id" component={JobDetails} />
              <Route path="/job-matches" component={JobMatchesPage} />
              <Route path="/profile" component={ProfilePage} />
              <Route path="/portfolio" component={PortfolioPage} />
              <Route path="/login" component={AuthPages} />
              <Route path="/register" component={AuthPages} />
              <Route path="/forgot-password" component={AuthPages} />
              <Route component={NotFound} />
            </Switch>
          </motion.div>
        </AnimatePresence>
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
