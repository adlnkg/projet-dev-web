import prisma from "../config/db.js";
import bcrypt from "bcrypt";

export const getMe = async (req, res) => {
  try {
    // 1. Récupération de l'user complet via l'ID du token
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // 2. Extraction des données sensibles (on enlève mdp et id comme demandé)
    const { password, id, ...safeUserData } = user;

    // 3. Réponse avec les infos du profil (public + privé)
    res.json(safeUserData);
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

    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        login: true,
        age: true,
        sex: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable." });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur." });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (userId !== req.user.id || req.user.role !== "ADMIN") {
      res.status(403).json({
        error: "Accès refusé",
      });
    }

    const { password, firstName, lastName, age, sex, memberType, avatarUrl } =
      req.body;

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
        ...(age !== undefined && { age }),
        ...(sex !== undefined && { sex }),
        ...(memberType !== undefined && { memberType }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      select: {
        id: true,
        login: true,
        firstName: true,
        lastName: true,
        age: true,
        sex: true,
        memberType: true,
        avatarUrl: true,
        role: true,
      },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Erreur serveur",
    });
  }
};
