// Admin NHS Jobs — Import, Screen, Match, and Prepare Applications
// All AI functionality is hidden from end users — appears as staff tools

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { store } from '@/lib/store';
import {
  nhsStore, NHSJob, CandidateMatch, ApplicationPackage,
  extractJobCriteria, generateCandidateMatch, generateTailoredCv,
  generateCoverLetter, generateSupportingInfo, generateGapSuggestions
} from '@/lib/nhsJobs';
import {
  Plus, Search, FileText, Users, Target, Briefcase, Download, Copy,
  ChevronRight, Clock, CheckCircle, AlertTriangle, Loader2, Wand2,
  Link2, Upload, Type, PenLine, Filter, Star, XCircle, ArrowRight
} from 'lucide-react';

const SUITABILITY_COLORS: Record<string, string> = {
  'Excellent Match': 'bg-green-50 text-green-700 border-green-200',
  'Good Match': 'bg-teal/10 text-teal border-teal/20',
  'Possible Match': 'bg-amber-50 text-amber-700 border-amber-200',
  'Not Suitable': 'bg-red-50 text-red-700 border-red-200',
};

const STATUS_COLORS: Record<string, string> = {
  'draft': 'bg-slate-100 text-slate-700',
  'ready': 'bg-blue-50 text-blue-700',
  'submitted': 'bg-teal/10 text-teal',
  'interview': 'bg-green-50 text-green-700',
  'offer': 'bg-gold/10 text-gold',
  'rejected': 'bg-red-50 text-red-700',
};

