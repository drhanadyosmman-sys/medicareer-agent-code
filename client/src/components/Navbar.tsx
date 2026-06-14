import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';

const LOGO_URL = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663502631447/3tsQVrLUcXjTB9oAq7mMW6/medicareer-logo-42Zj2vUEyBmUToQiEzq5VB.webp';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();

  const isAdminRoute = location.startsWith('/admin');

  return (
    <header className={`sticky top-0 z-50 transition-all duration-200 ${isAdminRoute ? 'bg-navy text-white' : 'bg-white/95 backdrop-blur-md border-b border-border'}`}>
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <img src={LOGO_URL} alt="MediCareer Agent" className="h-9 w-9" />
          <span className={`font-serif text-lg tracking-tight ${isAdminRoute ? 'text-white' : 'text-navy'}`}>
            MediCareer<span className="text-teal">Agent</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {!isAdminRoute && (
            <>
              <Link href="/" className={`text-sm font-medium transition-colors hover:text-teal ${location === '/' ? 'text-teal' : 'text-foreground/80'}`}>Home</Link>
              <Link href="/pathways" className={`text-sm font-medium transition-colors hover:text-teal ${location === '/pathways' ? 'text-teal' : 'text-foreground/80'}`}>Pathways</Link>
              <Link href="/uk-doctors" className={`text-sm font-medium transition-colors hover:text-teal ${location === '/uk-doctors' ? 'text-teal' : 'text-foreground/80'}`}>UK Doctor Jobs</Link>
              <Link href="/pricing" className={`text-sm font-medium transition-colors hover:text-teal ${location === '/pricing' ? 'text-teal' : 'text-foreground/80'}`}>Pricing</Link>
            </>
          )}
        </nav>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link href="/admin">
                  <Button variant="outline" size="sm" className={isAdminRoute ? 'border-white/30 text-white hover:bg-white/10' : ''}>
                    <LayoutDashboard className="w-4 h-4 mr-1.5" /> Admin
                  </Button>
                </Link>
              )}
              {!isAdmin && (
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    <LayoutDashboard className="w-4 h-4 mr-1.5" /> Dashboard
                  </Button>
                </Link>
              )}
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4" />
                <span className="max-w-[120px] truncate">{user?.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={logout} className={isAdminRoute ? 'text-white/70 hover:text-white hover:bg-white/10' : ''}>
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/apply">
                <Button size="sm" className="bg-teal hover:bg-teal/90 text-white btn-press">
                  Start Assessment
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-border p-4 space-y-3">
          <Link href="/" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium">Home</Link>
          <Link href="/pathways" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium">Pathways</Link>
          <Link href="/uk-doctors" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium">UK Doctor Jobs</Link>
          <Link href="/pricing" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium">Pricing</Link>
          <hr className="my-2" />
          {isAuthenticated ? (
            <>
              <Link href={isAdmin ? '/admin' : '/dashboard'} onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium">
                {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
              </Link>
              <button onClick={() => { logout(); setMobileOpen(false); }} className="block py-2 text-sm font-medium text-destructive">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium">Sign In</Link>
              <Link href="/apply" onClick={() => setMobileOpen(false)}>
                <Button className="w-full bg-teal hover:bg-teal/90 text-white">Start Assessment</Button>
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
