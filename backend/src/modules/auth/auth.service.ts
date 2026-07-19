import { prisma } from '../../config/db';
import { hashPassword, comparePassword } from '../../utils/password.util';
import { signToken } from '../../utils/jwt.util';
import { RegisterInput, LoginInput, ChangePasswordInput } from './auth.schema';

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new Error('Email is already registered');
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      fullName: input.fullName,
      email: input.email,
      passwordHash,
      role: 'patient',
      phone: input.phone,
      district: input.district,
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
    },
  });

  await prisma.patientProfile.create({
    data: { userId: user.id },
  });

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
  });

  return { user, token };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    throw new Error('Your account has been deactivated. Contact support.');
  }

  const valid = await comparePassword(input.password, user.passwordHash);
  if (!valid) {
    throw new Error('Invalid email or password');
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
  });

  const { passwordHash: _, ...safeUser } = user;
  return { user: safeUser, token, mustChangePassword: user.mustChangePassword };
}

export async function changePassword(userId: string, input: ChangePasswordInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  const valid = await comparePassword(input.currentPassword, user.passwordHash);
  if (!valid) {
    throw new Error('Current password is incorrect');
  }

  const passwordHash = await hashPassword(input.newPassword);

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { passwordHash, mustChangePassword: false },
    select: { id: true, email: true, role: true, mustChangePassword: true },
  });

  const token = signToken({
    userId: updated.id,
    email: updated.email,
    role: updated.role,
    mustChangePassword: updated.mustChangePassword,
  });

  return { token };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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
