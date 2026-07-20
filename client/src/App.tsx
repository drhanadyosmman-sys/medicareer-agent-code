import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { ReactNode, useEffect } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import UKDoctors from "./pages/UKDoctors";
import Pathways from "./pages/Pathways";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import Apply from "./pages/Apply";
import Dashboard from "./pages/Dashboard";
import Checkout from "./pages/Checkout";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminApplications from "./pages/admin/AdminApplications";
import AdminCountries from "./pages/admin/AdminCountries";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminNHSJobs from "./pages/admin/AdminNHSJobs";
import AdminQueue from "./pages/admin/AdminQueue";
import AdminJobEngine from "./pages/admin/AdminJobEngine";
import AdminFollowUp from "./pages/admin/AdminFollowUp";
import AdminJobs from "./pages/admin/AdminJobs";
import { useLocation } from "wouter";

/**
 * Gate for the /admin/* routes.
 *
 * NOTE: this is a UI guard, not security. Auth currently lives entirely in the
 * browser (see lib/store.ts), so a determined visitor can still edit localStorage
 * and get in. It stops casual access and gives us the right shape to hang real
 * server-side checks off once the backend exists — at that point this should
 * switch to the `useAuth` hook in _core/hooks, which reads the httpOnly session
 * cookie via trpc.auth.me, and the server must enforce `adminProcedure` too.
 */
function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAdmin, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    // Wait for the session check to resolve; redirecting while it is still in
    // flight would bounce a legitimate admin out on every page load.
    if (loading) return;
    if (!isAuthenticated || !isAdmin) navigate('/login', { replace: true });
  }, [loading, isAuthenticated, isAdmin, navigate]);

  if (loading || !isAuthenticated || !isAdmin) return null;
  return <>{children}</>;
}

function AdminRoutes() {
  return (
    <AdminLayout>
      <Switch>
        <Route path="/admin" component={AdminApplications} />
        <Route path="/admin/nhs-jobs" component={AdminNHSJobs} />
        <Route path="/admin/queue" component={AdminQueue} />
        <Route path="/admin/job-engine" component={AdminJobEngine} />
        <Route path="/admin/follow-up" component={AdminFollowUp} />
        <Route path="/admin/jobs" component={AdminJobs} />
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
  const hideFooter = isAdmin || location === '/apply' || location === '/dashboard' || location === '/checkout';

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
        <Route path="/checkout" component={Checkout} />
        <Route path="/admin/:rest*">
          <RequireAdmin><AdminRoutes /></RequireAdmin>
        </Route>
        <Route path="/admin">
          <RequireAdmin><AdminRoutes /></RequireAdmin>
        </Route>
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
        <LanguageProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
