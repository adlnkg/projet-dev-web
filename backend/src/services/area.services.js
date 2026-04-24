import prisma from "../config/db.js";
import {
  normalizeTextValue,
  normalizeNumberValue,
} from "../utils/normalize.js";
import { AREA_TYPES } from "../utils/constants.js";
import {
  getEditableFieldKeys,
  buildFormFields,
  validateAndBuildUpdates,
} from "./resource-common.services.js";

const GENERAL_FIELD_DEFINITIONS = {
  id: {
    key: "id",
    label: "Identifiant",
    kind: "number",
    readOnly: true,
    section: "general",
  },
  name: {
    key: "name",
    label: "Nom",
    kind: "text",
    minLength: 1,
    maxLength: 120,
    section: "general",
  },
  description: {
    key: "description",
    label: "Description",
    kind: "textarea",
    minLength: 1,
    maxLength: 500,
    section: "general",
  },
  type: {
    key: "type",
    label: "Type",
    kind: "select",
    options: AREA_TYPES,
    readOnly: true,
    section: "general",
  },
  imageUrl: {
    key: "imageUrl",
    label: "Image",
    kind: "text",
    minLength: 1,
    maxLength: 255,
    section: "general",
  },
  parentAreaId: {
    key: "parentAreaId",
    label: "Zone parente",
    kind: "number",
    readOnly: true,
    section: "general",
  },
};

const AREA_TYPE_FIELD_DEFINITIONS = {
  BUILDING: [
    {
      key: "building.address",
      label: "Adresse",
      kind: "text",
      minLength: 3,
      maxLength: 200,
      section: "specific",
      source: "building",
      field: "address",
    },
  ],
  FLOOR: [
    {
      key: "floor.floorNumber",
      label: "Numero d'etage",
      kind: "number",
      min: 0,
      max: 100,
      step: 1,
      section: "specific",
      source: "floor",
      field: "floorNumber",
    },
  ],
  CLASSROOM: [
    {
      key: "classroom.classroomNumber",
      label: "Numero de salle",
      kind: "number",
      min: 1,
      max: 9999,
      step: 1,
      section: "specific",
      source: "classroom",
      field: "classroomNumber",
    },
  ],
  TECHNICAL_ROOM: [
    {
      key: "technicalRoom.roomNumber",
      label: "Numero de local technique",
      kind: "number",
      min: 1,
      max: 9999,
      step: 1,
      section: "specific",
      source: "technicalRoom",
      field: "roomNumber",
    },
  ],
};

const EDITABLE_FIELD_KEYS_BY_ROLE = {
  USER: [],
  SUPER_USER: [
    "building.address",
    "floor.floorNumber",
    "classroom.classroomNumber",
    "technicalRoom.roomNumber",
  ],
  ADMIN: ["name", "description", "imageUrl"],
};

const AREA_TYPE_SUPPORT = {
  BUILDING: {
    editableFieldKeys: ["name", "description", "imageUrl", "building.address"],
  },
  FLOOR: {
    editableFieldKeys: ["name", "description", "imageUrl", "floor.floorNumber"],
  },
  CLASSROOM: {
    editableFieldKeys: ["name", "description", "imageUrl", "classroom.classroomNumber"],
  },
  TECHNICAL_ROOM: {
    editableFieldKeys: ["name", "description", "imageUrl", "technicalRoom.roomNumber"],
  },
};

const AREA_FIELD_VALIDATORS = {
  name: (value, definition) => normalizeTextValue(value, {
    minLength: definition.minLength ?? 1,
    maxLength: definition.maxLength,
    fieldName: definition.label,
  }),
  description: (value, definition) => normalizeTextValue(value, {
    minLength: definition.minLength ?? 1,
    maxLength: definition.maxLength,
    fieldName: definition.label,
  }),
  imageUrl: (value, definition) => normalizeTextValue(value, {
    minLength: definition.minLength ?? 1,
    maxLength: definition.maxLength,
    fieldName: definition.label,
  }),
  "building.address": (value, definition) => normalizeTextValue(value, {
    minLength: definition.minLength ?? 1,
    maxLength: definition.maxLength,
    fieldName: definition.label,
  }),
  "floor.floorNumber": (value, definition) => normalizeNumberValue(value, {
    min: definition.min,
    max: definition.max,
    step: definition.step,
    integer: true,
    fieldName: definition.label,
  }),
  "classroom.classroomNumber": (value, definition) => normalizeNumberValue(value, {
    min: definition.min,
    max: definition.max,
    step: definition.step,
    integer: true,
    fieldName: definition.label,
  }),
  "technicalRoom.roomNumber": (value, definition) => normalizeNumberValue(value, {
    min: definition.min,
    max: definition.max,
    step: definition.step,
    integer: true,
    fieldName: definition.label,
  }),
};

/**
 * Builds the specific payload for an area based on its type.
 * @param {object} area - The area object for which to build the specific payload.
 * @returns {object} The specific payload for the area.
 */
const buildAreaSpecificPayload = (area) => {
  switch (area.type) {
    case "BUILDING":
      return {
        address: area.building?.address ?? null,
      };
    case "FLOOR":
      return {
        floorNumber: area.floor?.floorNumber ?? null,
      };
    case "CLASSROOM":
      return {
        classroomNumber: area.classroom?.classroomNumber ?? null,
      };
    case "TECHNICAL_ROOM":
      return {
        roomNumber: area.technicalRoom?.roomNumber ?? null,
      };
    default:
      return {};
  }
};

