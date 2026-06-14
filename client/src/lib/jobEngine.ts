// Job Collection Engine - Data models, classification, and mock data

export interface CollectedJob {
  id: string;
  title: string;
  grade: string;
  specialty: string;
  subspecialty?: string;
  employer: string; // NHS Trust
  hospital?: string;
  city: string;
  region: string;
  salary: string;
  contractType: 'Permanent' | 'Fixed-term' | 'Locum';
  workPattern: 'Full-time' | 'Part-time' | 'Flexible';
  closingDate: string;
  interviewDate?: string;
  visaSponsorship: 'Yes' | 'No' | 'Not clearly stated';
  gmcRequired: 'Full registration' | 'Provisional' | 'Not specified';
  plabAccepted: 'Yes' | 'No' | 'Not specified';
  essentialCriteria: string[];
  desirableCriteria: string[];
  personSpec: string;
  jobDescription: string;
  applicationLink: string;
  source: 'NHS Jobs' | 'Trac.jobs' | 'Manual Entry' | 'Other';
  dateCollected: string;
  dateLastChecked: string;
  status: 'Active' | 'Expired' | 'Closing Soon';
  rawText?: string;
  // Classification
  pathway: 'Training' | 'Non-Training' | 'Consultant';
  pathwayDetail: string;
  gradeLevel: 'Junior' | 'Middle' | 'Senior' | 'Consultant';
  salaryBand: string;
  imgFriendly: 'Best for IMGs' | 'Suitable' | 'Not ideal';
  experienceLevel: 'Beginner-friendly' | 'Intermediate' | 'Senior';
  trainingValue: 'High' | 'Medium' | 'Low' | 'None';
  // Matching
  matchedCandidates?: { candidateId: string; score: number; name: string }[];
}

export interface JobFilter {
  specialty?: string;
  grade?: string;
  city?: string;
  region?: string;
  contractType?: string;
  visaSponsorship?: string;
  imgFriendly?: string;
  pathway?: string;
  closingSoon?: boolean;
  addedToday?: boolean;
  salaryMin?: number;
}

const DATA_KEY = 'medicareer_job_engine_v2';

