// NHS Job Management System - Data models and store

export const SPECIALTIES = [
  'Internal Medicine', 'Surgery', 'Pediatrics', 'Psychiatry',
  'Emergency Medicine', 'Obstetrics & Gynecology', 'Radiology',
  'Anaesthetics', 'Cardiology', 'Neurology', 'Orthopaedics',
  'Ophthalmology', 'ENT', 'Dermatology', 'Gastroenterology',
  'Respiratory Medicine', 'Geriatric Medicine', 'Oncology',
  'Haematology', 'Pathology', 'General Practice', 'Other'
];

export const RANKS = [
  'Foundation Year (FY1/FY2)',
  'Core Training (CT1-CT3)',
  'Specialty Registrar (ST3-ST8)',
  'Staff Grade / Specialty Doctor',
  'SAS Doctor',
  'Consultant',
  'Clinical Fellow',
  'Trust Grade'
];

export type JobStatus = 'Active' | 'Closed' | 'Draft';
export type SharedJobStatus = 'New' | 'Viewed' | 'Applied' | 'Rejected';
export type ApplicationOnBehalfStatus = 'Preparing' | 'Applied' | 'Interview Scheduled' | 'Offered' | 'Rejected';

export interface NHSJob {
  id: string;
  title: string;
  hospital: string;
  location: string;
  salaryRange: string;
  description: string;
  closingDate: string;
  nhsJobsLink: string;
  specialty: string;
  rank: string;
  status: JobStatus;
  createdAt: string;
  // AI extracted fields (optional)
  essentialCriteria?: string[];
  desirableCriteria?: string[];
  personSpec?: string;
}

export interface SharedJob {
  id: string;
  jobId: string;
  doctorId: string;
  doctorName: string;
  status: SharedJobStatus;
  sharedAt: string;
  viewedAt?: string;
  applicationStatus?: ApplicationOnBehalfStatus;
  applicationNotes?: string;
  tailoredCv?: string;
}

export interface CVTailoringResult {
  id: string;
  jobId: string;
  doctorId: string;
  originalCvSummary: string;
  suggestedChanges: string[];
  tailoredCvContent: string;
  createdAt: string;
}

const DATA_KEY = 'medicareer_jobs_mgmt_v1';

const initialJobs: NHSJob[] = [
  {
    id: 'mj-001',
    title: 'Clinical Fellow in Acute Internal Medicine',
    hospital: 'Barts Health NHS Trust - Royal London Hospital',
    location: 'London, England',
    salaryRange: '£55,329 - £63,152',
    description: 'We are seeking an enthusiastic Clinical Fellow to join our Acute Medicine team. The successful candidate will manage acute medical admissions, participate in the medical take, and contribute to quality improvement projects. This is an excellent opportunity for career development with exposure to a wide range of acute medical conditions in a busy tertiary centre.',
    closingDate: '2026-07-15',
    nhsJobsLink: 'https://www.nhsjobs.com/job/UK/London/CF-AIM-Barts',
    specialty: 'Internal Medicine',
    rank: 'Clinical Fellow',
    status: 'Active',
    createdAt: '2026-06-10',
    essentialCriteria: ['GMC registration with licence to practise', 'MRCP Part 1 minimum', '2+ years post-graduation', 'ALS certification'],
    desirableCriteria: ['MRCP Part 2', 'Audit experience', 'Teaching experience'],
    personSpec: 'Enthusiastic doctor with strong clinical skills, commitment to patient safety, and ability to work in a multidisciplinary team.',
  },
  {
    id: 'mj-002',
    title: 'Trust Grade Doctor - Emergency Medicine',
    hospital: 'University Hospitals Birmingham - Queen Elizabeth Hospital',
    location: 'Birmingham, West Midlands',
    salaryRange: '£43,923 - £55,329',
    description: 'Trust Grade Doctor post in our busy Emergency Department. The post holder will work shifts managing undifferentiated patients, from minor injuries to major trauma. Excellent training opportunities with regular teaching and simulation sessions.',
    closingDate: '2026-07-01',
    nhsJobsLink: 'https://www.nhsjobs.com/job/UK/Birmingham/TG-EM-UHB',
    specialty: 'Emergency Medicine',
    rank: 'Trust Grade',
    status: 'Active',
    createdAt: '2026-06-12',
    essentialCriteria: ['GMC registration', '1+ year post-graduation', 'BLS/ALS certification'],
    desirableCriteria: ['Emergency medicine experience', 'MCEM Part A', 'Trauma course'],
    personSpec: 'Motivated doctor able to work independently and as part of a team in a fast-paced environment.',
  },
  {
    id: 'mj-003',
    title: 'Specialty Doctor in Psychiatry',
    hospital: 'South London and Maudsley NHS Foundation Trust',
    location: 'London, England',
    salaryRange: '£59,175 - £95,400',
    description: 'Substantive Specialty Doctor post in General Adult Psychiatry. The post holder will manage a community caseload of patients with complex mental health needs, working within a multidisciplinary team.',
    closingDate: '2026-07-20',
    nhsJobsLink: 'https://www.nhsjobs.com/job/UK/London/SD-Psych-SLAM',
    specialty: 'Psychiatry',
    rank: 'Staff Grade / Specialty Doctor',
    status: 'Active',
    createdAt: '2026-06-08',
    essentialCriteria: ['GMC registration', 'MRCPsych or equivalent', '4+ years psychiatry experience'],
    desirableCriteria: ['Section 12 approval', 'Research publications', 'Management experience'],
    personSpec: 'Experienced psychiatrist with excellent communication skills and commitment to recovery-focused care.',
  },
];

