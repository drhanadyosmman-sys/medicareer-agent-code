import { useState, useRef, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { jobMgmt, NHSJob, SharedJob, SPECIALTIES, RANKS } from '@/lib/jobManagement';
import { store } from '@/lib/store';
import { toast } from 'sonner';
import {
  Plus, Search, MapPin, Building2, Calendar, ExternalLink, Users, Send,
  Wand2, FileText, CheckCircle, Clock, Briefcase, Filter, Loader2
} from 'lucide-react';

const APP_STATUS_COLORS: Record<string, string> = {
  'Preparing': 'bg-amber-100 text-amber-700',
  'Applied': 'bg-blue-100 text-blue-700',
  'Interview Scheduled': 'bg-green-100 text-green-700',
  'Offered': 'bg-emerald-100 text-emerald-700',
  'Rejected': 'bg-red-100 text-red-700',
};

export default function AdminJobs() {
  const [jobs, setJobs] = useState<NHSJob[]>(jobMgmt.getJobs());
  const [sharedJobs, setSharedJobs] = useState<SharedJob[]>(jobMgmt.getSharedJobs());
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [filterRank, setFilterRank] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showAnalyzerDialog, setShowAnalyzerDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<NHSJob | null>(null);
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const [analyzerText, setAnalyzerText] = useState('');
  const [analyzerResult, setAnalyzerResult] = useState<any>(null);
  const [tailoringResult, setTailoringResult] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [tailoring, setTailoring] = useState(false);

  // New job form
  const [newJob, setNewJob] = useState({
    title: '', hospital: '', location: '', salaryRange: '', description: '',
    closingDate: '', nhsJobsLink: '', specialty: '', rank: '', status: 'Active' as const,
  });

  const applications = store.getApplications();
  const doctors = applications.map(a => ({ id: a.userId, name: a.fullName, specialty: a.specialtyInterest }));

  const filteredJobs = jobs.filter(j => {
    if (filterSpecialty !== 'all' && j.specialty !== filterSpecialty) return false;
    if (filterRank !== 'all' && j.rank !== filterRank) return false;
    if (searchTerm && !j.title.toLowerCase().includes(searchTerm.toLowerCase()) && !j.hospital.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleAddJob = () => {
    if (!newJob.title || !newJob.hospital || !newJob.specialty || !newJob.rank) {
      toast.error('Please fill in required fields');
      return;
    }
    jobMgmt.addJob(newJob);
    setJobs(jobMgmt.getJobs());
    setShowAddDialog(false);
    setNewJob({ title: '', hospital: '', location: '', salaryRange: '', description: '', closingDate: '', nhsJobsLink: '', specialty: '', rank: '', status: 'Active' });
    toast.success('Job added successfully');
  };

  const sendJobShared = trpc.email.sendJobShared.useMutation();

  const handleShareJob = () => {
    if (!selectedJob || selectedDoctors.length === 0) return;
    const doctorsToShare = doctors.filter(d => selectedDoctors.includes(d.id));
    jobMgmt.shareJobWithDoctors(selectedJob.id, doctorsToShare);
    setSharedJobs(jobMgmt.getSharedJobs());
    setShowShareDialog(false);
    setSelectedDoctors([]);
    // Send email notification to each doctor
    const allApps = store.getApplications();
    doctorsToShare.forEach(doctor => {
      const app = allApps.find(a => a.userId === doctor.id);
      if (app?.email) {
        sendJobShared.mutate({
          to: app.email,
          name: app.fullName,
          jobTitle: selectedJob.title,
          hospital: selectedJob.hospital,
          location: selectedJob.location,
        });
      }
    });
    toast.success(`Job shared with ${doctorsToShare.length} doctor(s)`);
  };

  const handleAnalyze = () => {
    if (!analyzerText.trim()) return;
    setAnalyzing(true);
    setTimeout(() => {
      const result = jobMgmt.analyzeJobDescription(analyzerText);
      setAnalyzerResult(result);
      setAnalyzing(false);
    }, 1500);
  };

  const handleTailorCV = (doctorId: string) => {
    if (!selectedJob) return;
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) return;
    setTailoring(true);
    setTimeout(() => {
      const result = jobMgmt.generateTailoredCV(doctor.name, doctor.specialty || selectedJob.specialty, selectedJob.title, selectedJob.description);
      setTailoringResult(result);
      setTailoring(false);
    }, 2000);
  };

  const handleApplyOnBehalf = (sharedJobId: string, status: string, notes?: string) => {
    jobMgmt.markAsAppliedOnBehalf(sharedJobId, status as any, notes);
    setSharedJobs(jobMgmt.getSharedJobs());
    toast.success('Application status updated');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">NHS Jobs Management</h1>
          <p className="text-gray-500 text-sm mt-1">Add, manage, and share NHS job vacancies with doctors</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => { setShowAnalyzerDialog(true); setAnalyzerResult(null); setAnalyzerText(''); }}>
            <Wand2 className="w-4 h-4 mr-1" /> Job Analyzer
          </Button>
          <Button size="sm" className="bg-teal-500 hover:bg-teal-400" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Job
          </Button>
        </div>
      </div>

      <Tabs defaultValue="jobs">
        <TabsList>
          <TabsTrigger value="jobs">All Jobs ({jobs.length})</TabsTrigger>
          <TabsTrigger value="shared">Shared ({sharedJobs.length})</TabsTrigger>
        </TabsList>

        {/* All Jobs Tab */}
        <TabsContent value="jobs" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search jobs..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Specialty" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {SPECIALTIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterRank} onValueChange={setFilterRank}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Rank" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ranks</SelectItem>
                {RANKS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Jobs List */}
          <div className="space-y-3">
            {filteredJobs.map(job => {
              const jobShares = sharedJobs.filter(sj => sj.jobId === job.id);
              return (
                <Card key={job.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 cursor-pointer" onClick={() => { setSelectedJob(job); setShowDetailDialog(true); }}>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-blue-900">{job.title}</h3>
                          <Badge variant={job.status === 'Active' ? 'default' : 'secondary'} className="text-xs">
                            {job.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{job.hospital}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Closes: {job.closingDate}</span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">{job.specialty}</Badge>
                          <Badge variant="outline" className="text-xs">{job.rank}</Badge>
                          <Badge className="text-xs bg-blue-50 text-blue-700 border-0">{job.salaryRange}</Badge>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end shrink-0">
                        <Button size="sm" variant="outline" onClick={() => { setSelectedJob(job); setShowShareDialog(true); setSelectedDoctors([]); }}>
                          <Send className="w-3.5 h-3.5 mr-1" /> Share
                        </Button>
                        {jobShares.length > 0 && (
                          <span className="text-xs text-teal-600 flex items-center gap-1">
                            <Users className="w-3 h-3" /> {jobShares.length} shared
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filteredJobs.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No jobs found matching your filters</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Shared Jobs Tab */}
        <TabsContent value="shared" className="space-y-3 mt-4">
          {sharedJobs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Send className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No jobs shared yet</p>
            </div>
          ) : (
            sharedJobs.map(sj => {
              const job = jobMgmt.getJobById(sj.jobId);
              return (
                <Card key={sj.id} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-medium text-sm text-blue-900">{job?.title || 'Unknown Job'}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Shared with: <strong>{sj.doctorName}</strong> • {sj.sharedAt}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${sj.status === 'New' ? 'bg-blue-100 text-blue-700' : sj.status === 'Applied' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {sj.status}
                        </Badge>
                        {sj.applicationStatus && (
                          <Badge className={`text-xs ${APP_STATUS_COLORS[sj.applicationStatus] || 'bg-gray-100'}`}>
                            {sj.applicationStatus}
                          </Badge>
                        )}
                        <Select onValueChange={(v) => handleApplyOnBehalf(sj.id, v)}>
                          <SelectTrigger className="w-[140px] h-8 text-xs">
                            <SelectValue placeholder="Update Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Preparing">Preparing</SelectItem>
                            <SelectItem value="Applied">Applied</SelectItem>
                            <SelectItem value="Interview Scheduled">Interview</SelectItem>
                            <SelectItem value="Offered">Offered</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      {/* Add Job Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add New NHS Job</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            {/* NHS Jobs Link */}
            <a href="https://www.jobs.nhs.uk/candidate/search" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 hover:bg-blue-100 transition-colors">
              <ExternalLink className="w-4 h-4" />
              Browse NHS Jobs → jobs.nhs.uk
            </a>

            {/* Screenshot Paste/Upload Area */}
            <ScreenshotDropZone onExtracted={(data) => {
              setNewJob(p => ({
                ...p,
                title: data.title || p.title,
                hospital: data.hospital || p.hospital,
                location: data.location || p.location,
                salaryRange: data.salaryRange || p.salaryRange,
                specialty: SPECIALTIES.includes(data.specialty) ? data.specialty : p.specialty,
                rank: RANKS.includes(data.rank) ? data.rank : p.rank,
                closingDate: data.closingDate || p.closingDate,
                nhsJobsLink: data.nhsJobsLink || p.nhsJobsLink,
                description: data.description || p.description,
              }));
              toast.success('Fields auto-filled from screenshot');
            }} />

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><Label>Job Title *</Label><Input value={newJob.title} onChange={e => setNewJob(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Clinical Fellow in Acute Medicine" className="mt-1" /></div>
              <div><Label>Hospital/Trust *</Label><Input value={newJob.hospital} onChange={e => setNewJob(p => ({ ...p, hospital: e.target.value }))} placeholder="e.g. Barts Health NHS Trust" className="mt-1" /></div>
              <div><Label>Location</Label><Input value={newJob.location} onChange={e => setNewJob(p => ({ ...p, location: e.target.value }))} placeholder="e.g. London" className="mt-1" /></div>
              <div><Label>Specialty *</Label>
                <Select value={newJob.specialty} onValueChange={v => setNewJob(p => ({ ...p, specialty: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{SPECIALTIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Rank/Grade *</Label>
                <Select value={newJob.rank} onValueChange={v => setNewJob(p => ({ ...p, rank: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{RANKS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Salary Range</Label><Input value={newJob.salaryRange} onChange={e => setNewJob(p => ({ ...p, salaryRange: e.target.value }))} placeholder="e.g. £55,329 - £63,152" className="mt-1" /></div>
              <div><Label>Closing Date</Label><Input type="date" value={newJob.closingDate} onChange={e => setNewJob(p => ({ ...p, closingDate: e.target.value }))} className="mt-1" /></div>
              <div className="col-span-2"><Label>NHS Jobs Link</Label><Input value={newJob.nhsJobsLink} onChange={e => setNewJob(p => ({ ...p, nhsJobsLink: e.target.value }))} placeholder="https://www.nhsjobs.com/..." className="mt-1" /></div>
              <div className="col-span-2"><Label>Job Description</Label><Textarea value={newJob.description} onChange={e => setNewJob(p => ({ ...p, description: e.target.value }))} placeholder="Full job description..." rows={5} className="mt-1" /></div>
            </div>
            <Button onClick={handleAddJob} className="w-full bg-teal-500 hover:bg-teal-400">Add Job</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Job Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Share Job with Doctors</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-500 mb-4">Select doctors to share "{selectedJob?.title}" with:</p>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {doctors.map(doc => (
              <label key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                <Checkbox
                  checked={selectedDoctors.includes(doc.id)}
                  onCheckedChange={(checked) => {
                    setSelectedDoctors(prev => checked ? [...prev, doc.id] : prev.filter(id => id !== doc.id));
                  }}
                />
                <div>
                  <div className="font-medium text-sm">{doc.name}</div>
                  <div className="text-xs text-gray-500">{doc.specialty || 'No specialty listed'}</div>
                </div>
              </label>
            ))}
            {doctors.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No registered doctors yet</p>}
          </div>
          <Button onClick={handleShareJob} disabled={selectedDoctors.length === 0} className="w-full mt-4 bg-teal-500 hover:bg-teal-400">
            <Send className="w-4 h-4 mr-1" /> Share with {selectedDoctors.length} Doctor(s)
          </Button>
        </DialogContent>
      </Dialog>

      {/* Job Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedJob && (
            <>
              <DialogHeader><DialogTitle>{selectedJob.title}</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">Hospital:</span> <strong>{selectedJob.hospital}</strong></div>
                  <div><span className="text-gray-500">Location:</span> <strong>{selectedJob.location}</strong></div>
                  <div><span className="text-gray-500">Salary:</span> <strong>{selectedJob.salaryRange}</strong></div>
                  <div><span className="text-gray-500">Closing:</span> <strong>{selectedJob.closingDate}</strong></div>
                  <div><span className="text-gray-500">Specialty:</span> <strong>{selectedJob.specialty}</strong></div>
                  <div><span className="text-gray-500">Rank:</span> <strong>{selectedJob.rank}</strong></div>
                </div>
                <div><h4 className="font-semibold text-sm mb-1">Description</h4><p className="text-sm text-gray-600">{selectedJob.description}</p></div>
                {selectedJob.essentialCriteria && (
                  <div><h4 className="font-semibold text-sm mb-1">Essential Criteria</h4>
                    <ul className="space-y-1">{selectedJob.essentialCriteria.map((c, i) => <li key={i} className="text-sm text-gray-600 flex gap-2"><span className="text-teal-500">•</span>{c}</li>)}</ul>
                  </div>
                )}
                {selectedJob.desirableCriteria && (
                  <div><h4 className="font-semibold text-sm mb-1">Desirable Criteria</h4>
                    <ul className="space-y-1">{selectedJob.desirableCriteria.map((c, i) => <li key={i} className="text-sm text-gray-600 flex gap-2"><span className="text-amber-500">•</span>{c}</li>)}</ul>
                  </div>
                )}
                <div className="flex gap-2 pt-4 border-t">
                  <Button size="sm" onClick={() => { setShowDetailDialog(false); setShowShareDialog(true); setSelectedDoctors([]); }}>
                    <Send className="w-3.5 h-3.5 mr-1" /> Share with Doctors
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setShowDetailDialog(false); setShowAnalyzerDialog(true); setAnalyzerText(selectedJob.description); setAnalyzerResult(null); }}>
                    <Wand2 className="w-3.5 h-3.5 mr-1" /> Analyze & Tailor CV
                  </Button>
                  {selectedJob.nhsJobsLink && (
                    <Button size="sm" variant="outline" onClick={() => window.open(selectedJob.nhsJobsLink, '_blank')}>
                      <ExternalLink className="w-3.5 h-3.5 mr-1" /> View Original
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Job Analyzer & CV Tailoring Dialog */}
      <Dialog open={showAnalyzerDialog} onOpenChange={setShowAnalyzerDialog}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Job Analyzer & CV Tailoring</DialogTitle></DialogHeader>
          <Tabs defaultValue="analyze" className="mt-4">
            <TabsList className="w-full">
              <TabsTrigger value="analyze" className="flex-1">Analyze Job</TabsTrigger>
              <TabsTrigger value="tailor" className="flex-1">Tailor CV</TabsTrigger>
            </TabsList>

            <TabsContent value="analyze" className="space-y-4 mt-4">
              <div>
                <Label>Paste Job Description</Label>
                <Textarea value={analyzerText} onChange={e => setAnalyzerText(e.target.value)} rows={6} placeholder="Paste the full job description text here..." className="mt-1" />
              </div>
              <Button onClick={handleAnalyze} disabled={analyzing || !analyzerText.trim()} className="bg-teal-500 hover:bg-teal-400">
                {analyzing ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Analyzing...</> : <><Wand2 className="w-4 h-4 mr-1" /> Analyze Job Description</>}
              </Button>
              {analyzerResult && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                  <div><h4 className="font-semibold text-sm text-blue-900 mb-2">Key Requirements</h4>
                    <ul className="space-y-1">{analyzerResult.keyRequirements.map((r: string, i: number) => <li key={i} className="text-sm flex gap-2"><CheckCircle className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />{r}</li>)}</ul>
                  </div>
                  <div><h4 className="font-semibold text-sm text-blue-900 mb-2">Essential Criteria</h4>
                    <ul className="space-y-1">{analyzerResult.essentialCriteria.map((c: string, i: number) => <li key={i} className="text-sm flex gap-2"><span className="text-teal-500">•</span>{c}</li>)}</ul>
                  </div>
                  <div><h4 className="font-semibold text-sm text-blue-900 mb-2">Desirable Criteria</h4>
                    <ul className="space-y-1">{analyzerResult.desirableCriteria.map((c: string, i: number) => <li key={i} className="text-sm flex gap-2"><span className="text-amber-500">•</span>{c}</li>)}</ul>
                  </div>
                  <div><h4 className="font-semibold text-sm text-blue-900 mb-2">Person Specification</h4>
                    <p className="text-sm text-gray-600">{analyzerResult.personSpec}</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="tailor" className="space-y-4 mt-4">
              <p className="text-sm text-gray-500">Select a doctor to generate a tailored CV for "{selectedJob?.title || 'the selected job'}"</p>
              <div className="space-y-2">
                {doctors.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50">
                    <div>
                      <div className="font-medium text-sm">{doc.name}</div>
                      <div className="text-xs text-gray-500">{doc.specialty || 'General'}</div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleTailorCV(doc.id)} disabled={tailoring}>
                      {tailoring ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Wand2 className="w-3.5 h-3.5 mr-1" /> Tailor CV</>}
                    </Button>
                  </div>
                ))}
              </div>
              {tailoringResult && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                  <div><h4 className="font-semibold text-sm text-blue-900 mb-2">Suggested Changes</h4>
                    <ul className="space-y-1">{tailoringResult.suggestedChanges.map((c: string, i: number) => <li key={i} className="text-sm flex gap-2"><span className="text-teal-500 font-bold">{i + 1}.</span>{c}</li>)}</ul>
                  </div>
                  <div><h4 className="font-semibold text-sm text-blue-900 mb-2">Tailored CV Draft</h4>
                    <pre className="text-xs text-gray-700 bg-white p-4 rounded-lg border whitespace-pre-wrap font-sans leading-relaxed">{tailoringResult.tailoredContent}</pre>
                  </div>
                  <Button size="sm" onClick={() => { toast.success('Tailored CV saved'); setTailoringResult(null); }}>
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Save Tailored CV
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Screenshot Drop Zone Component with AI Analysis
function ScreenshotDropZone({ onExtracted }: { onExtracted: (data: any) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const analyzeJob = trpc.ai.analyzeJobScreenshot.useMutation();

  const processImage = useCallback(async (base64: string) => {
    setPreview(base64);
    setAnalyzing(true);
    try {
      const result = await analyzeJob.mutateAsync({ imageBase64: base64 });
      if (result.success && result.data) {
        onExtracted(result.data);
      } else {
        toast.error('Could not extract job details from this image. Please fill in manually.');
      }
    } catch (err) {
      toast.error('AI analysis failed. Please fill in the fields manually.');
    } finally {
      setAnalyzing(false);
    }
  }, [analyzeJob, onExtracted]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const base64 = ev.target?.result as string;
            processImage(base64);
          };
          reader.readAsDataURL(file);
        }
        break;
      }
    }
  }, [processImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        processImage(base64);
      };
      reader.readAsDataURL(file);
    }
  }, [processImage]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        processImage(base64);
      };
      reader.readAsDataURL(file);
    }
  }, [processImage]);

  return (
    <div
      onPaste={handlePaste}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      tabIndex={0}
      className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-teal-400 transition-colors focus:border-teal-500 focus:outline-none cursor-pointer bg-gray-50"
      onClick={() => !preview && fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {analyzing && (
        <div className="absolute inset-0 bg-white/90 rounded-xl flex flex-col items-center justify-center z-10">
          <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-2" />
          <p className="text-sm font-medium text-blue-900">AI is analyzing the screenshot...</p>
          <p className="text-xs text-gray-500 mt-1">Extracting job details</p>
        </div>
      )}

      {preview ? (
        <div className="space-y-2">
          <img src={preview} alt="Screenshot" className="max-h-32 mx-auto rounded-lg border shadow-sm" />
          <button
            onClick={(e) => { e.stopPropagation(); setPreview(null); }}
            className="text-xs text-gray-500 hover:text-red-500 transition-colors"
          >
            Remove & paste another
          </button>
        </div>
      ) : (
        <div className="py-3">
          <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Wand2 className="w-6 h-6 text-teal-600" />
          </div>
          <p className="text-sm font-medium text-blue-900">Paste Screenshot to Auto-Fill</p>
          <p className="text-xs text-gray-500 mt-1">
            Ctrl+V to paste • Drag & drop • Or click to upload
          </p>
          <p className="text-xs text-teal-600 mt-2 font-medium">
            AI will extract job details automatically
          </p>
        </div>
      )}
    </div>
  );
}