/**
 * Retrieves an area by its ID, including related parent area and specific area type information, for the purpose of updating it.
 * @param {number} areaId - The ID of the area to retrieve.
 * @returns {object|null} The area object with related data, or null if not found.
 */
const getAreaForUpdate = async (areaId) => prisma.area.findUnique({
  where: { id: areaId },
  include: {
    parentArea: true,
    building: true,
    floor: true,
    classroom: true,
    technicalRoom: true,
  },
});

/**
 * Builds the response object for an area, including its details and form configuration based on the user's role.
 * @param {object} area - The area object to build the response for.
 * @param {string} role - The role of the user requesting the area details (e.g., "USER", "SUPER_USER", "ADMIN").
 * @returns {object} The response object containing area details and form configuration.
 */
const buildAreaResponse = (area, role) => {
  const editableFieldKeys = getEditableFieldKeys({
    role,
    entityType: area.type,
    editableFieldKeysByRole: EDITABLE_FIELD_KEYS_BY_ROLE,
    entityTypeSupport: AREA_TYPE_SUPPORT,
  });

  return {
    id: area.id,
    name: area.name,
    description: area.description,
    type: area.type,
    imageUrl: area.imageUrl,
    parentArea: area.parentArea
      ? {
        id: area.parentArea.id,
        name: area.parentArea.name,
        description: area.parentArea.description,
        type: area.parentArea.type,
      }
      : null,
    specific: buildAreaSpecificPayload(area),
    form: {
      role,
      editableFieldKeys,
      fields: buildFormFields({
        entity: area,
        role,
        entityType: area.type,
        generalFieldDefinitions: GENERAL_FIELD_DEFINITIONS,
        entityTypeFieldDefinitions: AREA_TYPE_FIELD_DEFINITIONS,
        editableFieldKeysByRole: EDITABLE_FIELD_KEYS_BY_ROLE,
        entityTypeSupport: AREA_TYPE_SUPPORT,
        buildSpecificPayload: buildAreaSpecificPayload,
      }),
      supportedSpecificFields: (AREA_TYPE_FIELD_DEFINITIONS[area.type] ?? []).map((field) => field.key),
    },
  };
};

/**
 * Retrieves details for a specific area based on its ID and the user's role.
 * @param {number} areaId - The ID of the area to retrieve.
 * @param {string} role - The role of the user requesting the area details.
 * @returns {object} The response object containing area details and form configuration.
 */
const getAreaDetails = async (areaId, role) => {
  const area = await getAreaForUpdate(areaId);

  if (!area) {
    const error = new Error("Zone introuvable.");
    error.statusCode = 404;
    throw error;
  }

  return buildAreaResponse(area, role);
};

/**
 * Updates an area based on its ID, the user's role, and the provided payload.
 * @param {number} areaId - The ID of the area to update.
 * @param {string} role - The role of the user requesting the update.
 * @param {object} payload - The data to update the area with.
 * @returns {object} The updated area details and form configuration.
 */
const updateArea = async (areaId, role, payload) => {
  const area = await getAreaForUpdate(areaId);

  if (!area) {
    const error = new Error("Zone introuvable.");
    error.statusCode = 404;
    throw error;
  }

  const { generalUpdates, specificUpdates } = validateAndBuildUpdates({
    entity: area,
    role,
    payload,
    entityType: area.type,
    generalFieldDefinitions: GENERAL_FIELD_DEFINITIONS,
    entityTypeFieldDefinitions: AREA_TYPE_FIELD_DEFINITIONS,
    editableFieldKeysByRole: EDITABLE_FIELD_KEYS_BY_ROLE,
    entityTypeSupport: AREA_TYPE_SUPPORT,
    validatorsByField: AREA_FIELD_VALIDATORS,
  });

  await prisma.$transaction(async (transaction) => {
    if (Object.keys(generalUpdates).length > 0) {
      await transaction.area.update({
        where: { id: areaId },
        data: generalUpdates,
      });
    }

    if (specificUpdates.building) {
      await transaction.building.upsert({
        where: { areaId },
        update: specificUpdates.building,
        create: {
          areaId,
          ...specificUpdates.building,
        },
      });
    }

    if (specificUpdates.floor) {
      await transaction.floor.upsert({
        where: { areaId },
        update: specificUpdates.floor,
        create: {
          areaId,
          ...specificUpdates.floor,
        },
      });
    }

    if (specificUpdates.classroom) {
      await transaction.classroom.upsert({
        where: { areaId },
        update: specificUpdates.classroom,
        create: {
          areaId,
          ...specificUpdates.classroom,
        },
      });
    }

    if (specificUpdates.technicalRoom) {
      await transaction.technicalRoom.upsert({
        where: { areaId },
        update: specificUpdates.technicalRoom,
        create: {
          areaId,
          ...specificUpdates.technicalRoom,
        },
      });
    }
  });

  return getAreaDetails(areaId, role);
};

export default {
  getAreaDetails,
  updateArea,
};
