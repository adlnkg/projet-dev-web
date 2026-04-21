import prisma from "../config/db.js";

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

export const getUserProfile = (req, res) => {
  try {
    const user = prisma.user.findUnique({ where: { id: req.params.id } });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable." });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur." });
  }
};
