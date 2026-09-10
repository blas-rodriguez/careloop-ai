import { describe, expect, it } from "vitest";
import {
  ageFromBirthDate,
  isE164Phone,
  isPlausibleBirthDate,
  isSafeFutureDate,
  isTrustedCallEOrigin,
  maskPhoneNumber,
} from "./validation";

describe("phone safety", () => {
  it.each(["+12025550100", "+12025550101", "+12025550102"])(
    "accepts E.164 %s",
    (phone) => expect(isE164Phone(phone)).toBe(true),
  );
  it.each([
    "12025550100",
    "+1 202 555 0100",
    "+012345678",
    "+1-202-555-0100",
  ])("rejects unsafe %s", (phone) => expect(isE164Phone(phone)).toBe(false));

  it("masks valid numbers before rendering them", () => {
    expect(maskPhoneNumber("+12025550100")).toMatch(/^\+1•+00$/);
    expect(maskPhoneNumber("not-a-phone")).toBe("Phone unavailable");
  });
});

describe("birth date safety", () => {
  const today = new Date("2026-09-08T12:00:00Z");

  it("calculates age around the birthday", () => {
    expect(ageFromBirthDate("1990-09-08", today)).toBe(36);
    expect(ageFromBirthDate("1990-09-09", today)).toBe(35);
  });

  it.each(["0189-01-01", "1900-02-30", "2027-01-01", "not-a-date"])(
    "rejects an implausible birth date %s",
    (value) => expect(isPlausibleBirthDate(value, today)).toBe(false),
  );
});

describe("date validation", () => {
  const now = new Date("2026-09-06T15:00:00-03:00");
  it("accepts a future Argentina datetime", () =>
    expect(isSafeFutureDate("2026-09-06T16:00", now)).toBe(true));
  it("rejects past and malformed values", () => {
    expect(isSafeFutureDate("2026-09-06T14:00", now)).toBe(false);
    expect(isSafeFutureDate("tomorrow", now)).toBe(false);
  });
});

describe("CALL-E origin allowlist", () => {
  it("accepts only the official HTTPS API origin", () => {
    expect(isTrustedCallEOrigin("https://api.heycall-e.com")).toBe(true);
    expect(isTrustedCallEOrigin("http://api.heycall-e.com")).toBe(false);
    expect(isTrustedCallEOrigin("https://api.heycall-e.com.evil.test")).toBe(
      false,
    );
    expect(isTrustedCallEOrigin("not-a-url")).toBe(false);
  });
});