const initialSharedJobs: SharedJob[] = [
  {
    id: 'sj-001',
    jobId: 'mj-001',
    doctorId: 'user-1',
    doctorName: 'Dr. Ahmed Hassan',
    status: 'New',
    sharedAt: '2026-06-14',
  },
];

interface JobMgmtData {
  jobs: NHSJob[];
  sharedJobs: SharedJob[];
  tailoring: CVTailoringResult[];
}

function loadData(): JobMgmtData {
  try {
    const stored = localStorage.getItem(DATA_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  const initial: JobMgmtData = { jobs: initialJobs, sharedJobs: initialSharedJobs, tailoring: [] };
  localStorage.setItem(DATA_KEY, JSON.stringify(initial));
  return initial;
}

function saveData(data: JobMgmtData) {
  localStorage.setItem(DATA_KEY, JSON.stringify(data));
}

export const jobMgmt = {
  // Jobs CRUD
  getJobs(): NHSJob[] {
    return loadData().jobs;
  },

  getJobById(id: string): NHSJob | undefined {
    return loadData().jobs.find(j => j.id === id);
  },

  addJob(job: Omit<NHSJob, 'id' | 'createdAt'>): NHSJob {
    const data = loadData();
    const newJob: NHSJob = { ...job, id: `mj-${Date.now()}`, createdAt: new Date().toISOString().split('T')[0] };
    data.jobs.unshift(newJob);
    saveData(data);
    return newJob;
  },

  updateJob(id: string, updates: Partial<NHSJob>): void {
    const data = loadData();
    const idx = data.jobs.findIndex(j => j.id === id);
    if (idx >= 0) { data.jobs[idx] = { ...data.jobs[idx], ...updates }; saveData(data); }
  },

  deleteJob(id: string): void {
    const data = loadData();
    data.jobs = data.jobs.filter(j => j.id !== id);
    data.sharedJobs = data.sharedJobs.filter(sj => sj.jobId !== id);
    saveData(data);
  },

  filterJobs(specialty?: string, rank?: string, status?: string): NHSJob[] {
    let jobs = loadData().jobs;
    if (specialty && specialty !== 'all') jobs = jobs.filter(j => j.specialty === specialty);
    if (rank && rank !== 'all') jobs = jobs.filter(j => j.rank === rank);
    if (status && status !== 'all') jobs = jobs.filter(j => j.status === status);
    return jobs;
  },

  // Sharing
  getSharedJobs(): SharedJob[] {
    return loadData().sharedJobs;
  },

  getSharedJobsForDoctor(doctorId: string): (SharedJob & { job?: NHSJob })[] {
    const data = loadData();
    return data.sharedJobs
      .filter(sj => sj.doctorId === doctorId)
      .map(sj => ({ ...sj, job: data.jobs.find(j => j.id === sj.jobId) }));
  },

  getSharedJobsForJob(jobId: string): SharedJob[] {
    return loadData().sharedJobs.filter(sj => sj.jobId === jobId);
  },

  shareJobWithDoctors(jobId: string, doctors: { id: string; name: string }[]): void {
    const data = loadData();
    doctors.forEach(doc => {
      const exists = data.sharedJobs.find(sj => sj.jobId === jobId && sj.doctorId === doc.id);
      if (!exists) {
        data.sharedJobs.push({
          id: `sj-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          jobId,
          doctorId: doc.id,
          doctorName: doc.name,
          status: 'New',
          sharedAt: new Date().toISOString().split('T')[0],
        });
      }
    });
    saveData(data);
  },

  updateSharedJobStatus(sharedJobId: string, status: SharedJobStatus): void {
    const data = loadData();
    const idx = data.sharedJobs.findIndex(sj => sj.id === sharedJobId);
    if (idx >= 0) { data.sharedJobs[idx].status = status; saveData(data); }
  },

  markAsAppliedOnBehalf(sharedJobId: string, appStatus: ApplicationOnBehalfStatus, notes?: string): void {
    const data = loadData();
    const idx = data.sharedJobs.findIndex(sj => sj.id === sharedJobId);
    if (idx >= 0) {
      data.sharedJobs[idx].status = 'Applied';
      data.sharedJobs[idx].applicationStatus = appStatus;
      if (notes) data.sharedJobs[idx].applicationNotes = notes;
      saveData(data);
    }
  },

  updateApplicationStatus(sharedJobId: string, appStatus: ApplicationOnBehalfStatus, notes?: string): void {
    const data = loadData();
    const idx = data.sharedJobs.findIndex(sj => sj.id === sharedJobId);
    if (idx >= 0) {
      data.sharedJobs[idx].applicationStatus = appStatus;
      if (notes) data.sharedJobs[idx].applicationNotes = notes;
      saveData(data);
    }
  },

  // CV Tailoring
  saveTailoringResult(result: Omit<CVTailoringResult, 'id' | 'createdAt'>): CVTailoringResult {
    const data = loadData();
    const newResult: CVTailoringResult = { ...result, id: `cvt-${Date.now()}`, createdAt: new Date().toISOString() };
    data.tailoring.unshift(newResult);
    saveData(data);
    return newResult;
  },

  getTailoringResults(doctorId?: string, jobId?: string): CVTailoringResult[] {
    const data = loadData();
    let results = data.tailoring;
    if (doctorId) results = results.filter(r => r.doctorId === doctorId);
    if (jobId) results = results.filter(r => r.jobId === jobId);
    return results;
  },

  // AI Analysis simulation
  analyzeJobDescription(description: string): { essentialCriteria: string[]; desirableCriteria: string[]; keyRequirements: string[]; personSpec: string } {
    // Simulated AI extraction
    return {
      essentialCriteria: [
        'GMC registration with licence to practise',
        'Relevant clinical experience in the specialty',
        'Evidence of clinical competence',
        'Good communication skills (written and verbal)',
        'Ability to work in a multidisciplinary team',
      ],
      desirableCriteria: [
        'Higher professional qualification (MRCP/MRCS/MRCPsych)',
        'Audit or quality improvement experience',
        'Teaching or supervision experience',
        'Research or publications',
        'Management or leadership experience',
      ],
      keyRequirements: [
        'Full GMC registration required',
        'Minimum 2 years post-graduation experience',
        'Valid ALS/BLS certification',
        'Right to work in the UK or eligible for visa sponsorship',
      ],
      personSpec: 'The ideal candidate will demonstrate clinical excellence, a commitment to continuous professional development, and the ability to work effectively within a multidisciplinary team. They should show evidence of reflective practice and a patient-centred approach to care.',
    };
  },

  // AI CV Tailoring simulation
  generateTailoredCV(doctorName: string, specialty: string, jobTitle: string, jobDescription: string): { suggestedChanges: string[]; tailoredContent: string } {
    return {
      suggestedChanges: [
        `Restructure "Clinical Experience" section to lead with ${specialty} experience`,
        `Add specific examples of managing acute presentations relevant to ${jobTitle}`,
        `Highlight any audit/QIP work related to the specialty`,
        `Emphasize teamwork and MDT collaboration examples`,
        `Add a targeted personal statement referencing the specific role`,
        `Quantify patient volumes and clinical outcomes where possible`,
        `Include any relevant courses or certifications for this grade`,
      ],
      tailoredContent: `CURRICULUM VITAE — ${doctorName}\n\n` +
        `PERSONAL STATEMENT\n` +
        `I am an experienced and motivated doctor seeking the position of ${jobTitle}. ` +
        `My clinical background in ${specialty} has equipped me with comprehensive skills in patient assessment, ` +
        `acute management, and multidisciplinary team working. I am committed to delivering high-quality, ` +
        `evidence-based care and continuously improving my clinical practice.\n\n` +
        `CLINICAL EXPERIENCE\n` +
        `[Experience section restructured to highlight ${specialty}-relevant roles first]\n` +
        `• Managed [X] acute admissions per week in ${specialty}\n` +
        `• Participated in daily ward rounds and MDT meetings\n` +
        `• Conducted clinical audits leading to measurable improvements\n` +
        `• Supervised junior doctors and contributed to teaching programmes\n\n` +
        `CLINICAL GOVERNANCE\n` +
        `• Completed [audit topic] audit with [outcome]\n` +
        `• Quality improvement project: [description]\n` +
        `• Incident reporting and reflection: [example]\n\n` +
        `TEACHING & TRAINING\n` +
        `• Regular teaching sessions for medical students and junior doctors\n` +
        `• Simulation training participation\n\n` +
        `NOTE: This is a tailored framework. Admin should review with the candidate's actual data and fill in specific details.`,
    };
  },
};
