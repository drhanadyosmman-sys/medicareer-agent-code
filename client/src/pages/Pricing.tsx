import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ArrowRight, CalendarCheck, Users, Star } from 'lucide-react';
import { store } from '@/lib/store';
import { useLanguage } from '@/contexts/LanguageContext';

// Real payment URLs mapped to package IDs
const PAYMENT_URLS: Record<string, string> = {
  'pkg-1': 'https://www.healthcarequalityschools.com/purchase?product_id=6771620',
  'pkg-2': 'https://www.healthcarequalityschools.com/purchase?product_id=6771622',
  'pkg-3': 'https://www.healthcarequalityschools.com/purchase?product_id=6771631',
  'pkg-4': 'https://www.healthcarequalityschools.com/purchase?product_id=6771632',
};

export default function Pricing() {
  const packages = store.getPackages().filter(p => p.active);
  const { lang } = useLanguage();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-16 bg-navy text-white">
        <div className="container text-center">
          <div className="gold-line mx-auto flex justify-center" />
          <h1 className="font-serif text-4xl lg:text-5xl mb-4">
            {lang === 'ar' ? 'أسعار شفافة' : 'Transparent Pricing'}
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
            {lang === 'ar'
              ? 'اختر مستوى الدعم الذي يناسب احتياجاتك. جميع الباقات تشمل اهتماماً شخصياً من فريق الاستشارات المهنية.'
              : 'Choose the level of support that matches your needs. All packages include personalised attention from our career consultancy team.'}
          </p>
        </div>
      </section>

      {/* Expert Resume Writing Highlight */}
      <section className="py-10 bg-teal/5 border-b border-teal/10">
        <div className="container max-w-4xl">
          <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white rounded-2xl shadow-sm border border-teal/10">
            <div className="w-14 h-14 rounded-xl bg-teal/10 flex items-center justify-center shrink-0">
              <CalendarCheck className="w-7 h-7 text-teal" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="font-serif text-xl text-navy mb-1">
                {lang === 'ar' ? 'خدمة كتابة السيرة الذاتية الاحترافية' : 'Expert Resume Writing Service'}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {lang === 'ar'
                  ? 'جلسة فردية مع مستشارنا المهني لمراجعة وتحسين سيرتك الذاتية لطلبات NHS. يشمل: مراجعة شاملة، إعادة هيكلة بأسلوب NHS، تحسين الصياغة، وتوصيات مخصصة.'
                  : '1-on-1 session with our career consultant to review and optimise your CV for NHS applications. Includes: comprehensive review, NHS-style restructuring, wording improvements, and personalised recommendations.'}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Star className="w-4 h-4 text-gold fill-gold" />
              <span className="text-sm font-medium text-navy">
                {lang === 'ar' ? 'مشمول في جميع الباقات' : 'Included in all packages'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {packages.map((pkg) => (
              <Card key={pkg.id} className={`border-0 shadow-sm hover:shadow-lg transition-all relative flex flex-col ${pkg.popular ? 'ring-2 ring-teal shadow-md' : ''}`}>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                    {lang === 'ar' ? 'الأكثر شيوعاً' : 'Most Popular'}
                  </div>
                )}
                <CardContent className="p-6 pt-8 flex flex-col flex-1">
                  <h3 className="font-serif text-lg text-navy mb-1">{pkg.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold text-navy">£{pkg.price}</span>
                    <span className="text-sm text-muted-foreground">GBP</span>
                  </div>
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {pkg.features.map((f, j) => (
                      <li key={j} className={`flex items-start gap-2 text-sm ${f.toLowerCase().includes('expert resume') ? 'text-teal font-medium' : 'text-muted-foreground'}`}>
                        {f.toLowerCase().includes('expert resume')
                          ? <CalendarCheck className="w-4 h-4 text-teal shrink-0 mt-0.5" />
                          : <CheckCircle className="w-4 h-4 text-teal shrink-0 mt-0.5" />
                        }
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a href={PAYMENT_URLS[pkg.id] || '#'} target="_blank" rel="noopener noreferrer">
                    <Button className={`w-full btn-press ${pkg.popular ? 'bg-teal hover:bg-teal/90 text-white' : 'bg-navy hover:bg-navy/90 text-white'}`}>
                      {lang === 'ar' ? 'اختر الباقة' : 'Choose Plan'} <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-12 bg-ivory">
        <div className="container max-w-4xl">
          <div className="text-center mb-8">
            <div className="gold-line mx-auto flex justify-center" />
            <h2 className="font-serif text-2xl text-navy mb-3">
              {lang === 'ar' ? 'ما يشمله كل طلب' : 'What Every Application Includes'}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: Users,
                title: lang === 'ar' ? 'مستشار شخصي' : 'Personal Consultant',
                desc: lang === 'ar' ? 'مستشار مخصص يراجع ملفك ويدير طلباتك' : 'A dedicated consultant reviews your profile and manages your applications',
              },
              {
                icon: CalendarCheck,
                title: lang === 'ar' ? 'مراجعة السيرة الذاتية' : 'Expert Resume Review',
                desc: lang === 'ar' ? 'جلسة فردية لمراجعة وتحسين سيرتك الذاتية بأسلوب NHS' : '1-on-1 session to review and optimise your CV in NHS format',
              },
              {
                icon: CheckCircle,
                title: lang === 'ar' ? 'طلبات مخصصة' : 'Tailored Applications',
                desc: lang === 'ar' ? 'كل طلب مخصص لمواصفات الوظيفة المحددة' : 'Every application tailored to the specific job\'s person specification',
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 p-4 bg-white rounded-xl shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-teal/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-teal" />
                </div>
                <div>
                  <h4 className="font-medium text-sm text-navy">{item.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Note */}
      <section className="py-12">
        <div className="container max-w-3xl text-center">
          <p className="text-muted-foreground leading-relaxed">
            {lang === 'ar'
              ? 'جميع الأسعار دفعة واحدة. لا رسوم متكررة. خدمتنا لا تضمن التوظيف — نجهّز ونطابق وندعم عملية تقديمك بشكل احترافي لزيادة فرصك في الترشيح للمقابلات.'
              : 'All prices are one-time payments. We do not charge recurring fees. Our service does not guarantee employment — we prepare, match, and support your application process professionally to maximise your chances of being shortlisted for interviews.'}
          </p>
          <div className="mt-8">
            <Link href="/apply">
              <Button size="lg" className="bg-teal hover:bg-teal/90 text-white btn-press">
                {lang === 'ar' ? 'ابدأ تقييمك المجاني' : 'Begin Your Free Assessment'} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
