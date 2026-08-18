import { describe, expect, it } from "vitest";
import { artifactFilename } from "./artifact-filename";

describe("artifactFilename", () => {
  it("creates an employer-ready CV filename", () => {
    expect(
      artifactFilename({
        candidateName: "Alex Morgan",
        company: "P&P Solutions",
        position: "Senior Information Architect / Product Designer (Enterprise)",
        type: "cv",
        extension: "pdf",
      }),
    ).toBe("Alex_Morgan_CV_P_and_P_Solutions_Senior_Information_Architect_Product_Designer_Enterprise.pdf");
  });

  it("transliterates accents and removes internal-style punctuation", () => {
    expect(
      artifactFilename({
        candidateName: "Álex Mörgan",
        company: "Dev.Pro",
        position: "Senior/Principal Product Designer - OP02142",
        type: "cover_letter",
        extension: ".PDF",
      }),
    ).toBe("Alex_Morgan_Cover_Letter_Dev_Pro_Senior_Principal_Product_Designer_OP02142.pdf");
  });
});
