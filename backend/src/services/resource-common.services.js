import { normalizeRawUpdatePayload } from "../utils/normalize.js";

const ROLE_HIERARCHY = {
    USER: null,
    SUPER_USER: "USER",
    ADMIN: "SUPER_USER",
};

/**  
 * Get the full role chain for a given role, starting from the specified role up to the base role (USER).
 * For example, for "ADMIN", it will return ["USER", "SUPER_USER", "ADMIN"].
 * This is used to determine all the permissions that a role inherits from its parent roles.
 * @param {string} role - The role for which to get the chain (e.g., "USER", "SUPER_USER", "ADMIN").
 * @return {string[]} An array of roles in the chain, ordered from the base role to the specified role.
 * @throws {Error} If the provided role is not recognized in the hierarchy.
 */
const getRoleChain = (role) => {
    const chain = [];
    if (!ROLE_HIERARCHY.hasOwnProperty(role)) {
        throw new Error(`Rôle inconnu: ${role}`);
    }
    let currentRole = ROLE_HIERARCHY[role];

    while (currentRole) {
        chain.push(currentRole);
        currentRole = ROLE_HIERARCHY[currentRole];
    }

    return chain.reverse();
};

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
        value: entity[definition.key] ?? null,
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

export {
    getEditableFieldKeys,
    buildFormFields,
    validateAndBuildUpdates,
};
