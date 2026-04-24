import prisma from "../config/db.js";
import { normalizeTextValue, normalizeNumberValue, normalizeEnumValue, normalizeRawUpdatePayload } from "../utils/normalize.js";
import { DEVICE_STATUS_VALUES, DEVICE_TYPES, THERMOSTAT_MODE_VALUES } from "../utils/constants.js";

//! WARNING : any changes must be reflected :
// - in the database schema and corresponding migrations 
// - DEVICE_TYPE_FIELD_DEFINITIONS, GENERAL_FIELD_DEFINITIONS, EDITABLE_FIELDS_KEYS_BY_ROLE,
//  DEVICE_TYPE_SUPPORT below
// - buildDeviceSpecificPayload(), buildDeviceResponse(), getDeviceForUpdate() and validateAndBuildUpdates() below



const GENERAL_FIELD_DEFINITIONS = {
  id: {
    key: "id",
    label: "Identifiant",
    kind: "number",
    editableBy: [],
    readOnly: true,
    section: "general",
  },
  name: {
    key: "name",
    label: "Nom",
    kind: "text",
    minLength: 1,
    maxLength: 120,
    editableBy: ["ADMIN"],
    section: "general",
  },
  description: {
    key: "description",
    label: "Description",
    kind: "textarea",
    minLength: 1,
    maxLength: 500,
    editableBy: ["ADMIN"],
    section: "general",
  },
  createdAt: {
    key: "createdAt",
    label: "Créé le",
    kind: "datetime",
    editableBy: [],
    readOnly: true,
    section: "general",
  },
  brand: {
    key: "brand",
    label: "Marque",
    kind: "text",
    minLength: 1,
    maxLength: 80,
    editableBy: ["ADMIN"],
    section: "general",
  },
  model: {
    key: "model",
    label: "Modèle",
    kind: "text",
    minLength: 1,
    maxLength: 80,
    editableBy: ["ADMIN"],
    section: "general",
  },
  status: {
    key: "status",
    label: "Statut",
    kind: "select",
    options: DEVICE_STATUS_VALUES,
    editableBy: ["SUPER_USER", "ADMIN"],
    section: "general",
  },
  type: {
    key: "type",
    label: "Type",
    kind: "select",
    options: DEVICE_TYPES,
    editableBy: [],
    readOnly: true,
    section: "general",
  },
};

const DEVICE_TYPE_FIELD_DEFINITIONS = {
  LIGHT: [
    {
      key: "light.brightness",
      label: "Luminosité",
      kind: "number",
      min: 0,
      max: 100,
      step: 1,
      editableBy: ["SUPER_USER"],
      section: "specific",
      source: "light",
      field: "brightness",
    },
    {
      key: "light.color",
      label: "Couleur",
      kind: "text",
      minLength: 1,
      maxLength: 32,
      editableBy: ["SUPER_USER"],
      section: "specific",
      source: "light",
      field: "color",
    },
  ],
  SENSOR: [
    {
      key: "sensor.value",
      label: "Valeur",
      kind: "number",
      readOnly: true,
      editableBy: [],
      section: "specific",
      source: "sensor",
      field: "value",
    },
    {
      key: "sensor.timestamp",
      label: "Horodatage",
      kind: "datetime",
      readOnly: true,
      editableBy: [],
      section: "specific",
      source: "sensor",
      field: "timestamp",
    },
  ],
  THERMOSTAT: [
    {
      key: "thermostat.temperature",
      label: "Température mesurée",
      kind: "number",
      readOnly: true,
      editableBy: [],
      section: "specific",
      source: "thermostat",
      field: "temperature",
    },
    {
      key: "thermostat.targetTemp",
      label: "Température cible",
      kind: "number",
      min: 5,
      max: 35,
      step: 0.5,
      editableBy: ["SUPER_USER"],
      section: "specific",
      source: "thermostat",
      field: "targetTemp",
    },
    {
      key: "thermostat.mode",
      label: "Mode",
      kind: "select",
      options: THERMOSTAT_MODE_VALUES,
      editableBy: ["SUPER_USER"],
      section: "specific",
      source: "thermostat",
      field: "mode",
    },
  ],
  WHITEBOARD: [
    {
      key: "whiteboard.resolution",
      label: "Résolution",
      kind: "text",
      readOnly: true,
      editableBy: [],
      section: "specific",
      source: "whiteboard",
      field: "resolution",
    },
    {
      key: "whiteboard.screenSize",
      label: "Taille d'écran",
      kind: "number",
      readOnly: true,
      editableBy: [],
      section: "specific",
      source: "whiteboard",
      field: "screenSize",
    },
  ],
  CAMERA: [
    {
      key: "camera.resolution",
      label: "Résolution",
      kind: "text",
      readOnly: true,
      editableBy: [],
      section: "specific",
      source: "camera",
      field: "resolution",
    },
    {
      key: "camera.frameRate",
      label: "Fréquence d'images",
      kind: "number",
      readOnly: true,
      editableBy: [],
      section: "specific",
      source: "camera",
      field: "frameRate",
    },
  ],
  ACCESS_CONTROL: [
    {
      key: "accessControl.status",
      label: "Statut de contrôle d'accès",
      kind: "text",
      readOnly: true,
      editableBy: [],
      section: "specific",
      source: "accessControl",
      field: "status",
    },
  ],
};

