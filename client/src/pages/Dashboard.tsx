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
import {
  CheckCircle, AlertCircle, FileText, MessageSquare, Upload, Clock,
  ArrowRight, User, ChevronRight, Download, X, Loader2, Bell
} from 'lucide-react';

const STAGES = [
  { key: 'submitted', label: 'Submitted', icon: CheckCircle },
  { key: 'under-review', label: 'Under Review', icon: Clock },
  { key: 'cv-optimization', label: 'CV Optimisation', icon: FileText },
  { key: 'job-matching', label: 'Job Matching', icon: ArrowRight },
  { key: 'applications-prepared', label: 'Applications Prepared', icon: FileText },
  { key: 'interview-preparation', label: 'Interview Preparation', icon: User },
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
        <div className="flex items-start justify-between mb-8">
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

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-white border border-border shadow-sm">
            <TabsTrigger value="overview">{t('dashboard.overview')}</TabsTrigger>
            <TabsTrigger value="messages" className="relative">
              {t('dashboard.messages')}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-teal text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
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
                      {application.readinessScore >= 80 ? 'Your profile is strong. Our team is preparing applications for suitable roles.' :
                       application.readinessScore >= 60 ? 'Good progress. Complete the recommended steps below to strengthen your application.' :
                       'There are several areas to improve. Follow the recommended steps to increase your readiness.'}
                    </p>
                  </CardContent>
                </Card>

                {/* Application Stage */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-serif text-lg text-navy">{t('dashboard.progressTitle')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-1 overflow-x-auto pb-2">
                      {STAGES.map((stage, i) => (
                        <div key={stage.key} className="flex items-center">
                          <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap ${
                            i < currentStageIdx ? 'bg-teal/10 text-teal' :
                            i === currentStageIdx ? 'bg-navy text-white' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {i < currentStageIdx ? <CheckCircle className="w-3.5 h-3.5" /> :
                             i === currentStageIdx ? <Clock className="w-3.5 h-3.5 animate-pulse" /> :
                             <Clock className="w-3.5 h-3.5" />}
                            {stage.label}
                          </div>
                          {i < STAGES.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mx-0.5" />}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      {t('dashboard.currentStage')}: <strong className="text-navy">{STAGES[currentStageIdx]?.label}</strong>
                    </p>
                  </CardContent>
                </Card>

                {/* Recent Messages Preview */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="font-serif text-lg text-navy flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" /> Recent Messages
                      {unreadCount > 0 && (
                        <Badge className="bg-teal text-white text-xs">{unreadCount} new</Badge>
                      )}
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('messages')} className="text-teal hover:text-teal/80 text-xs">
                      View all <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {application.messages.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No messages yet. Our team will be in touch shortly.</p>
                    ) : (
                      <div className="space-y-3">
                        {application.messages.slice(-3).map(msg => (
                          <div key={msg.id} className={`p-3 rounded-lg ${msg.from === 'admin' ? 'bg-navy/5 border-l-2 border-teal' : 'bg-muted ml-6'}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-navy">
                                {msg.from === 'admin' ? 'Career Consultant' : 'You'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(msg.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                              </span>
                              {!msg.read && msg.from === 'admin' && (
                                <Badge variant="secondary" className="text-xs bg-teal/10 text-teal py-0">New</Badge>
                              )}
                            </div>
                            <p className="text-sm text-foreground/80 leading-relaxed line-clamp-2">{msg.content}</p>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" className="w-full btn-press" onClick={() => setActiveTab('messages')}>
                          Open Full Chat <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
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
                      <AlertCircle className="w-4 h-4 text-gold" /> Missing Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {application.missingDocuments.length === 0 ? (
                      <p className="text-sm text-teal flex items-center gap-2"><CheckCircle className="w-4 h-4" /> All documents uploaded</p>
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
                      <Upload className="w-4 h-4 mr-2" /> Upload Documents
                    </Button>
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
    </div>
  );
}
