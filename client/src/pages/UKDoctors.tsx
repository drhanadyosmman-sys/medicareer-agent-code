import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ArrowRight, FileText, Stethoscope, GraduationCap, Globe, Award } from 'lucide-react';

const UK_HERO = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663502631447/3tsQVrLUcXjTB9oAq7mMW6/uk-pathway-hero-gj36eSNufgQ4EGpGCBv6Kv.webp';

export default function UKDoctors() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[340px] lg:h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          <img src={UK_HERO} alt="London skyline" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/70 to-navy/40" />
        </div>
        <div className="container relative z-10 h-full flex items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm text-white/80 mb-4">
              🇬🇧 Active Pathway
            </div>
            <h1 className="font-serif text-4xl lg:text-5xl text-white mb-4">UK Doctor Jobs</h1>
            <p className="text-lg text-white/70 leading-relaxed">
              Professional application support for international medical graduates seeking NHS positions across England, Scotland, Wales, and Northern Ireland.
            </p>
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="py-16">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <div className="gold-line" />
              <h2 className="font-serif text-3xl text-navy mb-6">Who This Pathway Is For</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                This service is designed for international medical graduates (IMGs) who want to work as doctors in the UK National Health Service. Whether you are newly qualified or an experienced specialist, we tailor our support to your specific situation.
              </p>
              <div className="space-y-3">
                {[
                  'Doctors with a recognised medical degree seeking their first UK role',
                  'Experienced clinicians looking to transition into NHS specialty positions',
                  'Doctors who have passed PLAB and need application support',
                  'IMGs who have applied before without success and want professional guidance',
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <CheckCircle className="w-5 h-5 text-teal shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground/80">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="gold-line" />
              <h2 className="font-serif text-3xl text-navy mb-6">Suitable Job Types</h2>
              <div className="space-y-4">
                {[
                  { title: 'Junior Clinical Fellow', desc: 'Fixed-term positions, typically 6-12 months, ideal for gaining initial NHS experience.' },
                  { title: 'Trust Grade Doctor', desc: 'Non-training posts offering clinical experience across NHS trusts.' },
                  { title: 'Clinical Fellow', desc: 'Posts combining clinical work with teaching or research opportunities.' },
                  { title: 'Specialty Doctor', desc: 'Senior non-training positions for experienced doctors with relevant qualifications.' },
                  { title: 'Training Jobs', desc: 'Competitive training programme positions where eligible (ST1+, CT1+).' },
                ].map((job, i) => (
                  <div key={i} className="flex gap-3 items-start p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <Stethoscope className="w-5 h-5 text-navy shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-navy text-sm">{job.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{job.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-16 bg-ivory">
        <div className="container">
          <div className="text-center mb-12">
            <div className="gold-line mx-auto flex justify-center" />
            <h2 className="font-serif text-3xl text-navy mb-4">Requirements & Documents</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Eligibility varies by role and employer. Below are the typical requirements for UK medical positions.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: GraduationCap, title: 'Qualifications', items: ['Recognised medical degree', 'Completed internship/housemanship', 'Relevant clinical experience', 'Postgraduate qualifications (if applicable)'] },
              { icon: Globe, title: 'Registration', items: ['GMC registration (or in progress)', 'PLAB 1 & 2 (or equivalent)', 'Licence to practise'] },
              { icon: FileText, title: 'English Language', items: ['IELTS Academic (7.5 overall, 7.0 each)', 'OR OET (B in all components)', 'Valid within 2 years'] },
              { icon: Award, title: 'Additional', items: ['ALS/BLS certification', 'Professional references', 'Valid passport', 'Right to work evidence'] },
            ].map((cat, i) => (
              <Card key={i} className="bg-white border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-navy/5 flex items-center justify-center mb-4">
                    <cat.icon className="w-5 h-5 text-navy" />
                  </div>
                  <h3 className="font-serif text-lg text-navy mb-3">{cat.title}</h3>
                  <ul className="space-y-2">
                    {cat.items.map((item, j) => (
                      <li key={j} className="flex gap-2 items-start text-sm text-muted-foreground">
                        <div className="w-1 h-1 rounded-full bg-teal mt-2 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 p-4 bg-gold/10 rounded-xl border border-gold/20 max-w-3xl mx-auto">
            <p className="text-sm text-center text-foreground/70">
              <strong className="text-navy">Note:</strong> Eligibility varies by role and employer. Not all requirements apply to every position. Our team will assess your specific situation and advise on the most suitable roles for your profile.
            </p>
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-16">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <div className="gold-line mx-auto flex justify-center" />
            <h2 className="font-serif text-3xl text-navy mb-4">Your Application Journey</h2>
          </div>
          <div className="space-y-0">
            {[
              { stage: '1', title: 'Submit Your Profile', desc: 'Complete our structured assessment form and upload your documents. This takes approximately 15 minutes.' },
              { stage: '2', title: 'Expert Review', desc: 'Our career consultant reviews your profile, assesses your readiness, and identifies areas for improvement.' },
              { stage: '3', title: 'CV Optimisation', desc: 'We rewrite your CV to meet NHS standards, highlighting your experience in a format that resonates with UK recruiters.' },
              { stage: '4', title: 'Job Matching', desc: 'We identify suitable positions based on your specialty, experience, and preferences, then prepare tailored applications.' },
              { stage: '5', title: 'Application Preparation', desc: 'Each application is prepared with role-specific supporting information matched to the person specification.' },
              { stage: '6', title: 'Interview Preparation', desc: 'Once shortlisted, we prepare you with personalised interview questions, model answers, and presentation guidance.' },
            ].map((step, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {step.stage}
                  </div>
                  {i < 5 && <div className="w-0.5 h-16 bg-border mt-2" />}
                </div>
                <div className="pb-8">
                  <h3 className="font-medium text-navy mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy text-white">
        <div className="container text-center">
          <h2 className="font-serif text-3xl mb-4">Ready to Begin Your UK Medical Career Journey?</h2>
          <p className="text-white/60 max-w-xl mx-auto mb-8">
            Complete our assessment form and our team will evaluate your readiness within 48 hours.
          </p>
          <Link href="/apply">
            <Button size="lg" className="bg-teal hover:bg-teal/90 text-white btn-press text-base px-8">
              Start Your Assessment <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
