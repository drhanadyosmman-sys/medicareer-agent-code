import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ArrowRight, CheckCircle } from 'lucide-react';

export default function UKDoctors() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white">
      {/* ===== HERO ===== */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-blue-900 to-blue-950 text-white">
        <div className="container">
          <div className="max-w-3xl animate-fade-in">
            <div className="gold-line" />
            <h1 className="font-serif text-4xl lg:text-5xl mb-6 leading-tight">
              {t('ukDoctors.title')}
            </h1>
            <p className="text-xl text-white/80">
              {t('ukDoctors.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* ===== WHO CAN APPLY ===== */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto mb-16 animate-fade-in">
            <div className="gold-line" />
            <h2 className="font-serif text-4xl lg:text-5xl mb-4 text-blue-900">
              {t('ukDoctors.eligibilityTitle')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('ukDoctors.eligibilityDesc')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: t('ukDoctors.jobType1'), desc: t('ukDoctors.jobType1Desc'), icon: '👨‍⚕️', delay: 1 },
              { title: t('ukDoctors.jobType2'), desc: t('ukDoctors.jobType2Desc'), icon: '🏥', delay: 2 },
              { title: t('ukDoctors.jobType3'), desc: t('ukDoctors.jobType3Desc'), icon: '💼', delay: 3 },
              { title: t('ukDoctors.jobType4'), desc: t('ukDoctors.jobType4Desc'), icon: '🎓', delay: 4 },
            ].map((job, i) => (
              <Card
                key={i}
                className={`p-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-white animate-stagger-${job.delay}`}
              >
                <div className="text-4xl mb-4">{job.icon}</div>
                <h3 className="font-serif text-xl font-bold text-blue-900 mb-3">
                  {job.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {job.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHAT WE DO ===== */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-blue-50 to-white">
        <div className="container">
          <div className="max-w-3xl mx-auto mb-16 animate-fade-in">
            <div className="gold-line" />
            <h2 className="font-serif text-4xl lg:text-5xl mb-4 text-blue-900">
              {t('ukDoctors.whatWeDoTitle')}
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {[
              { title: t('ukDoctors.whatWeDo1'), desc: t('ukDoctors.whatWeDo1Desc'), icon: '📊' },
              { title: t('ukDoctors.whatWeDo2'), desc: t('ukDoctors.whatWeDo2Desc'), icon: '🎯' },
              { title: t('ukDoctors.whatWeDo3'), desc: t('ukDoctors.whatWeDo3Desc'), icon: '✍️' },
              { title: t('ukDoctors.whatWeDo4'), desc: t('ukDoctors.whatWeDo4Desc'), icon: '🎤' },
            ].map((item, i) => (
              <div
                key={i}
                className={`p-8 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-teal-200 animate-stagger-${i + 1}`}
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-serif text-xl font-bold text-blue-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== REQUIREMENTS ===== */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto mb-16 animate-fade-in">
            <div className="gold-line" />
            <h2 className="font-serif text-4xl lg:text-5xl mb-4 text-blue-900">
              {t('ukDoctors.requirementsTitle')}
            </h2>
          </div>

          <div className="max-w-2xl mx-auto space-y-4">
            {[
              t('ukDoctors.req1'),
              t('ukDoctors.req2'),
              t('ukDoctors.req3'),
              t('ukDoctors.req4'),
            ].map((req, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-6 bg-gradient-to-r from-blue-50 to-white rounded-lg border border-blue-100 hover:border-teal-200 transition-colors duration-300"
              >
                <CheckCircle className="w-6 h-6 text-teal-500 flex-shrink-0 mt-1" />
                <span className="text-gray-700 text-lg">{req}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 lg:py-32 bg-gradient-to-r from-blue-900 to-blue-950 text-white">
        <div className="container text-center animate-fade-in">
          <h2 className="font-serif text-4xl lg:text-5xl mb-6">
            Ready to Pursue Your NHS Career?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Our team will assess your profile and guide you through every step of the application process.
          </p>
          <Link href="/apply">
            <Button className="bg-teal-500 hover:bg-teal-600 text-white px-10 py-7 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              Start Your Assessment
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
