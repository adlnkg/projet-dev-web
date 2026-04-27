import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token)
    return res.status(401).json({
      error: "Accès refusé, aucun token de connexion fourni.",
    });

  try {
    const decodedUser = jwt.verify(token, process.env.JWT_SECRET);

    console.log(decodedUser);

    req.user = decodedUser;

    next();
  } catch (error) {
    return res.status(403).json({
      error: "Session expirée ou token invalide.",
    });
  }
};

export default authMiddleware;
