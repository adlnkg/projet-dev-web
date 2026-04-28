import prisma from "../config/db.js";
import { parseDateValue } from "../utils/date.js";
import {
  normalizeTextValue,
  normalizeNumberValue,
  normalizeEnumValue,
  normalizeRawUpdatePayload,
} from "../utils/normalize.js";
import { EVENT_TYPES } from "../utils/constants.js";
import {
  getEditableFieldKeys,
  buildFormFields,
  buildCreateFormFields,
  validateAndBuildUpdates,
  validateAndBuildCreateData,
  assertAdminCreator,
} from "./entity-edit-resource-common.services.js";

const EVENT_RESOURCE_TYPE = "EVENT";

const GENERAL_FIELD_DEFINITIONS = {
  id: {
    key: "id",
    label: "Identifiant",
    kind: "number",
    readOnly: true,
    section: "general",
  },
  title: {
    key: "title",
    label: "Titre",
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
    maxLength: 800,
    section: "general",
  },
  createdAt: {
    key: "createdAt",
    label: "Cree le",
    kind: "datetime",
    readOnly: true,
    section: "general",
  },
  organizer: {
    key: "organizer",
    label: "Organisateur",
    kind: "text",
    minLength: 1,
    maxLength: 120,
    section: "general",
  },
  price: {
    key: "price",
    label: "Prix",
    kind: "number",
    min: 0,
    max: 10000,
    step: 0.5,
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
  startTime: {
    key: "startTime",
    label: "Debut",
    kind: "datetime",
    section: "general",
  },
  endTime: {
    key: "endTime",
    label: "Fin",
    kind: "datetime",
    section: "general",
  },
  numberOfParticipants: {
    key: "numberOfParticipants",
    label: "Participants",
    kind: "number",
    readOnly: true,
    section: "general",
  },
  maxParticipants: {
    key: "maxParticipants",
    label: "Capacite max",
    kind: "number",
    min: 1,
    max: 10000,
    step: 1,
    section: "general",
  },
  type: {
    key: "type",
    label: "Type",
    kind: "select",
    options: EVENT_TYPES,
    section: "general",
  },
  areaId: {
    key: "areaId",
    label: "Zone",
    kind: "number",
    readOnly: true,
    section: "general",
  },
  ownerName: {
    key: "ownerName",
    label: "Createur",
    kind: "text",
    valueGetter: (event) => event.owner?.login ?? null,
    readOnly: true,
    section: "general",
  },
};

const EVENT_TYPE_FIELD_DEFINITIONS = {
  EVENT: [],
};

const EDITABLE_FIELD_KEYS_BY_ROLE = {
  USER: [],
  SUPER_USER: ["startTime", "endTime", "maxParticipants", "type"],
  ADMIN: ["title", "description", "organizer", "price", "imageUrl"],
};

const EVENT_TYPE_SUPPORT = {
  EVENT: {
    editableFieldKeys: [
      "title",
      "description",
      "organizer",
      "price",
      "imageUrl",
      "startTime",
      "endTime",
      "maxParticipants",
      "type",
    ],
  },
};

const EVENT_FIELD_VALIDATORS = {
  title: (value, definition) =>
    normalizeTextValue(value, {
      minLength: definition.minLength ?? 1,
      maxLength: definition.maxLength,
      fieldName: definition.label,
    }),
  description: (value, definition) =>
    normalizeTextValue(value, {
      minLength: definition.minLength ?? 1,
      maxLength: definition.maxLength,
      fieldName: definition.label,
    }),
  organizer: (value, definition) =>
    normalizeTextValue(value, {
      minLength: definition.minLength ?? 1,
      maxLength: definition.maxLength,
      fieldName: definition.label,
    }),
  imageUrl: (value, definition) =>
    normalizeTextValue(value, {
      minLength: definition.minLength ?? 1,
      maxLength: definition.maxLength,
      fieldName: definition.label,
    }),
  price: (value, definition) =>
    normalizeNumberValue(value, {
      min: definition.min,
      max: definition.max,
      step: definition.step,
      fieldName: definition.label,
    }),
  startTime: (value, definition) => parseDateValue(value, definition.label),
  endTime: (value, definition) => parseDateValue(value, definition.label),
  maxParticipants: (value, definition) =>
    normalizeNumberValue(value, {
      min: definition.min,
      max: definition.max,
      step: definition.step,
      integer: true,
      fieldName: definition.label,
    }),
  type: (value, definition) =>
    normalizeEnumValue(value, EVENT_TYPES, definition.label),
};

const REQUIRED_CREATE_FIELDS = [
  "title",
  "description",
  "organizer",
  "startTime",
  "endTime",
  "maxParticipants",
];

const getEventCreateForm = (role) => {
  const requiredFieldKeys = ["areaId", ...REQUIRED_CREATE_FIELDS];

  return {
    resource: "EVENT",
    role,
    create: {
      method: "POST",
      endpoint: "/api/events",
      contentType: "multipart/form-data",
      imageField: "image",
      requiredFieldKeys,
      fields: buildCreateFormFields({
        entityType: EVENT_RESOURCE_TYPE,
        generalFieldDefinitions: GENERAL_FIELD_DEFINITIONS,
        entityTypeFieldDefinitions: EVENT_TYPE_FIELD_DEFINITIONS,
        requiredFieldKeys,
        forcedEditableFieldKeys: ["areaId", "numberOfParticipants"],
      }),
    },
  };
};

const buildEventSpecificPayload = () => ({}); //No specific fields for events for now

/** Retrieves an event by its ID, including related area information, for the purpose of updating it.
 * @param {number} eventId - The ID of the event to retrieve.
 * @param {string} [userId] - Optional user ID to check if user is registered to the event.
 * @returns {object|null} The event object with related area data, or null if not found.
 */
const getEventForUpdate = async (eventId, userId = null) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      area: true,
      owner: {
        select: {
          id: true,
          login: true,
          firstName: true,
          lastName: true,
        },
      },
      registrations: userId
        ? {
            where: {
              userId: userId,
            },
            select: {
              id: true,
            },
          }
        : false,
    },
  });
  //resulting event id:
  console.log(
    "Fetched event:",
    event ? { id: event.id, title: event.title } : null,
  );
  return event;
};

