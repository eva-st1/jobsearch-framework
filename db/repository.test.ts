import { describe, expect, it } from "vitest";
import { assertApplicationStatusChangeAllowed } from "./repository";

describe("application status invariants", () => {
  it("requires mark-applied before the applied status can be recorded", () => {
    expect(() => assertApplicationStatusChangeAllowed({ appliedAt: null }, "applied"))
      .toThrow("Use mark-applied so the submitted artifact is verified and frozen.");
  });

  it("allows later workflow stages after submission has been recorded", () => {
    expect(() => assertApplicationStatusChangeAllowed({ appliedAt: new Date("2026-08-18T00:00:00Z") }, "interviewing"))
      .not.toThrow();
  });
});
