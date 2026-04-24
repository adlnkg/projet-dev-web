import { LIMITS, ALLOWED_SEARCH_TYPES } from "../utils/constants.js";
import { normalizeTextValue } from "../utils/normalize.js";


const validateAndNormalizeSearch = (req, res, next) => {
  const keywords = normalizeTextValue(req.query.keywords, { minLength: 0, maxLength: LIMITS.DEFAULT_STRING, fieldName: "keywords" });
  const building = normalizeTextValue(req.query.building, { minLength: 0, maxLength: LIMITS.DEFAULT_STRING, fieldName: "building" });
  const type = normalizeTextValue(req.query.type, { minLength: 0, maxLength: LIMITS.DEFAULT_STRING, fieldName: "type" }).toLowerCase();

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