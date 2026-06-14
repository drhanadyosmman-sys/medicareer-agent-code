import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { followUpEngine, ApplicationTracking, ApplicationStatus } from '@/lib/followUp';
import { Search, Bell, Calendar, Mail, AlertTriangle, CheckCircle, Clock, XCircle, FileText, Send, Plus } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  'Submitted': 'bg-blue-100 text-blue-700',
  'Received': 'bg-blue-100 text-blue-700',
  'Longlisted': 'bg-indigo-100 text-indigo-700',
  'Shortlisted': 'bg-green-100 text-green-700',
  'Interview Invitation': 'bg-green-100 text-green-700',
  'Interview Scheduled': 'bg-green-100 text-green-700',
  'Rejection': 'bg-red-100 text-red-700',
  'Missing Documents': 'bg-amber-100 text-amber-700',
  'References Requested': 'bg-amber-100 text-amber-700',
  'Offer Received': 'bg-emerald-100 text-emerald-700',
  'Occupational Health': 'bg-purple-100 text-purple-700',
  'DBS Check': 'bg-purple-100 text-purple-700',
  'Contract Stage': 'bg-emerald-100 text-emerald-700',
  'No Response': 'bg-gray-100 text-gray-700',
  'Needs Admin Review': 'bg-amber-100 text-amber-700',
};

