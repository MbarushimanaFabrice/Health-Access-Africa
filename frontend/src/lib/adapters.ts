import { formatDistanceToNow, format, startOfDay, startOfMonth, subDays, subMonths } from "date-fns";
import type {
  Admin,
  Appointment,
  AppointmentStatus,
  AppUser,
  Article,
  ArticleStatus,
  Consultation,
  ConsultationStatus,
  Doctor,
  Notification,
  NotificationType,
  Patient,
} from "@/mock/data";
import type {
  ApiAppointment,
  ApiConsultation,
  ApiHealthInfo,
  ApiNotification,
  ApiUser,
} from "./api/types";

const avatar = (seed: string) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

function splitList(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export function joinList(values: string[]): string {
  return values.join(", ");
}

export function toAppUser(u: ApiUser): AppUser {
  const base = {
    id: u.id,
    name: u.fullName,
    email: u.email,
    phone: u.phone ?? "",
    district: u.district ?? "",
    avatar: avatar(u.id),
    status: (u.isActive ? "Active" : "Inactive") as "Active" | "Inactive",
    joined: (u.createdAt ?? "").slice(0, 10),
  };

  if (u.role === "doctor") {
    const doc: Doctor = {
      ...base,
      role: "doctor",
      specialty: u.doctorProfile?.specialty ?? "",
      hospital: u.doctorProfile?.hospital ?? "",
      yearsExperience: u.doctorProfile?.yearsExperience ?? 0,
      bio: u.doctorProfile?.bio ?? "",
    };
    return doc;
  }

  if (u.role === "admin") {
    const admin: Admin = { ...base, role: "admin", title: "Administrator" };
    return admin;
  }

  const patient: Patient = {
    ...base,
    role: "patient",
    dob: u.patientProfile?.dateOfBirth?.slice(0, 10) ?? "",
    gender: (u.patientProfile?.gender as "Male" | "Female") ?? "Male",
    allergies: splitList(u.patientProfile?.allergies),
    chronicConditions: splitList(u.patientProfile?.chronicConditions),
  };
  return patient;
}

export function toDoctor(u: ApiUser): Doctor {
  return toAppUser({ ...u, role: "doctor" }) as Doctor;
}

export function toPatient(u: ApiUser): Patient {
  return toAppUser({ ...u, role: "patient" }) as Patient;
}

export function toAdmin(u: ApiUser): Admin {
  return toAppUser({ ...u, role: "admin" }) as Admin;
}

const APPOINTMENT_STATUS_MAP: Record<ApiAppointment["status"], AppointmentStatus> = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
};

export function toAppointment(a: ApiAppointment): Appointment {
  // "In Progress" has no backend Appointment enum value — it's derived from
  // the linked Consultation being in_progress while the appointment itself
  // is still confirmed, per the integration plan.
  let status: AppointmentStatus = APPOINTMENT_STATUS_MAP[a.status];
  if (a.status === "confirmed" && a.consultation?.status === "in_progress") {
    status = "In Progress";
  }

  return {
    id: a.id,
    patientId: a.patientId,
    doctorId: a.doctorId,
    date: a.appointmentDate.slice(0, 10),
    time: a.appointmentTime,
    reason: a.reason ?? "",
    status,
  };
}

const CONSULTATION_STATUS_MAP: Record<ApiConsultation["status"], ConsultationStatus> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
};

export function toConsultation(c: ApiConsultation): Consultation {
  return {
    id: c.id,
    appointmentId: c.appointmentId,
    patientId: c.appointment.patientId,
    doctorId: c.appointment.doctorId,
    date: c.appointment.appointmentDate.slice(0, 10),
    status: CONSULTATION_STATUS_MAP[c.status],
    notes: c.notes ?? "",
    videoRoomId: c.videoRoomId ?? null,
  };
}

const NOTIFICATION_TYPE_MAP: Record<string, NotificationType> = {
  appointment_booked: "Appointments",
  appointment_confirmed: "Appointments",
  appointment_cancelled: "Appointments",
  appointment_completed: "Appointments",
  video_call_started: "Appointments",
  reminder: "Reminders",
  health_info: "Health Info",
  user: "Users",
  content: "Content",
};

const NOTIFICATION_TITLE_MAP: Record<string, string> = {
  appointment_booked: "Appointment Booked",
  appointment_confirmed: "Appointment Confirmed",
  appointment_cancelled: "Appointment Cancelled",
  appointment_completed: "Appointment Completed",
  video_call_started: "Video Call Started",
  reminder: "Reminder",
  health_info: "Health Info Update",
  user: "Account Update",
  content: "Content Update",
};

export function toNotification(
  n: ApiNotification,
  audience: "patient" | "doctor" | "admin"
): Notification {
  return {
    id: n.id,
    audience,
    type: NOTIFICATION_TYPE_MAP[n.type] ?? "System",
    title: NOTIFICATION_TITLE_MAP[n.type] ?? "Notification",
    body: n.message,
    time: formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }),
    read: n.isRead,
  };
}

const ARTICLE_STATUS_MAP: Record<ApiHealthInfo["status"], ArticleStatus> = {
  draft: "Draft",
  published: "Published",
};

export function toArticle(h: ApiHealthInfo): Article {
  return {
    id: h.id,
    title: h.title,
    category: h.category ?? "General",
    excerpt: h.content.slice(0, 120),
    content: h.content,
    author: h.author?.fullName ?? "Health Access Africa",
    publishedDate: h.createdAt.slice(0, 10),
    status: ARTICLE_STATUS_MAP[h.status],
    icon: "📄",
  };
}

export type TrendRange = "Week" | "Month" | "Year";

/** Buckets a list of ISO date strings ("YYYY-MM-DD") into { name, value } points for the given range. */
export function buildCountTrend(dates: string[], range: TrendRange): { name: string; value: number }[] {
  const now = new Date();

  if (range === "Week") {
    return Array.from({ length: 7 }, (_, i) => {
      const day = startOfDay(subDays(now, 6 - i));
      const key = format(day, "yyyy-MM-dd");
      return { name: format(day, "EEE"), value: dates.filter((d) => d.startsWith(key)).length };
    });
  }

  if (range === "Month") {
    return Array.from({ length: 4 }, (_, i) => {
      const weekStart = startOfDay(subDays(now, (3 - i) * 7 + 6));
      const weekEnd = startOfDay(subDays(now, (3 - i) * 7 - 1));
      const count = dates.filter((d) => d >= format(weekStart, "yyyy-MM-dd") && d <= format(weekEnd, "yyyy-MM-dd")).length;
      return { name: `W${i + 1}`, value: count };
    });
  }

  return Array.from({ length: 7 }, (_, i) => {
    const month = startOfMonth(subMonths(now, 6 - i));
    const key = format(month, "yyyy-MM");
    return { name: format(month, "MMM"), value: dates.filter((d) => d.startsWith(key)).length };
  });
}

/** Buckets patient and doctor "joined" dates into { name, patients, doctors } points for the given range. */
export function buildUserGrowthTrend(
  patientDates: string[],
  doctorDates: string[],
  range: TrendRange
): { name: string; patients: number; doctors: number }[] {
  const patientTrend = buildCountTrend(patientDates, range);
  const doctorTrend = buildCountTrend(doctorDates, range);
  return patientTrend.map((p, i) => ({ name: p.name, patients: p.value, doctors: doctorTrend[i].value }));
}
