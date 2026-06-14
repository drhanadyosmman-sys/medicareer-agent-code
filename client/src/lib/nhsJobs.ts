// NHS Job Screening, Matching, and Application Preparation Module
// All AI outputs are simulated (mock) for the static frontend version
// Designed to be easily replaceable with real API calls later

import { DoctorApplication, store } from './store';

// ===== TYPES =====

export interface NHSJob {
  id: string;
  title: string;
  specialty: string;
  grade: string;
  nhsTrust: string;
  location: string;
  salary: string;
  closingDate: string;
  contractType: string;
  sponsorshipAvailable: boolean;
  importMethod: 'link' | 'pdf' | 'text' | 'manual';
  sourceUrl?: string;
  rawDescription?: string;
  // Extracted criteria
  essentialCriteria: string[];
  desirableCriteria: string[];
  personSpecification: string[];
  clinicalRequirements: string[];
  gmcRequirements: string;
  englishRequirements: string;
  visaNotes: string;
  requiredCourses: string[];
  requiredQualifications: string[];
  requiredExperience: string[];
  requiredAuditQip: string[];
  requiredResearch: string[];
  requiredTeaching: string[];
  requiredLeadership: string[];
  // Status
  status: 'imported' | 'screened' | 'matching' | 'active' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface CandidateMatch {
  id: string;
  jobId: string;
  candidateId: string;
  candidateName: string;
  overallScore: number;
  essentialScore: number;
  desirableScore: number;
  shortlistingProbability: 'High' | 'Medium' | 'Low' | 'Very Low';
  suitabilityLevel: 'Excellent Match' | 'Good Match' | 'Possible Match' | 'Not Suitable';
  strongPoints: string[];
  weakAreas: string[];
  missingRequirements: string[];
  redFlags: string[];
  recommendedImprovements: string[];
  explanation: string;
  createdAt: string;
}

export interface ApplicationPackage {
  id: string;
  jobId: string;
  candidateId: string;
  status: 'draft' | 'ready' | 'submitted' | 'interview' | 'offer' | 'rejected';
  tailoredCv: string;
  coverLetter: string;
  supportingInformation: string;
  candidateSummary: string;
  interviewPrep: string;
  missingChecklist: string[];
  gapSuggestions: GapSuggestion;
  createdAt: string;
  updatedAt: string;
}

export interface GapSuggestion {
  missingDocuments: string[];
  coursesToImprove: string[];
  auditQipPoints: string[];
  weakCvSections: string[];
  interviewQuestions: string[];
}

// ===== STORE =====

class NHSJobStore {
  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(`medicareer_nhs_${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch { return defaultValue; }
  }
  private setItem<T>(key: string, value: T): void {
    localStorage.setItem(`medicareer_nhs_${key}`, JSON.stringify(value));
  }

  getJobs(): NHSJob[] { return this.getItem('jobs', sampleJobs); }
  addJob(job: NHSJob): void { const jobs = this.getJobs(); jobs.push(job); this.setItem('jobs', jobs); }
  updateJob(id: string, updates: Partial<NHSJob>): void {
    const jobs = this.getJobs();
    const idx = jobs.findIndex(j => j.id === id);
    if (idx !== -1) { jobs[idx] = { ...jobs[idx], ...updates, updatedAt: new Date().toISOString() }; this.setItem('jobs', jobs); }
  }
  deleteJob(id: string): void { this.setItem('jobs', this.getJobs().filter(j => j.id !== id)); }
  getJobById(id: string): NHSJob | undefined { return this.getJobs().find(j => j.id === id); }

  getMatches(): CandidateMatch[] { return this.getItem('matches', []); }
  addMatch(match: CandidateMatch): void { const m = this.getMatches(); m.push(match); this.setItem('matches', m); }
  getMatchesForJob(jobId: string): CandidateMatch[] { return this.getMatches().filter(m => m.jobId === jobId); }
  getMatchesForCandidate(candidateId: string): CandidateMatch[] { return this.getMatches().filter(m => m.candidateId === candidateId); }

  getPackages(): ApplicationPackage[] { return this.getItem('packages_app', []); }
  addPackage(pkg: ApplicationPackage): void { const p = this.getPackages(); p.push(pkg); this.setItem('packages_app', p); }
  updatePackage(id: string, updates: Partial<ApplicationPackage>): void {
    const pkgs = this.getPackages();
    const idx = pkgs.findIndex(p => p.id === id);
    if (idx !== -1) { pkgs[idx] = { ...pkgs[idx], ...updates, updatedAt: new Date().toISOString() }; this.setItem('packages_app', pkgs); }
  }
  getPackageForJobCandidate(jobId: string, candidateId: string): ApplicationPackage | undefined {
    return this.getPackages().find(p => p.jobId === jobId && p.candidateId === candidateId);
  }
}

export const nhsStore = new NHSJobStore();

// ===== AI SIMULATION FUNCTIONS =====

export function extractJobCriteria(rawText: string, title?: string): Partial<NHSJob> {
  // Simulates AI extraction from job description text
  const isAcuteMed = rawText.toLowerCase().includes('acute') || rawText.toLowerCase().includes('internal medicine');
  const isSurgery = rawText.toLowerCase().includes('surg');
  const specialty = isAcuteMed ? 'Acute Internal Medicine' : isSurgery ? 'General Surgery' : 'General Medicine';

  return {
    title: title || `Clinical Fellow in ${specialty}`,
    specialty,
    grade: 'ST1-ST2 / Trust Grade',
    nhsTrust: 'University Hospitals NHS Foundation Trust',
    location: 'London, England',
    salary: '£40,257 - £51,017 per annum',
    contractType: 'Fixed Term - 12 months',
    sponsorshipAvailable: true,
    essentialCriteria: [
      'Full GMC registration with licence to practise',
      'MBBS or equivalent medical qualification',
      'Completion of Foundation Year 2 or equivalent',
      'Evidence of clinical competence in ' + specialty,
      'IELTS 7.5 overall or OET Grade B in all components',
      'ALS certification (or willingness to obtain within 3 months)',
      'Ability to work in a multidisciplinary team',
      'Good communication skills in English',
    ],
    desirableCriteria: [
      'Previous NHS experience',
      'Evidence of clinical audit or quality improvement project',
      'Teaching experience (undergraduate or postgraduate)',
      'Research publications or presentations',
      'Leadership or management experience',
      'Membership of relevant Royal College',
    ],
    personSpecification: [
      'Demonstrates commitment to patient safety',
      'Shows evidence of reflective practice',
      'Demonstrates understanding of NHS values',
      'Evidence of continuing professional development',
      'Ability to manage clinical uncertainty',
    ],
    clinicalRequirements: [
      `Minimum 2 years post-qualification clinical experience in ${specialty} or related field`,
      'Competence in acute patient assessment and management',
      'Experience with common presentations in ' + specialty,
    ],
    gmcRequirements: 'Full GMC registration with licence to practise required at time of appointment',
    englishRequirements: 'IELTS Academic 7.5 overall (minimum 7.0 in each band) or OET Grade B in all four components',
    visaNotes: 'This post is eligible for Certificate of Sponsorship under the Skilled Worker visa route',
    requiredCourses: ['ALS (Advanced Life Support)', 'BLS (Basic Life Support)'],
    requiredQualifications: ['MBBS or equivalent', 'Full GMC registration'],
    requiredExperience: [`2+ years clinical experience in ${specialty}`, 'Foundation training or equivalent'],
    requiredAuditQip: ['At least one completed clinical audit cycle', 'Quality improvement project evidence preferred'],
    requiredResearch: ['Evidence of research awareness', 'Publications desirable but not essential'],
    requiredTeaching: ['Evidence of teaching medical students or junior doctors'],
    requiredLeadership: ['Evidence of leadership in clinical setting'],
  };
}

export function generateCandidateMatch(job: NHSJob, candidate: DoctorApplication): CandidateMatch {
  // Simulate matching logic
  let essentialScore = 30;
  let desirableScore = 20;
  const strongPoints: string[] = [];
  const weakAreas: string[] = [];
  const missingReqs: string[] = [];
  const redFlags: string[] = [];
  const improvements: string[] = [];

  // GMC
  if (candidate.gmcStatus === 'registered' || candidate.gmcStatus === 'Fully Registered') { essentialScore += 20; strongPoints.push('GMC registered'); }
  else if (candidate.gmcStatus?.toLowerCase().includes('progress')) { essentialScore += 10; weakAreas.push('GMC registration in progress — may delay start date'); }
  else { missingReqs.push('GMC registration required'); redFlags.push('No GMC registration'); improvements.push('Prioritise GMC registration before applying'); }

  // IELTS/OET
  if (candidate.ieltsOetStatus?.toLowerCase().includes('7.5') || candidate.ieltsOetStatus?.toLowerCase().includes('passed') || candidate.ieltsOetStatus?.toLowerCase().includes('oet')) {
    essentialScore += 15; strongPoints.push('English language requirement met');
  } else { missingReqs.push('IELTS 7.5 or OET B required'); improvements.push('Take IELTS/OET to meet English requirement'); }

  // Experience
  const years = parseInt(candidate.yearsExperience) || 0;
  if (years >= 3) { essentialScore += 10; strongPoints.push(`${candidate.yearsExperience} years clinical experience`); }
  else if (years >= 1) { essentialScore += 5; weakAreas.push('Limited clinical experience'); }
  else { missingReqs.push('Minimum 2 years clinical experience'); }

  // Specialty match
  if (candidate.specialtyInterest?.toLowerCase().includes(job.specialty.toLowerCase().split(' ')[0])) {
    essentialScore += 10; desirableScore += 10; strongPoints.push(`Specialty interest matches: ${candidate.specialtyInterest}`);
  } else { weakAreas.push(`Specialty mismatch: candidate interested in ${candidate.specialtyInterest}, job is ${job.specialty}`); }

  // ALS/BLS
  if (candidate.alsBlsStatus?.toLowerCase().includes('als') || candidate.alsBlsStatus?.toLowerCase().includes('both')) {
    essentialScore += 5; strongPoints.push('ALS certified');
  } else { missingReqs.push('ALS certification needed'); improvements.push('Obtain ALS certification before application'); }

  // NHS experience (desirable)
  if (candidate.nhsExperience) { desirableScore += 15; strongPoints.push('Previous NHS experience'); }
  else { weakAreas.push('No previous NHS experience'); improvements.push('Highlight any UK clinical exposure or observership'); }

  // Documents
  if (candidate.documents.length >= 3) { desirableScore += 10; }
  if (candidate.documents.some(d => d.category === 'research-publications')) { desirableScore += 10; strongPoints.push('Research publications available'); }
  if (candidate.documents.some(d => d.category === 'clinical-audit')) { desirableScore += 10; strongPoints.push('Clinical audit evidence available'); }
  if (candidate.documents.some(d => d.category === 'teaching-experience')) { desirableScore += 5; strongPoints.push('Teaching experience documented'); }

  const overallScore = Math.min(Math.round((essentialScore * 0.7 + desirableScore * 0.3)), 100);
  const shortlistingProbability = overallScore >= 80 ? 'High' : overallScore >= 65 ? 'Medium' : overallScore >= 50 ? 'Low' : 'Very Low';
  const suitabilityLevel = overallScore >= 80 ? 'Excellent Match' : overallScore >= 65 ? 'Good Match' : overallScore >= 50 ? 'Possible Match' : 'Not Suitable';

  const explanation = `${candidate.fullName} scores ${overallScore}% overall for this ${job.title} position. ` +
    `Essential criteria match: ${Math.min(essentialScore, 100)}%. Desirable criteria match: ${Math.min(desirableScore, 100)}%. ` +
    (strongPoints.length > 0 ? `Key strengths include: ${strongPoints.slice(0, 3).join(', ')}. ` : '') +
    (missingReqs.length > 0 ? `Missing requirements: ${missingReqs.join(', ')}. ` : '') +
    `Shortlisting probability: ${shortlistingProbability}.`;

  return {
    id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    jobId: job.id,
    candidateId: candidate.id,
    candidateName: candidate.fullName,
    overallScore,
    essentialScore: Math.min(essentialScore, 100),
    desirableScore: Math.min(desirableScore, 100),
    shortlistingProbability,
    suitabilityLevel,
    strongPoints,
    weakAreas,
    missingRequirements: missingReqs,
    redFlags,
    recommendedImprovements: improvements,
    explanation,
    createdAt: new Date().toISOString(),
  };
}

export function generateTailoredCv(job: NHSJob, candidate: DoctorApplication): string {
  return `CURRICULUM VITAE\n` +
    `${'='.repeat(50)}\n\n` +
    `PERSONAL DETAILS\n` +
    `Name: ${candidate.fullName}\n` +
    `Email: ${candidate.email}\n` +
    `Phone: ${candidate.whatsapp}\n` +
    `Nationality: ${candidate.nationality}\n` +
    `GMC Status: ${candidate.gmcStatus}\n\n` +
    `PERSONAL STATEMENT\n` +
    `I am a dedicated ${candidate.specialtyInterest} physician with ${candidate.yearsExperience} years of clinical experience, seeking a ${job.title} position at ${job.nhsTrust}. My clinical training at ${candidate.medicalSchool} and subsequent experience have equipped me with strong skills in patient assessment, acute management, and multidisciplinary team working. I am committed to delivering high-quality, patient-centred care within the NHS framework.\n\n` +
    `EDUCATION & QUALIFICATIONS\n` +
    `• ${candidate.medicalSchool} — MBBS (Graduated ${candidate.graduationYear})\n` +
    `• GMC Registration: ${candidate.gmcStatus}\n` +
    `• PLAB Status: ${candidate.plabStatus}\n` +
    `• English Language: ${candidate.ieltsOetStatus}\n` +
    `• Life Support: ${candidate.alsBlsStatus}\n\n` +
    `CLINICAL EXPERIENCE\n` +
    `${candidate.currentRole}\n` +
    `${candidate.currentCountryOfPractice} | ${candidate.yearsExperience} years\n\n` +
    `Key responsibilities and achievements:\n` +
    `• Managed acute presentations in ${candidate.specialtyInterest} including assessment, investigation, and management planning\n` +
    `• Participated in multidisciplinary team meetings and ward rounds\n` +
    `• Supervised junior medical staff and contributed to teaching programmes\n` +
    `• Maintained accurate clinical documentation and discharge summaries\n` +
    `• Demonstrated competence in common procedures relevant to ${job.specialty}\n\n` +
    `CLINICAL GOVERNANCE\n` +
    `• [Clinical audit details to be added from candidate portfolio]\n` +
    `• [Quality improvement project details to be added]\n\n` +
    `TEACHING & EDUCATION\n` +
    `• [Teaching activities to be added from candidate portfolio]\n\n` +
    `RESEARCH & PUBLICATIONS\n` +
    `• [Research activities to be added from candidate portfolio]\n\n` +
    `COURSES & CERTIFICATIONS\n` +
    `• ${candidate.alsBlsStatus}\n` +
    `• [Additional courses to be added]\n\n` +
    `REFERENCES\n` +
    `Available upon request\n\n` +
    `---\n` +
    `NOTE: This CV has been tailored for the ${job.title} position at ${job.nhsTrust}. ` +
    `All information is factual and based on the candidate's submitted documents. ` +
    `Sections marked with [brackets] require additional information from the candidate.`;
}

export function generateCoverLetter(job: NHSJob, candidate: DoctorApplication): string {
  return `Dear Recruitment Team,\n\n` +
    `RE: Application for ${job.title} — ${job.nhsTrust}\n\n` +
    `I am writing to express my strong interest in the ${job.title} position at ${job.nhsTrust}, as advertised. I am a ${candidate.specialtyInterest} physician with ${candidate.yearsExperience} years of clinical experience, and I believe my skills and experience align well with the requirements of this role.\n\n` +
    `CLINICAL EXPERIENCE\n` +
    `I have ${candidate.yearsExperience} years of clinical experience in ${candidate.specialtyInterest}, having trained at ${candidate.medicalSchool} (graduated ${candidate.graduationYear}). My current role as ${candidate.currentRole} has provided me with comprehensive experience in patient assessment, acute management, and multidisciplinary team working.\n\n` +
    `WHY ${job.nhsTrust.toUpperCase()}\n` +
    `I am particularly drawn to ${job.nhsTrust} because of its reputation for clinical excellence and commitment to training. I am eager to contribute to the department while developing my clinical skills within the NHS framework.\n\n` +
    `MATCHING ESSENTIAL CRITERIA\n` +
    `• Medical qualification: MBBS from ${candidate.medicalSchool}\n` +
    `• GMC registration: ${candidate.gmcStatus}\n` +
    `• English language: ${candidate.ieltsOetStatus}\n` +
    `• Clinical experience: ${candidate.yearsExperience} years in ${candidate.specialtyInterest}\n` +
    `• Life support: ${candidate.alsBlsStatus}\n\n` +
    `NHS VALUES\n` +
    `I am committed to the NHS values of compassion, respect, and dignity. I believe in patient-centred care and continuous improvement. My experience in ${candidate.currentCountryOfPractice} has taught me the importance of working collaboratively within multidisciplinary teams.\n\n` +
    `AVAILABILITY\n` +
    `I am available to commence this role at your earliest convenience and am happy to discuss my application further at interview.\n\n` +
    `I look forward to hearing from you.\n\n` +
    `Yours sincerely,\n` +
    `${candidate.fullName}`;
}

export function generateSupportingInfo(job: NHSJob, candidate: DoctorApplication): string {
  return `NHS SUPPORTING INFORMATION\n` +
    `${'='.repeat(50)}\n` +
    `Position: ${job.title}\n` +
    `Trust: ${job.nhsTrust}\n` +
    `Candidate: ${candidate.fullName}\n\n` +
    `1. CLINICAL EXPERIENCE & COMPETENCE\n` +
    `I bring ${candidate.yearsExperience} years of clinical experience in ${candidate.specialtyInterest}, having trained at ${candidate.medicalSchool}. My clinical practice has equipped me with comprehensive skills in:\n` +
    `• Acute patient assessment and management\n` +
    `• Clinical decision-making under pressure\n` +
    `• Multidisciplinary team working\n` +
    `• Patient safety and risk management\n` +
    `• Effective communication with patients and families\n\n` +
    `My current role as ${candidate.currentRole} involves managing complex presentations, participating in ward rounds, and contributing to clinical governance activities.\n\n` +
    `2. CLINICAL GOVERNANCE & QUALITY IMPROVEMENT\n` +
    `[To be completed with specific audit/QI projects from candidate portfolio]\n` +
    `• Clinical audit: [Details required]\n` +
    `• Quality improvement: [Details required]\n` +
    `• Incident reporting and learning: I am committed to patient safety and actively participate in incident reporting and learning from adverse events.\n\n` +
    `3. TEACHING & EDUCATION\n` +
    `[To be completed with specific teaching activities]\n` +
    `• I have experience in teaching medical students and junior doctors\n` +
    `• I am committed to continuing professional development\n\n` +
    `4. RESEARCH & ACADEMIC ACTIVITY\n` +
    `[To be completed with specific research activities]\n` +
    `• I maintain awareness of current evidence and guidelines in ${candidate.specialtyInterest}\n\n` +
    `5. COMMITMENT TO SPECIALTY\n` +
    `My interest in ${candidate.specialtyInterest} developed during my training at ${candidate.medicalSchool}. I am committed to developing my expertise in this field and contributing to the department at ${job.nhsTrust}.\n\n` +
    `6. NHS VALUES & PROFESSIONAL CONDUCT\n` +
    `I am committed to the NHS Constitution values:\n` +
    `• Working together for patients\n` +
    `• Respect and dignity\n` +
    `• Commitment to quality of care\n` +
    `• Compassion\n` +
    `• Improving lives\n` +
    `• Everyone counts\n\n` +
    `---\n` +
    `NOTE: Sections marked with [brackets] require specific evidence from the candidate's portfolio. ` +
    `All statements are based on verified information. No qualifications, experience, or achievements have been fabricated.`;
}

export function generateGapSuggestions(job: NHSJob, candidate: DoctorApplication, match: CandidateMatch): GapSuggestion {
  const missingDocuments: string[] = [];
  const coursesToImprove: string[] = [];
  const auditQipPoints: string[] = [];
  const weakCvSections: string[] = [];
  const interviewQuestions: string[] = [];

  if (!candidate.documents.some(d => d.category === 'cv')) missingDocuments.push('Updated CV in NHS format');
  if (!candidate.documents.some(d => d.category === 'gmc-certificate')) missingDocuments.push('GMC registration certificate');
  if (!candidate.documents.some(d => d.category === 'english-test')) missingDocuments.push('IELTS/OET score report');
  if (!candidate.documents.some(d => d.category === 'clinical-audit')) missingDocuments.push('Clinical audit evidence');
  if (!candidate.documents.some(d => d.category === 'research-publications')) missingDocuments.push('Research/publications evidence');

  if (!candidate.alsBlsStatus?.toLowerCase().includes('als')) coursesToImprove.push('ALS (Advanced Life Support) — required for most clinical posts');
  coursesToImprove.push('NHS induction/orientation course (if available)');
  if (job.specialty.includes('Medicine')) coursesToImprove.push('MRCP preparation (strengthens application)');

  auditQipPoints.push('Complete at least one full audit cycle before applying');
  auditQipPoints.push('Document a quality improvement project with measurable outcomes');
  auditQipPoints.push('Present audit findings at a departmental meeting');

  if (match.weakAreas.some(w => w.includes('experience'))) weakCvSections.push('Clinical experience section — needs more detail and quantification');
  weakCvSections.push('Clinical governance section — add specific audit/QIP details');
  weakCvSections.push('Teaching section — document all teaching activities with dates');
  weakCvSections.push('Personal statement — tailor to this specific role');

  interviewQuestions.push(`"Tell us about your experience in ${job.specialty} and how it prepares you for this role"`);
  interviewQuestions.push('"Describe a time you managed a deteriorating patient"');
  interviewQuestions.push('"Tell us about a clinical audit you have completed"');
  interviewQuestions.push('"How do you handle conflict with a senior colleague?"');
  interviewQuestions.push('"What do you know about the NHS values?"');
  interviewQuestions.push(`"Why do you want to work at ${job.nhsTrust}?"`);

  return { missingDocuments, coursesToImprove, auditQipPoints, weakCvSections, interviewQuestions };
}

// ===== SAMPLE DATA =====

const sampleJobs: NHSJob[] = [
  {
    id: 'job-sample-1',
    title: 'Clinical Fellow in Acute Internal Medicine',
    specialty: 'Acute Internal Medicine',
    grade: 'ST1-ST2 / Trust Grade',
    nhsTrust: 'Royal London Hospital — Barts Health NHS Trust',
    location: 'London, England',
    salary: '£40,257 - £51,017 per annum',
    closingDate: '2024-08-15',
    contractType: 'Fixed Term - 12 months',
    sponsorshipAvailable: true,
    importMethod: 'manual',
    essentialCriteria: ['Full GMC registration', 'MBBS or equivalent', 'FY2 completion or equivalent', 'IELTS 7.5 / OET B', 'ALS certification', 'Clinical competence in acute medicine', 'Good communication skills'],
    desirableCriteria: ['Previous NHS experience', 'Clinical audit evidence', 'Teaching experience', 'Research publications', 'MRCP Part 1'],
    personSpecification: ['Commitment to patient safety', 'Reflective practice', 'Understanding of NHS values', 'CPD evidence'],
    clinicalRequirements: ['2+ years acute medicine experience', 'Competence in acute assessment', 'Experience with medical emergencies'],
    gmcRequirements: 'Full GMC registration with licence to practise',
    englishRequirements: 'IELTS 7.5 overall (7.0 each band) or OET B all components',
    visaNotes: 'Eligible for Skilled Worker visa sponsorship',
    requiredCourses: ['ALS', 'BLS'],
    requiredQualifications: ['MBBS', 'GMC registration'],
    requiredExperience: ['2+ years clinical experience', 'Acute medicine exposure'],
    requiredAuditQip: ['At least one completed audit cycle'],
    requiredResearch: ['Research awareness', 'Publications desirable'],
    requiredTeaching: ['Teaching medical students or juniors'],
    requiredLeadership: ['Clinical leadership evidence'],
    status: 'active',
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
  }
];
