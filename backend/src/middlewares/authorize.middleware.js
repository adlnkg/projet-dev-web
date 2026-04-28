import { ROLE_HIERARCHY } from "../utils/constants.js";

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Non authentifié",
      });
    }
    allowedRoles = allowedRoles.reduce((acc, role) => {
      if (!ROLE_HIERARCHY.hasOwnProperty(role)) {
        throw new Error(`Rôle inconnu dans authorizeRoles: ${role}`);
      }
      acc.push(role);
      let parentRole = ROLE_HIERARCHY[role];
      while (parentRole) {
        acc.push(parentRole);
        parentRole = ROLE_HIERARCHY[parentRole];
      }
      return acc;
    }, []);
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Accès refusé",
      });
    }

    next();
  };
};

export default authorizeRoles;