export default function AdminFollowUp() {
  const [tracking, setTracking] = useState<ApplicationTracking[]>(followUpEngine.getAll());
  const [selectedApp, setSelectedApp] = useState<ApplicationTracking | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [newNote, setNewNote] = useState('');
  const [newStatus, setNewStatus] = useState<string>('');

  const stats = followUpEngine.getStats();
  const reminders = followUpEngine.getReminders();

  const filtered = tracking.filter(t => {
    if (searchTerm && !t.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) && !t.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) && !t.nhsTrust.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    return true;
  });

  const handleStatusChange = (id: string, status: ApplicationStatus) => {
    followUpEngine.updateStatus(id, status);
    setTracking(followUpEngine.getAll());
    if (selectedApp?.id === id) setSelectedApp(followUpEngine.getById(id) || null);
    toast.success(`Status updated to: ${status}`);
  };

  const handleAddNote = (id: string) => {
    if (!newNote.trim()) return;
    followUpEngine.addNote(id, newNote);
    setTracking(followUpEngine.getAll());
    if (selectedApp?.id === id) setSelectedApp(followUpEngine.getById(id) || null);
    setNewNote('');
    toast.success('Note added');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-blue-900">Application Follow-up</h1>
        <p className="text-gray-500 text-sm mt-1">Track applications, emails, and follow-up actions</p>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="applications">All Applications</TabsTrigger>
          <TabsTrigger value="reminders" className="relative">
            Reminders
            {reminders.length > 0 && (
              <span className="ml-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full inline-flex items-center justify-center">{reminders.length}</span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6 mt-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Active Applications', value: stats.active, icon: FileText, color: 'text-blue-600 bg-blue-50' },
              { label: 'Upcoming Interviews', value: stats.interviews, icon: Calendar, color: 'text-green-600 bg-green-50' },
              { label: 'Offers Received', value: stats.offers, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
              { label: 'No Response (14+ days)', value: stats.noResponse14, icon: Clock, color: 'text-amber-600 bg-amber-50' },
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

          {/* Urgent Reminders */}
          {reminders.filter(r => r.urgency === 'high').length > 0 && (
            <Card className="p-4 border-red-200 bg-red-50">
              <h3 className="font-semibold text-red-800 flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4" /> Urgent Actions Required
              </h3>
              <div className="space-y-2">
                {reminders.filter(r => r.urgency === 'high').map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-100">
                    <div>
                      <Badge className="text-xs mb-1" variant="destructive">{r.type}</Badge>
                      <p className="text-sm text-gray-700">{r.message}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setSelectedApp(followUpEngine.getById(r.trackingId) || null)}>
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recent Activity */}
          <div>
            <h3 className="font-semibold text-blue-900 mb-3">Recent Updates</h3>
            <div className="space-y-2">
              {tracking.slice(0, 5).map(t => (
                <Card key={t.id} className="p-4 border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedApp(t)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-sm text-blue-900">{t.candidateName}</span>
                      <span className="text-gray-400 mx-2">→</span>
                      <span className="text-sm text-gray-600">{t.jobTitle}</span>
                    </div>
                    <Badge className={`text-xs ${STATUS_COLORS[t.status] || 'bg-gray-100 text-gray-700'}`}>
                      {t.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{t.nhsTrust} • Last update: {t.lastUpdate}</div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-4 mt-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search by name, job, or trust..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Submitted">Submitted</SelectItem>
                <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                <SelectItem value="Interview Invitation">Interview</SelectItem>
                <SelectItem value="Offer Received">Offer</SelectItem>
                <SelectItem value="Rejection">Rejection</SelectItem>
                <SelectItem value="No Response">No Response</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {filtered.map(t => (
              <Card key={t.id} className="p-4 border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedApp(t)}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-blue-900">{t.jobTitle}</span>
                      <Badge className={`text-xs ${STATUS_COLORS[t.status]}`}>{t.status}</Badge>
                    </div>
                    <div className="text-sm text-gray-500">{t.candidateName} • {t.nhsTrust}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Submitted: {t.submittedDate} • Ref: {t.applicationRef || 'N/A'}
                      {t.interviewDate && <span className="text-green-600 font-medium"> • Interview: {t.interviewDate}</span>}
                      {t.daysNoResponse && t.daysNoResponse >= 14 && <span className="text-amber-600 font-medium"> • {t.daysNoResponse} days no response</span>}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">View →</Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Reminders Tab */}
        <TabsContent value="reminders" className="space-y-4 mt-6">
          {reminders.length === 0 ? (
            <Card className="p-8 text-center border-0 shadow-sm">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-600">No pending reminders. All caught up!</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {reminders.map((r, i) => (
                <Card key={i} className={`p-4 border-0 shadow-sm ${r.urgency === 'high' ? 'border-l-4 border-l-red-500' : r.urgency === 'medium' ? 'border-l-4 border-l-amber-500' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className={`text-xs mb-1 ${r.urgency === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {r.type}
                      </Badge>
                      <p className="text-sm text-gray-700">{r.message}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setSelectedApp(followUpEngine.getById(r.trackingId) || null)}>
                      Action
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Application Detail Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedApp && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedApp.jobTitle}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                {/* Key Info */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
                  <div><span className="text-xs text-gray-500 block">Candidate</span><span className="font-medium text-sm">{selectedApp.candidateName}</span></div>
                  <div><span className="text-xs text-gray-500 block">NHS Trust</span><span className="font-medium text-sm">{selectedApp.nhsTrust}</span></div>
                  <div><span className="text-xs text-gray-500 block">Reference</span><span className="font-medium text-sm">{selectedApp.applicationRef || 'N/A'}</span></div>
                  <div><span className="text-xs text-gray-500 block">Status</span><Badge className={`text-xs ${STATUS_COLORS[selectedApp.status]}`}>{selectedApp.status}</Badge></div>
                  <div><span className="text-xs text-gray-500 block">Submitted</span><span className="font-medium text-sm">{selectedApp.submittedDate}</span></div>
                  <div><span className="text-xs text-gray-500 block">Last Update</span><span className="font-medium text-sm">{selectedApp.lastUpdate}</span></div>
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2"><Clock className="w-4 h-4" /> Timeline</h4>
                  <div className="space-y-0 ml-4">
                    {selectedApp.timeline.map((event, i) => (
                      <div key={i} className="flex gap-4 items-start pb-4 relative">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${i === selectedApp.timeline.length - 1 ? 'bg-teal-500' : 'bg-gray-300'}`} />
                          {i < selectedApp.timeline.length - 1 && <div className="w-0.5 h-full bg-gray-200 mt-1" />}
                        </div>
                        <div className="pb-2">
                          <div className="text-sm font-medium text-blue-900">{event.event}</div>
                          <div className="text-xs text-gray-400">{event.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Emails */}
                {selectedApp.emails.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2"><Mail className="w-4 h-4" /> Emails</h4>
                    <div className="space-y-3">
                      {selectedApp.emails.map((email, i) => (
                        <div key={i} className={`p-3 rounded-lg border ${email.direction === 'incoming' ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-xs">{email.subject}</span>
                            <Badge variant="outline" className="text-xs">{email.direction === 'incoming' ? '← Received' : '→ Sent'}</Badge>
                          </div>
                          <p className="text-xs text-gray-600">{email.body}</p>
                          <div className="text-xs text-gray-400 mt-1">{email.date}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <h4 className="font-semibold text-sm mb-3">Notes</h4>
                  <div className="space-y-1 mb-3">
                    {selectedApp.notes.map((note, i) => (
                      <div key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-gray-400">•</span>{note}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Add a note..." value={newNote} onChange={e => setNewNote(e.target.value)} className="flex-1" />
                    <Button size="sm" onClick={() => handleAddNote(selectedApp.id)}>Add</Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <Select value={newStatus} onValueChange={(v) => { setNewStatus(v); handleStatusChange(selectedApp.id, v as ApplicationStatus); }}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Change Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {['Submitted', 'Received', 'Longlisted', 'Shortlisted', 'Interview Invitation', 'Rejection', 'Missing Documents', 'References Requested', 'Offer Received', 'No Response'].map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" onClick={() => toast.success('Interview prep generated')}>
                    <FileText className="w-3.5 h-3.5 mr-1" /> Generate Interview Prep
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast.success('Follow-up email drafted')}>
                    <Send className="w-3.5 h-3.5 mr-1" /> Draft Follow-up
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
