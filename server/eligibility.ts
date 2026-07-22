/**
 * NHS UK Eligibility Engine
 *
 * Evaluates a doctor's eligibility to work in the UK NHS based on real
 * regulatory requirements from:
 * - General Medical Council (GMC) registration rules
 * - UK Visa & Immigration (Health & Care Worker visa)
 * - Medical degree recognition (ECFMG/WFME/IMED standards)
 *
 * This is a rule-based engine, not AI. It returns deterministic results
 * based on the applicant's profile data.
 */

export interface EligibilityInput {
  nationality?: string;
  countryOfResidence?: string;
  medicalSchool?: string;
  graduationYear?: string;
  gmcStatus?: string;
  plabStatus?: string;
  ieltsOetStatus?: string;
  yearsExperience?: string;
  specialtyInterest?: string;
  internshipCompleted?: boolean;
  nhsExperience?: boolean;
  previousUkApplications?: boolean;
}

export interface EligibilityCheck {
  category: "visa" | "degree" | "gmc";
  title: string;
  status: "met" | "partially-met" | "not-met" | "unknown";
  detail: string;
  action?: string;
}

export interface EligibilityResult {
  overallStatus: "eligible" | "conditionally-eligible" | "not-yet-eligible";
  overallScore: number; // 0-100
  checks: EligibilityCheck[];
  summary: string;
  nextSteps: string[];
}

// Countries whose nationals have automatic right to work in the UK (no visa needed)
const UK_RIGHT_TO_WORK_COUNTRIES = [
  "united kingdom", "uk", "british", "ireland", "irish",
];

// EEA/EU nationals still need to apply but have simplified routes
const EEA_COUNTRIES = [
  "austria", "belgium", "bulgaria", "croatia", "cyprus", "czech republic",
  "denmark", "estonia", "finland", "france", "germany", "greece", "hungary",
  "iceland", "italy", "latvia", "liechtenstein", "lithuania", "luxembourg",
  "malta", "netherlands", "norway", "poland", "portugal", "romania",
  "slovakia", "slovenia", "spain", "sweden", "swiss", "switzerland",
];

// Countries with GMC-recognised primary medical qualifications (no PLAB needed)
// These are "acceptable overseas qualifications" per GMC guidance
const GMC_EXEMPT_COUNTRIES = [
  "australia", "new zealand", "canada", "united states", "usa", "us",
  "singapore", "hong kong", "south africa", "west indies",
];

