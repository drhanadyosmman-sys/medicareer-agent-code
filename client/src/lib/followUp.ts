// Application Follow-up & Tracking System

export type ApplicationStatus =
  | 'Submitted'
  | 'Received'
  | 'Longlisted'
  | 'Shortlisted'
  | 'Interview Invitation'
  | 'Interview Scheduled'
  | 'Rejection'
  | 'Missing Documents'
  | 'References Requested'
  | 'Offer Received'
  | 'Occupational Health'
  | 'DBS Check'
  | 'Contract Stage'
  | 'No Response'
  | 'Needs Admin Review';

export interface ApplicationTracking {
  id: string;
  candidateId: string;
  candidateName: string;
  jobId?: string;
  jobTitle: string;
  nhsTrust: string;
  applicationRef?: string;
  status: ApplicationStatus;
  submittedDate: string;
  lastUpdate: string;
  interviewDate?: string;
  interviewTime?: string;
  deadlineForResponse?: string;
  requiredAction?: string;
  contactEmail?: string;
  notes: string[];
  emails: { date: string; subject: string; body: string; direction: 'incoming' | 'outgoing' }[];
  timeline: { date: string; event: string; status: ApplicationStatus }[];
  daysNoResponse?: number;
}

export interface CandidateEmail {
  id: string;
  candidateId: string;
  email: string;
  consentGiven: boolean;
  consentDate?: string;
  connectionMethod: 'connected' | 'forwarding' | 'manual';
}

const DATA_KEY = 'medicareer_followup_v2';

const initialTracking: ApplicationTracking[] = [
  {
    id: 'track-001',
    candidateId: 'user-1',
    candidateName: 'Dr. Ahmed Hassan',
    jobId: 'job-001',
    jobTitle: 'Clinical Fellow in Acute Internal Medicine',
    nhsTrust: 'Barts Health NHS Trust',
    applicationRef: 'BH-2026-4521',
    status: 'Shortlisted',
    submittedDate: '2026-06-01',
    lastUpdate: '2026-06-10',
    interviewDate: '2026-06-20',
    interviewTime: '10:00 AM',
    requiredAction: 'Prepare for interview',
    contactEmail: 'recruitment@bartshealth.nhs.uk',
    notes: ['Strong application', 'MRCP Part 1 passed', 'Good clinical experience'],
    emails: [
      { date: '2026-06-01', subject: 'Application Received', body: 'Thank you for your application for the Clinical Fellow post. Your reference number is BH-2026-4521.', direction: 'incoming' },
      { date: '2026-06-10', subject: 'Interview Invitation', body: 'We are pleased to invite you for an interview on 20th June 2026 at 10:00 AM. Please confirm your attendance.', direction: 'incoming' },
    ],
    timeline: [
      { date: '2026-06-01', event: 'Application submitted', status: 'Submitted' },
      { date: '2026-06-01', event: 'Confirmation email received', status: 'Received' },
      { date: '2026-06-10', event: 'Shortlisted for interview', status: 'Shortlisted' },
      { date: '2026-06-10', event: 'Interview invitation received', status: 'Interview Invitation' },
    ],
  },
  {
    id: 'track-002',
    candidateId: 'user-1',
    candidateName: 'Dr. Ahmed Hassan',
    jobId: 'job-002',
    jobTitle: 'Trust Grade Doctor - Emergency Medicine',
    nhsTrust: 'University Hospitals Birmingham',
    applicationRef: 'UHB-2026-1187',
    status: 'No Response',
    submittedDate: '2026-05-20',
    lastUpdate: '2026-05-20',
    daysNoResponse: 25,
    notes: ['Submitted 25 days ago', 'No response yet'],
    emails: [
      { date: '2026-05-20', subject: 'Application Submitted', body: 'Your application has been submitted successfully.', direction: 'outgoing' },
    ],
    timeline: [
      { date: '2026-05-20', event: 'Application submitted', status: 'Submitted' },
    ],
  },
  {
    id: 'track-003',
    candidateId: 'user-1',
    candidateName: 'Dr. Ahmed Hassan',
    jobTitle: 'Specialty Doctor in General Medicine',
    nhsTrust: 'Royal Free London NHS Foundation Trust',
    applicationRef: 'RFL-2026-892',
    status: 'Rejection',
    submittedDate: '2026-05-10',
    lastUpdate: '2026-05-28',
    notes: ['Rejected — insufficient experience for this grade'],
    emails: [
      { date: '2026-05-28', subject: 'Application Outcome', body: 'We regret to inform you that your application was not successful on this occasion. We received a high number of applications.', direction: 'incoming' },
    ],
    timeline: [
      { date: '2026-05-10', event: 'Application submitted', status: 'Submitted' },
      { date: '2026-05-28', event: 'Rejection received', status: 'Rejection' },
    ],
  },
  {
    id: 'track-004',
    candidateId: 'user-1',
    candidateName: 'Dr. Ahmed Hassan',
    jobTitle: 'Clinical Fellow in Cardiology',
    nhsTrust: 'King\'s College Hospital NHS Foundation Trust',
    applicationRef: 'KCH-2026-3344',
    status: 'Offer Received',
    submittedDate: '2026-04-15',
    lastUpdate: '2026-06-12',
    deadlineForResponse: '2026-06-18',
    requiredAction: 'Accept or decline offer by 18 June',
    notes: ['Offer received!', 'Salary: £55,329', 'Start date: August 2026'],
    emails: [
      { date: '2026-06-12', subject: 'Conditional Offer of Employment', body: 'We are delighted to offer you the position of Clinical Fellow in Cardiology. Please respond by 18 June 2026.', direction: 'incoming' },
    ],
    timeline: [
      { date: '2026-04-15', event: 'Application submitted', status: 'Submitted' },
      { date: '2026-04-28', event: 'Shortlisted', status: 'Shortlisted' },
      { date: '2026-05-10', event: 'Interview attended', status: 'Interview Scheduled' },
      { date: '2026-06-12', event: 'Offer received', status: 'Offer Received' },
    ],
  },
];

