import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { store, DoctorApplication } from '@/lib/store';
import { toast } from 'sonner';
import {
  CheckCircle, AlertCircle, FileText, MessageSquare, Upload, Clock,
  ArrowRight, Send, User, ChevronRight
} from 'lucide-react';

const STAGES = [
  { key: 'submitted', label: 'Submitted', icon: CheckCircle },
  { key: 'under-review', label: 'Under Review', icon: Clock },
  { key: 'cv-optimization', label: 'CV Optimisation', icon: FileText },
  { key: 'job-matching', label: 'Job Matching', icon: ArrowRight },
  { key: 'applications-prepared', label: 'Applications Prepared', icon: FileText },
  { key: 'interview-preparation', label: 'Interview Preparation', icon: User },
];

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [application, setApplication] = useState<DoctorApplication | null>(null);
  const [newMessage, setNewMessage] = useState('');

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

  const sendMessage = () => {
    if (!newMessage.trim() || !application) return;
    const msg = {
      id: `msg-${Date.now()}`,
      from: 'user' as const,
      content: newMessage,
      createdAt: new Date().toISOString(),
      read: false,
    };
    const updatedMessages = [...application.messages, msg];
    store.updateApplication(application.id, { messages: updatedMessages });
    setApplication(prev => prev ? { ...prev, messages: updatedMessages } : null);
    setNewMessage('');
    toast.success('Message sent to your consultant');
  };

  if (!application) {
    return (
      <div className="min-h-screen bg-ivory py-12">
        <div className="container max-w-2xl text-center">
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
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-navy mb-1">Welcome, {application.fullName}</h1>
          <p className="text-muted-foreground">Your application is being handled by our career consultancy team.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Readiness Score */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg text-navy">Application Readiness Score</CardTitle>
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
                <CardTitle className="font-serif text-lg text-navy">Application Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 overflow-x-auto pb-2">
                  {STAGES.map((stage, i) => (
                    <div key={stage.key} className="flex items-center">
                      <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap ${
                        i <= currentStageIdx ? 'bg-teal/10 text-teal' : 'bg-muted text-muted-foreground'
                      }`}>
                        {i <= currentStageIdx ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {stage.label}
                      </div>
                      {i < STAGES.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mx-0.5" />}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Current stage: <strong className="text-navy">{STAGES[currentStageIdx]?.label}</strong>
                </p>
              </CardContent>
            </Card>

            {/* Messages */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg text-navy flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" /> Messages from Your Consultant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[300px] overflow-y-auto mb-4">
                  {application.messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No messages yet. Our team will be in touch shortly.</p>
                  ) : (
                    application.messages.map(msg => (
                      <div key={msg.id} className={`p-3 rounded-lg ${msg.from === 'admin' ? 'bg-navy/5 border-l-3 border-teal' : 'bg-muted ml-8'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-navy">
                            {msg.from === 'admin' ? 'Career Consultant' : 'You'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(msg.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          {!msg.read && msg.from === 'admin' && <Badge variant="secondary" className="text-xs bg-teal/10 text-teal">New</Badge>}
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed">{msg.content}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <Textarea
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Send a message to your consultant..."
                    className="min-h-[60px]"
                  />
                  <Button onClick={sendMessage} className="bg-navy hover:bg-navy/90 text-white btn-press self-end">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Missing Documents */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg text-navy flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-gold" /> Missing Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {application.missingDocuments.length === 0 ? (
                  <p className="text-sm text-teal flex items-center gap-2"><CheckCircle className="w-4 h-4" /> All documents uploaded</p>
                ) : (
                  <ul className="space-y-2">
                    {application.missingDocuments.map((doc, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                        {doc}
                      </li>
                    ))}
                  </ul>
                )}
                <Button variant="outline" size="sm" className="w-full mt-4 btn-press" onClick={() => toast.info('Document upload feature — upload from your profile')}>
                  <Upload className="w-4 h-4 mr-2" /> Upload Documents
                </Button>
              </CardContent>
            </Card>

            {/* Uploaded Documents */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg text-navy flex items-center gap-2">
                  <FileText className="w-5 h-5" /> Your Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {application.documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {application.documents.map(doc => (
                      <li key={doc.id} className="flex items-center gap-2 text-sm p-2 rounded bg-muted/50">
                        <FileText className="w-4 h-4 text-teal shrink-0" />
                        <span className="truncate flex-1">{doc.name}</span>
                        <span className="text-xs text-muted-foreground">{doc.size}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Recommended Steps */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg text-navy">Recommended Next Steps</CardTitle>
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
      </div>
    </div>
  );
}
