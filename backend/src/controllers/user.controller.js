import prisma from "../config/db.js";
import bcrypt from "bcrypt";
import { getPointsHistory } from "../services/points.services.js";
import { parseBirthDateInput, toUserResponse } from "../utils/user-profile.utils.js";

export const getMe = async (req, res) => {
  try {
    // 1. Récupération de l'user complet via l'ID du token
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // 2. Extraction du mot de passe (on enlève seulement le mdp, pas l'id)
    const { password, ...safeUserData } = user;

    // 3. Réponse avec les infos du profil (public + privé + id)
    res.json(toUserResponse(safeUserData));
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération du profil" });
  }
};

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "ID invalide" });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ id }, { login: id }],
      },
      select: {
        id: true,
        login: true,
        firstName: true,
        lastName: true,
        email: true,
        birthDate: true,
        sex: true,
        avatarUrl: true,
        memberType: true,
        role: true,
        points: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable." });
    }

    res.status(200).json(toUserResponse(user));
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur." });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    console.log("updateUser - userId from params:", userId);
    console.log("updateUser - req.user.id:", req.user.id);
    console.log("updateUser - req.user.role:", req.user.role);

    // L'utilisateur peut modifier son propre profil, ou un ADMIN peut modifier n'importe quel profil
    if (userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({
        error: "Accès refusé",
      });
    }

    const {
      password,
      firstName,
      lastName,
      birthDate,
      sex,
      memberType,
      avatarUrl,
    } =
      req.body;

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

    let hashedPassword;

    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(password && { password: hashedPassword }),
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(birthDate !== undefined && { birthDate: parsedBirthDate }),
        ...(sex !== undefined && { sex }),
        ...(memberType !== undefined && { memberType }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      select: {
        id: true,
        login: true,
        firstName: true,
        lastName: true,
        birthDate: true,
        sex: true,
        memberType: true,
        avatarUrl: true,
        role: true,
      },
    });

    res.status(200).json(toUserResponse(updatedUser));
  } catch (error) {
    console.error("updateUser error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        error: "Utilisateur non trouvé",
      });
    }

    res.status(500).json({
      error: "Erreur serveur",
    });
  }
};

export const getMyPointsHistory = async (req, res) => {
  try {
    const history = await getPointsHistory(req.user.id, 200);

    return res.status(200).json({
      pointsHistory: history,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'historique des points :",
      error,
    );
    return res.status(500).json({
      error: "Erreur lors de la récupération de l'historique des points",
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    // Si l'utilisateur est connecté, vérifier qu'il est ADMIN pour les fonctionnalités avancées
    // Sinon, permettre l'accès public (pour la recherche d'utilisateurs)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        login: true,
        firstName: true,
        lastName: true,
        email: true,
        birthDate: true,
        sex: true,
        memberType: true,
        role: true,
        avatarUrl: true,
        points: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users.map(toUserResponse),
    });
  } catch (error) {
    console.error("getAllUsers error:", error);
    res.status(500).json({
      error: "Erreur serveur",
    });
  }
};

export const adminUpdateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Vérifier que l'utilisateur est ADMIN
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        error: "Accès refusé - ADMIN requis",
      });
    }

    const {
      role,
      memberType,
      firstName,
      lastName,
      birthDate,
      sex,
      avatarUrl,
    } =
      req.body;

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

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(role !== undefined && { role }),
        ...(memberType !== undefined && { memberType }),
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(birthDate !== undefined && { birthDate: parsedBirthDate }),
        ...(sex !== undefined && { sex }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      select: {
        id: true,
        login: true,
        firstName: true,
        lastName: true,
        birthDate: true,
        sex: true,
        memberType: true,
        avatarUrl: true,
        role: true,
        email: true,
        points: true,
      },
    });

    res.status(200).json({
      success: true,
      data: toUserResponse(updatedUser),
    });
  } catch (error) {
    console.error("adminUpdateUser error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        error: "Utilisateur non trouvé",
      });
    }

    res.status(500).json({
      error: "Erreur serveur",
    });
  }
};
