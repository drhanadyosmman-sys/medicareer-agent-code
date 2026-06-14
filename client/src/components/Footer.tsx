import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';

const LOGO_URL = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663502631447/3tsQVrLUcXjTB9oAq7mMW6/medicareer-logo-42Zj2vUEyBmUToQiEzq5VB.webp';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-navy text-white/80">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src={LOGO_URL} alt="MediCareer Agent" className="h-8 w-8" />
              <span className="font-serif text-lg text-white">MediCareer<span className="text-teal">Agent</span></span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">{t('footer.desc')}</p>
          </div>
          <div>
            <h4 className="font-sans text-sm font-semibold text-white mb-4 uppercase tracking-wider">{t('footer.services')}</h4>
            <ul className="space-y-2.5">
              <li><Link href="/uk-doctors" className="text-sm text-white/60 hover:text-teal transition-colors">{t('nav.ukDoctorJobs')}</Link></li>
              <li><Link href="/pathways" className="text-sm text-white/60 hover:text-teal transition-colors">{t('footer.allPathways')}</Link></li>
              <li><Link href="/pricing" className="text-sm text-white/60 hover:text-teal transition-colors">{t('nav.pricing')}</Link></li>
              <li><Link href="/apply" className="text-sm text-white/60 hover:text-teal transition-colors">{t('footer.startAssessment')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-sans text-sm font-semibold text-white mb-4 uppercase tracking-wider">{t('footer.resources')}</h4>
            <ul className="space-y-2.5">
              <li><span className="text-sm text-white/40">{t('footer.careerGuides')}</span></li>
              <li><span className="text-sm text-white/40">{t('footer.applicationTips')}</span></li>
              <li><span className="text-sm text-white/40">{t('footer.interviewPrep')}</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-sans text-sm font-semibold text-white mb-4 uppercase tracking-wider">{t('footer.contact')}</h4>
            <ul className="space-y-2.5">
              <li className="text-sm text-white/60">support@medicareeragent.com</li>
              <li className="text-sm text-white/60">London, United Kingdom</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/40">© {new Date().getFullYear()} MediCareer Agent. {t('footer.copyright')}</p>
          <p className="text-xs text-white/40">{t('footer.disclaimer')}</p>
        </div>
      </div>
    </footer>
  );
}
