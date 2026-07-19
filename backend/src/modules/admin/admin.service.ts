import crypto from 'crypto';
import { prisma } from '../../config/db';
import { hashPassword } from '../../utils/password.util';
import { CreateDoctorInput } from './admin.schema';

const TEMP_PASSWORD_ALPHABET =
  'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

function generateTemporaryPassword(length = 8): string {
  const bytes = crypto.randomBytes(length);
  let password = '';
  for (let i = 0; i < length; i++) {
    password += TEMP_PASSWORD_ALPHABET[bytes[i] % TEMP_PASSWORD_ALPHABET.length];
  }
  // Guarantee at least one uppercase letter and one digit so it always
  // satisfies the same password rules used everywhere else in the app.
  return `${password}A9`;
}

export async function createDoctor(input: CreateDoctorInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new Error('Email is already registered');
  }

  const temporaryPassword = input.temporaryPassword || generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);

  const user = await prisma.user.create({
    data: {
      fullName: input.fullName,
      email: input.email,
      passwordHash,
      role: 'doctor',
      phone: input.phone,
      district: input.district,
      mustChangePassword: true,
      doctorProfile: {
        create: {
          specialty: input.specialty,
          hospital: input.hospital,
          yearsExperience: input.yearsExperience,
        },
      },
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      phone: true,
      district: true,
      isActive: true,
      mustChangePassword: true,
      createdAt: true,
      doctorProfile: true,
    },
  });

  return { user, temporaryPassword };
}

export async function getAllAppointments(status?: string) {
  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  return prisma.appointment.findMany({
    where,
    include: {
      patient: { select: { id: true, fullName: true, email: true, district: true } },
      doctor: {
        select: { id: true, fullName: true, email: true, district: true, doctorProfile: true },
      },
      consultation: true,
    },
    orderBy: [{ appointmentDate: 'desc' }, { appointmentTime: 'asc' }],
  });
}

export async function getAllUsers(role?: string, isActive?: boolean) {
  const where: Record<string, unknown> = {};
  if (role) where.role = role;
  if (isActive !== undefined) where.isActive = isActive;

  return prisma.user.findMany({
    where,
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      phone: true,
      district: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      doctorProfile: {
        select: { specialty: true, hospital: true, yearsExperience: true },
      },
      patientProfile: {
        select: { dateOfBirth: true, gender: true, chronicConditions: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateUserStatus(userId: string, isActive: boolean) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  return prisma.user.update({
    where: { id: userId },
    data: { isActive },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      isActive: true,
      updatedAt: true,
    },
  });
}

export async function deleteUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  if (user.role === 'admin') {
    throw new Error('Cannot delete admin accounts');
  }

  await prisma.user.delete({ where: { id: userId } });
}

export async function getSystemStats() {
  const [
    totalUsers,
    totalPatients,
    totalDoctors,
    totalAdmins,
    totalAppointments,
    pendingAppointments,
    confirmedAppointments,
    completedAppointments,
    cancelledAppointments,
    totalConsultations,
    completedConsultations,
    totalHealthInfoArticles,
    totalNotifications,
    unreadNotifications,
    activeUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'patient' } }),
    prisma.user.count({ where: { role: 'doctor' } }),
    prisma.user.count({ where: { role: 'admin' } }),
    prisma.appointment.count(),
    prisma.appointment.count({ where: { status: 'pending' } }),
    prisma.appointment.count({ where: { status: 'confirmed' } }),
    prisma.appointment.count({ where: { status: 'completed' } }),
    prisma.appointment.count({ where: { status: 'cancelled' } }),
    prisma.consultation.count(),
    prisma.consultation.count({ where: { status: 'completed' } }),
    prisma.healthInfo.count(),
    prisma.notification.count(),
    prisma.notification.count({ where: { isRead: false } }),
    prisma.user.count({ where: { isActive: true } }),
  ]);

  // Recent activity
  const recentAppointments = await prisma.appointment.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      patient: { select: { fullName: true } },
      doctor: { select: { fullName: true } },
    },
  });

  return {
    users: {
      total: totalUsers,
      patients: totalPatients,
      doctors: totalDoctors,
      admins: totalAdmins,
      active: activeUsers,
      inactive: totalUsers - activeUsers,
    },
    appointments: {
      total: totalAppointments,
      pending: pendingAppointments,
      confirmed: confirmedAppointments,
      completed: completedAppointments,
      cancelled: cancelledAppointments,
    },
    consultations: {
      total: totalConsultations,
      completed: completedConsultations,
      inProgress: totalConsultations - completedConsultations,
    },
    healthInfo: {
      total: totalHealthInfoArticles,
    },
    notifications: {
      total: totalNotifications,
      unread: unreadNotifications,
    },
    recentAppointments,
  };
}