// Mock collected jobs
const initialJobs: CollectedJob[] = [
  {
    id: 'job-001',
    title: 'Clinical Fellow in Acute Internal Medicine',
    grade: 'ST3-ST5 equivalent',
    specialty: 'Acute Internal Medicine',
    employer: 'Barts Health NHS Trust',
    hospital: 'The Royal London Hospital',
    city: 'London',
    region: 'London',
    salary: '55,329 - 63,152',
    contractType: 'Fixed-term',
    workPattern: 'Full-time',
    closingDate: '2026-06-28',
    interviewDate: '2026-07-10',
    visaSponsorship: 'Yes',
    gmcRequired: 'Full registration',
    plabAccepted: 'Yes',
    essentialCriteria: ['MBBS or equivalent', 'GMC registration with licence to practise', 'MRCP Part 1 (minimum)', '2+ years post-graduation experience', 'ALS certification'],
    desirableCriteria: ['MRCP Part 2', 'Audit or QIP experience', 'Teaching experience', 'Published research'],
    personSpec: 'We are looking for an enthusiastic and motivated doctor to join our Acute Medicine team. The successful candidate will have excellent clinical skills and a commitment to patient safety.',
    jobDescription: 'This is a 12-month fixed-term Clinical Fellow post in Acute Internal Medicine at The Royal London Hospital. The post holder will work as part of the acute medical take team, managing acute admissions and providing care on the acute medical unit.',
    applicationLink: 'https://www.nhsjobs.com/job/UK/London/Clinical-Fellow-AIM',
    source: 'NHS Jobs',
    dateCollected: '2026-06-14',
    dateLastChecked: '2026-06-14',
    status: 'Active',
    pathway: 'Non-Training',
    pathwayDetail: 'Senior Clinical Fellow',
    gradeLevel: 'Middle',
    salaryBand: '£55k-£65k',
    imgFriendly: 'Best for IMGs',
    experienceLevel: 'Intermediate',
    trainingValue: 'High',
  },
  {
    id: 'job-002',
    title: 'Trust Grade Doctor - Emergency Medicine',
    grade: 'SHO/Registrar equivalent',
    specialty: 'Emergency Medicine',
    employer: 'University Hospitals Birmingham NHS Foundation Trust',
    hospital: 'Queen Elizabeth Hospital',
    city: 'Birmingham',
    region: 'West Midlands',
    salary: '43,923 - 55,329',
    contractType: 'Fixed-term',
    workPattern: 'Full-time',
    closingDate: '2026-06-20',
    visaSponsorship: 'Yes',
    gmcRequired: 'Full registration',
    plabAccepted: 'Yes',
    essentialCriteria: ['MBBS or equivalent', 'GMC registration', '1+ year post-graduation', 'BLS/ALS certification', 'Good communication skills'],
    desirableCriteria: ['Emergency medicine experience', 'MCEM Part A', 'Trauma course', 'Paediatric emergency experience'],
    personSpec: 'An enthusiastic doctor to join our busy Emergency Department. Must be able to work independently and as part of a team.',
    jobDescription: 'Trust Grade Doctor post in Emergency Medicine. The post holder will work shifts in the Emergency Department managing undifferentiated patients.',
    applicationLink: 'https://www.nhsjobs.com/job/UK/Birmingham/Trust-Grade-EM',
    source: 'NHS Jobs',
    dateCollected: '2026-06-13',
    dateLastChecked: '2026-06-14',
    status: 'Closing Soon',
    pathway: 'Non-Training',
    pathwayDetail: 'Trust Grade Doctor',
    gradeLevel: 'Junior',
    salaryBand: '£43k-£55k',
    imgFriendly: 'Best for IMGs',
    experienceLevel: 'Beginner-friendly',
    trainingValue: 'Medium',
  },
  {
    id: 'job-003',
    title: 'Specialty Doctor in Psychiatry',
    grade: 'Specialty Doctor',
    specialty: 'Psychiatry',
    employer: 'South London and Maudsley NHS Foundation Trust',
    hospital: 'Maudsley Hospital',
    city: 'London',
    region: 'London',
    salary: '59,175 - 95,400',
    contractType: 'Permanent',
    workPattern: 'Full-time',
    closingDate: '2026-07-05',
    visaSponsorship: 'Yes',
    gmcRequired: 'Full registration',
    plabAccepted: 'Yes',
    essentialCriteria: ['MBBS or equivalent', 'GMC registration', 'MRCPsych or equivalent', '4+ years psychiatry experience', 'Section 12 approval (or willingness to obtain)'],
    desirableCriteria: ['Subspecialty interest', 'Research publications', 'Management experience', 'Teaching qualification'],
    personSpec: 'Experienced psychiatrist to join our community mental health team providing high-quality care to adults with complex mental health needs.',
    jobDescription: 'Substantive Specialty Doctor post in General Adult Psychiatry. The post holder will manage a caseload of patients in the community.',
    applicationLink: 'https://www.nhsjobs.com/job/UK/London/Specialty-Doctor-Psych',
    source: 'NHS Jobs',
    dateCollected: '2026-06-12',
    dateLastChecked: '2026-06-14',
    status: 'Active',
    pathway: 'Non-Training',
    pathwayDetail: 'Specialty Doctor (SAS)',
    gradeLevel: 'Senior',
    salaryBand: '£59k-£95k',
    imgFriendly: 'Suitable',
    experienceLevel: 'Senior',
    trainingValue: 'Low',
  },
  {
    id: 'job-004',
    title: 'Clinical Fellow in Paediatrics',
    grade: 'ST1-ST3 equivalent',
    specialty: 'Paediatrics',
    employer: 'Great Ormond Street Hospital NHS Foundation Trust',
    hospital: 'Great Ormond Street Hospital',
    city: 'London',
    region: 'London',
    salary: '43,923 - 55,329',
    contractType: 'Fixed-term',
    workPattern: 'Full-time',
    closingDate: '2026-06-25',
    interviewDate: '2026-07-03',
    visaSponsorship: 'Yes',
    gmcRequired: 'Full registration',
    plabAccepted: 'Yes',
    essentialCriteria: ['MBBS or equivalent', 'GMC registration', 'Paediatric experience (6+ months)', 'APLS or equivalent', 'Good communication skills'],
    desirableCriteria: ['MRCPCH Part 1', 'Neonatal experience', 'Audit experience', 'Teaching experience'],
    personSpec: 'Motivated doctor with paediatric experience to join our team. Excellent opportunity for career development.',
    jobDescription: 'Clinical Fellow post in General Paediatrics with rotations through subspecialties. Excellent training opportunities.',
    applicationLink: 'https://www.nhsjobs.com/job/UK/London/CF-Paediatrics-GOSH',
    source: 'Trac.jobs',
    dateCollected: '2026-06-14',
    dateLastChecked: '2026-06-14',
    status: 'Active',
    pathway: 'Non-Training',
    pathwayDetail: 'Junior Clinical Fellow',
    gradeLevel: 'Junior',
    salaryBand: '£43k-£55k',
    imgFriendly: 'Best for IMGs',
    experienceLevel: 'Beginner-friendly',
    trainingValue: 'High',
  },
  {
    id: 'job-005',
    title: 'Consultant Physician in Geriatric Medicine',
    grade: 'Consultant',
    specialty: 'Geriatric Medicine',
    employer: 'Leeds Teaching Hospitals NHS Trust',
    hospital: 'St James\'s University Hospital',
    city: 'Leeds',
    region: 'Yorkshire',
    salary: '105,504 - 139,882',
    contractType: 'Permanent',
    workPattern: 'Full-time',
    closingDate: '2026-07-15',
    interviewDate: '2026-07-28',
    visaSponsorship: 'Yes',
    gmcRequired: 'Full registration',
    plabAccepted: 'Not specified',
    essentialCriteria: ['CCT in Geriatric Medicine (or within 6 months)', 'GMC registration with specialist register entry', 'MRCP', 'Evidence of clinical leadership', 'Research/audit portfolio'],
    desirableCriteria: ['Subspecialty interest in falls/frailty', 'MD/PhD', 'National committee membership', 'Educational supervisor experience'],
    personSpec: 'Consultant to join our expanding Geriatric Medicine department. The successful candidate will lead a multidisciplinary team.',
    jobDescription: 'Substantive Consultant post in Geriatric Medicine with special interest opportunities. 10 PAs with SPA time for research and education.',
    applicationLink: 'https://www.nhsjobs.com/job/UK/Leeds/Consultant-Geriatrics',
    source: 'NHS Jobs',
    dateCollected: '2026-06-11',
    dateLastChecked: '2026-06-14',
    status: 'Active',
    pathway: 'Consultant',
    pathwayDetail: 'Substantive Consultant',
    gradeLevel: 'Consultant',
    salaryBand: '£105k-£140k',
    imgFriendly: 'Suitable',
    experienceLevel: 'Senior',
    trainingValue: 'None',
  },
];

