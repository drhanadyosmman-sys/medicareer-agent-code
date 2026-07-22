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

  it("should exempt PLAB for Australian graduates", () => {
    const result = evaluateEligibility({
      nationality: "Australian",
      medicalSchool: "University of Melbourne",
      internshipCompleted: true,
      gmcStatus: "",
      plabStatus: "",
      ieltsOetStatus: "achieved",
    });
    expect(result.checks.find(c => c.category === "degree")?.status).toBe("met");
  });
});
