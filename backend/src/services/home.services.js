import prisma from "../config/db.js";

const getHomepageFeed = async ({ actualityLimit = 10 } = {}) => {
  const actualities = await prisma.actuality.findMany({
    take: actualityLimit,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      owner: {
        select: {
          id: true,
          login: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return {
    actualities,
  };
};

export default {
  getHomepageFeed,
};
