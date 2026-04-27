import { LIMITS, ALLOWED_SEARCH_TYPES } from "../utils/constants.js";
import { normalizeTextValue } from "../utils/normalize.js";
import { ActualityType } from "@prisma/client";


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

const validateAndNormalizeActualitySearch = (req, res, next) => {
  try {
    const keywords = normalizeTextValue(req.query.keywords ?? "", { minLength: 0, maxLength: LIMITS.DEFAULT_STRING, fieldName: "keywords" });
    const typeRaw = normalizeTextValue(req.query.type ?? "all", { minLength: 0, maxLength: LIMITS.DEFAULT_STRING, fieldName: "type" });
    const type = typeRaw.toUpperCase();

    const allowedTypes = Object.values(ActualityType);
    if (type !== "ALL" && !allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Paramètre type invalide : (valides : all, ${allowedTypes.join(", ")}, reçu : ${typeRaw})`,
      });
    }

    const createdFromRaw = req.query.createdFrom;
    const createdToRaw = req.query.createdTo;

    const createdFrom = createdFromRaw ? new Date(createdFromRaw) : null;
    const createdTo = createdToRaw ? new Date(createdToRaw) : null;

    if (createdFromRaw && Number.isNaN(createdFrom.getTime())) {
      return res.status(400).json({ success: false, message: "Paramètre createdFrom invalide (date attendue)." });
    }

    if (createdToRaw && Number.isNaN(createdTo.getTime())) {
      return res.status(400).json({ success: false, message: "Paramètre createdTo invalide (date attendue)." });
    }

    if (createdFrom && createdTo && createdFrom > createdTo) {
      return res.status(400).json({ success: false, message: "createdFrom doit être antérieur ou égal à createdTo." });
    }

    req.actualitySearchFilters = {
      keywords,
      type,
      createdFrom,
      createdTo,
    };

    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export { validateAndNormalizeSearch, validateAndNormalizeActualitySearch };