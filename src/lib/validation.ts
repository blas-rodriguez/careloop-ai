export const E164_PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;

export function isE164Phone(value: string) {
  return E164_PHONE_PATTERN.test(value);
}

export function maskPhoneNumber(value: string) {
  if (!isE164Phone(value)) return "Phone unavailable";
  const countryPrefixLength = value.startsWith("+1") ? 2 : 3;
  const visiblePrefix = value.slice(0, countryPrefixLength);
  const visibleSuffix = value.slice(-2);
  return `${visiblePrefix}${"•".repeat(Math.max(4, value.length - countryPrefixLength - 2))}${visibleSuffix}`;
}

export function ageFromBirthDate(value: string | null, today = new Date()) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const birth = new Date(Date.UTC(year, month - 1, day));
  if (
    birth.getUTCFullYear() !== year ||
    birth.getUTCMonth() !== month - 1 ||
    birth.getUTCDate() !== day
  )
    return null;
  let age = today.getUTCFullYear() - year;
  const birthdayHasPassed =
    today.getUTCMonth() > month - 1 ||
    (today.getUTCMonth() === month - 1 && today.getUTCDate() >= day);
  if (!birthdayHasPassed) age--;
  return age >= 0 && age <= 120 ? age : null;
}

export function isPlausibleBirthDate(value: string, today = new Date()) {
  return ageFromBirthDate(value, today) !== null;
}

export function isSafeFutureDate(value: string, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}:00-03:00`);
  return !Number.isNaN(parsed.getTime()) && parsed > now;
}

export function isTrustedCallEOrigin(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "api.heycall-e.com";
  } catch {
    return false;
  }
}
