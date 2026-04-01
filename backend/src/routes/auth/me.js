import prisma from "../../config/db";

const me = async (req, res) => {
  const user = await prisma.user.findUnique();
};

export default me;
