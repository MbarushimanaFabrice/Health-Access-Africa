// Central mock/dummy data store for Health Access Africa (frontend-only demo).

export type Role = "patient" | "doctor" | "admin";
export type UserStatus = "Active" | "Inactive";
export type AppointmentStatus = "Confirmed" | "Pending" | "In Progress" | "Completed" | "Cancelled";
export type ConsultationStatus = "Not Started" | "In Progress" | "Completed";
export type ArticleStatus = "Published" | "Draft";
export type NotificationAudience = "patient" | "doctor" | "admin";
export type NotificationType = "Appointments" | "Reminders" | "Health Info" | "System" | "Users" | "Content";

export interface BaseUser {
  id: string;
  role: Role;
  name: string;
  email: string;
  phone: string;
  district: string;
  avatar: string;
  status: UserStatus;
  joined: string;
}

export interface Patient extends BaseUser {
  role: "patient";
  dob: string;
  gender: "Male" | "Female";
  allergies: string[];
  chronicConditions: string[];
}

export interface Doctor extends BaseUser {
  role: "doctor";
  specialty: string;
  hospital: string;
  yearsExperience: number;
  bio: string;
}

export interface Admin extends BaseUser {
  role: "admin";
  title: string;
}

export type AppUser = Patient | Doctor | Admin;

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  reason: string;
  status: AppointmentStatus;
}

export interface Consultation {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  date: string;
  status: ConsultationStatus;
  notes: string;
  videoRoomId?: string | null;
}

