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
              <li className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                <a href="mailto:support@hcqsai.uk" style={{ color: 'inherit' }}>support@hcqsai.uk</a>
              </li>
              <li className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>London, United Kingdom</li>
            </ul>
          </div>
        </div>

        {/*
          Company registration. These are factual identifiers, deliberately worded as
          what they are: an ICO entry means the company is on the data-protection
          register, and a UKPRN identifies a provider on the UK Register of Learning
          Providers. Neither is an endorsement of this service, so neither is
          described as one.
        */}
        <div className="mt-12 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex flex-col md:flex-row items-start gap-6 mb-6">
            {/* HCQS mark */}
            <div className="flex-shrink-0">
              <div className="px-3 py-1.5 rounded border" style={{ borderColor: 'rgba(251,191,36,0.3)', backgroundColor: 'rgba(251,191,36,0.05)' }}>
                <span className="font-serif font-bold text-base" style={{ color: '#f59e0b' }}>HCQS</span>
              </div>
            </div>

            {/* Registration Details */}
            <ul className="space-y-2">
              {[
                lang === 'ar'
                  ? 'Healthcare Quality School (HCQS) — شركة أمريكية مسجلة في ولاية كولورادو، مدينة بولدر'
                  : 'Healthcare Quality School (HCQS) — a US company registered in Boulder, Colorado',
                lang === 'ar'
                  ? 'ولها فرع في المملكة المتحدة'
                  : 'with a branch in the United Kingdom',
                lang === 'ar'
                  ? 'مسجلة لدى مكتب مفوض المعلومات البريطاني (ICO)، رقم المرجع: ZC149125'
                  : 'Registered with the UK Information Commissioner’s Office (ICO), reference ZC149125',
                lang === 'ar'
                  ? 'رقم المزوّد في السجل البريطاني لمقدمي التعليم (UKPRN): 10101333'
                  : 'UK Register of Learning Providers reference (UKPRN): 10101333',
                lang === 'ar'
                  ? 'العنوان: 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, United Kingdom'
                  : 'Address: 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, United Kingdom',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: '#f59e0b', opacity: 0.7 }}></span>
                  <span>{item}</span>
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
