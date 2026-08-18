import { describe, expect, it } from "vitest";
import { applicationSourceKey, normalizeIdentityText, sameCompanyAndPosition } from "./application-identity";

describe("application identity", () => {
  it("uses the LinkedIn job id across slug and tracking variants", () => {
    expect(applicationSourceKey("https://www.linkedin.com/jobs/view/product-lead-at-example-4452358505/?trk=feed"))
      .toBe("linkedin:4452358505");
    expect(applicationSourceKey("https://linkedin.com/jobs/view/4452358505/?refId=abc"))
      .toBe("linkedin:4452358505");
  });

  it("extracts stable identifiers from FINN and Pracuj listings", () => {
    expect(applicationSourceKey("https://www.finn.no/job/fulltime/ad.html?finnkode=123456789"))
      .toBe("finn:123456789");
    expect(applicationSourceKey("https://www.finn.no/job/ad/987654321"))
      .toBe("finn:987654321");
    expect(applicationSourceKey("https://www.pracuj.pl/praca/head-of-design-wroclaw,oferta,10012345"))
      .toBe("pracuj:10012345");
  });

  it("removes fragments, trailing slashes, and tracking parameters from fallback URLs", () => {
    expect(applicationSourceKey("https://Jobs.Example.com/opening/abc/?utm_source=linkedin&team=design#apply"))
      .toBe("url:https://jobs.example.com/opening/abc?team=design");
  });

  it("matches normalized company and position names", () => {
    expect(normalizeIdentityText("SMG – Swiss Marketplace Group")).toBe("smg swiss marketplace group");
    expect(sameCompanyAndPosition(
      { company: "Example & Co.", position: "Head of Product—Design" },
      { company: "example and co", position: "Head of Product Design" },
    )).toBe(true);
  });
});