/** Builds the response object for an event, including its details and form configuration based on the user's role.
 * @param {object} event - The event object to build the response for.
 * @param {string} role - The role of the user requesting the event details (e.g., "USER", "SUPER_USER", "ADMIN").
 * @param {boolean} userIsRegistered - Whether the user is registered to the event (only for authenticated users).
 * @returns {object} The response object containing event details and form configuration.
 */
const buildEventResponse = (event, role, userIsRegistered = false) => {
  const editableFieldKeys = getEditableFieldKeys({
    role,
    entityType: EVENT_RESOURCE_TYPE,
    editableFieldKeysByRole: EDITABLE_FIELD_KEYS_BY_ROLE,
    entityTypeSupport: EVENT_TYPE_SUPPORT,
  });
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    createdAt: event.createdAt,
    organizer: event.organizer,
    price: event.price,
    imageUrl: event.imageUrl,
    startTime: event.startTime,
    endTime: event.endTime,
    numberOfParticipants: event.numberOfParticipants,
    maxParticipants: event.maxParticipants,
    type: event.type,
    areaId: event.areaId,
    numberOfParticipants:
      event.registrations?.length ?? event.numberOfParticipants,
    registrations: Array.isArray(event.registrations)
      ? event.registrations.map((registration) => ({
          id: registration.id,
          createdAt: registration.createdAt,
          user: registration.user
            ? {
                id: registration.user.id,
                login: registration.user.login,
                firstName: registration.user.firstName,
                lastName: registration.user.lastName,
                avatarUrl: registration.user.avatarUrl,
                role: registration.user.role,
                memberType: registration.user.memberType,
              }
            : null,
        }))
      : [],
    owner: event.owner
      ? {
          id: event.owner.id,
          login: event.owner.login,
          firstName: event.owner.firstName,
          lastName: event.owner.lastName,
        }
      : null,
    ownerName: event.owner?.login ?? null,
    area: event.area
      ? {
          id: event.area.id,
          name: event.area.name,
          description: event.area.description,
          type: event.area.type,
        }
      : null,
    userIsRegistered: userIsRegistered,
    specific: {},
    form: {
      role,
      editableFieldKeys,
      fields: buildFormFields({
        entity: event,
        role,
        entityType: EVENT_RESOURCE_TYPE,
        generalFieldDefinitions: GENERAL_FIELD_DEFINITIONS,
        entityTypeFieldDefinitions: EVENT_TYPE_FIELD_DEFINITIONS,
        editableFieldKeysByRole: EDITABLE_FIELD_KEYS_BY_ROLE,
        entityTypeSupport: EVENT_TYPE_SUPPORT,
        buildSpecificPayload: buildEventSpecificPayload,
      }),
      supportedSpecificFields: [],
    },
  };
};

