import { randomBytes } from 'crypto';
import { prisma } from '../../config/db';
import {
  CreateConsultationInput,
  SaveConsultationInput,
  UpdateConsultationInput,
} from './consultations.schema';

const fullConsultationInclude = {
  appointment: {
    include: {
      patient: { select: { id: true, fullName: true, email: true, district: true } },
      doctor: { select: { id: true, fullName: true, doctorProfile: true } },
    },
  },
};

/**
 * A doctor's notes stay private until they explicitly send them, so strip the
 * body of any unshared draft before it reaches a patient.
 */
function redactUnsharedNotes<T extends { notes: string | null; sharedAt: Date | null }>(
  consultation: T
): T {
  return consultation.sharedAt ? consultation : { ...consultation, notes: null };
}

/**
 * Creates or updates the consultation attached to an appointment. Doctors reach
 * this straight from the appointment, before a consultation row necessarily
 * exists, so it upserts rather than requiring a separate create call.
 */
export async function saveConsultationForAppointment(
  appointmentId: string,
  doctorId: string,
  input: SaveConsultationInput
) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { consultation: true, doctor: { select: { fullName: true } } },
  });

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  if (appointment.doctorId !== doctorId) {
    throw new Error('You are not authorized to write notes for this appointment');
  }

  if (input.share && !input.notes?.trim()) {
    throw new Error('Add some notes before sending them to the patient');
  }

  // Sending is one-way: re-sending an already-shared consultation updates the
  // notes but does not re-notify the patient.
  const alreadyShared = Boolean(appointment.consultation?.sharedAt);
  const now = new Date();

  const consultation = await prisma.consultation.upsert({
    where: { appointmentId },
    create: {
      appointmentId,
      notes: input.notes,
      status: input.share ? 'completed' : 'not_started',
      sharedAt: input.share ? now : null,
      startedAt: now,
      endedAt: input.share ? now : null,
    },
    update: {
      notes: input.notes,
      ...(input.share
        ? {
            status: 'completed' as const,
            sharedAt: appointment.consultation?.sharedAt ?? now,
            endedAt: appointment.consultation?.endedAt ?? now,
          }
        : {}),
    },
    include: fullConsultationInclude,
  });

  if (input.share) {
    if (appointment.status !== 'completed') {
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: 'completed' },
      });
    }

    if (!alreadyShared) {
      await prisma.notification.create({
        data: {
          userId: appointment.patientId,
          message: `Dr. ${appointment.doctor.fullName} has shared consultation notes from your appointment on ${appointment.appointmentDate.toISOString().slice(0, 10)}. View them under My Consultations.`,
          type: 'consultation_shared',
        },
      });
    }
  }

  return consultation;
}

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
            message: `Your consultation has been completed.`,
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

  const consultations = await prisma.consultation.findMany({
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

  // Patients never see a draft; doctors see everything they wrote.
  if (role === 'patient') {
    return consultations.filter((c) => c.sharedAt).map(redactUnsharedNotes);
  }

  return consultations;
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

  return role === 'patient' ? redactUnsharedNotes(consultation) : consultation;
}

/**
 * Generates an unguessable Jitsi room name. The room name is the only access
 * control on the public meet.jit.si server, so it must not be guessable and
 * is only ever revealed to the appointment's doctor and patient.
 */
function generateVideoRoomId(appointmentId: string) {
  return `haa-${appointmentId.slice(0, 8)}-${randomBytes(8).toString('hex')}`;
}

export async function getOrCreateVideoRoom(
  appointmentId: string,
  userId: string,
  role: string
) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      consultation: true,
      patient: { select: { id: true, fullName: true } },
      doctor: { select: { id: true, fullName: true } },
    },
  });

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  const isDoctor = role === 'doctor' && appointment.doctorId === userId;
  const isPatient = role === 'patient' && appointment.patientId === userId;

  if (!isDoctor && !isPatient) {
    throw new Error('You are not authorized to join this call');
  }

  if (appointment.status !== 'confirmed') {
    throw new Error('Video calls are only available for confirmed appointments');
  }

  if (appointment.consultation?.status === 'completed') {
    throw new Error('This consultation has already been completed');
  }

  const consultationInclude = {
    appointment: {
      include: {
        patient: { select: { id: true, fullName: true, email: true } },
        doctor: { select: { id: true, fullName: true } },
      },
    },
  };

  // Patients can only join a call the doctor has already started
  if (isPatient) {
    if (!appointment.consultation?.videoRoomId) {
      throw new Error('The doctor has not started the video call yet');
    }
    return prisma.consultation.findUnique({
      where: { appointmentId },
      include: consultationInclude,
    });
  }

  // Doctor: get-or-create the consultation and its video room
  const isNewRoom = !appointment.consultation?.videoRoomId;
  const videoRoomId =
    appointment.consultation?.videoRoomId ?? generateVideoRoomId(appointmentId);

  const consultation = await prisma.consultation.upsert({
    where: { appointmentId },
    create: {
      appointmentId,
      status: 'in_progress',
      startedAt: new Date(),
      videoRoomId,
    },
    update: {
      videoRoomId,
      status:
        appointment.consultation?.status === 'not_started' ? 'in_progress' : undefined,
      startedAt: appointment.consultation?.startedAt ?? new Date(),
    },
    include: consultationInclude,
  });

  if (isNewRoom) {
    await prisma.notification.create({
      data: {
        userId: appointment.patientId,
        message: `Dr. ${appointment.doctor.fullName} has started your video consultation for your appointment on ${appointment.appointmentDate.toISOString().slice(0, 10)} at ${appointment.appointmentTime}. Join now from My Appointments.`,
        type: 'video_call_started',
      },
    });
  }

  return consultation;
}
