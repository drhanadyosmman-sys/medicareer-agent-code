import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { store } from '@/lib/store';
import { Menu, X, User, LogOut, LayoutDashboard, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const [location] = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const isAdminRoute = location.startsWith('/admin');
  const isTransparentPage = location === '/' || location === '/pathways' || location === '/uk-doctors';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const updateUnread = () => {
      if (isAdmin) {
        setUnreadCount(store.getAdminUnreadCount());
      } else {
        setUnreadCount(store.getUnreadCount(String(user.id)));
      }
    };
    updateUnread();
    const interval = setInterval(updateUnread, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user, isAdmin]);

  const toggleLang = () => setLang(lang === 'en' ? 'ar' : 'en');

  // Determine text color based on context
  const isLight = (scrolled || !isTransparentPage) && !isAdminRoute;
  const textColor = isAdminRoute ? 'text-white' : isLight ? 'text-gray-700' : 'text-white';
  const textMuted = isAdminRoute ? 'text-white/70' : isLight ? 'text-gray-500' : 'text-white/70';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isAdminRoute
          ? 'bg-[#0a1628] border-b border-white/10'
          : scrolled || !isTransparentPage
          ? 'bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-100/50'
          : 'bg-transparent'
      }`}
    >
      <div className="container flex items-center justify-between h-16 lg:h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-teal-500/20">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className={`font-serif text-lg tracking-tight transition-colors duration-300 ${
            isAdminRoute ? 'text-white' : isLight ? 'text-blue-900' : 'text-white'
          }`}>
            MediCareer<span className="text-teal-500">Agent</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {!isAdminRoute && (
            <>
              {[
                { href: '/', label: t('nav.home') },
                { href: '/pathways', label: t('nav.pathways') },
                { href: '/uk-doctors', label: t('nav.ukDoctorJobs') },
                { href: '/pricing', label: t('nav.pricing') },
              ].map((link) => (
                <Link key={link.href} href={link.href}>
                  <span className={`text-sm font-medium transition-all duration-300 hover:text-teal-500 cursor-pointer relative ${
                    location === link.href
                      ? 'text-teal-500'
                      : textColor
                  }`}>
                    {link.label}
                    {location === link.href && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-teal-500 rounded-full"
                      />
                    )}
                  </span>
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* Right side */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Language Switcher */}
          <button
            onClick={toggleLang}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${textMuted} hover:bg-white/10`}
            title={lang === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
          >
            <Globe className="w-3.5 h-3.5" />
            {lang === 'en' ? 'العربية' : 'English'}
          </button>

          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link href="/admin">
                  <Button variant="outline" size="sm" className={`relative transition-all duration-300 hover:scale-105 ${
                    isAdminRoute ? 'border-white/30 text-white hover:bg-white/10' : isLight ? '' : 'border-white/30 text-white hover:bg-white/10'
                  }`}>
                    <LayoutDashboard className="w-4 h-4 mr-1.5" /> {t('nav.admin')}
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-teal-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </Link>
              )}
              {!isAdmin && (
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className={`relative transition-all duration-300 hover:scale-105 ${
                    isLight ? '' : 'border-white/30 text-white hover:bg-white/10'
                  }`}>
                    <LayoutDashboard className="w-4 h-4 mr-1.5" /> {t('nav.dashboard')}
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-teal-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </Link>
              )}
              <div className={`flex items-center gap-2 text-sm ${textMuted}`}>
                <User className="w-4 h-4" />
                <span className="max-w-[120px] truncate">{user?.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={logout} className={`${textMuted} hover:text-red-500 transition-colors`}>
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className={`${textColor} transition-all duration-300`}>
                  {t('nav.signIn')}
                </Button>
              </Link>
              <Link href="/apply">
                <Button size="sm" className="bg-teal-500 hover:bg-teal-400 text-white rounded-lg shadow-lg shadow-teal-500/20 hover:shadow-teal-400/30 transition-all duration-300 hover:scale-105 active:scale-95">
                  {t('nav.startAssessment')}
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            onClick={toggleLang}
            className={`p-2 rounded-lg text-xs font-medium ${textMuted}`}
          >
            <Globe className="w-4 h-4" />
          </button>
          <button className={`p-2 relative ${textColor}`} onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            {unreadCount > 0 && isAuthenticated && (
              <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-teal-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-xl overflow-hidden"
          >
            <div className="container py-6 space-y-3">
              {[
                { href: '/', label: t('nav.home') },
                { href: '/pathways', label: t('nav.pathways') },
                { href: '/uk-doctors', label: t('nav.ukDoctorJobs') },
                { href: '/pricing', label: t('nav.pricing') },
              ].map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                  <div className={`block py-3 px-4 rounded-xl text-base font-medium transition-colors cursor-pointer ${
                    location === link.href ? 'bg-teal-50 text-teal-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}>
                    {link.label}
                  </div>
                </Link>
              ))}
              <hr className="my-3 border-gray-100" />
              {isAuthenticated ? (
                <>
                  <Link href={isAdmin ? '/admin' : '/dashboard'} onClick={() => setMobileOpen(false)}>
                    <div className="flex items-center justify-between py-3 px-4 text-base font-medium cursor-pointer hover:bg-gray-50 rounded-xl">
                      <span>{isAdmin ? t('nav.admin') : t('nav.dashboard')}</span>
                      {unreadCount > 0 && (
                        <span className="w-5 h-5 bg-teal-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>
                  </Link>
                  <button onClick={() => { logout(); setMobileOpen(false); }} className="block py-3 px-4 text-base font-medium text-red-500 w-full text-left">
                    {t('nav.signOut')}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <div className="block py-3 px-4 text-base font-medium text-gray-700 cursor-pointer">{t('nav.signIn')}</div>
                  </Link>
                  <Link href="/apply" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full bg-teal-500 hover:bg-teal-400 text-white rounded-xl py-3">
                      {t('nav.startAssessment')}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