const FIELD_LOOKUP = new Map(
  Object.values(GENERAL_FIELD_DEFINITIONS)
    .concat(Object.values(DEVICE_TYPE_FIELD_DEFINITIONS).flat())
    .map((definition) => [definition.key, definition]),
);

const EDITABLE_FIELD_KEYS_BY_ROLE = {
  USER: [],
  SUPER_USER: ["status", "light.brightness", "light.color", "thermostat.targetTemp", "thermostat.mode"],
  ADMIN: ["name", "description", "brand", "model", "status", "light.brightness", "light.color", "thermostat.targetTemp", "thermostat.mode",],
};

const DEVICE_TYPE_SUPPORT = {
  LIGHT: {
    label: "Lampe",
    editableFieldKeys: ["status", "light.brightness", "light.color"],
  },
  SENSOR: {
    label: "Capteur",
    editableFieldKeys: ["status"],
  },
  THERMOSTAT: {
    label: "Thermostat",
    editableFieldKeys: ["status", "thermostat.targetTemp", "thermostat.mode"],
  },
  CAMERA: {
    label: "Caméra",
    editableFieldKeys: ["status"],
  },
  ACCESS_CONTROL: {
    label: "Contrôle d'accès",
    editableFieldKeys: ["status"],
  },
  WHITEBOARD: {
    label: "Tableau blanc",
    editableFieldKeys: ["status"],
  },
};

/** get editable field keys for a given role and device type, by intersecting the role's editable keys with the device type's supported keys */
const getEditableFieldKeys = (role, deviceType) => {
  const roleEditableKeys = EDITABLE_FIELD_KEYS_BY_ROLE[role] ?? [];
  const supportedKeys = DEVICE_TYPE_SUPPORT[deviceType]?.editableFieldKeys ?? []; // "?." access .editableFieldKeys only if DEVICE_TYPE_SUPPORT[deviceType] is defined

  return roleEditableKeys.filter((fieldKey) => supportedKeys.includes(fieldKey));
};

/** 
 * Builds a device-specific payload object based on the device type, extracting only the relevant fields for that type.
 * 
 * @param {object} device - The device object containing all fields, including type-specific ones.
 * @returns {object} An object containing only the fields relevant to the device's type, with null values for missing fields.
*/
const buildDeviceSpecificPayload = (device) => {
  switch (device.type) {
    case "LIGHT":
      return {
        brightness: device.light?.brightness ?? null,
        color: device.light?.color ?? null,
      };
    case "SENSOR":
      return {
        value: device.sensor?.value ?? null,
        timestamp: device.sensor?.timestamp ?? null,
      };
    case "THERMOSTAT":
      return {
        temperature: device.thermostat?.temperature ?? null,
        targetTemp: device.thermostat?.targetTemp ?? null,
        mode: device.thermostat?.mode ?? null,
      };
    case "WHITEBOARD":
      return {
        resolution: device.whiteboard?.resolution ?? null,
        screenSize: device.whiteboard?.screenSize ?? null,
      };
    case "CAMERA":  //TODO
    case "ACCESS_CONTROL":
    default:
      return {};
  }
};

