import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useLanguage } from '@/contexts/LanguageContext';
import { CheckCircle, FileText, Users, Target, ArrowRight, Upload, ClipboardCheck, Briefcase, Star } from 'lucide-react';

const HERO_BG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663502631447/3tsQVrLUcXjTB9oAq7mMW6/hero-abstract-medical-MG2uiVTSCLxeVn2oSXijhn.webp';
const HOSPITAL_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663502631447/3tsQVrLUcXjTB9oAq7mMW6/hero-international-hospital-TDi868hZuAqsUKDiyQ7J9L.webp';
const CORRIDOR_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663502631447/3tsQVrLUcXjTB9oAq7mMW6/hero-hospital-corridor-3bwd4F4SdV2nSRPES8pk2i.webp';

export default function Home() {
  const { t, lang } = useLanguage();

  const steps = [
    { icon: Upload, title: t('home.step1Title'), desc: t('home.step1Desc') },
    { icon: ClipboardCheck, title: t('home.step2Title'), desc: t('home.step2Desc') },
    { icon: FileText, title: t('home.step3Title'), desc: t('home.step3Desc') },
    { icon: Briefcase, title: t('home.step4Title'), desc: t('home.step4Desc') },
  ];

  const painPoints = [t('home.painPoints.p1'), t('home.painPoints.p2'), t('home.painPoints.p3'), t('home.painPoints.p4')];
  const whatWeDo = [t('home.whatWeDoPoints.p1'), t('home.whatWeDoPoints.p2'), t('home.whatWeDoPoints.p3'), t('home.whatWeDoPoints.p4'), t('home.whatWeDoPoints.p5'), t('home.whatWeDoPoints.p6')];

  const jobs = [
    { title: t('home.jobType1'), desc: t('home.jobType1Desc') },
    { title: t('home.jobType2'), desc: t('home.jobType2Desc') },
    { title: t('home.jobType3'), desc: t('home.jobType3Desc') },
  ];

  const faqs = [
    { q: t('home.faq1Q'), a: t('home.faq1A') },
    { q: t('home.faq2Q'), a: t('home.faq2A') },
    { q: t('home.faq3Q'), a: t('home.faq3A') },
    { q: t('home.faq4Q'), a: t('home.faq4A') },
    { q: t('home.faq5Q'), a: t('home.faq5A') },
    { q: t('home.faq6Q'), a: t('home.faq6A') },
  ];

  const testimonials = [
    { name: 'Dr. S.M.', country: lang === 'ar' ? 'مصر' : 'Egypt', text: t('home.testimonial1') },
    { name: 'Dr. A.K.', country: lang === 'ar' ? 'باكستان' : 'Pakistan', text: t('home.testimonial2') },
    { name: 'Dr. R.P.', country: lang === 'ar' ? 'الهند' : 'India', text: t('home.testimonial3') },
  ];

  const stepLabel = lang === 'ar' ? 'خطوة' : 'Step';

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, #0F2A4A 0%, #143656 50%, #1a4060 100%)` }}>
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url(${HERO_BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="container relative z-10 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2 mb-2">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm text-white/80">
                  <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
                  {t('home.badge')}
                </div>
              </div>
              <h1 className="font-serif text-4xl lg:text-5xl xl:text-[3.4rem] text-white leading-[1.15] tracking-tight">
                {t('home.heroTitle')}
              </h1>
              <p className="text-lg text-white/70 leading-relaxed max-w-lg">
                {t('home.heroDesc')}
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/apply">
                  <Button size="lg" className="bg-teal hover:bg-teal/90 text-white btn-press text-base px-6">
                    {t('home.ctaButton')}
                    <ArrowRight className="w-4 h-4 ms-2" />
                  </Button>
                </Link>
                <Link href="/apply">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 btn-press text-base px-6">
                    <Upload className="w-4 h-4 me-2" />
                    {t('home.uploadCv')}
                  </Button>
                </Link>
              </div>
              {/* Country flags */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <span className="text-xs text-white/40 uppercase tracking-wider">{lang === 'ar' ? 'الوجهات:' : 'Destinations:'}</span>
                {[
                  { flag: '🇬🇧', label: lang === 'ar' ? 'بريطانيا' : 'UK', active: true },
                  { flag: '🇦🇪', label: lang === 'ar' ? 'الخليج' : 'Gulf', active: false },
                  { flag: '🇦🇺', label: lang === 'ar' ? 'أستراليا' : 'Australia', active: false },
                  { flag: '🇨🇦', label: lang === 'ar' ? 'كندا' : 'Canada', active: false },
                  { flag: '🇩🇪', label: lang === 'ar' ? 'ألمانيا' : 'Germany', active: false },
                ].map((c, i) => (
                  <div key={i} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${
                    c.active ? 'bg-teal/20 text-teal border border-teal/30' : 'bg-white/5 text-white/40 border border-white/10'
                  }`}>
                    <span>{c.flag}</span>
                    <span>{c.label}</span>
                    {!c.active && <span className="text-[10px] opacity-60">{lang === 'ar' ? 'قريباً' : 'Soon'}</span>}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-6 text-sm text-white/50">
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-teal" /> {t('home.noCommitment')}</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-teal" /> {t('home.personalConsultant')}</span>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-teal/20 rounded-2xl blur-2xl" />
                <img src={HOSPITAL_IMG} alt="International medical facility" className="relative rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-ivory">
        <div className="container">
          <div className="text-center mb-14">
            <div className="gold-line mx-auto flex justify-center" />
            <h2 className="font-serif text-3xl lg:text-4xl text-navy mb-4">{t('home.howItWorks')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t('home.howItWorksDesc')}</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <Card key={i} className="stepped-card bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center mb-4">
                    <step.icon className="w-5 h-5 text-teal" />
                  </div>
                  <div className="text-xs font-semibold text-gold uppercase tracking-wider mb-2">{stepLabel} {i + 1}</div>
                  <h3 className="font-serif text-lg text-navy mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="gold-line" />
              <h2 className="font-serif text-3xl lg:text-4xl text-navy mb-6">{t('home.painTitle')}</h2>
              <div className="space-y-5">
                {painPoints.map((point, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold mt-2.5 shrink-0" />
                    <p className="text-foreground/80 leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-navy rounded-2xl p-8 lg:p-10 text-white">
              <h3 className="font-serif text-2xl mb-6">{t('home.whatWeDo')}</h3>
              <div className="space-y-4">
                {whatWeDo.map((item, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <CheckCircle className="w-5 h-5 text-teal shrink-0 mt-0.5" />
                    <p className="text-white/80 text-sm leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* UK Pathway Preview */}
      <section className="py-20 bg-ivory">
        <div className="container">
          <div className="text-center mb-12">
            <div className="gold-line mx-auto flex justify-center" />
            <h2 className="font-serif text-3xl lg:text-4xl text-navy mb-4">{t('home.ukPathwayTitle')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t('home.ukPathwayDesc')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {jobs.map((job, i) => (
              <Card key={i} className="bg-white border-0 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="w-8 h-8 rounded-full bg-navy/5 flex items-center justify-center mb-3">
                    <Target className="w-4 h-4 text-navy" />
                  </div>
                  <h3 className="font-serif text-lg text-navy mb-2">{job.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{job.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/uk-doctors">
              <Button variant="outline" className="border-navy text-navy hover:bg-navy hover:text-white btn-press">
                {t('home.viewUkPathway')} <ArrowRight className="w-4 h-4 ms-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <div className="gold-line mx-auto flex justify-center" />
            <h2 className="font-serif text-3xl lg:text-4xl text-navy mb-4">{t('home.investmentTitle')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t('home.investmentDesc')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { name: lang === 'ar' ? 'مراجعة السيرة والجاهزية' : 'CV & Readiness Review', price: '£149', features: lang === 'ar' ? ['تقييم السيرة الذاتية', 'درجة الجاهزية', 'قائمة المستندات الناقصة', 'توصيات التحسين'] : ['CV assessment', 'Readiness score', 'Missing documents checklist', 'Improvement recommendations'] },
              { name: lang === 'ar' ? 'إعداد الطلب الكامل' : 'Full Application Preparation', price: '£399', popular: true, features: lang === 'ar' ? ['إعادة كتابة السيرة بأسلوب NHS', 'المعلومات الداعمة', 'حتى 5 طلبات', 'مطابقة مواصفات الشخص'] : ['NHS-style CV rewrite', 'Supporting information', 'Up to 5 applications', 'Person spec matching'] },
              { name: lang === 'ar' ? 'دعم الترشيح للمقابلة' : 'Interview Shortlisting Support', price: '£699', features: lang === 'ar' ? ['حتى 15 طلب', 'تحضير المقابلة', 'أسئلة وأجوبة تجريبية', 'تقييم ما بعد المقابلة'] : ['Up to 15 applications', 'Interview preparation', 'Mock questions & answers', 'Post-interview debrief'] },
            ].map((pkg, i) => (
              <Card key={i} className={`border-0 shadow-sm hover:shadow-lg transition-all relative ${pkg.popular ? 'ring-2 ring-teal shadow-md' : ''}`}>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {t('home.mostPopular')}
                  </div>
                )}
                <CardContent className="p-6 pt-8">
                  <h3 className="font-serif text-lg text-navy mb-1">{pkg.name}</h3>
                  <div className="text-3xl font-bold text-navy mb-4">{pkg.price}</div>
                  <ul className="space-y-2.5 mb-6">
                    {pkg.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-teal shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/pricing">
                    <Button className={`w-full btn-press ${pkg.popular ? 'bg-teal hover:bg-teal/90 text-white' : 'bg-navy hover:bg-navy/90 text-white'}`}>
                      {t('home.learnMore')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-ivory">
        <div className="container max-w-3xl">
          <div className="text-center mb-12">
            <div className="gold-line mx-auto flex justify-center" />
            <h2 className="font-serif text-3xl lg:text-4xl text-navy mb-4">{t('home.faqTitle')}</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-white rounded-xl border-0 shadow-sm px-6">
                <AccordionTrigger className="text-start font-medium text-navy hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <div className="gold-line mx-auto flex justify-center" />
            <h2 className="font-serif text-3xl lg:text-4xl text-navy mb-4">{t('home.testimonialsTitle')}</h2>
            <p className="text-muted-foreground">{t('home.testimonialsDesc')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {testimonials.map((item, i) => (
              <Card key={i} className="bg-white border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-gold text-gold" />)}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 italic">"{item.text}"</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-navy" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-navy">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.country}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-navy text-white">
        <div className="container text-center">
          <h2 className="font-serif text-3xl lg:text-4xl mb-4">{t('home.ctaFinalTitle')}</h2>
          <p className="text-white/60 max-w-2xl mx-auto mb-8 text-lg">
            {t('home.ctaFinalDesc')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/apply">
              <Button size="lg" className="bg-teal hover:bg-teal/90 text-white btn-press text-base px-8">
                {t('home.beginAssessment')}
                <ArrowRight className="w-4 h-4 ms-2" />
              </Button>
            </Link>
            <Link href="/uk-doctors">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 btn-press text-base px-8">
                {t('home.learnAboutUk')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
