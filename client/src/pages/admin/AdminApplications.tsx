// Admin Applications — MediCareer Agent
// Design: Navy/teal premium medical aesthetic. Staff workspace tools are internal only.

import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { store, DoctorApplication } from '@/lib/store';
import { toast } from 'sonner';
import ChatPanel from '@/components/ChatPanel';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Search, Filter, FileText, Download, MessageSquare, StickyNote,
  ChevronRight, User, Clock, CheckCircle, Briefcase, Wand2, Loader2
} from 'lucide-react';

const STAGE_LABELS: Record<string, string> = {
  'submitted': 'Submitted',
  'under-review': 'Under Review',
  'cv-optimization': 'CV Optimisation',
  'job-matching': 'Job Matching',
  'applications-prepared': 'Applications Prepared',
  'interview-preparation': 'Interview Preparation',
};

const STAGE_COLORS: Record<string, string> = {
  'submitted': 'bg-slate-100 text-slate-700',
  'under-review': 'bg-blue-50 text-blue-700',
  'cv-optimization': 'bg-amber-50 text-amber-700',
  'job-matching': 'bg-purple-50 text-purple-700',
  'applications-prepared': 'bg-teal/10 text-teal',
  'interview-preparation': 'bg-green-50 text-green-700',
};

// Internal staff workspace outputs
const WORKSPACE_OUTPUTS: Record<string, (app: DoctorApplication) => string> = {
  'cv-review': (app) => `CV REVIEW NOTES — ${app.fullName}\n\n` +
    `Overall Assessment: The CV shows solid clinical experience but requires restructuring for NHS applications.\n\n` +
    `Strengths:\n• ${app.yearsExperience} years of clinical experience in ${app.specialtyInterest}\n• Completed internship with relevant specialty exposure\n• ${app.ieltsOetStatus}\n\n` +
    `Areas for Improvement:\n• CV format does not follow NHS Medical CV standards\n• Clinical achievements need quantification (audit data, patient outcomes)\n• Teaching and leadership experience needs highlighting\n• Research/publications section needs expansion\n• Personal statement needs to be role-specific\n\n` +
    `Recommendations:\n1. Restructure to NHS Medical CV format\n2. Add clinical governance activities\n3. Include specific examples of teamwork and leadership\n4. Quantify achievements where possible\n5. Tailor personal statement to target specialty`,

  'supporting-info': (app) => `NHS SUPPORTING INFORMATION DRAFT — ${app.fullName}\n\n` +
    `Role: Clinical Fellow in ${app.specialtyInterest}\n\n` +
    `Clinical Experience:\nI bring ${app.yearsExperience} years of clinical experience in ${app.specialtyInterest}, having trained at ${app.medicalSchool}. My clinical practice has equipped me with comprehensive skills in patient assessment, management planning, and multidisciplinary team working.\n\n` +
    `Clinical Governance:\n[To be completed with specific audit/QI projects from the candidate]\n\n` +
    `Teaching & Training:\n[To be completed with specific teaching activities]\n\n` +
    `Research & Audit:\n[To be completed with specific research activities]\n\n` +
    `Commitment to Specialty:\nMy interest in ${app.specialtyInterest} developed during my training at ${app.medicalSchool}.\n\n` +
    `NOTE: This is a draft framework. Review with the candidate and add specific examples.`,

  'interview-prep': (app) => `INTERVIEW PREPARATION — ${app.fullName}\nSpecialty: ${app.specialtyInterest}\n\n` +
    `CLINICAL SCENARIO QUESTIONS:\n\n` +
    `1. "Tell us about a time you managed a deteriorating patient."\n   Model structure: SBAR approach, escalation, reflection\n\n` +
    `2. "Describe a clinical error or near-miss you were involved in."\n   Model structure: Situation, what happened, immediate actions, learning, changes implemented\n\n` +
    `3. "How would you manage a conflict with a senior colleague about patient care?"\n   Model structure: Patient safety first, professional communication, escalation pathway\n\n` +
    `NHS VALUES QUESTIONS:\n\n` +
    `4. "What do you understand about the NHS values?"\n   Key points: Compassion, respect, dignity, commitment to quality, working together\n\n` +
    `5. "Tell us about a time you went above and beyond for a patient."\n   Model structure: Specific example, patient-centred care, outcome\n\n` +
    `SPECIALTY-SPECIFIC QUESTIONS:\n\n` +
    `6. "What recent developments in ${app.specialtyInterest} interest you?"\n   Prepare 2-3 recent guidelines or research papers\n\n` +
    `7. "Where do you see yourself in 5 years?"\n   Align with NHS training pathway and specialty development`,

  'career-assessment': (app) => `CAREER ASSESSMENT — ${app.fullName}\n\n` +
    `STRENGTHS:\n• Medical degree from ${app.medicalSchool}\n• ${app.yearsExperience} years clinical experience\n• ${app.ieltsOetStatus}\n• Interest in ${app.specialtyInterest}\n${app.nhsExperience ? '• Previous NHS experience\n' : ''}\n` +
    `GAPS & PRIORITIES:\n` +
    `${app.gmcStatus !== 'registered' ? '• GMC Registration — CRITICAL: Must be completed before most applications\n' : ''}` +
    `${app.plabStatus !== 'both-passed' ? '• PLAB Completion — Required for GMC registration\n' : ''}` +
    `${app.alsBlsStatus === 'none' || !app.alsBlsStatus ? '• ALS/BLS Certification — Required for most clinical posts\n' : ''}\n` +
    `COMPETITIVENESS: ${app.readinessScore >= 80 ? 'HIGH' : app.readinessScore >= 60 ? 'MODERATE' : 'DEVELOPING'}\n\n` +
    `RECOMMENDED TIMELINE:\nMonth 1-2: Complete missing documents\nMonth 2-3: CV optimisation and application preparation\nMonth 3-4: Begin targeted applications\nMonth 4-6: Interview preparation`,

  'application-package': (app) => `APPLICATION PACKAGE — ${app.fullName}\n\n` +
    `PACKAGE CONTENTS:\n\n1. CV IMPROVEMENTS:\n• Restructured to NHS Medical CV format\n• Added clinical governance section\n• Quantified achievements\n\n` +
    `2. SUPPORTING INFORMATION:\n• Role-specific supporting statement prepared\n• Matched to person specification criteria\n\n` +
    `3. COVER LETTER:\n• Professional cover letter template\n• Customised for target Trust/Hospital\n\n` +
    `4. APPLICATION CHECKLIST:\n✓ CV (NHS format)\n✓ Supporting information\n✓ Cover letter\n${app.gmcStatus === 'registered' ? '✓' : '○'} GMC registration\n${app.ieltsOetStatus ? '✓' : '○'} English language evidence\n○ References (2 required)\n\n` +
    `5. MISSING DOCUMENTS:\n${app.missingDocuments?.map(d => `• ${d}`).join('\n') || '• None identified'}`,

  'career-plan': (app) => `CAREER ROADMAP — ${app.fullName}\n\nTARGET: ${app.specialtyInterest} in NHS, United Kingdom\n\n` +
    `PHASE 1 — FOUNDATION (Months 1-3):\n` +
    `${app.gmcStatus !== 'registered' ? '• Complete GMC registration process\n' : ''}` +
    `${app.plabStatus !== 'both-passed' ? '• Pass remaining PLAB examinations\n' : ''}` +
    `• Obtain ALS certification\n• Complete CV optimisation\n\n` +
    `PHASE 2 — APPLICATION (Months 3-6):\n• Begin targeted applications to suitable posts\n• Focus on Trust-grade and Clinical Fellow positions\n• Target 10-15 suitable positions\n\n` +
    `PHASE 3 — INTERVIEW & PLACEMENT (Months 6-9):\n• Interview preparation for shortlisted positions\n• Mock interviews and feedback\n• Accept suitable offer\n\n` +
    `PHASE 4 — LONG-TERM (Year 1-3):\n• Gain NHS experience and positive references\n• Build portfolio (audit, teaching, research)\n• Work towards career progression in ${app.specialtyInterest}`,
};

