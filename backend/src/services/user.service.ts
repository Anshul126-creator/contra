import prisma from "../database/client";

export async function listUsers(prismaClient = prisma) {
  return prismaClient.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      location: true,
    },
  });
}

export async function getUserById(id: string, prismaClient = prisma) {
  if (!id) {
    return null;
  }

  return prismaClient.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      location: true,
      website: true,
      company: true,
    },
  });
}