/** Builds the form fields for a device based on its type and the user's role.
 * @param {object} device - The device object retrieved from the database.
 * @param {string} role - The role of the user making the request.
 * @returns {Array} An array of form field objects, including both general fields and type-specific fields, with values and editability determined by the user's role.
 */
const buildDeviceFormFields = (device, role) => {
  const editableFieldKeys = new Set(getEditableFieldKeys(role, device.type));
  const specificValues = buildDeviceSpecificPayload(device);

  const generalFields = Object.values(GENERAL_FIELD_DEFINITIONS).map((definition) => ({
    ...definition,
    value: device[definition.key] ?? null,
    editable: editableFieldKeys.has(definition.key),
  }));

  const specificFields = (DEVICE_TYPE_FIELD_DEFINITIONS[device.type] ?? []).map((definition) => ({
    ...definition,
    value: specificValues[definition.field] ?? null,
    editable: editableFieldKeys.has(definition.key),
  }));

  return [...generalFields, ...specificFields];
};

/** Builds a response object for a device, including its general attributes, type-specific attributes, and form configuration based on the user's role.
 * @param {object} device - The device object retrieved from the database, containing all fields and relations.
 * @param {string} role - The role of the user making the request, used to determine editable fields in the response.
 * @returns {object} An object containing the device's details, including general attributes, type-specific attributes, and form configuration.
 */
const buildDeviceResponse = (device, role) => ({
  id: device.id,
  name: device.name,
  description: device.description,
  createdAt: device.createdAt,
  brand: device.brand,
  model: device.model,
  status: device.status,
  type: device.type,
  area: device.area
    ? {
      id: device.area.id,
      name: device.area.name,
      description: device.area.description,
      type: device.area.type,
    }
    : null,
  specific: buildDeviceSpecificPayload(device),
  form: {
    role,
    editableFieldKeys: getEditableFieldKeys(role, device.type),
    fields: buildDeviceFormFields(device, role),
    supportedSpecificFields: (DEVICE_TYPE_FIELD_DEFINITIONS[device.type] ?? []).map((field) => field.key),
  },
});


const getDeviceForUpdate = async (deviceId) => prisma.ioTDevice.findUnique({
  where: { id: deviceId },
  include: {
    area: true,
    sensor: true,
    whiteboard: true,
    light: true,
    thermostat: true,
    camera: true,
    accessControl: true,
  },
});

/** Retrieves detailed information about a specific device, including its general attributes, type-specific attributes, and form configuration based on the user's role.
 * @param {number} deviceId - The unique identifier of the device to retrieve.
 * @param {string} role - The role of the user making the request, used to determine editable fields in the response.
 * @returns {object} An object containing the device's details, including general attributes, type-specific attributes, and form configuration.
 * @throws {Error} If the device with the specified ID is not found, an error with status code 404 is thrown.
 * @example
 * // Example usage:
 * const deviceDetails = await getDeviceDetails(123, "SUPER_USER");
 * console.log(deviceDetails);
 */
const getDeviceDetails = async (deviceId, role) => {
  const device = await getDeviceForUpdate(deviceId);

  if (!device) {
    const error = new Error("Appareil introuvable.");
    error.statusCode = 404;
    throw error;
  }

  return buildDeviceResponse(device, role);
};

