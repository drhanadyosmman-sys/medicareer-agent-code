import { describe, expect, it } from "vitest";
import { buildSupportingInfoDraft } from "./draftSupportingInfo";
import { matchCriteria, type DoctorProfile } from "./criteriaMatch";

const profile: DoctorProfile = {
  gmcStatus: "registered",
  plabStatus: "both-passed",
  ieltsOetStatus: "IELTS 7.5",
  alsBlsStatus: "ALS certified",
  yearsExperience: "6",
  internshipCompleted: true,
  currentRole: "Registrar",
  specialtyInterest: "Internal Medicine",
  careerStory: "I have worked in acute medicine for six years and enjoy teaching juniors.",
  documentCategories: ["cv", "clinical-audit"],
};

function draftFor(job: { essentialCriteria?: string[]; desirableCriteria?: string[] }) {
  const match = matchCriteria(job, profile);
  return buildSupportingInfoDraft({
    jobTitle: "Specialty Doctor in Internal Medicine",
    hospital: "Barts Health NHS Trust",
    profile: {
      fullName: "Dr Test",
      currentRole: profile.currentRole,
      specialtyInterest: profile.specialtyInterest,
      yearsExperience: profile.yearsExperience,
      careerStory: profile.careerStory,
    },
    match,
  });
}

describe("supporting-information draft", () => {
  it("includes only evidenced criteria, each backed by real evidence", () => {
    const result = draftFor({
      essentialCriteria: ["GMC registration", "ALS certification", "IELTS or OET"],
    });
    expect(result.draft).toContain("GMC registration");
    expect(result.draft).toContain("ALS certified");
    expect(result.draft).toContain("IELTS 7.5");
  });

  it("never writes prose about a gap - it lists it instead", () => {
    const result = draftFor({
      essentialCriteria: ["GMC registration", "MRCP (UK)"],
    });
    // MRCP is needs-review (not on the form), so it must not appear as a claim in the body.
    expect(result.draft).not.toContain("MRCP");
    expect(result.toVerify.join(" ")).toContain("Postgraduate qualification");
  });

  it("lists genuine gaps separately, and keeps them out of the draft body", () => {
    const bare: DoctorProfile = { gmcStatus: "", alsBlsStatus: "none", ieltsOetStatus: "not-taken" };
    const match = matchCriteria(
      { essentialCriteria: ["GMC registration", "ALS certification"] },
      bare
    );
    const result = buildSupportingInfoDraft({
      jobTitle: "Trust Grade Doctor",
      profile: {},
      match,
    });
    expect(result.gaps.length).toBe(2);
    expect(result.draft).not.toContain("ALS certified");
  });

  it("uses the doctor's own words verbatim, not a paraphrase", () => {
    const result = draftFor({ essentialCriteria: ["GMC registration"] });
    expect(result.draft).toContain(
      '"I have worked in acute medicine for six years and enjoy teaching juniors."'
    );
  });

  it("does not invent a career story when the doctor gave none", () => {
    const match = matchCriteria({ essentialCriteria: ["GMC registration"] }, profile);
    const result = buildSupportingInfoDraft({
      jobTitle: "Specialty Doctor",
      profile: { currentRole: "Registrar", careerStory: "" },
      match,
    });
    expect(result.draft).not.toContain('""');
    expect(result.draft.toLowerCase()).not.toContain("in the doctor's own words");
  });

  it("always carries a review-before-use disclaimer", () => {
    const result = draftFor({ essentialCriteria: ["GMC registration"] });
    expect(result.disclaimer).toMatch(/draft/i);
    expect(result.disclaimer).toMatch(/reviewed|confirmed|before use/i);
  });

  it("handles a job with no evidenced criteria without fabricating anything", () => {
    const result = draftFor({ essentialCriteria: ["Commitment to Trust values"] });
    // Soft criterion -> needs-review -> not in the body, flagged to verify.
    expect(result.draft).toContain("No person-specification criteria could be automatically evidenced");
    expect(result.toVerify.length).toBe(1);
  });

  it("names the actual post and hospital", () => {
    const result = draftFor({ essentialCriteria: ["GMC registration"] });
    expect(result.draft).toContain("Specialty Doctor in Internal Medicine");
    expect(result.draft).toContain("Barts Health NHS Trust");
  });
});
