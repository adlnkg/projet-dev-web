import { normalizeRawUpdatePayload } from "../utils/normalize.js";
import { getRoleChain } from "../utils/roles.js";

/**
 * Determines the editable field keys for a given role and entity type based on the defined permissions and support.
 * It checks the role's permissions against the supported fields for the entity type to return the list of fields that can be edited.
 * @param {string} role - The role of the user (e.g., "USER", "SUPER_USER", "ADMIN").
 * @param {object} editableFieldKeysByRole - A mapping of roles to their editable field keys.
 * @return {string[]} An array of field keys that are editable for the given role and entity type.
 */
const getRoleEditableKeys = (role, editableFieldKeysByRole) => {
    const chain = getRoleChain(role);
    const keys = new Set();

    for (const roleInChain of chain) {
        const roleKeys = editableFieldKeysByRole[roleInChain] ?? [];
        for (const key of roleKeys) {
            keys.add(key);
        }
    }

    return Array.from(keys);
};

/**
 * Gets the editable field keys for a given role and entity type.
 * @param {object} params - The parameters for determining editable keys.
 * @param {string} params.role - The role of the user (e.g., "USER", "SUPER_USER", "ADMIN").
 * @param {string} params.entityType - The type of the entity (e.g., "EVENT", "AREA", "DEVICE").
 * @param {object} params.editableFieldKeysByRole - A mapping of roles to their editable field keys.
 * @param {object} params.entityTypeSupport - A mapping of entity types to their supported editable field keys.
 * @return {string[]} An array of field keys that are editable for the given role and entity type.
 */
const getEditableFieldKeys = ({ role, entityType, editableFieldKeysByRole, entityTypeSupport }) => {
    const roleEditableKeys = getRoleEditableKeys(role, editableFieldKeysByRole);
    const supportedKeys = entityTypeSupport[entityType]?.editableFieldKeys ?? [];

    return roleEditableKeys.filter((fieldKey) => supportedKeys.includes(fieldKey));
};

/**
 * Builds the form fields for an entity based on its type, the user's role, and the defined field definitions and permissions.
 * It combines general field definitions with entity-type-specific field definitions, and marks each field as editable or not based on the user's role.
 * The function also incorporates specific values for the entity type using a provided callback to build the specific payload.
 * @param {object} params - The parameters for building form fields.
 * @param {object} params.entity - The entity for which to build the form fields.
 * @param {string} params.role - The role of the user (e.g., "USER", "SUPER_USER", "ADMIN").
 * @param {string} params.entityType - The type of the entity (e.g., "EVENT", "AREA", "DEVICE").
 * @param {object} params.generalFieldDefinitions - A mapping of general field definitions applicable to all entity types.
 * @param {object} params.entityTypeFieldDefinitions - A mapping of field definitions specific to each entity type.
 * @param {object} params.editableFieldKeysByRole - A mapping of roles to their editable field keys.
 * @param {object} params.entityTypeSupport - A mapping of entity types to their supported editable field keys.
 * @param {function} params.buildSpecificPayload - A callback function that takes an entity and returns an object containing the specific values for the entity type.
 * @return {object[]} An array of field definitions with values and editability for building the form.
 */
const buildFormFields = ({
    entity,
    role,
    entityType,
    generalFieldDefinitions,
    entityTypeFieldDefinitions,
    editableFieldKeysByRole,
    entityTypeSupport,
    buildSpecificPayload,
}) => {
    const editableFieldKeys = new Set(
        getEditableFieldKeys({ role, entityType, editableFieldKeysByRole, entityTypeSupport }),
    );

    const specificValues = buildSpecificPayload(entity);

    const generalFields = Object.values(generalFieldDefinitions).map((definition) => ({
        ...definition,
        value: definition.valueGetter ? definition.valueGetter(entity) : (entity[definition.key] ?? null),
        editable: editableFieldKeys.has(definition.key),
    }));

    const specificFields = (entityTypeFieldDefinitions[entityType] ?? []).map((definition) => ({
        ...definition,
        value: specificValues[definition.field] ?? null,
        editable: editableFieldKeys.has(definition.key),
    }));

    return [...generalFields, ...specificFields];
};

/**
 * Builds field metadata for creation forms.
 * Read-only fields are excluded unless explicitly forced as editable.
 * @param {object} params
 * @param {string} params.entityType
 * @param {object} params.generalFieldDefinitions
 * @param {object} params.entityTypeFieldDefinitions
 * @param {string[]} [params.requiredFieldKeys=[]]
 * @param {string[]} [params.forcedEditableFieldKeys=[]]
 * @returns {object[]}
 */
