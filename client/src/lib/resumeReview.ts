// Expert Resume Review Request System
// Doctors can request a 1-on-1 expert review session with our career consultant

export interface ResumeReviewRequest {
  id: string;
  candidateId: string;
  candidateName: string;
  email: string;
  specialty: string;
  message: string; // Doctor's note about what they want reviewed
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  scheduledDate?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

class ResumeReviewStore {
  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(`medicareer_review_${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch { return defaultValue; }
  }
  private setItem<T>(key: string, value: T): void {
    localStorage.setItem(`medicareer_review_${key}`, JSON.stringify(value));
  }

  getRequests(): ResumeReviewRequest[] {
    return this.getItem('requests', []);
  }

  addRequest(req: ResumeReviewRequest): void {
    const reqs = this.getRequests();
    reqs.push(req);
    this.setItem('requests', reqs);
  }

  updateRequest(id: string, updates: Partial<ResumeReviewRequest>): void {
    const reqs = this.getRequests();
    const idx = reqs.findIndex(r => r.id === id);
    if (idx !== -1) {
      reqs[idx] = { ...reqs[idx], ...updates, updatedAt: new Date().toISOString() };
      this.setItem('requests', reqs);
    }
  }

  getRequestsForCandidate(candidateId: string): ResumeReviewRequest[] {
    return this.getRequests().filter(r => r.candidateId === candidateId);
  }

  getPendingCount(): number {
    return this.getRequests().filter(r => r.status === 'pending').length;
  }
}

export const reviewStore = new ResumeReviewStore();
