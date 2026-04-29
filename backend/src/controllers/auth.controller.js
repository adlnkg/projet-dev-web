import prisma from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateOTP } from "../utils/otp.js";
import { sendOTP } from "../services/mailer.services.js";
import { addDailyLoginPoints } from "../services/points.services.js";
import { parseBirthDateInput, toUserResponse } from "../utils/user-profile.utils.js";

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

    if (!user.isVerified) {
      const otp = generateOTP();
      const p1 = prisma.user.update({
        where: { id: user.id },
        data: {
          otp,
          otpExpires: new Date(Date.now() + 5 * 60 * 1000), // 5 min
        },
      });
      const p2 = sendOTP(user.email, otp);
      await Promise.all([p1, p2]);
    }

    // Ajouter les points de connexion quotidienne
    if (user.isVerified) {
      try {
        await addDailyLoginPoints(user.id);
      } catch (pointsError) {
        console.warn(
          "Erreur lors de l'ajout des points de connexion :",
          pointsError,
        );
        // Ne pas bloquer la connexion si l'ajout de points échoue
      }
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, isVerified: user.isVerified },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    const { id, password: _password, ...userPublicData } = user;

    res.json({
      token,
      user: toUserResponse(userPublicData),
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
    console.log(req.body);
    
    const {
      login,
      password,
      email,
      lastName,
      firstName,
      sex,
      birthDate,
      memberType,
    } = req.body;
    const avatarUrl = req.uploadedImageUrl;

    let parsedBirthDate;
    try {
      parsedBirthDate = parseBirthDateInput(birthDate);
    } catch (birthDateError) {
      if (birthDateError.message === "INVALID_BIRTH_DATE") {
        return res.status(400).json({
          error: "Date de naissance invalide",
        });
      }

      throw birthDateError;
    }

    if (!login || !password || !email) {
      return res.status(400).json({
        error: "Login, email et mot de passe requis",
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ login }, { email }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        error: "Login ou email déjà utilisé",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const otp = generateOTP();

    const user = await prisma.user.create({
      data: {
        login,
        email,
        password: hashPassword,
        lastName,
        firstName,
        sex: sex ?? null,
        birthDate: parsedBirthDate ?? null,
        memberType: memberType ?? null,
        avatarUrl: avatarUrl ?? null,
        role: "USER",
        otp,
        otpExpires: new Date(Date.now() + 5 * 60 * 1000), // 5 min
        isVerified: false,
      },
    });

    await sendOTP(email, otp);

    res.status(201).json({
      message: "Utilisateur créé. Vérifiez votre email.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      details : error.message, 
      test: req.body,
      error: "Erreur serveur.",
    });
  }
};

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(404).json({ error: "Utilisateur introuvable" });
  }

  if (user.otp !== otp) {
    return res.status(400).json({ error: "OTP invalide" });
  }

  if (new Date() > user.otpExpires) {
    return res.status(400).json({ error: "OTP expiré" });
  }

  await prisma.user.update({
    where: { email },
    data: {
      isVerified: true,
      otp: null,
      otpExpires: null,
    },
  });

  res.status(200).json({ message: "Compte vérifié" });
};
