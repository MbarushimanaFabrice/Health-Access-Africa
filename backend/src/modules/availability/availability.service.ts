import { prisma } from '../../config/db';
import { CreateSlotsInput } from './availability.schema';

/** Slots are stored on a DATE column, so a bare YYYY-MM-DD is anchored at UTC midnight. */
function toDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function startOfToday(): Date {
  const now = new Date();
  return toDate(now.toISOString().slice(0, 10));
}

export async function createSlots(doctorId: string, input: CreateSlotsInput) {
  const today = startOfToday();

  const rows = input.dates.flatMap((date) =>
    input.times.map((startTime) => ({ doctorId, date: toDate(date), startTime }))
  );

  if (rows.some((r) => r.date < today)) {
    throw new Error('Cannot create availability slots in the past');
  }

  const { count } = await prisma.availabilitySlot.createMany({
    data: rows,
    skipDuplicates: true,
  });

  const slots = await getMySlots(doctorId);
  return { created: count, skipped: rows.length - count, slots };
}

export async function getMySlots(doctorId: string) {
  return prisma.availabilitySlot.findMany({
    where: { doctorId, date: { gte: startOfToday() } },
    include: {
      appointment: {
        select: {
          id: true,
          status: true,
          reason: true,
          patient: { select: { id: true, fullName: true } },
        },
      },
    },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  });
}

export async function getAvailableSlots(doctorId: string) {
  const doctor = await prisma.user.findUnique({ where: { id: doctorId } });

  if (!doctor || doctor.role !== 'doctor') {
    throw new Error('Doctor not found');
  }

  return prisma.availabilitySlot.findMany({
    where: { doctorId, appointmentId: null, date: { gte: startOfToday() } },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  });
}

export async function deleteSlot(slotId: string, doctorId: string) {
  const slot = await prisma.availabilitySlot.findUnique({ where: { id: slotId } });

  if (!slot) {
    throw new Error('Availability slot not found');
  }

  if (slot.doctorId !== doctorId) {
    throw new Error('You can only remove your own availability slots');
  }

  if (slot.appointmentId) {
    throw new Error('This slot is already booked. Cancel the appointment first.');
  }

  await prisma.availabilitySlot.delete({ where: { id: slotId } });
}