function loadJobs(): CollectedJob[] {
  try {
    const stored = localStorage.getItem(DATA_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  localStorage.setItem(DATA_KEY, JSON.stringify(initialJobs));
  return initialJobs;
}

function saveJobs(jobs: CollectedJob[]) {
  localStorage.setItem(DATA_KEY, JSON.stringify(jobs));
}

export const jobEngine = {
  getAll(): CollectedJob[] {
    return loadJobs();
  },

  getById(id: string): CollectedJob | undefined {
    return loadJobs().find(j => j.id === id);
  },

  addJob(job: Omit<CollectedJob, 'id'>): CollectedJob {
    const jobs = loadJobs();
    const newJob: CollectedJob = { ...job, id: `job-${Date.now()}` };
    jobs.unshift(newJob);
    saveJobs(jobs);
    return newJob;
  },

  updateJob(id: string, updates: Partial<CollectedJob>): void {
    const jobs = loadJobs();
    const idx = jobs.findIndex(j => j.id === id);
    if (idx >= 0) {
      jobs[idx] = { ...jobs[idx], ...updates };
      saveJobs(jobs);
    }
  },

  deleteJob(id: string): void {
    const jobs = loadJobs().filter(j => j.id !== id);
    saveJobs(jobs);
  },

  filter(filters: JobFilter): CollectedJob[] {
    let jobs = loadJobs();
    if (filters.specialty) jobs = jobs.filter(j => j.specialty.toLowerCase().includes(filters.specialty!.toLowerCase()));
    if (filters.grade) jobs = jobs.filter(j => j.grade.toLowerCase().includes(filters.grade!.toLowerCase()));
    if (filters.city) jobs = jobs.filter(j => j.city.toLowerCase().includes(filters.city!.toLowerCase()));
    if (filters.region) jobs = jobs.filter(j => j.region.toLowerCase().includes(filters.region!.toLowerCase()));
    if (filters.contractType) jobs = jobs.filter(j => j.contractType === filters.contractType);
    if (filters.visaSponsorship) jobs = jobs.filter(j => j.visaSponsorship === filters.visaSponsorship);
    if (filters.imgFriendly) jobs = jobs.filter(j => j.imgFriendly === filters.imgFriendly);
    if (filters.pathway) jobs = jobs.filter(j => j.pathway === filters.pathway);
    if (filters.closingSoon) {
      const threeDays = new Date();
      threeDays.setDate(threeDays.getDate() + 3);
      jobs = jobs.filter(j => new Date(j.closingDate) <= threeDays && j.status !== 'Expired');
    }
    if (filters.addedToday) {
      const today = new Date().toISOString().split('T')[0];
      jobs = jobs.filter(j => j.dateCollected === today);
    }
    return jobs;
  },

  getStats() {
    const jobs = loadJobs();
    const today = new Date().toISOString().split('T')[0];
    const threeDays = new Date();
    threeDays.setDate(threeDays.getDate() + 3);
    return {
      total: jobs.length,
      active: jobs.filter(j => j.status === 'Active').length,
      closingSoon: jobs.filter(j => new Date(j.closingDate) <= threeDays && j.status !== 'Expired').length,
      addedToday: jobs.filter(j => j.dateCollected === today).length,
      visaFriendly: jobs.filter(j => j.visaSponsorship === 'Yes').length,
      imgFriendly: jobs.filter(j => j.imgFriendly === 'Best for IMGs').length,
      training: jobs.filter(j => j.pathway === 'Training').length,
      nonTraining: jobs.filter(j => j.pathway === 'Non-Training').length,
      consultant: jobs.filter(j => j.pathway === 'Consultant').length,
    };
  },

  // Simulate collecting a job from URL
  collectFromUrl(url: string): CollectedJob {
    // Simulated extraction
    const newJob: CollectedJob = {
      id: `job-${Date.now()}`,
      title: 'Junior Clinical Fellow - General Surgery',
      grade: 'FY2-CT2 equivalent',
      specialty: 'General Surgery',
      employer: 'Manchester University NHS Foundation Trust',
      hospital: 'Manchester Royal Infirmary',
      city: 'Manchester',
      region: 'North West',
      salary: '43,923 - 55,329',
      contractType: 'Fixed-term',
      workPattern: 'Full-time',
      closingDate: '2026-07-01',
      visaSponsorship: 'Yes',
      gmcRequired: 'Full registration',
      plabAccepted: 'Yes',
      essentialCriteria: ['MBBS or equivalent', 'GMC registration', 'Surgical experience', 'MRCS Part A (desirable)'],
      desirableCriteria: ['MRCS', 'Audit experience', 'Teaching experience'],
      personSpec: 'Enthusiastic doctor to join our surgical team.',
      jobDescription: 'Clinical Fellow post in General Surgery with on-call commitment.',
      applicationLink: url,
      source: 'NHS Jobs',
      dateCollected: new Date().toISOString().split('T')[0],
      dateLastChecked: new Date().toISOString().split('T')[0],
      status: 'Active',
      pathway: 'Non-Training',
      pathwayDetail: 'Junior Clinical Fellow',
      gradeLevel: 'Junior',
      salaryBand: '£43k-£55k',
      imgFriendly: 'Best for IMGs',
      experienceLevel: 'Beginner-friendly',
      trainingValue: 'Medium',
    };
    const jobs = loadJobs();
    jobs.unshift(newJob);
    saveJobs(jobs);
    return newJob;
  },

  // Match a job against candidates
  matchJobToCandidates(jobId: string): { candidateId: string; name: string; score: number; suitability: string }[] {
    // Simulated matching
    return [
      { candidateId: 'user-1', name: 'Dr. Ahmed Hassan', score: 87, suitability: 'Excellent Match' },
      { candidateId: 'user-2', name: 'Dr. Sarah Al-Rashid', score: 72, suitability: 'Good Match' },
    ];
  },
};
