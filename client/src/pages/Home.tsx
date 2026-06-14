import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'wouter';
import { CheckCircle, ArrowRight, Users, TrendingUp, Shield, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

const HOSPITAL_IMG = '/manus-storage/hero-international-hospital.png';

export default function Home() {
  const { t, lang } = useLanguage();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-blue-800 to-blue-950 text-white py-20 lg:py-32">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 left-10 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />
        </div>

        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="space-y-8 animate-fade-in">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/20 border border-teal-500/30 rounded-full w-fit">
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                <span className="text-sm text-teal-300">{t('home.badge')}</span>
              </div>

              {/* Main Headline - PROMINENT VALUE PROP */}
              <div className="space-y-4">
                <h1 className="font-serif text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                  {t('home.heroTitle')}
                </h1>
                <p className="text-xl text-white/80 leading-relaxed">
                  {t('home.heroSubtitle')}
                </p>
              </div>

              {/* Description */}
              <p className="text-lg text-white/70 leading-relaxed max-w-xl">
                {t('home.heroDesc')}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/apply">
                  <Button className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    {t('home.ctaButton')}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/apply">
                  <Button variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg rounded-lg">
                    {t('home.uploadCv')}
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-col sm:flex-row gap-6 pt-4 text-sm">
                <span className="flex items-center gap-2 text-white/80">
                  <CheckCircle className="w-5 h-5 text-teal-400" />
                  {t('home.noCommitment')}
                </span>
                <span className="flex items-center gap-2 text-white/80">
                  <CheckCircle className="w-5 h-5 text-teal-400" />
                  {t('home.personalConsultant')}
                </span>
              </div>
            </div>

            {/* Right: Image */}
            <div className="hidden lg:block animate-slide-down" style={{ transform: `translateY(${scrollY * 0.1}px)` }}>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/20 to-blue-500/20 rounded-2xl blur-2xl" />
                <img
                  src={HOSPITAL_IMG}
                  alt="Modern hospital"
                  className="relative rounded-2xl shadow-2xl object-cover w-full h-96 border border-white/10"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in">
            <div className="gold-line mx-auto" />
            <h2 className="font-serif text-4xl lg:text-5xl mb-4 text-blue-900">
              {t('home.howItWorks')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('home.howItWorksDesc')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: t('home.step1Title'), desc: t('home.step1Desc'), icon: '📤', delay: 1 },
              { title: t('home.step2Title'), desc: t('home.step2Desc'), icon: '🔍', delay: 2 },
              { title: t('home.step3Title'), desc: t('home.step3Desc'), icon: '✍️', delay: 3 },
              { title: t('home.step4Title'), desc: t('home.step4Desc'), icon: '🎯', delay: 4 },
            ].map((step, i) => (
              <Card
                key={i}
                className={`p-6 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-white animate-stagger-${step.delay}`}
              >
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="font-serif text-xl font-bold text-blue-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-blue-50 to-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in">
            <div className="gold-line mx-auto" />
            <h2 className="font-serif text-4xl lg:text-5xl mb-4 text-blue-900">
              {t('home.whyChooseUs')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('home.whyChooseUsDesc')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: t('home.reason1Title'), desc: t('home.reason1Desc'), icon: Users },
              { title: t('home.reason2Title'), desc: t('home.reason2Desc'), icon: TrendingUp },
              { title: t('home.reason3Title'), desc: t('home.reason3Desc'), icon: Shield },
              { title: t('home.reason4Title'), desc: t('home.reason4Desc'), icon: Zap },
            ].map((reason, i) => {
              const Icon = reason.icon;
              return (
                <div
                  key={i}
                  className={`p-8 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-teal-200 animate-stagger-${i + 1}`}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-blue-900 mb-3">
                    {reason.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {reason.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in">
            <div className="gold-line mx-auto" />
            <h2 className="font-serif text-4xl lg:text-5xl mb-4 text-blue-900">
              {t('home.testimonialsTitle')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('home.testimonialsDesc')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              t('home.testimonial1'),
              t('home.testimonial2'),
              t('home.testimonial3'),
            ].map((testimonial, i) => (
              <Card
                key={i}
                className={`p-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-white animate-stagger-${i + 1}`}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className="text-amber-400">★</span>
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  "{testimonial}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-blue-600 rounded-full" />
                  <div className="text-sm font-semibold text-blue-900">
                    {lang === 'ar' ? 'طبيب متخصص' : 'Medical Professional'}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-blue-50 to-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in">
            <div className="gold-line mx-auto" />
            <h2 className="font-serif text-4xl lg:text-5xl mb-4 text-blue-900">
              {t('home.faqTitle')}
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { q: t('home.faq1Q'), a: t('home.faq1A') },
              { q: t('home.faq2Q'), a: t('home.faq2A') },
              { q: t('home.faq3Q'), a: t('home.faq3A') },
              { q: t('home.faq4Q'), a: t('home.faq4A') },
              { q: t('home.faq5Q'), a: t('home.faq5A') },
              { q: t('home.faq6Q'), a: t('home.faq6A') },
            ].map((faq, i) => (
              <details
                key={i}
                className="group border border-gray-200 rounded-lg p-6 hover:border-teal-300 transition-colors duration-300 cursor-pointer"
              >
                <summary className="font-serif text-lg font-bold text-blue-900 flex items-center justify-between">
                  {faq.q}
                  <span className="text-teal-500 group-open:rotate-180 transition-transform duration-300">▼</span>
                </summary>
                <p className="text-gray-600 mt-4 leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="relative overflow-hidden py-20 lg:py-32 bg-gradient-to-r from-blue-900 to-blue-950 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-10 w-72 h-72 bg-blue-400/5 rounded-full blur-3xl" />
        </div>

        <div className="container relative z-10">
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <h2 className="font-serif text-4xl lg:text-5xl mb-6 leading-tight">
              {t('home.ctaFinalTitle')}
            </h2>
            <p className="text-xl text-white/80 mb-8">
              {t('home.ctaFinalDesc')}
            </p>
            <Link href="/apply">
              <Button className="bg-teal-500 hover:bg-teal-600 text-white px-10 py-7 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                {t('home.beginAssessment')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
