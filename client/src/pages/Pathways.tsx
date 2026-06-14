import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';

export default function Pathways() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white">
      {/* ===== HERO ===== */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-blue-900 to-blue-950 text-white">
        <div className="container">
          <div className="max-w-3xl animate-fade-in">
            <div className="gold-line" />
            <h1 className="font-serif text-4xl lg:text-5xl mb-6 leading-tight">
              {t('pathways.title')}
            </h1>
            <p className="text-xl text-white/80">
              {t('pathways.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* ===== TWO PATHWAYS ===== */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Journey 1: Training Posts */}
            <Card className="p-8 lg:p-10 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-white animate-stagger-1">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center text-3xl">
                  🎓
                </div>
              </div>
              <h3 className="font-serif text-3xl font-bold text-blue-900 mb-4">
                {t('pathways.journey1')}
              </h3>
              <p className="text-gray-700 text-lg leading-relaxed mb-8">
                {t('pathways.journey1Desc')}
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-gray-700">
                  <span className="text-teal-500 font-bold mt-1">✓</span>
                  <span>Foundation Doctor (FY1/FY2) positions</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <span className="text-teal-500 font-bold mt-1">✓</span>
                  <span>Specialty Training programmes</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <span className="text-teal-500 font-bold mt-1">✓</span>
                  <span>Structured progression to Consultant</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <span className="text-teal-500 font-bold mt-1">✓</span>
                  <span>Long-term career development</span>
                </li>
              </ul>
              <Link href="/apply">
                <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white py-6 text-lg rounded-lg transition-all duration-300 hover:scale-105">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </Card>

            {/* Journey 2: NHS Jobs */}
            <Card className="p-8 lg:p-10 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-white animate-stagger-2">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-3xl">
                  🏥
                </div>
              </div>
              <h3 className="font-serif text-3xl font-bold text-blue-900 mb-4">
                {t('pathways.journey2')}
              </h3>
              <p className="text-gray-700 text-lg leading-relaxed mb-8">
                {t('pathways.journey2Desc')}
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-gray-700">
                  <span className="text-amber-500 font-bold mt-1">✓</span>
                  <span>Clinical Fellow positions</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <span className="text-amber-500 font-bold mt-1">✓</span>
                  <span>Trust Grade / SAS Doctor roles</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <span className="text-amber-500 font-bold mt-1">✓</span>
                  <span>Immediate NHS employment</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <span className="text-amber-500 font-bold mt-1">✓</span>
                  <span>Flexible working arrangements</span>
                </li>
              </ul>
              <Link href="/apply">
                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white py-6 text-lg rounded-lg transition-all duration-300 hover:scale-105">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* ===== COMPARISON ===== */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-blue-50 to-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in">
            <div className="gold-line mx-auto" />
            <h2 className="font-serif text-4xl lg:text-5xl mb-4 text-blue-900">
              Which Path Is Right For You?
            </h2>
            <p className="text-xl text-gray-600">
              Both pathways include our full support and guidance. Choose based on your career goals.
            </p>
          </div>

          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-blue-900">
                  <th className="py-4 px-4 font-serif text-lg font-bold text-blue-900">Aspect</th>
                  <th className="py-4 px-4 font-serif text-lg font-bold text-teal-600">Training Posts</th>
                  <th className="py-4 px-4 font-serif text-lg font-bold text-amber-600">NHS Jobs</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                  <td className="py-4 px-4 font-semibold text-gray-900">Duration</td>
                  <td className="py-4 px-4 text-gray-700">2-8+ years</td>
                  <td className="py-4 px-4 text-gray-700">Flexible</td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                  <td className="py-4 px-4 font-semibold text-gray-900">Career Goal</td>
                  <td className="py-4 px-4 text-gray-700">Consultant/Specialist</td>
                  <td className="py-4 px-4 text-gray-700">Immediate employment</td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                  <td className="py-4 px-4 font-semibold text-gray-900">Competition</td>
                  <td className="py-4 px-4 text-gray-700">Highly competitive</td>
                  <td className="py-4 px-4 text-gray-700">Moderate</td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                  <td className="py-4 px-4 font-semibold text-gray-900">Work-Life Balance</td>
                  <td className="py-4 px-4 text-gray-700">Intensive training</td>
                  <td className="py-4 px-4 text-gray-700">More flexibility</td>
                </tr>
                <tr className="hover:bg-blue-50 transition-colors">
                  <td className="py-4 px-4 font-semibold text-gray-900">Best For</td>
                  <td className="py-4 px-4 text-gray-700">Ambitious, long-term planning</td>
                  <td className="py-4 px-4 text-gray-700">Immediate career start</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 lg:py-32 bg-gradient-to-r from-blue-900 to-blue-950 text-white">
        <div className="container text-center animate-fade-in">
          <h2 className="font-serif text-4xl lg:text-5xl mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Our team will help you determine the best pathway for your career and guide you every step of the way.
          </p>
          <Link href="/apply">
            <Button className="bg-teal-500 hover:bg-teal-600 text-white px-10 py-7 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              Begin Assessment
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
