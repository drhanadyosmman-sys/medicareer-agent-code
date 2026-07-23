/**
 * Criteria matching — the honest core of "tailoring an application".
 *
 * NHS shortlisting scores a written application against a written person
 * specification, criterion by criterion. This engine takes a job's criteria and
 * a doctor's ACTUAL profile, and for each criterion decides one of three things:
 *
 *   - "evidenced"    the profile clearly satisfies it, and we can point at what
 *   - "gap"          the profile clearly does NOT satisfy it
 *   - "needs-review" we cannot tell from structured data; a human must judge
 *
 * The design rule that makes this safe: it never asserts "evidenced" unless a
 * concrete profile field says so. Anything ambiguous falls to "needs-review",
 * never to "evidenced". So the output can be used to build an application that
 * only ever claims things the doctor genuinely has - it structurally cannot
 * invent experience, which is a GMC probity requirement, not a nicety.
 *
 * It is deterministic and rule-based - no AI - so it is fully testable, and any
 * later document drafting can be constrained to the criteria this marks
 * "evidenced".
 */

export interface DoctorProfile {
  gmcStatus?: string;
  plabStatus?: string;
  ieltsOetStatus?: string;
  alsBlsStatus?: string;
  yearsExperience?: string;
  specialtyInterest?: string;
  currentRole?: string;
  careerStory?: string;
  internshipCompleted?: boolean;
  nhsExperience?: boolean;
  /** Categories of documents the doctor has actually uploaded. */
  documentCategories?: string[];
}

export type CriterionStatus = "evidenced" | "gap" | "needs-review";

export interface CriterionMatch {
  criterion: string;
  kind: "essential" | "desirable";
  status: CriterionStatus;
  /** What in the doctor's profile supports it - only ever real profile data. */
  evidence?: string;
  /** Shown to the doctor when it is a gap or needs review. */
  note?: string;
}

export interface MatchReport {
  matches: CriterionMatch[];
  essentialTotal: number;
  essentialEvidenced: number;
  essentialGaps: number;
  /** Percentage of essential criteria evidenced. Undefined if there are none. */
  essentialCoverage?: number;
  /** True only when every essential criterion is evidenced (none gap/review). */
  meetsAllEssential: boolean;
}

const norm = (s: string | undefined) => (s || "").toLowerCase();

/** A profile string that indicates a real, positive status (not blank/"none"/"not taken"). */
function isPositive(value: string | undefined): boolean {
  const v = norm(value).trim();
  if (!v) return false;
  return !["none", "not-taken", "not taken", "no", "n/a", "na", "not yet", "not registered"].includes(v);
}

/**
 * Each rule recognises a family of criteria by keyword and decides its status
 * from specific profile fields. Order matters only in that the first rule whose
 * `matches` returns true wins; every criterion falls through to "needs-review"
 * if none claims it, which is the safe default.
 */
interface Rule {
  matches: (criterionLower: string) => boolean;
  evaluate: (p: DoctorProfile) => { status: CriterionStatus; evidence?: string; note?: string };
}

const hasDoc = (p: DoctorProfile, category: string) =>
  (p.documentCategories || []).includes(category);

