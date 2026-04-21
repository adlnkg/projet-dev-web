import prisma from "../config/db.js";

export const awardPoints = async (userId, amount, reason) => {
  return await prisma.$transaction([
    prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        points: { increment: amount },
      },
    }),
    prisma.pointHistory.create({
      data: {
        userId,
        amount,
        reason,
      },
    }),
  ]);
};
