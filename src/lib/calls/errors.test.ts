import { describe, expect, it } from "vitest";
import { formatCallEError } from "./errors";

describe("CALL-E error formatting", () => {
  it("preserves useful provider details", () => {
    expect(
      formatCallEError({ detail: [{ msg: "Unsupported region AR" }] }, 422),
    ).toBe("CALL-E rejected the request (422): Unsupported region AR");
  });

  it("redacts phone numbers returned by the provider", () => {
    const message = formatCallEError(
      { message: "Recipient +12025550100 is unavailable" },
      422,
    );
    expect(message).not.toContain("+12025550100");
    expect(message).toMatch(/Recipient \+1•+00 is unavailable$/);
  });

  it("falls back to the status when no detail is available", () => {
    expect(formatCallEError(null, 500)).toBe(
      "CALL-E rejected the request (500)",
    );
  });
});
