import { prisma } from '../../config/db';
import { CreateHealthInfoInput, UpdateHealthInfoInput } from './health-info.schema';

export async function getAllHealthInfo(category?: string, role?: string) {
  const where: Record<string, unknown> = category ? { category } : {};
  if (role !== 'admin') {
    where.status = 'published';
  }
  return prisma.healthInfo.findMany({
    where,
    include: {
      author: {
        select: { id: true, fullName: true, role: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getHealthInfoById(id: string, role?: string) {
  const article = await prisma.healthInfo.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, fullName: true, role: true } },
    },
  });

  if (!article) {
    throw new Error('Health info article not found');
  }

  if (role !== 'admin' && article.status !== 'published') {
    throw new Error('Health info article not found');
  }

  return article;
}

export async function createHealthInfo(authorId: string, input: CreateHealthInfoInput) {
  return prisma.healthInfo.create({
    data: {
      title: input.title,
      content: input.content,
      category: input.category,
      status: input.status,
      authorId,
    },
    include: {
      author: { select: { id: true, fullName: true } },
    },
  });
}

export async function updateHealthInfo(id: string, input: UpdateHealthInfoInput) {
  const existing = await prisma.healthInfo.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Health info article not found');
  }

  return prisma.healthInfo.update({
    where: { id },
    data: input,
    include: {
      author: { select: { id: true, fullName: true } },
    },
  });
}

export async function deleteHealthInfo(id: string) {
  const existing = await prisma.healthInfo.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Health info article not found');
  }

  await prisma.healthInfo.delete({ where: { id } });
}
