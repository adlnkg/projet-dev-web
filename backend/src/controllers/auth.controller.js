import prisma from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//PROVISOIRE A CHANGER !!!!!
export const JWT_SECRET = "UJ86MYuOsynT2n9qH8C3Al91iaKOSjwPXpW4kCd3L4m";

export const login = async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password)
      res.status(400).json({
        error: "Login et mot de passe requis. ",
      });

    const user = await prisma.user.findUnique({
      where: {
        login,
      },
    });

    if (!user) {
      res.status(404).json({
        error: "Utilisateur introuvable.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      res.status(401).json({
        error: "Mot de passe incorrect.",
      });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    });

    const { id, password: _password, ...userPublicData } = user;

    res.json({
      token,
      user: userPublicData,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Erreur serveur.",
    });
  }
};

export const register = async (req, res) => {
  try {
    const {
      login,
      password,
      name,
      firstName,
      lastName,
      sex,
      age,
      memberType,
      avatarUrl,
    } = req.body;

    if (!login || !password) {
      return res.status(400).json({
        error: "Login et mot de passe requis",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { login },
    });

    if (existingUser) {
      return res.status(400).json({
        error: "Login déjà utilisé.",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        login,
        password: hashPassword,
        lastName,
        firstName,
        sex: sex ?? null,
        age: age ?? null,
        memberType: memberType ?? null,
        avatarUrl: avatarUrl ?? null,
        role: "USER",
      },
    });

    res.status(201).json({
      id: user.id,
      login: user.login,
      lastName: user.lastName,
      firstName: user.firstName,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Erreur serveur.",
    });
  }
};