/** Retrieves the details of an event by its ID, including related area information and registrations, and builds the response based on the user's role.
 * @param {number} eventId - The ID of the event to retrieve.
 * @param {string} role - The role of the user requesting the event details (e.g., "USER", "SUPER_USER", "ADMIN").
 * @param {string} [userId] - Optional user ID for checking registration status.
 * @returns {object} The response object containing event details and form configuration.
 * @throws {Error} If the event is not found, an error with status code 404 is thrown.
 */
const getEventDetails = async (eventId, role, userId = null) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      area: true,
      owner: {
        select: {
          id: true,
          login: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          role: true,
          memberType: true,
        },
      },
      registrations: {
        include: {
          user: {
            select: {
              id: true,
              login: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              role: true,
              memberType: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!event) {
    const error = new Error("Evenement introuvable.");
    error.statusCode = 404;
    throw error;
  }

  const userIsRegistered =
    userId &&
    event.registrations &&
    event.registrations.some((registration) => registration.userId === userId);
  return buildEventResponse(event, role, userIsRegistered);
};

/** Updates an event by its ID with the provided payload, applying validation and building the response based on the user's role.
 * @param {number} eventId - The ID of the event to update.
 * @param {string} role - The role of the user performing the update (e.g., "USER", "SUPER_USER", "ADMIN").
 * @param {object} payload - The payload containing the fields to update.
 * @returns {object} The response object containing the updated event details and form configuration.
 * @throws {Error} If the event is not found, an error with status code 404 is thrown. If validation fails, an error with status code 400 is thrown.
 */
const updateEvent = async (eventId, role, payload) => {
  const event = await getEventForUpdate(eventId);

  if (!event) {
    const error = new Error("Evenement introuvable.");
    error.statusCode = 404;
    throw error;
  }

  const { generalUpdates } = validateAndBuildUpdates({
    entity: event,
    role,
    payload,
    entityType: EVENT_RESOURCE_TYPE,
    generalFieldDefinitions: GENERAL_FIELD_DEFINITIONS,
    entityTypeFieldDefinitions: EVENT_TYPE_FIELD_DEFINITIONS,
    editableFieldKeysByRole: EDITABLE_FIELD_KEYS_BY_ROLE,
    entityTypeSupport: EVENT_TYPE_SUPPORT,
    validatorsByField: EVENT_FIELD_VALIDATORS,
  });

  if (
    generalUpdates.startTime &&
    generalUpdates.endTime &&
    generalUpdates.startTime >= generalUpdates.endTime
  ) {
    const error = new Error(
      "La date de debut doit etre strictement anterieure a la date de fin.",
    );
    error.statusCode = 400;
    throw error;
  }

  if (
    generalUpdates.startTime &&
    !generalUpdates.endTime &&
    generalUpdates.startTime >= event.endTime
  ) {
    const error = new Error(
      "La date de debut doit etre strictement anterieure a la date de fin actuelle.",
    );
    error.statusCode = 400;
    throw error;
  }

  if (
    !generalUpdates.startTime &&
    generalUpdates.endTime &&
    event.startTime >= generalUpdates.endTime
  ) {
    const error = new Error(
      "La date de fin doit etre strictement posterieure a la date de debut actuelle.",
    );
    error.statusCode = 400;
    throw error;
  }

  if (
    generalUpdates.maxParticipants !== undefined &&
    generalUpdates.maxParticipants < event.numberOfParticipants
  ) {
    const error = new Error(
      "La capacite maximale ne peut pas etre inferieure au nombre de participants actuel.",
    );
    error.statusCode = 400;
    throw error;
  }

  await prisma.event.update({
    where: { id: eventId },
    data: generalUpdates,
  });

  return getEventDetails(eventId, role);
};

const createEvent = async ({ role, ownerId, payload, imageUrl }) => {
  await assertAdminCreator({
    role,
    ownerId,
    findUserById: (id) =>
      prisma.user.findUnique({ where: { id }, select: { id: true } }),
  });

  const flattenedPayload = normalizeRawUpdatePayload(payload);

  const { generalCreateData } = validateAndBuildCreateData({
    payload,
    entityType: EVENT_RESOURCE_TYPE,
    generalFieldDefinitions: GENERAL_FIELD_DEFINITIONS,
    entityTypeFieldDefinitions: EVENT_TYPE_FIELD_DEFINITIONS,
    validatorsByField: EVENT_FIELD_VALIDATORS,
    requiredFieldKeys: REQUIRED_CREATE_FIELDS,
  });

  const areaId = normalizeNumberValue(flattenedPayload.areaId, {
    min: 1,
    step: 1,
    integer: true,
    fieldName: "Zone",
  });

  const numberOfParticipants =
    flattenedPayload.numberOfParticipants !== undefined
      ? normalizeNumberValue(flattenedPayload.numberOfParticipants, {
          min: 0,
          step: 1,
          integer: true,
          fieldName: "Participants",
        })
      : 0;

  if (generalCreateData.startTime >= generalCreateData.endTime) {
    const error = new Error(
      "La date de debut doit etre strictement anterieure a la date de fin.",
    );
    error.statusCode = 400;
    throw error;
  }

  if (generalCreateData.maxParticipants < numberOfParticipants) {
    const error = new Error(
      "La capacite maximale ne peut pas etre inferieure au nombre de participants initial.",
    );
    error.statusCode = 400;
    throw error;
  }

  const areaExists = await prisma.area.findUnique({
    where: { id: areaId },
    select: { id: true },
  });

  if (!areaExists) {
    const error = new Error("La zone renseignee est introuvable.");
    error.statusCode = 400;
    throw error;
  }

  if (imageUrl) {
    generalCreateData.imageUrl = imageUrl;
  }

  const createdEvent = await prisma.event.create({
    data: {
      ...generalCreateData,
      areaId,
      numberOfParticipants,
      ownerId,
    },
    select: {
      id: true,
    },
  });

  return getEventDetails(createdEvent.id, role);
};

/**
 * Registers a user to an event.
 * @param {number} eventId - The ID of the event to register to.
 * @param {string} userId - The ID of the user registering.
 * @returns {object} The registration object.
 * @throws {Error} If the event or user is not found, or if the user is already registered.
 */
const registerToEvent = async (eventId, userId) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, numberOfParticipants: true, maxParticipants: true },
  });

  if (!event) {
    const error = new Error("Evenement introuvable.");
    error.statusCode = 404;
    throw error;
  }

  if (event.numberOfParticipants >= event.maxParticipants) {
    const error = new Error("L'événement est complet.");
    error.statusCode = 400;
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    const error = new Error("Utilisateur introuvable.");
    error.statusCode = 404;
    throw error;
  }

  const existingRegistration = await prisma.eventRegistration.findUnique({
    where: {
      userId_eventId: {
        userId: userId,
        eventId: eventId,
      },
    },
  });

  if (existingRegistration) {
    const error = new Error("Vous êtes déjà inscrit à cet événement.");
    error.statusCode = 400;
    throw error;
  }

  // Create registration and increment numberOfParticipants atomically
  const registration = await prisma.eventRegistration.create({
    data: {
      userId: userId,
      eventId: eventId,
    },
  });

  await prisma.event.update({
    where: { id: eventId },
    data: {
      numberOfParticipants: {
        increment: 1,
      },
    },
  });

  return registration;
};

/**
 * Unregisters a user from an event.
 * @param {number} eventId - The ID of the event to unregister from.
 * @param {string} userId - The ID of the user unregistering.
 * @throws {Error} If the event is not found or if the user is not registered.
 */
const unregisterFromEvent = async (eventId, userId) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true },
  });

  if (!event) {
    const error = new Error("Evenement introuvable.");
    error.statusCode = 404;
    throw error;
  }

  const registration = await prisma.eventRegistration.findUnique({
    where: {
      userId_eventId: {
        userId: userId,
        eventId: eventId,
      },
    },
  });

  if (!registration) {
    const error = new Error("Vous n'êtes pas inscrit à cet événement.");
    error.statusCode = 400;
    throw error;
  }

  // Delete registration and decrement numberOfParticipants atomically
  await prisma.eventRegistration.delete({
    where: {
      id: registration.id,
    },
  });

  await prisma.event.update({
    where: { id: eventId },
    data: {
      numberOfParticipants: {
        decrement: 1,
      },
    },
  });
};

export default {
  getEventCreateForm,
  getEventDetails,
  updateEvent,
  createEvent,
  registerToEvent,
  unregisterFromEvent,
};
