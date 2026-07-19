import { prisma } from '../../config/db';
import { UpdatePatientProfileInput } from './patients.schema';

export async function getPatientById(patientId: string, requesterId: string, requesterRole: string) {
  const patient = await prisma.user.findUnique({
    where: { id: patientId, role: 'patient' },
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
      patientProfile: true,
    },
  });

  if (!patient) {
    throw new Error('Patient not found');
  }

  // Patients can only view their own profile
  if (requesterRole === 'patient' && patientId !== requesterId) {
    throw new Error('Access denied');
  }

  // Doctors can only view patients they have appointments with
  if (requesterRole === 'doctor') {
    const hasAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId: requesterId,
        patientId: patientId,
      },
    });
    if (!hasAppointment) {
      throw new Error('Access denied: You have no appointments with this patient');
    }
  }

  return patient;
}

export async function updatePatientProfile(
  patientId: string,
  requesterId: string,
  requesterRole: string,
  input: UpdatePatientProfileInput
) {
  // Check access
  if (requesterRole === 'patient' && patientId !== requesterId) {
    throw new Error('You can only update your own profile');
  }

  if (requesterRole === 'doctor') {
    const hasAppointment = await prisma.appointment.findFirst({
      where: { doctorId: requesterId, patientId },
    });
    if (!hasAppointment) {
      throw new Error('Access denied: You have no appointments with this patient');
    }
  }

  const patient = await prisma.user.findUnique({
    where: { id: patientId, role: 'patient' },
    include: { patientProfile: true },
  });

  if (!patient) {
    throw new Error('Patient not found');
  }

  // Update user fields
  const { dateOfBirth, gender, allergies, chronicConditions, notes, ...userFields } = input;

  if (Object.keys(userFields).length > 0) {
    await prisma.user.update({
      where: { id: patientId },
      data: userFields,
    });
  }

  // Update patient profile
  const profileUpdate: Record<string, unknown> = {};
  if (dateOfBirth !== undefined)
    profileUpdate.dateOfBirth = new Date(dateOfBirth);
  if (gender !== undefined) profileUpdate.gender = gender;
  if (allergies !== undefined) profileUpdate.allergies = allergies;
  if (chronicConditions !== undefined)
    profileUpdate.chronicConditions = chronicConditions;
  if (notes !== undefined) profileUpdate.notes = notes;

  let updatedProfile = patient.patientProfile;

  if (Object.keys(profileUpdate).length > 0) {
    updatedProfile = await prisma.patientProfile.upsert({
      where: { userId: patientId },
      update: profileUpdate,
      create: { userId: patientId, ...profileUpdate },
    });
  }

  const updatedUser = await prisma.user.findUnique({
    where: { id: patientId },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      phone: true,
      district: true,
      isActive: true,
      updatedAt: true,
      patientProfile: true,
    },
  });

  return updatedUser;
}
