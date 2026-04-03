import prisma from "../../config/db.js";
import bcrypt from "bcrypt";

const register = async (req, res) => {
  const { login, password, name, firstName, sex, age, memberType, avatarUrl } =
    req.body;

  const hashPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      login: login,
      password: hashPassword,
      name: name,
      firstName: firstName,
      sex: sex,
      age: age,
      memberType: memberType,
      avatarUrl: avatarUrl,
    },
  });

  res.status(201).send(user);
};

export default register;
