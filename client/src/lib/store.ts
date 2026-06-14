// Mock data store - simulates backend database
// Designed to be easily replaceable with real API calls later

export interface User {
  id: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  name: string;
  createdAt: string;
}

export interface DoctorApplication {
  id: string;
  userId: string;
  status: 'submitted' | 'under-review' | 'cv-optimization' | 'job-matching' | 'applications-prepared' | 'interview-preparation';
  readinessScore: number;
  createdAt: string;
  updatedAt: string;
  // Step 1: Personal Details
  fullName: string;
  email: string;
  whatsapp: string;
  countryOfResidence: string;
  nationality: string;
  preferredPathway: string;
  // Step 2: Medical Background
  medicalSchool: string;
  graduationYear: string;
  internshipCompleted: boolean;
  yearsExperience: string;
  currentRole: string;
  specialtyInterest: string;
  currentCountryOfPractice: string;
  // Step 3: UK Readiness
  gmcStatus: string;
  plabStatus: string;
  ieltsOetStatus: string;
  alsBlsStatus: string;
  nhsExperience: boolean;
  previousUkApplications: boolean;
  previousInterviews: boolean;
  // Step 5: Career Story
  careerStory: string;
  voiceNoteUrl?: string;
  // Documents
  documents: DocumentFile[];
  // Messages
  messages: Message[];
  // Admin notes
  adminNotes: AdminNote[];
  // Missing documents
  missingDocuments: string[];
  // Recommended next steps
  recommendedSteps: string[];
}

export interface DocumentFile {
  id: string;
  name: string;
  type: string;
  category: 'cv' | 'passport' | 'medical-degree' | 'internship-certificate' | 'experience-certificates' | 'english-test' | 'gmc-certificate' | 'research-publications' | 'quality-improvement' | 'leadership-evidence' | 'teaching-experience' | 'clinical-audit' | 'voice-note' | 'other';
  uploadedAt: string;
  size: string;
  // Base64 data URL for actual file content (stored in localStorage)
  dataUrl?: string;
}

export interface Message {
  id: string;
  from: 'admin' | 'user';
  content: string;
  createdAt: string;
  read: boolean;
}

export interface AdminNote {
  id: string;
  content: string;
  createdAt: string;
  type: 'general' | 'cv-review' | 'supporting-info' | 'interview-prep' | 'career-assessment' | 'application-package' | 'career-plan';
}

export interface Country {
  id: string;
  name: string;
  flag: string;
  status: 'active' | 'coming-soon';
  pathways: Pathway[];
}

