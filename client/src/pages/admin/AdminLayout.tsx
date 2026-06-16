import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Users, Globe, CreditCard, LayoutDashboard, Briefcase, Send,
  Database, Bell, Menu, X, ChevronRight, ClipboardList
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

const NAV_ITEMS = [
  { href: '/admin', label: 'Applications', icon: Users, exact: true },
  { href: '/admin/nhs-jobs', label: 'NHS Job Matching', icon: Briefcase },
  { href: '/admin/queue', label: 'Application Queue', icon: Send },
  { href: '/admin/job-engine', label: 'Job Collection', icon: Database },
  { href: '/admin/follow-up', label: 'Follow-up Tracker', icon: Bell },
  { href: '/admin/jobs', label: 'Jobs Management', icon: ClipboardList },
  { href: '/admin/countries', label: 'Countries', icon: Globe },
  { href: '/admin/pricing', label: 'Pricing', icon: CreditCard },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (item: typeof NAV_ITEMS[0]) =>
    item.exact ? location === item.href : location.startsWith(item.href);

  return (
    <div className="flex h-screen overflow-hidden pt-16 lg:pt-20">
      {/* ===== DESKTOP SIDEBAR — always visible ===== */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0a1628] text-white flex-shrink-0 h-full overflow-y-auto">
        {/* Brand header */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/10">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-semibold text-sm text-white">Admin Panel</div>
            <div className="text-xs text-white/50">{user?.name || 'Administrator'}</div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV_ITEMS.map(item => {
            const active = isActive(item);
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  active
                    ? 'bg-teal-500/20 text-teal-400 border border-teal-500/20'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}>
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {active && <ChevronRight className="w-3.5 h-3.5 text-teal-400" />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/40 hover:text-white/70 rounded-lg hover:bg-white/5 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* ===== MOBILE SIDEBAR TOGGLE ===== */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-20 left-4 z-50 w-10 h-10 bg-[#0a1628] text-white rounded-lg flex items-center justify-center shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* ===== MOBILE SIDEBAR OVERLAY ===== */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Sidebar panel */}
          <aside className="relative w-72 bg-[#0a1628] text-white h-full overflow-y-auto flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                  <LayoutDashboard className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Admin Panel</div>
                  <div className="text-xs text-white/50">{user?.name || 'Administrator'}</div>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-0.5">
              {NAV_ITEMS.map(item => {
                const active = isActive(item);
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                        active
                          ? 'bg-teal-500/20 text-teal-400'
                          : 'text-white/60 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {item.label}
                    </div>
                  </Link>
                );
              })}
            </nav>
            <div className="p-3 border-t border-white/10">
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs text-white/40 hover:text-white/70 rounded-lg hover:bg-white/5"
              >
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 bg-gray-50 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
