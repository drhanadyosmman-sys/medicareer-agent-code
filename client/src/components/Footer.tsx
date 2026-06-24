import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const { t, lang } = useLanguage();

  return (
    <footer style={{ backgroundColor: '#0a1628' }} className="text-white">
      {/* Main footer content */}
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="font-serif text-lg text-white">
                MediCareer<span className="text-teal-400">Agent</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {lang === 'ar'
                ? 'دعم مهني لمسيرتك الطبية في بريطانيا. نساعدك على الحصول على وظيفة في نظام الـ NHS.'
                : 'Professional medical career support. We help doctors secure positions in the UK healthcare system.'}
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              {lang === 'ar' ? 'الخدمات' : 'Services'}
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/uk-doctors">
                  <span className="text-sm cursor-pointer hover:text-teal-400 transition-colors" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    {lang === 'ar' ? 'وظائف بريطانيا' : 'UK Doctor Jobs'}
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/pathways">
                  <span className="text-sm cursor-pointer hover:text-teal-400 transition-colors" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    {lang === 'ar' ? 'المسارات المهنية' : 'Career Pathways'}
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/pricing">
                  <span className="text-sm cursor-pointer hover:text-teal-400 transition-colors" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    {lang === 'ar' ? 'الأسعار' : 'Pricing'}
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/apply">
                  <span className="text-sm cursor-pointer hover:text-teal-400 transition-colors" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    {lang === 'ar' ? 'ابدأ التقييم' : 'Start Assessment'}
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              {lang === 'ar' ? 'الموارد' : 'Resources'}
            </h4>
            <ul className="space-y-2.5">
              <li><span className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>{lang === 'ar' ? 'أدلة المسيرة المهنية' : 'Career Guides'}</span></li>
              <li><span className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>{lang === 'ar' ? 'نصائح التقديم' : 'Application Tips'}</span></li>
              <li><span className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>{lang === 'ar' ? 'التحضير للمقابلة' : 'Interview Prep'}</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              {lang === 'ar' ? 'تواصل معنا' : 'Contact'}
            </h4>
            <ul className="space-y-2.5">
              <li className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>support@medicareeragent.com</li>
              <li className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>London, United Kingdom</li>
            </ul>
          </div>
        </div>

        {/* TMLA Company Registration */}
        <div className="mt-12 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex flex-col md:flex-row items-start gap-6 mb-6">
            {/* TMLA Logo Text */}
            <div className="flex-shrink-0">
              <div className="px-3 py-1.5 rounded border" style={{ borderColor: 'rgba(251,191,36,0.3)', backgroundColor: 'rgba(251,191,36,0.05)' }}>
                <span className="font-serif font-bold text-base" style={{ color: '#f59e0b' }}>TMLA</span>
              </div>
            </div>

            {/* Registration Details */}
            <ul className="space-y-2">
              {[
                lang === 'ar' ? 'مسجلة في المملكة العربية السعودية' : 'Registered in the Kingdom of Saudi Arabia',
                lang === 'ar' ? 'السجل التجاري (CR): 7053685355' : 'Commercial Registration (CR): 7053685355',
                lang === 'ar' ? 'مرخصة من وزارة الاستثمار في المملكة العربية السعودية (MISA)' : 'Licensed by the Ministry of Investment of Saudi Arabia (MISA)',
                lang === 'ar' ? 'مملوكة بالكامل لـ TMLA Group Handelsbolag (السويد)' : 'Wholly Owned by TMLA Group Handelsbolag (Sweden)',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#f59e0b', opacity: 0.7 }}></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Copyright */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              © {new Date().getFullYear()} MediCareer Agent.{' '}
              {lang === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
            </p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {lang === 'ar'
                ? 'هذه الخدمة لا تضمن التوظيف.'
                : 'This service does not guarantee employment.'}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
