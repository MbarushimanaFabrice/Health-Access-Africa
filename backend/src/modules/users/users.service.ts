import { prisma } from '../../config/db';
import { UpdateMeInput } from './users.schema';

export async function updateMe(userId: string, role: string, input: UpdateMeInput) {
  if (input.email) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing && existing.id !== userId) {
      throw new Error('Email is already registered');
    }
  }

  const { specialty, hospital, bio, yearsExperience, ...userFields } = input;

  if (Object.keys(userFields).length > 0) {
    await prisma.user.update({ where: { id: userId }, data: userFields });
  }

  if (
    role === 'doctor' &&
    (specialty !== undefined || hospital !== undefined || bio !== undefined || yearsExperience !== undefined)
  ) {
    const profileUpdate: Record<string, unknown> = {};
    if (specialty !== undefined) profileUpdate.specialty = specialty;
    if (hospital !== undefined) profileUpdate.hospital = hospital;
    if (bio !== undefined) profileUpdate.bio = bio;
    if (yearsExperience !== undefined) profileUpdate.yearsExperience = yearsExperience;

    await prisma.doctorProfile.upsert({
      where: { userId },
      update: profileUpdate,
      create: { userId, ...profileUpdate },
    });
  }

  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      phone: true,
      district: true,
      isActive: true,
      updatedAt: true,
      doctorProfile: true,
      patientProfile: true,
    },
  });
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
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
      doctorProfile: true,
      patientProfile: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

export async function listUsers(role?: string) {
  const where = role ? { role: role as 'patient' | 'doctor' | 'admin' } : {};

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
      doctorProfile: {
        select: {
          specialty: true,
          hospital: true,
          yearsExperience: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}