export function evaluateEligibility(input: EligibilityInput): EligibilityResult {
  const checks: EligibilityCheck[] = [];
  const nextSteps: string[] = [];

  // ─── 1. VISA ELIGIBILITY ───────────────────────────────────────────────────
  const nationalityLower = (input.nationality || "").toLowerCase().trim();
  const residenceLower = (input.countryOfResidence || "").toLowerCase().trim();

  let visaCheck: EligibilityCheck;

  if (UK_RIGHT_TO_WORK_COUNTRIES.some(c => nationalityLower.includes(c) || residenceLower.includes(c))) {
    visaCheck = {
      category: "visa",
      title: "UK Work Authorisation",
      status: "met",
      detail: "As a UK/Irish national, you have automatic right to work in the UK. No visa sponsorship required.",
    };
  } else if (EEA_COUNTRIES.some(c => nationalityLower.includes(c))) {
    visaCheck = {
      category: "visa",
      title: "UK Work Authorisation",
      status: "partially-met",
      detail: "As an EEA national, you will need to apply through the UK points-based immigration system. Most NHS Trusts are licensed sponsors for the Health and Care Worker visa.",
      action: "Apply for a Health and Care Worker visa (Tier 2). NHS jobs qualify for reduced visa fees and the Immigration Health Surcharge is waived for health workers.",
    };
    nextSteps.push("Secure a job offer from a licensed NHS sponsor before applying for the Health and Care Worker visa");
  } else {
    visaCheck = {
      category: "visa",
      title: "UK Work Authorisation",
      status: "partially-met",
      detail: "International doctors require a Health and Care Worker visa (formerly Tier 2). You need a Certificate of Sponsorship (CoS) from an NHS Trust. Good news: NHS medical roles are on the Shortage Occupation List, meaning reduced fees and faster processing.",
      action: "You will need: (1) A confirmed job offer from a licensed sponsor, (2) Certificate of Sponsorship, (3) Proof of English language ability, (4) Minimum salary threshold (currently met by all NHS doctor roles).",
    };
    nextSteps.push("Obtain a job offer from an NHS Trust that holds a sponsor licence");
    nextSteps.push("Health and Care Worker visa: reduced application fee (£284) and no Immigration Health Surcharge");
  }
  checks.push(visaCheck);

  // ─── 2. MEDICAL DEGREE RECOGNITION ─────────────────────────────────────────
  let degreeCheck: EligibilityCheck;

  if (!input.medicalSchool && !input.graduationYear) {
    degreeCheck = {
      category: "degree",
      title: "Medical Degree Recognition",
      status: "unknown",
      detail: "We need your medical school and graduation year to assess degree recognition.",
      action: "Please provide your medical school name and graduation year.",
    };
    nextSteps.push("Provide medical school details for degree assessment");
  } else if (
    UK_RIGHT_TO_WORK_COUNTRIES.some(c => nationalityLower.includes(c)) ||
    GMC_EXEMPT_COUNTRIES.some(c => nationalityLower.includes(c) || (input.medicalSchool || "").toLowerCase().includes(c))
  ) {
    degreeCheck = {
      category: "degree",
      title: "Medical Degree Recognition",
      status: "met",
      detail: "Your primary medical qualification is from a GMC-recognised institution. No additional degree verification is required.",
    };
  } else if (input.internshipCompleted) {
    degreeCheck = {
      category: "degree",
      title: "Medical Degree Recognition",
      status: "partially-met",
      detail: "Your medical degree must be listed in the World Directory of Medical Schools (WDOMS). You have completed your internship, which is a requirement. Your qualification will be verified during GMC registration.",
      action: "Ensure your medical school is listed in the World Directory of Medical Schools (wdoms.org). Prepare certified copies of your degree and internship completion certificate.",
    };
  } else {
    degreeCheck = {
      category: "degree",
      title: "Medical Degree Recognition",
      status: "not-met",
      detail: "To register with the GMC, you must have completed a recognised medical degree AND a minimum of 12 months post-graduation clinical experience (internship/housemanship).",
      action: "Complete your internship/housemanship (minimum 12 months). Your medical school must be listed in the World Directory of Medical Schools.",
    };
    nextSteps.push("Complete internship/housemanship (minimum 12 months post-graduation clinical experience)");
  }
  checks.push(degreeCheck);

  // ─── 3. GMC REGISTRATION ───────────────────────────────────────────────────
  let gmcCheck: EligibilityCheck;
  const gmcLower = (input.gmcStatus || "").toLowerCase();
  const plabLower = (input.plabStatus || "").toLowerCase();
  const ieltsLower = (input.ieltsOetStatus || "").toLowerCase();

  if (gmcLower.includes("registered") || gmcLower === "registered") {
    gmcCheck = {
      category: "gmc",
      title: "GMC Registration",
      status: "met",
      detail: "You are registered with the General Medical Council. You can practise medicine in the UK. Ensure your registration remains active and you comply with revalidation requirements.",
    };
  } else if (gmcLower.includes("in-progress") || gmcLower.includes("pending")) {
    // Check sub-requirements
    const hasPlabBoth = plabLower.includes("both") || plabLower.includes("passed");
    const hasPlab1 = plabLower.includes("plab1") || plabLower.includes("part-1");
    const hasIelts = ieltsLower && !ieltsLower.includes("not-taken") && ieltsLower !== "";

    let gmcDetail = "Your GMC registration is in progress. ";
    const gmcActions: string[] = [];

    if (hasPlabBoth && hasIelts) {
      gmcCheck = {
        category: "gmc",
        title: "GMC Registration",
        status: "partially-met",
        detail: gmcDetail + "You have passed both PLAB exams and have English language evidence. Your GMC application should be progressing. Typical processing time is 4-8 weeks.",
        action: "Follow up with the GMC on your application status. Ensure all supporting documents have been submitted.",
      };
    } else {
      if (!hasPlabBoth) {
        if (hasPlab1) {
          gmcActions.push("Pass PLAB 2 (clinical examination at the GMC's assessment centre in Manchester)");
          nextSteps.push("Book and pass PLAB 2 examination");
        } else {
          gmcActions.push("Pass PLAB 1 (knowledge test) then PLAB 2 (clinical examination)");
          nextSteps.push("Register for and pass PLAB 1, then PLAB 2");
        }
      }
      if (!hasIelts) {
        gmcActions.push("Achieve required English language score: IELTS Academic (overall 7.5, minimum 7.0 in each band) OR OET (minimum B in all sub-tests)");
        nextSteps.push("Take IELTS Academic or OET and achieve the required scores");
      }

      gmcCheck = {
        category: "gmc",
        title: "GMC Registration",
        status: "partially-met",
        detail: gmcDetail + "Outstanding requirements: " + gmcActions.join("; "),
        action: gmcActions.join(". "),
      };
    }
  } else {
    // Not registered, not in progress
    const isExempt = GMC_EXEMPT_COUNTRIES.some(c => nationalityLower.includes(c));
    const hasIelts = ieltsLower && !ieltsLower.includes("not-taken") && ieltsLower !== "";
    const hasPlabBoth = plabLower.includes("both") || plabLower.includes("passed");

    let requirements: string[] = [];

    if (!isExempt && !hasPlabBoth) {
      requirements.push("Pass PLAB 1 and PLAB 2 examinations (or obtain a PLAB exemption through specialist registration)");
    }
    if (!hasIelts) {
      requirements.push("IELTS Academic (7.5 overall, 7.0 each band) or OET (B in all sub-tests)");
    }
    requirements.push("Submit GMC application with certified documents, good standing certificate, and application fee (£439)");

    gmcCheck = {
      category: "gmc",
      title: "GMC Registration",
      status: "not-met",
      detail: "You are not yet registered with the GMC. Registration is mandatory to practise medicine in the UK. Requirements: " + requirements.join("; "),
      action: requirements.join(". "),
    };

    if (!hasIelts) nextSteps.push("Achieve required IELTS/OET scores for GMC registration");
    if (!isExempt && !hasPlabBoth) nextSteps.push("Pass PLAB 1 and PLAB 2 examinations");
    nextSteps.push("Apply for GMC registration with full documentation");
  }
  checks.push(gmcCheck);

  // ─── OVERALL ASSESSMENT ────────────────────────────────────────────────────
  const metCount = checks.filter(c => c.status === "met").length;
  const partialCount = checks.filter(c => c.status === "partially-met").length;
  const notMetCount = checks.filter(c => c.status === "not-met").length;

  let overallStatus: EligibilityResult["overallStatus"];
  let overallScore: number;
  let summary: string;

  if (metCount === 3) {
    overallStatus = "eligible";
    overallScore = 95;
    summary = "You meet all core requirements to work as a doctor in the UK NHS. You are eligible to apply for NHS positions immediately.";
  } else if (notMetCount === 0) {
    overallStatus = "conditionally-eligible";
    overallScore = 50 + (metCount * 15) + (partialCount * 5);
    summary = "You are conditionally eligible. Some requirements are in progress or need attention. Complete the outstanding items to become fully eligible.";
  } else {
    overallStatus = "not-yet-eligible";
    overallScore = Math.max(10, metCount * 20 + partialCount * 10);
    summary = "You are not yet eligible to work in the UK NHS. Key requirements need to be met before you can apply. See the detailed breakdown and next steps below.";
  }

  // Add experience-based bonus
  const years = parseInt(input.yearsExperience || "0");
  if (years >= 5) overallScore = Math.min(100, overallScore + 5);

  return {
    overallStatus,
    overallScore,
    checks,
    summary,
    nextSteps: nextSteps.length > 0 ? nextSteps : ["Continue with your current application process"],
  };
}
