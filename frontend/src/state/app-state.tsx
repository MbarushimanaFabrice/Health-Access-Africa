import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  toAppointment,
  toArticle,
  toConsultation,
  toDoctor,
  toNotification,
  toPatient,
  joinList,
} from "@/lib/adapters";
import * as appointmentsApi from "@/lib/api/appointments";
import * as consultationsApi from "@/lib/api/consultations";
import * as notificationsApi from "@/lib/api/notifications";
import * as healthInfoApi from "@/lib/api/health-info";
import * as patientsApi from "@/lib/api/patients";
import * as usersApi from "@/lib/api/users";
import * as adminApi from "@/lib/api/admin";
import { useAuth } from "./auth";
import type {
  Admin,
  Appointment,
  AppointmentStatus,
  Article,
  ArticleStatus,
  Doctor,
  Notification,
  Patient,
} from "@/mock/data";

interface NewAppointmentInput {
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  reason: string;
}

interface NewDoctorInput {
  name: string;
  email: string;
  phone: string;
  specialty: string;
  hospital: string;
  district: string;
  temporaryPassword?: string;
}

interface NewArticleInput {
  title: string;
  category: string;
  content: string;
  status: ArticleStatus;
  author: string;
}

interface AppState {
  admins: Admin[];
  doctors: Doctor[];
  patients: Patient[];
  users: (Admin | Doctor | Patient)[];
  appointments: Appointment[];
  consultations: ReturnType<typeof toConsultation>[];
  notifications: Notification[];
  articles: Article[];
  isLoading: boolean;
  // patient actions
  updatePatient: (id: string, patch: Partial<Patient>) => Promise<void>;
  bookAppointment: (input: NewAppointmentInput) => Promise<Appointment>;
  // shared appointment actions
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => Promise<void>;
  // consultations
  /** Upserts the appointment's consultation. share=false keeps it a private draft. */
  saveConsultation: (appointmentId: string, notes: string, share: boolean) => Promise<void>;
  startVideoCall: (appointmentId: string) => Promise<void>;
  // notifications
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: (audience?: Notification["audience"]) => Promise<void>;
  // admin user actions
  toggleUserStatus: (id: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addDoctor: (input: NewDoctorInput) => Promise<{ doctor: Doctor; temporaryPassword: string }>;
  // articles CRUD
  addArticle: (input: NewArticleInput) => Promise<Article>;
  updateArticle: (id: string, patch: Partial<Article>) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
  toggleArticleStatus: (id: string) => Promise<void>;
}

const Ctx = createContext<AppState | null>(null);

const KEYS = {
  users: ["users"] as const,
  appointments: ["appointments"] as const,
  consultations: ["consultations"] as const,
  notifications: ["notifications"] as const,
  articles: ["articles"] as const,
};

export function AppStateProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const enabled = Boolean(currentUser);
  const role = currentUser?.role;

  const usersQuery = useQuery({
    queryKey: KEYS.users,
    queryFn: () => adminApi.getAllUsers(),
    enabled: enabled && role === "admin",
  });

  const doctorsQuery = useQuery({
    queryKey: ["doctors-directory"],
    queryFn: () => usersApi.listUsers("doctor"),
    enabled,
  });

  const appointmentsQuery = useQuery({
    queryKey: KEYS.appointments,
    queryFn: () =>
      role === "admin" ? appointmentsApi.getAllAppointments() : appointmentsApi.getMyAppointments(),
    enabled,
  });

  const consultationsQuery = useQuery({
    queryKey: KEYS.consultations,
    queryFn: () => consultationsApi.getMyConsultations(),
    enabled: enabled && (role === "patient" || role === "doctor"),
    // Poll so a patient's "Join Call" button appears shortly after the doctor
    // starts the video call.
    refetchInterval: 15_000,
  });

  const notificationsQuery = useQuery({
    queryKey: KEYS.notifications,
    queryFn: () => notificationsApi.getMyNotifications(),
    enabled,
    // Poll so booking/confirmation/video-call notifications show up without a
    // manual refresh.
    refetchInterval: 15_000,
  });

  const articlesQuery = useQuery({
    queryKey: KEYS.articles,
    queryFn: () => healthInfoApi.getAllHealthInfo(),
    enabled,
  });

  const rawUsers = usersQuery.data ?? [];
  const rawDoctors = doctorsQuery.data ?? [];

