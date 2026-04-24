import prisma from "../config/db.js";
import {
    normalizeTextValue,
    normalizeNumberValue,
    normalizeEnumValue,
} from "../utils/normalize.js";
import {
    DEVICE_STATUS_VALUES,
    DEVICE_TYPES,
    THERMOSTAT_MODE_VALUES,
} from "../utils/constants.js";
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
    createdAt: {
        key: "createdAt",
        label: "Cree le",
        kind: "datetime",
        readOnly: true,
        section: "general",
    },
    brand: {
        key: "brand",
        label: "Marque",
        kind: "text",
        minLength: 1,
        maxLength: 80,
        section: "general",
    },
    model: {
        key: "model",
        label: "Modele",
        kind: "text",
        minLength: 1,
        maxLength: 80,
        section: "general",
    },
    status: {
        key: "status",
        label: "Statut",
        kind: "select",
        options: DEVICE_STATUS_VALUES,
        section: "general",
    },
    type: {
        key: "type",
        label: "Type",
        kind: "select",
        options: DEVICE_TYPES,
        readOnly: true,
        section: "general",
    },
};

const DEVICE_TYPE_FIELD_DEFINITIONS = {
    LIGHT: [
        {
            key: "light.brightness",
            label: "Luminosite",
            kind: "number",
            min: 0,
            max: 100,
            step: 1,
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
            section: "specific",
            source: "sensor",
            field: "value",
        },
        {
            key: "sensor.timestamp",
            label: "Horodatage",
            kind: "datetime",
            readOnly: true,
            section: "specific",
            source: "sensor",
            field: "timestamp",
        },
    ],
    THERMOSTAT: [
        {
            key: "thermostat.temperature",
            label: "Temperature mesuree",
            kind: "number",
            readOnly: true,
            section: "specific",
            source: "thermostat",
            field: "temperature",
        },
        {
            key: "thermostat.targetTemp",
            label: "Temperature cible",
            kind: "number",
            min: 5,
            max: 35,
            step: 0.5,
            section: "specific",
            source: "thermostat",
            field: "targetTemp",
        },
        {
            key: "thermostat.mode",
            label: "Mode",
            kind: "select",
            options: THERMOSTAT_MODE_VALUES,
            section: "specific",
            source: "thermostat",
            field: "mode",
        },
    ],
    WHITEBOARD: [
        {
            key: "whiteboard.resolution",
            label: "Resolution",
            kind: "text",
            readOnly: true,
            section: "specific",
            source: "whiteboard",
            field: "resolution",
        },
        {
            key: "whiteboard.screenSize",
            label: "Taille d'ecran",
            kind: "number",
            readOnly: true,
            section: "specific",
            source: "whiteboard",
            field: "screenSize",
        },
    ],
    CAMERA: [
        {
            key: "camera.resolution",
            label: "Resolution",
            kind: "text",
            readOnly: true,
            section: "specific",
            source: "camera",
            field: "resolution",
        },
        {
            key: "camera.frameRate",
            label: "Frequence d'images",
            kind: "number",
            readOnly: true,
            section: "specific",
            source: "camera",
            field: "frameRate",
        },
    ],
    ACCESS_CONTROL: [
        {
            key: "accessControl.status",
            label: "Statut de controle d'acces",
            kind: "text",
            readOnly: true,
            section: "specific",
            source: "accessControl",
            field: "status",
        },
    ],
};

const EDITABLE_FIELD_KEYS_BY_ROLE = {
    USER: [],
    SUPER_USER: ["status", "light.brightness", "light.color", "thermostat.targetTemp", "thermostat.mode"],
    ADMIN: ["name", "description", "brand", "model", "status"],
};

const DEVICE_TYPE_SUPPORT = {
    LIGHT: {
        editableFieldKeys: ["status", "light.brightness", "light.color", "name", "description", "brand", "model"],
    },
    SENSOR: {
        editableFieldKeys: ["status", "name", "description", "brand", "model"],
    },
    THERMOSTAT: {
        editableFieldKeys: [
            "status",
            "thermostat.targetTemp",
            "thermostat.mode",
            "name",
            "description",
            "brand",
            "model",
        ],
    },
    CAMERA: {
        editableFieldKeys: ["status", "name", "description", "brand", "model"],
    },
    ACCESS_CONTROL: {
        editableFieldKeys: ["status", "name", "description", "brand", "model"],
    },
    WHITEBOARD: {
        editableFieldKeys: ["status", "name", "description", "brand", "model"],
    },
};

