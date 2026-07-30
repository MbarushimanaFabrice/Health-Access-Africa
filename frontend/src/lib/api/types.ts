// Raw backend response shapes (snake-free, matching Prisma select/include shapes).

export interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiDoctorProfile {
  id: string;
  userId: string;
  specialty: string | null;
  hospital: string | null;
  bio: string | null;
  yearsExperience: number | null;
}

export interface ApiPatientProfile {
  id: string;
  userId: string;
  dateOfBirth: string | null;
  gender: string | null;
  allergies: string | null;
  chronicConditions: string | null;
  notes: string | null;
}

export interface ApiUser {
  id: string;
  fullName: string;
  email: string;
  role: "patient" | "doctor" | "admin";
  phone: string | null;
  district: string | null;
  isActive: boolean;
  mustChangePassword?: boolean;
  createdAt: string;
  updatedAt?: string;
  doctorProfile?: ApiDoctorProfile | null;
  patientProfile?: ApiPatientProfile | null;
}

export interface ApiConsultationSummary {
  id: string;
  appointmentId: string;
  /** Absent on endpoints that must not leak a doctor's unshared draft. */
  notes?: string | null;
  status: "not_started" | "in_progress" | "completed";
  videoRoomId?: string | null;
  sharedAt?: string | null;
  startedAt: string | null;
  endedAt: string | null;
}

export interface ApiAppointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  reason: string | null;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: string;
  updatedAt: string;
  patient?: Partial<ApiUser> & { id: string };
  doctor?: Partial<ApiUser> & { id: string };
  consultation?: ApiConsultationSummary | null;
}

export interface ApiAvailabilitySlot {
  id: string;
  doctorId: string;
  date: string;
  startTime: string;
  appointmentId: string | null;
  createdAt: string;
  appointment?: {
    id: string;
    status: ApiAppointment["status"];
    reason: string | null;
    patient: { id: string; fullName: string };
  } | null;
}

export interface ApiCreateSlotsResult {
  created: number;
  skipped: number;
  slots: ApiAvailabilitySlot[];
}

export interface ApiConsultation {
  id: string;
  appointmentId: string;
  notes: string | null;
  status: "not_started" | "in_progress" | "completed";
  videoRoomId?: string | null;
  sharedAt?: string | null;
  startedAt: string | null;
  endedAt: string | null;
  appointment: ApiAppointment;
}

export interface ApiNotification {
  id: string;
  userId: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface ApiHealthInfo {
  id: string;
  title: string;
  content: string;
  category: string | null;
  status: "draft" | "published";
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author?: { id: string; fullName: string; role?: string };
}

export interface ApiLoginResult {
  user: ApiUser;
  token: string;
  mustChangePassword: boolean;
}

export interface ApiRegisterResult {
  user: ApiUser;
  token: string;
}

export interface ApiCreateDoctorResult {
  user: ApiUser;
  temporaryPassword: string;
}

export interface ApiStats {
  users: { total: number; patients: number; doctors: number; admins: number; active: number; inactive: number };
  appointments: { total: number; pending: number; confirmed: number; completed: number; cancelled: number };
  consultations: { total: number; completed: number; inProgress: number };
  healthInfo: { total: number };
  notifications: { total: number; unread: number };
  recentAppointments: ApiAppointment[];
}
