import { describe, expect, it } from "vitest";
import { matchCriteria, type DoctorProfile } from "./criteriaMatch";

const strongProfile: DoctorProfile = {
  gmcStatus: "registered",
  plabStatus: "both-passed",
  ieltsOetStatus: "IELTS 7.5",
  alsBlsStatus: "ALS certified",
  yearsExperience: "6",
  internshipCompleted: true,
  documentCategories: ["cv", "clinical-audit", "teaching-experience"],
};

const bareProfile: DoctorProfile = {
  gmcStatus: "",
  plabStatus: "",
  ieltsOetStatus: "not-taken",
  alsBlsStatus: "none",
  yearsExperience: "1",
  internshipCompleted: false,
  documentCategories: [],
};

describe("criteria matching — evidencing real data", () => {
  it("evidences GMC, PLAB, English, ALS and internship from a strong profile", () => {
    const r = matchCriteria(
      {
        essentialCriteria: [
          "GMC registration with a licence to practise",
          "Passed PLAB 1 and PLAB 2",
          "IELTS or OET at the required level",
          "ALS certification",
          "Completed internship (12 months)",
        ],
      },
      strongProfile
    );
    expect(r.matches.every(m => m.status === "evidenced")).toBe(true);
    expect(r.meetsAllEssential).toBe(true);
    expect(r.essentialCoverage).toBe(100);
    // evidence must reference real profile data, never be empty
    expect(r.matches.every(m => (m.evidence || "").length > 0)).toBe(true);
  });

  it("marks the same criteria as gaps for a bare profile", () => {
    const r = matchCriteria(
      {
        essentialCriteria: [
          "GMC registration with a licence to practise",
          "IELTS or OET at the required level",
          "ALS certification",
          "Completed internship (12 months)",
        ],
      },
      bareProfile
    );
    expect(r.matches.every(m => m.status === "gap")).toBe(true);
    expect(r.meetsAllEssential).toBe(false);
    expect(r.essentialCoverage).toBe(0);
  });
});

describe("criteria matching — the anti-fabrication guarantee", () => {
  it("never says 'evidenced' for a criterion it cannot tie to real data", () => {
    const r = matchCriteria(
      {
        essentialCriteria: [
          "Commitment to the Trust's values and a caring approach",
          "Excellent interpersonal and communication skills",
        ],
      },
      strongProfile
    );
    // Soft criteria with no structured evidence must not be claimed as met.
    expect(r.matches.every(m => m.status === "needs-review")).toBe(true);
    expect(r.matches.every(m => m.status !== "evidenced")).toBe(true);
  });

  it("treats postgraduate qualifications as needs-review, never inferred", () => {
    // Even a strong profile does not let us assert MRCP - it is not on the form.
    const r = matchCriteria({ essentialCriteria: ["MRCP (UK) or equivalent"] }, strongProfile);
    expect(r.matches[0].status).toBe("needs-review");
  });

  it("marks audit/teaching as needs-review when no document was uploaded", () => {
    const noDocs: DoctorProfile = { ...strongProfile, documentCategories: ["cv"] };
    const r = matchCriteria(
      { desirableCriteria: ["Evidence of clinical audit", "Teaching experience"] },
      noDocs
    );
    expect(r.matches.every(m => m.status === "needs-review")).toBe(true);
  });

  it("evidences audit/teaching only when the document is actually present", () => {
    const r = matchCriteria(
      { desirableCriteria: ["Evidence of clinical audit", "Teaching experience"] },
      strongProfile
    );
    expect(r.matches.every(m => m.status === "evidenced")).toBe(true);
  });
});

describe("criteria matching — years of experience", () => {
  it("evidences when recorded years meet the requirement", () => {
    const r = matchCriteria({ essentialCriteria: ["2+ years post-graduation experience"] }, strongProfile);
    expect(r.matches[0].status).toBe("evidenced");
    expect(r.matches[0].evidence).toContain("6");
  });

  it("marks a gap when recorded years fall short", () => {
    const r = matchCriteria(
      { essentialCriteria: ["5+ years post-graduation experience"] },
      { ...strongProfile, yearsExperience: "3" }
    );
    expect(r.matches[0].status).toBe("gap");
    expect(r.matches[0].note).toContain("5");
  });

  it("does not fabricate experience when none is recorded", () => {
    const r = matchCriteria(
      { essentialCriteria: ["2+ years post-graduation experience"] },
      { ...bareProfile, yearsExperience: "" }
    );
    expect(r.matches[0].status).toBe("gap");
  });
});

describe("criteria matching — in-progress states are not 'met'", () => {
  it("treats GMC in progress as needs-review, not evidenced", () => {
    const r = matchCriteria(
      { essentialCriteria: ["Full GMC registration"] },
      { ...strongProfile, gmcStatus: "in-progress" }
    );
    expect(r.matches[0].status).toBe("needs-review");
  });

  it("treats PLAB 1 only as needs-review, not evidenced", () => {
    const r = matchCriteria(
      { essentialCriteria: ["PLAB 1 and PLAB 2 passed"] },
      { ...strongProfile, plabStatus: "plab1-passed" }
    );
    expect(r.matches[0].status).toBe("needs-review");
  });
});

describe("match report totals", () => {
  it("counts essential coverage and ignores desirables in meetsAllEssential", () => {
    const r = matchCriteria(
      {
        essentialCriteria: ["GMC registration", "ALS certification"],
        desirableCriteria: ["Teaching experience", "MRCP"],
      },
      strongProfile
    );
    expect(r.essentialTotal).toBe(2);
    expect(r.essentialEvidenced).toBe(2);
    expect(r.meetsAllEssential).toBe(true); // desirables (incl. a needs-review MRCP) do not affect this
  });

  it("has no coverage figure when there are no essential criteria", () => {
    const r = matchCriteria({ desirableCriteria: ["Teaching experience"] }, strongProfile);
    expect(r.essentialCoverage).toBeUndefined();
    expect(r.meetsAllEssential).toBe(false);
  });
});
