import { LIMITS, ALLOWED_SEARCH_TYPES } from "../utils/constants.js";
import { normalizeTextValue, normalizeNumberValue, normalizeEnumValue } from "../utils/normalize.js";
import { ActualityType, EventType, DeviceType, DeviceStatus, AreaType } from "@prisma/client";

const normalizeEnumSearchValue = (value, allowedValues, fieldName) => {
  if (value === null || value === undefined || value === "") {
    return "ALL";
  }

  return normalizeEnumValue(value, [...allowedValues, "ALL"], fieldName);
};


const validateAndNormalizeSearch = (req, res, next) => {
  const keywords = normalizeTextValue(req.query.keywords ?? "", { minLength: 0, maxLength: LIMITS.DEFAULT_STRING, fieldName: "keywords" });
  const building = normalizeTextValue(req.query.building ?? "", { minLength: 0, maxLength: LIMITS.DEFAULT_STRING, fieldName: "building" });
  if (!req.query.type) req.query.type = "all";
  const typeRaw = normalizeTextValue(req.query.type ?? "all", { minLength: 0, maxLength: LIMITS.DEFAULT_STRING, fieldName: "type" });
  const type = typeRaw.toLowerCase();
  if (keywords.length > LIMITS.DEFAULT_STRING || building.length > LIMITS.DEFAULT_STRING) {
    return res.status(400).json({
      success: false,
      message: "Paramètres trop longs (max " + LIMITS.DEFAULT_STRING + " caractères).",
    });
  }

  if (!ALLOWED_SEARCH_TYPES.includes(type)) {
    return res.status(400).json({
      success: false,
      message: "Paramètre type invalide : (valides : " + ALLOWED_SEARCH_TYPES.join(", ") + ", reçu : " + type + ")",
    });
  }

  // Check if unauthorized user tries to search for devices
  if (!req.user && type === "device") {
    return res.status(401).json({
      success: false,
      message: "Authentification requise pour rechercher des périphériques IoT.",
    });
  }

  // Normalize "all" type: exclude device if user not authenticated
  let finalType = type;
  if (type === "all" && !req.user) {
    finalType = "all-unauthenticated"; // Special flag to indicate "all without device"
  }

  req.searchFilters = { keywords, building, type: finalType };
  next();
};

