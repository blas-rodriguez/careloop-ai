import type { Activity, Patient } from "./types";

export const patients: Patient[] = [
  { id: "demo-patient-a", initials: "DA", name: "Demo Patient A", age: 34, phone: "+1 202-555-0100", doctor: "Demo Clinician A", specialty: "General Medicine", lastConsultation: "Sep 3, 2026", nextFollowup: "Today, 2:30 PM", status: "Requires Review" },
  { id: "demo-patient-b", initials: "DB", name: "Demo Patient B", age: 46, phone: "+1 202-555-0101", doctor: "Demo Clinician A", specialty: "General Medicine", lastConsultation: "Sep 4, 2026", nextFollowup: "Today, 4:00 PM", status: "Scheduled" },
  { id: "demo-patient-c", initials: "DC", name: "Demo Patient C", age: 29, phone: "+1 202-555-0102", doctor: "Demo Clinician B", specialty: "Cardiology", lastConsultation: "Sep 2, 2026", nextFollowup: "Completed today", status: "Improving" },
  { id: "demo-patient-d", initials: "DD", name: "Demo Patient D", age: 58, phone: "+1 202-555-0103", doctor: "Demo Clinician B", specialty: "Cardiology", lastConsultation: "Sep 1, 2026", nextFollowup: "Completed yesterday", status: "Appointment Requested" },
  { id: "demo-patient-e", initials: "DE", name: "Demo Patient E", age: 41, phone: "+1 202-555-0104", doctor: "Demo Clinician C", specialty: "Traumatology", lastConsultation: "Aug 31, 2026", nextFollowup: "Sep 7, 10:00 AM", status: "Call Failed" },
];

export const recentActivity: Activity[] = [
  { id: "a1", patient: "Demo Patient A", initials: "DA", event: "Symptoms need review", detail: "Synthetic scenario: reported dizziness", time: "8 min ago", status: "Requires Review" },
  { id: "a2", patient: "Demo Patient C", initials: "DC", event: "Follow-up completed", detail: "Synthetic scenario: steady improvement", time: "24 min ago", status: "Improving" },
  { id: "a3", patient: "Demo Patient D", initials: "DD", event: "Appointment requested", detail: "Synthetic scenario: requested a visit", time: "1 hour ago", status: "Appointment Requested" },
  { id: "a4", patient: "Demo Patient E", initials: "DE", event: "Call could not connect", detail: "Synthetic scenario: no call was placed", time: "2 hours ago", status: "Call Failed" },
];
