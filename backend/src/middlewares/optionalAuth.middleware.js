import jwt from "jsonwebtoken";

const optionalAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return next();

  try {
    const decodedUser = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedUser;
  } catch (error) {
    // Ignore invalid/expired token: user remains unauthenticated
  }

  return next();
};

export default optionalAuthMiddleware;
