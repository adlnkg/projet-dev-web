import { LIMITS } from "../utils/constants.js";


/**
 * Normalizes a text value by trimming whitespace and applying length validation.
 * @param {*} value The value to normalize.
 * @param {*} param1 An object containing validation parameters.
 * @param {number} param1.minLength The minimum allowed length (inclusive), 0 if not specified.
 * @param {number} param1.maxLength The maximum allowed length (inclusive), LIMITS.DEFAULT_STRING if not specified.
 * @param {string} param1.fieldName The name of the field being normalized (used for error messages).
 * @returns {string} The normalized text value.
 * @throws {Error} If the value is not a string or does not meet the length criteria.
 */
const normalizeTextValue = (value, { minLength = 0, maxLength = LIMITS.DEFAULT_STRING, fieldName }) => {
    if (typeof value !== "string") {
        throw new Error(`${fieldName} doit être une chaîne de caractères.`);
    }

    const normalized = value.trim();
    if (normalized.length < minLength) {
        throw new Error(`${fieldName} doit contenir au moins ${minLength} caractère(s).`);
    }

    if (maxLength !== undefined && normalized.length > maxLength) {
        throw new Error(`${fieldName} doit contenir au maximum ${maxLength} caractère(s).`);
    }

    return normalized;
};

/**
 * Normalizes a number value by parsing it and applying validation checks.
 * @param {*} value The value to normalize.
 * @param {*} param1 An object containing validation parameters.
 * @param {number} param1.min The minimum allowed value (inclusive), undefined if no minimum.
 * @param {number} param1.max The maximum allowed value (inclusive), undefined if no maximum.
 * @param {number} param1.step The step size for the number.
 * @param {boolean} param1.integer Whether the number should be an integer.
 * @param {string} param1.fieldName The name of the field being normalized (used for error messages).
 * @returns {number} The normalized number value.
 * @throws {Error} If the value is not a valid number or does not meet the validation criteria.
 */
const normalizeNumberValue = (value, { min = undefined, max = undefined, step = 1, integer = false, fieldName }) => {
    const parsed = typeof value === "number" ? value : Number(value);

    if (!Number.isFinite(parsed)) {
        throw new Error(`${fieldName} doit être un nombre valide.`);
    }

    if (integer && !Number.isInteger(parsed)) {
        throw new Error(`${fieldName} doit être un entier.`);
    }

    if (min !== undefined && parsed < min) {
        throw new Error(`${fieldName} doit être supérieur ou égal à ${min}.`);
    }

    if (max !== undefined && parsed > max) {
        throw new Error(`${fieldName} doit être inférieur ou égal à ${max}.`);
    }

    if (step !== undefined) {
        const quotient = parsed / step;
        const rounded = Math.round(quotient);
        if (Math.abs(quotient - rounded) > 1e-9) {
            throw new Error(`${fieldName} doit respecter un pas de ${step}.`);
        }
    }

    return parsed;
};

/**
 * Normalizes an enum value by trimming whitespace and converting to uppercase.
 * @param {*} value The value to normalize.
 * @param {*} allowedValues An array of allowed string values for the enum.
 * @param {*} fieldName The name of the field being normalized (used for error messages).
 * @return {string} The normalized enum value.
 * @throws {Error} If the value is not a string or if it is not one of the allowed values.
 */
const normalizeEnumValue = (value, allowedValues, fieldName) => {
    if (typeof value !== "string") {
        throw new Error(`${fieldName} doit être une valeur de type chaîne.`);
    }

    const normalized = value.trim().toUpperCase();
    if (!allowedValues.includes(normalized)) {
        throw new Error(`${fieldName} doit être l'une des valeurs suivantes: ${allowedValues.join(", ")}.`);
    }

    return normalized;
};

//from https://stackoverflow.com/a/722668/
/**
 * Flattens a nested object into a single-level object with dot-separated keys.
 * For example, { a: { b: 1 }, c: 2 } becomes { "a.b": 1, c: 2 }.
 * Arrays, Date objects, and File objects are not flattened and are included as-is.
 * Null and undefined values are ignored.
 *
 * @param {object} value - The object to flatten.
 * @param {string} [prefix=""] - The prefix for the keys (used for recursion : **should not be provided by the caller**).
 * @return {object} The flattened object.
 */
const flattenPayload = (value, prefix = "") => {
    if (value === null || value === undefined) {
        return {};
    }

    if (typeof value !== "object" || value instanceof Date || value instanceof File || value instanceof Blob) {
        return prefix ? { [prefix]: value } : {};
    }

    if (Array.isArray(value)) {
        return prefix ? { [prefix]: value } : {};
    }

    return Object.entries(value).reduce((accumulator, [key, nestedValue]) => {
        const nextPrefix = prefix ? `${prefix}.${key}` : key; // if prefix is empty, use key as is, otherwise concatenate with dot
        Object.assign(accumulator, flattenPayload(nestedValue, nextPrefix));
        return accumulator;
    }, {});
};

/** 
 * This function takes the raw request body and determines the source of the update data.
 *  It supports both "updates" and "fields" as root keys, allowing for flexibility in 
 * how the client sends update data. If neither "updates" nor "fields" is present, 
 * it treats the entire body as the source of updates. The function then flattens any nested 
 * structures in the source object, converting them into a single-level object with dot-separated keys.
 *  This normalization allows the rest of the update processing logic to work with a consistent flat
 *  structure, regardless of how the client structured the input data.
 * @param {object} body - The raw request body containing the update data.
 * @returns {object} A flattened object containing the update fields and values.
 * @throws {Error} If the input is not a valid object or if there are issues during flattening.
 * @example
 * // Example input with "updates" key:
 * const body = {
 *   updates: {
 *     name: "New Device Name",
 *     light: {
 *       brightness: 80,
 *       color: "blue"
 *     }
 *   }
 * };
 *
 * // Example input with "fields" key:
 * const body = {
 *   fields: {
 *     description: "Updated description",
 *     thermostat: {
 *       targetTemp: 22,
 *       mode: "HEAT"
 *     }
 *   }
 * };
 *
 * // Example input without "updates" or "fields":
 * const body = {
 *   name: "Another Device Name",
 *   status: "INACTIVE"
 * };
 * 
*/
const normalizeRawUpdatePayload = (body) => {
    const source = body?.updates && typeof body.updates === "object"
        ? body.updates
        : body?.fields && typeof body.fields === "object"
            ? body.fields
            : body ?? {};

    return flattenPayload(source);
};



export { normalizeTextValue, normalizeNumberValue, normalizeEnumValue, flattenPayload, normalizeRawUpdatePayload };