export interface Pathway {
  id: string;
  countryId: string;
  type: string;
  status: 'active' | 'coming-soon';
  requirements: string[];
  documentsNeeded: string[];
  applicationStages: string[];
  faqs: FAQ[];
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface PricingPackage {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  active: boolean;
  popular?: boolean;
  countryId?: string;
  pathwayId?: string;
}

// Initial mock data
const initialUsers: User[] = [
  {
    id: 'admin-1',
    email: 'admin@medicareer.com',
    password: 'admin123',
    role: 'admin',
    name: 'Admin',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-demo',
    email: 'doctor@example.com',
    password: 'doctor123',
    role: 'user',
    name: 'Dr. Ahmed Hassan',
    createdAt: '2024-06-01T00:00:00Z'
  }
];

const initialApplications: DoctorApplication[] = [
  {
    id: 'app-demo-1',
    userId: 'user-demo',
    status: 'under-review',
    readinessScore: 72,
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-10T00:00:00Z',
    fullName: 'Dr. Ahmed Hassan',
    email: 'doctor@example.com',
    whatsapp: '+201234567890',
    countryOfResidence: 'Egypt',
    nationality: 'Egyptian',
    preferredPathway: 'uk-doctors',
    medicalSchool: 'Cairo University Faculty of Medicine',
    graduationYear: '2018',
    internshipCompleted: true,
    yearsExperience: '5',
    currentRole: 'Registrar in Internal Medicine',
    specialtyInterest: 'Acute Internal Medicine',
    currentCountryOfPractice: 'Egypt',
    gmcStatus: 'Not yet registered',
    plabStatus: 'PLAB 1 Passed',
    ieltsOetStatus: 'IELTS 7.5 Overall',
    alsBlsStatus: 'BLS certified',
    nhsExperience: false,
    previousUkApplications: true,
    previousInterviews: false,
    careerStory: 'I have been practicing internal medicine for 5 years in Egypt. I am passionate about acute medicine and want to pursue my career in the NHS where I can access better training opportunities and contribute to patient care in a structured healthcare system.',
    documents: [
      { id: 'doc-1', name: 'CV_Ahmed_Hassan.pdf', type: 'application/pdf', category: 'cv', uploadedAt: '2024-06-01T00:00:00Z', size: '245 KB' },
      { id: 'doc-2', name: 'Medical_Degree.pdf', type: 'application/pdf', category: 'medical-degree', uploadedAt: '2024-06-01T00:00:00Z', size: '1.2 MB' },
      { id: 'doc-3', name: 'IELTS_Certificate.pdf', type: 'application/pdf', category: 'english-test', uploadedAt: '2024-06-01T00:00:00Z', size: '890 KB' },
    ],
    messages: [
      { id: 'msg-1', from: 'admin', content: 'Thank you for submitting your application, Dr. Hassan. Our career consultant has begun reviewing your profile and documents. We will be in touch shortly with our initial assessment.', createdAt: '2024-06-02T09:00:00Z', read: true },
      { id: 'msg-2', from: 'user', content: 'Thank you. I am eager to hear back. Should I upload any additional documents?', createdAt: '2024-06-03T14:00:00Z', read: true },
      { id: 'msg-3', from: 'admin', content: 'We noticed your GMC registration is pending. Once you have your PLAB 2 date confirmed, please upload the booking confirmation. In the meantime, we are preparing your CV optimisation notes.', createdAt: '2024-06-05T10:00:00Z', read: false },
    ],
    adminNotes: [
      { id: 'note-1', content: 'Strong candidate with good IELTS score. Needs PLAB 2 and GMC registration to be competitive. CV needs NHS-style formatting.', createdAt: '2024-06-02T09:00:00Z', type: 'general' }
    ],
    missingDocuments: ['Passport copy', 'Internship completion certificate', 'GMC registration (pending PLAB 2)', 'ALS certificate'],
    recommendedSteps: [
      'Book PLAB 2 examination',
      'Obtain ALS certification',
      'Upload passport copy',
      'Upload internship certificate',
      'Our team will optimise your CV for NHS applications'
    ]
  }
];

const initialCountries: Country[] = [
  {
    id: 'uk',
    name: 'United Kingdom',
    flag: '🇬🇧',
    status: 'active',
    pathways: [
      {
        id: 'uk-doctors',
        countryId: 'uk',
        type: 'Doctors',
        status: 'active',
        requirements: ['Medical degree', 'Internship/Housemanship', 'Clinical experience', 'English test (IELTS/OET)', 'GMC registration', 'References'],
        documentsNeeded: ['CV', 'Passport', 'Medical degree certificate', 'Internship certificate', 'Experience certificates', 'English test result', 'GMC certificate', 'References'],
        applicationStages: ['Submitted', 'Under Review', 'CV Optimization', 'Job Matching', 'Applications Prepared', 'Interview Preparation'],
        faqs: [
          { id: 'faq-1', question: 'Do I need GMC registration before applying?', answer: 'Not necessarily. Some Trust-grade and Clinical Fellow positions accept doctors who are in the process of GMC registration. However, having GMC registration significantly increases your chances.' },
          { id: 'faq-2', question: 'What IELTS score do I need?', answer: 'For GMC registration, you need an overall IELTS score of 7.5 with a minimum of 7.0 in each band. OET requires a minimum of B in all four components.' },
          { id: 'faq-3', question: 'How long does the process take?', answer: 'The timeline varies depending on your readiness. If you have GMC registration and all documents ready, we can begin matching you with suitable roles within 2-4 weeks. The full process from assessment to interview typically takes 4-12 weeks.' },
          { id: 'faq-4', question: 'Do you guarantee a job placement?', answer: 'We do not guarantee employment. We maximise your chances of being shortlisted for interviews by preparing professional, role-specific applications that match person specifications.' },
        ]
      }
    ]
  },
  { id: 'gulf', name: 'Gulf Countries', flag: '🇦🇪', status: 'coming-soon', pathways: [] },
  { id: 'australia', name: 'Australia', flag: '🇦🇺', status: 'coming-soon', pathways: [] },
  { id: 'canada', name: 'Canada', flag: '🇨🇦', status: 'coming-soon', pathways: [] },
  { id: 'ireland', name: 'Ireland', flag: '🇮🇪', status: 'coming-soon', pathways: [] },
  { id: 'germany', name: 'Germany', flag: '🇩🇪', status: 'coming-soon', pathways: [] },
  { id: 'newzealand', name: 'New Zealand', flag: '🇳🇿', status: 'coming-soon', pathways: [] }
];

const initialPackages: PricingPackage[] = [
  {
    id: 'pkg-1',
    name: 'CV & Readiness Review',
    price: 149,
    currency: 'GBP',
    features: ['Comprehensive CV assessment', 'Readiness score evaluation', 'Missing documents checklist', 'Personalised improvement recommendations', 'One follow-up consultation'],
    active: true,
    countryId: 'uk',
    pathwayId: 'uk-doctors'
  },
  {
    id: 'pkg-2',
    name: 'Full Application Preparation',
    price: 399,
    currency: 'GBP',
    features: ['Everything in CV & Readiness Review', 'NHS-style CV rewrite', 'Supporting information preparation', 'Up to 5 job applications prepared', 'Person specification matching', 'Cover letter drafting', 'Application submission guidance'],
    active: true,
    popular: true,
    countryId: 'uk',
    pathwayId: 'uk-doctors'
  },
  {
    id: 'pkg-3',
    name: 'Interview Shortlisting Support',
    price: 699,
    currency: 'GBP',
    features: ['Everything in Full Application Preparation', 'Up to 15 job applications', 'Interview preparation pack', 'Mock interview questions & model answers', 'NHS values alignment coaching', 'Presentation preparation if required', 'Post-interview debrief'],
    active: true,
    countryId: 'uk',
    pathwayId: 'uk-doctors'
  },
  {
    id: 'pkg-4',
    name: 'VIP Career Agent',
    price: 1299,
    currency: 'GBP',
    features: ['Everything in Interview Shortlisting Support', 'Unlimited job applications', 'Dedicated career consultant', 'Priority processing', 'Career roadmap planning', 'Ongoing support for 6 months', 'Relocation guidance', 'Contract review assistance'],
    active: true,
    countryId: 'uk',
    pathwayId: 'uk-doctors'
  }
];

// Store class with localStorage persistence
class DataStore {
  private readonly DATA_VERSION = 'v3'; // Bump to force re-seed on breaking changes

