/**
 * Supporting-information draft builder (Option A: templates, no AI).
 *
 * Turns a criteria match into a first-draft "supporting information" statement -
 * the free-text box NHS applications score hardest. It is assembled purely from
 * the doctor's own recorded facts and the criteria the match engine marked
 * "evidenced". It writes NOTHING about a criterion that is a gap or needs
 * review; those become an explicit checklist for the doctor instead.
 *
 * Because every sentence is stitched from real field values via fixed templates,
 * it cannot invent experience. It is deliberately plain and clearly a draft: the
 * whole point is that a human finishes it. The output carries an explicit
 * "review before use" banner so it is never mistaken for a finished document.
 *
 * No AI, no network - deterministic and fully testable.
 */

import type { CriterionMatch, MatchReport } from "./criteriaMatch";

export interface DraftProfile {
  fullName?: string;
  currentRole?: string;
  specialtyInterest?: string;
  yearsExperience?: string;
  /** The doctor's own words. Used verbatim, never paraphrased or embellished. */
  careerStory?: string;
}

export interface DraftInput {
  jobTitle: string;
  hospital?: string;
  profile: DraftProfile;
  match: MatchReport;
}

export interface SupportingInfoDraft {
  /** The draft body the consultant/doctor edits. */
  draft: string;
  /** Criteria the doctor still needs to address, taken straight from the match. */
  gaps: string[];
  /** Criteria a human must verify before the draft can claim them. */
  toVerify: string[];
  /** Always present - this is a starting point, not a finished statement. */
  disclaimer: string;
}

const DISCLAIMER =
  "DRAFT - assembled from the doctor's own recorded information. Every line must " +
  "be reviewed, edited into the doctor's voice, and confirmed with the doctor " +
  "before use. Nothing here should be submitted as-is.";

function evidencedLines(matches: CriterionMatch[]): string[] {
  return matches
    .filter(m => m.status === "evidenced" && m.evidence)
    // Present the criterion the post asked for, backed by the doctor's real evidence.
    .map(m => `- ${m.criterion}: ${m.evidence}.`);
}

export function buildSupportingInfoDraft(input: DraftInput): SupportingInfoDraft {
  const { jobTitle, hospital, profile, match } = input;

  const who =
    [profile.currentRole, profile.specialtyInterest]
      .filter(Boolean)
      .join(" in ") || "a doctor";
  const experience = profile.yearsExperience
    ? ` with ${profile.yearsExperience} years of experience`
    : "";
  const target = hospital ? `${jobTitle} at ${hospital}` : jobTitle;

  const opening = `I am applying for the post of ${target}. I am ${who}${experience}.`;

  const evidenced = evidencedLines(match.matches);
  const evidenceBlock = evidenced.length
    ? [
        "",
        "Against the person specification for this post, my application evidences:",
        ...evidenced,
      ]
    : [
        "",
        "[No person-specification criteria could be automatically evidenced from the " +
          "current profile. Add the doctor's evidence manually, or complete the gaps below first.]",
      ];

  // The doctor's own statement, used verbatim - never rewritten.
  const storyBlock = profile.careerStory?.trim()
    ? ["", "In the doctor's own words:", `"${profile.careerStory.trim()}"`]
    : [];

  const draft = [opening, ...evidenceBlock, ...storyBlock].join("\n");

  const gaps = match.matches
    .filter(m => m.status === "gap")
    .map(m => m.note || m.criterion);

  const toVerify = match.matches
    .filter(m => m.status === "needs-review")
    .map(m => m.note || m.criterion);

  return { draft, gaps, toVerify, disclaimer: DISCLAIMER };
}
