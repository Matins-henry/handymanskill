import { Toaster } from "@/components/ui/toaster";
import { Switch, Route } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfilePage from "@/pages/ProfilePage";
import JobMatchesPage from "@/pages/JobMatchesPage";
import PortfolioPage from "@/pages/PortfolioPage";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={ProfilePage} />
          <Route path="/job-matches" component={JobMatchesPage} />
          <Route path="/portfolio" component={PortfolioPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

export default App;
