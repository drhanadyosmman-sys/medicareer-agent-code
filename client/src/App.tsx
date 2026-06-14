import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import UKDoctors from "./pages/UKDoctors";
import Pathways from "./pages/Pathways";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import Apply from "./pages/Apply";
import Dashboard from "./pages/Dashboard";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminApplications from "./pages/admin/AdminApplications";
import AdminCountries from "./pages/admin/AdminCountries";
import AdminPricing from "./pages/admin/AdminPricing";
import { useLocation } from "wouter";

function AdminRoutes() {
  return (
    <AdminLayout>
      <Switch>
        <Route path="/admin" component={AdminApplications} />
        <Route path="/admin/countries" component={AdminCountries} />
        <Route path="/admin/pricing" component={AdminPricing} />
        <Route component={AdminApplications} />
      </Switch>
    </AdminLayout>
  );
}

function Router() {
  const [location] = useLocation();
  const isAdmin = location.startsWith('/admin');
  const hideFooter = isAdmin || location === '/apply' || location === '/dashboard';

  return (
    <>
      <Navbar />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/uk-doctors" component={UKDoctors} />
        <Route path="/pathways" component={Pathways} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/login" component={Login} />
        <Route path="/apply" component={Apply} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/admin/:rest*" component={AdminRoutes} />
        <Route path="/admin" component={AdminRoutes} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
      {!hideFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
