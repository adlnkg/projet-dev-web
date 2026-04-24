import prisma from "../config/db.js";

// Nombre de points requis pour devenir SUPER_USER
const SUPER_USER_POINTS_THRESHOLD = 100;

export const addPoints = async (
  userId,
  pointsToAdd,
  reason = "Points awarded",
) => {
  try {
    if (!userId || pointsToAdd < 0) {
      throw new Error("Paramètres invalides");
    }

    // Récupérer l'utilisateur actuel
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Calculer les nouveaux points
    const newPoints = user.points + pointsToAdd;

    // Vérifier si l'utilisateur doit être promu en SUPER_USER
    let newRole = user.role;
    if (user.role === "USER" && newPoints >= SUPER_USER_POINTS_THRESHOLD) {
      newRole = "SUPER_USER";
    }

    // Mettre à jour l'utilisateur et créer l'historique dans une transaction
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        points: newPoints,
        role: newRole,
        pointHistories: {
          create: {
            amount: pointsToAdd,
            reason: reason,
          },
        },
      },
      select: {
        id: true,
        login: true,
        role: true,
        points: true,
      },
    });

    return updatedUser;
  } catch (error) {
    console.error("Erreur lors de l'ajout de points :", error);
    throw error;
  }
};

export const removePoints = async (
  userId,
  pointsToRemove,
  reason = "Points removed",
) => {
  try {
    if (!userId || pointsToRemove < 0) {
      throw new Error("Paramètres invalides");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Calculer les nouveaux points (ne pas descendre en dessous de 0)
    const newPoints = Math.max(0, user.points - pointsToRemove);
    const actualPointsRemoved = user.points - newPoints;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        points: newPoints,
        pointHistories: {
          create: {
            amount: -actualPointsRemoved,
            reason: reason,
          },
        },
      },
      select: {
        id: true,
        login: true,
        role: true,
        points: true,
      },
    });

    return updatedUser;
  } catch (error) {
    console.error("Erreur lors du retrait de points :", error);
    throw error;
  }
};

export const getPoints = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    return user.points;
  } catch (error) {
    console.error("Erreur lors de la récupération des points :", error);
    throw error;
  }
};

export const getPointsHistory = async (userId, limit = 50) => {
  try {
    const history = await prisma.pointHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        amount: true,
        reason: true,
        createdAt: true,
      },
    });

    return history;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique :", error);
    throw error;
  }
};

export const getSuperUserThreshold = () => {
  return SUPER_USER_POINTS_THRESHOLD;
};

export const addDailyLoginPoints = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Vérifier si l'utilisateur s'est déjà connecté aujourd'hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayLogin = await prisma.pointHistory.findFirst({
      where: {
        userId,
        reason: "Connexion journalière",
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Si déjà connecté aujourd'hui, ne pas ajouter de points
    if (todayLogin) {
      return {
        pointsAdded: 0,
        message: "Les points journaliers ont déjà été récupérer",
      };
    }

    // Ajouter 10 points pour la connexion quotidienne
    const DAILY_LOGIN_POINTS = 10;
    const updatedUser = await addPoints(
      userId,
      DAILY_LOGIN_POINTS,
      "Connexion journalière",
    );

    return { pointsAdded: DAILY_LOGIN_POINTS, userUpdated: updatedUser };
  } catch (error) {
    console.error("Erreur lors de l'ajout des points de connexion :", error);
    throw error;
  }
};
