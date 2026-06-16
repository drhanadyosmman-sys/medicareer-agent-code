// User Dashboard — MediCareer Agent
// Design: Navy/teal/gold premium medical aesthetic. No AI mentions anywhere.

import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { store, DoctorApplication, DocumentFile } from '@/lib/store';
import { toast } from 'sonner';
import ChatPanel from '@/components/ChatPanel';
import { useLanguage } from '@/contexts/LanguageContext';
import { queueStore, JobSubmission } from '@/lib/appQueue';
import { reviewStore, ResumeReviewRequest } from '@/lib/resumeReview';
import {
  CheckCircle, AlertCircle, FileText, MessageSquare, Upload, Clock,
  ArrowRight, User, ChevronRight, Download, X, Loader2, Bell, CalendarCheck, Briefcase
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const STAGES = [
  { key: 'submitted', label: 'Submitted', labelAr: 'تم الإرسال', icon: CheckCircle },
  { key: 'under-review', label: 'Under Review', labelAr: 'قيد المراجعة', icon: Clock },
  { key: 'cv-optimization', label: 'CV Review', labelAr: 'مراجعة السيرة', icon: FileText },
  { key: 'job-matching', label: 'Matching', labelAr: 'مطابقة', icon: ArrowRight },
  { key: 'applications-prepared', label: 'Applied', labelAr: 'تم التقديم', icon: FileText },
  { key: 'interview-preparation', label: 'Interview', labelAr: 'مقابلة', icon: User },
];

const DOC_CATEGORIES = [
  { category: 'cv', label: 'CV / Resume', accept: '.pdf,.doc,.docx' },
  { category: 'passport', label: 'Passport Copy', accept: '.pdf,.jpg,.jpeg,.png' },
  { category: 'medical-degree', label: 'Medical Degree', accept: '.pdf,.jpg,.jpeg,.png' },
  { category: 'internship-certificate', label: 'Internship Certificate', accept: '.pdf,.jpg,.jpeg,.png' },
  { category: 'experience-certificates', label: 'Experience Certificates', accept: '.pdf,.jpg,.jpeg,.png' },
  { category: 'english-test', label: 'English Test Result', accept: '.pdf,.jpg,.jpeg,.png' },
  { category: 'gmc-certificate', label: 'GMC Certificate', accept: '.pdf,.jpg,.jpeg,.png' },
  { category: 'research-publications', label: 'Research Publications', accept: '.pdf,.doc,.docx' },
  { category: 'quality-improvement', label: 'Quality Improvement Projects', accept: '.pdf,.doc,.docx,.jpg,.jpeg,.png' },
  { category: 'leadership-evidence', label: 'Leadership Evidence', accept: '.pdf,.doc,.docx,.jpg,.jpeg,.png' },
  { category: 'teaching-experience', label: 'Teaching Experience', accept: '.pdf,.doc,.docx,.jpg,.jpeg,.png' },
  { category: 'clinical-audit', label: 'Clinical Audit', accept: '.pdf,.doc,.docx,.jpg,.jpeg,.png' },
  { category: 'other', label: 'Other Documents', accept: '.pdf,.doc,.docx,.jpg,.jpeg,.png' },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [application, setApplication] = useState<DoctorApplication | null>(null);
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const { t, lang } = useLanguage();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user) {
      const app = store.getApplicationByUserId(user.id);
      if (app) setApplication(app);
    }
  }, [isAuthenticated, user, navigate]);

  // Unread message count
  const unreadCount = application?.messages.filter(m => m.from === 'admin' && !m.read).length ?? 0;

  const handleUploadDocument = (category: string, accept: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !application) return;
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File too large. Maximum size is 10MB.');
        return;
      }
      setUploadingCategory(category);
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const dataUrl = readerEvent.target?.result as string;
        const fileId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        store.saveFileData(fileId, dataUrl);

        const docFile: DocumentFile = {
          id: fileId,
          name: file.name,
          type: file.type,
          category: category as any,
          uploadedAt: new Date().toISOString(),
          size: formatFileSize(file.size),
        };

        // Replace existing doc of same category or add new
        const existingIdx = application.documents.findIndex(d => d.category === category);
        let updatedDocs: DocumentFile[];
        if (existingIdx >= 0) {
          store.deleteFileData(application.documents[existingIdx].id);
          updatedDocs = [...application.documents];
          updatedDocs[existingIdx] = docFile;
        } else {
          updatedDocs = [...application.documents, docFile];
        }

        // Update missing documents list
        const updatedMissing = application.missingDocuments.filter(m => {
          const catLabel = DOC_CATEGORIES.find(d => d.category === category)?.label || '';
          return !m.toLowerCase().includes(catLabel.toLowerCase().split(' ')[0]);
        });

        store.updateApplication(application.id, { documents: updatedDocs, missingDocuments: updatedMissing });
        setApplication(prev => prev ? { ...prev, documents: updatedDocs, missingDocuments: updatedMissing } : null);
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

  const handleDownloadDocument = (doc: DocumentFile) => {
    const dataUrl = store.getFileData(doc.id);
    if (!dataUrl) {
      toast.info('This is a demo document — download not available for pre-loaded files.');
      return;
    }
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = doc.name;
    link.click();
    toast.success(`Downloading ${doc.name}`);
  };

  const handleDeleteDocument = (docId: string) => {
    if (!application) return;
    store.deleteFileData(docId);
    const updatedDocs = application.documents.filter(d => d.id !== docId);
    store.updateApplication(application.id, { documents: updatedDocs });
    setApplication(prev => prev ? { ...prev, documents: updatedDocs } : null);
    toast.success('Document removed');
  };

  if (!application) {
    return (
      <div className="min-h-screen bg-ivory py-12">
        <div className="container max-w-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-navy/5 flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8 text-navy/30" />
          </div>
          <h1 className="font-serif text-3xl text-navy mb-4">Your Dashboard</h1>
          <p className="text-muted-foreground mb-6">You have not submitted an application yet. Complete our assessment form to get started.</p>
          <Button onClick={() => navigate('/apply')} className="bg-teal hover:bg-teal/90 text-white btn-press">
            Start Your Assessment <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  const currentStageIdx = STAGES.findIndex(s => s.key === application.status);

  return (
    <div className="min-h-screen bg-ivory py-8">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
          <h1 className="font-serif text-3xl text-navy mb-1">{t('dashboard.welcome')}, {application.fullName.split(' ').slice(0, 2).join(' ')}</h1>
          <p className="text-muted-foreground">{t('dashboard.subtitle')}</p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => setActiveTab('messages')}
              className="flex items-center gap-2 px-4 py-2 bg-teal/10 hover:bg-teal/20 text-teal rounded-xl border border-teal/20 transition-colors btn-press"
            >
              <Bell className="w-4 h-4" />
              <span className="text-sm font-medium">{unreadCount} new message{unreadCount > 1 ? 's' : ''}</span>
            </button>
          )}
        </div>

        {/* Subscribed Plan Card */}
        {(() => {
          const subscribedPkg = store.getPackages().find(p => p.id === (application.preferredPathway === 'uk-nhs-jobs' ? 'pkg-2' : 'pkg-2'));
          const planName = subscribedPkg?.name || 'Full Application Preparation';
          const planPrice = subscribedPkg?.price || 399;
          return (
            <div className="mb-6 p-4 bg-gradient-to-r from-navy to-blue-800 rounded-xl flex items-center justify-between gap-4 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/15 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-teal-300" />
                </div>
                <div>
                  <div className="text-xs text-white/60 font-medium">
                    {lang === 'ar' ? 'باقتك الحالية' : 'Your Current Plan'}
                  </div>
                  <div className="text-white font-semibold text-sm">
                    {planName} <span className="text-teal-300 font-bold">— £{planPrice}</span>
                  </div>
                </div>
              </div>
              <Badge className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs">
                {lang === 'ar' ? 'نشط' : 'Active'}
              </Badge>
            </div>
          );
        })()}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-white border border-border shadow-sm">
            <TabsTrigger value="overview">{t('dashboard.overview')}</TabsTrigger>
            <TabsTrigger value="applications">
              {lang === 'ar' ? 'الطلبات المقدمة' : 'Applications'}
            </TabsTrigger>
            <TabsTrigger value="messages" className="relative">
              {t('dashboard.messages')}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-teal text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="jobs">
              {lang === 'ar' ? 'وظائف لك' : 'Jobs For You'}
            </TabsTrigger>
            <TabsTrigger value="documents">{t('dashboard.documentsTab')}</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Readiness Score */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-serif text-lg text-navy">{t('dashboard.readinessTitle')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="text-4xl font-bold text-navy">{application.readinessScore}%</div>
                      <div className="flex-1">
                        <Progress value={application.readinessScore} className="h-3" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {application.readinessScore >= 80 ? t('dashboard.profileStrong') :
                       application.readinessScore >= 60 ? t('dashboard.profileGood') :
                       t('dashboard.profileWeak')}
                    </p>
                  </CardContent>
                </Card>

                {/* Application Stage */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-serif text-lg text-navy">{t('dashboard.progressTitle')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                        <span>{lang === 'ar' ? STAGES[0].labelAr : STAGES[0].label}</span>
                        <span>{lang === 'ar' ? STAGES[STAGES.length - 1].labelAr : STAGES[STAGES.length - 1].label}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full transition-all duration-500"
                          style={{ width: `${((currentStageIdx + 1) / STAGES.length) * 100}%` }}
                        />
                      </div>
                    </div>
                    {/* Step grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {STAGES.map((stage, i) => {
                        const Icon = stage.icon;
                        const done = i < currentStageIdx;
                        const active = i === currentStageIdx;
                        return (
                          <div key={stage.key} className="flex flex-col items-center gap-1 text-center">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                              done ? 'bg-teal-100 text-teal-600' :
                              active ? 'bg-blue-900 text-white ring-2 ring-blue-900 ring-offset-2' :
                              'bg-gray-100 text-gray-400'
                            }`}>
                              {done ? <CheckCircle className="w-4 h-4" /> : <Icon className={`w-4 h-4 ${active ? 'animate-pulse' : ''}`} />}
                            </div>
                            <span className={`text-[10px] leading-tight font-medium ${
                              done ? 'text-teal-600' : active ? 'text-blue-900' : 'text-gray-400'
                            }`}>
                              {lang === 'ar' ? stage.labelAr : stage.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-sm text-muted-foreground mt-4 pt-3 border-t">
                      {t('dashboard.currentStage')}: <strong className="text-navy">{lang === 'ar' ? STAGES[currentStageIdx]?.labelAr : STAGES[currentStageIdx]?.label}</strong>
                    </p>
                  </CardContent>
                </Card>

                {/* Recent Messages Preview */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                      <CardTitle className="font-serif text-lg text-navy flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" /> {t('dashboard.recentMessages')}
                      {unreadCount > 0 && (
                        <Badge className="bg-teal text-white text-xs">{unreadCount} {t('dashboard.newBadge')}</Badge>
                      )}
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('messages')} className="text-teal hover:text-teal/80 text-xs">
                      {t('dashboard.viewAll')} <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {application.messages.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">{t('dashboard.noMessages')}</p>
                    ) : (
                      <div className="space-y-3">
                        {application.messages.slice(-3).map(msg => (
                          <div key={msg.id} className={`p-3 rounded-lg ${msg.from === 'admin' ? 'bg-navy/5 border-l-2 border-teal' : 'bg-muted ml-6'}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-navy">
                                {msg.from === 'admin' ? t('dashboard.careerConsultant') : t('dashboard.you')}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(msg.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                              </span>
                              {!msg.read && msg.from === 'admin' && (
                                <Badge variant="secondary" className="text-xs bg-teal/10 text-teal py-0">{t('dashboard.newBadge')}</Badge>
                              )}
                            </div>
                            <p className="text-sm text-foreground/80 leading-relaxed line-clamp-2">{msg.content}</p>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" className="w-full btn-press" onClick={() => setActiveTab('messages')}>
                          {t('dashboard.openFullChat')} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Missing Documents */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-serif text-base text-navy flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-gold" /> {t('dashboard.missingDocs')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {application.missingDocuments.length === 0 ? (
                      <p className="text-sm text-teal flex items-center gap-2"><CheckCircle className="w-4 h-4" /> {t('dashboard.allDocsUploaded')}</p>
                    ) : (
                      <ul className="space-y-2">
                        {application.missingDocuments.map((doc, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                            {doc}
                          </li>
                        ))}
                      </ul>
                    )}
                    <Button variant="outline" size="sm" className="w-full mt-4 btn-press" onClick={() => setActiveTab('documents')}>
                      <Upload className="w-4 h-4 mr-2" /> {t('dashboard.uploadDocuments')}
                    </Button>
                  </CardContent>
                </Card>

                {/* Expert Resume Review */}
                <Card className="border-0 shadow-sm border-l-4 border-l-teal">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-teal/10 flex items-center justify-center shrink-0">
                        <CalendarCheck className="w-4 h-4 text-teal" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-navy">{lang === 'ar' ? 'جلسة مراجعة السيرة الذاتية' : 'Expert Resume Review Session'}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{lang === 'ar' ? 'جلسة فردية مع مستشارنا المهني لتحسين سيرتك الذاتية لطلبات NHS' : '1-on-1 session with our career consultant to optimise your CV for NHS applications'}</p>
                      </div>
                    </div>
                    {(() => {
                      const existingReq = application ? reviewStore.getRequestsForCandidate(application.id).find(r => r.status !== 'cancelled') : null;
                      if (existingReq) return (
                        <div className={`text-xs px-3 py-2 rounded-lg ${
                          existingReq.status === 'scheduled' ? 'bg-teal/10 text-teal' :
                          existingReq.status === 'completed' ? 'bg-green-50 text-green-700' :
                          'bg-blue-50 text-blue-700'
                        }`}>
                          {existingReq.status === 'pending' && (lang === 'ar' ? 'طلبك قيد المراجعة — سنتواصل معك قريباً' : 'Request received — our team will be in touch shortly')}
                          {existingReq.status === 'scheduled' && (lang === 'ar' ? 'تم جدولة جلستك' : 'Your session has been scheduled')}
                          {existingReq.status === 'completed' && (lang === 'ar' ? 'تمت مراجعة سيرتك الذاتية' : 'Resume review completed')}
                        </div>
                      );
                      return (
                        <Button size="sm" className="w-full bg-teal hover:bg-teal/90 text-white btn-press" onClick={() => setShowReviewModal(true)}>
                          <CalendarCheck className="w-3.5 h-3.5 mr-1.5" />
                          {lang === 'ar' ? 'احجز جلسة مراجعة' : 'Book Review Session'}
                        </Button>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Recommended Steps */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-serif text-base text-navy">Recommended Next Steps</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2.5">
                      {application.recommendedSteps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <div className="w-5 h-5 rounded-full bg-navy/10 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-xs font-medium text-navy">{i + 1}</span>
                          </div>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications">
            <div className="max-w-3xl mx-auto space-y-6">
              <div>
                <h2 className="font-serif text-xl text-navy">{lang === 'ar' ? 'الطلبات المقدمة نيابة عنك' : 'Applications Submitted on Your Behalf'}</h2>
                <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'فريقنا يقدم على الوظائف المناسبة نيابة عنك' : 'Our team applies to suitable positions on your behalf'}</p>
              </div>
              {(() => {
                const submissions = application ? queueStore.getSubmissionsForCandidate(application.id) : [];
                if (submissions.length === 0) return (
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-8 text-center">
                      <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'لم يتم تقديم طلبات بعد. فريقنا يعمل على إعداد طلباتك.' : 'No applications submitted yet. Our team is preparing your applications.'}</p>
                    </CardContent>
                  </Card>
                );
                return (
                  <div className="space-y-3">
                    {submissions.map(sub => (
                      <Card key={sub.id} className="border-0 shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-navy text-sm">{sub.jobTitle}</h4>
                              <p className="text-xs text-muted-foreground mt-0.5">{sub.nhsTrust}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className={`text-xs ${
                                  sub.status === 'submitted' ? 'bg-teal/10 text-teal' :
                                  sub.status === 'interview' ? 'bg-green-50 text-green-700' :
                                  sub.status === 'rejected' ? 'bg-red-50 text-red-700' :
                                  'bg-blue-50 text-blue-700'
                                }`}>
                                  {sub.status === 'submitted' ? (lang === 'ar' ? 'مُقدَّم' : 'Submitted') :
                                   sub.status === 'interview' ? (lang === 'ar' ? 'مقابلة' : 'Interview') :
                                   sub.status === 'rejected' ? (lang === 'ar' ? 'مرفوض' : 'Rejected') :
                                   sub.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{lang === 'ar' ? 'درجة التطابق' : 'Match'}: {sub.matchScore}%</span>
                                {sub.submittedAt && <span className="text-xs text-muted-foreground">{new Date(sub.submittedAt).toLocaleDateString('en-GB')}</span>}
                              </div>
                            </div>
                          </div>
                          {sub.status === 'submitted' && sub.tailoredCv && (
                            <details className="mt-3">
                              <summary className="text-xs text-teal cursor-pointer hover:underline">{lang === 'ar' ? 'عرض السيرة الذاتية المستخدمة' : 'View tailored CV used'}</summary>
                              <pre className="text-xs whitespace-pre-wrap font-sans bg-muted/30 p-3 rounded-lg border mt-2 max-h-[200px] overflow-y-auto">{sub.tailoredCv}</pre>
                            </details>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                );
              })()}
            </div>
          </TabsContent>

          {/* Messages Tab — WhatsApp-style chat */}
          <TabsContent value="messages">
            <div className="max-w-3xl mx-auto">
              <div className="mb-4">
                <h2 className="font-serif text-xl text-navy">Messages</h2>
                <p className="text-sm text-muted-foreground">Direct communication with your career consultant</p>
              </div>
              <ChatPanel
                application={application}
                viewerRole="user"
                onUpdate={(updated) => setApplication(updated)}
              />
            </div>
          </TabsContent>

          {/* Jobs For You Tab */}
          <TabsContent value="jobs">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-xl text-navy">
                  {lang === 'ar' ? 'وظائف مقترحة لك' : 'Jobs Suggested For You'}
                </h2>
              </div>
              {(() => {
                const { jobMgmt } = require('@/lib/jobManagement');
                const sharedJobs = jobMgmt.getSharedJobsForDoctor(user?.id || '');
                if (sharedJobs.length === 0) return (
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-8 text-center">
                      <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">{lang === 'ar' ? 'لا توجد وظائف مقترحة حالياً. فريقنا يبحث عن الفرص المناسبة لك.' : 'No jobs suggested yet. Our team is searching for suitable opportunities for you.'}</p>
                    </CardContent>
                  </Card>
                );
                return sharedJobs.map((sj: any) => (
                  <Card key={sj.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-blue-900">{sj.job?.title || 'Job'}</h3>
                            <Badge className={`text-xs ${
                              sj.status === 'New' ? 'bg-blue-100 text-blue-700' :
                              sj.status === 'Applied' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {sj.status === 'New' ? (lang === 'ar' ? 'جديد' : 'New') :
                               sj.status === 'Applied' ? (lang === 'ar' ? 'تم التقديم' : 'Applied') :
                               sj.status}
                            </Badge>
                            {sj.applicationStatus && (
                              <Badge className="text-xs bg-teal-100 text-teal-700">{sj.applicationStatus}</Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {sj.job?.hospital} • {sj.job?.location}
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">{sj.job?.specialty}</Badge>
                            <Badge variant="outline" className="text-xs">{sj.job?.rank}</Badge>
                            {sj.job?.salaryRange && <Badge className="text-xs bg-blue-50 text-blue-700 border-0">{sj.job.salaryRange}</Badge>}
                          </div>
                          {sj.job?.description && (
                            <p className="text-sm text-gray-600 mt-3 line-clamp-2">{sj.job.description}</p>
                          )}
                        </div>
                      </div>
                      {sj.applicationStatus && (
                        <div className="mt-3 pt-3 border-t text-sm text-gray-500">
                          {lang === 'ar' ? 'حالة التقديم:' : 'Application Status:'} <strong className="text-blue-900">{sj.applicationStatus}</strong>
                          {sj.applicationNotes && <span className="ml-2 text-gray-400">— {sj.applicationNotes}</span>}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ));
              })()}
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <div className="max-w-3xl mx-auto space-y-6">
              <div>
                <h2 className="font-serif text-xl text-navy">Your Documents</h2>
                <p className="text-sm text-muted-foreground">Upload and manage your certificates and supporting documents</p>
              </div>

              {/* Uploaded Documents */}
              {application.documents.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-serif text-base text-navy">Uploaded Documents ({application.documents.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {application.documents.map(doc => (
                        <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-teal/20 transition-colors">
                          <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-teal" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.size} · {new Date(doc.uploadedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadDocument(doc)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-navy"
                              title="Download"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                              title="Remove"
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Upload More Documents */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="font-serif text-base text-navy">Upload Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {DOC_CATEGORIES.map(doc => {
                      const uploaded = application.documents.find(d => d.category === doc.category);
                      const isUploading = uploadingCategory === doc.category;
                      return (
                        <div key={doc.category} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${uploaded ? 'border-teal/30 bg-teal/5' : 'border-border hover:border-teal/20'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${uploaded ? 'bg-teal/10' : 'bg-muted'}`}>
                              {uploaded ? <CheckCircle className="w-3.5 h-3.5 text-teal" /> : <FileText className="w-3.5 h-3.5 text-muted-foreground" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{doc.label}</p>
                              {uploaded && <p className="text-xs text-teal truncate max-w-[200px]">{uploaded.name}</p>}
                            </div>
                          </div>
                          <Button
                            variant={uploaded ? 'outline' : 'default'}
                            size="sm"
                            disabled={isUploading}
                            onClick={() => handleUploadDocument(doc.category, doc.accept)}
                            className={uploaded ? 'btn-press' : 'bg-navy hover:bg-navy/90 text-white btn-press'}
                          >
                            {isUploading ? (
                              <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> Uploading</>
                            ) : uploaded ? (
                              'Replace'
                            ) : (
                              <><Upload className="w-3.5 h-3.5 mr-1" /> Upload</>
                            )}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">Accepted formats: PDF, JPG, PNG, DOC, DOCX. Maximum 10MB per file.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Resume Review Booking Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg text-navy">
              {lang === 'ar' ? 'احجز جلسة مراجعة السيرة الذاتية' : 'Book Expert Resume Review Session'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="p-4 bg-teal/5 rounded-xl border border-teal/10">
              <p className="text-sm text-foreground/80 leading-relaxed">
                {lang === 'ar'
                  ? 'سيتواصل معك أحد مستشارينا المهنيين لجدولة جلسة مراجعة مخصصة لسيرتك الذاتية. الجلسة تستغرق حوالي 45-60 دقيقة.'
                  : 'One of our career consultants will contact you to schedule a personalised CV review session. Sessions typically last 45-60 minutes.'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">
                {lang === 'ar' ? 'ما الذي تريد مراجعته؟ (اختياري)' : 'What would you like us to focus on? (optional)'}
              </label>
              <Textarea
                value={reviewMessage}
                onChange={e => setReviewMessage(e.target.value)}
                placeholder={lang === 'ar' ? 'مثال: تحسين قسم الخبرة السريرية، إضافة أبحاثي...' : 'e.g. Improve clinical experience section, highlight my audit work...'}
                className="mt-1.5 min-h-[80px]"
              />
            </div>
            <Button
              className="w-full bg-teal hover:bg-teal/90 text-white btn-press"
              disabled={reviewSubmitting}
              onClick={() => {
                if (!application) return;
                setReviewSubmitting(true);
                setTimeout(() => {
                  const req = {
                    id: `review-${Date.now()}`,
                    candidateId: application.id,
                    candidateName: application.fullName,
                    email: application.email,
                    specialty: application.specialtyInterest,
                    message: reviewMessage,
                    status: 'pending' as const,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  };
                  reviewStore.addRequest(req);
                  // Send confirmation message
                  const msg = {
                    id: `msg-${Date.now()}`,
                    from: 'admin' as const,
                    content: `Thank you for booking an expert resume review session, ${application.fullName.split(' ')[0]}. One of our career consultants will be in touch within 24 hours to confirm your session time. Please ensure your latest CV is uploaded to your documents section.`,
                    createdAt: new Date().toISOString(),
                    read: false,
                  };
                  store.updateApplication(application.id, { messages: [...application.messages, msg] });
                  setApplication(prev => prev ? { ...prev, messages: [...prev.messages, msg] } : null);
                  setReviewSubmitting(false);
                  setShowReviewModal(false);
                  setReviewMessage('');
                  toast.success(lang === 'ar' ? 'تم إرسال طلبك! سنتواصل معك قريباً.' : 'Request sent! Our team will be in touch shortly.');
                }, 800);
              }}
            >
              {reviewSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {lang === 'ar' ? 'جاري الإرسال...' : 'Sending...'}</> : (lang === 'ar' ? 'إرسال الطلب' : 'Send Request')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
