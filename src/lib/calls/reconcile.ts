import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export type CallData = {
  id: string;
  status: string;
  summary: string | null;
  failure_code: string | null;
  failure_message: string | null;
  completed_at: string | null;
  metadata: Record<string, unknown>;
  recipients: Array<{
    summary: string | null;
    structured_result: Record<string, unknown> | null;
    attempts: Array<{
      started_at: string | null;
      completed_at: string | null;
      transcript_turns: Array<{ speaker: string; text: string }>;
    }>;
  }>;
};

const cleanText = (value: unknown, max = 4000) =>
  typeof value === "string" && value.trim()
    ? value.trim().slice(0, max)
    : null;

const yes = (value: unknown) => value === "yes";
const triState = (value: unknown) =>
  value === "yes" ? true : value === "no" ? false : null;

export async function reconcileCanonicalCall(
  supabase: SupabaseClient,
  call: { id: string; followup_id: string },
  canonical: CallData,
) {
  const recipient = canonical.recipients?.[0];
  const structured = recipient?.structured_result ?? {};
  const attempt = recipient?.attempts?.at(-1);
  const transcript =
    attempt?.transcript_turns
      ?.map(
        (turn) =>
          `${turn.speaker === "bot" ? "CareLoop" : "Patient"}: ${turn.text}`,
      )
      .join("\n") || null;
  const completed = canonical.status === "completed";
  const failed = ["failed", "canceled", "cancelled"].includes(
    canonical.status,
  );

  if (completed) {
    const outcome = ["improving", "unchanged", "worsening"].includes(
      String(structured.outcome),
    )
      ? String(structured.outcome)
      : "unknown";
    const symptoms = cleanText(structured.new_symptoms, 1000);
    const hasNewSymptoms = Boolean(
      symptoms &&
        !["none", "ninguno", "ninguna", "no"].includes(
          symptoms.toLowerCase(),
        ),
    );
    const ratingValue = Number(structured.doctor_rating);
    const { error } = await supabase.from("call_results").upsert(
      {
        call_id: call.id,
        recommendations_followed: triState(
          structured.recommendations_followed,
        ),
        outcome,
        new_symptoms: hasNewSymptoms ? symptoms : null,
        needs_human_review:
          yes(structured.needs_human_review) ||
          outcome === "worsening" ||
          hasNewSymptoms,
        appointment_requested: yes(structured.appointment_requested),
        doctor_rating:
          Number.isInteger(ratingValue) &&
          ratingValue >= 1 &&
          ratingValue <= 5
            ? ratingValue
            : null,
        patient_comments: cleanText(structured.patient_comments, 2000),
        summary: cleanText(canonical.summary ?? recipient?.summary, 4000),
        transcript,
        structured_payload: structured,
      },
      { onConflict: "call_id" },
    );
    if (error) throw new Error("Unable to save the CALL-E result");
  }

  const appStatus = completed ? "completed" : failed ? "failed" : "in_progress";
  const callStatus = completed
    ? "completed"
    : failed
      ? "failed"
      : canonical.status === "queued"
        ? "queued"
        : "connected";
  const completedAt =
    completed || failed
      ? canonical.completed_at ??
        attempt?.completed_at ??
        new Date().toISOString()
      : null;
  const failureReason = failed
    ? cleanText(canonical.failure_message ?? canonical.failure_code, 1000) ??
      "CALL-E reported that the call did not complete"
    : null;

  const { error: callError } = await supabase
    .from("followup_calls")
    .update({
      status: callStatus,
      started_at: attempt?.started_at ?? null,
      completed_at: completedAt,
      failure_reason: failureReason,
    })
    .eq("id", call.id);
  if (callError) throw new Error("Unable to update the call attempt");

  const { error: followupError } = await supabase
    .from("followups")
    .update({ status: appStatus, updated_at: new Date().toISOString() })
    .eq("id", call.followup_id);
  if (followupError) throw new Error("Unable to update the follow-up");

  return appStatus;
}
