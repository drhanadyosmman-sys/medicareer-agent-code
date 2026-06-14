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
import { store } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, ArrowLeft, Upload, CheckCircle, FileText, Mic } from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Personal Details', desc: 'Basic information about you' },
  { id: 2, title: 'Medical Background', desc: 'Your qualifications and experience' },
  { id: 3, title: 'UK Readiness', desc: 'Registration and exam status' },
  { id: 4, title: 'Documents', desc: 'Upload your certificates' },
  { id: 5, title: 'Your Story', desc: 'Tell us about your career goals' },
  { id: 6, title: 'Consent', desc: 'Review and confirm' },
];

export default function Apply() {
  const [step, setStep] = useState(1);
  const [, navigate] = useLocation();
  const { user, register } = useAuth();

  // Form state
  const [form, setForm] = useState({
    fullName: '', email: '', whatsapp: '', countryOfResidence: '', nationality: '', preferredPathway: 'uk-doctors',
    medicalSchool: '', graduationYear: '', internshipCompleted: '', yearsExperience: '', currentRole: '', specialtyInterest: '', currentCountryOfPractice: '',
    gmcStatus: '', plabStatus: '', ieltsOetStatus: '', alsBlsStatus: '', nhsExperience: '', previousUkApplications: '', previousInterviews: '',
    careerStory: '', storyType: 'written',
    consent1: false, consent2: false, consent3: false,
  });

  const [uploadedFiles, setUploadedFiles] = useState<{category: string; name: string}[]>([]);

  const updateForm = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (category: string) => {
    // Simulate file upload
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setUploadedFiles(prev => [...prev, { category, name: file.name }]);
        toast.success(`${file.name} uploaded successfully`);
      }
    };
    input.click();
  };

  const handleSubmit = () => {
    if (!form.consent1 || !form.consent2 || !form.consent3) {
      toast.error('Please accept all consent checkboxes');
      return;
    }

    // Register user if not logged in
    if (!user) {
      const pwd = 'temp' + Date.now();
      register(form.fullName, form.email, pwd);
    }

    const currentUser = store.getCurrentUser();
    const appId = `app-${Date.now()}`;

    const application = {
      id: appId,
      userId: currentUser?.id || `user-${Date.now()}`,
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
      documents: uploadedFiles.map((f, i) => ({
        id: `doc-${Date.now()}-${i}`,
        name: f.name,
        type: 'application/pdf',
        category: f.category as any,
        uploadedAt: new Date().toISOString(),
        size: 'N/A'
      })),
      messages: [],
      adminNotes: [],
      missingDocuments: getMissingDocs(),
      recommendedSteps: getRecommendedSteps(),
    };

    store.addApplication(application);
    toast.success('Application submitted successfully! Our team will review your profile within 48 hours.');
    navigate('/dashboard');
  };

  const calculateReadiness = (): number => {
    let score = 30; // Base score for completing the form
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
    if (step === 1) {
      if (!form.fullName || !form.email) {
        toast.error('Please fill in your name and email');
        return;
      }
    }
    setStep(prev => Math.min(prev + 1, 6));
  };

  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-ivory py-8 lg:py-12">
      <div className="container max-w-3xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h1 className="font-serif text-2xl text-navy">Doctor Assessment Form</h1>
            <span className="text-sm text-muted-foreground">Step {step} of 6</span>
          </div>
          <Progress value={(step / 6) * 100} className="h-2" />
          <div className="flex justify-between mt-2">
            {STEPS.map(s => (
              <div key={s.id} className={`text-xs hidden sm:block ${step >= s.id ? 'text-teal font-medium' : 'text-muted-foreground'}`}>
                {s.title}
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
                  <h2 className="font-serif text-xl text-navy mb-1">Personal Details</h2>
                  <p className="text-sm text-muted-foreground">Tell us about yourself so we can personalise your experience.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name *</Label>
                    <Input value={form.fullName} onChange={e => updateForm('fullName', e.target.value)} placeholder="Dr. John Smith" className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Email Address *</Label>
                    <Input type="email" value={form.email} onChange={e => updateForm('email', e.target.value)} placeholder="doctor@example.com" className="mt-1.5" />
                  </div>
                  <div>
                    <Label>WhatsApp Number</Label>
                    <Input value={form.whatsapp} onChange={e => updateForm('whatsapp', e.target.value)} placeholder="+44 7xxx xxx xxx" className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Country of Residence</Label>
                    <Input value={form.countryOfResidence} onChange={e => updateForm('countryOfResidence', e.target.value)} placeholder="e.g. Egypt" className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Nationality</Label>
                    <Input value={form.nationality} onChange={e => updateForm('nationality', e.target.value)} placeholder="e.g. Egyptian" className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Preferred Country Pathway</Label>
                    <Select value={form.preferredPathway} onValueChange={v => updateForm('preferredPathway', v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="uk-doctors">United Kingdom — Doctors</SelectItem>
                        <SelectItem value="gulf-doctors">Gulf Countries (Coming Soon)</SelectItem>
                        <SelectItem value="australia-doctors">Australia (Coming Soon)</SelectItem>
                        <SelectItem value="canada-doctors">Canada (Coming Soon)</SelectItem>
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
                  <h2 className="font-serif text-xl text-navy mb-1">Medical Background</h2>
                  <p className="text-sm text-muted-foreground">Your qualifications and clinical experience.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Medical School</Label>
                    <Input value={form.medicalSchool} onChange={e => updateForm('medicalSchool', e.target.value)} placeholder="e.g. Cairo University" className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Graduation Year</Label>
                    <Input value={form.graduationYear} onChange={e => updateForm('graduationYear', e.target.value)} placeholder="e.g. 2018" className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Internship Completed?</Label>
                    <Select value={form.internshipCompleted} onValueChange={v => updateForm('internshipCompleted', v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Years of Clinical Experience</Label>
                    <Select value={form.yearsExperience} onValueChange={v => updateForm('yearsExperience', v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-1">Less than 1 year</SelectItem>
                        <SelectItem value="1-2">1-2 years</SelectItem>
                        <SelectItem value="3-5">3-5 years</SelectItem>
                        <SelectItem value="5-10">5-10 years</SelectItem>
                        <SelectItem value="10+">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Current Role</Label>
                    <Input value={form.currentRole} onChange={e => updateForm('currentRole', e.target.value)} placeholder="e.g. Registrar in Internal Medicine" className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Specialty Interest</Label>
                    <Input value={form.specialtyInterest} onChange={e => updateForm('specialtyInterest', e.target.value)} placeholder="e.g. Acute Internal Medicine" className="mt-1.5" />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Current Country of Practice</Label>
                    <Input value={form.currentCountryOfPractice} onChange={e => updateForm('currentCountryOfPractice', e.target.value)} placeholder="e.g. Egypt" className="mt-1.5" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: UK Readiness */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-serif text-xl text-navy mb-1">UK Readiness</h2>
                  <p className="text-sm text-muted-foreground">Your current registration and examination status for UK practice.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>GMC Registration Status</Label>
                    <Select value={form.gmcStatus} onValueChange={v => updateForm('gmcStatus', v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="registered">Fully Registered</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="not-started">Not Started</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>PLAB Status</Label>
                    <Select value={form.plabStatus} onValueChange={v => updateForm('plabStatus', v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="both-passed">PLAB 1 & 2 Passed</SelectItem>
                        <SelectItem value="plab1-passed">PLAB 1 Passed Only</SelectItem>
                        <SelectItem value="not-taken">Not Taken</SelectItem>
                        <SelectItem value="exempt">Exempt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>IELTS/OET Status</Label>
                    <Select value={form.ieltsOetStatus} onValueChange={v => updateForm('ieltsOetStatus', v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ielts-passed">IELTS — Passed (7.5+)</SelectItem>
                        <SelectItem value="oet-passed">OET — Passed (B+)</SelectItem>
                        <SelectItem value="taken-not-passed">Taken but not passed</SelectItem>
                        <SelectItem value="not-taken">Not Taken</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>ALS/BLS Status</Label>
                    <Select value={form.alsBlsStatus} onValueChange={v => updateForm('alsBlsStatus', v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="als">ALS Certified</SelectItem>
                        <SelectItem value="bls">BLS Certified</SelectItem>
                        <SelectItem value="both">Both ALS & BLS</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Previous NHS Experience?</Label>
                    <Select value={form.nhsExperience} onValueChange={v => updateForm('nhsExperience', v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Previous UK Applications?</Label>
                    <Select value={form.previousUkApplications} onValueChange={v => updateForm('previousUkApplications', v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Previous Interviews?</Label>
                    <Select value={form.previousInterviews} onValueChange={v => updateForm('previousInterviews', v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
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
                  <h2 className="font-serif text-xl text-navy mb-1">Document Upload</h2>
                  <p className="text-sm text-muted-foreground">Upload your certificates and documents. You can add more later from your dashboard.</p>
                </div>
                <div className="grid gap-3">
                  {[
                    { category: 'cv', label: 'CV / Resume', required: true },
                    { category: 'passport', label: 'Passport Copy', required: false },
                    { category: 'medical-degree', label: 'Medical Degree Certificate', required: true },
                    { category: 'internship-certificate', label: 'Internship Certificate', required: false },
                    { category: 'experience-certificates', label: 'Experience Certificates', required: false },
                    { category: 'english-test', label: 'English Test Result (IELTS/OET)', required: false },
                    { category: 'gmc-certificate', label: 'GMC Certificate (if available)', required: false },
                    { category: 'other', label: 'Other Documents', required: false },
                  ].map(doc => {
                    const uploaded = uploadedFiles.find(f => f.category === doc.category);
                    return (
                      <div key={doc.category} className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-teal/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{doc.label} {doc.required && <span className="text-destructive">*</span>}</p>
                            {uploaded && <p className="text-xs text-teal">{uploaded.name}</p>}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleFileUpload(doc.category)} className="btn-press">
                          {uploaded ? <CheckCircle className="w-4 h-4 text-teal" /> : <Upload className="w-4 h-4" />}
                          <span className="ml-1.5">{uploaded ? 'Replace' : 'Upload'}</span>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 5: Voice Note / Career Story */}
            {step === 5 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-serif text-xl text-navy mb-1">Your Career Story</h2>
                  <p className="text-sm text-muted-foreground">Help us understand your experience and career goals. Choose one option below.</p>
                </div>
                <RadioGroup value={form.storyType} onValueChange={v => updateForm('storyType', v)} className="grid md:grid-cols-2 gap-4">
                  <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${form.storyType === 'written' ? 'border-teal bg-teal/5' : 'border-border'}`}>
                    <RadioGroupItem value="written" />
                    <div>
                      <p className="font-medium text-sm">Write Your Story</p>
                      <p className="text-xs text-muted-foreground">Type your career story and goals</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${form.storyType === 'voice' ? 'border-teal bg-teal/5' : 'border-border'}`}>
                    <RadioGroupItem value="voice" />
                    <div>
                      <p className="font-medium text-sm">Upload Voice Note</p>
                      <p className="text-xs text-muted-foreground">Record or upload an audio file</p>
                    </div>
                  </label>
                </RadioGroup>

                {form.storyType === 'written' ? (
                  <div>
                    <Label>Your Career Story & Goals</Label>
                    <Textarea
                      value={form.careerStory}
                      onChange={e => updateForm('careerStory', e.target.value)}
                      placeholder="Tell us about your medical career journey so far, what motivates you, and what you hope to achieve by working in the UK. The more detail you provide, the better we can support your application..."
                      className="mt-1.5 min-h-[200px]"
                    />
                    <p className="text-xs text-muted-foreground mt-2">Minimum 50 words recommended. Include your specialty interests, career goals, and why you want to work in the UK.</p>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                    <Mic className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium mb-1">Upload a Voice Note</p>
                    <p className="text-xs text-muted-foreground mb-4">MP3, WAV, or M4A — up to 5 minutes</p>
                    <Button variant="outline" onClick={() => handleFileUpload('voice-note')} className="btn-press">
                      <Upload className="w-4 h-4 mr-2" /> Choose File
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Step 6: Consent */}
            {step === 6 && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-serif text-xl text-navy mb-1">Review & Consent</h2>
                  <p className="text-sm text-muted-foreground">Please review and confirm the following before submitting your application.</p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h3 className="font-medium text-sm text-navy">Application Summary</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Name:</span>
                    <span>{form.fullName || '—'}</span>
                    <span className="text-muted-foreground">Email:</span>
                    <span>{form.email || '—'}</span>
                    <span className="text-muted-foreground">Pathway:</span>
                    <span>UK — Doctors</span>
                    <span className="text-muted-foreground">Specialty:</span>
                    <span>{form.specialtyInterest || '—'}</span>
                    <span className="text-muted-foreground">Documents:</span>
                    <span>{uploadedFiles.length} uploaded</span>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-3">
                    <Checkbox id="consent1" checked={form.consent1} onCheckedChange={v => updateForm('consent1', v as boolean)} />
                    <label htmlFor="consent1" className="text-sm leading-relaxed cursor-pointer">
                      I confirm that the information provided is accurate and complete to the best of my knowledge.
                    </label>
                  </div>
                  <div className="flex items-start gap-3">
                    <Checkbox id="consent2" checked={form.consent2} onCheckedChange={v => updateForm('consent2', v as boolean)} />
                    <label htmlFor="consent2" className="text-sm leading-relaxed cursor-pointer">
                      I understand that this service does not guarantee employment. MediCareer Agent prepares, matches, and supports my application process to maximise my chances of being shortlisted for interviews.
                    </label>
                  </div>
                  <div className="flex items-start gap-3">
                    <Checkbox id="consent3" checked={form.consent3} onCheckedChange={v => updateForm('consent3', v as boolean)} />
                    <label htmlFor="consent3" className="text-sm leading-relaxed cursor-pointer">
                      I authorise the MediCareer Agent team to review my documents and prepare application materials on my behalf.
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              {step > 1 ? (
                <Button variant="outline" onClick={prevStep} className="btn-press">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Previous
                </Button>
              ) : <div />}
              {step < 6 ? (
                <Button onClick={nextStep} className="bg-navy hover:bg-navy/90 text-white btn-press">
                  Next Step <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="bg-teal hover:bg-teal/90 text-white btn-press">
                  <CheckCircle className="w-4 h-4 mr-2" /> Submit Application
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