export default function AdminApplications() {
  const { t } = useLanguage();
  const [applications, setApplications] = useState(store.getApplications());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [selectedApp, setSelectedApp] = useState<DoctorApplication | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [generatingTool, setGeneratingTool] = useState<string | null>(null);
  const [generatedOutput, setGeneratedOutput] = useState<string>('');
  const [showOutput, setShowOutput] = useState(false);
  const [profileTab, setProfileTab] = useState('profile');

  const refreshApplications = () => setApplications(store.getApplications());

  // Total unread messages from users
  const totalUnread = applications.reduce((sum, app) => {
    return sum + app.messages.filter(m => m.from === 'user' && !m.read).length;
  }, 0);

  const filteredApps = applications.filter(app => {
    const matchesSearch = app.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.specialtyInterest.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = filterStage === 'all' || app.status === filterStage;
    return matchesSearch && matchesStage;
  });

  const openProfile = (app: DoctorApplication, tab?: string) => {
    setSelectedApp(app);
    setProfileTab(tab || 'profile');
    setShowProfile(true);
  };

  const sendStatusUpdate = trpc.email.sendStatusUpdate.useMutation();
  const sendMessageNotification = trpc.email.sendMessageNotification.useMutation();

  const changeStage = (appId: string, newStage: string) => {
    store.updateApplication(appId, { status: newStage as any });
    refreshApplications();
    const app = applications.find(a => a.id === appId);
    if (selectedApp?.id === appId) {
      setSelectedApp(prev => prev ? { ...prev, status: newStage as any } : null);
    }
    // Send status update email to doctor
    if (app?.email) {
      sendStatusUpdate.mutate({ to: app.email, name: app.fullName, newStatus: newStage });
    }
    toast.success(`Stage updated to: ${STAGE_LABELS[newStage]}`);
  };

  const addNote = () => {
    if (!newNote.trim() || !selectedApp) return;
    const note = { id: `note-${Date.now()}`, content: newNote, createdAt: new Date().toISOString(), type: 'general' as const };
    const updatedNotes = [...selectedApp.adminNotes, note];
    store.updateApplication(selectedApp.id, { adminNotes: updatedNotes });
    setSelectedApp(prev => prev ? { ...prev, adminNotes: updatedNotes } : null);
    refreshApplications();
    setNewNote('');
    toast.success('Note added');
  };

  const handleDownloadDocument = (doc: { id: string; name: string }) => {
    const dataUrl = store.getFileData(doc.id);
    if (!dataUrl) {
      toast.info('This is a demo document — no actual file data stored for pre-loaded documents.');
      return;
    }
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = doc.name;
    link.click();
    toast.success(`Downloading ${doc.name}`);
  };

  const runWorkspaceTool = (toolKey: string, label: string) => {
    if (!selectedApp) return;
    setGeneratingTool(toolKey);
    setTimeout(() => {
      const output = WORKSPACE_OUTPUTS[toolKey]?.(selectedApp) || 'Output generated successfully.';
      setGeneratedOutput(output);
      setShowOutput(true);
      setGeneratingTool(null);
      const note = { id: `note-${Date.now()}`, content: output, createdAt: new Date().toISOString(), type: toolKey as any };
      const updatedNotes = [...selectedApp.adminNotes, note];
      store.updateApplication(selectedApp.id, { adminNotes: updatedNotes });
      setSelectedApp(prev => prev ? { ...prev, adminNotes: updatedNotes } : null);
      refreshApplications();
      toast.success(`${label} — Complete`);
    }, 1500);
  };

  const getAppUnreadCount = (app: DoctorApplication) =>
    app.messages.filter(m => m.from === 'user' && !m.read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-navy">{t('admin.applications')}</h1>
          <p className="text-sm text-muted-foreground">{applications.length} {t('admin.totalApplicants')}</p>
        </div>
        {totalUnread > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-teal/10 rounded-lg border border-teal/20">
            <MessageSquare className="w-4 h-4 text-teal" />
            <span className="text-sm text-teal font-medium">{totalUnread} unread message{totalUnread !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t('admin.searchPlaceholder')} className="pl-9" />
        </div>
        <Select value={filterStage} onValueChange={setFilterStage}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {Object.entries(STAGE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Applications List */}
      <div className="space-y-3">
        {filteredApps.map(app => {
          const appUnread = getAppUnreadCount(app);
          return (
            <Card key={app.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => openProfile(app)}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-navy" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-navy truncate">{app.fullName}</h3>
                    <Badge className={`text-xs ${STAGE_COLORS[app.status]}`}>{STAGE_LABELS[app.status]}</Badge>
                    {appUnread > 0 && (
                      <Badge className="text-xs bg-teal text-white">{appUnread} new</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{app.specialtyInterest} · {app.nationality} · Score: {app.readinessScore}%</p>
                </div>
                <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {app.documents.length}</span>
                  <button
                    className="flex items-center gap-1 hover:text-teal transition-colors relative"
                    onClick={e => { e.stopPropagation(); openProfile(app, 'messages'); }}
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> {app.messages.length}
                    {appUnread > 0 && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-teal text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {appUnread}
                      </span>
                    )}
                  </button>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          );
        })}
        {filteredApps.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No applications match your filters.</div>
        )}
      </div>

      {/* Applicant Profile Dialog */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedApp && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-xl text-navy flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-navy" />
                  </div>
                  {selectedApp.fullName}
                </DialogTitle>
              </DialogHeader>

              <Tabs value={profileTab} onValueChange={setProfileTab} className="mt-4">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="workspace">Workspace</TabsTrigger>
                  <TabsTrigger value="messages" className="relative">
                    Messages
                    {getAppUnreadCount(selectedApp) > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-teal text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {getAppUnreadCount(selectedApp)}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-4 mt-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="border shadow-none">
                      <CardContent className="p-4">
                        <h4 className="font-medium text-sm text-navy mb-3">Personal Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-muted-foreground">Email:</span><span>{selectedApp.email}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">WhatsApp:</span><span>{selectedApp.whatsapp}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Nationality:</span><span>{selectedApp.nationality}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Residence:</span><span>{selectedApp.countryOfResidence}</span></div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border shadow-none">
                      <CardContent className="p-4">
                        <h4 className="font-medium text-sm text-navy mb-3">Medical Background</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-muted-foreground">School:</span><span className="text-right max-w-[60%] truncate">{selectedApp.medicalSchool}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Graduated:</span><span>{selectedApp.graduationYear}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Experience:</span><span>{selectedApp.yearsExperience} years</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Specialty:</span><span>{selectedApp.specialtyInterest}</span></div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border shadow-none">
                      <CardContent className="p-4">
                        <h4 className="font-medium text-sm text-navy mb-3">UK Readiness</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-muted-foreground">GMC:</span><span>{selectedApp.gmcStatus}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">PLAB:</span><span>{selectedApp.plabStatus}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">IELTS/OET:</span><span>{selectedApp.ieltsOetStatus}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">ALS/BLS:</span><span>{selectedApp.alsBlsStatus}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">NHS Exp:</span><span>{selectedApp.nhsExperience ? 'Yes' : 'No'}</span></div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border shadow-none">
                      <CardContent className="p-4">
                        <h4 className="font-medium text-sm text-navy mb-3">Documents ({selectedApp.documents.length})</h4>
                        <div className="space-y-2">
                          {selectedApp.documents.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No documents uploaded</p>
                          ) : (
                            selectedApp.documents.map(doc => (
                              <div key={doc.id} className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2 truncate flex-1 min-w-0">
                                  <FileText className="w-3.5 h-3.5 text-teal shrink-0" />
                                  <span className="truncate">{doc.name}</span>
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 shrink-0"
                                  onClick={() => handleDownloadDocument(doc)}
                                  title="Download"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Stage Control */}
                  <Card className="border shadow-none">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-sm text-navy mb-3">Application Stage</h4>
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge className={`${STAGE_COLORS[selectedApp.status]}`}>{STAGE_LABELS[selectedApp.status]}</Badge>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        <Select value={selectedApp.status} onValueChange={v => changeStage(selectedApp.id, v)}>
                          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(STAGE_LABELS).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Readiness Score:</span>
                        <span className="text-lg font-bold text-navy">{selectedApp.readinessScore}%</span>
                      </div>
                    </CardContent>
                  </Card>

                  {selectedApp.careerStory && (
                    <Card className="border shadow-none">
                      <CardContent className="p-4">
                        <h4 className="font-medium text-sm text-navy mb-2">Career Story</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{selectedApp.careerStory}</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Workspace Tab */}
                <TabsContent value="workspace" className="space-y-4 mt-4">
                  <div className="p-4 bg-navy/5 rounded-lg border border-navy/10">
                    <h4 className="font-medium text-sm text-navy mb-1">Staff Workspace</h4>
                    <p className="text-xs text-muted-foreground">Internal tools for preparing applicant materials. Outputs are saved to notes and can be sent to the applicant.</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      { key: 'cv-review', label: 'Review CV', desc: 'Generate CV improvement notes and recommendations', icon: FileText },
                      { key: 'supporting-info', label: 'Prepare NHS Supporting Information', desc: 'Draft role-specific supporting statement', icon: Briefcase },
                      { key: 'interview-prep', label: 'Generate Interview Questions', desc: 'Create personalised interview preparation pack', icon: MessageSquare },
                      { key: 'career-assessment', label: 'Career Assessment', desc: 'Evaluate strengths, gaps, and priorities', icon: CheckCircle },
                      { key: 'application-package', label: 'Generate Application Package', desc: 'Prepare complete application materials', icon: FileText },
                      { key: 'career-plan', label: 'Generate Career Plan', desc: 'Create personalised career roadmap', icon: Clock },
                    ].map(tool => (
                      <Card key={tool.key} className="border shadow-none hover:shadow-sm transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-teal/10 flex items-center justify-center shrink-0">
                              <tool.icon className="w-4 h-4 text-teal" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm text-navy">{tool.label}</h4>
                              <p className="text-xs text-muted-foreground mt-0.5">{tool.desc}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="w-full mt-3 bg-navy hover:bg-navy/90 text-white btn-press"
                            disabled={generatingTool === tool.key}
                            onClick={() => runWorkspaceTool(tool.key, tool.label)}
                          >
                            {generatingTool === tool.key ? (
                              <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Processing...</>
                            ) : (
                              <><Wand2 className="w-3.5 h-3.5 mr-2" /> Run</>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Messages Tab — WhatsApp-style chat */}
                <TabsContent value="messages" className="mt-4">
                  <ChatPanel
                    application={selectedApp}
                    viewerRole="admin"
                    compact={true}
                    onUpdate={(updated) => {
                      setSelectedApp(updated);
                      refreshApplications();
                    }}
                  />
                </TabsContent>

                {/* Notes Tab */}
                <TabsContent value="notes" className="space-y-4 mt-4">
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {selectedApp.adminNotes.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No notes yet</p>
                    ) : (
                      selectedApp.adminNotes.map(note => (
                        <div key={note.id} className="p-3 rounded-lg bg-muted/50 border">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">{note.type}</Badge>
                            <span className="text-xs text-muted-foreground">{new Date(note.createdAt).toLocaleDateString('en-GB')}</span>
                          </div>
                          <pre className="text-sm whitespace-pre-wrap font-sans">{note.content}</pre>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add private note..." className="min-h-[60px]" />
                    <Button onClick={addNote} variant="outline" className="self-end btn-press"><StickyNote className="w-4 h-4 mr-1" /> Add</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Generated Output Dialog */}
      <Dialog open={showOutput} onOpenChange={setShowOutput}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg text-navy">Generated Output</DialogTitle>
          </DialogHeader>
          <pre className="text-sm whitespace-pre-wrap font-sans bg-muted/50 p-4 rounded-lg mt-4">{generatedOutput}</pre>
          <div className="flex gap-2 mt-4">
            <Button onClick={() => { navigator.clipboard.writeText(generatedOutput); toast.success('Copied to clipboard'); }} variant="outline" className="btn-press">Copy</Button>
            <Button
              onClick={() => {
                if (!selectedApp) return;
                const msg = { id: `msg-${Date.now()}`, from: 'admin' as const, content: generatedOutput, createdAt: new Date().toISOString(), read: false };
                const updatedMessages = [...selectedApp.messages, msg];
                store.updateApplication(selectedApp.id, { messages: updatedMessages });
                setSelectedApp(prev => prev ? { ...prev, messages: updatedMessages } : null);
                refreshApplications();
                setShowOutput(false);
                setProfileTab('messages');
                // Send email notification to doctor
                if (selectedApp.email) {
                  sendMessageNotification.mutate({
                    to: selectedApp.email,
                    name: selectedApp.fullName,
                    messagePreview: generatedOutput.slice(0, 200) + (generatedOutput.length > 200 ? '...' : ''),
                  });
                }
                toast.success('Sent to applicant');
              }}
              className="bg-teal hover:bg-teal/90 text-white btn-press"
            >
              Send to Applicant
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