const buildCreateFormFields = ({
    entityType,
    generalFieldDefinitions,
    entityTypeFieldDefinitions,
    requiredFieldKeys = [],
    forcedEditableFieldKeys = [],
}) => {
    const requiredSet = new Set(requiredFieldKeys);
    const forcedEditableSet = new Set(forcedEditableFieldKeys);
    const definitions = [
        ...Object.values(generalFieldDefinitions),
        ...(entityTypeFieldDefinitions[entityType] ?? []),
    ];

    return definitions
        .filter((definition) => !definition.readOnly || forcedEditableSet.has(definition.key))
        .map((definition) => ({
            ...definition,
            readOnly: false,
            value: null,
            editable: true,
            required: requiredSet.has(definition.key),
        }));
};

/**
 * Validates the provided update payload against the allowed fields and their definitions, and builds the general and specific updates.
 * It checks for unknown fields, forbidden fields based on the user's role, and validates the values using provided validators.
 * If any validation fails, it throws an error with details about the issues found in the payload.
 * @param {object} params - The parameters for validating and building updates.
 * @param {object} params.entity - The current state of the entity being updated.
 * @param {string} params.role - The role of the user making the update (e.g., "USER", "SUPER_USER", "ADMIN").
 * @param {object} params.payload - The raw update payload from the request body.
 * @param {string} params.entityType - The type of the entity being updated (e.g., "EVENT", "AREA", "DEVICE").
 * @param {object} params.generalFieldDefinitions - A mapping of general field definitions applicable to all entity types.
 * @param {object} params.entityTypeFieldDefinitions - A mapping of field definitions specific to each entity type.
 * @param {object} params.editableFieldKeysByRole - A mapping of roles to their editable field keys.
 * @param {object} params.entityTypeSupport - A mapping of entity types to their supported editable field keys.
 * @param {object} params.validatorsByField - A mapping of field keys to their corresponding validator functions.
 * @return {object} An object containing the generalUpdates and specificUpdates to be applied to the entity.
 * @throws {Error} If there are unknown fields, forbidden fields, validation errors, or if no valid updates are provided.
 */
const validateAndBuildUpdates = ({
    entity,
    role,
    payload,
    entityType,
    generalFieldDefinitions,
    entityTypeFieldDefinitions,
    editableFieldKeysByRole,
    entityTypeSupport,
    validatorsByField,
}) => {
    const flattenedPayload = normalizeRawUpdatePayload(payload);
    const allowedFieldDefinitions = new Map([
        ...Object.values(generalFieldDefinitions),
        ...(entityTypeFieldDefinitions[entityType] ?? []),
    ].map((definition) => [definition.key, definition]));

    const editableFieldKeys = new Set(
        getEditableFieldKeys({ role, entityType, editableFieldKeysByRole, entityTypeSupport }),
    );

    const providedKeys = Object.keys(flattenedPayload);
    const unknownKeys = [];
    const forbiddenKeys = [];
    const validationErrors = [];
    const generalUpdates = {};
    const specificUpdates = {};

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

        const validator = validatorsByField[key];
        if (!validator) {
            unknownKeys.push(key);
            continue;
        }

        try {
            const normalizedValue = validator(value, definition, entity);

            if (definition.section === "specific") {
                const source = definition.source;
                if (!specificUpdates[source]) {
                    specificUpdates[source] = {};
                }
                specificUpdates[source][definition.field] = normalizedValue;
            } else {
                const targetField = definition.persistedKey ?? definition.key;
                generalUpdates[targetField] = normalizedValue;
            }
        } catch (error) {
            validationErrors.push(error.message);
        }
    }

    if (unknownKeys.length > 0) {
        const error = new Error(`Champ(s) non reconnu(s) pour cet élément: ${unknownKeys.join(", ")}.`);
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

    if (Object.keys(generalUpdates).length === 0 && Object.keys(specificUpdates).length === 0) {
        const error = new Error("Aucun champ modifiable valide n'a été fourni.");
        error.statusCode = 400;
        throw error;
    }

    return { generalUpdates, specificUpdates };
};