export interface Notification {
  id: string;
  audience: NotificationAudience;
  type: NotificationType;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export interface Article {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  author: string;
  publishedDate: string;
  status: ArticleStatus;
  icon: string;
}

const avatar = (seed: string) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

export const districts = ["Kigali", "Musanze", "Huye", "Rubavu", "Nyagatare", "Muhanga"];
export const specialties = ["General Medicine", "Pediatrics", "Cardiology", "Obstetrics", "Dermatology"];

const today = new Date();
const iso = (offsetDays: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

// -------------------- USERS --------------------

export const admins: Admin[] = [
  {
    id: "u-admin-1",
    role: "admin",
    name: "Mugabo Eric",
    email: "admin@haa.rw",
    phone: "+250 788 000 001",
    district: "Kigali",
    avatar: avatar("MugaboEric"),
    status: "Active",
    joined: iso(-400),
    title: "Super Admin",
  },
];

export const doctors: Doctor[] = [
  { id: "u-doc-1", role: "doctor", name: "Dr. Kagame Jean-Paul", email: "kagame@haa.rw", phone: "+250 788 111 001", district: "Kigali", avatar: avatar("KagameJP"), status: "Active", joined: iso(-320), specialty: "General Medicine", hospital: "King Faisal Hospital", yearsExperience: 12, bio: "General practitioner with a focus on preventive care." },
  { id: "u-doc-2", role: "doctor", name: "Dr. Mukamana Solange", email: "doctor@haa.rw", phone: "+250 788 111 002", district: "Kigali", avatar: avatar("Solange"), status: "Active", joined: iso(-280), specialty: "Pediatrics", hospital: "Kibagabaga Hospital", yearsExperience: 9, bio: "Pediatrician dedicated to child health in rural Rwanda." },
  { id: "u-doc-3", role: "doctor", name: "Dr. Habimana Eric", email: "habimana@haa.rw", phone: "+250 788 111 003", district: "Kigali", avatar: avatar("HabimanaEric"), status: "Active", joined: iso(-260), specialty: "Cardiology", hospital: "CHUK", yearsExperience: 15, bio: "Cardiologist specializing in hypertension management." },
  { id: "u-doc-4", role: "doctor", name: "Dr. Nyiramana Claire", email: "claire@haa.rw", phone: "+250 788 111 004", district: "Musanze", avatar: avatar("ClaireN"), status: "Active", joined: iso(-210), specialty: "Obstetrics", hospital: "Ruhengeri Referral", yearsExperience: 10, bio: "Obstetrician passionate about maternal health." },
  { id: "u-doc-5", role: "doctor", name: "Dr. Bizimana Alain", email: "bizimana@haa.rw", phone: "+250 788 111 005", district: "Huye", avatar: avatar("BizimanaA"), status: "Inactive", joined: iso(-180), specialty: "Dermatology", hospital: "Huye District Hospital", yearsExperience: 7, bio: "Dermatology and skin care specialist." },
  { id: "u-doc-6", role: "doctor", name: "Dr. Uwera Grace", email: "grace@haa.rw", phone: "+250 788 111 006", district: "Kigali", avatar: avatar("UweraGrace"), status: "Active", joined: iso(-120), specialty: "General Medicine", hospital: "Rwanda Military Hospital", yearsExperience: 6, bio: "Community-focused general practitioner." },
];

export const patients: Patient[] = [
  { id: "u-pat-1", role: "patient", name: "Uwase Aline", email: "patient@haa.rw", phone: "+250 788 222 001", district: "Kigali", avatar: avatar("AlineUwase"), status: "Active", joined: iso(-200), dob: "1995-04-12", gender: "Female", allergies: ["Penicillin"], chronicConditions: ["Asthma"] },
  { id: "u-pat-2", role: "patient", name: "Mugisha Eric", email: "mugisha@haa.rw", phone: "+250 788 222 002", district: "Musanze", avatar: avatar("MugishaEric"), status: "Active", joined: iso(-180), dob: "1988-09-03", gender: "Male", allergies: [], chronicConditions: ["Hypertension"] },
  { id: "u-pat-3", role: "patient", name: "Iradukunda Claudine", email: "claudine@haa.rw", phone: "+250 788 222 003", district: "Huye", avatar: avatar("Claudine"), status: "Active", joined: iso(-150), dob: "2001-01-22", gender: "Female", allergies: ["Peanuts"], chronicConditions: [] },
  { id: "u-pat-4", role: "patient", name: "Nsengimana Patrick", email: "patrick@haa.rw", phone: "+250 788 222 004", district: "Rubavu", avatar: avatar("Patrick"), status: "Active", joined: iso(-120), dob: "1979-06-15", gender: "Male", allergies: [], chronicConditions: ["Diabetes"] },
  { id: "u-pat-5", role: "patient", name: "Uwimana Diane", email: "diane@haa.rw", phone: "+250 788 222 005", district: "Nyagatare", avatar: avatar("Diane"), status: "Inactive", joined: iso(-90), dob: "1992-11-08", gender: "Female", allergies: [], chronicConditions: [] },
  { id: "u-pat-6", role: "patient", name: "Habimana Fabrice", email: "fabrice@haa.rw", phone: "+250 788 222 006", district: "Muhanga", avatar: avatar("Fabrice"), status: "Active", joined: iso(-70), dob: "1985-03-30", gender: "Male", allergies: ["Dust"], chronicConditions: [] },
  { id: "u-pat-7", role: "patient", name: "Mukashema Alice", email: "alice@haa.rw", phone: "+250 788 222 007", district: "Kigali", avatar: avatar("Alice"), status: "Active", joined: iso(-55), dob: "1998-07-19", gender: "Female", allergies: [], chronicConditions: ["Asthma"] },
  { id: "u-pat-8", role: "patient", name: "Ndayisenga Jean", email: "jean@haa.rw", phone: "+250 788 222 008", district: "Musanze", avatar: avatar("JeanN"), status: "Active", joined: iso(-40), dob: "1973-02-11", gender: "Male", allergies: [], chronicConditions: ["Hypertension"] },
  { id: "u-pat-9", role: "patient", name: "Kayitesi Sandrine", email: "sandrine@haa.rw", phone: "+250 788 222 009", district: "Huye", avatar: avatar("Sandrine"), status: "Active", joined: iso(-25), dob: "2003-12-05", gender: "Female", allergies: [], chronicConditions: [] },
  { id: "u-pat-10", role: "patient", name: "Bigirimana Olivier", email: "olivier@haa.rw", phone: "+250 788 222 010", district: "Rubavu", avatar: avatar("Olivier"), status: "Active", joined: iso(-10), dob: "1990-05-27", gender: "Male", allergies: ["Shellfish"], chronicConditions: [] },
  { id: "u-pat-11", role: "patient", name: "Nyirahabimana Rose", email: "rose@haa.rw", phone: "+250 788 222 011", district: "Nyagatare", avatar: avatar("Rose"), status: "Active", joined: iso(-3), dob: "1996-08-14", gender: "Female", allergies: [], chronicConditions: [] },
];

export const users: AppUser[] = [...admins, ...doctors, ...patients];

// -------------------- APPOINTMENTS --------------------

export const appointments: Appointment[] = [
  { id: "a1", patientId: "u-pat-1", doctorId: "u-doc-2", date: iso(0), time: "09:00", reason: "Asthma follow-up", status: "Confirmed" },
  { id: "a2", patientId: "u-pat-1", doctorId: "u-doc-1", date: iso(1), time: "10:30", reason: "General check-up", status: "Pending" },
  { id: "a3", patientId: "u-pat-1", doctorId: "u-doc-3", date: iso(3), time: "14:00", reason: "Blood pressure review", status: "Confirmed" },
  { id: "a4", patientId: "u-pat-2", doctorId: "u-doc-3", date: iso(2), time: "11:00", reason: "Hypertension check", status: "Confirmed" },
  { id: "a5", patientId: "u-pat-3", doctorId: "u-doc-1", date: iso(-3), time: "09:15", reason: "Flu symptoms", status: "Completed" },
  { id: "a6", patientId: "u-pat-1", doctorId: "u-doc-2", date: iso(-10), time: "10:00", reason: "Inhaler refill", status: "Completed" },
  { id: "a7", patientId: "u-pat-4", doctorId: "u-doc-3", date: iso(-20), time: "15:00", reason: "Cardio consult", status: "Completed" },
  { id: "a8", patientId: "u-pat-6", doctorId: "u-doc-5", date: iso(-5), time: "13:30", reason: "Skin rash", status: "Cancelled" },
  { id: "a9", patientId: "u-pat-8", doctorId: "u-doc-6", date: iso(-30), time: "08:45", reason: "Annual check-up", status: "Completed" },
  { id: "a10", patientId: "u-pat-1", doctorId: "u-doc-1", date: iso(2), time: "16:00", reason: "Follow-up on lab results", status: "Confirmed" },
  { id: "a11", patientId: "u-pat-7", doctorId: "u-doc-2", date: iso(0), time: "11:00", reason: "Pediatric consult", status: "Pending" },
  { id: "a12", patientId: "u-pat-9", doctorId: "u-doc-4", date: iso(5), time: "09:30", reason: "Prenatal visit", status: "Confirmed" },
  { id: "a13", patientId: "u-pat-10", doctorId: "u-doc-6", date: iso(-1), time: "14:15", reason: "Cold symptoms", status: "Completed" },
  { id: "a14", patientId: "u-pat-11", doctorId: "u-doc-1", date: iso(4), time: "10:00", reason: "New patient intake", status: "Pending" },
  { id: "a15", patientId: "u-pat-2", doctorId: "u-doc-2", date: iso(0), time: "15:30", reason: "Child follow-up", status: "In Progress" },
  { id: "a16", patientId: "u-pat-4", doctorId: "u-doc-3", date: iso(-15), time: "10:00", reason: "ECG review", status: "Completed" },
  { id: "a17", patientId: "u-pat-3", doctorId: "u-doc-4", date: iso(7), time: "13:00", reason: "Obstetrics consult", status: "Pending" },
];

// -------------------- CONSULTATIONS --------------------

export const consultations: Consultation[] = [
  { id: "c1", appointmentId: "a5", patientId: "u-pat-3", doctorId: "u-doc-1", date: iso(-3), status: "Completed", notes: "Rest and hydration recommended. Prescribed paracetamol." },
  { id: "c2", appointmentId: "a6", patientId: "u-pat-1", doctorId: "u-doc-2", date: iso(-10), status: "Completed", notes: "Inhaler prescription renewed. Continue current plan." },
  { id: "c3", appointmentId: "a7", patientId: "u-pat-4", doctorId: "u-doc-3", date: iso(-20), status: "Completed", notes: "BP slightly elevated. Reduce salt intake and monitor weekly." },
  { id: "c4", appointmentId: "a9", patientId: "u-pat-8", doctorId: "u-doc-6", date: iso(-30), status: "Completed", notes: "All vitals within normal ranges." },
  { id: "c5", appointmentId: "a13", patientId: "u-pat-10", doctorId: "u-doc-6", date: iso(-1), status: "Completed", notes: "Common cold. Rest and fluids advised." },
  { id: "c6", appointmentId: "a15", patientId: "u-pat-2", doctorId: "u-doc-2", date: iso(0), status: "In Progress", notes: "" },
];

// -------------------- NOTIFICATIONS --------------------

export const notifications: Notification[] = [
  // Patient
  { id: "np1", audience: "patient", type: "Appointments", title: "Appointment confirmed", body: "Your appointment with Dr. Mukamana Solange on " + iso(0) + " at 09:00 is confirmed.", time: "10 min ago", read: false },
  { id: "np2", audience: "patient", type: "Reminders", title: "Reminder", body: "Appointment tomorrow at 10:30 with Dr. Kagame Jean-Paul.", time: "1 hr ago", read: false },
  { id: "np3", audience: "patient", type: "Health Info", title: "New article published", body: "Malaria Prevention: What every household should know.", time: "3 hrs ago", read: false },
  { id: "np4", audience: "patient", type: "System", title: "System maintenance", body: "Scheduled maintenance tonight from 11 PM to midnight.", time: "Yesterday", read: true },
  { id: "np5", audience: "patient", type: "Reminders", title: "Take your medication", body: "Reminder to take your evening asthma inhaler.", time: "2 days ago", read: true },
  // Doctor
  { id: "nd1", audience: "doctor", type: "Appointments", title: "New appointment request", body: "Nsengimana Patrick booked an appointment for " + iso(2) + ".", time: "20 min ago", read: false },
  { id: "nd2", audience: "doctor", type: "Reminders", title: "Consultation starting soon", body: "Consultation with Mugisha Eric starts in 15 minutes.", time: "45 min ago", read: false },
  { id: "nd3", audience: "doctor", type: "System", title: "Profile viewed", body: "Your profile was viewed 12 times this week.", time: "Yesterday", read: true },
  // Admin
  { id: "na1", audience: "admin", type: "Users", title: "5 new registrations today", body: "Five new patients joined the platform today.", time: "1 hr ago", read: false },
  { id: "na2", audience: "admin", type: "Users", title: "Doctor pending approval", body: "Dr. Uwera Grace requires activation review.", time: "2 hrs ago", read: false },
  { id: "na3", audience: "admin", type: "Content", title: "Article submitted for review", body: "A new health article draft is ready.", time: "3 hrs ago", read: false },
  { id: "na4", audience: "admin", type: "System", title: "12 appointments pending", body: "12 appointments are pending confirmation across the system.", time: "Yesterday", read: true },
  { id: "na5", audience: "admin", type: "Users", title: "Account flagged", body: "1 patient account was flagged as inactive.", time: "2 days ago", read: true },
];

// -------------------- ARTICLES --------------------

export const articles: Article[] = [
  { id: "art1", title: "Malaria Prevention at Home", category: "Malaria Prevention", excerpt: "Simple household practices that reduce malaria risk.", content: "Sleep under insecticide-treated nets, clear stagnant water, and seek early treatment.", author: "Mugabo Eric", publishedDate: iso(-2), status: "Published", icon: "🦟" },
  { id: "art2", title: "Managing Asthma in Rural Areas", category: "Chronic Disease Care", excerpt: "How to manage asthma with limited resources.", content: "Recognize triggers, use your inhaler correctly, and keep in contact with your health worker.", author: "Mugabo Eric", publishedDate: iso(-7), status: "Published", icon: "🌬️" },
  { id: "art3", title: "Antenatal Care Essentials", category: "Maternal Health", excerpt: "Why every antenatal visit matters.", content: "Attending antenatal visits detects risks early and supports a healthy delivery.", author: "Mugabo Eric", publishedDate: iso(-14), status: "Published", icon: "🤰" },
  { id: "art4", title: "Nutrition on a Budget", category: "Nutrition", excerpt: "Balanced meals using locally available foods.", content: "Beans, sweet potatoes, leafy greens, and eggs offer nutrition at low cost.", author: "Mugabo Eric", publishedDate: iso(-21), status: "Published", icon: "🥗" },
  { id: "art5", title: "Understanding Hypertension", category: "Chronic Disease Care", excerpt: "Why blood pressure control matters.", content: "Hypertension is silent but dangerous. Reduce salt, stay active, and take medication consistently.", author: "Mugabo Eric", publishedDate: iso(-28), status: "Published", icon: "❤️" },
  { id: "art6", title: "Vaccination Schedule for Children", category: "Maternal Health", excerpt: "Keep your child protected on time.", content: "Follow the national immunization schedule to prevent measles, polio, and tetanus.", author: "Mugabo Eric", publishedDate: iso(-40), status: "Published", icon: "💉" },
  { id: "art7", title: "Clean Water & Hygiene", category: "Nutrition", excerpt: "Water safety practices that prevent illness.", content: "Boil or treat drinking water and wash hands with soap.", author: "Mugabo Eric", publishedDate: iso(-45), status: "Published", icon: "💧" },
  { id: "art8", title: "Mental Health First Steps", category: "Wellness", excerpt: "Recognizing signs and seeking help.", content: "Talking about mental health openly reduces stigma and encourages early care.", author: "Mugabo Eric", publishedDate: iso(-1), status: "Draft", icon: "🧠" },
];

// -------------------- CHART DATA --------------------

export const appointmentsTrend = {
  Week: [
    { name: "Mon", value: 3 }, { name: "Tue", value: 5 }, { name: "Wed", value: 4 },
    { name: "Thu", value: 6 }, { name: "Fri", value: 5 }, { name: "Sat", value: 2 }, { name: "Sun", value: 1 },
  ],
  Month: [
    { name: "W1", value: 12 }, { name: "W2", value: 18 }, { name: "W3", value: 15 }, { name: "W4", value: 22 },
  ],
  Year: [
    { name: "Jan", value: 40 }, { name: "Feb", value: 55 }, { name: "Mar", value: 42 },
    { name: "Apr", value: 65 }, { name: "May", value: 58 }, { name: "Jun", value: 72 }, { name: "Jul", value: 68 },
  ],
};

export const userGrowthTrend = {
  Week: [
    { name: "Mon", patients: 2, doctors: 1 }, { name: "Tue", patients: 3, doctors: 0 }, { name: "Wed", patients: 1, doctors: 1 },
    { name: "Thu", patients: 4, doctors: 0 }, { name: "Fri", patients: 2, doctors: 1 }, { name: "Sat", patients: 1, doctors: 0 }, { name: "Sun", patients: 0, doctors: 0 },
  ],
  Month: [
    { name: "W1", patients: 8, doctors: 2 }, { name: "W2", patients: 12, doctors: 1 }, { name: "W3", patients: 10, doctors: 3 }, { name: "W4", patients: 15, doctors: 2 },
  ],
  Year: [
    { name: "Jan", patients: 20, doctors: 3 }, { name: "Feb", patients: 25, doctors: 2 }, { name: "Mar", patients: 30, doctors: 4 },
    { name: "Apr", patients: 28, doctors: 1 }, { name: "May", patients: 35, doctors: 3 }, { name: "Jun", patients: 40, doctors: 2 }, { name: "Jul", patients: 45, doctors: 3 },
  ],
};
