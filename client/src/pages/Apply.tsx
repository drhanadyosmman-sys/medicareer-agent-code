import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { store, DocumentFile } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';
import { trpc } from '@/lib/trpc';
import { readableError } from '@/lib/errorMessage';
import { ArrowRight, ArrowLeft, Upload, CheckCircle, FileText, Mic, X, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const STEPS = [
  { id: 1, title: 'Personal Details', desc: 'Basic information about you' },
  { id: 2, title: 'Medical Background', desc: 'Your qualifications and experience' },
  { id: 3, title: 'UK Readiness', desc: 'Registration and exam status' },
  { id: 4, title: 'Documents', desc: 'Upload your certificates' },
  { id: 5, title: 'Your Story', desc: 'Tell us about your career goals' },
  { id: 6, title: 'Consent', desc: 'Review and confirm' },
];

const DOC_TYPES = [
  { category: 'cv', label: 'CV / Resume', required: true, accept: '.pdf,.doc,.docx' },
  { category: 'passport', label: 'Passport Copy', required: false, accept: '.pdf,.jpg,.jpeg,.png' },
  { category: 'medical-degree', label: 'Medical Degree Certificate', required: true, accept: '.pdf,.jpg,.jpeg,.png' },
  { category: 'internship-certificate', label: 'Internship Certificate', required: false, accept: '.pdf,.jpg,.jpeg,.png' },
  { category: 'experience-certificates', label: 'Experience Certificates', required: false, accept: '.pdf,.jpg,.jpeg,.png' },
  { category: 'english-test', label: 'English Test Result (IELTS/OET)', required: false, accept: '.pdf,.jpg,.jpeg,.png' },
  { category: 'gmc-certificate', label: 'GMC Certificate (if available)', required: false, accept: '.pdf,.jpg,.jpeg,.png' },
  { category: 'research-publications', label: 'Research Publications', required: false, accept: '.pdf,.doc,.docx' },
  { category: 'quality-improvement', label: 'Quality Improvement Projects', required: false, accept: '.pdf,.doc,.docx,.jpg,.jpeg,.png' },
  { category: 'leadership-evidence', label: 'Leadership Evidence', required: false, accept: '.pdf,.doc,.docx,.jpg,.jpeg,.png' },
  { category: 'teaching-experience', label: 'Teaching Experience', required: false, accept: '.pdf,.doc,.docx,.jpg,.jpeg,.png' },
  { category: 'clinical-audit', label: 'Clinical Audit', required: false, accept: '.pdf,.doc,.docx,.jpg,.jpeg,.png' },
  { category: 'other', label: 'Other Documents', required: false, accept: '.pdf,.doc,.docx,.jpg,.jpeg,.png' },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * A password for an account created during application submission. The applicant
 * never sees it and never needs it - they sign in through the emailed link. It
 * exists only because an account must have some credential.
 */
function randomPassword(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  let binary = '';
  bytes.forEach(b => { binary += String.fromCharCode(b); });
  return btoa(binary);
}

export default function Apply() {
  const [step, setStep] = useState(1);
  const [, navigate] = useLocation();
  const { user, register } = useAuth();
  const { t, lang } = useLanguage();

  const [form, setForm] = useState({
    fullName: '', email: '', whatsapp: '', countryOfResidence: '', nationality: '', preferredPathway: 'uk-nhs-jobs', preferredLanguage: 'en',
    medicalSchool: '', graduationYear: '', internshipCompleted: '', yearsExperience: '', currentRole: '', specialtyInterest: '', currentCountryOfPractice: '',
    gmcStatus: '', plabStatus: '', ieltsOetStatus: '', alsBlsStatus: '', nhsExperience: '', previousUkApplications: '', previousInterviews: '',
    careerStory: '', storyType: 'written',
    consent1: false, consent2: false, consent3: false, consent4: false,
  });

  const [uploadedFiles, setUploadedFiles] = useState<DocumentFile[]>([]);
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const requestLoginLink = trpc.auth.requestLoginLink.useMutation();

  const updateForm = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (category: string, accept: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File too large. Maximum size is 10MB.');
        return;
      }

      setUploadingCategory(category);
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const dataUrl = readerEvent.target?.result as string;
        const fileId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Store file data separately
        store.saveFileData(fileId, dataUrl);

        const docFile: DocumentFile = {
          id: fileId,
          name: file.name,
          type: file.type,
          category: category as any,
          uploadedAt: new Date().toISOString(),
          size: formatFileSize(file.size),
        };

        setUploadedFiles(prev => {
          // Replace if same category already uploaded
          const filtered = prev.filter(f => f.category !== category);
          return [...filtered, docFile];
        });
        setUploadingCategory(null);
        toast.success(`${file.name} uploaded successfully`);
      };
      reader.onerror = () => {
        setUploadingCategory(null);
        toast.error('Failed to read file. Please try again.');
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const removeFile = (category: string) => {
    const file = uploadedFiles.find(f => f.category === category);
    if (file) {
      store.deleteFileData(file.id);
      setUploadedFiles(prev => prev.filter(f => f.category !== category));
      toast.info('File removed');
    }
  };

  const handleSubmit = async () => {
    if (!form.consent1 || !form.consent2 || !form.consent3) {
      toast.error('Please accept all consent checkboxes');
      return;
    }

    setSubmitting(true);

    // Resolve the account this application belongs to before writing anything.
    let accountId = user?.id ?? null;

    if (!accountId) {
      try {
        // A random password the applicant never needs: they get back in through
        // the emailed sign-in link, not by remembering this.
        const created = await register(form.fullName, form.email, randomPassword());
        accountId = created.id;
        // Give them a way back in later, not just for this session.
        requestLoginLink.mutate({ email: form.email, lang: lang === 'ar' ? 'ar' : 'en' });
      } catch (error) {
        const message = readableError(error);
        if (/already exists/i.test(message)) {
          // Returning applicant who is signed out. Do not silently attach the
          // application to an account they have not proved they own - email them
          // a link and let them sign in first.
          requestLoginLink.mutate({ email: form.email, lang: lang === 'ar' ? 'ar' : 'en' });
          toast.info(
            lang === 'ar'
              ? 'لديك حساب بالفعل بهذا البريد. أرسلنا لك رابط دخول — سجّل الدخول ثم أكمل التقديم.'
              : 'You already have an account with this email. We have sent you a sign-in link — please sign in, then submit.'
          );
        } else {
          toast.error(message);
        }
        setSubmitting(false);
        return;
      }
    }

    const appId = `app-${Date.now()}`;

    const application = {
      id: appId,
      userId: String(accountId),
      status: 'submitted' as const,
      readinessScore: calculateReadiness(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fullName: form.fullName,
      email: form.email,
      whatsapp: form.whatsapp,
      countryOfResidence: form.countryOfResidence,
      nationality: form.nationality,
      preferredPathway: form.preferredPathway,
      medicalSchool: form.medicalSchool,
      graduationYear: form.graduationYear,
      internshipCompleted: form.internshipCompleted === 'yes',
      yearsExperience: form.yearsExperience,
      currentRole: form.currentRole,
      specialtyInterest: form.specialtyInterest,
      currentCountryOfPractice: form.currentCountryOfPractice,
      gmcStatus: form.gmcStatus,
      plabStatus: form.plabStatus,
      ieltsOetStatus: form.ieltsOetStatus,
      alsBlsStatus: form.alsBlsStatus,
      nhsExperience: form.nhsExperience === 'yes',
      previousUkApplications: form.previousUkApplications === 'yes',
      previousInterviews: form.previousInterviews === 'yes',
      careerStory: form.careerStory,
      documents: uploadedFiles,
      messages: [
        {
          id: `msg-${Date.now()}`,
          from: 'admin' as const,
          content: `Thank you for submitting your application, ${form.fullName}. Our career consultant has received your profile and will begin reviewing your documents within 48 hours. We will be in touch shortly with our initial assessment.`,
          createdAt: new Date().toISOString(),
          read: false,
        }
      ],
      adminNotes: [],
      missingDocuments: getMissingDocs(),
      recommendedSteps: getRecommendedSteps(),
    };

    store.addApplication(application);
    setSubmitting(false);

    // Redirect to checkout with plan details from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const planId = urlParams.get('plan') || 'standard';
    const planName = urlParams.get('planName') || 'Standard Package';
    const price = urlParams.get('price') || '299';
    toast.success(lang === 'ar' ? 'تم إرسال الطلب! جاري التحويل للدفع...' : 'Application submitted! Redirecting to payment...');
    setTimeout(() => navigate(`/checkout?plan=${planId}&planName=${encodeURIComponent(planName)}&price=${price}`), 1000);
  };

  const calculateReadiness = (): number => {
    let score = 30;
    if (form.gmcStatus === 'registered') score += 20;
    else if (form.gmcStatus === 'in-progress') score += 10;
    if (form.plabStatus === 'both-passed') score += 15;
    else if (form.plabStatus === 'plab1-passed') score += 8;
    if (form.ieltsOetStatus !== '' && form.ieltsOetStatus !== 'not-taken') score += 15;
    if (form.internshipCompleted === 'yes') score += 5;
    if (parseInt(form.yearsExperience) >= 3) score += 10;
    if (uploadedFiles.length >= 3) score += 5;
    return Math.min(score, 100);
  };

  const getMissingDocs = (): string[] => {
    const missing: string[] = [];
    const categories = uploadedFiles.map(f => f.category);
    if (!categories.includes('cv')) missing.push('CV');
    if (!categories.includes('passport')) missing.push('Passport copy');
    if (!categories.includes('medical-degree')) missing.push('Medical degree certificate');
    if (!categories.includes('internship-certificate')) missing.push('Internship certificate');
    if (!categories.includes('english-test')) missing.push('English test result');
    return missing;
  };

  const getRecommendedSteps = (): string[] => {
    const steps: string[] = [];
    if (form.gmcStatus !== 'registered') steps.push('Work towards GMC registration');
    if (form.plabStatus !== 'both-passed') steps.push('Complete PLAB examinations');
    if (form.ieltsOetStatus === '' || form.ieltsOetStatus === 'not-taken') steps.push('Take IELTS or OET English test');
    if (form.alsBlsStatus === '' || form.alsBlsStatus === 'none') steps.push('Obtain ALS/BLS certification');
    steps.push('Our team will review your profile and provide personalised recommendations');
    return steps;
  };

  const nextStep = () => {
    if (step === 1 && (!form.fullName || !form.email)) {
      toast.error('Please fill in your name and email');
      return;
    }
    setStep(prev => Math.min(prev + 1, 6));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-ivory py-8 lg:py-12">
      <div className="container max-w-3xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h1 className="font-serif text-2xl text-navy">{t('apply.title')}</h1>
            <span className="text-sm text-muted-foreground">{t('apply.stepOf')} {step} {t('apply.of')} 6</span>
          </div>
          <Progress value={(step / 6) * 100} className="h-2" />
          <div className="flex justify-between mt-2">
            {[t('apply.step1Title'), t('apply.step2Title'), t('apply.step3Title'), t('apply.step4Title'), t('apply.step5Title'), t('apply.step6Title')].map((title, i) => (
              <div key={i} className={`text-xs hidden sm:block ${step >= i + 1 ? 'text-teal font-medium' : 'text-muted-foreground'}`}>
                {title}
              </div>
            ))}
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6 lg:p-8">
            {/* Step 1: Personal Details */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-serif text-xl text-navy mb-1">{t('apply.personalTitle')}</h2>
                  <p className="text-sm text-muted-foreground">{t('apply.personalDesc')}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>{t('apply.fullName')} *</Label>
                    <Input value={form.fullName} onChange={e => updateForm('fullName', e.target.value)} placeholder="Dr. John Smith" className="mt-1.5" />
                  </div>
                  <div>
                    <Label>{t('apply.emailAddress')} *</Label>
                    <Input type="email" value={form.email} onChange={e => updateForm('email', e.target.value)} placeholder="doctor@example.com" className="mt-1.5" />
                  </div>
                  <div>
                    <Label>{t('apply.whatsapp')}</Label>
                    <Input value={form.whatsapp} onChange={e => updateForm('whatsapp', e.target.value)} placeholder="+44 7xxx xxx xxx" className="mt-1.5" />
                  </div>
                  <div>
                    <Label>{t('apply.countryOfResidence')}</Label>
                    <Input value={form.countryOfResidence} onChange={e => updateForm('countryOfResidence', e.target.value)} placeholder={lang === 'ar' ? 'مثال: مصر' : 'e.g. Egypt'} className="mt-1.5" />
                  </div>
                  <div>
                    <Label>{t('apply.nationality')}</Label>
                    <Input value={form.nationality} onChange={e => updateForm('nationality', e.target.value)} placeholder={lang === 'ar' ? 'مثال: مصري' : 'e.g. Egyptian'} className="mt-1.5" />
                  </div>
                  <div>
                    <Label>{t('apply.preferredPathway')}</Label>
                    <Select value={form.preferredPathway} onValueChange={v => updateForm('preferredPathway', v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="uk-doctors">{lang === 'ar' ? 'المملكة المتحدة — أطباء' : 'United Kingdom — Doctors'}</SelectItem>
                        <SelectItem value="gulf-doctors">{lang === 'ar' ? 'دول الخليج (قريباً)' : 'Gulf Countries (Coming Soon)'}</SelectItem>
                        <SelectItem value="australia-doctors">{lang === 'ar' ? 'أستراليا (قريباً)' : 'Australia (Coming Soon)'}</SelectItem>
                        <SelectItem value="canada-doctors">{lang === 'ar' ? 'كندا (قريباً)' : 'Canada (Coming Soon)'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t('apply.preferredLanguage')}</Label>
                    <Select value={form.preferredLanguage} onValueChange={v => updateForm('preferredLanguage', v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">{t('apply.english')}</SelectItem>
                        <SelectItem value="ar">{t('apply.arabic')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Medical Background */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-serif text-xl text-navy mb-1">{t('apply.medicalTitle')}</h2>
                  <p className="text-sm text-muted-foreground">{t('apply.medicalDesc')}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>{t('apply.medicalSchool')}</Label>
                    <Input value={form.medicalSchool} onChange={e => updateForm('medicalSchool', e.target.value)} placeholder={lang === 'ar' ? 'مثال: جامعة القاهرة' : 'e.g. Cairo University'} className="mt-1.5" />
                  </div>
                  <div>
                    <Label>{t('apply.graduationYear')}</Label>
                    <Input value={form.graduationYear} onChange={e => updateForm('graduationYear', e.target.value)} placeholder={lang === 'ar' ? 'مثال: 2018' : 'e.g. 2018'} className="mt-1.5" />
                  </div>
                  <div>
                    <Label>{t('apply.internshipCompleted')}</Label>
                    <Select value={form.internshipCompleted} onValueChange={v => updateForm('internshipCompleted', v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder={lang === 'ar' ? 'اختر...' : 'Select...'} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">{t('apply.yes')}</SelectItem>
                        <SelectItem value="no">{t('apply.no')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t('apply.yearsExperience')}</Label>
                    <Select value={form.yearsExperience} onValueChange={v => updateForm('yearsExperience', v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder={lang === 'ar' ? 'اختر...' : 'Select...'} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-1">{t('apply.lessThan1')}</SelectItem>
                        <SelectItem value="1-2">{t('apply.years12')}</SelectItem>
                        <SelectItem value="3-5">{t('apply.years35')}</SelectItem>
                        <SelectItem value="5-10">{t('apply.years510')}</SelectItem>
                        <SelectItem value="10+">{t('apply.years10plus')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t('apply.currentRole')}</Label>
                    <Input value={form.currentRole} onChange={e => updateForm('currentRole', e.target.value)} placeholder={lang === 'ar' ? 'مثال: ريجسترار باطنية' : 'e.g. Registrar in Internal Medicine'} className="mt-1.5" />
                  </div>
                  <div>
                    <Label>{t('apply.specialtyInterest')}</Label>
                    <Input value={form.specialtyInterest} onChange={e => updateForm('specialtyInterest', e.target.value)} placeholder={lang === 'ar' ? 'مثال: الطب الباطني الحاد' : 'e.g. Acute Internal Medicine'} className="mt-1.5" />
                  </div>
                  <div className="md:col-span-2">
                    <Label>{t('apply.currentCountry')}</Label>
                    <Input value={form.currentCountryOfPractice} onChange={e => updateForm('currentCountryOfPractice', e.target.value)} placeholder={lang === 'ar' ? 'مثال: مصر' : 'e.g. Egypt'} className="mt-1.5" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: UK Readiness */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-serif text-xl text-navy mb-1">{t('apply.ukReadyTitle')}</h2>
                  <p className="text-sm text-muted-foreground">{t('apply.ukReadyDesc')}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>{t('apply.gmcStatus')}</Label>
                    <Select value={form.gmcStatus} onValueChange={v => updateForm('gmcStatus', v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="registered">{t('apply.gmcRegistered')}</SelectItem>
                        <SelectItem value="in-progress">{t('apply.gmcInProgress')}</SelectItem>
                        <SelectItem value="not-started">{t('apply.gmcNotStarted')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t('apply.plabStatus')}</Label>
                    <Select value={form.plabStatus} onValueChange={v => updateForm('plabStatus', v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="both-passed">{t('apply.plabBoth')}</SelectItem>
                        <SelectItem value="plab1-passed">{t('apply.plab1Only')}</SelectItem>
                        <SelectItem value="not-taken">{t('apply.plabNotTaken')}</SelectItem>
                        <SelectItem value="exempt">{t('apply.plabExempt')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t('apply.ieltsStatus')}</Label>
                    <Select value={form.ieltsOetStatus} onValueChange={v => updateForm('ieltsOetStatus', v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ielts-passed">{t('apply.ieltsPassed')}</SelectItem>
                        <SelectItem value="oet-passed">{t('apply.oetPassed')}</SelectItem>
                        <SelectItem value="taken-not-passed">{t('apply.takenNotPassed')}</SelectItem>
                        <SelectItem value="not-taken">{t('apply.notTaken')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t('apply.alsBlsStatus')}</Label>
                    <Select value={form.alsBlsStatus} onValueChange={v => updateForm('alsBlsStatus', v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="als">{t('apply.alsCertified')}</SelectItem>
                        <SelectItem value="bls">{t('apply.blsCertified')}</SelectItem>
                        <SelectItem value="both">{t('apply.bothAlsBls')}</SelectItem>
                        <SelectItem value="none">{t('apply.none')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t('apply.nhsExperience')}</Label>
                    <Select value={form.nhsExperience} onValueChange={v => updateForm('nhsExperience', v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder={lang === 'ar' ? 'اختر...' : 'Select...'} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">{t('apply.yes')}</SelectItem>
                        <SelectItem value="no">{t('apply.no')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t('apply.previousApps')}</Label>
                    <Select value={form.previousUkApplications} onValueChange={v => updateForm('previousUkApplications', v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder={lang === 'ar' ? 'اختر...' : 'Select...'} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">{t('apply.yes')}</SelectItem>
                        <SelectItem value="no">{t('apply.no')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t('apply.previousInterviews')}</Label>
                    <Select value={form.previousInterviews} onValueChange={v => updateForm('previousInterviews', v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder={lang === 'ar' ? 'اختر...' : 'Select...'} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">{t('apply.yes')}</SelectItem>
                        <SelectItem value="no">{t('apply.no')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Documents Upload */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-serif text-xl text-navy mb-1">{t('apply.docsTitle')}</h2>
                  <p className="text-sm text-muted-foreground">{t('apply.docsDesc')}</p>
                </div>
                <div className="grid gap-3">
                  {DOC_TYPES.map(doc => {
                    const uploaded = uploadedFiles.find(f => f.category === doc.category);
                    const isUploading = uploadingCategory === doc.category;
                    return (
                      <div key={doc.category} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${uploaded ? 'border-teal/30 bg-teal/5' : 'border-border hover:border-teal/20'}`}>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${uploaded ? 'bg-teal/10' : 'bg-muted'}`}>
                            {uploaded ? <CheckCircle className="w-4 h-4 text-teal" /> : <FileText className="w-4 h-4 text-muted-foreground" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {lang === 'ar' ? t(`apply.doc${doc.category.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()).replace(/^([a-z])/, (_, c: string) => c.toUpperCase())}`) || doc.label : doc.label} {doc.required && <span className="text-destructive">*</span>}
                            </p>
                            {uploaded && (
                              <p className="text-xs text-teal truncate">{uploaded.name} · {uploaded.size}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          {uploaded && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(doc.category)}
                              className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button
                            variant={uploaded ? 'outline' : 'default'}
                            size="sm"
                            disabled={isUploading}
                            onClick={() => handleFileUpload(doc.category, doc.accept)}
                            className={uploaded ? 'btn-press' : 'bg-navy hover:bg-navy/90 text-white btn-press'}
                          >
                            {isUploading ? (
                              <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> {t('apply.uploading')}</>
                            ) : uploaded ? (
                              <><Upload className="w-3.5 h-3.5 mr-1" /> {t('apply.replace')}</>
                            ) : (
                              <><Upload className="w-3.5 h-3.5 mr-1" /> {t('apply.upload')}</>
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {uploadedFiles.length} / {DOC_TYPES.length} {t('apply.docsUploaded')}
                </p>
              </div>
            )}

            {/* Step 5: Voice Note / Career Story */}
            {step === 5 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-serif text-xl text-navy mb-1">{t('apply.storyTitle')}</h2>
                  <p className="text-sm text-muted-foreground">{t('apply.storyDesc')}</p>
                </div>
                <RadioGroup value={form.storyType} onValueChange={v => updateForm('storyType', v)} className="grid md:grid-cols-2 gap-4">
                  <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${form.storyType === 'written' ? 'border-teal bg-teal/5' : 'border-border'}`}>
                    <RadioGroupItem value="written" />
                    <div>
                      <p className="font-medium text-sm">{t('apply.writeStory')}</p>
                      <p className="text-xs text-muted-foreground">{t('apply.writeStoryDesc')}</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${form.storyType === 'voice' ? 'border-teal bg-teal/5' : 'border-border'}`}>
                    <RadioGroupItem value="voice" />
                    <div>
                      <p className="font-medium text-sm">{t('apply.uploadVoice')}</p>
                      <p className="text-xs text-muted-foreground">{t('apply.uploadVoiceDesc')}</p>
                    </div>
                  </label>
                </RadioGroup>

                {form.storyType === 'written' ? (
                  <div>
                    <Label>{t('apply.storyLabel')}</Label>
                    <Textarea
                      value={form.careerStory}
                      onChange={e => updateForm('careerStory', e.target.value)}
                      placeholder={t('apply.storyPlaceholder')}
                      className="mt-1.5 min-h-[200px]"
                    />
                    <p className="text-xs text-muted-foreground mt-2">{t('apply.storyHint')}</p>
                  </div>
                ) : (
                  <div>
                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                      <Mic className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm font-medium mb-1">{t('apply.voiceUploadTitle')}</p>
                      <p className="text-xs text-muted-foreground mb-4">{t('apply.voiceUploadDesc')}</p>
                      {uploadedFiles.find(f => f.category === 'voice-note') ? (
                        <div className="flex items-center justify-center gap-3">
                          <span className="text-sm text-teal">{uploadedFiles.find(f => f.category === 'voice-note')?.name}</span>
                          <Button variant="ghost" size="sm" onClick={() => removeFile('voice-note')} className="text-destructive"><X className="w-4 h-4" /></Button>
                        </div>
                      ) : (
                        <Button variant="outline" onClick={() => handleFileUpload('voice-note', '.mp3,.wav,.m4a,.ogg')} className="btn-press">
                          <Upload className="w-4 h-4 mr-2" /> Choose File
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 6: Consent */}
            {step === 6 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-serif text-xl text-navy mb-1">{t('apply.consentTitle')}</h2>
                  <p className="text-sm text-muted-foreground">{t('apply.consentDesc')}</p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h3 className="font-medium text-sm text-navy">{t('apply.summary')}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">{t('apply.summaryName')}</span>
                    <span>{form.fullName || '—'}</span>
                    <span className="text-muted-foreground">{t('apply.summaryEmail')}</span>
                    <span>{form.email || '—'}</span>
                    <span className="text-muted-foreground">{t('apply.summaryPathway')}</span>
                    <span>UK — Doctors</span>
                    <span className="text-muted-foreground">{t('apply.summarySpecialty')}</span>
                    <span>{form.specialtyInterest || '—'}</span>
                    <span className="text-muted-foreground">{t('apply.summaryDocs')}</span>
                    <span>{uploadedFiles.length} {t('apply.uploaded')}</span>
                    <span className="text-muted-foreground">{t('apply.summaryReadiness')}</span>
                    <span className="font-medium text-navy">{calculateReadiness()}%</span>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-3">
                    <Checkbox id="consent1" checked={form.consent1} onCheckedChange={v => updateForm('consent1', v as boolean)} />
                    <label htmlFor="consent1" className="text-sm leading-relaxed cursor-pointer">
                      {t('apply.consent1')}
                    </label>
                  </div>
                  <div className="flex items-start gap-3">
                    <Checkbox id="consent2" checked={form.consent2} onCheckedChange={v => updateForm('consent2', v as boolean)} />
                    <label htmlFor="consent2" className="text-sm leading-relaxed cursor-pointer">
                      {t('apply.consent2')}
                    </label>
                  </div>
                  <div className="flex items-start gap-3">
                    <Checkbox id="consent3" checked={form.consent3} onCheckedChange={v => updateForm('consent3', v as boolean)} />
                    <label htmlFor="consent3" className="text-sm leading-relaxed cursor-pointer">
                      {t('apply.consent3')}
                    </label>
                  </div>
                  <div className="flex items-start gap-3">
                    <Checkbox id="consent4" checked={form.consent4} onCheckedChange={v => updateForm('consent4', v as boolean)} />
                    <label htmlFor="consent4" className="text-sm leading-relaxed cursor-pointer">
                      {t('apply.consent4')}
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-200 gap-4">
              {step > 1 ? (
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="flex items-center gap-2 px-6 py-3 h-12 text-base font-medium border-2 border-gray-300 hover:border-gray-400 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <ArrowLeft className="w-5 h-5" />
                  {t('apply.previous')}
                </Button>
              ) : <div />}
              {step < 6 ? (
                <Button
                  onClick={nextStep}
                  className="flex items-center gap-2 px-8 py-3 h-12 text-base font-semibold bg-teal-500 hover:bg-teal-400 text-white rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-teal-400/30 transition-all duration-200 hover:scale-105 active:scale-95 ml-auto"
                >
                  {t('apply.nextStep')}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-8 py-3 h-12 text-base font-semibold bg-teal-500 hover:bg-teal-400 text-white rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-teal-400/30 transition-all duration-200 hover:scale-105 active:scale-95 ml-auto"
                >
                  <CheckCircle className="w-5 h-5" />
                  {t('apply.submitApplication')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
