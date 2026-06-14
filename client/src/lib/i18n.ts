export type Language = 'en' | 'ar';

export const translations: Record<string, Record<string, Record<Language, string>>> = {
  // ===== COMMON =====
  common: {
    appName: { en: 'MediCareer Agent', ar: 'MediCareer Agent' },
    signIn: { en: 'Sign In', ar: 'دخول' },
    signUp: { en: 'Create Account', ar: 'إنشاء حساب' },
    signOut: { en: 'Sign Out', ar: 'تسجيل الخروج' },
    loading: { en: 'Loading...', ar: 'جاري التحميل...' },
    error: { en: 'Something went wrong', ar: 'حدث خطأ ما' },
    success: { en: 'Success', ar: 'تم بنجاح' },
    cancel: { en: 'Cancel', ar: 'إلغاء' },
    save: { en: 'Save', ar: 'حفظ' },
    delete: { en: 'Delete', ar: 'حذف' },
    edit: { en: 'Edit', ar: 'تعديل' },
    close: { en: 'Close', ar: 'إغلاق' },
    next: { en: 'Next', ar: 'التالي' },
    back: { en: 'Back', ar: 'رجوع' },
    submit: { en: 'Submit', ar: 'إرسال' },
  },

  // ===== NAVIGATION =====
  nav: {
    home: { en: 'Home', ar: 'الرئيسية' },
    pathways: { en: 'Pathways', ar: 'المسارات' },
    ukDoctorJobs: { en: 'UK Doctor Jobs', ar: 'وظائف بريطانيا' },
    pricing: { en: 'Pricing', ar: 'الأسعار' },
    signIn: { en: 'Sign In', ar: 'دخول' },
    signOut: { en: 'Sign Out', ar: 'خروج' },
    dashboard: { en: 'Dashboard', ar: 'لوحة التحكم' },
    admin: { en: 'Admin Panel', ar: 'لوحة الإدارة' },
    adminDashboard: { en: 'Admin Dashboard', ar: 'لوحة الإدارة' },
    myDashboard: { en: 'My Dashboard', ar: 'لوحتي' },
    startAssessment: { en: 'Start Assessment', ar: 'ابدأ التقييم' },
  },

  // ===== ADMIN =====
  admin: {
    applications: { en: 'Applications', ar: 'الطلبات' },
    countries: { en: 'Countries', ar: 'الدول' },
    pricingManager: { en: 'Pricing', ar: 'الأسعار' },
  },

  // ===== HOMEPAGE =====
  home: {
    badge: { en: '🇬🇧 Building UK Medical Careers', ar: '🇬🇧 نبني مسارك المهني في بريطانيا' },
    heroTitle: { en: 'We Apply to Jobs For You', ar: 'نتولى التقديم على الوظائف بدلاً منك' },
    heroSubtitle: { en: 'Focus on your medicine. We handle your UK job applications.', ar: 'ركّز على تخصصك الطبي. نحن نتولى طلبات التقديم على وظائفك في بريطانيا.' },
    heroDesc: { en: 'Upload your CV. Our team assesses your profile, identifies suitable NHS roles, tailors your applications, and guides you through interviews. You focus on medicine—we handle the rest.', ar: 'ارفع سيرتك الذاتية. فريقنا يقيّم ملفك، يحدد الوظائف المناسبة في الـ NHS، يعدّ طلبات التقديم المتخصصة، ويرشدك عبر مراحل المقابلات. أنت تركّز على الطب، ونحن نتولى الباقي.' },
    ctaButton: { en: 'Start Your Assessment', ar: 'ابدأ تقييم ملفك الآن' },
    uploadCv: { en: 'Upload Your CV', ar: 'ارفع سيرتك الذاتية' },
    noCommitment: { en: 'No upfront commitment', ar: 'بدون التزام مسبق' },
    personalConsultant: { en: 'Personal consultant', ar: 'مستشار مخصص لك' },

    // How It Works
    howItWorks: { en: 'How We Help You', ar: 'كيف نساعدك' },
    howItWorksDesc: { en: 'A clear, straightforward process designed to get you shortlisted and into interviews.', ar: 'عملية واضحة ومباشرة مصممة لضمان ترشيحك والوصول إلى المقابلات الوظيفية.' },
    step1Title: { en: 'Upload & Assess', ar: 'ارفع وقيّم' },
    step1Desc: { en: 'Submit your CV and complete our assessment. We understand your experience, qualifications, and career goals.', ar: 'أرسل سيرتك الذاتية وأكمل نموذج التقييم. نفهم خبراتك وتطلعاتك المهنية بعمق.' },
    step2Title: { en: 'Profile Review', ar: 'تحليل احترافي' },
    step2Desc: { en: 'Our team reviews your profile, identifies your strengths, and highlights areas for improvement to maximize your chances.', ar: 'فريقنا يراجع ملفك بعناية، يحدد نقاط قوتك، ويوضح الجوانب التي تحتاج تحسيناً لزيادة فرصك.' },
    step3Title: { en: 'Tailored Applications', ar: 'تجهيز التقديمات' },
    step3Desc: { en: 'We rewrite your CV, craft compelling cover letters, and prepare supporting documents tailored to each role.', ar: 'نحسّن سيرتك الذاتية، نصيغ خطابات تغطية مقنعة، ونجهّز المستندات المطلوبة لكل وظيفة.' },
    step4Title: { en: 'Interview Prep', ar: 'الاستعداد للمقابلة' },
    step4Desc: { en: 'We provide interview guidance, anticipated questions, and confidence-building strategies specific to NHS roles.', ar: 'نوفر لك إرشادات عملية، أسئلة متوقعة، ونصائح تساعدك على اجتياز المقابلة بثقة واحترافية.' },

    // Why Choose Us
    whyChooseUs: { en: 'Why Choose Us', ar: 'لماذا تختارنا' },
    whyChooseUsDesc: { en: 'We are a team of medical professionals who understand the UK system inside and out.', ar: 'فريقنا يتكون من متخصصين في المجال الطبي يفهمون النظام البريطاني بعمق.' },
    reason1Title: { en: 'Expert Knowledge', ar: 'خبرة عميقة' },
    reason1Desc: { en: 'We know exactly what NHS trusts are looking for and how to position your profile.', ar: 'نعرف بالضبط ما يبحث عنه الـ NHS، وكيف نعرض ملفك بأفضل صورة.' },
    reason2Title: { en: 'Time Saved', ar: 'توفير وقتك' },
    reason2Desc: { en: 'No more endless job searches and application forms. We find and apply to suitable roles for you.', ar: 'لا مزيد من البحث المرهق عن الوظائف. نحن نجد الفرص المناسبة ونقدم لك عليها.' },
    reason3Title: { en: 'Higher Success Rate', ar: 'نسبة نجاح أعلى' },
    reason3Desc: { en: 'Our tailored approach significantly increases your chances of being shortlisted for interviews.', ar: 'نهجنا المتخصص يزيد بشكل ملحوظ من فرصك في الترشيح للمقابلات.' },
    reason4Title: { en: 'Full Support', ar: 'دعم شامل' },
    reason4Desc: { en: 'From CV to interview, we are with you every step of the way until you secure a position.', ar: 'من السيرة الذاتية إلى المقابلة، نرافقك في كل خطوة حتى تحصل على الوظيفة.' },

    // Testimonials
    testimonialsTitle: { en: 'Success Stories', ar: 'قصص النجاح' },
    testimonialsDesc: { en: 'Hear from doctors who have secured positions through our service.', ar: 'اسمع من الأطباء الذين حصلوا على وظائفهم من خلالنا.' },
    testimonial1: { en: 'I was applying for months with no success. MediCareer Agent completely transformed my CV and within 6 weeks, I had 3 interview offers. Highly recommended.', ar: 'كنت أتقدم على الوظائف لأشهر بدون نتيجة. فريق MediCareer غيّر سيرتي الذاتية بالكامل، وفي غضون ستة أسابيع، حصلت على 3 عروض مقابلات. أنصح به بشدة.' },
    testimonial2: { en: 'The team understood exactly what I needed. They not only improved my application but also prepared me thoroughly for the interview. I got the job!', ar: 'الفريق فهم احتياجاتي بدقة. لم يحسّنوا طلبي فقط، بل جهّزوني بشكل شامل للمقابلة. حصلت على الوظيفة!' },
    testimonial3: { en: 'As an IMG, I was worried about competing with UK graduates. MediCareer Agent showed me how to highlight my unique strengths. Now I work at a leading NHS trust.', ar: 'كطبيب متخرج من الخارج، كنت قلقاً من المنافسة. فريق MediCareer علّمني كيف أبرز نقاط قوتي الفريدة. الآن أعمل في أحد أكبر مستشفيات الـ NHS.' },

    // FAQ
    faqTitle: { en: 'Frequently Asked Questions', ar: 'الأسئلة الشائعة' },
    faq1Q: { en: 'How long does the process take?', ar: 'كم من الوقت تستغرق العملية؟' },
    faq1A: { en: 'Typically 4-8 weeks from assessment to receiving interview invitations, depending on the job market and your profile.', ar: 'عادة ما بين 4 إلى 8 أسابيع من التقييم إلى استقبال دعوات المقابلات، حسب السوق وملفك.' },
    faq2Q: { en: 'Do you guarantee a job?', ar: 'هل تضمنون لي وظيفة؟' },
    faq2A: { en: 'We don\'t guarantee employment, but our tailored approach significantly increases your chances of being shortlisted and interviewed.', ar: 'لا نضمن التوظيف، لكن نهجنا المتخصص يزيد بشكل ملحوظ من فرصك في الترشيح والمقابلات.' },
    faq3Q: { en: 'What if I\'m an international medical graduate (IMG)?', ar: 'ماذا إذا كنت متخرجاً من كلية طب بالخارج؟' },
    faq3A: { en: 'We specialize in helping IMGs navigate the UK system. We understand the unique challenges and know how to position your profile effectively.', ar: 'نتخصص في مساعدة المتخرجين من الخارج. نفهم التحديات الفريدة ونعرف كيف نعرض ملفك بفعالية.' },
    faq4Q: { en: 'Can you help with specific specialties?', ar: 'هل تساعدون في تخصصات معينة؟' },
    faq4A: { en: 'Yes, we work with doctors across all specialties—from general practice to surgery, pediatrics, and beyond.', ar: 'نعم، نعمل مع أطباء من جميع التخصصات—من الطب العام إلى الجراحة وطب الأطفال وغيرها.' },
    faq5Q: { en: 'What if my qualifications aren\'t recognized?', ar: 'ماذا إذا لم يتم الاعتراف بمؤهلاتي؟' },
    faq5A: { en: 'We help you understand the recognition process and advise on additional qualifications or exams that may be needed.', ar: 'نساعدك على فهم عملية الاعتراف بالمؤهلات ونرشدك بشأن الامتحانات الإضافية المطلوبة.' },
    faq6Q: { en: 'How much does it cost?', ar: 'كم تكلفة الخدمة؟' },
    faq6A: { en: 'See our pricing page for transparent, one-time package prices. No hidden fees or recurring charges.', ar: 'انظر صفحة الأسعار لدينا للحصول على أسعار شفافة وموحدة. بدون رسوم مخفية.' },

    // CTA Final
    ctaFinalTitle: { en: 'Ready to Launch Your UK Medical Career?', ar: 'هل أنت مستعد لبدء مسيرتك الطبية في بريطانيا؟' },
    ctaFinalDesc: { en: 'Join hundreds of doctors who have successfully secured NHS positions. Start your assessment today.', ar: 'انضم إلى مئات الأطباء الذين حصلوا على وظائفهم في الـ NHS. ابدأ تقييمك اليوم.' },
    beginAssessment: { en: 'Begin Your Assessment', ar: 'ابدأ التقييم الآن' },
    learnMore: { en: 'Learn More', ar: 'تعرف على المزيد' },
  },

  // ===== UK DOCTOR JOBS PAGE =====
  ukDoctors: {
    title: { en: 'UK Doctor Jobs Pathway', ar: 'مسار الوظائف الطبية في بريطانيا' },
    subtitle: { en: 'Your guide to NHS positions and what we do to help you succeed.', ar: 'دليلك الشامل للوظائف في الـ NHS وكيف نساعدك على النجاح.' },
    eligibilityTitle: { en: 'Who Can Apply', ar: 'من يمكنه التقديم' },
    eligibilityDesc: { en: 'We help doctors at all stages of their UK career journey.', ar: 'نساعد الأطباء في جميع مراحل مسيرتهم المهنية في بريطانيا.' },
    jobType1: { en: 'Foundation Doctor (FY1/FY2)', ar: 'طبيب مؤسس (السنة الأولى والثانية)' },
    jobType1Desc: { en: 'Entry-level positions for newly qualified doctors. Typically 2-year rotational programme.', ar: 'وظائف للأطباء الجدد. برنامج تدريبي دوراني لمدة سنتين.' },
    jobType2: { en: 'Clinical Fellow', ar: 'زميل سريري' },
    jobType2Desc: { en: 'Non-training positions offering valuable NHS experience across various specialties.', ar: 'وظائف توفر خبرة قيّمة في الـ NHS عبر تخصصات متعددة.' },
    jobType3: { en: 'Trust Grade / SAS Doctor', ar: 'طبيب درجة Trust / SAS' },
    jobType3Desc: { en: 'Flexible positions with good work-life balance, ideal for experienced doctors.', ar: 'وظائف مرنة توفر توازناً جيداً بين العمل والحياة الشخصية.' },
    jobType4: { en: 'Specialty Training', ar: 'التدريب التخصصي' },
    jobType4Desc: { en: 'Competitive training posts leading to consultant positions. Requires passing the selection process.', ar: 'برامج تدريبية تنافسية تؤدي إلى وظائف استشاري. تتطلب اجتياز عملية الاختيار.' },

    whatWeDoTitle: { en: 'What We Do For You', ar: 'ما نقدمه لك' },
    whatWeDo1: { en: 'Profile Assessment', ar: 'تقييم ملفك' },
    whatWeDo1Desc: { en: 'We analyze your qualifications, experience, and career goals to identify the best opportunities.', ar: 'نحلل مؤهلاتك وخبراتك وأهدافك لتحديد أفضل الفرص المناسبة.' },
    whatWeDo2: { en: 'Job Matching', ar: 'مطابقة الوظائف' },
    whatWeDo2Desc: { en: 'We find NHS roles that align with your skills and career aspirations.', ar: 'نجد وظائف في الـ NHS تتناسب مع مهاراتك وطموحاتك.' },
    whatWeDo3: { en: 'Application Preparation', ar: 'تجهيز الطلبات' },
    whatWeDo3Desc: { en: 'We tailor your CV, cover letter, and supporting information for each application.', ar: 'نخصص سيرتك الذاتية وخطاب التغطية والمستندات لكل طلب.' },
    whatWeDo4: { en: 'Interview Coaching', ar: 'تدريب المقابلات' },
    whatWeDo4Desc: { en: 'We prepare you with likely questions, scenarios, and strategies to succeed in interviews.', ar: 'نجهّزك بالأسئلة المتوقعة والسيناريوهات والاستراتيجيات للنجاح.' },

    requirementsTitle: { en: 'Key Requirements', ar: 'المتطلبات الأساسية' },
    req1: { en: 'Medical degree (recognized by GMC or in process of recognition)', ar: 'درجة طبية معترف بها من قبل GMC أو قيد الاعتراف' },
    req2: { en: 'English language proficiency (IELTS/OET if required)', ar: 'إجادة اللغة الإنجليزية (IELTS/OET إذا لزم الأمر)' },
    req3: { en: 'Valid visa/right to work in the UK', ar: 'تأشيرة صحيحة أو حق العمل في بريطانيا' },
    req4: { en: 'GMC registration (or eligible to register)', ar: 'تسجيل في الـ GMC (أو مؤهل للتسجيل)' },
  },

  // ===== PATHWAYS PAGE =====
  pathways: {
    title: { en: 'Career Pathways', ar: 'مسارات المهنة' },
    subtitle: { en: 'Choose your journey. We guide you through every step.', ar: 'اختر مسارك. نرشدك عبر كل خطوة.' },
    journey1: { en: 'UK Training Posts', ar: 'برامج التدريب في بريطانيا' },
    journey1Desc: { en: 'Foundation, specialty training, and structured career progression towards consultant positions.', ar: 'برامج تدريبية منظمة تؤدي إلى وظائف استشاري وتقدم وظيفي مستقر.' },
    journey2: { en: 'UK NHS Jobs', ar: 'الوظائف في الـ NHS' },
    journey2Desc: { en: 'Immediate NHS positions including clinical fellow, trust grade, and specialty doctor roles.', ar: 'وظائف فورية في الـ NHS تشمل زميل سريري وطبيب درجة Trust وغيرها.' },
  },

  // ===== PRICING PAGE =====
  pricing: {
    title: { en: 'Transparent Pricing', ar: 'أسعار شفافة' },
    subtitle: { en: 'Choose the package that matches your needs. All packages include personalized support from our team.', ar: 'اختر الباقة المناسبة لك. جميع الباقات تشمل دعماً شخصياً من فريقنا.' },
    expertResumeTitle: { en: 'Expert Resume Writing Service', ar: 'خدمة كتابة السيرة الذاتية الاحترافية' },
    expertResumeDesc: { en: '1-on-1 session with our career consultant to review and optimize your CV for NHS applications.', ar: 'جلسة فردية مع مستشارنا لمراجعة وتحسين سيرتك الذاتية لطلبات الـ NHS.' },
    includedInAll: { en: 'Included in all packages', ar: 'مشمول في جميع الباقات' },
    whatIncluded: { en: 'What Every Application Includes', ar: 'ما يشمله كل طلب' },
    personalConsultantTitle: { en: 'Personal Consultant', ar: 'مستشار شخصي' },
    personalConsultantDesc: { en: 'A dedicated consultant reviews your profile and manages your applications', ar: 'مستشار مخصص يراجع ملفك ويدير طلباتك' },
    expertReviewTitle: { en: 'Expert Resume Review', ar: 'مراجعة احترافية للسيرة الذاتية' },
    expertReviewDesc: { en: '1-on-1 session to review and optimize your CV in NHS format', ar: 'جلسة فردية لمراجعة وتحسين سيرتك الذاتية بصيغة الـ NHS' },
    tailoredAppsTitle: { en: 'Tailored Applications', ar: 'طلبات مخصصة' },
    tailoredAppsDesc: { en: 'Every application tailored to the specific job\'s requirements', ar: 'كل طلب مخصص لمتطلبات الوظيفة المحددة' },
    getStarted: { en: 'Get Started', ar: 'ابدأ الآن' },
  },

  // ===== LOGIN PAGE =====
  login: {
    title: { en: 'Welcome Back', ar: 'أهلاً بعودتك' },
    subtitle: { en: 'Sign in to access your dashboard', ar: 'سجّل دخولك للوصول إلى لوحة التحكم' },
    email: { en: 'Email Address', ar: 'عنوان البريد الإلكتروني' },
    password: { en: 'Password', ar: 'كلمة المرور' },
    signInBtn: { en: 'Sign In', ar: 'دخول' },
    noAccount: { en: 'Don\'t have an account?', ar: 'ليس لديك حساب؟' },
    createOne: { en: 'Create one', ar: 'أنشئ واحداً' },
    demoAccounts: { en: 'Demo Accounts — Click to fill', ar: 'حسابات تجريبية — اضغط للملء' },
    admin: { en: 'Admin', ar: 'مسؤول' },
    doctor: { en: 'Doctor', ar: 'طبيب' },
  },

  // ===== APPLY/ONBOARDING =====
  apply: {
    title: { en: 'Doctor Assessment Form', ar: 'نموذج تقييم الطبيب' },
    subtitle: { en: 'Help us understand your profile so we can find the best opportunities for you.', ar: 'ساعدنا على فهم ملفك حتى نجد لك أفضل الفرص المتاحة.' },
    step1Title: { en: 'Personal Details', ar: 'البيانات الشخصية' },
    step2Title: { en: 'Medical Background', ar: 'الخلفية الطبية' },
    step3Title: { en: 'UK Readiness', ar: 'الاستعداد للعمل في بريطانيا' },
    step4Title: { en: 'Upload Documents', ar: 'رفع المستندات' },
    step5Title: { en: 'Your Story', ar: 'قصتك المهنية' },
    step6Title: { en: 'Consent & Confirmation', ar: 'الموافقة والتأكيد' },
    preferredLanguage: { en: 'Preferred Language', ar: 'اللغة المفضلة' },
    english: { en: 'English', ar: 'الإنجليزية' },
    arabic: { en: 'العربية', ar: 'العربية' },
    submitBtn: { en: 'Submit Assessment', ar: 'إرسال التقييم' },
    previous: { en: 'Previous', ar: 'السابق' },
    nextStep: { en: 'Next Step', ar: 'التالي' },
    successMsg: { en: 'Assessment submitted! Our team will review your profile and contact you within 48 hours.', ar: 'تم إرسال التقييم بنجاح! سيراجع فريقنا ملفك ويتواصل معك خلال 48 ساعة.' },
  },

  // ===== DASHBOARD =====
  dashboard: {
    welcomeBack: { en: 'Welcome back', ar: 'أهلاً بعودتك' },
    readinessScore: { en: 'Readiness Score', ar: 'درجة الاستعداد' },
    applicationStage: { en: 'Application Stage', ar: 'مرحلة التقديم' },
    messages: { en: 'Messages', ar: 'الرسائل' },
    documents: { en: 'Your Documents', ar: 'مستنداتك' },
    bookResumeReview: { en: 'Book Resume Review Session', ar: 'احجز جلسة مراجعة السيرة الذاتية' },
    applicationsSubmitted: { en: 'Applications Submitted', ar: 'الطلبات المقدمة' },
    nextSteps: { en: 'Recommended Next Steps', ar: 'الخطوات التالية الموصى بها' },
  },

  // ===== FOOTER =====
  footer: {
    description: { en: 'Professional medical career support. We help doctors secure positions in the UK healthcare system.', ar: 'دعم مهني لمسيرتك الطبية في بريطانيا. نساعدك على الحصول على وظيفة في نظام الـ NHS.' },
    services: { en: 'Services', ar: 'الخدمات' },
    resources: { en: 'Resources', ar: 'الموارد' },
    contact: { en: 'Contact', ar: 'تواصل معنا' },
    copyright: { en: '© 2026 MediCareer Agent. All rights reserved.', ar: '© 2026 MediCareer Agent. جميع الحقوق محفوظة.' },
  },
};

export function t(key: string, lang: Language): string {
  const keys = key.split('.');
  let value: any = translations;
  for (const k of keys) {
    value = value?.[k];
  }
  if (value && typeof value === 'object' && 'en' in value) {
    return value[lang] || value.en || key;
  }
  return key;
}
