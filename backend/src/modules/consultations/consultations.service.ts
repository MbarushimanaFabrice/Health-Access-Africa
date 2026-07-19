import { prisma } from '../../config/db';
import { CreateConsultationInput, UpdateConsultationInput } from './consultations.schema';

export async function createConsultation(doctorId: string, input: CreateConsultationInput) {
  // Verify appointment exists and belongs to this doctor
  const appointment = await prisma.appointment.findUnique({
    where: { id: input.appointmentId },
    include: { consultation: true },
  });

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  if (appointment.doctorId !== doctorId) {
    throw new Error('You are not authorized to create a consultation for this appointment');
  }

  if (appointment.consultation) {
    throw new Error('A consultation already exists for this appointment');
  }

  const startedAt =
    input.status === 'in_progress' || input.status === 'completed'
      ? new Date()
      : undefined;
  const endedAt = input.status === 'completed' ? new Date() : undefined;

  const consultation = await prisma.consultation.create({
    data: {
      appointmentId: input.appointmentId,
      notes: input.notes,
      status: input.status,
      startedAt,
      endedAt,
    },
    include: {
      appointment: {
        include: {
          patient: { select: { id: true, fullName: true, email: true } },
          doctor: { select: { id: true, fullName: true } },
        },
      },
    },
  });

  return consultation;
}

export async function updateConsultation(
  consultationId: string,
  doctorId: string,
  input: UpdateConsultationInput
) {
  const consultation = await prisma.consultation.findUnique({
    where: { id: consultationId },
    include: { appointment: true },
  });

  if (!consultation) {
    throw new Error('Consultation not found');
  }

  if (consultation.appointment.doctorId !== doctorId) {
    throw new Error('You are not authorized to update this consultation');
  }

  const updateData: Record<string, unknown> = {};

  if (input.notes !== undefined) updateData.notes = input.notes;
  if (input.status !== undefined) {
    updateData.status = input.status;
    if (input.status === 'in_progress' && !consultation.startedAt) {
      updateData.startedAt = new Date();
    }
    if (input.status === 'completed' && !consultation.endedAt) {
      updateData.endedAt = new Date();
      // Auto-update appointment to completed
      await prisma.appointment.update({
        where: { id: consultation.appointmentId },
        data: { status: 'completed' },
      });

      // Notify patient
      const patient = await prisma.user.findUnique({
        where: { id: consultation.appointment.patientId },
      });
      if (patient) {
        await prisma.notification.create({
          data: {
            userId: patient.id,
            message: `Your consultation has been completed. Notes from your doctor are now available.`,
            type: 'appointment_completed',
          },
        });
      }
    }
  }

  return prisma.consultation.update({
    where: { id: consultationId },
    data: updateData,
    include: {
      appointment: {
        include: {
          patient: { select: { id: true, fullName: true, email: true } },
          doctor: { select: { id: true, fullName: true } },
        },
      },
    },
  });
}

export async function getMyConsultations(userId: string, role: string) {
  const where =
    role === 'patient'
      ? { appointment: { patientId: userId } }
      : { appointment: { doctorId: userId } };

  return prisma.consultation.findMany({
    where,
    include: {
      appointment: {
        include: {
          patient: { select: { id: true, fullName: true, email: true, district: true } },
          doctor: { select: { id: true, fullName: true, doctorProfile: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getConsultationByAppointment(
  appointmentId: string,
  userId: string,
  role: string
) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  // Patients can only view their own consultations
  if (role === 'patient' && appointment.patientId !== userId) {
    throw new Error('Access denied');
  }

  // Doctors can only view consultations for their appointments
  if (role === 'doctor' && appointment.doctorId !== userId) {
    throw new Error('Access denied');
  }

  const consultation = await prisma.consultation.findUnique({
    where: { appointmentId },
    include: {
      appointment: {
        include: {
          patient: { select: { id: true, fullName: true, email: true, district: true } },
          doctor: { select: { id: true, fullName: true, doctorProfile: true } },
        },
      },
    },
  });

  if (!consultation) {
    throw new Error('No consultation found for this appointment');
  }

  return consultation;
}