const validateAndBuildUpdates = (device, role, payload) => {
  const flattenedPayload = normalizeRawUpdatePayload(payload);
  const allowedFieldDefinitions = new Map([
    ...Object.values(GENERAL_FIELD_DEFINITIONS),
    ...(DEVICE_TYPE_FIELD_DEFINITIONS[device.type] ?? []),
  ].map((definition) => [definition.key, definition]));

  const editableFieldKeys = new Set(getEditableFieldKeys(role, device.type));
  const providedKeys = Object.keys(flattenedPayload);
  const unknownKeys = [];
  const forbiddenKeys = [];
  const validationErrors = [];
  const generalUpdates = {};
  const lightUpdates = {};
  const thermostatUpdates = {};
  const cameraUpdates = {};
  const accessControlUpdates = {};


  for (const key of providedKeys) {
    const definition = allowedFieldDefinitions.get(key);
    const value = flattenedPayload[key];

    if (!definition) {
      unknownKeys.push(key);
      continue;
    }

    if (definition.readOnly) {
      continue;
    }

    if (!editableFieldKeys.has(key)) {
      forbiddenKeys.push(key);
      continue;
    }

    try {
      switch (key) {
        case "name":
        case "description":
        case "brand":
        case "model":
          generalUpdates[key] = normalizeTextValue(value, {
            minLength: definition.minLength ?? 1,
            maxLength: definition.maxLength,
            fieldName: definition.label,
          });
          break;
        case "status":
          generalUpdates.status = normalizeEnumValue(value, DEVICE_STATUS_VALUES, definition.label);
          break;
        case "light.brightness":
          lightUpdates.brightness = normalizeNumberValue(value, {
            min: definition.min ?? 0,
            max: definition.max ?? 100,
            step: definition.step ?? 1,
            integer: true,
            fieldName: definition.label,
          });
          break;
        case "light.color":
          lightUpdates.color = normalizeTextValue(value, {
            minLength: definition.minLength ?? 1,
            maxLength: definition.maxLength,
            fieldName: definition.label,
          });
          break;
        case "thermostat.targetTemp":
          thermostatUpdates.targetTemp = normalizeNumberValue(value, {
            min: definition.min ?? 5,
            max: definition.max ?? 35,
            step: definition.step ?? 0.5,
            fieldName: definition.label,
          });
          break;
        case "thermostat.mode":
          thermostatUpdates.mode = normalizeEnumValue(value, THERMOSTAT_MODE_VALUES, definition.label);
          break;
        default:
          unknownKeys.push(key);
      }
    } catch (error) {
      validationErrors.push(error.message);
    }
  }

  if (unknownKeys.length > 0) {
    const error = new Error(`Champ(s) non reconnu(s) pour cet appareil: ${unknownKeys.join(", ")}.`);
    error.statusCode = 400;
    throw error;
  }

  if (forbiddenKeys.length > 0) {
    const error = new Error(`Rôle ${role} non autorisé à modifier: ${forbiddenKeys.join(", ")}.`);
    error.statusCode = 403;
    throw error;
  }

  if (validationErrors.length > 0) {
    const error = new Error(validationErrors.join(" "));
    error.statusCode = 400;
    throw error;
  }

  const specificUpdates = {};
  if (Object.keys(lightUpdates).length > 0) {
    if (device.type !== "LIGHT") {
      const error = new Error("Les champs de lampe ne sont disponibles que pour les appareils de type LIGHT.");
      error.statusCode = 400;
      throw error;
    }
    specificUpdates.light = lightUpdates;
  }

  if (Object.keys(thermostatUpdates).length > 0) {
    if (device.type !== "THERMOSTAT") {
      const error = new Error("Les champs de thermostat ne sont disponibles que pour les appareils de type THERMOSTAT.");
      error.statusCode = 400;
      throw error;
    }
    specificUpdates.thermostat = thermostatUpdates;
  }

  if (Object.keys(generalUpdates).length === 0 && Object.keys(specificUpdates).length === 0) {
    const error = new Error("Aucun champ modifiable valide n'a été fourni.");
    error.statusCode = 400;
    throw error;
  }

  return { generalUpdates, specificUpdates };
};

const updateDevice = async (deviceId, role, payload) => {
  const device = await getDeviceForUpdate(deviceId);

  if (!device) {
    const error = new Error("Appareil introuvable.");
    error.statusCode = 404;
    throw error;
  }

  const { generalUpdates, specificUpdates } = validateAndBuildUpdates(device, role, payload);

  await prisma.$transaction(async (transaction) => {
    if (Object.keys(generalUpdates).length > 0) {
      await transaction.ioTDevice.update({
        where: { id: deviceId },
        data: generalUpdates,
      });
    }

    if (specificUpdates.light) {
      await transaction.light.update({
        where: { deviceId },
        data: specificUpdates.light,
      });
    }

    if (specificUpdates.thermostat) {
      await transaction.thermostat.update({
        where: { deviceId },
        data: specificUpdates.thermostat,
      });
    }
  });

  return getDeviceDetails(deviceId, role);
};

export default {
  getDeviceDetails,
  updateDevice,
  DEVICE_STATUS_VALUES,
  DEVICE_TYPES,
  THERMOSTAT_MODE_VALUES,
};