const DEVICE_FIELD_VALIDATORS = {
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
    brand: (value, definition) => normalizeTextValue(value, {
        minLength: definition.minLength ?? 1,
        maxLength: definition.maxLength,
        fieldName: definition.label,
    }),
    model: (value, definition) => normalizeTextValue(value, {
        minLength: definition.minLength ?? 1,
        maxLength: definition.maxLength,
        fieldName: definition.label,
    }),
    status: (value, definition) => normalizeEnumValue(value, DEVICE_STATUS_VALUES, definition.label),
    "light.brightness": (value, definition) => normalizeNumberValue(value, {
        min: definition.min ?? 0,
        max: definition.max ?? 100,
        step: definition.step ?? 1,
        integer: true,
        fieldName: definition.label,
    }),
    "light.color": (value, definition) => normalizeTextValue(value, {
        minLength: definition.minLength ?? 1,
        maxLength: definition.maxLength,
        fieldName: definition.label,
    }),
    "thermostat.targetTemp": (value, definition) => normalizeNumberValue(value, {
        min: definition.min ?? 5,
        max: definition.max ?? 35,
        step: definition.step ?? 0.5,
        fieldName: definition.label,
    }),
    "thermostat.mode": (value, definition) => normalizeEnumValue(value, THERMOSTAT_MODE_VALUES, definition.label),
};

/**
 * Builds the specific payload for a device based on its type.
 * @param {object} device - The device object.
 * @returns {object} The specific payload for the device.
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
        case "CAMERA":
            return {
                resolution: device.camera?.resolution ?? null,
                frameRate: device.camera?.frameRate ?? null,
            };
        case "ACCESS_CONTROL":
            return {
                status: device.accessControl?.status ?? null,
            };
        default:
            return {};
    }
};

/**
 * Retrieves a device by its ID, including its related area and specific type data.
 * @param {number} deviceId - The ID of the device to retrieve.
 * @returns {object|null} The device object with related data, or null if not found.
 */
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

/** Builds the response object for a device, including its details and form configuration based on the user's role.
 * @param {object} device - The device object to build the response for.
 * @param {string} role - The role of the user requesting the device details (e.g., "USER", "SUPER_USER", "ADMIN").
 * @returns {object} The response object containing device details and form configuration.
 */
const buildDeviceResponse = (device, role) => {
    const editableFieldKeys = getEditableFieldKeys({
        role,
        entityType: device.type,
        editableFieldKeysByRole: EDITABLE_FIELD_KEYS_BY_ROLE,
        entityTypeSupport: DEVICE_TYPE_SUPPORT,
    });

    return {
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
            editableFieldKeys,
            fields: buildFormFields({
                entity: device,
                role,
                entityType: device.type,
                generalFieldDefinitions: GENERAL_FIELD_DEFINITIONS,
                entityTypeFieldDefinitions: DEVICE_TYPE_FIELD_DEFINITIONS,
                editableFieldKeysByRole: EDITABLE_FIELD_KEYS_BY_ROLE,
                entityTypeSupport: DEVICE_TYPE_SUPPORT,
                buildSpecificPayload: buildDeviceSpecificPayload,
            }),
            supportedSpecificFields: (DEVICE_TYPE_FIELD_DEFINITIONS[device.type] ?? []).map((field) => field.key),
        },
    };
};

/** Retrieves the details of a device by its ID and builds the response based on the user's role.
 * @param {number} deviceId - The ID of the device to retrieve.
 * @param {string} role - The role of the user requesting the device details (e.g., "USER", "SUPER_USER", "ADMIN").
 * @returns {object} The response object containing device details and form configuration.
 * @throws {Error} If the device is not found, an error with status code 404 is thrown.
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

/** Updates a device by its ID with the provided payload, applying validation and building the response based on the user's role.
 * @param {number} deviceId - The ID of the device to update.
 * @param {string} role - The role of the user performing the update (e.g., "USER", "SUPER_USER", "ADMIN").
 * @param {object} payload - The payload containing the fields to update.
 * @returns {object} The response object containing the updated device details and form configuration.
 * @throws {Error} If the device is not found, an error with status code 404 is thrown. If validation fails, an error with status code 400 is thrown.
 */
const updateDevice = async (deviceId, role, payload) => {
    const device = await getDeviceForUpdate(deviceId);

    if (!device) {
        const error = new Error("Appareil introuvable.");
        error.statusCode = 404;
        throw error;
    }

    const { generalUpdates, specificUpdates } = validateAndBuildUpdates({
        entity: device,
        role,
        payload,
        entityType: device.type,
        generalFieldDefinitions: GENERAL_FIELD_DEFINITIONS,
        entityTypeFieldDefinitions: DEVICE_TYPE_FIELD_DEFINITIONS,
        editableFieldKeysByRole: EDITABLE_FIELD_KEYS_BY_ROLE,
        entityTypeSupport: DEVICE_TYPE_SUPPORT,
        validatorsByField: DEVICE_FIELD_VALIDATORS,
    });

    if (specificUpdates.light && !device.light) {
        const error = new Error("Les donnees specifiques LIGHT sont absentes pour cet appareil.");
        error.statusCode = 400;
        throw error;
    }

    if (specificUpdates.thermostat && !device.thermostat) {
        const error = new Error("Les donnees specifiques THERMOSTAT sont absentes pour cet appareil.");
        error.statusCode = 400;
        throw error;
    }

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
};
