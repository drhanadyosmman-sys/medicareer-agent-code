import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ArrowRight, GraduationCap, Briefcase, CheckCircle } from 'lucide-react';
import { FadeUp, SlideLeft, SlideRight } from '@/components/ScrollAnimations';

const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&q=80',
  training: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80',
  nhs: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
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

      {/* ===== TWO SERVICE CARDS ===== */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container">
          <FadeUp className="text-center mb-16">
            <div className="w-12 h-1 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full mx-auto mb-6" />
            <h2 className="font-serif text-4xl lg:text-5xl text-blue-900 mb-4">
              {lang === 'ar' ? 'كيف نساعدك' : 'How We Help You'}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {lang === 'ar'
                ? 'نتولى عملية البحث والتقديم بالكامل — أنت تركّز على طبك'
                : 'We handle the entire search and application process — you focus on your medicine'}
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
                  <div className="mb-4">
                    <h3 className="font-serif text-2xl font-bold text-blue-900">
                      {t('pathways.journey1')}
                    </h3>
                    <span className="inline-block mt-1 text-sm font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                      {t('pathways.journey1Subtitle')}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {t('pathways.journey1Desc')}
                  </p>
                  <ul className="space-y-3 mb-8">
                    {[
                      t('pathways.journey1Bullet1'),
                      t('pathways.journey1Bullet2'),
                      t('pathways.journey1Bullet3'),
                      t('pathways.journey1Bullet4'),
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
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
                  <div className="mb-4">
                    <h3 className="font-serif text-2xl font-bold text-blue-900">
                      {t('pathways.journey2')}
                    </h3>
                    <span className="inline-block mt-1 text-sm font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                      {t('pathways.journey2Subtitle')}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {t('pathways.journey2Desc')}
                  </p>
                  <ul className="space-y-3 mb-8">
                    {[
                      t('pathways.journey2Bullet1'),
                      t('pathways.journey2Bullet2'),
                      t('pathways.journey2Bullet3'),
                      t('pathways.journey2Bullet4'),
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
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

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-24 lg:py-32 bg-gradient-to-b from-blue-50 to-white">
        <div className="container">
          <FadeUp className="text-center mb-16">
            <div className="w-12 h-1 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full mx-auto mb-6" />
            <h2 className="font-serif text-4xl lg:text-5xl text-blue-900 mb-4">
              {lang === 'ar' ? 'ماذا نفعل بالضبط؟' : 'What Exactly Do We Do?'}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {lang === 'ar'
                ? 'نتولى كل خطوة في عملية التقديم — من البحث عن الوظيفة حتى تلقي العرض'
                : 'We handle every step of the application process — from finding the job to receiving the offer'}
            </p>
          </FadeUp>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  step: '01',
                  title: lang === 'ar' ? 'نقيّم ملفك' : 'We Assess Your Profile',
                  desc: lang === 'ar' ? 'نراجع سيرتك الذاتية ومستنداتك ونحدد نقاط القوة والضعف' : 'We review your CV and documents, identifying strengths and areas for improvement',
                  color: 'bg-blue-100 text-blue-700',
                },
                {
                  step: '02',
                  title: lang === 'ar' ? 'نبحث عن الوظائف' : 'We Search for Jobs',
                  desc: lang === 'ar' ? 'نبحث يومياً في NHS Jobs وغيرها عن الوظائف التي تناسب ملفك' : 'We search NHS Jobs daily for vacancies that match your profile and experience',
                  color: 'bg-teal-100 text-teal-700',
                },
                {
                  step: '03',
                  title: lang === 'ar' ? 'نجهّز طلبك' : 'We Prepare Your Application',
                  desc: lang === 'ar' ? 'نعيد كتابة سيرتك الذاتية ونجهّز خطاب التغطية والمعلومات الداعمة لكل وظيفة' : 'We rewrite your CV, craft a cover letter, and prepare supporting information tailored to each role',
                  color: 'bg-amber-100 text-amber-700',
                },
                {
                  step: '04',
                  title: lang === 'ar' ? 'نقدّم ونتابع' : 'We Submit & Follow Up',
                  desc: lang === 'ar' ? 'نقدّم الطلب نيابةً عنك ونتابع الردود ونجهّزك للمقابلة عند الترشيح' : 'We submit the application on your behalf, track responses, and prepare you for interview when shortlisted',
                  color: 'bg-purple-100 text-purple-700',
                },
              ].map((item, i) => (
                <FadeUp key={i} delay={i * 0.1}>
                  <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                    <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center font-bold text-sm mb-4`}>
                      {item.step}
                    </div>
                    <h4 className="font-semibold text-blue-900 mb-2">{item.title}</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </FadeUp>
              ))}
            </div>
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
              {lang === 'ar' ? 'مستعد لنتولى التقديم بدلاً منك؟' : 'Ready for Us to Apply on Your Behalf?'}
            </h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              {lang === 'ar'
                ? 'ابدأ بتقييم مجاني — فريقنا سيراجع ملفك ويحدد أفضل الفرص لك'
                : 'Start with a free assessment — our team will review your profile and identify the best opportunities for you'}
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
