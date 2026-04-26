import prisma from "../config/db.js";
import { normalizeTextValue } from "../utils/normalize.js";
import {
  getEditableFieldKeys,
  buildFormFields,
  buildCreateFormFields,
  validateAndBuildUpdates,
  validateAndBuildCreateData,
  assertAdminCreator,
} from "./entity-edit-resource-common.services.js";

const ACTUALITY_RESOURCE_TYPE = "ACTUALITY";

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
    maxLength: 150,
    section: "general",
  },
  content: {
    key: "content",
    label: "Contenu",
    kind: "textarea",
    minLength: 1,
    maxLength: 5000,
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
  createdAt: {
    key: "createdAt",
    label: "Cree le",
    kind: "datetime",
    readOnly: true,
    section: "general",
  },
  ownerName: {
    key: "ownerName",
    label: "Createur",
    kind: "text",
    valueGetter: (actuality) => actuality.owner?.login ?? null,
    readOnly: true,
    section: "general",
  },
};

const ACTUALITY_TYPE_FIELD_DEFINITIONS = {
  ACTUALITY: [],
};

const EDITABLE_FIELD_KEYS_BY_ROLE = {
  USER: [],
  SUPER_USER: ["title", "content"],
  ADMIN: ["imageUrl"],
};

const ACTUALITY_TYPE_SUPPORT = {
  ACTUALITY: {
    editableFieldKeys: ["title", "content", "imageUrl"],
  },
};

const ACTUALITY_FIELD_VALIDATORS = {
  title: (value, definition) =>
    normalizeTextValue(value, {
      minLength: definition.minLength ?? 1,
      maxLength: definition.maxLength,
      fieldName: definition.label,
    }),
  content: (value, definition) =>
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
};

const REQUIRED_CREATE_FIELDS = ["title", "content"];

const getActualityCreateForm = (role) => {
  return {
    resource: "ACTUALITY",
    role,
    create: {
      method: "POST",
      endpoint: "/api/actualities",
      contentType: "multipart/form-data",
      imageField: "image",
      requiredFieldKeys: REQUIRED_CREATE_FIELDS,
      fields: buildCreateFormFields({
        entityType: ACTUALITY_RESOURCE_TYPE,
        generalFieldDefinitions: GENERAL_FIELD_DEFINITIONS,
        entityTypeFieldDefinitions: ACTUALITY_TYPE_FIELD_DEFINITIONS,
        requiredFieldKeys: REQUIRED_CREATE_FIELDS,
      }),
    },
  };
};

const buildActualitySpecificPayload = () => ({});

const getActualityForUpdate = async (actualityId) =>
  prisma.actuality.findUnique({
    where: { id: actualityId },
    include: {
      owner: {
        select: {
          id: true,
          login: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

const buildActualityResponse = (actuality, role) => {
  const editableFieldKeys = getEditableFieldKeys({
    role,
    entityType: ACTUALITY_RESOURCE_TYPE,
    editableFieldKeysByRole: EDITABLE_FIELD_KEYS_BY_ROLE,
    entityTypeSupport: ACTUALITY_TYPE_SUPPORT,
  });

  return {
    id: actuality.id,
    title: actuality.title,
    content: actuality.content,
    imageUrl: actuality.imageUrl,
    createdAt: actuality.createdAt,
    owner: actuality.owner
      ? {
        id: actuality.owner.id,
        login: actuality.owner.login,
        firstName: actuality.owner.firstName,
        lastName: actuality.owner.lastName,
      }
      : null,
    ownerName: actuality.owner?.login ?? null,
    specific: {},
    form: {
      role,
      editableFieldKeys,
      fields: buildFormFields({
        entity: actuality,
        role,
        entityType: ACTUALITY_RESOURCE_TYPE,
        generalFieldDefinitions: GENERAL_FIELD_DEFINITIONS,
        entityTypeFieldDefinitions: ACTUALITY_TYPE_FIELD_DEFINITIONS,
        editableFieldKeysByRole: EDITABLE_FIELD_KEYS_BY_ROLE,
        entityTypeSupport: ACTUALITY_TYPE_SUPPORT,
        buildSpecificPayload: buildActualitySpecificPayload,
      }),
      supportedSpecificFields: [],
    },
  };
};

const getActualityDetails = async (actualityId, role) => {
  const actuality = await getActualityForUpdate(actualityId);

  if (!actuality) {
    const error = new Error("Actualite introuvable.");
    error.statusCode = 404;
    throw error;
  }

  return buildActualityResponse(actuality, role);
};

const updateActuality = async (actualityId, role, payload) => {
  const actuality = await getActualityForUpdate(actualityId);

  if (!actuality) {
    const error = new Error("Actualite introuvable.");
    error.statusCode = 404;
    throw error;
  }

  const { generalUpdates } = validateAndBuildUpdates({
    entity: actuality,
    role,
    payload,
    entityType: ACTUALITY_RESOURCE_TYPE,
    generalFieldDefinitions: GENERAL_FIELD_DEFINITIONS,
    entityTypeFieldDefinitions: ACTUALITY_TYPE_FIELD_DEFINITIONS,
    editableFieldKeysByRole: EDITABLE_FIELD_KEYS_BY_ROLE,
    entityTypeSupport: ACTUALITY_TYPE_SUPPORT,
    validatorsByField: ACTUALITY_FIELD_VALIDATORS,
  });

  await prisma.actuality.update({
    where: { id: actualityId },
    data: generalUpdates,
  });

  return getActualityDetails(actualityId, role);
};

const createActuality = async ({ role, ownerId, payload, imageUrl }) => {
  await assertAdminCreator({
    role,
    ownerId,
    findUserById: (id) => prisma.user.findUnique({ where: { id }, select: { id: true } }),
  });

  const { generalCreateData } = validateAndBuildCreateData({
    payload,
    entityType: ACTUALITY_RESOURCE_TYPE,
    generalFieldDefinitions: GENERAL_FIELD_DEFINITIONS,
    entityTypeFieldDefinitions: ACTUALITY_TYPE_FIELD_DEFINITIONS,
    validatorsByField: ACTUALITY_FIELD_VALIDATORS,
    requiredFieldKeys: REQUIRED_CREATE_FIELDS,
  });

  if (imageUrl) {
    generalCreateData.imageUrl = imageUrl;
  }

  const createdActuality = await prisma.actuality.create({
    data: {
      ...generalCreateData,
      ownerId,
    },
    select: {
      id: true,
    },
  });

  return getActualityDetails(createdActuality.id, role);
};

export default {
  getActualityCreateForm,
  getActualityDetails,
  updateActuality,
  createActuality,
};
