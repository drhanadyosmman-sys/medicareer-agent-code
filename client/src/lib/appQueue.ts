// Application Queue & Subscription System
// Manages automated job application submissions on behalf of doctors

import { store, DoctorApplication } from './store';
import { nhsStore, NHSJob, CandidateMatch, generateTailoredCv, generateCoverLetter, generateSupportingInfo } from './nhsJobs';

// ===== TYPES =====

export interface Subscription {
  id: string;
  candidateId: string;
  candidateName: string;
  packageName: string;
  packageType: 'cv-review' | 'full-application' | 'interview-support' | 'vip';
  maxApplications: number; // -1 for unlimited
  applicationsUsed: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'exhausted';
}

export interface JobSubmission {
  id: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  nhsTrust: string;
  matchScore: number;
  tailoredCv: string;
  coverLetter: string;
  supportingInfo: string;
  status: 'pending' | 'ready' | 'submitted' | 'response-received' | 'interview' | 'rejected';
  cvStatus: 'pending' | 'ready';
  submittedAt?: string;
  responseAt?: string;
  responseNote?: string;
  createdAt: string;
  notificationSent: boolean;
}

export interface DailyStats {
  toSubmitToday: number;
  submittedToday: number;
  submittedThisWeek: number;
  responsesReceived: number;
  interviewsScheduled: number;
  expiringPackages: number;
  closingSoonJobs: number;
}

// ===== STORE =====