function loadTracking(): ApplicationTracking[] {
  try {
    const stored = localStorage.getItem(DATA_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  localStorage.setItem(DATA_KEY, JSON.stringify(initialTracking));
  return initialTracking;
}

function saveTracking(data: ApplicationTracking[]) {
  localStorage.setItem(DATA_KEY, JSON.stringify(data));
}

export const followUpEngine = {
  getAll(): ApplicationTracking[] {
    return loadTracking();
  },

  getByCandidate(candidateId: string): ApplicationTracking[] {
    return loadTracking().filter(t => t.candidateId === candidateId);
  },

  getById(id: string): ApplicationTracking | undefined {
    return loadTracking().find(t => t.id === id);
  },

  updateStatus(id: string, status: ApplicationStatus, note?: string): void {
    const data = loadTracking();
    const idx = data.findIndex(t => t.id === id);
    if (idx >= 0) {
      data[idx].status = status;
      data[idx].lastUpdate = new Date().toISOString().split('T')[0];
      data[idx].timeline.push({ date: new Date().toISOString().split('T')[0], event: `Status changed to: ${status}`, status });
      if (note) data[idx].notes.push(note);
      saveTracking(data);
    }
  },

  addNote(id: string, note: string): void {
    const data = loadTracking();
    const idx = data.findIndex(t => t.id === id);
    if (idx >= 0) {
      data[idx].notes.push(note);
      saveTracking(data);
    }
  },

  addEmail(id: string, email: { date: string; subject: string; body: string; direction: 'incoming' | 'outgoing' }): void {
    const data = loadTracking();
    const idx = data.findIndex(t => t.id === id);
    if (idx >= 0) {
      data[idx].emails.push(email);
      data[idx].lastUpdate = email.date;
      saveTracking(data);
    }
  },

  addTracking(tracking: Omit<ApplicationTracking, 'id'>): ApplicationTracking {
    const data = loadTracking();
    const newTracking: ApplicationTracking = { ...tracking, id: `track-${Date.now()}` };
    data.unshift(newTracking);
    saveTracking(data);
    return newTracking;
  },

  getStats() {
    const data = loadTracking();
    const threeDays = new Date();
    threeDays.setDate(threeDays.getDate() + 3);
    return {
      total: data.length,
      active: data.filter(t => !['Rejection', 'Offer Received', 'Contract Stage'].includes(t.status)).length,
      interviews: data.filter(t => t.interviewDate && new Date(t.interviewDate) >= new Date()).length,
      offers: data.filter(t => t.status === 'Offer Received').length,
      rejections: data.filter(t => t.status === 'Rejection').length,
      noResponse7: data.filter(t => t.status === 'No Response' && (t.daysNoResponse || 0) >= 7).length,
      noResponse14: data.filter(t => t.status === 'No Response' && (t.daysNoResponse || 0) >= 14).length,
      urgentDeadlines: data.filter(t => t.deadlineForResponse && new Date(t.deadlineForResponse) <= threeDays).length,
      missingDocs: data.filter(t => t.status === 'Missing Documents').length,
    };
  },

  getReminders(): { type: string; message: string; urgency: 'high' | 'medium' | 'low'; trackingId: string }[] {
    const data = loadTracking();
    const reminders: { type: string; message: string; urgency: 'high' | 'medium' | 'low'; trackingId: string }[] = [];
    const threeDays = new Date();
    threeDays.setDate(threeDays.getDate() + 3);

    data.forEach(t => {
      if (t.status === 'No Response' && (t.daysNoResponse || 0) >= 14) {
        reminders.push({ type: 'No Response', message: `${t.candidateName}: No response from ${t.nhsTrust} for ${t.daysNoResponse} days`, urgency: 'medium', trackingId: t.id });
      }
      if (t.interviewDate && new Date(t.interviewDate) <= threeDays && new Date(t.interviewDate) >= new Date()) {
        reminders.push({ type: 'Interview Soon', message: `${t.candidateName}: Interview at ${t.nhsTrust} on ${t.interviewDate}`, urgency: 'high', trackingId: t.id });
      }
      if (t.deadlineForResponse && new Date(t.deadlineForResponse) <= threeDays) {
        reminders.push({ type: 'Deadline', message: `${t.candidateName}: Offer deadline from ${t.nhsTrust} on ${t.deadlineForResponse}`, urgency: 'high', trackingId: t.id });
      }
      if (t.status === 'Missing Documents') {
        reminders.push({ type: 'Missing Docs', message: `${t.candidateName}: ${t.nhsTrust} requested missing documents`, urgency: 'medium', trackingId: t.id });
      }
    });

    return reminders.sort((a, b) => a.urgency === 'high' ? -1 : b.urgency === 'high' ? 1 : 0);
  },
};
