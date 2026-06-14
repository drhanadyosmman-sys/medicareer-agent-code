import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { FadeUp, SlideLeft, SlideRight, StaggerContainer, StaggerItem, AnimatedCounter } from '@/components/ScrollAnimations';

const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1400&q=80', // Hospital corridor
  doctors: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&q=80', // Doctor portrait
  ward: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=1200&q=80', // Hospital ward
  london: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1400&q=80', // London
};

export default function UKDoctors() {
  const { t, lang } = useLanguage();

  return (
    <div className="min-h-screen bg-white">
      {/* ===== HERO ===== */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <img src={IMAGES.hero} alt="Hospital corridor" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/95 via-[#0a1628]/80 to-[#0a1628]/40" />
        <div className="container relative z-10 py-32">
          <FadeUp className="max-w-3xl">
            <div className="w-12 h-1 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full mb-6" />
            <h1 className="font-serif text-5xl lg:text-6xl text-white mb-6 leading-tight">
              {t('ukDoctors.title')}
            </h1>
            <p className="text-xl text-white/80 leading-relaxed max-w-2xl">
              {t('ukDoctors.subtitle')}
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ===== JOB TYPES ===== */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container">
          <FadeUp className="mb-16">
            <div className="w-12 h-1 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full mb-6" />
            <h2 className="font-serif text-4xl lg:text-5xl text-blue-900 mb-4">
              {t('ukDoctors.eligibilityTitle')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl">
              {t('ukDoctors.eligibilityDesc')}
            </p>
          </FadeUp>

          <StaggerContainer className="grid md:grid-cols-2 gap-8" staggerDelay={0.12}>
            {[
              { title: t('ukDoctors.jobType1'), desc: t('ukDoctors.jobType1Desc'), icon: '👨‍⚕️', color: 'from-blue-500 to-blue-700' },
              { title: t('ukDoctors.jobType2'), desc: t('ukDoctors.jobType2Desc'), icon: '🏥', color: 'from-teal-500 to-teal-700' },
              { title: t('ukDoctors.jobType3'), desc: t('ukDoctors.jobType3Desc'), icon: '💼', color: 'from-amber-500 to-amber-700' },
              { title: t('ukDoctors.jobType4'), desc: t('ukDoctors.jobType4Desc'), icon: '🎓', color: 'from-purple-500 to-purple-700' },
            ].map((job, i) => (
              <StaggerItem key={i}>
                <div className="group p-8 rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${job.color} flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform duration-300`}>
                    {job.icon}
                  </div>
                  <h3 className="font-serif text-xl font-bold text-blue-900 mb-3">
                    {job.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {job.desc}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ===== IMAGE BREAK - London ===== */}
      <section className="relative h-[350px] overflow-hidden">
        <img src={IMAGES.london} alt="London" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="container pb-12">
            <FadeUp>
              <div className="grid grid-cols-3 gap-8 max-w-lg">
                <div className="text-center">
                  <div className="font-serif text-3xl font-bold text-white">
                    <AnimatedCounter target={150} suffix="+" />
                  </div>
                  <div className="text-white/70 text-sm mt-1">NHS Trusts</div>
                </div>
                <div className="text-center">
                  <div className="font-serif text-3xl font-bold text-white">
                    <AnimatedCounter target={500} suffix="+" />
                  </div>
                  <div className="text-white/70 text-sm mt-1">{lang === 'ar' ? 'طبيب' : 'Doctors'}</div>
                </div>
                <div className="text-center">
                  <div className="font-serif text-3xl font-bold text-white">
                    <AnimatedCounter target={92} suffix="%" />
                  </div>
                  <div className="text-white/70 text-sm mt-1">{lang === 'ar' ? 'نجاح' : 'Success'}</div>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ===== WHAT WE DO ===== */}
      <section className="py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <SlideLeft>
              <div className="relative">
                <img
                  src={IMAGES.doctors}
                  alt="Doctor"
                  className="rounded-2xl shadow-2xl w-full h-[450px] object-cover"
                />
                <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <div className="font-bold text-blue-900 text-sm">{lang === 'ar' ? 'جاهز للتقديم' : 'Application Ready'}</div>
                      <div className="text-xs text-gray-500">{lang === 'ar' ? 'ملفك مكتمل' : 'Profile Complete'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </SlideLeft>

            <SlideRight>
              <div className="w-12 h-1 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full mb-6" />
              <h2 className="font-serif text-4xl lg:text-5xl text-blue-900 mb-6">
                {t('ukDoctors.whatWeDoTitle')}
              </h2>
              <div className="space-y-6">
                {[
                  { title: t('ukDoctors.whatWeDo1'), desc: t('ukDoctors.whatWeDo1Desc') },
                  { title: t('ukDoctors.whatWeDo2'), desc: t('ukDoctors.whatWeDo2Desc') },
                  { title: t('ukDoctors.whatWeDo3'), desc: t('ukDoctors.whatWeDo3Desc') },
                  { title: t('ukDoctors.whatWeDo4'), desc: t('ukDoctors.whatWeDo4Desc') },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start group">
                    <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-500 transition-colors duration-300">
                      <span className="text-teal-600 font-bold group-hover:text-white transition-colors duration-300">{i + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">{item.title}</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SlideRight>
          </div>
        </div>
      </section>

      {/* ===== REQUIREMENTS ===== */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container">
          <FadeUp className="max-w-3xl mx-auto mb-12 text-center">
            <div className="w-12 h-1 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full mx-auto mb-6" />
            <h2 className="font-serif text-4xl lg:text-5xl text-blue-900 mb-4">
              {t('ukDoctors.reqSectionTitle')}
            </h2>
          </FadeUp>

          {/* Shared GMC requirement */}
          <FadeUp className="max-w-2xl mx-auto mb-10">
            <div className="flex items-start gap-5 p-7 bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl shadow-xl">
              <div className="w-14 h-14 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-white">GMC</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-5 h-5 text-teal-400" />
                  <h3 className="font-semibold text-white text-lg">{t('ukDoctors.reqSharedTitle')}</h3>
                </div>
                <p className="text-white/70 text-sm mt-1">{t('ukDoctors.reqSharedNote')}</p>
              </div>
            </div>
          </FadeUp>

          {/* Two cards side by side */}
          <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
            {/* Service Post */}
            <FadeUp delay={0.1}>
              <div className="h-full rounded-2xl border-2 border-teal-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="bg-teal-500 px-6 py-4 flex items-center justify-between">
                  <h3 className="font-serif text-xl font-bold text-white">{t('ukDoctors.reqServiceTitle')}</h3>
                  <span className="bg-white text-teal-600 text-xs font-bold px-3 py-1 rounded-full">
                    {t('ukDoctors.reqServiceBadge')}
                  </span>
                </div>
                <div className="p-6 space-y-3">
                  {[
                    t('ukDoctors.reqServiceB1'),
                    t('ukDoctors.reqServiceB2'),
                    t('ukDoctors.reqServiceB3'),
                    t('ukDoctors.reqServiceB4'),
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>

            {/* Training Post */}
            <FadeUp delay={0.2}>
              <div className="h-full rounded-2xl border-2 border-blue-900/20 bg-white shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="bg-blue-900 px-6 py-4 flex items-center justify-between">
                  <h3 className="font-serif text-xl font-bold text-white">{t('ukDoctors.reqTrainingTitle')}</h3>
                  <span className="bg-amber-400 text-blue-900 text-xs font-bold px-3 py-1 rounded-full">
                    {t('ukDoctors.reqTrainingBadge')}
                  </span>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-500 mb-4 font-medium">{t('ukDoctors.reqTrainingNote')}</p>
                  <div className="space-y-3">
                    {[
                      { icon: '📋', text: t('ukDoctors.reqTrainingB1') },
                      { icon: '🎓', text: t('ukDoctors.reqTrainingB2') },
                      { icon: '🔬', text: t('ukDoctors.reqTrainingB3') },
                      { icon: '📝', text: t('ukDoctors.reqTrainingB4') },
                      { icon: '💼', text: t('ukDoctors.reqTrainingB5') },
                      { icon: '📊', text: t('ukDoctors.reqTrainingB6') },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="text-base flex-shrink-0 mt-0.5">{item.icon}</span>
                        <span className="text-gray-700 text-sm leading-relaxed">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <img src={IMAGES.ward} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-blue-900/90" />
        <div className="container relative z-10 text-center">
          <FadeUp>
            <h2 className="font-serif text-4xl lg:text-5xl text-white mb-6">
              {lang === 'ar' ? 'مستعد لبدء مسيرتك في NHS؟' : 'Ready to Pursue Your NHS Career?'}
            </h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              {lang === 'ar' ? 'فريقنا سيقيّم ملفك ويرشدك خطوة بخطوة خلال عملية التقديم' : 'Our team will assess your profile and guide you through every step of the application process'}
            </p>
            <Link href="/apply">
              <Button className="bg-teal-500 hover:bg-teal-400 text-white px-10 py-7 text-lg rounded-xl shadow-2xl shadow-teal-500/30 transition-all duration-300 hover:scale-105 active:scale-95">
                {lang === 'ar' ? 'ابدأ التقييم' : 'Start Your Assessment'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
