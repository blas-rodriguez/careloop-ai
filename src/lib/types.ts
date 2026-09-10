export type FollowupStatus = "Improving" | "Requires Review" | "Appointment Requested" | "Follow-up Completed" | "Call Failed" | "Scheduled";

export interface Patient {
  id: string; initials: string; name: string; age: number | null; phone: string;
  doctor: string; specialty: string; lastConsultation: string;
  nextFollowup: string; status: FollowupStatus;
}

export interface Activity {
  id: string; patient: string; initials: string; event: string;
  detail: string; time: string; status: FollowupStatus;
}
