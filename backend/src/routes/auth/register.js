import prisma from "../../config/db.js";
import bcrypt from "bcrypt";

const register = async (req, res) => {
  const { email, password, name } = req.body;

  const hashPassword = bcrypt.hash(password);

  const user = await prisma.user.create({
    data: {
      email: email,
      password: hashPassword,
      name: name,
    },
  });

  res.status(201).send(user);
};

export default register;