class AppQueueStore {
  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(`medicareer_queue_${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch { return defaultValue; }
  }
  private setItem<T>(key: string, value: T): void {
    localStorage.setItem(`medicareer_queue_${key}`, JSON.stringify(value));
  }

  // Subscriptions
  getSubscriptions(): Subscription[] {
    return this.getItem('subscriptions', initialSubscriptions);
  }
  getSubscriptionForCandidate(candidateId: string): Subscription | undefined {
    return this.getSubscriptions().find(s => s.candidateId === candidateId);
  }
  updateSubscription(id: string, updates: Partial<Subscription>): void {
    const subs = this.getSubscriptions();
    const idx = subs.findIndex(s => s.id === id);
    if (idx !== -1) { subs[idx] = { ...subs[idx], ...updates }; this.setItem('subscriptions', subs); }
  }
  addSubscription(sub: Subscription): void {
    const subs = this.getSubscriptions();
    subs.push(sub);
    this.setItem('subscriptions', subs);
  }

  // Submissions
  getSubmissions(): JobSubmission[] {
    return this.getItem('submissions', initialSubmissions);
  }
  addSubmission(sub: JobSubmission): void {
    const subs = this.getSubmissions();
    subs.push(sub);
    this.setItem('submissions', subs);
  }
  updateSubmission(id: string, updates: Partial<JobSubmission>): void {
    const subs = this.getSubmissions();
    const idx = subs.findIndex(s => s.id === id);
    if (idx !== -1) { subs[idx] = { ...subs[idx], ...updates }; this.setItem('submissions', subs); }
  }
  getSubmissionsForCandidate(candidateId: string): JobSubmission[] {
    return this.getSubmissions().filter(s => s.candidateId === candidateId);
  }
  getPendingSubmissions(): JobSubmission[] {
    return this.getSubmissions().filter(s => s.status === 'ready');
  }

  // Auto-match and queue
  autoMatchAndQueue(): { newEntries: number } {
    const jobs = nhsStore.getJobs().filter(j => j.status === 'active' || j.status === 'screened');
    const candidates = store.getApplications();
    const existingSubmissions = this.getSubmissions();
    let newEntries = 0;

    jobs.forEach(job => {
      candidates.forEach(candidate => {
        // Check if already queued
        const alreadyQueued = existingSubmissions.some(s => s.jobId === job.id && s.candidateId === candidate.id);
        if (alreadyQueued) return;

        // Check subscription
        const sub = this.getSubscriptionForCandidate(candidate.id);
        if (!sub || sub.status !== 'active') return;
        if (sub.maxApplications !== -1 && sub.applicationsUsed >= sub.maxApplications) return;

        // Generate match (simplified scoring)
        let score = 40;
        if (candidate.gmcStatus?.toLowerCase().includes('registered')) score += 20;
        if (candidate.ieltsOetStatus?.toLowerCase().includes('7.5') || candidate.ieltsOetStatus?.toLowerCase().includes('passed')) score += 15;
        if (candidate.specialtyInterest?.toLowerCase().includes(job.specialty.toLowerCase().split(' ')[0])) score += 15;
        if (parseInt(candidate.yearsExperience) >= 3) score += 10;
        score = Math.min(score, 100);

        if (score >= 50) {
          const tailoredCv = generateTailoredCv(job, candidate);
          const coverLetter = generateCoverLetter(job, candidate);
          const supportingInfo = generateSupportingInfo(job, candidate);

          const submission: JobSubmission = {
            id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            candidateId: candidate.id,
            candidateName: candidate.fullName,
            jobId: job.id,
            jobTitle: job.title,
            nhsTrust: job.nhsTrust,
            matchScore: score,
            tailoredCv,
            coverLetter,
            supportingInfo,
            status: 'ready',
            cvStatus: 'ready',
            createdAt: new Date().toISOString(),
            notificationSent: false,
          };
          this.addSubmission(submission);
          newEntries++;
        }
      });
    });

    return { newEntries };
  }

  // Submit application
  submitApplication(submissionId: string): boolean {
    const submission = this.getSubmissions().find(s => s.id === submissionId);
    if (!submission || submission.status !== 'ready') return false;

    // Check subscription
    const sub = this.getSubscriptionForCandidate(submission.candidateId);
    if (!sub || sub.status !== 'active') return false;
    if (sub.maxApplications !== -1 && sub.applicationsUsed >= sub.maxApplications) return false;

    // Mark as submitted
    this.updateSubmission(submissionId, {
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      notificationSent: true,
    });

    // Decrement subscription
    if (sub.maxApplications !== -1) {
      const newUsed = sub.applicationsUsed + 1;
      this.updateSubscription(sub.id, {
        applicationsUsed: newUsed,
        status: newUsed >= sub.maxApplications ? 'exhausted' : 'active',
      });
    }

    // Send notification message to doctor
    const candidate = store.getApplicationById(submission.candidateId);
    if (candidate) {
      const msg = {
        id: `msg-${Date.now()}`,
        from: 'admin' as const,
        content: `Our team has submitted your application for ${submission.jobTitle} at ${submission.nhsTrust}. We will keep you updated on any responses. If you have any questions, please don't hesitate to reach out.`,
        createdAt: new Date().toISOString(),
        read: false,
      };
      const updatedMessages = [...candidate.messages, msg];
      store.updateApplication(submission.candidateId, { messages: updatedMessages });
    }

    return true;
  }

  // Batch submit all ready
  submitAllReady(): number {
    const ready = this.getPendingSubmissions();
    let submitted = 0;
    ready.forEach(sub => {
      if (this.submitApplication(sub.id)) submitted++;
    });
    return submitted;
  }

  // Daily stats
  getDailyStats(): DailyStats {
    const submissions = this.getSubmissions();
    const subscriptions = this.getSubscriptions();
    const jobs = nhsStore.getJobs();
    const today = new Date().toDateString();
    const weekAgo = new Date(Date.now() - 7 * 86400000);

    const toSubmitToday = submissions.filter(s => s.status === 'ready').length;
    const submittedToday = submissions.filter(s => s.status === 'submitted' && s.submittedAt && new Date(s.submittedAt).toDateString() === today).length;
    const submittedThisWeek = submissions.filter(s => s.status === 'submitted' && s.submittedAt && new Date(s.submittedAt) >= weekAgo).length;
    const responsesReceived = submissions.filter(s => s.status === 'response-received' || s.status === 'interview').length;
    const interviewsScheduled = submissions.filter(s => s.status === 'interview').length;

    const now = new Date();
    const sevenDaysLater = new Date(Date.now() + 7 * 86400000);
    const expiringPackages = subscriptions.filter(s => s.status === 'active' && new Date(s.endDate) <= sevenDaysLater).length;
    const closingSoonJobs = jobs.filter(j => {
      const closing = new Date(j.closingDate);
      return closing >= now && closing <= sevenDaysLater;
    }).length;

    return { toSubmitToday, submittedToday, submittedThisWeek, responsesReceived, interviewsScheduled, expiringPackages, closingSoonJobs };
  }
}

export const queueStore = new AppQueueStore();

// ===== INITIAL DATA =====

const initialSubscriptions: Subscription[] = [
  {
    id: 'sub-demo-1',
    candidateId: 'app-demo-1',
    candidateName: 'Dr. Ahmed Hassan',
    packageName: 'Full Application Preparation',
    packageType: 'full-application',
    maxApplications: 5,
    applicationsUsed: 1,
    startDate: '2024-06-01T00:00:00Z',
    endDate: '2024-12-01T00:00:00Z',
    status: 'active',
  }
];

const initialSubmissions: JobSubmission[] = [
  {
    id: 'sub-init-1',
    candidateId: 'app-demo-1',
    candidateName: 'Dr. Ahmed Hassan',
    jobId: 'job-sample-1',
    jobTitle: 'Clinical Fellow in Acute Internal Medicine',
    nhsTrust: 'Royal London Hospital — Barts Health NHS Trust',
    matchScore: 72,
    tailoredCv: 'CV tailored for Clinical Fellow in Acute Internal Medicine...',
    coverLetter: 'Cover letter for Barts Health NHS Trust...',
    supportingInfo: 'Supporting information for Clinical Fellow position...',
    status: 'submitted',
    cvStatus: 'ready',
    submittedAt: '2024-06-10T09:00:00Z',
    createdAt: '2024-06-08T00:00:00Z',
    notificationSent: true,
  }
];
