import { revalidatePath } from "next/cache";
import { getCallECall } from "@/lib/calls/provider";
import {
  reconcileCanonicalCall,
  type CallData,
} from "@/lib/calls/reconcile";
import { createAdminClient } from "@/lib/supabase/admin";

const eventTypes = new Set(["call.completed", "call.failed", "call.result_validation_failed"]);

export async function POST(request: Request) {
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (declaredLength > 1_000_000) return Response.json({ error: "Payload too large" }, { status: 413 });
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > 1_000_000) return Response.json({ error: "Payload too large" }, { status: 413 });
  let event: { id?: unknown; type?: unknown; data?: unknown };
  try { event = JSON.parse(raw) as typeof event; }
  catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const eventId = typeof event.id === "string" ? event.id : "";
  const eventType = typeof event.type === "string" ? event.type : "";
  const data = event.data as { id?: unknown } | null;
  const callId = typeof data?.id === "string" ? data.id : "";
  const headerEventId = request.headers.get("CALL-E-Event-Id");
  if (!/^evt_[A-Za-z0-9_-]+$/.test(eventId) || headerEventId !== eventId || !eventTypes.has(eventType) || !/^call_[A-Za-z0-9_-]+$/.test(callId))
    return Response.json({ error: "Invalid event" }, { status: 400 });
  let supabase;
  try { supabase = createAdminClient(); }
  catch { return Response.json({ error: "Receiver not configured" }, { status: 503 }); }
  const { data: existing } = await supabase.from("call_webhook_events").select("event_id").eq("event_id", eventId).maybeSingle();
  if (existing) return Response.json({ ok: true, duplicate: true });
  let canonical: CallData;
  try {
    const verified = await getCallECall(callId);
    if (verified.id !== callId) return Response.json({ error: "Call verification failed" }, { status: 400 });
    canonical = verified as unknown as CallData;
  } catch {
    return Response.json({ error: "Unable to verify provider event" }, { status: 502 });
  }
  let { data: call } = await supabase.from("followup_calls").select("id, followup_id").eq("provider", "call-e").eq("provider_call_id", callId).maybeSingle();
  const metadataFollowupId = canonical.metadata?.followup_id;
  if (
    !call &&
    canonical.metadata?.application === "careloop-ai" &&
    typeof metadataFollowupId === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(metadataFollowupId)
  ) {
    const { data: recovered } = await supabase
      .from("followup_calls")
      .upsert(
        {
          followup_id: metadataFollowupId,
          provider: "call-e",
          provider_call_id: callId,
          status: "queued",
        },
        { onConflict: "provider_call_id" },
      )
      .select("id, followup_id")
      .single();
    call = recovered;
  }
  if (!call) return Response.json({ error: "Unknown call" }, { status: 404 });
  try {
    await reconcileCanonicalCall(supabase, call, canonical);
  } catch {
    return Response.json({ error: "Unable to save result" }, { status: 500 });
  }
  const { error: eventError } = await supabase.from("call_webhook_events").insert({ event_id: eventId, provider_call_id: callId, event_type: eventType, payload: event });
  if (eventError && eventError.code !== "23505") return Response.json({ error: "Unable to record event" }, { status: 500 });
  revalidatePath("/");
  revalidatePath("/followups");
  const followupId = canonical.metadata?.followup_id;
  if (typeof followupId === "string") {
    const { data: relation } = await supabase.from("followups").select("consultation:consultations(patient_id)").eq("id", followupId).maybeSingle();
    const consultation = Array.isArray(relation?.consultation) ? relation.consultation[0] : relation?.consultation;
    if (consultation?.patient_id) revalidatePath(`/patients/${consultation.patient_id}`);
  }
  return Response.json({ ok: true });
}
