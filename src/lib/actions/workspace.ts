"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  createCallEFollowup,
  getCallECall,
  getCallProviderMode,
} from "@/lib/calls/provider";
import {
  reconcileCanonicalCall,
  type CallData,
} from "@/lib/calls/reconcile";
import {
  isE164Phone,
  isPlausibleBirthDate,
  isSafeFutureDate,
} from "@/lib/validation";

function text(formData: FormData, name: string, max = 200) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

async function authenticatedClient() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) throw new Error("Unauthorized");
  return supabase;
}

function argentinaDateTime(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}:00-03:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export async function createPatient(formData: FormData) {
  const supabase = await authenticatedClient();
  const fullName = text(formData, "full_name", 120);
  const phone = text(formData, "phone", 30);
  const birthDate = text(formData, "birth_date", 10);
  const doctorId = text(formData, "doctor_id", 36);
  const consent = formData.get("consent") === "on";
  if (
    fullName.length < 3 ||
    !isE164Phone(phone) ||
    !isPlausibleBirthDate(birthDate)
  )
    redirect(
      "/patients/new?error=Use+all+required+fields+and+an+E.164+phone+such+as+%2B12025550100",
    );
  const { data, error } = await supabase
    .from("patients")
    .insert({
      full_name: fullName,
      phone,
      birth_date: birthDate,
      primary_doctor_id: doctorId || null,
      consent_to_automated_calls: consent,
      consent_recorded_at: consent ? new Date().toISOString() : null,
    })
    .select("id")
    .single();
  if (error)
    redirect(`/patients/new?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/");
  revalidatePath("/patients");
  redirect(`/patients/${data.id}`);
}

export async function updatePatient(patientId: string, formData: FormData) {
  const supabase = await authenticatedClient();
  const fullName = text(formData, "full_name", 120);
  const phone = text(formData, "phone", 30);
  const birthDate = text(formData, "birth_date", 10);
  const doctorId = text(formData, "doctor_id", 36);
  const consent = formData.get("consent") === "on";
  if (
    !patientId ||
    fullName.length < 3 ||
    !isE164Phone(phone) ||
    !isPlausibleBirthDate(birthDate)
  )
    redirect(
      `/patients/${patientId}/edit?error=Use+all+required+fields+and+an+E.164+phone+such+as+%2B12025550100`,
    );
  const { error } = await supabase
    .from("patients")
    .update({
      full_name: fullName,
      phone,
      birth_date: birthDate || null,
      primary_doctor_id: doctorId || null,
      consent_to_automated_calls: consent,
      consent_recorded_at: consent ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", patientId);
  if (error)
    redirect(
      `/patients/${patientId}/edit?error=${encodeURIComponent(error.message)}`,
    );
  revalidatePath("/");
  revalidatePath("/patients");
  revalidatePath(`/patients/${patientId}`);
  redirect(`/patients/${patientId}`);
}

export async function scheduleFollowup(formData: FormData) {
  const supabase = await authenticatedClient();
  const patientId = text(formData, "patient_id", 36);
  const scheduledInput = text(formData, "scheduled_for", 30);
  const scheduledFor = isSafeFutureDate(scheduledInput)
    ? argentinaDateTime(scheduledInput)
    : null;
  if (!patientId || !scheduledFor)
    redirect("/followups/new?error=Select+a+patient+and+valid+date");
  const { data: patient } = await supabase
    .from("patients")
    .select("consent_to_automated_calls")
    .eq("id", patientId)
    .maybeSingle();
  if (!patient?.consent_to_automated_calls)
    redirect("/followups/new?error=Automated+call+consent+is+required");
  const { data: consultation, error: consultationError } = await supabase
    .from("consultations")
    .select("id")
    .eq("patient_id", patientId)
    .order("occurred_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (consultationError || !consultation)
    redirect(
      "/followups/new?error=The+patient+needs+a+consultation+before+follow-up",
    );
  const { error } = await supabase.from("followups").insert({
    consultation_id: consultation.id,
    scheduled_for: scheduledFor,
    status: "scheduled",
  });
  if (error)
    redirect(`/followups/new?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/");
  revalidatePath("/followups");
  redirect("/followups?created=1");
}

export async function createAppointment(formData: FormData) {
  const supabase = await authenticatedClient();
  const patientId = text(formData, "patient_id", 36);
  const doctorId = text(formData, "doctor_id", 36);
  const startsInput = text(formData, "starts_at", 30);
  const startsAt = isSafeFutureDate(startsInput)
    ? argentinaDateTime(startsInput)
    : null;
  const status = text(formData, "status", 20);
  if (
    !patientId ||
    !doctorId ||
    !startsAt ||
    !["requested", "scheduled"].includes(status)
  )
    redirect("/appointments/new?error=Please+complete+all+required+fields");
  const { error } = await supabase.from("appointments").insert({
    patient_id: patientId,
    doctor_id: doctorId,
    starts_at: startsAt,
    status,
    source: "staff",
  });
  if (error)
    redirect(`/appointments/new?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/");
  revalidatePath("/appointments");
  redirect("/appointments?created=1");
}

export async function createConsultation(formData: FormData) {
  const supabase = await authenticatedClient();
  const patientId = text(formData, "patient_id", 36);
  const doctorId = text(formData, "doctor_id", 36);
  const occurredAt = argentinaDateTime(text(formData, "occurred_at", 30));
  const reason = text(formData, "reason", 240);
  const notes = text(formData, "followup_notes", 2000);
  const recommendations = text(formData, "recommendations", 3000)
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 10);
  const errorPath = `/consultations/new?patient=${patientId}`;
  if (!patientId || !doctorId || !occurredAt || reason.length < 3)
    redirect(`${errorPath}&error=Please+complete+all+required+fields`);
  const { data: consultation, error } = await supabase
    .from("consultations")
    .insert({
      patient_id: patientId,
      doctor_id: doctorId,
      occurred_at: occurredAt,
      reason,
      followup_notes: notes || null,
    })
    .select("id")
    .single();
  if (error)
    redirect(`${errorPath}&error=${encodeURIComponent(error.message)}`);
  if (recommendations.length) {
    const { error: recommendationError } = await supabase
      .from("consultation_recommendations")
      .insert(
        recommendations.map((recommendation, position) => ({
          consultation_id: consultation.id,
          recommendation,
          position,
        })),
      );
    if (recommendationError) {
      await supabase.from("consultations").delete().eq("id", consultation.id);
      redirect(
        `${errorPath}&error=${encodeURIComponent(recommendationError.message)}`,
      );
    }
  }
  revalidatePath("/");
  revalidatePath("/patients");
  revalidatePath(`/patients/${patientId}`);
  redirect(`/patients/${patientId}?consultation=created`);
}

type MockScenario = "routine" | "clinical_review" | "appointment";

const mockScenarios: Record<
  MockScenario,
  {
    recommendationsFollowed: boolean;
    outcome: "improving" | "unchanged" | "worsening";
    newSymptoms: string | null;
    needsReview: boolean;
    appointmentRequested: boolean;
    rating: number;
    comments: string;
    summary: string;
    transcript: string;
  }
> = {
  routine: {
    recommendationsFollowed: true,
    outcome: "improving",
    newSymptoms: null,
    needsReview: false,
    appointmentRequested: false,
    rating: 5,
    comments: "The recommendations were clear and helpful.",
    summary:
      "Patient reports following the care recommendations and improving, with no new warning symptoms.",
    transcript:
      "CareLoop: Were you able to follow the care recommendations?\nPatient: Yes.\nCareLoop: How are you feeling today?\nPatient: Better, with no new symptoms.",
  },
  clinical_review: {
    recommendationsFollowed: true,
    outcome: "worsening",
    newSymptoms: "New episodes of dizziness",
    needsReview: true,
    appointmentRequested: false,
    rating: 4,
    comments: "The patient would like clinical guidance about the new symptom.",
    summary:
      "Patient followed the recommendations but reports worsening and new episodes of dizziness. Human clinical review is required.",
    transcript:
      "CareLoop: How are you feeling compared with your consultation?\nPatient: A little worse, and I started feeling dizzy.\nCareLoop: Thank you. I will flag this for the clinical team to review. If this is an emergency, contact local emergency services immediately.",
  },
  appointment: {
    recommendationsFollowed: true,
    outcome: "unchanged",
    newSymptoms: null,
    needsReview: true,
    appointmentRequested: true,
    rating: 5,
    comments: "The patient requested another appointment with the care team.",
    summary:
      "Patient reports no significant change and requests a new appointment. Staff coordination is required.",
    transcript:
      "CareLoop: How are you feeling today?\nPatient: About the same. I would like another appointment.\nCareLoop: I will send your request to the clinic staff for follow-up.",
  },
};

export async function runMockCall(followupId: string, formData: FormData) {
  const supabase = await authenticatedClient();
  const { data: followup } = await supabase
    .from("followups")
    .select(
      "id, status, attempt_count, consultation:consultations(patient:patients(id, consent_to_automated_calls))",
    )
    .eq("id", followupId)
    .maybeSingle();
  const consultation = Array.isArray(followup?.consultation)
    ? followup.consultation[0]
    : followup?.consultation;
  const patientRelation = consultation?.patient;
  const patient = Array.isArray(patientRelation)
    ? patientRelation[0]
    : patientRelation;
  if (!followup || !patient?.consent_to_automated_calls)
    redirect("/followups?error=Patient+consent+is+required");
  if (!["scheduled", "failed"].includes(followup.status))
    redirect("/followups?error=This+follow-up+cannot+be+simulated");
  if (followup.attempt_count >= 5)
    redirect("/followups?error=Maximum+call+attempts+reached");
  const requestedScenario = text(formData, "mock_scenario", 30) as MockScenario;
  const scenario: MockScenario =
    requestedScenario in mockScenarios ? requestedScenario : "routine";
  const result = mockScenarios[scenario];
  const now = new Date().toISOString();
  const { data: call, error: callError } = await supabase
    .from("followup_calls")
    .insert({
      followup_id: followupId,
      provider: "mock",
      provider_call_id: `mock-${followupId}-${Date.now()}`,
      status: "completed",
      started_at: now,
      completed_at: now,
    })
    .select("id")
    .single();
  if (callError)
    redirect(`/followups?error=${encodeURIComponent(callError.message)}`);
  const { error: resultError } = await supabase.from("call_results").insert({
    call_id: call.id,
    recommendations_followed: result.recommendationsFollowed,
    outcome: result.outcome,
    new_symptoms: result.newSymptoms,
    needs_human_review: result.needsReview,
    appointment_requested: result.appointmentRequested,
    doctor_rating: result.rating,
    patient_comments: result.comments,
    summary: result.summary,
    transcript: result.transcript,
    structured_payload: {
      simulation: true,
      scenario,
      recommendations_followed: result.recommendationsFollowed,
      outcome: result.outcome,
      new_symptoms: result.newSymptoms,
      needs_human_review: result.needsReview,
      appointment_requested: result.appointmentRequested,
      doctor_rating: result.rating,
    },
  });
  if (resultError) {
    await supabase.from("followup_calls").delete().eq("id", call.id);
    redirect(`/followups?error=${encodeURIComponent(resultError.message)}`);
  }
  const { error: followupError } = await supabase
    .from("followups")
    .update({
      status: "completed",
      attempt_count: followup.attempt_count + 1,
      updated_at: now,
    })
    .eq("id", followupId);
  if (followupError)
    redirect(`/followups?error=${encodeURIComponent(followupError.message)}`);
  revalidatePath("/");
  revalidatePath("/followups");
  revalidatePath(`/patients/${patient.id}`);
  redirect(`/followups?simulated=${scenario}`);
}

export async function startFollowupCall(
  followupId: string,
  formData: FormData,
) {
  if (getCallProviderMode() === "mock")
    return runMockCall(followupId, formData);
  if (
    !(process.env.CALL_E_API_KEY ?? process.env.CALLE_API_KEY) ||
    !process.env.SUPABASE_SECRET_KEY
  )
    redirect(
      "/followups?error=Live+calling+is+blocked+until+the+CALL-E+key+and+webhook+server+credential+are+configured",
    );
  const supabase = await authenticatedClient();
  const { data: followup } = await supabase
    .from("followups")
    .select(
      "id, status, attempt_count, consultation:consultations(recommendations:consultation_recommendations(recommendation, position), patient:patients(id, phone, consent_to_automated_calls))",
    )
    .eq("id", followupId)
    .maybeSingle();
  const consultation = Array.isArray(followup?.consultation)
    ? followup.consultation[0]
    : followup?.consultation;
  const patientRelation = consultation?.patient;
  const patient = Array.isArray(patientRelation)
    ? patientRelation[0]
    : patientRelation;
  if (!followup || !patient?.consent_to_automated_calls)
    redirect("/followups?error=Patient+consent+is+required");
  if (
    !["scheduled", "failed"].includes(followup.status) ||
    followup.attempt_count >= 5
  )
    redirect("/followups?error=This+follow-up+cannot+be+started");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl?.startsWith("https://"))
    redirect("/followups?error=The+public+application+URL+is+not+configured");
  const recommendations = [...(consultation?.recommendations ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((item) => item.recommendation);
  let providerCall;
  try {
    providerCall = await createCallEFollowup({
      followupId,
      attemptNumber: followup.attempt_count + 1,
      patientPhone: patient.phone,
      recommendations,
      webhookUrl: `${appUrl.replace(/\/$/, "")}/api/call-e/webhook`,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to start CALL-E call";
    redirect(`/followups?error=${encodeURIComponent(message)}`);
  }
  const now = new Date().toISOString();
  const { error: callError } = await supabase.from("followup_calls").upsert(
    {
      followup_id: followupId,
      provider: providerCall.provider,
      provider_call_id: providerCall.callId,
      status: "queued",
    },
    { onConflict: "provider_call_id" },
  );
  if (callError)
    redirect(`/followups?error=${encodeURIComponent(callError.message)}`);
  const { error: followupError } = await supabase
    .from("followups")
    .update({
      status: "in_progress",
      attempt_count: followup.attempt_count + 1,
      updated_at: now,
    })
    .eq("id", followupId);
  if (followupError)
    redirect(`/followups?error=${encodeURIComponent(followupError.message)}`);
  revalidatePath("/");
  revalidatePath("/followups");
  revalidatePath(`/patients/${patient.id}`);
  redirect("/followups?started=1");
}

export async function refreshFollowupCall(followupId: string) {
  if (getCallProviderMode() !== "call-e")
    redirect("/followups?error=CALL-E+live+mode+is+not+active");
  const supabase = await authenticatedClient();
  const { data: call } = await supabase
    .from("followup_calls")
    .select("id, followup_id, provider_call_id, created_at")
    .eq("followup_id", followupId)
    .eq("provider", "call-e")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!call?.provider_call_id)
    redirect("/followups?error=No+CALL-E+attempt+was+found");

  let status: string;
  try {
    const canonical = (await getCallECall(call.provider_call_id)) as CallData;
    if (canonical.id !== call.provider_call_id)
      throw new Error("CALL-E returned a different call identifier");
    status = await reconcileCanonicalCall(supabase, call, canonical);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to refresh the CALL-E status";
    redirect(`/followups?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/");
  revalidatePath("/followups");
  redirect(`/followups?refreshed=${encodeURIComponent(status)}`);
}

export async function markCallReviewed(resultId: string, patientId: string) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) throw new Error("Unauthorized");
  const { error } = await supabase
    .from("call_results")
    .update({ reviewed_at: new Date().toISOString(), reviewed_by: userId })
    .eq("id", resultId)
    .eq("needs_human_review", true);
  if (error)
    redirect(
      `/patients/${patientId}?error=${encodeURIComponent(error.message)}`,
    );
  revalidatePath("/");
  revalidatePath("/followups");
  revalidatePath(`/patients/${patientId}`);
  redirect(`/patients/${patientId}?reviewed=1`);
}

export async function resetDemoWorkspace(formData: FormData) {
  const supabase = await authenticatedClient();
  if (text(formData, "confirmation", 20) !== "RESTORE_DEMO")
    redirect(
      "/settings?error=Confirm+that+the+current+workspace+may+be+replaced",
    );
  const { error } = await supabase.rpc("reset_demo_workspace");
  if (error) redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/", "layout");
  redirect("/settings?demo=restored");
}
