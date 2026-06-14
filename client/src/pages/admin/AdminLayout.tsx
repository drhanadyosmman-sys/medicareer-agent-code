import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { Users, Globe, CreditCard, LayoutDashboard, Briefcase, Send } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

function getNavItems(t: (key: string) => string) {
  return [
    { href: '/admin', label: t('admin.applications'), icon: Users },
    { href: '/admin/nhs-jobs', label: 'NHS Job Matching', icon: Briefcase },
    { href: '/admin/queue', label: 'Application Queue', icon: Send },
    { href: '/admin/countries', label: t('admin.countries'), icon: Globe },
    { href: '/admin/pricing', label: t('admin.pricingManager'), icon: CreditCard },
  ];
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { t } = useLanguage();
  const NAV_ITEMS = getNavItems(t);

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="w-64 bg-navy text-white shrink-0 hidden lg:block">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-teal" />
            <span className="font-semibold text-sm">{t('nav.admin')}</span>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map(item => {
            const isActive = location === item.href || (item.href !== '/admin' && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-teal/20 text-teal' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-navy border-t border-white/10 z-50 p-2 flex justify-around">
        {NAV_ITEMS.map(item => {
          const isActive = location === item.href || (item.href !== '/admin' && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-xs ${isActive ? 'text-teal' : 'text-white/60'}`}>
                <item.icon className="w-4 h-4" />
                {item.label.split(' ')[0]}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main content */}
      <main className="flex-1 bg-ivory p-6 lg:p-8 overflow-auto pb-20 lg:pb-8">
        {children}
      </main>
    </div>
  );
}
