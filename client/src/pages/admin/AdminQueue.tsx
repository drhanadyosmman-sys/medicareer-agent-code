// Admin Application Queue — Daily Workflow & Submission Management
// All AI is hidden — appears as professional staff workflow

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { queueStore, JobSubmission, Subscription } from '@/lib/appQueue';
import { nhsStore } from '@/lib/nhsJobs';
import {
  Send, Clock, CheckCircle, AlertTriangle, Users, Briefcase,
  Target, Calendar, TrendingUp, Loader2, Play, FileText, Copy,
  PenLine, XCircle, ArrowRight, RefreshCw, Zap
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  'pending': 'bg-slate-100 text-slate-700',
  'ready': 'bg-blue-50 text-blue-700',
  'submitted': 'bg-teal/10 text-teal',
  'response-received': 'bg-amber-50 text-amber-700',
  'interview': 'bg-green-50 text-green-700',
  'rejected': 'bg-red-50 text-red-700',
};

const SUB_STATUS_COLORS: Record<string, string> = {
  'active': 'bg-teal/10 text-teal',
  'expired': 'bg-red-50 text-red-700',
  'exhausted': 'bg-amber-50 text-amber-700',
};

export default function AdminQueue() {
  const [submissions, setSubmissions] = useState(queueStore.getSubmissions());
  const [subscriptions, setSubscriptions] = useState(queueStore.getSubscriptions());
  const [stats, setStats] = useState(queueStore.getDailyStats());
  const [activeTab, setActiveTab] = useState('workflow');
  const [selectedSub, setSelectedSub] = useState<JobSubmission | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [batchSubmitting, setBatchSubmitting] = useState(false);
  const [autoMatching, setAutoMatching] = useState(false);

  const refresh = () => {
    setSubmissions(queueStore.getSubmissions());
    setSubscriptions(queueStore.getSubscriptions());
    setStats(queueStore.getDailyStats());
  };

  const handleSubmit = (subId: string) => {
    setSubmitting(subId);
    setTimeout(() => {
      const success = queueStore.submitApplication(subId);
      if (success) {
        toast.success('Application submitted — notification sent to doctor');
      } else {
        toast.error('Cannot submit — check subscription status');
      }
      refresh();
      setSubmitting(null);
    }, 1500);
  };

  const handleBatchSubmit = () => {
    setBatchSubmitting(true);
    setTimeout(() => {
      const count = queueStore.submitAllReady();
      toast.success(`${count} application(s) submitted successfully`);
      refresh();
      setBatchSubmitting(false);
    }, 2000);
  };

  const handleAutoMatch = () => {
    setAutoMatching(true);
    setTimeout(() => {
      const result = queueStore.autoMatchAndQueue();
      if (result.newEntries > 0) {
        toast.success(`${result.newEntries} new application(s) queued from matching`);
      } else {
        toast.info('No new matches found — all eligible candidates already queued');
      }
      refresh();
      setAutoMatching(false);
    }, 2000);
  };

  const updateStatus = (subId: string, status: string) => {
    queueStore.updateSubmission(subId, { status: status as any });
    refresh();
    if (selectedSub?.id === subId) setSelectedSub(prev => prev ? { ...prev, status: status as any } : null);
    toast.success(`Status updated to: ${status}`);
  };

  const readySubmissions = submissions.filter(s => s.status === 'ready');
  const submittedSubmissions = submissions.filter(s => s.status === 'submitted');
  const allSubmissions = submissions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-navy">Application Queue</h1>
          <p className="text-sm text-muted-foreground">Manage and submit applications on behalf of doctors</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAutoMatch} disabled={autoMatching} className="btn-press">
            {autoMatching ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Matching...</> : <><RefreshCw className="w-4 h-4 mr-2" /> Auto-Match</>}
          </Button>
          {readySubmissions.length > 0 && (
            <Button onClick={handleBatchSubmit} disabled={batchSubmitting} className="bg-teal hover:bg-teal/90 text-white btn-press">
              {batchSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : <><Zap className="w-4 h-4 mr-2" /> Submit All Ready ({readySubmissions.length})</>}
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="workflow">Daily Workflow</TabsTrigger>
          <TabsTrigger value="queue">Queue ({readySubmissions.length})</TabsTrigger>
          <TabsTrigger value="submitted">Submitted ({submittedSubmissions.length})</TabsTrigger>
          <TabsTrigger value="subscriptions">Packages ({subscriptions.length})</TabsTrigger>
        </TabsList>

        {/* ===== DAILY WORKFLOW TAB ===== */}
        <TabsContent value="workflow">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-navy">{stats.toSubmitToday}</div>
                <p className="text-xs text-muted-foreground mt-1">Ready to Submit</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-teal">{stats.submittedThisWeek}</div>
                <p className="text-xs text-muted-foreground mt-1">Submitted This Week</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.interviewsScheduled}</div>
                <p className="text-xs text-muted-foreground mt-1">Interviews</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-amber-600">{stats.responsesReceived}</div>
                <p className="text-xs text-muted-foreground mt-1">Responses</p>
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
          <div className="space-y-3 mb-6">
            {stats.expiringPackages > 0 && (
              <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-sm text-amber-800">{stats.expiringPackages} package(s) expiring within 7 days</p>
              </div>
            )}
            {stats.closingSoonJobs > 0 && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                <p className="text-sm text-blue-800">{stats.closingSoonJobs} job(s) closing within 7 days with matched candidates</p>
              </div>
            )}
          </div>

          {/* Today's Queue */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg text-navy flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Today's Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {readySubmissions.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-10 h-10 text-teal/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">All caught up! No pending applications.</p>
                  <Button variant="outline" size="sm" className="mt-3 btn-press" onClick={handleAutoMatch} disabled={autoMatching}>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Run Auto-Match
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {readySubmissions.map(sub => {
                    const subscription = subscriptions.find(s => s.candidateId === sub.candidateId);
                    return (
                      <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-teal/20 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-navy text-sm">{sub.candidateName}</span>
                            <ArrowRight className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground truncate">{sub.jobTitle}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>{sub.nhsTrust}</span>
                            <span className="font-medium text-navy">{sub.matchScore}% match</span>
                            <Badge className={`text-xs ${sub.cvStatus === 'ready' ? 'bg-teal/10 text-teal' : 'bg-amber-50 text-amber-700'}`}>
                              CV: {sub.cvStatus}
                            </Badge>
                            {subscription && (
                              <Badge className={`text-xs ${SUB_STATUS_COLORS[subscription.status]}`}>
                                {subscription.packageName} ({subscription.maxApplications === -1 ? '∞' : `${subscription.maxApplications - subscription.applicationsUsed} left`})
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          <Button size="sm" variant="outline" onClick={() => { setSelectedSub(sub); setShowDetail(true); }} className="btn-press">
                            <FileText className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="sm" onClick={() => handleSubmit(sub.id)} disabled={submitting === sub.id} className="bg-navy hover:bg-navy/90 text-white btn-press">
                            {submitting === sub.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Send className="w-3.5 h-3.5 mr-1" /> Submit</>}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Submissions */}
          {submittedSubmissions.length > 0 && (
            <Card className="border-0 shadow-sm mt-6">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-base text-navy flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Recently Submitted
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {submittedSubmissions.slice(0, 5).map(sub => (
                    <div key={sub.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-teal" />
                        <span className="font-medium">{sub.candidateName}</span>
                        <span className="text-muted-foreground">→ {sub.jobTitle}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString('en-GB') : ''}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ===== QUEUE TAB ===== */}
        <TabsContent value="queue">
          <div className="space-y-3">
            {readySubmissions.length === 0 ? (
              <div className="text-center py-16">
                <Target className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No applications in queue. Run Auto-Match to find new opportunities.</p>
              </div>
            ) : (
              readySubmissions.map(sub => {
                const subscription = subscriptions.find(s => s.candidateId === sub.candidateId);
                return (
                  <Card key={sub.id} className="border-0 shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-navy">{sub.candidateName}</span>
                          <Badge className="text-xs bg-blue-50 text-blue-700">{sub.matchScore}%</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{sub.jobTitle} — {sub.nhsTrust}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`text-xs ${sub.cvStatus === 'ready' ? 'bg-teal/10 text-teal' : 'bg-amber-50 text-amber-700'}`}>CV {sub.cvStatus}</Badge>
                          {subscription && <Badge className={`text-xs ${SUB_STATUS_COLORS[subscription.status]}`}>{subscription.status}</Badge>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setSelectedSub(sub); setShowDetail(true); }}>View</Button>
                        <Button size="sm" onClick={() => handleSubmit(sub.id)} disabled={submitting === sub.id} className="bg-navy hover:bg-navy/90 text-white btn-press">
                          {submitting === sub.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Send className="w-3.5 h-3.5 mr-1" /> Submit</>}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* ===== SUBMITTED TAB ===== */}
        <TabsContent value="submitted">
          <div className="space-y-3">
            {allSubmissions.filter(s => s.status !== 'ready' && s.status !== 'pending').map(sub => (
              <Card key={sub.id} className="border-0 shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-navy">{sub.candidateName}</span>
                      <Badge className={`text-xs ${STATUS_COLORS[sub.status]}`}>{sub.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{sub.jobTitle} — {sub.nhsTrust}</p>
                    {sub.submittedAt && <p className="text-xs text-muted-foreground mt-0.5">Submitted: {new Date(sub.submittedAt).toLocaleDateString('en-GB')}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Select value={sub.status} onValueChange={v => updateStatus(sub.id, v)}>
                      <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['submitted', 'response-received', 'interview', 'rejected'].map(s => (
                          <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" onClick={() => { setSelectedSub(sub); setShowDetail(true); }}>View</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {allSubmissions.filter(s => s.status !== 'ready' && s.status !== 'pending').length === 0 && (
              <div className="text-center py-16">
                <Send className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No submitted applications yet.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ===== SUBSCRIPTIONS TAB ===== */}
        <TabsContent value="subscriptions">
          <div className="space-y-3">
            {subscriptions.map(sub => (
              <Card key={sub.id} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-navy">{sub.candidateName}</span>
                        <Badge className={`text-xs ${SUB_STATUS_COLORS[sub.status]}`}>{sub.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{sub.packageName}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-navy">
                        {sub.maxApplications === -1 ? 'Unlimited' : `${sub.applicationsUsed} / ${sub.maxApplications} used`}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Expires: {new Date(sub.endDate).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                  </div>
                  {sub.maxApplications !== -1 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Applications used</span>
                        <span>{sub.applicationsUsed}/{sub.maxApplications}</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-teal rounded-full transition-all" style={{ width: `${(sub.applicationsUsed / sub.maxApplications) * 100}%` }} />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* ===== SUBMISSION DETAIL DIALOG ===== */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedSub && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-lg text-navy">
                  {selectedSub.candidateName} → {selectedSub.jobTitle}
                </DialogTitle>
              </DialogHeader>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={`text-xs ${STATUS_COLORS[selectedSub.status]}`}>{selectedSub.status}</Badge>
                <span className="text-sm text-muted-foreground">{selectedSub.nhsTrust}</span>
                <span className="text-sm font-medium text-navy">{selectedSub.matchScore}% match</span>
              </div>

              <Tabs defaultValue="cv" className="mt-4">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="cv">Tailored CV</TabsTrigger>
                  <TabsTrigger value="cover">Cover Letter</TabsTrigger>
                  <TabsTrigger value="supporting">Supporting Info</TabsTrigger>
                </TabsList>
                <TabsContent value="cv" className="mt-4">
                  <div className="flex justify-end mb-2">
                    <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(selectedSub.tailoredCv).then(() => toast.success('Copied'))}><Copy className="w-3.5 h-3.5 mr-1" /> Copy</Button>
                  </div>
                  <pre className="text-xs whitespace-pre-wrap font-sans bg-muted/30 p-4 rounded-lg border max-h-[400px] overflow-y-auto">{selectedSub.tailoredCv}</pre>
                </TabsContent>
                <TabsContent value="cover" className="mt-4">
                  <div className="flex justify-end mb-2">
                    <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(selectedSub.coverLetter).then(() => toast.success('Copied'))}><Copy className="w-3.5 h-3.5 mr-1" /> Copy</Button>
                  </div>
                  <pre className="text-xs whitespace-pre-wrap font-sans bg-muted/30 p-4 rounded-lg border max-h-[400px] overflow-y-auto">{selectedSub.coverLetter}</pre>
                </TabsContent>
                <TabsContent value="supporting" className="mt-4">
                  <div className="flex justify-end mb-2">
                    <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(selectedSub.supportingInfo).then(() => toast.success('Copied'))}><Copy className="w-3.5 h-3.5 mr-1" /> Copy</Button>
                  </div>
                  <pre className="text-xs whitespace-pre-wrap font-sans bg-muted/30 p-4 rounded-lg border max-h-[400px] overflow-y-auto">{selectedSub.supportingInfo}</pre>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
