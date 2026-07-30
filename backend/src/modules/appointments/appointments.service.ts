import { prisma } from '../../config/db';
import { CreateAppointmentInput, UpdateAppointmentStatusInput } from './appointments.schema';

export async function createAppointment(patientId: string, input: CreateAppointmentInput) {
  // Verify doctor exists and is a doctor
  const doctor = await prisma.user.findUnique({
    where: { id: input.doctorId },
  });

  if (!doctor || doctor.role !== 'doctor') {
    throw new Error('Doctor not found');
  }

  if (!doctor.isActive) {
    throw new Error('This doctor is not currently available');
  }

  const slot = await prisma.availabilitySlot.findUnique({
    where: {
      doctorId_date_startTime: {
        doctorId: input.doctorId,
        date: new Date(`${input.appointmentDate}T00:00:00.000Z`),
        startTime: input.appointmentTime,
      },
    },
  });

  if (!slot) {
    throw new Error('This doctor has no availability at the selected date and time');
  }

  if (slot.appointmentId) {
    throw new Error('That slot has just been booked. Please pick another time.');
  }

  const appointment = await prisma.$transaction(async (tx) => {
    const created = await tx.appointment.create({
      data: {
        patientId,
        doctorId: input.doctorId,
        appointmentDate: new Date(input.appointmentDate),
        appointmentTime: input.appointmentTime,
        reason: input.reason,
      },
      include: {
        patient: { select: { id: true, fullName: true, email: true, district: true } },
        doctor: { select: { id: true, fullName: true, email: true, doctorProfile: true } },
      },
    });

    // Conditional update — loses the race harmlessly if another patient booked
    // the same slot between the check above and here.
    const { count } = await tx.availabilitySlot.updateMany({
      where: { id: slot.id, appointmentId: null },
      data: { appointmentId: created.id },
    });

    if (count === 0) {
      throw new Error('That slot has just been booked. Please pick another time.');
    }

    return created;
  });

  // Notify patient
  await prisma.notification.create({
    data: {
      userId: patientId,
      message: `Your appointment with ${doctor.fullName} on ${input.appointmentDate} at ${input.appointmentTime} has been booked and is pending confirmation.`,
      type: 'appointment_booked',
    },
  });

  // Notify doctor
  const patient = await prisma.user.findUnique({ where: { id: patientId } });
  await prisma.notification.create({
    data: {
      userId: input.doctorId,
      message: `New appointment request from ${patient?.fullName} on ${input.appointmentDate} at ${input.appointmentTime}. Reason: ${input.reason || 'Not specified'}.`,
      type: 'appointment_booked',
    },
  });

  return appointment;
}

export async function getMyAppointments(userId: string, role: string) {
  const where =
    role === 'patient' ? { patientId: userId } : { doctorId: userId };

  return prisma.appointment.findMany({
    where,
    include: {
      patient: { select: { id: true, fullName: true, email: true, phone: true, district: true } },
      doctor: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          district: true,
          doctorProfile: true,
        },
      },
      // Notes are omitted on purpose: a doctor's draft stays private until they
      // send it, and patients read this same endpoint.
      consultation: {
        select: {
          id: true,
          appointmentId: true,
          status: true,
          videoRoomId: true,
          sharedAt: true,
          startedAt: true,
          endedAt: true,
        },
      },
    },
    orderBy: [{ appointmentDate: 'desc' }, { appointmentTime: 'asc' }],
  });
}

export async function updateAppointmentStatus(
  appointmentId: string,
  userId: string,
  role: string,
  input: UpdateAppointmentStatusInput
) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { patient: true, doctor: true },
  });

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  if (role === 'patient') {
    if (appointment.patientId !== userId) {
      throw new Error('You are not authorized to manage this appointment');
    }
    if (input.status !== 'cancelled') {
      throw new Error('Patients can only cancel appointments');
    }
    if (appointment.status === 'cancelled' || appointment.status === 'completed') {
      throw new Error(`Cannot cancel an appointment that is already ${appointment.status}`);
    }
  } else {
    if (appointment.doctorId !== userId) {
      throw new Error('You are not authorized to manage this appointment');
    }
  }

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: input.status },
    include: {
      patient: { select: { id: true, fullName: true, email: true } },
      doctor: { select: { id: true, fullName: true } },
    },
  });

  // Free the reserved slot so another patient can take it.
  if (input.status === 'cancelled') {
    await prisma.availabilitySlot.updateMany({
      where: { appointmentId },
      data: { appointmentId: null },
    });
  }

  // Send notification to the other party
  const typeMap: Record<string, string> = {
    confirmed: 'appointment_confirmed',
    cancelled: 'appointment_cancelled',
    completed: 'appointment_completed',
  };

  const notifyUserId = role === 'patient' ? appointment.doctorId : appointment.patientId;
  const cancelledBy = role === 'patient' ? 'the patient' : 'the doctor';

  const messageMap: Record<string, string> = {
    confirmed: `Your appointment with ${appointment.doctor ? 'your doctor' : 'Doctor'} on ${appointment.appointmentDate.toISOString().split('T')[0]} at ${appointment.appointmentTime} has been confirmed.`,
    cancelled: `Your appointment on ${appointment.appointmentDate.toISOString().split('T')[0]} at ${appointment.appointmentTime} has been cancelled by ${cancelledBy}.`,
    completed: `Your appointment on ${appointment.appointmentDate.toISOString().split('T')[0]} has been marked as completed. Your consultation notes may be available.`,
  };

  await prisma.notification.create({
    data: {
      userId: notifyUserId,
      message: messageMap[input.status],
      type: typeMap[input.status],
    },
  });

  return updated;
}

export async function deleteAppointment(appointmentId: string, patientId: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  if (appointment.patientId !== patientId) {
    throw new Error('You can only cancel your own appointments');
  }

  if (appointment.status !== 'pending') {
    throw new Error('Only pending appointments can be cancelled');
  }

  await prisma.appointment.delete({ where: { id: appointmentId } });
}
