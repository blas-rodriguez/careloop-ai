import { maskPhoneNumber } from "../validation";

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function detailText(value: unknown): string | null {
  const direct = text(value);
  if (direct) return direct;
  if (!Array.isArray(value)) return null;
  const messages = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      return text(record.msg) ?? text(record.message);
    })
    .filter((item): item is string => Boolean(item));
  return messages.length ? messages.join("; ") : null;
}

function redactSensitiveValues(value: string) {
  return value
    .replace(/\+[1-9]\d{7,14}/g, (phone) => maskPhoneNumber(phone))
    .slice(0, 500);
}

export function formatCallEError(payload: unknown, status: number) {
  let providerMessage: string | null = null;
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    providerMessage =
      text(record.message) ??
      detailText(record.detail) ??
      (typeof record.error === "object" && record.error
        ? text((record.error as Record<string, unknown>).message)
        : text(record.error));
  }
  const prefix = `CALL-E rejected the request (${status})`;
  return providerMessage
    ? `${prefix}: ${redactSensitiveValues(providerMessage)}`
    : prefix;
}