const validateAndNormalizeActualitySearch = (req, res, next) => {
  try {
    const keywords = normalizeTextValue(req.query.keywords ?? "", { minLength: 0, maxLength: LIMITS.DEFAULT_STRING, fieldName: "keywords" });
    const type = normalizeEnumSearchValue(req.query.type, Object.values(ActualityType), "type");

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

const validateAndNormalizeEventSearch = (req, res, next) => {
  try {
    const keywords = normalizeTextValue(req.query.keywords ?? "", { minLength: 0, maxLength: LIMITS.DEFAULT_STRING, fieldName: "keywords" });
    const building = normalizeTextValue(req.query.building ?? "", { minLength: 0, maxLength: LIMITS.DEFAULT_STRING, fieldName: "building" });
    const type = normalizeEnumSearchValue(req.query.type, Object.values(EventType), "type");

    const startMinRaw = req.query.startMin;
    const startMaxRaw = req.query.startMax;
    const startMin = startMinRaw ? new Date(startMinRaw) : null;
    const startMax = startMaxRaw ? new Date(startMaxRaw) : null;

    if (startMinRaw && Number.isNaN(startMin.getTime())) {
      return res.status(400).json({ success: false, message: "Paramètre startMin invalide (date attendue)." });
    }
    if (startMaxRaw && Number.isNaN(startMax.getTime())) {
      return res.status(400).json({ success: false, message: "Paramètre startMax invalide (date attendue)." });
    }
    if (startMin && startMax && startMin > startMax) {
      return res.status(400).json({ success: false, message: "startMin doit être antérieur ou égal à startMax." });
    }

    let priceMin = null;
    let priceMax = null;
    if (req.query.priceMin !== undefined) {
      try {
        priceMin = normalizeNumberValue(req.query.priceMin, { min: 0, fieldName: "priceMin" });
      } catch (e) {
        return res.status(400).json({ success: false, message: e.message });
      }
    }
    if (req.query.priceMax !== undefined) {
      try {
        priceMax = normalizeNumberValue(req.query.priceMax, { min: 0, fieldName: "priceMax" });
      } catch (e) {
        return res.status(400).json({ success: false, message: e.message });
      }
    }

    if (priceMin !== null && priceMax !== null && priceMin > priceMax) {
      return res.status(400).json({ success: false, message: "priceMin doit être inférieur ou égal à priceMax." });
    }

    let spotsMin = null;
    if (req.query.spotsMin !== undefined) {
      try {
        spotsMin = normalizeNumberValue(req.query.spotsMin, { min: 0, integer: true, fieldName: "spotsMin" });
      } catch (e) {
        return res.status(400).json({ success: false, message: e.message });
      }
    }

    req.eventSearchFilters = { keywords, building, type, startMin, startMax, priceMin, priceMax, spotsMin };
    next();
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const validateAndNormalizeAreaSearch = (req, res, next) => {
  try {
    const keywords = normalizeTextValue(req.query.keywords ?? "", { minLength: 0, maxLength: LIMITS.DEFAULT_STRING, fieldName: "keywords" });
    const building = normalizeTextValue(req.query.building ?? "", { minLength: 0, maxLength: LIMITS.DEFAULT_STRING, fieldName: "building" });
    const type = normalizeEnumSearchValue(req.query.type, Object.values(AreaType), "type");

    req.areaSearchFilters = { keywords, building, type };
    next();
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const validateAndNormalizeIoTDeviceSearch = (req, res, next) => {
  try {
    const keywords = normalizeTextValue(req.query.keywords ?? "", { minLength: 0, maxLength: LIMITS.DEFAULT_STRING, fieldName: "keywords" });
    const building = normalizeTextValue(req.query.building ?? "", { minLength: 0, maxLength: LIMITS.DEFAULT_STRING, fieldName: "building" });
    const type = normalizeEnumSearchValue(req.query.type, Object.values(DeviceType), "type");

    const status = normalizeEnumSearchValue(req.query.status, Object.values(DeviceStatus), "status");

    let active = null;
    if (req.query.active !== undefined) {
      if (req.query.active === "true") {
        active = true;
      } else if (req.query.active === "false") {
        active = false;
      } else {
        return res.status(400).json({ success: false, message: "Paramètre active doit être 'true' ou 'false'." });
      }
    }

    let consumptionMin = null;
    let consumptionMax = null;
    if (req.query.consumptionMin !== undefined) {
      try {
        consumptionMin = normalizeNumberValue(req.query.consumptionMin, { min: 0, fieldName: "consumptionMin" });
      } catch (e) {
        return res.status(400).json({ success: false, message: e.message });
      }
    }
    if (req.query.consumptionMax !== undefined) {
      try {
        consumptionMax = normalizeNumberValue(req.query.consumptionMax, { min: 0, fieldName: "consumptionMax" });
      } catch (e) {
        return res.status(400).json({ success: false, message: e.message });
      }
    }
    if (consumptionMin !== null && consumptionMax !== null && consumptionMin > consumptionMax) {
      return res.status(400).json({ success: false, message: "consumptionMin doit être inférieur ou égal à consumptionMax." });
    }

    const lastPowerOnAfterRaw = req.query.lastPowerOnAfter;
    const lastMaintenanceAfterRaw = req.query.lastMaintenanceAfter;

    const lastPowerOnAfter = lastPowerOnAfterRaw ? new Date(lastPowerOnAfterRaw) : null;
    const lastMaintenanceAfter = lastMaintenanceAfterRaw ? new Date(lastMaintenanceAfterRaw) : null;

    if (lastPowerOnAfterRaw && Number.isNaN(lastPowerOnAfter.getTime())) {
      return res.status(400).json({ success: false, message: "Paramètre lastPowerOnAfter invalide (date attendue)." });
    }
    if (lastMaintenanceAfterRaw && Number.isNaN(lastMaintenanceAfter.getTime())) {
      return res.status(400).json({ success: false, message: "Paramètre lastMaintenanceAfter invalide (date attendue)." });
    }

    req.iotDeviceSearchFilters = {
      keywords,
      building,
      type,
      status,
      active,
      consumptionMin,
      consumptionMax,
      lastPowerOnAfter,
      lastMaintenanceAfter,
    };
    next();
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export { validateAndNormalizeSearch, validateAndNormalizeActualitySearch, validateAndNormalizeEventSearch, validateAndNormalizeAreaSearch, validateAndNormalizeIoTDeviceSearch };