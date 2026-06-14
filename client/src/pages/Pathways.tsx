import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ArrowRight, GraduationCap, Briefcase } from 'lucide-react';
import { FadeUp, SlideLeft, SlideRight, StaggerContainer, StaggerItem } from '@/components/ScrollAnimations';

const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&q=80', // Modern building
  training: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80', // Medical training
  nhs: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80', // Hospital
};

export default function Pathways() {
  const { t, lang } = useLanguage();

  return (
    <div className="min-h-screen bg-white">
      {/* ===== HERO ===== */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <img src={IMAGES.hero} alt="Modern building" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/95 via-[#0a1628]/80 to-[#0a1628]/50" />
        <div className="container relative z-10 py-32">
          <FadeUp className="max-w-3xl">
            <div className="w-12 h-1 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full mb-6" />
            <h1 className="font-serif text-5xl lg:text-6xl text-white mb-6 leading-tight">
              {t('pathways.title')}
            </h1>
            <p className="text-xl text-white/80 leading-relaxed max-w-2xl">
              {t('pathways.subtitle')}
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ===== TWO PATHWAYS ===== */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container">
          <FadeUp className="text-center mb-16">
            <div className="w-12 h-1 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full mx-auto mb-6" />
            <h2 className="font-serif text-4xl lg:text-5xl text-blue-900 mb-4">
              {lang === 'ar' ? 'اختر مسارك المهني' : 'Choose Your Career Path'}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {lang === 'ar' ? 'مساران واضحان نحو مستقبلك الطبي في المملكة المتحدة' : 'Two clear pathways to your medical future in the United Kingdom'}
            </p>
          </FadeUp>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Journey 1: Training Posts */}
            <SlideLeft>
              <div className="group relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="relative h-64">
                  <img src={IMAGES.training} alt="Medical training" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 to-transparent" />
                  <div className="absolute bottom-6 left-6">
                    <div className="w-14 h-14 bg-teal-500 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                      <GraduationCap className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-8 bg-white">
                  <h3 className="font-serif text-2xl font-bold text-blue-900 mb-4">
                    {t('pathways.journey1')}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {t('pathways.journey1Desc')}
                  </p>
                  <ul className="space-y-3 mb-8">
                    {[
                      lang === 'ar' ? 'وظائف Foundation Doctor (FY1/FY2)' : 'Foundation Doctor (FY1/FY2) positions',
                      lang === 'ar' ? 'برامج التدريب التخصصي' : 'Specialty Training programmes',
                      lang === 'ar' ? 'مسار واضح نحو الاستشاري' : 'Structured progression to Consultant',
                      lang === 'ar' ? 'تطوير مهني طويل المدى' : 'Long-term career development',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-700">
                        <span className="text-teal-500 font-bold mt-0.5">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/apply">
                    <Button className="w-full bg-teal-500 hover:bg-teal-400 text-white py-6 text-lg rounded-xl shadow-lg shadow-teal-500/20 transition-all duration-300 hover:scale-105 active:scale-95">
                      {lang === 'ar' ? 'ابدأ الآن' : 'Get Started'}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </SlideLeft>

            {/* Journey 2: NHS Jobs */}
            <SlideRight>
              <div className="group relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="relative h-64">
                  <img src={IMAGES.nhs} alt="NHS Hospital" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 to-transparent" />
                  <div className="absolute bottom-6 left-6">
                    <div className="w-14 h-14 bg-amber-500 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                      <Briefcase className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-8 bg-white">
                  <h3 className="font-serif text-2xl font-bold text-blue-900 mb-4">
                    {t('pathways.journey2')}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {t('pathways.journey2Desc')}
                  </p>
                  <ul className="space-y-3 mb-8">
                    {[
                      lang === 'ar' ? 'وظائف Clinical Fellow' : 'Clinical Fellow positions',
                      lang === 'ar' ? 'وظائف Trust Grade / SAS Doctor' : 'Trust Grade / SAS Doctor roles',
                      lang === 'ar' ? 'توظيف فوري في NHS' : 'Immediate NHS employment',
                      lang === 'ar' ? 'مرونة في ساعات العمل' : 'Flexible working arrangements',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-700">
                        <span className="text-amber-500 font-bold mt-0.5">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/apply">
                    <Button className="w-full bg-amber-500 hover:bg-amber-400 text-white py-6 text-lg rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-300 hover:scale-105 active:scale-95">
                      {lang === 'ar' ? 'ابدأ الآن' : 'Get Started'}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </SlideRight>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <img src={IMAGES.hero} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-blue-900/90" />
        <div className="container relative z-10 text-center">
          <FadeUp>
            <h2 className="font-serif text-4xl lg:text-5xl text-white mb-6">
              {lang === 'ar' ? 'مستعد لبدء رحلتك؟' : 'Ready to Start Your Journey?'}
            </h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              {lang === 'ar' ? 'فريقنا سيساعدك في تحديد المسار الأنسب لمسيرتك المهنية ويرافقك في كل خطوة' : 'Our team will help you determine the best pathway and guide you every step of the way'}
            </p>
            <Link href="/apply">
              <Button className="bg-teal-500 hover:bg-teal-400 text-white px-10 py-7 text-lg rounded-xl shadow-2xl shadow-teal-500/30 transition-all duration-300 hover:scale-105 active:scale-95">
                {lang === 'ar' ? 'ابدأ التقييم المجاني' : 'Begin Free Assessment'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