export default function AdminNHSJobs() {
  const [jobs, setJobs] = useState(nhsStore.getJobs());
  const [matches, setMatches] = useState(nhsStore.getMatches());
  const [packages, setPackages] = useState(nhsStore.getPackages());
  const [activeTab, setActiveTab] = useState('jobs');

  // Import state
  const [showImport, setShowImport] = useState(false);
  const [importMethod, setImportMethod] = useState<'link' | 'text' | 'manual'>('text');
  const [importText, setImportText] = useState('');
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);

  // Job detail state
  const [selectedJob, setSelectedJob] = useState<NHSJob | null>(null);
  const [showJobDetail, setShowJobDetail] = useState(false);

  // Match state
  const [matchingJob, setMatchingJob] = useState<string | null>(null);

  // Package state
  const [selectedPackage, setSelectedPackage] = useState<ApplicationPackage | null>(null);
  const [showPackage, setShowPackage] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [generatingPackage, setGeneratingPackage] = useState(false);

  const refresh = () => {
    setJobs(nhsStore.getJobs());
    setMatches(nhsStore.getMatches());
    setPackages(nhsStore.getPackages());
  };

  // ===== IMPORT =====
  const handleImport = () => {
    setImporting(true);
    setTimeout(() => {
      const extracted = extractJobCriteria(importText || importUrl || '', '');
      const newJob: NHSJob = {
        id: `job-${Date.now()}`,
        importMethod,
        sourceUrl: importUrl || undefined,
        rawDescription: importText || undefined,
        status: 'screened',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...extracted,
      } as NHSJob;
      nhsStore.addJob(newJob);
      refresh();
      setShowImport(false);
      setImportText('');
      setImportUrl('');
      setImporting(false);
      toast.success('Job imported and criteria extracted successfully');
    }, 2000);
  };

  // ===== MATCHING =====
  const runMatching = (jobId: string) => {
    setMatchingJob(jobId);
    const job = nhsStore.getJobById(jobId);
    if (!job) return;
    const candidates = store.getApplications();

    setTimeout(() => {
      candidates.forEach(candidate => {
        const existing = matches.find(m => m.jobId === jobId && m.candidateId === candidate.id);
        if (!existing) {
          const match = generateCandidateMatch(job, candidate);
          nhsStore.addMatch(match);
        }
      });
      nhsStore.updateJob(jobId, { status: 'active' });
      refresh();
      setMatchingJob(null);
      toast.success(`Matching complete — ${candidates.length} candidate(s) evaluated`);
    }, 2000);
  };

  // ===== PACKAGE GENERATION =====
  const generatePackage = (jobId: string, candidateId: string) => {
    setGeneratingPackage(true);
    const job = nhsStore.getJobById(jobId);
    const candidate = store.getApplicationById(candidateId);
    if (!job || !candidate) return;

    const match = matches.find(m => m.jobId === jobId && m.candidateId === candidateId);

    setTimeout(() => {
      const gaps = generateGapSuggestions(job, candidate, match!);
      const pkg: ApplicationPackage = {
        id: `pkg-${Date.now()}`,
        jobId,
        candidateId,
        status: 'draft',
        tailoredCv: generateTailoredCv(job, candidate),
        coverLetter: generateCoverLetter(job, candidate),
        supportingInformation: generateSupportingInfo(job, candidate),
        candidateSummary: `${candidate.fullName} — ${candidate.specialtyInterest}\n` +
          `Experience: ${candidate.yearsExperience} years | GMC: ${candidate.gmcStatus}\n` +
          `IELTS/OET: ${candidate.ieltsOetStatus} | ALS/BLS: ${candidate.alsBlsStatus}\n` +
          `Match Score: ${match?.overallScore || 'N/A'}% | Suitability: ${match?.suitabilityLevel || 'N/A'}`,
        interviewPrep: `INTERVIEW PREPARATION — ${candidate.fullName}\nPosition: ${job.title} at ${job.nhsTrust}\n\n` +
          `LIKELY QUESTIONS:\n${gaps.interviewQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\n` +
          `KEY POINTS TO EMPHASISE:\n• ${candidate.yearsExperience} years experience in ${candidate.specialtyInterest}\n` +
          `• Commitment to NHS values and patient safety\n• Willingness to learn and adapt\n• Team working skills`,
        missingChecklist: gaps.missingDocuments,
        gapSuggestions: gaps,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      nhsStore.addPackage(pkg);
      refresh();
      setGeneratingPackage(false);
      setSelectedPackage(pkg);
      setShowPackage(true);
      toast.success('Application package generated');
    }, 2500);
  };

  const updatePackageStatus = (pkgId: string, status: string) => {
    nhsStore.updatePackage(pkgId, { status: status as any });
    refresh();
    if (selectedPackage?.id === pkgId) setSelectedPackage(prev => prev ? { ...prev, status: status as any } : null);
    toast.success(`Status updated to: ${status}`);
  };

  const saveEdit = (pkgId: string, field: string) => {
    nhsStore.updatePackage(pkgId, { [field]: editContent });
    refresh();
    if (selectedPackage?.id === pkgId) setSelectedPackage(prev => prev ? { ...prev, [field]: editContent } : null);
    setEditingField(null);
    toast.success('Changes saved');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const jobMatches = (jobId: string) => matches.filter(m => m.jobId === jobId).sort((a, b) => b.overallScore - a.overallScore);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-navy">NHS Job Matching</h1>
          <p className="text-sm text-muted-foreground">{jobs.length} jobs imported • {matches.length} matches • {packages.length} packages</p>
        </div>
        <Button onClick={() => setShowImport(true)} className="bg-navy hover:bg-navy/90 text-white btn-press">
          <Plus className="w-4 h-4 mr-2" /> Import Job
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="jobs">Jobs ({jobs.length})</TabsTrigger>
          <TabsTrigger value="matches">Matches ({matches.length})</TabsTrigger>
          <TabsTrigger value="packages">Packages ({packages.length})</TabsTrigger>
        </TabsList>

        {/* ===== JOBS TAB ===== */}
        <TabsContent value="jobs">
          <div className="space-y-3">
            {jobs.map(job => {
              const jMatches = jobMatches(job.id);
              const daysLeft = Math.max(0, Math.ceil((new Date(job.closingDate).getTime() - Date.now()) / 86400000));
              return (
                <Card key={job.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-medium text-navy">{job.title}</h3>
                          <Badge className={`text-xs ${daysLeft <= 7 ? 'bg-red-50 text-red-700' : daysLeft <= 14 ? 'bg-amber-50 text-amber-700' : 'bg-teal/10 text-teal'}`}>
                            {daysLeft > 0 ? `${daysLeft} days left` : 'Closed'}
                          </Badge>
                          {job.sponsorshipAvailable && <Badge variant="secondary" className="text-xs">Visa Sponsor</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{job.nhsTrust} • {job.location} • {job.salary}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{job.specialty}</span>
                          <span>{job.grade}</span>
                          <span>{job.contractType}</span>
                          {jMatches.length > 0 && <span className="text-teal font-medium">{jMatches.length} candidate(s) matched</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {jMatches.length === 0 && (
                          <Button size="sm" onClick={() => runMatching(job.id)} disabled={matchingJob === job.id} className="bg-teal hover:bg-teal/90 text-white btn-press">
                            {matchingJob === job.id ? <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Matching</> : <><Target className="w-3.5 h-3.5 mr-1" /> Match</>}
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => { setSelectedJob(job); setShowJobDetail(true); }} className="btn-press">
                          View
                        </Button>
                      </div>
                    </div>

                    {/* Matched candidates preview */}
                    {jMatches.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <p className="text-xs font-medium text-navy mb-2">Top Matches:</p>
                        <div className="flex flex-wrap gap-2">
                          {jMatches.slice(0, 4).map(m => (
                            <div key={m.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${SUITABILITY_COLORS[m.suitabilityLevel]}`}>
                              <span className="font-medium">{m.candidateName.split(' ').slice(0, 2).join(' ')}</span>
                              <span className="font-bold">{m.overallScore}%</span>
                              <span>{m.suitabilityLevel}</span>
                              {!nhsStore.getPackageForJobCandidate(job.id, m.candidateId) ? (
                                <Button size="sm" variant="ghost" className="h-5 px-1.5 text-xs" onClick={() => generatePackage(job.id, m.candidateId)} disabled={generatingPackage}>
                                  {generatingPackage ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                </Button>
                              ) : (
                                <CheckCircle className="w-3 h-3 text-teal" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {jobs.length === 0 && (
              <div className="text-center py-16">
                <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No NHS jobs imported yet. Click "Import Job" to get started.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ===== MATCHES TAB ===== */}
        <TabsContent value="matches">
          <div className="space-y-3">
            {matches.sort((a, b) => b.overallScore - a.overallScore).map(match => {
              const job = nhsStore.getJobById(match.jobId);
              const pkg = nhsStore.getPackageForJobCandidate(match.jobId, match.candidateId);
              return (
                <Card key={match.id} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-navy">{match.candidateName}</span>
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground truncate">{job?.title}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <Badge className={`text-xs border ${SUITABILITY_COLORS[match.suitabilityLevel]}`}>{match.suitabilityLevel}</Badge>
                          <span className="text-xs text-muted-foreground">Essential: {match.essentialScore}%</span>
                          <span className="text-xs text-muted-foreground">Desirable: {match.desirableScore}%</span>
                          <span className="text-xs text-muted-foreground">Probability: {match.shortlistingProbability}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-center">
                          <div className="text-xl font-bold text-navy">{match.overallScore}%</div>
                          <div className="text-xs text-muted-foreground">Score</div>
                        </div>
                        {!pkg ? (
                          <Button size="sm" onClick={() => generatePackage(match.jobId, match.candidateId)} disabled={generatingPackage} className="bg-navy hover:bg-navy/90 text-white btn-press">
                            <Wand2 className="w-3.5 h-3.5 mr-1" /> Generate
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => { setSelectedPackage(pkg); setShowPackage(true); }} className="btn-press">
                            <FileText className="w-3.5 h-3.5 mr-1" /> View Package
                          </Button>
                        )}
                      </div>
                    </div>
                    {/* Explanation */}
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{match.explanation}</p>
                  </CardContent>
                </Card>
              );
            })}
            {matches.length === 0 && (
              <div className="text-center py-16">
                <Target className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No matches yet. Import a job and run matching to see results.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ===== PACKAGES TAB ===== */}
        <TabsContent value="packages">
          <div className="space-y-3">
            {packages.map(pkg => {
              const job = nhsStore.getJobById(pkg.jobId);
              const candidate = store.getApplicationById(pkg.candidateId);
              return (
                <Card key={pkg.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelectedPackage(pkg); setShowPackage(true); }}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-navy">{candidate?.fullName}</span>
                        <Badge className={`text-xs ${STATUS_COLORS[pkg.status]}`}>{pkg.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{job?.title} — {job?.nhsTrust}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              );
            })}
            {packages.length === 0 && (
              <div className="text-center py-16">
                <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No application packages generated yet.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ===== IMPORT DIALOG ===== */}
      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg text-navy">Import NHS Job Vacancy</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Import Method</Label>
              <div className="grid grid-cols-3 gap-2 mt-1.5">
                {[
                  { key: 'link', icon: Link2, label: 'Paste Link' },
                  { key: 'text', icon: Type, label: 'Paste Text' },
                  { key: 'manual', icon: PenLine, label: 'Manual Entry' },
                ].map(m => (
                  <button key={m.key} onClick={() => setImportMethod(m.key as any)} className={`p-3 rounded-lg border text-center text-xs font-medium transition-colors ${importMethod === m.key ? 'border-teal bg-teal/5 text-teal' : 'border-border hover:border-teal/30'}`}>
                    <m.icon className="w-4 h-4 mx-auto mb-1" />
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {importMethod === 'link' && (
              <div>
                <Label>NHS Jobs URL</Label>
                <Input value={importUrl} onChange={e => setImportUrl(e.target.value)} placeholder="https://www.jobs.nhs.uk/candidate/jobadvert/..." className="mt-1.5" />
              </div>
            )}

            {importMethod === 'text' && (
              <div>
                <Label>Job Description Text</Label>
                <Textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder="Paste the full job description here including person specification, essential and desirable criteria..." className="mt-1.5 min-h-[200px]" />
              </div>
            )}

            {importMethod === 'manual' && (
              <div>
                <Label>Job Description</Label>
                <Textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder="Enter key details: Job title, specialty, grade, trust, location, requirements..." className="mt-1.5 min-h-[150px]" />
              </div>
            )}

            <Button onClick={handleImport} disabled={importing || (!importText && !importUrl)} className="w-full bg-navy hover:bg-navy/90 text-white btn-press">
              {importing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Extracting Criteria...</> : <><Wand2 className="w-4 h-4 mr-2" /> Import & Extract Criteria</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== JOB DETAIL DIALOG ===== */}
      <Dialog open={showJobDetail} onOpenChange={setShowJobDetail}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedJob && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-lg text-navy">{selectedJob.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Trust:</span> <span className="font-medium">{selectedJob.nhsTrust}</span></div>
                  <div><span className="text-muted-foreground">Location:</span> <span>{selectedJob.location}</span></div>
                  <div><span className="text-muted-foreground">Salary:</span> <span>{selectedJob.salary}</span></div>
                  <div><span className="text-muted-foreground">Closing:</span> <span>{new Date(selectedJob.closingDate).toLocaleDateString('en-GB')}</span></div>
                  <div><span className="text-muted-foreground">Grade:</span> <span>{selectedJob.grade}</span></div>
                  <div><span className="text-muted-foreground">Contract:</span> <span>{selectedJob.contractType}</span></div>
                  <div><span className="text-muted-foreground">GMC:</span> <span>{selectedJob.gmcRequirements}</span></div>
                  <div><span className="text-muted-foreground">English:</span> <span>{selectedJob.englishRequirements}</span></div>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-navy mb-2">Essential Criteria</h4>
                  <ul className="space-y-1">{selectedJob.essentialCriteria.map((c, i) => <li key={i} className="text-sm flex gap-2"><CheckCircle className="w-3.5 h-3.5 text-teal shrink-0 mt-0.5" />{c}</li>)}</ul>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-navy mb-2">Desirable Criteria</h4>
                  <ul className="space-y-1">{selectedJob.desirableCriteria.map((c, i) => <li key={i} className="text-sm flex gap-2"><Star className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />{c}</li>)}</ul>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => { runMatching(selectedJob.id); setShowJobDetail(false); }} disabled={matchingJob === selectedJob.id} className="bg-teal hover:bg-teal/90 text-white btn-press">
                    <Target className="w-4 h-4 mr-2" /> Run Candidate Matching
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== APPLICATION PACKAGE DIALOG ===== */}
      <Dialog open={showPackage} onOpenChange={setShowPackage}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedPackage && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-lg text-navy flex items-center gap-3">
                  Application Package
                  <Badge className={`text-xs ${STATUS_COLORS[selectedPackage.status]}`}>{selectedPackage.status}</Badge>
                </DialogTitle>
              </DialogHeader>

              {/* Status Control */}
              <div className="flex items-center gap-2 mt-2">
                <Label className="text-xs">Status:</Label>
                <Select value={selectedPackage.status} onValueChange={v => updatePackageStatus(selectedPackage.id, v)}>
                  <SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['draft', 'ready', 'submitted', 'interview', 'offer', 'rejected'].map(s => (
                      <SelectItem key={s} value={s} className="text-xs">{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Tabs defaultValue="cv" className="mt-4">
                <TabsList className="grid grid-cols-6 w-full text-xs">
                  <TabsTrigger value="cv" className="text-xs">CV</TabsTrigger>
                  <TabsTrigger value="cover" className="text-xs">Cover Letter</TabsTrigger>
                  <TabsTrigger value="supporting" className="text-xs">Supporting Info</TabsTrigger>
                  <TabsTrigger value="interview" className="text-xs">Interview</TabsTrigger>
                  <TabsTrigger value="gaps" className="text-xs">Gaps</TabsTrigger>
                  <TabsTrigger value="summary" className="text-xs">Summary</TabsTrigger>
                </TabsList>

                {/* CV Tab */}
                <TabsContent value="cv" className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-sm text-navy">Tailored CV</h4>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(selectedPackage.tailoredCv)}><Copy className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => { setEditingField('tailoredCv'); setEditContent(selectedPackage.tailoredCv); }}><PenLine className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                  {editingField === 'tailoredCv' ? (
                    <div>
                      <Textarea value={editContent} onChange={e => setEditContent(e.target.value)} className="min-h-[400px] font-mono text-xs" />
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" onClick={() => saveEdit(selectedPackage.id, 'tailoredCv')} className="bg-teal hover:bg-teal/90 text-white">Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingField(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <pre className="text-xs whitespace-pre-wrap font-sans bg-muted/30 p-4 rounded-lg border max-h-[400px] overflow-y-auto">{selectedPackage.tailoredCv}</pre>
                  )}
                </TabsContent>

                {/* Cover Letter Tab */}
                <TabsContent value="cover" className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-sm text-navy">Cover Letter</h4>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(selectedPackage.coverLetter)}><Copy className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => { setEditingField('coverLetter'); setEditContent(selectedPackage.coverLetter); }}><PenLine className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                  {editingField === 'coverLetter' ? (
                    <div>
                      <Textarea value={editContent} onChange={e => setEditContent(e.target.value)} className="min-h-[400px] font-mono text-xs" />
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" onClick={() => saveEdit(selectedPackage.id, 'coverLetter')} className="bg-teal hover:bg-teal/90 text-white">Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingField(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <pre className="text-xs whitespace-pre-wrap font-sans bg-muted/30 p-4 rounded-lg border max-h-[400px] overflow-y-auto">{selectedPackage.coverLetter}</pre>
                  )}
                </TabsContent>

                {/* Supporting Info Tab */}
                <TabsContent value="supporting" className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-sm text-navy">NHS Supporting Information</h4>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(selectedPackage.supportingInformation)}><Copy className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => { setEditingField('supportingInformation'); setEditContent(selectedPackage.supportingInformation); }}><PenLine className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                  {editingField === 'supportingInformation' ? (
                    <div>
                      <Textarea value={editContent} onChange={e => setEditContent(e.target.value)} className="min-h-[400px] font-mono text-xs" />
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" onClick={() => saveEdit(selectedPackage.id, 'supportingInformation')} className="bg-teal hover:bg-teal/90 text-white">Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingField(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <pre className="text-xs whitespace-pre-wrap font-sans bg-muted/30 p-4 rounded-lg border max-h-[400px] overflow-y-auto">{selectedPackage.supportingInformation}</pre>
                  )}
                </TabsContent>

                {/* Interview Tab */}
                <TabsContent value="interview" className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-sm text-navy">Interview Preparation</h4>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(selectedPackage.interviewPrep)}><Copy className="w-3.5 h-3.5" /></Button>
                  </div>
                  <pre className="text-xs whitespace-pre-wrap font-sans bg-muted/30 p-4 rounded-lg border max-h-[400px] overflow-y-auto">{selectedPackage.interviewPrep}</pre>
                </TabsContent>

                {/* Gaps Tab */}
                <TabsContent value="gaps" className="mt-4 space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-navy mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-gold" /> Missing Documents</h4>
                    <ul className="space-y-1">{selectedPackage.gapSuggestions.missingDocuments.map((d, i) => <li key={i} className="text-sm flex gap-2"><XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />{d}</li>)}</ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-navy mb-2">Courses to Improve Application</h4>
                    <ul className="space-y-1">{selectedPackage.gapSuggestions.coursesToImprove.map((c, i) => <li key={i} className="text-sm flex gap-2"><ArrowRight className="w-3.5 h-3.5 text-teal shrink-0 mt-0.5" />{c}</li>)}</ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-navy mb-2">Audit/QIP Points to Emphasise</h4>
                    <ul className="space-y-1">{selectedPackage.gapSuggestions.auditQipPoints.map((a, i) => <li key={i} className="text-sm flex gap-2"><ArrowRight className="w-3.5 h-3.5 text-teal shrink-0 mt-0.5" />{a}</li>)}</ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-navy mb-2">Weak CV Sections</h4>
                    <ul className="space-y-1">{selectedPackage.gapSuggestions.weakCvSections.map((w, i) => <li key={i} className="text-sm flex gap-2"><AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />{w}</li>)}</ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-navy mb-2">Interview Questions to Prepare</h4>
                    <ul className="space-y-1">{selectedPackage.gapSuggestions.interviewQuestions.map((q, i) => <li key={i} className="text-sm flex gap-2"><span className="text-xs font-bold text-navy shrink-0 mt-0.5">{i + 1}.</span>{q}</li>)}</ul>
                  </div>
                </TabsContent>

                {/* Summary Tab */}
                <TabsContent value="summary" className="mt-4">
                  <pre className="text-sm whitespace-pre-wrap font-sans bg-muted/30 p-4 rounded-lg border">{selectedPackage.candidateSummary}</pre>
                  {selectedPackage.missingChecklist.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-sm text-navy mb-2">Missing Requirements Checklist</h4>
                      <ul className="space-y-1">{selectedPackage.missingChecklist.map((m, i) => <li key={i} className="text-sm flex gap-2"><XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />{m}</li>)}</ul>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