const RULES: Rule[] = [
  // GMC registration
  {
    matches: c => c.includes("gmc") || c.includes("registration with a licence") || c.includes("licence to practise"),
    evaluate: p => {
      const g = norm(p.gmcStatus);
      if (g.includes("registered")) return { status: "evidenced", evidence: "GMC registration recorded on profile" };
      if (g.includes("progress") || g.includes("pending"))
        return { status: "needs-review", note: "GMC registration is in progress - not yet held" };
      return { status: "gap", note: "No GMC registration on file" };
    },
  },
  // PLAB
  {
    matches: c => c.includes("plab"),
    evaluate: p => {
      const s = norm(p.plabStatus);
      if (s.includes("both") || s.includes("passed") && !s.includes("plab1"))
        return { status: "evidenced", evidence: "PLAB recorded as passed" };
      if (s.includes("plab1") || s.includes("part-1") || s.includes("part 1"))
        return { status: "needs-review", note: "PLAB 1 only - PLAB 2 outstanding" };
      return { status: "gap", note: "No PLAB result on file" };
    },
  },
  // English language
  {
    matches: c => c.includes("ielts") || c.includes("oet") || c.includes("english language"),
    evaluate: p =>
      isPositive(p.ieltsOetStatus)
        ? { status: "evidenced", evidence: `English test recorded: ${p.ieltsOetStatus}` }
        : { status: "gap", note: "No IELTS/OET result on file" },
  },
  // ALS / BLS and similar life support
  {
    matches: c => c.includes("als") || c.includes("bls") || c.includes("life support") || c.includes("resuscitation"),
    evaluate: p =>
      isPositive(p.alsBlsStatus)
        ? { status: "evidenced", evidence: `Life support: ${p.alsBlsStatus}` }
        : { status: "gap", note: "No ALS/BLS certification on file" },
  },
  // Internship / foundation / post-graduation clinical experience
  {
    matches: c => c.includes("internship") || c.includes("housemanship") || c.includes("foundation"),
    evaluate: p =>
      p.internshipCompleted
        ? { status: "evidenced", evidence: "Internship recorded as completed" }
        : { status: "gap", note: "Internship not recorded as completed" },
  },
  // Audit / quality improvement
  {
    matches: c => c.includes("audit") || c.includes("quality improvement") || c.includes("qip") || c.includes("pdsa"),
    evaluate: p => {
      if (hasDoc(p, "clinical-audit") || hasDoc(p, "quality-improvement"))
        return { status: "evidenced", evidence: "Audit / QI document uploaded" };
      return { status: "needs-review", note: "No audit/QI document uploaded - confirm whether the doctor has this evidence" };
    },
  },
  // Teaching
  {
    matches: c => c.includes("teaching") || c.includes("supervision") || c.includes("education"),
    evaluate: p =>
      hasDoc(p, "teaching-experience")
        ? { status: "evidenced", evidence: "Teaching evidence uploaded" }
        : { status: "needs-review", note: "No teaching document uploaded - confirm with the doctor" },
  },
  // Research / publications
  {
    matches: c => c.includes("research") || c.includes("publication"),
    evaluate: p =>
      hasDoc(p, "research-publications")
        ? { status: "evidenced", evidence: "Research/publications document uploaded" }
        : { status: "needs-review", note: "No research/publications document uploaded - confirm with the doctor" },
  },
  // Leadership / management
  {
    matches: c => c.includes("leadership") || c.includes("management"),
    evaluate: p =>
      hasDoc(p, "leadership-evidence")
        ? { status: "evidenced", evidence: "Leadership evidence uploaded" }
        : { status: "needs-review", note: "No leadership document uploaded - confirm with the doctor" },
  },
  // Postgraduate qualifications: MRCP/MRCS/MRCPCH etc.
  {
    matches: c => /mrc[a-z]/.test(c) || c.includes("membership") || c.includes("postgraduate qualification") || c.includes("royal college"),
    evaluate: () => ({
      status: "needs-review",
      note: "Postgraduate qualification - confirm from the doctor's certificates; not inferred from the form",
    }),
  },
];

/**
 * "N years" criteria are handled separately because deciding them needs the
 * number N read from the criterion text itself.
 */
function evaluateYears(
  criterionLower: string,
  p: DoctorProfile
): { status: CriterionStatus; evidence?: string; note?: string } {
  const required = firstNumber(criterionLower);
  const held = firstNumber(p.yearsExperience);
  if (required == null) {
    return { status: "needs-review", note: `Confirm against recorded experience: ${p.yearsExperience || "not stated"}` };
  }
  if (held == null) {
    return { status: "gap", note: `Requires ${required}+ years; no experience recorded` };
  }
  if (held >= required) {
    return { status: "evidenced", evidence: `${held} years recorded, meets the ${required}-year requirement` };
  }
  return { status: "gap", note: `Requires ${required}+ years; ${held} recorded` };
}

function firstNumber(s: string | undefined): number | null {
  const m = norm(s).match(/\d+/);
  return m ? parseInt(m[0], 10) : null;
}

function evaluateCriterion(criterion: string, kind: "essential" | "desirable", p: DoctorProfile): CriterionMatch {
  const c = norm(criterion).trim();

  // Years criteria first - the generic rule below cannot read N from the text.
  if (/\d+\s*\+?\s*year/.test(c) || c.includes("years of experience") || c.includes("years post")) {
    const r = evaluateYears(c, p);
    return { criterion, kind, ...r };
  }

  for (const rule of RULES) {
    if (rule.matches(c)) {
      const r = rule.evaluate(p);
      return { criterion, kind, ...r };
    }
  }

  // Nothing recognised it. Never guess "evidenced".
  return {
    criterion,
    kind,
    status: "needs-review",
    note: "Not automatically assessable - a consultant should judge this against the doctor's documents",
  };
}

export function matchCriteria(
  job: { essentialCriteria?: string[]; desirableCriteria?: string[] },
  profile: DoctorProfile
): MatchReport {
  const matches: CriterionMatch[] = [
    ...(job.essentialCriteria || []).map(c => evaluateCriterion(c, "essential", profile)),
    ...(job.desirableCriteria || []).map(c => evaluateCriterion(c, "desirable", profile)),
  ];

  const essential = matches.filter(m => m.kind === "essential");
  const essentialEvidenced = essential.filter(m => m.status === "evidenced").length;
  const essentialGaps = essential.filter(m => m.status === "gap").length;

  return {
    matches,
    essentialTotal: essential.length,
    essentialEvidenced,
    essentialGaps,
    essentialCoverage: essential.length
      ? Math.round((essentialEvidenced / essential.length) * 100)
      : undefined,
    meetsAllEssential: essential.length > 0 && essential.every(m => m.status === "evidenced"),
  };
}
