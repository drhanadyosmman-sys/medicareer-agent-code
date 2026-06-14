import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { jobEngine, CollectedJob } from '@/lib/jobEngine';
import { Search, Plus, ExternalLink, MapPin, Building2, Calendar, Briefcase, Users, AlertTriangle, TrendingUp, Filter, RefreshCw, Globe, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminJobEngine() {
  const [jobs, setJobs] = useState<CollectedJob[]>(jobEngine.getAll());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPathway, setFilterPathway] = useState<string>('all');
  const [filterVisa, setFilterVisa] = useState<string>('all');
  const [filterImg, setFilterImg] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<CollectedJob | null>(null);
  const [importUrl, setImportUrl] = useState('');
  const [importText, setImportText] = useState('');
  const [importOpen, setImportOpen] = useState(false);

  const stats = jobEngine.getStats();

  const filteredJobs = jobs.filter(j => {
    if (searchTerm && !j.title.toLowerCase().includes(searchTerm.toLowerCase()) && !j.specialty.toLowerCase().includes(searchTerm.toLowerCase()) && !j.city.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterPathway !== 'all' && j.pathway !== filterPathway) return false;
    if (filterVisa !== 'all' && j.visaSponsorship !== filterVisa) return false;
    if (filterImg !== 'all' && j.imgFriendly !== filterImg) return false;
    return true;
  });

  const handleImportUrl = () => {
    if (!importUrl.trim()) return;
    const newJob = jobEngine.collectFromUrl(importUrl);
    setJobs(jobEngine.getAll());
    setImportUrl('');
    setImportOpen(false);
    toast.success(`Job imported: ${newJob.title}`);
  };

  const handleMatch = (jobId: string) => {
    const matches = jobEngine.matchJobToCandidates(jobId);
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      jobEngine.updateJob(jobId, { matchedCandidates: matches });
      setJobs(jobEngine.getAll());
      toast.success(`Found ${matches.length} matching candidates`);
    }
  };

  const handleRefresh = () => {
    // Simulate daily check
    const updated = jobs.map(j => ({ ...j, dateLastChecked: new Date().toISOString().split('T')[0] }));
    updated.forEach(j => jobEngine.updateJob(j.id, { dateLastChecked: j.dateLastChecked }));
    setJobs(jobEngine.getAll());
    toast.success('All jobs refreshed');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Job Collection Engine</h1>
          <p className="text-gray-500 text-sm mt-1">Collect, classify, and match NHS job vacancies</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh All
          </Button>
          <Dialog open={importOpen} onOpenChange={setImportOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-teal-500 hover:bg-teal-400">
                <Plus className="w-4 h-4 mr-1" /> Import Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Import NHS Job</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="url">
                <TabsList className="w-full">
                  <TabsTrigger value="url" className="flex-1">Paste URL</TabsTrigger>
                  <TabsTrigger value="text" className="flex-1">Paste Text</TabsTrigger>
                  <TabsTrigger value="manual" className="flex-1">Manual</TabsTrigger>
                </TabsList>
                <TabsContent value="url" className="space-y-4 mt-4">
                  <Input
                    placeholder="https://www.nhsjobs.com/job/..."
                    value={importUrl}
                    onChange={e => setImportUrl(e.target.value)}
                  />
                  <Button onClick={handleImportUrl} className="w-full bg-teal-500 hover:bg-teal-400">
                    <Wand2 className="w-4 h-4 mr-2" /> Extract & Import
                  </Button>
                </TabsContent>
                <TabsContent value="text" className="space-y-4 mt-4">
                  <Textarea
                    placeholder="Paste the full job description text here..."
                    value={importText}
                    onChange={e => setImportText(e.target.value)}
                    rows={8}
                  />
                  <Button onClick={() => { toast.success('Job extracted from text'); setImportOpen(false); }} className="w-full bg-teal-500 hover:bg-teal-400">
                    <Wand2 className="w-4 h-4 mr-2" /> Extract & Import
                  </Button>
                </TabsContent>
                <TabsContent value="manual" className="space-y-4 mt-4">
                  <p className="text-sm text-gray-500">Manual entry form — fill in job details directly</p>
                  <Input placeholder="Job Title" />
                  <Input placeholder="NHS Trust" />
                  <Input placeholder="Specialty" />
                  <Input placeholder="City" />
                  <Button onClick={() => { toast.success('Job added manually'); setImportOpen(false); }} className="w-full bg-teal-500 hover:bg-teal-400">
                    Add Job
                  </Button>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Jobs', value: stats.total, icon: Briefcase, color: 'text-blue-600 bg-blue-50' },
          { label: 'Active', value: stats.active, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
          { label: 'Closing Soon', value: stats.closingSoon, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
          { label: 'Visa Friendly', value: stats.visaFriendly, icon: Globe, color: 'text-teal-600 bg-teal-50' },
          { label: 'IMG Friendly', value: stats.imgFriendly, icon: Users, color: 'text-purple-600 bg-purple-50' },
          { label: 'Added Today', value: stats.addedToday, icon: Plus, color: 'text-indigo-600 bg-indigo-50' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="p-4 border-0 shadow-sm">
              <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center mb-2`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold text-blue-900">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by title, specialty, or city..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterPathway} onValueChange={setFilterPathway}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Pathway" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pathways</SelectItem>
            <SelectItem value="Training">Training</SelectItem>
            <SelectItem value="Non-Training">Non-Training</SelectItem>
            <SelectItem value="Consultant">Consultant</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterVisa} onValueChange={setFilterVisa}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Visa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Visa</SelectItem>
            <SelectItem value="Yes">Visa Sponsored</SelectItem>
            <SelectItem value="No">No Visa</SelectItem>
            <SelectItem value="Not clearly stated">Unclear</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterImg} onValueChange={setFilterImg}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="IMG" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Best for IMGs">Best for IMGs</SelectItem>
            <SelectItem value="Suitable">Suitable</SelectItem>
            <SelectItem value="Not ideal">Not Ideal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Jobs List */}
      <div className="space-y-3">
        {filteredJobs.map(job => (
          <Card key={job.id} className="p-5 border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedJob(job)}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-blue-900">{job.title}</h3>
                  <Badge variant={job.status === 'Active' ? 'default' : job.status === 'Closing Soon' ? 'destructive' : 'secondary'} className="text-xs">
                    {job.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-2">
                  <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{job.employer}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.city}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Closes: {job.closingDate}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="outline" className="text-xs">{job.specialty}</Badge>
                  <Badge variant="outline" className="text-xs">{job.pathway}</Badge>
                  <Badge variant="outline" className="text-xs">{job.grade}</Badge>
                  {job.visaSponsorship === 'Yes' && <Badge className="text-xs bg-teal-100 text-teal-700 border-0">Visa ✓</Badge>}
                  {job.imgFriendly === 'Best for IMGs' && <Badge className="text-xs bg-purple-100 text-purple-700 border-0">IMG Friendly</Badge>}
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <span className="text-sm font-medium text-blue-900">£{job.salary}</span>
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleMatch(job.id); }}>
                  <Users className="w-3.5 h-3.5 mr-1" /> Match
                </Button>
                {job.matchedCandidates && job.matchedCandidates.length > 0 && (
                  <span className="text-xs text-teal-600 font-medium">{job.matchedCandidates.length} matched</span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Job Detail Dialog */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedJob && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedJob.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                {/* Key Info */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div><span className="text-xs text-gray-500 block">Employer</span><span className="font-medium text-sm">{selectedJob.employer}</span></div>
                  <div><span className="text-xs text-gray-500 block">City</span><span className="font-medium text-sm">{selectedJob.city}, {selectedJob.region}</span></div>
                  <div><span className="text-xs text-gray-500 block">Salary</span><span className="font-medium text-sm">£{selectedJob.salary}</span></div>
                  <div><span className="text-xs text-gray-500 block">Contract</span><span className="font-medium text-sm">{selectedJob.contractType}</span></div>
                  <div><span className="text-xs text-gray-500 block">Closing Date</span><span className="font-medium text-sm">{selectedJob.closingDate}</span></div>
                  <div><span className="text-xs text-gray-500 block">Visa Sponsorship</span><span className="font-medium text-sm">{selectedJob.visaSponsorship}</span></div>
                  <div><span className="text-xs text-gray-500 block">GMC</span><span className="font-medium text-sm">{selectedJob.gmcRequired}</span></div>
                  <div><span className="text-xs text-gray-500 block">Pathway</span><span className="font-medium text-sm">{selectedJob.pathway} — {selectedJob.pathwayDetail}</span></div>
                  <div><span className="text-xs text-gray-500 block">IMG Suitability</span><span className="font-medium text-sm">{selectedJob.imgFriendly}</span></div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">Job Description</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedJob.jobDescription}</p>
                </div>

                {/* Essential Criteria */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">Essential Criteria</h4>
                  <ul className="space-y-1">
                    {selectedJob.essentialCriteria.map((c, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-teal-500 mt-0.5">•</span>{c}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Desirable Criteria */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">Desirable Criteria</h4>
                  <ul className="space-y-1">
                    {selectedJob.desirableCriteria.map((c, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">•</span>{c}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Matched Candidates */}
                {selectedJob.matchedCandidates && selectedJob.matchedCandidates.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Matched Candidates</h4>
                    <div className="space-y-2">
                      {selectedJob.matchedCandidates.map((m, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-sm">{m.name}</span>
                          <Badge className={m.score >= 80 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                            {m.score}% Match
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button size="sm" className="bg-teal-500 hover:bg-teal-400" onClick={() => handleMatch(selectedJob.id)}>
                    <Users className="w-4 h-4 mr-1" /> Match Candidates
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => window.open(selectedJob.applicationLink, '_blank')}>
                    <ExternalLink className="w-4 h-4 mr-1" /> View Original
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-500" onClick={() => {
                    jobEngine.deleteJob(selectedJob.id);
                    setJobs(jobEngine.getAll());
                    setSelectedJob(null);
                    toast.success('Job removed');
                  }}>
                    Remove
                  </Button>
                </div>

                {/* Source info */}
                <div className="text-xs text-gray-400 pt-2 border-t">
                  Source: {selectedJob.source} | Collected: {selectedJob.dateCollected} | Last checked: {selectedJob.dateLastChecked}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