/**
 * Validates and normalizes payload for entity creation.
 * It accepts general fields and type-specific fields, rejects unknown keys, and enforces required fields.
 * @param {object} params
 * @param {object} params.payload - Raw request payload
 * @param {string} params.entityType - Logical type used for specific field definitions
 * @param {object} params.generalFieldDefinitions - General field definitions map
 * @param {object} params.entityTypeFieldDefinitions - Specific field definitions map by type
 * @param {object} params.validatorsByField - Validators map by field key
 * @param {string[]} [params.requiredFieldKeys=[]] - Required keys for creation
 * @returns {{ generalCreateData: object, specificCreateData: object }}
 */
const validateAndBuildCreateData = ({
    payload,
    entityType,
    generalFieldDefinitions,
    entityTypeFieldDefinitions,
    validatorsByField,
    requiredFieldKeys = [],
}) => {
    const flattenedPayload = normalizeRawUpdatePayload(payload);
    const allowedFieldDefinitions = new Map([
        ...Object.values(generalFieldDefinitions),
        ...(entityTypeFieldDefinitions[entityType] ?? []),
    ].map((definition) => [definition.key, definition]));

    const providedKeys = Object.keys(flattenedPayload);
    const unknownKeys = [];
    const validationErrors = [];
    const generalCreateData = {};
    const specificCreateData = {};

    for (const key of providedKeys) {
        const definition = allowedFieldDefinitions.get(key);
        const value = flattenedPayload[key];

        if (!definition) {
            unknownKeys.push(key);
            console.log("Unknown key in create payload 1:", key);
            console.log("Available keys:", Array.from(allowedFieldDefinitions.keys()));
            continue;
        }

        const validator = validatorsByField[key];
        if (!validator) {
            unknownKeys.push(key);
            console.log("Unknown key in create payload 2:", key);
            console.log("Validators available for keys:", Object.keys(validatorsByField));
            continue;
        }

        try {
            const normalizedValue = validator(value, definition);

            if (definition.section === "specific") {
                const source = definition.source;
                if (!specificCreateData[source]) {
                    specificCreateData[source] = {};
                }
                specificCreateData[source][definition.field] = normalizedValue;
            } else {
                const targetField = definition.persistedKey ?? definition.key;
                generalCreateData[targetField] = normalizedValue;
            }
        } catch (error) {
            validationErrors.push(error.message);
        }
    }

    if (unknownKeys.length > 0) {
        //log available keys for better error message
        console.log("Available keys:", Array.from(allowedFieldDefinitions.keys()));
        const error = new Error(`Champ(s) non reconnu(s) pour cet élément: ${unknownKeys.join(", ")}.`);
        error.statusCode = 400;
        throw error;
    }

    const missingRequiredKeys = requiredFieldKeys.filter((key) => {
        if (key.includes(".")) {
            const [source, field] = key.split(".");
            console.log("Checking required specific field:", source, field);
            console.log("Provided specific data for source:", specificCreateData[source]);
            return specificCreateData[source]?.[field] === undefined;
        }

        return generalCreateData[key] === undefined;
    });

    if (missingRequiredKeys.length > 0) {
        const error = new Error(`Champ(s) requis manquant(s): ${missingRequiredKeys.join(", ")}.`);
        error.statusCode = 400;
        throw error;
    }

    if (validationErrors.length > 0) {
        const error = new Error(validationErrors.join(" "));
        error.statusCode = 400;
        throw error;
    }

    return { generalCreateData, specificCreateData };
};

/**
 * Ensures the caller is an admin and the creator user exists.
 * @param {object} params
 * @param {string} params.role
 * @param {string | undefined} params.ownerId
 * @param {(ownerId: string) => Promise<object|null>} params.findUserById
 */
const assertAdminCreator = async ({ role, ownerId, findUserById }) => {
    if (role !== "ADMIN") {
        const error = new Error("Seuls les admins peuvent creer du contenu.");
        error.statusCode = 403;
        throw error;
    }

    if (!ownerId) {
        const error = new Error("Createur introuvable dans la requete authentifiee.");
        error.statusCode = 401;
        throw error;
    }

    const user = await findUserById(ownerId);
    if (!user) {
        const error = new Error("Le createur n'existe pas en base.");
        error.statusCode = 400;
        throw error;
    }
};

export {
    getEditableFieldKeys,
    buildFormFields,
    buildCreateFormFields,
    validateAndBuildUpdates,
    validateAndBuildCreateData,
    assertAdminCreator,
};
