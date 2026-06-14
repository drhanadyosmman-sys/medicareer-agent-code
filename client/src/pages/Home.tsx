import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'wouter';
import { ArrowRight, CheckCircle, Users, FileText, Target, Headphones } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { FadeUp, SlideLeft, SlideRight, ScaleUp, AnimatedCounter, StaggerContainer, StaggerItem, FloatingElement } from '@/components/ScrollAnimations';

// Verified high-quality Unsplash images
const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1400&q=80', // Modern hospital corridor
  doctors: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80', // Doctor smiling
  london: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1400&q=80', // London skyline
  hospital: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&q=80', // Hospital building
  team: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800&q=80', // Medical team
  success: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80', // Doctor with stethoscope
  nhs: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&q=80', // Hospital interior
  interview: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80', // Professional meeting
};

export default function Home() {
  const { t, lang } = useLanguage();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* ===== HERO SECTION - Full screen with parallax ===== */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background image with parallax */}
        <motion.div className="absolute inset-0" style={{ y: heroY }}>
          <img
            src={IMAGES.hero}
            alt="Modern NHS Hospital"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/95 via-[#0a1628]/80 to-[#0a1628]/50" />
        </motion.div>

        {/* Floating decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <FloatingElement className="absolute top-32 right-20 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" amplitude={15} duration={5}><div /></FloatingElement>
          <FloatingElement className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" amplitude={10} duration={7}><div /></FloatingElement>
          <FloatingElement className="absolute top-1/2 right-1/3 w-4 h-4 bg-teal-400/40 rounded-full" amplitude={20} duration={3}><div /></FloatingElement>
          <FloatingElement className="absolute top-1/4 right-1/4 w-3 h-3 bg-amber-400/30 rounded-full" amplitude={15} duration={4}><div /></FloatingElement>
        </div>

        <motion.div className="container relative z-10 py-32" style={{ opacity: heroOpacity }}>
          <div className="max-w-3xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-8"
            >
              <span className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-teal-300">{t('home.badge')}</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6"
            >
              {t('home.heroTitle')}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="text-xl md:text-2xl text-white/80 leading-relaxed mb-4 max-w-2xl"
            >
              {t('home.heroSubtitle')}
            </motion.p>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="text-lg text-white/60 leading-relaxed mb-10 max-w-xl"
            >
              {t('home.heroDesc')}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 mb-10"
            >
              <Link href="/apply">
                <Button className="bg-teal-500 hover:bg-teal-400 text-white px-8 py-6 text-lg rounded-xl shadow-2xl shadow-teal-500/30 hover:shadow-teal-400/40 transition-all duration-300 hover:scale-105 active:scale-95">
                  {t('home.ctaButton')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/apply">
                <Button variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-6 text-lg rounded-xl transition-all duration-300 hover:border-white/50">
                  {t('home.uploadCv')}
                </Button>
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 1 }}
              className="flex flex-wrap gap-6 text-sm"
            >
              <span className="flex items-center gap-2 text-white/70">
                <CheckCircle className="w-5 h-5 text-teal-400" />
                {t('home.noCommitment')}
              </span>
              <span className="flex items-center gap-2 text-white/70">
                <CheckCircle className="w-5 h-5 text-teal-400" />
                {t('home.personalConsultant')}
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-1.5"
          >
            <div className="w-1.5 h-3 bg-white/60 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="relative -mt-16 z-20">
        <div className="container">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: 500, suffix: '+', label: lang === 'ar' ? 'طبيب ساعدناهم' : 'Doctors Helped' },
                { value: 92, suffix: '%', label: lang === 'ar' ? 'نسبة القبول' : 'Success Rate' },
                { value: 150, suffix: '+', label: lang === 'ar' ? 'مستشفى NHS' : 'NHS Trusts' },
                { value: 48, suffix: 'h', label: lang === 'ar' ? 'وقت المراجعة' : 'Review Time' },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="font-serif text-4xl md:text-5xl font-bold text-blue-900">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-gray-500 mt-2 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container">
          <FadeUp className="max-w-3xl mx-auto text-center mb-20">
            <div className="w-12 h-1 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full mx-auto mb-6" />
            <h2 className="font-serif text-4xl lg:text-5xl text-blue-900 mb-4">
              {t('home.howItWorks')}
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              {t('home.howItWorksDesc')}
            </p>
          </FadeUp>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: t('home.step1Title'), desc: t('home.step1Desc'), icon: FileText, color: 'from-blue-500 to-blue-700' },
              { title: t('home.step2Title'), desc: t('home.step2Desc'), icon: Target, color: 'from-teal-500 to-teal-700' },
              { title: t('home.step3Title'), desc: t('home.step3Desc'), icon: Users, color: 'from-amber-500 to-amber-700' },
              { title: t('home.step4Title'), desc: t('home.step4Desc'), icon: Headphones, color: 'from-purple-500 to-purple-700' },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <FadeUp key={i} delay={i * 0.15}>
                  <div className="group relative p-8 rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    {/* Number badge */}
                    <div className="absolute -top-4 -right-4 w-10 h-10 bg-blue-900 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                      {i + 1}
                    </div>
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-blue-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== LONDON IMAGE BREAK ===== */}
      <section className="relative h-[400px] lg:h-[500px] overflow-hidden">
        <img
          src={IMAGES.london}
          alt="London Skyline"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/50 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="container pb-16">
            <FadeUp>
              <h2 className="font-serif text-4xl lg:text-5xl text-white mb-4">
                {lang === 'ar' ? 'مستقبلك المهني يبدأ هنا' : 'Your Career Starts Here'}
              </h2>
              <p className="text-xl text-white/80 max-w-2xl">
                {lang === 'ar' ? 'أكثر من ١٥٠ مستشفى NHS في جميع أنحاء المملكة المتحدة بانتظار طبيب مثلك' : 'Over 150 NHS Trusts across the United Kingdom are waiting for doctors like you'}
              </p>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <SlideLeft>
              <div className="relative">
                <img
                  src={IMAGES.team}
                  alt="Medical team"
                  className="rounded-2xl shadow-2xl w-full h-[500px] object-cover"
                />
                <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-6 max-w-[200px]">
                  <div className="font-serif text-3xl font-bold text-teal-600">
                    <AnimatedCounter target={92} suffix="%" />
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {lang === 'ar' ? 'نسبة النجاح' : 'Success Rate'}
                  </div>
                </div>
              </div>
            </SlideLeft>

            <SlideRight>
              <div className="w-12 h-1 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full mb-6" />
              <h2 className="font-serif text-4xl lg:text-5xl text-blue-900 mb-6">
                {t('home.whyChooseUs')}
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {t('home.whyChooseUsDesc')}
              </p>
              <div className="space-y-6">
                {[
                  { title: t('home.reason1Title'), desc: t('home.reason1Desc') },
                  { title: t('home.reason2Title'), desc: t('home.reason2Desc') },
                  { title: t('home.reason3Title'), desc: t('home.reason3Desc') },
                  { title: t('home.reason4Title'), desc: t('home.reason4Desc') },
                ].map((reason, i) => (
                  <div key={i} className="flex gap-4 items-start group">
                    <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-500 transition-colors duration-300">
                      <CheckCircle className="w-5 h-5 text-teal-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">{reason.title}</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{reason.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SlideRight>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container">
          <FadeUp className="max-w-3xl mx-auto text-center mb-16">
            <div className="w-12 h-1 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full mx-auto mb-6" />
            <h2 className="font-serif text-4xl lg:text-5xl text-blue-900 mb-4">
              {t('home.testimonialsTitle')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('home.testimonialsDesc')}
            </p>
          </FadeUp>

          <StaggerContainer className="grid md:grid-cols-3 gap-8" staggerDelay={0.15}>
            {[
              { text: t('home.testimonial1'), img: IMAGES.doctors },
              { text: t('home.testimonial2'), img: IMAGES.success },
              { text: t('home.testimonial3'), img: IMAGES.interview },
            ].map((testimonial, i) => (
              <StaggerItem key={i}>
                <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <span key={j} className="text-amber-400 text-lg">★</span>
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-6 italic">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-3 mt-auto">
                    <img src={testimonial.img} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-teal-200" />
                    <div>
                      <div className="font-semibold text-blue-900 text-sm">
                        {lang === 'ar' ? 'طبيب متخصص' : 'Medical Professional'}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        🇬🇧 NHS Doctor
                      </div>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ===== HOSPITAL IMAGE BREAK ===== */}
      <section className="relative h-[350px] overflow-hidden">
        <img
          src={IMAGES.hospital}
          alt="NHS Hospital"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-blue-900/70 backdrop-blur-[2px]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <FadeUp className="text-center max-w-3xl px-4">
            <h2 className="font-serif text-4xl lg:text-5xl text-white mb-4">
              {lang === 'ar' ? 'نتولى كل شيء نيابةً عنك' : 'We Handle Everything For You'}
            </h2>
            <p className="text-xl text-white/80">
              {lang === 'ar' ? 'من تجهيز الملف إلى التقديم والمقابلة — فريقنا يعمل خلف الكواليس لضمان نجاحك' : 'From profile preparation to application and interview — our team works behind the scenes to ensure your success'}
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container">
          <FadeUp className="max-w-3xl mx-auto text-center mb-16">
            <div className="w-12 h-1 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full mx-auto mb-6" />
            <h2 className="font-serif text-4xl lg:text-5xl text-blue-900 mb-4">
              {t('home.faqTitle')}
            </h2>
          </FadeUp>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { q: t('home.faq1Q'), a: t('home.faq1A') },
              { q: t('home.faq2Q'), a: t('home.faq2A') },
              { q: t('home.faq3Q'), a: t('home.faq3A') },
              { q: t('home.faq4Q'), a: t('home.faq4A') },
              { q: t('home.faq5Q'), a: t('home.faq5A') },
              { q: t('home.faq6Q'), a: t('home.faq6A') },
            ].map((faq, i) => (
              <FadeUp key={i} delay={i * 0.05}>
                <details className="group border border-gray-200 rounded-xl p-6 hover:border-teal-300 hover:shadow-md transition-all duration-300 cursor-pointer bg-white">
                  <summary className="font-serif text-lg font-bold text-blue-900 flex items-center justify-between list-none">
                    {faq.q}
                    <span className="text-teal-500 group-open:rotate-180 transition-transform duration-300 text-sm">▼</span>
                  </summary>
                  <p className="text-gray-600 mt-4 leading-relaxed border-t border-gray-100 pt-4">
                    {faq.a}
                  </p>
                </details>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <img
          src={IMAGES.nhs}
          alt="Hospital interior"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 to-blue-900/85" />

        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <FloatingElement className="absolute top-20 right-20 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" amplitude={12} duration={6}><div /></FloatingElement>
          <FloatingElement className="absolute bottom-10 left-20 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl" amplitude={8} duration={5}><div /></FloatingElement>
        </div>

        <div className="container relative z-10">
          <FadeUp className="max-w-2xl mx-auto text-center">
            <h2 className="font-serif text-4xl lg:text-5xl text-white mb-6 leading-tight">
              {t('home.ctaFinalTitle')}
            </h2>
            <p className="text-xl text-white/80 mb-10">
              {t('home.ctaFinalDesc')}
            </p>
            <Link href="/apply">
              <Button className="bg-teal-500 hover:bg-teal-400 text-white px-10 py-7 text-lg rounded-xl shadow-2xl shadow-teal-500/30 hover:shadow-teal-400/40 transition-all duration-300 hover:scale-105 active:scale-95">
                {t('home.beginAssessment')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