  const admins = useMemo<Admin[]>(
    () =>
      rawUsers
        .filter((u) => u.role === "admin")
        .map((u) => ({
          id: u.id,
          role: "admin" as const,
          name: u.fullName,
          email: u.email,
          phone: u.phone ?? "",
          district: u.district ?? "",
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`,
          status: u.isActive ? ("Active" as const) : ("Inactive" as const),
          joined: u.createdAt.slice(0, 10),
          title: "Administrator",
        })),
    [rawUsers]
  );

  const doctors = useMemo<Doctor[]>(() => rawDoctors.map(toDoctor), [rawDoctors]);

  const patients = useMemo<Patient[]>(() => {
    // Only admins can list every user, so a doctor's patients are derived from
    // the patient records embedded in their own appointments.
    if (role === "admin") return rawUsers.filter((u) => u.role === "patient").map(toPatient);

    const byId = new Map<string, Patient>();
    (appointmentsQuery.data ?? []).forEach((a) => {
      if (!a.patient || byId.has(a.patient.id)) return;
      byId.set(
        a.patient.id,
        toPatient({
          isActive: true,
          createdAt: "",
          fullName: "",
          email: "",
          phone: null,
          district: null,
          ...a.patient,
          role: "patient",
        })
      );
    });
    return Array.from(byId.values());
  }, [role, rawUsers, appointmentsQuery.data]);

  const users = useMemo<(Admin | Doctor | Patient)[]>(
    () => [...admins, ...doctors, ...patients],
    [admins, doctors, patients]
  );

  const appointments = useMemo<Appointment[]>(
    () => (appointmentsQuery.data ?? []).map(toAppointment),
    [appointmentsQuery.data]
  );

  const consultations = useMemo(
    () => (consultationsQuery.data ?? []).map(toConsultation),
    [consultationsQuery.data]
  );

  const notifications = useMemo<Notification[]>(
    () => (notificationsQuery.data ?? []).map((n) => toNotification(n, (role ?? "patient") as any)),
    [notificationsQuery.data, role]
  );

  const articles = useMemo<Article[]>(
    () => (articlesQuery.data ?? []).map(toArticle),
    [articlesQuery.data]
  );

  const invalidateUsers = () => {
    queryClient.invalidateQueries({ queryKey: KEYS.users });
    queryClient.invalidateQueries({ queryKey: ["doctors-directory"] });
  };
  const invalidateAppointments = () =>
    queryClient.invalidateQueries({ queryKey: KEYS.appointments });
  const invalidateConsultations = () =>
    queryClient.invalidateQueries({ queryKey: KEYS.consultations });
  const invalidateNotifications = () =>
    queryClient.invalidateQueries({ queryKey: KEYS.notifications });
  const invalidateArticles = () => queryClient.invalidateQueries({ queryKey: KEYS.articles });

  const updatePatientMutation = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Patient> }) => {
      const input: patientsApi.UpdatePatientProfileInput = {};
      if (patch.name !== undefined) input.fullName = patch.name;
      if (patch.phone !== undefined) input.phone = patch.phone;
      if (patch.district !== undefined) input.district = patch.district;
      if (patch.dob !== undefined) input.dateOfBirth = patch.dob;
      if (patch.gender !== undefined) input.gender = patch.gender;
      if (patch.allergies !== undefined) input.allergies = joinList(patch.allergies);
      if (patch.chronicConditions !== undefined)
        input.chronicConditions = joinList(patch.chronicConditions);
      await patientsApi.updatePatientProfile(id, input);
    },
    onSuccess: invalidateUsers,
  });

  const bookAppointmentMutation = useMutation({
    mutationFn: async (input: NewAppointmentInput) =>
      appointmentsApi.createAppointment({
        doctorId: input.doctorId,
        appointmentDate: input.date,
        appointmentTime: input.time,
        reason: input.reason,
      }),
    onSuccess: () => {
      invalidateAppointments();
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
  });

  const updateAppointmentStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AppointmentStatus }) => {
      const map: Record<string, "confirmed" | "cancelled" | "completed"> = {
        Confirmed: "confirmed",
        Cancelled: "cancelled",
        Completed: "completed",
      };
      const apiStatus = map[status];
      if (!apiStatus) throw new Error(`Cannot set status to ${status} directly`);
      return appointmentsApi.updateAppointmentStatus(id, apiStatus);
    },
    onSuccess: () => {
      invalidateAppointments();
      invalidateConsultations();
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
  });

  const saveConsultationMutation = useMutation({
    mutationFn: async ({
      appointmentId,
      notes,
      share,
    }: { appointmentId: string; notes: string; share: boolean }) =>
      consultationsApi.saveConsultationForAppointment(appointmentId, { notes, share }),
    onSuccess: () => {
      invalidateAppointments();
      invalidateConsultations();
      invalidateNotifications();
    },
  });

  const startVideoCallMutation = useMutation({
    mutationFn: async (appointmentId: string) =>
      consultationsApi.getOrCreateVideoRoom(appointmentId),
    onSuccess: () => {
      invalidateAppointments();
      invalidateConsultations();
    },
  });

  const markNotificationReadMutation = useMutation({
    mutationFn: async (id: string) => notificationsApi.markNotificationRead(id),
    onSuccess: invalidateNotifications,
  });

  const markAllNotificationsReadMutation = useMutation({
    mutationFn: async () => notificationsApi.markAllNotificationsRead(),
    onSuccess: invalidateNotifications,
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: async (id: string) => {
      const target = users.find((u) => u.id === id);
      if (!target) throw new Error("User not found");
      return adminApi.updateUserStatus(id, target.status !== "Active");
    },
    onSuccess: invalidateUsers,
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => adminApi.deleteUser(id),
    onSuccess: invalidateUsers,
  });

  const addDoctorMutation = useMutation({
    mutationFn: async (input: NewDoctorInput) =>
      adminApi.createDoctor({
        fullName: input.name,
        email: input.email,
        phone: input.phone,
        district: input.district,
        specialty: input.specialty,
        hospital: input.hospital,
        temporaryPassword: input.temporaryPassword,
      }),
    onSuccess: invalidateUsers,
  });

  const addArticleMutation = useMutation({
    mutationFn: async (input: NewArticleInput) =>
      healthInfoApi.createHealthInfo({
        title: input.title,
        content: input.content,
        category: input.category,
        status: input.status === "Published" ? "published" : "draft",
      }),
    onSuccess: invalidateArticles,
  });

  const updateArticleMutation = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Article> }) =>
      healthInfoApi.updateHealthInfo(id, {
        title: patch.title,
        content: patch.content,
        category: patch.category,
        status: patch.status ? (patch.status === "Published" ? "published" : "draft") : undefined,
      }),
    onSuccess: invalidateArticles,
  });

  const deleteArticleMutation = useMutation({
    mutationFn: async (id: string) => healthInfoApi.deleteHealthInfo(id),
    onSuccess: invalidateArticles,
  });

  const toggleArticleStatusMutation = useMutation({
    mutationFn: async (id: string) => {
      const target = articles.find((a) => a.id === id);
      if (!target) throw new Error("Article not found");
      return healthInfoApi.updateHealthInfo(id, {
        status: target.status === "Published" ? "draft" : "published",
      });
    },
    onSuccess: invalidateArticles,
  });

  const value: AppState = {
    admins,
    doctors,
    patients,
    users,
    appointments,
    consultations,
    notifications,
    articles,
    isLoading:
      usersQuery.isLoading ||
      doctorsQuery.isLoading ||
      appointmentsQuery.isLoading ||
      notificationsQuery.isLoading ||
      articlesQuery.isLoading,

    updatePatient: (id, patch) => updatePatientMutation.mutateAsync({ id, patch }),

    bookAppointment: async (input) => {
      const created = await bookAppointmentMutation.mutateAsync(input);
      return toAppointment(created);
    },

    updateAppointmentStatus: (id, status) =>
      updateAppointmentStatusMutation.mutateAsync({ id, status }).then(() => undefined),

    saveConsultation: (appointmentId, notes, share) =>
      saveConsultationMutation.mutateAsync({ appointmentId, notes, share }).then(() => undefined),

    startVideoCall: (appointmentId) =>
      startVideoCallMutation.mutateAsync(appointmentId).then(() => undefined),

    markNotificationRead: (id) => markNotificationReadMutation.mutateAsync(id).then(() => undefined),

    markAllNotificationsRead: () =>
      markAllNotificationsReadMutation.mutateAsync().then(() => undefined),

    toggleUserStatus: (id) => toggleUserStatusMutation.mutateAsync(id).then(() => undefined),

    deleteUser: (id) => deleteUserMutation.mutateAsync(id).then(() => undefined),

    addDoctor: async (input) => {
      const result = await addDoctorMutation.mutateAsync(input);
      return { doctor: toDoctor(result.user), temporaryPassword: result.temporaryPassword };
    },

    addArticle: async (input) => {
      const created = await addArticleMutation.mutateAsync(input);
      return toArticle(created);
    },

    updateArticle: (id, patch) =>
      updateArticleMutation.mutateAsync({ id, patch }).then(() => undefined),

    deleteArticle: (id) => deleteArticleMutation.mutateAsync(id).then(() => undefined),

    toggleArticleStatus: (id) =>
      toggleArticleStatusMutation.mutateAsync(id).then(() => undefined),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAppState must be used within AppStateProvider");
  return v;
}
