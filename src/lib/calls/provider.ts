import "server-only";
import { formatCallEError } from "@/lib/calls/errors";
import { isE164Phone, isTrustedCallEOrigin } from "@/lib/validation";

export type FollowupCallRequest = {
  followupId: string;
  attemptNumber: number;
  patientPhone: string;
  recommendations: string[];
  webhookUrl: string;
};
export type FollowupCallResponse = {
  provider: "call-e";
  callId: string;
  status: "queued";
};

const resultSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "recommendations_followed",
    "outcome",
    "new_symptoms",
    "needs_human_review",
    "appointment_requested",
    "doctor_rating",
    "patient_comments",
  ],
  properties: {
    recommendations_followed: {
      type: "string",
      enum: ["yes", "no", "unknown"],
      description:
        "Whether the patient clearly says they followed the clinician's recommendations.",
    },
    outcome: {
      type: "string",
      enum: ["improving", "unchanged", "worsening", "unknown"],
      description:
        "How the patient describes their overall evolution. Never diagnose.",
    },
    new_symptoms: {
      type: "string",
      description:
        "New symptoms reported verbatim in a short phrase, or 'none' when none are reported.",
    },
    needs_human_review: {
      type: "string",
      enum: ["yes", "no", "unknown"],
      description:
        "Yes if symptoms are new, worsening, concerning, unclear, or the patient asks for clinical staff.",
    },
    appointment_requested: {
      type: "string",
      enum: ["yes", "no", "unknown"],
      description:
        "Whether the patient clearly asks for a new appointment or human callback.",
    },
    doctor_rating: {
      type: "string",
      enum: ["1", "2", "3", "4", "5", "unknown"],
      description:
        "Patient rating from 1 to 5, or unknown if they decline or do not answer.",
    },
    patient_comments: {
      type: "string",
      description:
        "Concise additional feedback from the patient, without invented details.",
    },
  },
} as const;

function callEConfig() {
  const apiKey = process.env.CALL_E_API_KEY ?? process.env.CALLE_API_KEY;
  if (!apiKey) throw new Error("CALL-E is not configured");
  return {
    apiKey,
    baseUrl: process.env.CALL_E_BASE_URL ?? "https://api.heycall-e.com",
    region: process.env.CALL_E_REGION ?? "MX",
    locale: process.env.CALL_E_LOCALE ?? "es-MX",
  };
}

function trustedBaseUrl(value: string) {
  if (!isTrustedCallEOrigin(value))
    throw new Error("Untrusted CALL-E API host");
  const url = new URL(value);
  return url.origin;
}

export function getCallProviderMode() {
  return process.env.CALL_PROVIDER === "call-e" ? "call-e" : "mock";
}

export async function createCallEFollowup(
  request: FollowupCallRequest,
): Promise<FollowupCallResponse> {
  const config = callEConfig();
  const baseUrl = trustedBaseUrl(config.baseUrl);
  const callLanguage = config.locale.toLowerCase().startsWith("en")
    ? "English"
    : "Spanish";
  if (!isE164Phone(request.patientPhone))
    throw new Error("Patient phone must use E.164 format, for example +549...");
  const recommendations = request.recommendations.length
    ? request.recommendations
        .map((item, index) => `${index + 1}. ${item}`)
        .join("\n")
    : "No detailed recommendations were provided; ask only about overall evolution.";
  const task = [
    `Call the patient for a post-consultation follow-up in ${callLanguage}.`,
    "At the beginning, clearly identify yourself as CareLoop AI, an automated system calling on behalf of the clinic, and ask whether it is a good time to continue.",
    "Explain that you collect patient-reported information for the care team and do not diagnose, prescribe, or provide emergency assistance.",
    `Clinician recommendations:\n${recommendations}`,
    "Ask whether the recommendations were followed, whether the patient is improving, unchanged or worsening, whether any new symptoms appeared, whether they want an appointment or staff callback, and for a 1-to-5 care rating.",
    "Do not infer medical facts. If the patient reports worsening, new symptoms, uncertainty, an emergency, or asks for clinical help, say clinic staff will review the report. For emergencies, instruct them to contact local emergency services immediately.",
  ].join("\n\n");
  const response = await fetch(`${baseUrl}/v1/calls`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `careloop-followup-${request.followupId}-${request.attemptNumber}`,
    },
    body: JSON.stringify({
      task,
      recipients: [
        {
          phones: [request.patientPhone],
          region: config.region,
          locale: config.locale,
        },
      ],
      recipient_result_schema: resultSchema,
      metadata: { application: "careloop-ai", followup_id: request.followupId },
      webhook_url: request.webhookUrl,
    }),
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!response.ok)
    throw new Error(formatCallEError(payload, response.status));
  if (
    payload?.object !== "call_task" ||
    typeof payload.id !== "string" ||
    !/^call_[A-Za-z0-9_-]+$/.test(payload.id) ||
    !["queued", "in_progress", "completed", "failed", "canceled"].includes(
      String(payload.status),
    )
  )
    throw new Error(
      "CALL-E returned an invalid acceptance response; no retry was attempted",
    );
  return {
    provider: "call-e",
    callId: payload.id,
    status: "queued",
  };
}

export async function getCallECall(callId: string) {
  const config = callEConfig();
  const response = await fetch(
    `${trustedBaseUrl(config.baseUrl)}/v1/calls/${encodeURIComponent(callId)}`,
    {
      headers: { Authorization: `Bearer ${config.apiKey}` },
      cache: "no-store",
    },
  );
  if (!response.ok)
    throw new Error(`Unable to verify CALL-E result (${response.status})`);
  return response.json() as Promise<Record<string, unknown>>;
}