  constructor() {
    this.ensureSeeded();
  }

  // Ensure initial data is always seeded correctly
  private ensureSeeded(): void {
    const version = localStorage.getItem('medicareer_data_version');
    if (version !== this.DATA_VERSION) {
      // Clear old data and re-seed
      const keysToKeep = ['medicareer_currentUser'];
      const currentUser = localStorage.getItem('medicareer_currentUser');
      Object.keys(localStorage)
        .filter(k => k.startsWith('medicareer_'))
        .forEach(k => localStorage.removeItem(k));
      if (currentUser) localStorage.setItem('medicareer_currentUser', currentUser);
      localStorage.setItem('medicareer_data_version', this.DATA_VERSION);
      localStorage.setItem('medicareer_users', JSON.stringify(initialUsers));
      localStorage.setItem('medicareer_applications', JSON.stringify(initialApplications));
      localStorage.setItem('medicareer_countries', JSON.stringify(initialCountries));
      localStorage.setItem('medicareer_packages', JSON.stringify(initialPackages));
    }
  }

  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(`medicareer_${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    localStorage.setItem(`medicareer_${key}`, JSON.stringify(value));
  }

  // Users
  getUsers(): User[] {
    return this.getItem('users', initialUsers);
  }

  addUser(user: User): void {
    const users = this.getUsers();
    users.push(user);
    this.setItem('users', users);
  }

  getUserByEmail(email: string): User | undefined {
    return this.getUsers().find(u => u.email === email);
  }

  getUserById(id: string): User | undefined {
    return this.getUsers().find(u => u.id === id);
  }

  // Applications
  getApplications(): DoctorApplication[] {
    return this.getItem('applications', initialApplications);
  }

  getApplicationByUserId(userId: string): DoctorApplication | undefined {
    return this.getApplications().find(a => a.userId === userId);
  }

  getApplicationById(id: string): DoctorApplication | undefined {
    return this.getApplications().find(a => a.id === id);
  }

  addApplication(app: DoctorApplication): void {
    const apps = this.getApplications();
    apps.push(app);
    this.setItem('applications', apps);
  }

  updateApplication(id: string, updates: Partial<DoctorApplication>): void {
    const apps = this.getApplications();
    const idx = apps.findIndex(a => a.id === id);
    if (idx !== -1) {
      apps[idx] = { ...apps[idx], ...updates, updatedAt: new Date().toISOString() };
      this.setItem('applications', apps);
    }
  }

  // Countries
  getCountries(): Country[] {
    return this.getItem('countries', initialCountries);
  }

  addCountry(country: Country): void {
    const countries = this.getCountries();
    countries.push(country);
    this.setItem('countries', countries);
  }

  updateCountry(id: string, updates: Partial<Country>): void {
    const countries = this.getCountries();
    const idx = countries.findIndex(c => c.id === id);
    if (idx !== -1) {
      countries[idx] = { ...countries[idx], ...updates };
      this.setItem('countries', countries);
    }
  }

  deleteCountry(id: string): void {
    const countries = this.getCountries().filter(c => c.id !== id);
    this.setItem('countries', countries);
  }

  // Packages
  getPackages(): PricingPackage[] {
    return this.getItem('packages', initialPackages);
  }

  addPackage(pkg: PricingPackage): void {
    const packages = this.getPackages();
    packages.push(pkg);
    this.setItem('packages', packages);
  }

  updatePackage(id: string, updates: Partial<PricingPackage>): void {
    const packages = this.getPackages();
    const idx = packages.findIndex(p => p.id === id);
    if (idx !== -1) {
      packages[idx] = { ...packages[idx], ...updates };
      this.setItem('packages', packages);
    }
  }

  deletePackage(id: string): void {
    const packages = this.getPackages().filter(p => p.id !== id);
    this.setItem('packages', packages);
  }

  // Auth
  getCurrentUser(): User | null {
    return this.getItem<User | null>('currentUser', null);
  }

  setCurrentUser(user: User | null): void {
    this.setItem('currentUser', user);
  }

  login(email: string, password: string): User | null {
    const user = this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
      this.setCurrentUser(user);
      return user;
    }
    return null;
  }

  logout(): void {
    this.setCurrentUser(null);
  }

  register(name: string, email: string, password: string): User | null {
    if (this.getUserByEmail(email)) return null;
    const user: User = {
      id: `user-${Date.now()}`,
      email,
      password,
      role: 'user',
      name,
      createdAt: new Date().toISOString()
    };
    this.addUser(user);
    this.setCurrentUser(user);
    return user;
  }

  // File storage - store file data URLs separately to avoid bloating application records
  saveFileData(fileId: string, dataUrl: string): void {
    try {
      localStorage.setItem(`medicareer_file_${fileId}`, dataUrl);
    } catch (e) {
      console.warn('File storage quota exceeded, storing reference only');
    }
  }

  getFileData(fileId: string): string | null {
    return localStorage.getItem(`medicareer_file_${fileId}`);
  }

  deleteFileData(fileId: string): void {
    localStorage.removeItem(`medicareer_file_${fileId}`);
  }

  // Get unread message count for a user
  getUnreadCount(userId: string): number {
    const app = this.getApplicationByUserId(userId);
    if (!app) return 0;
    return app.messages.filter(m => m.from === 'admin' && !m.read).length;
  }

  // Get total unread messages across all applications (for admin)
  getAdminUnreadCount(): number {
    const apps = this.getApplications();
    return apps.reduce((total, app) => {
      return total + app.messages.filter(m => m.from === 'user' && !m.read).length;
    }, 0);
  }

  // Mark messages as read
  markMessagesRead(appId: string, from: 'admin' | 'user'): void {
    const apps = this.getApplications();
    const idx = apps.findIndex(a => a.id === appId);
    if (idx !== -1) {
      apps[idx].messages = apps[idx].messages.map(m =>
        m.from === from ? { ...m, read: true } : m
      );
      this.setItem('applications', apps);
    }
  }
}

export const store = new DataStore();
