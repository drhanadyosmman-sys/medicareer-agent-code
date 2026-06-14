import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle, FileText, Users, Target, ArrowRight, Upload, ClipboardCheck, Briefcase, MessageSquare, Star } from 'lucide-react';

const HERO_BG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663502631447/3tsQVrLUcXjTB9oAq7mMW6/hero-abstract-medical-MG2uiVTSCLxeVn2oSXijhn.webp';
const DOCTOR_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663502631447/3tsQVrLUcXjTB9oAq7mMW6/hero-doctor-professional-R2yqzwKr3yTw2haD49QGKW.webp';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, #0F2A4A 0%, #143656 50%, #1a4060 100%)` }}>
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url(${HERO_BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="container relative z-10 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm text-white/80">
                <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
                UK Doctor Jobs — Now Open
              </div>
              <h1 className="font-serif text-4xl lg:text-5xl xl:text-[3.4rem] text-white leading-[1.15] tracking-tight">
                Get Shortlisted for Medical Jobs with Expert Application Support
              </h1>
              <p className="text-lg text-white/70 leading-relaxed max-w-lg">
                Upload your CV. We assess your readiness, match you with suitable roles, prepare your application documents, and support you until the interview stage.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/apply">
                  <Button size="lg" className="bg-teal hover:bg-teal/90 text-white btn-press text-base px-6">
                    Start Your UK Doctor Assessment
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/apply">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 btn-press text-base px-6">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Your CV
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 pt-4 text-sm text-white/50">
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-teal" /> No upfront commitment</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-teal" /> Personal consultant</span>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-teal/20 rounded-2xl blur-2xl" />
                <img src={DOCTOR_IMG} alt="Professional doctor" className="relative rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]" />
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
            <h2 className="font-serif text-3xl lg:text-4xl text-navy mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">A straightforward process designed to prepare you for success. Our team handles the complexity so you can focus on your medical career.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Upload, title: 'Upload & Assess', desc: 'Submit your CV and complete our structured assessment. We evaluate your readiness for your target country.' },
              { icon: ClipboardCheck, title: 'Review & Plan', desc: 'Our career consultant reviews your profile, identifies gaps, and creates a personalised action plan.' },
              { icon: FileText, title: 'Prepare & Apply', desc: 'We prepare role-specific applications including CV optimisation, supporting information, and cover letters.' },
              { icon: Briefcase, title: 'Interview & Beyond', desc: 'Receive interview preparation, mock questions, and ongoing support until you secure your position.' },
            ].map((step, i) => (
              <Card key={i} className="stepped-card bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center mb-4">
                    <step.icon className="w-5 h-5 text-teal" />
                  </div>
                  <div className="text-xs font-semibold text-gold uppercase tracking-wider mb-2">Step {i + 1}</div>
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
              <h2 className="font-serif text-3xl lg:text-4xl text-navy mb-6">Why Doctors Struggle to Get Interviews</h2>
              <div className="space-y-5">
                {[
                  'You may be qualified, but your application may not show it properly.',
                  'Most doctors lose opportunities because their CV and supporting information are not matched to the person specification.',
                  'Generic applications get filtered out before they reach the shortlisting panel.',
                  'Without understanding NHS recruitment criteria, even experienced doctors miss out.',
                ].map((point, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold mt-2.5 shrink-0" />
                    <p className="text-foreground/80 leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-navy rounded-2xl p-8 lg:p-10 text-white">
              <h3 className="font-serif text-2xl mb-6">What We Do For You</h3>
              <div className="space-y-4">
                {[
                  'Assess your readiness for your target country and role',
                  'Rewrite your CV to meet NHS standards and expectations',
                  'Prepare role-specific supporting information matched to person specifications',
                  'Identify and apply to suitable positions on your behalf',
                  'Prepare you for NHS-style interviews with personalised questions',
                  'Provide ongoing guidance until you secure an interview',
                ].map((item, i) => (
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
            <h2 className="font-serif text-3xl lg:text-4xl text-navy mb-4">UK Doctor Jobs Pathway</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Our flagship service for international medical graduates seeking NHS positions in the United Kingdom.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Junior Clinical Fellow', desc: 'Entry-level positions suitable for doctors with completed internship and basic clinical experience.' },
              { title: 'Trust Grade Doctor', desc: 'Non-training positions offering valuable NHS experience across various specialties.' },
              { title: 'Specialty Doctor', desc: 'Senior positions for experienced doctors with relevant specialty training and qualifications.' },
            ].map((job, i) => (
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
                View Full UK Pathway Details <ArrowRight className="w-4 h-4 ml-2" />
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
            <h2 className="font-serif text-3xl lg:text-4xl text-navy mb-4">Investment in Your Career</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Transparent pricing for professional career support. Choose the level of service that matches your needs.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { name: 'CV & Readiness Review', price: '£149', features: ['CV assessment', 'Readiness score', 'Missing documents checklist', 'Improvement recommendations'] },
              { name: 'Full Application Preparation', price: '£399', popular: true, features: ['NHS-style CV rewrite', 'Supporting information', 'Up to 5 applications', 'Person spec matching'] },
              { name: 'Interview Shortlisting Support', price: '£699', features: ['Up to 15 applications', 'Interview preparation', 'Mock questions & answers', 'Post-interview debrief'] },
            ].map((pkg, i) => (
              <Card key={i} className={`border-0 shadow-sm hover:shadow-lg transition-all relative ${pkg.popular ? 'ring-2 ring-teal shadow-md' : ''}`}>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
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
                      Learn More
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
            <h2 className="font-serif text-3xl lg:text-4xl text-navy mb-4">Frequently Asked Questions</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {[
              { q: 'Do you guarantee job placement?', a: 'No. We do not guarantee employment. We help maximise your chances of being shortlisted for interviews by preparing professional, role-specific applications that match person specifications.' },
              { q: 'Do I need GMC registration before starting?', a: 'Not necessarily. We can assess your readiness and begin preparing your application materials while you work towards GMC registration. Some positions accept doctors in the process of registration.' },
              { q: 'How long does the process take?', a: 'The timeline varies depending on your readiness. If you have all documents ready, we can begin matching you with roles within 2-4 weeks. The full process typically takes 4-12 weeks from assessment to interview.' },
              { q: 'What makes your service different from applying myself?', a: 'Our team understands NHS recruitment criteria, person specifications, and what shortlisting panels look for. We tailor every application to the specific role, significantly increasing your chances of being shortlisted.' },
              { q: 'Can I use this service for countries other than the UK?', a: 'Currently, our UK Doctor Jobs pathway is active. We are developing pathways for Gulf countries, Australia, Canada, Ireland, Germany, and New Zealand. Register your interest and we will notify you when your preferred pathway launches.' },
              { q: 'What documents do I need to get started?', a: 'At minimum, you need your CV and medical degree certificate. Additional documents such as English test results, GMC certificate, and experience certificates strengthen your application. We will guide you on what is needed based on your assessment.' },
            ].map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-white rounded-xl border-0 shadow-sm px-6">
                <AccordionTrigger className="text-left font-medium text-navy hover:no-underline py-5">
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

      {/* Testimonials Placeholder */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <div className="gold-line mx-auto flex justify-center" />
            <h2 className="font-serif text-3xl lg:text-4xl text-navy mb-4">What Doctors Say</h2>
            <p className="text-muted-foreground">Hear from doctors who have used our services.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { name: 'Dr. S.M.', country: 'Egypt', text: 'The team completely transformed my CV and supporting information. I received interview invitations within weeks of submitting my applications.' },
              { name: 'Dr. A.K.', country: 'Pakistan', text: 'I had applied to over 30 positions with no response. After working with MediCareer Agent, I was shortlisted for 4 interviews from 8 applications.' },
              { name: 'Dr. R.P.', country: 'India', text: 'The interview preparation was invaluable. The questions they prepared were almost identical to what I was asked. I felt confident and well-prepared.' },
            ].map((t, i) => (
              <Card key={i} className="bg-white border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-gold text-gold" />)}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 italic">"{t.text}"</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-navy" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-navy">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.country}</p>
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
          <h2 className="font-serif text-3xl lg:text-4xl mb-4">Your Qualifications Deserve an Application That Matches Them</h2>
          <p className="text-white/60 max-w-2xl mx-auto mb-8 text-lg">
            We help convert your experience into a strong, role-specific application. Begin your assessment today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/apply">
              <Button size="lg" className="bg-teal hover:bg-teal/90 text-white btn-press text-base px-8">
                Begin Your Career Assessment
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/uk-doctors">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 btn-press text-base px-8">
                Learn About UK Pathway
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
