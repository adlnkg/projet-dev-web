import { LIMITS, ALLOWED_SEARCH_TYPES } from "../utils/constants.js";

const normalizeQueryValue = (value) => {
  if (typeof value === "string") return value.trim();
  return "";
};

const validateAndNormalizeSearch = (req, res, next) => {
  const keywords = normalizeQueryValue(req.query.keywords);
  const building = normalizeQueryValue(req.query.building);
  const type = normalizeQueryValue(req.query.type).toLowerCase();

  if (keywords.length > LIMITS.DEFAULT_STRING || building.length > LIMITS.DEFAULT_STRING) {
    return res.status(400).json({
      success: false,
      message: "Paramètres trop longs",
    });
  }

  if (type && !ALLOWED_SEARCH_TYPES.includes(type)) {
    return res.status(400).json({
      success: false,
      message: "Paramètre type invalide : (valides : " + ALLOWED_SEARCH_TYPES.join(", ") + ", reçu : " + type + ")",

    });
  }

  req.searchFilters = { keywords, building, type };
  console.log("Search filters received in middleware:", req.searchFilters); // Debug log to check received filters
  console.log("Search filters query params:", req.query); // Debug log to check original query params
  next();
};

export { validateAndNormalizeSearch };