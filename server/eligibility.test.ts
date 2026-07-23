import { describe, it, expect } from "vitest";
import { evaluateEligibility } from "./eligibility";

describe("Eligibility Engine", () => {
  it("should return eligible for UK national with GMC registration", () => {
    const result = evaluateEligibility({
      nationality: "British",
      gmcStatus: "registered",
      medicalSchool: "University of Oxford",
      internshipCompleted: true,
      ieltsOetStatus: "achieved",
    });
    expect(result.overallStatus).toBe("eligible");
    expect(result.overallScore).toBeGreaterThanOrEqual(90);
    expect(result.checks).toHaveLength(3);
  });

  it("should return not-yet-eligible for doctor with no GMC, no PLAB, no IELTS", () => {
    const result = evaluateEligibility({
      nationality: "Egyptian",
      countryOfResidence: "Egypt",
      medicalSchool: "Cairo University",
      gmcStatus: "",
      plabStatus: "",
      ieltsOetStatus: "not-taken",
      internshipCompleted: true,
    });
    expect(result.overallStatus).toBe("not-yet-eligible");
    expect(result.checks.find(c => c.category === "gmc")?.status).toBe("not-met");
    expect(result.nextSteps.length).toBeGreaterThan(0);
  });

  it("should return conditionally-eligible for doctor with PLAB1 passed", () => {
    const result = evaluateEligibility({
      nationality: "Indian",
      gmcStatus: "in-progress",
      plabStatus: "plab1-passed",
      ieltsOetStatus: "achieved",
      medicalSchool: "AIIMS Delhi",
      internshipCompleted: true,
    });
    expect(result.overallStatus).toBe("conditionally-eligible");
    expect(result.checks.find(c => c.category === "gmc")?.status).toBe("partially-met");
  });

  it("should mark visa as met for Irish nationals", () => {
    const result = evaluateEligibility({
      nationality: "Irish",
      gmcStatus: "registered",
      medicalSchool: "Trinity College Dublin",
      internshipCompleted: true,
    });
    expect(result.checks.find(c => c.category === "visa")?.status).toBe("met");
  });

  it("should mark degree as not-met when internship not completed", () => {
    const result = evaluateEligibility({
      nationality: "Pakistani",
      medicalSchool: "Aga Khan University",
      internshipCompleted: false,
      gmcStatus: "",
    });
    expect(result.checks.find(c => c.category === "degree")?.status).toBe("not-met");
  });

  it("does not grant a degree exemption by nationality", () => {
    // The GMC does not recognise degrees by where the doctor is from, so an
    // overseas graduate's degree is always verified during registration - never
    // waved through as "no verification required".
    const result = evaluateEligibility({
      nationality: "Australian",
      medicalSchool: "University of Melbourne",
      internshipCompleted: true,
      gmcStatus: "",
      plabStatus: "",
      ieltsOetStatus: "achieved",
    });
    const degree = result.checks.find(c => c.category === "degree");
    expect(degree?.status).not.toBe("met");
    expect(degree?.detail.toLowerCase()).not.toContain("no additional degree verification");
  });
});

describe("Eligibility Engine — country matching (regression)", () => {
  // These used to be false positives from substring matching: "Russian"
  // contains "us", "Ukraine" contains "uk".

  it("does not treat a Russian national as having a GMC-exempt / recognised degree", () => {
    const result = evaluateEligibility({
      nationality: "Russian",
      medicalSchool: "Moscow State University",
      internshipCompleted: true,
      gmcStatus: "",
      ieltsOetStatus: "",
    });
    const degree = result.checks.find(c => c.category === "degree");
    expect(degree?.detail.toLowerCase()).not.toContain("no additional degree verification");
    // and must still require a visa
    expect(result.checks.find(c => c.category === "visa")?.status).not.toBe("met");
  });

  it("does not treat a doctor living in Ukraine as having UK right to work", () => {
    const result = evaluateEligibility({
      nationality: "Ukrainian",
      countryOfResidence: "Ukraine",
      gmcStatus: "",
    });
    expect(result.checks.find(c => c.category === "visa")?.status).not.toBe("met");
  });

  it("does not treat a Belarusian national as GMC-exempt", () => {
    const result = evaluateEligibility({
      nationality: "Belarusian",
      medicalSchool: "Belarusian State Medical University",
      internshipCompleted: true,
      gmcStatus: "",
    });
    expect(result.checks.find(c => c.category === "visa")?.status).not.toBe("met");
  });
});

describe("Eligibility Engine — residence is not right to work (regression)", () => {
  it("does NOT grant work authorisation just because the doctor lives in the UK", () => {
    // Living in the UK on a visit or student visa is not a right to work.
    // Treating it as one sends doctors to apply for jobs that will never sponsor them.
    const result = evaluateEligibility({
      nationality: "Egyptian",
      countryOfResidence: "United Kingdom",
      gmcStatus: "registered",
      medicalSchool: "Cairo University",
      internshipCompleted: true,
    });
    const visa = result.checks.find(c => c.category === "visa");
    expect(visa?.status).not.toBe("met");
  });

  it("honours an explicit right-to-work answer over nationality", () => {
    const result = evaluateEligibility({
      nationality: "Egyptian",
      ukRightToWork: true,
      gmcStatus: "registered",
      medicalSchool: "Cairo University",
      internshipCompleted: true,
    });
    expect(result.checks.find(c => c.category === "visa")?.status).toBe("met");
  });

  it("still requires a visa for a non-UK national who has not claimed right to work", () => {
    const result = evaluateEligibility({
      nationality: "Indian",
      countryOfResidence: "India",
      gmcStatus: "registered",
    });
    expect(result.checks.find(c => c.category === "visa")?.status).toBe("partially-met");
  });
});
