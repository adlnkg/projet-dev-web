import prisma from "../config/db.js";
import {
    normalizeTextValue,
    normalizeNumberValue,
    normalizeEnumValue,
    normalizeRawUpdatePayload,
} from "../utils/normalize.js";
import {
    DEVICE_STATUS_VALUES,
    DEVICE_TYPES,
    THERMOSTAT_MODE_VALUES,
} from "../utils/constants.js";
import {
    getEditableFieldKeys,
    buildFormFields,
    buildCreateFormFields,
    validateAndBuildUpdates,
    validateAndBuildCreateData,
    assertAdminCreator,
} from "./entity-edit-resource-common.services.js";

const GENERAL_FIELD_DEFINITIONS = {
    id: {
        key: "id",
        label: "Identifiant",
        kind: "number",
        readOnly: true,
        section: "general",
    },
    uniqueName: {
        key: "uniqueName",
        label: "Nom unique",
        kind: "text",
        minLength: 3,
        maxLength: 120,
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
    electricityConsumption: {
        key: "electricityConsumption",
        label: "Consommation electrique",
        kind: "number",
        min: 0,
        max: 100000,
        step: 0.01,
        section: "general",
    },
    nominalPowerWatts: {
        key: "nominalPowerWatts",
        label: "Puissance nominale (W)",
        kind: "number",
        min: 0,
        max: 100000,
        step: 0.1,
        section: "general",
    },
    averageDailyUsageHours: {
        key: "averageDailyUsageHours",
        label: "Utilisation moyenne journaliere (h)",
        kind: "number",
        min: 0,
        max: 24,
        step: 0.1,
        section: "general",
    },
    maintenanceIntervalDays: {
        key: "maintenanceIntervalDays",
        label: "Intervalle de maintenance (jours)",
        kind: "number",
        min: 0,
        max: 3650,
        step: 1,
        section: "general",
    },
    lastPowerOnAt: {
        key: "lastPowerOnAt",
        label: "Derniere mise sous tension",
        kind: "datetime",
        readOnly: true,
        section: "general",
    },
    lastPowerOffAt: {
        key: "lastPowerOffAt",
        label: "Derniere extinction",
        kind: "datetime",
        readOnly: true,
        section: "general",
    },
    lastMaintenanceAt: {
        key: "lastMaintenanceAt",
        label: "Derniere maintenance",
        kind: "datetime",
        readOnly: true,
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
        valueGetter: (device) => device.owner?.login ?? null,
        readOnly: true,
        section: "general",
    },
};

const DEVICE_TYPE_FIELD_DEFINITIONS = {
    LIGHT: [
        {
            key: "light.powerWatts",
            label: "Puissance (W)",
            kind: "number",
            min: 0,
            max: 1000,
            step: 0.1,
            section: "specific",
            source: "light",
            field: "powerWatts",
        },
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
        {
            key: "light.colorTemperature",
            label: "Temperature de couleur (K)",
            kind: "number",
            min: 1000,
            max: 20000,
            step: 1,
            section: "specific",
            source: "light",
            field: "colorTemperature",
        },
        {
            key: "light.lastSwitchedOnAt",
            label: "Dernier allumage",
            kind: "datetime",
            readOnly: true,
            section: "specific",
            source: "light",
            field: "lastSwitchedOnAt",
        },
        {
            key: "light.lastSwitchedOffAt",
            label: "Dernier arret",
            kind: "datetime",
            readOnly: true,
            section: "specific",
            source: "light",
            field: "lastSwitchedOffAt",
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
        {
            key: "sensor.samplingIntervalSeconds",
            label: "Intervalle d'echantillonnage (s)",
            kind: "number",
            min: 1,
            max: 86400,
            step: 1,
            section: "specific",
            source: "sensor",
            field: "samplingIntervalSeconds",
        },
        {
            key: "sensor.batteryLevel",
            label: "Batterie (%)",
            kind: "number",
            readOnly: true,
            section: "specific",
            source: "sensor",
            field: "batteryLevel",
        },
        {
            key: "sensor.lastReadingAt",
            label: "Derniere mesure",
            kind: "datetime",
            readOnly: true,
            section: "specific",
            source: "sensor",
            field: "lastReadingAt",
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
        {
            key: "thermostat.powerWatts",
            label: "Puissance (W)",
            kind: "number",
            min: 0,
            max: 10000,
            step: 0.1,
            section: "specific",
            source: "thermostat",
            field: "powerWatts",
        },
        {
            key: "thermostat.lastHeatingAt",
            label: "Dernier chauffage",
            kind: "datetime",
            readOnly: true,
            section: "specific",
            source: "thermostat",
            field: "lastHeatingAt",
        },
        {
            key: "thermostat.lastCoolingAt",
            label: "Dernier refroidissement",
            kind: "datetime",
            readOnly: true,
            section: "specific",
            source: "thermostat",
            field: "lastCoolingAt",
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
        {
            key: "whiteboard.powerWatts",
            label: "Puissance (W)",
            kind: "number",
            min: 0,
            max: 10000,
            step: 0.1,
            section: "specific",
            source: "whiteboard",
            field: "powerWatts",
        },
        {
            key: "whiteboard.lastSwitchedOnAt",
            label: "Dernier allumage",
            kind: "datetime",
            readOnly: true,
            section: "specific",
            source: "whiteboard",
            field: "lastSwitchedOnAt",
        },
        {
            key: "whiteboard.lastSwitchedOffAt",
            label: "Dernier arret",
            kind: "datetime",
            readOnly: true,
            section: "specific",
            source: "whiteboard",
            field: "lastSwitchedOffAt",
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
        {
            key: "camera.powerWatts",
            label: "Puissance (W)",
            kind: "number",
            min: 0,
            max: 10000,
            step: 0.1,
            section: "specific",
            source: "camera",
            field: "powerWatts",
        },
        {
            key: "camera.streamingBitrateKbps",
            label: "Debit de flux (kbps)",
            kind: "number",
            min: 0,
            max: 100000,
            step: 1,
            section: "specific",
            source: "camera",
            field: "streamingBitrateKbps",
        },
        {
            key: "camera.lastRecordingStartedAt",
            label: "Debut du dernier enregistrement",
            kind: "datetime",
            readOnly: true,
            section: "specific",
            source: "camera",
            field: "lastRecordingStartedAt",
        },
        {
            key: "camera.lastRecordingStoppedAt",
            label: "Fin du dernier enregistrement",
            kind: "datetime",
            readOnly: true,
            section: "specific",
            source: "camera",
            field: "lastRecordingStoppedAt",
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
        {
            key: "accessControl.powerWatts",
            label: "Puissance (W)",
            kind: "number",
            min: 0,
            max: 10000,
            step: 0.1,
            section: "specific",
            source: "accessControl",
            field: "powerWatts",
        },
        {
            key: "accessControl.lastOpenedAt",
            label: "Derniere ouverture",
            kind: "datetime",
            readOnly: true,
            section: "specific",
            source: "accessControl",
            field: "lastOpenedAt",
        },
        {
            key: "accessControl.lastClosedAt",
            label: "Derniere fermeture",
            kind: "datetime",
            readOnly: true,
            section: "specific",
            source: "accessControl",
            field: "lastClosedAt",
        },
    ],
};

const EDITABLE_FIELD_KEYS_BY_ROLE = {
    USER: [],
    SUPER_USER: ["status", "light.brightness", "light.color", "thermostat.targetTemp", "thermostat.mode"],
    ADMIN: [
        "name",
        "description",
        "brand",
        "model",
        "status",
        "nominalPowerWatts",
        "averageDailyUsageHours",
        "maintenanceIntervalDays",
        "light.powerWatts",
        "light.colorTemperature",
        "sensor.samplingIntervalSeconds",
        "thermostat.powerWatts",
        "whiteboard.powerWatts",
        "camera.powerWatts",
        "camera.streamingBitrateKbps",
        "accessControl.powerWatts",
    ],
};

const DEVICE_TYPE_SUPPORT = {
    LIGHT: {
        editableFieldKeys: [
            "status",
            "light.brightness",
            "light.color",
            "light.powerWatts",
            "light.colorTemperature",
            "name",
            "description",
            "brand",
            "model",
            "nominalPowerWatts",
            "averageDailyUsageHours",
            "maintenanceIntervalDays",
        ],
    },
    SENSOR: {
        editableFieldKeys: [
            "status",
            "sensor.samplingIntervalSeconds",
            "name",
            "description",
            "brand",
            "model",
            "nominalPowerWatts",
            "averageDailyUsageHours",
            "maintenanceIntervalDays",
        ],
    },
    THERMOSTAT: {
        editableFieldKeys: [
            "status",
            "thermostat.targetTemp",
            "thermostat.mode",
            "thermostat.powerWatts",
            "name",
            "description",
            "brand",
            "model",
            "nominalPowerWatts",
            "averageDailyUsageHours",
            "maintenanceIntervalDays",
        ],
    },
    CAMERA: {
        editableFieldKeys: [
            "status",
            "camera.powerWatts",
            "camera.streamingBitrateKbps",
            "name",
            "description",
            "brand",
            "model",
            "nominalPowerWatts",
            "averageDailyUsageHours",
            "maintenanceIntervalDays",
        ],
    },
    ACCESS_CONTROL: {
        editableFieldKeys: [
            "status",
            "accessControl.powerWatts",
            "name",
            "description",
            "brand",
            "model",
            "nominalPowerWatts",
            "averageDailyUsageHours",
            "maintenanceIntervalDays",
        ],
    },
    WHITEBOARD: {
        editableFieldKeys: [
            "status",
            "whiteboard.powerWatts",
            "name",
            "description",
            "brand",
            "model",
            "nominalPowerWatts",
            "averageDailyUsageHours",
            "maintenanceIntervalDays",
        ],
    },
};

const DEVICE_FIELD_VALIDATORS = {
    uniqueName: (value, definition) => normalizeTextValue(value, {
        minLength: definition.minLength ?? 1,
        maxLength: definition.maxLength,
        fieldName: definition.label,
    }),
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
    electricityConsumption: (value, definition) => normalizeNumberValue(value, {
        min: definition.min,
        max: definition.max,
        step: definition.step,
        fieldName: definition.label,
    }),
    nominalPowerWatts: (value, definition) => normalizeNumberValue(value, {
        min: definition.min,
        max: definition.max,
        step: definition.step,
        fieldName: definition.label,
    }),
    averageDailyUsageHours: (value, definition) => normalizeNumberValue(value, {
        min: definition.min,
        max: definition.max,
        step: definition.step,
        fieldName: definition.label,
    }),
    maintenanceIntervalDays: (value, definition) => normalizeNumberValue(value, {
        min: definition.min,
        max: definition.max,
        step: definition.step,
        integer: true,
        fieldName: definition.label,
    }),
    status: (value, definition) => normalizeEnumValue(value, DEVICE_STATUS_VALUES, definition.label),
    "light.powerWatts": (value, definition) => normalizeNumberValue(value, {
        min: definition.min ?? 0,
        max: definition.max ?? 1000,
        step: definition.step ?? 0.1,
        fieldName: definition.label,
    }),
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
    "light.colorTemperature": (value, definition) => normalizeNumberValue(value, {
        min: definition.min ?? 1000,
        max: definition.max ?? 20000,
        step: definition.step ?? 1,
        integer: true,
        fieldName: definition.label,
    }),
    "sensor.samplingIntervalSeconds": (value, definition) => normalizeNumberValue(value, {
        min: definition.min ?? 1,
        max: definition.max ?? 86400,
        step: definition.step ?? 1,
        integer: true,
        fieldName: definition.label,
    }),
    "thermostat.targetTemp": (value, definition) => normalizeNumberValue(value, {
        min: definition.min ?? 5,
        max: definition.max ?? 35,
        step: definition.step ?? 0.5,
        fieldName: definition.label,
    }),
    "thermostat.mode": (value, definition) => normalizeEnumValue(value, THERMOSTAT_MODE_VALUES, definition.label),
    "thermostat.powerWatts": (value, definition) => normalizeNumberValue(value, {
        min: definition.min ?? 0,
        max: definition.max ?? 10000,
        step: definition.step ?? 0.1,
        fieldName: definition.label,
    }),
    "sensor.value": (value, definition) => normalizeNumberValue(value, {
        fieldName: definition.label,
    }),
    "camera.powerWatts": (value, definition) => normalizeNumberValue(value, {
        min: definition.min ?? 0,
        max: definition.max ?? 10000,
        step: definition.step ?? 0.1,
        fieldName: definition.label,
    }),
    "camera.streamingBitrateKbps": (value, definition) => normalizeNumberValue(value, {
        min: definition.min ?? 0,
        max: definition.max ?? 100000,
        step: definition.step ?? 1,
        integer: true,
        fieldName: definition.label,
    }),
    "thermostat.temperature": (value, definition) => normalizeNumberValue(value, {
        fieldName: definition.label,
    }),
    "whiteboard.powerWatts": (value, definition) => normalizeNumberValue(value, {
        min: definition.min ?? 0,
        max: definition.max ?? 10000,
        step: definition.step ?? 0.1,
        fieldName: definition.label,
    }),
    "camera.resolution": (value, definition) => normalizeTextValue(value, {
        minLength: 1,
        maxLength: 80,
        fieldName: definition.label,
    }),
    "camera.frameRate": (value, definition) => normalizeNumberValue(value, {
        min: 1,
        max: 240,
        step: 0.1,
        fieldName: definition.label,
    }),
    "whiteboard.resolution": (value, definition) => normalizeTextValue(value, {
        minLength: 1,
        maxLength: 80,
        fieldName: definition.label,
    }),
    "whiteboard.screenSize": (value, definition) => normalizeNumberValue(value, {
        min: 1,
        max: 200,
        step: 0.1,
        fieldName: definition.label,
    }),
    "accessControl.status": (value, definition) => normalizeTextValue(value, {
        minLength: 1,
        maxLength: 80,
        fieldName: definition.label,
    }),
    "accessControl.powerWatts": (value, definition) => normalizeNumberValue(value, {
        min: definition.min ?? 0,
        max: definition.max ?? 10000,
        step: definition.step ?? 0.1,
        fieldName: definition.label,
    }),
};

const REQUIRED_CREATE_FIELDS_BY_TYPE = {
    LIGHT: ["uniqueName", "name", "description", "brand", "model", "light.brightness", "light.color"],
    SENSOR: ["uniqueName", "name", "description", "brand", "model", "sensor.value"],
    THERMOSTAT: [
        "uniqueName",
        "name",
        "description",
        "brand",
        "model",
        "thermostat.temperature",
        "thermostat.targetTemp",
    ],
    CAMERA: ["uniqueName", "name", "description", "brand", "model", "camera.resolution", "camera.frameRate"],
    ACCESS_CONTROL: ["uniqueName", "name", "description", "brand", "model", "accessControl.status"],
    WHITEBOARD: [
        "uniqueName",
        "name",
        "description",
        "brand",
        "model",
        "whiteboard.resolution",
        "whiteboard.screenSize",
    ],
};

const DEVICE_HISTORY_TRACKERS = {
    electricityConsumption: {
        kind: "MEASUREMENT",
        unit: "kWh",
        section: "general",
    },
    nominalPowerWatts: {
        kind: "MEASUREMENT",
        unit: "W",
        section: "general",
    },
    averageDailyUsageHours: {
        kind: "USAGE",
        unit: "h/j",
        section: "general",
    },
    maintenanceIntervalDays: {
        kind: "MAINTENANCE",
        unit: "jours",
        section: "general",
    },
    status: {
        kind: "STATE_CHANGE",
        section: "general",
    },
    "light.brightness": {
        kind: "MEASUREMENT",
        unit: "%",
        section: "specific",
        source: "light",
        field: "brightness",
    },
    "light.color": {
        kind: "SNAPSHOT",
        section: "specific",
        source: "light",
        field: "color",
    },
    "light.powerWatts": {
        kind: "MEASUREMENT",
        unit: "W",
        section: "specific",
        source: "light",
        field: "powerWatts",
    },
    "light.colorTemperature": {
        kind: "MEASUREMENT",
        unit: "K",
        section: "specific",
        source: "light",
        field: "colorTemperature",
    },
    "sensor.value": {
        kind: "MEASUREMENT",
        section: "specific",
        source: "sensor",
        field: "value",
    },
    "sensor.samplingIntervalSeconds": {
        kind: "USAGE",
        unit: "s",
        section: "specific",
        source: "sensor",
        field: "samplingIntervalSeconds",
    },
    "sensor.batteryLevel": {
        kind: "MEASUREMENT",
        unit: "%",
        section: "specific",
        source: "sensor",
        field: "batteryLevel",
    },
    "thermostat.temperature": {
        kind: "MEASUREMENT",
        unit: "C",
        section: "specific",
        source: "thermostat",
        field: "temperature",
    },
    "thermostat.targetTemp": {
        kind: "MEASUREMENT",
        unit: "C",
        section: "specific",
        source: "thermostat",
        field: "targetTemp",
    },
    "thermostat.mode": {
        kind: "STATE_CHANGE",
        section: "specific",
        source: "thermostat",
        field: "mode",
    },
    "thermostat.powerWatts": {
        kind: "MEASUREMENT",
        unit: "W",
        section: "specific",
        source: "thermostat",
        field: "powerWatts",
    },
    "whiteboard.resolution": {
        kind: "SNAPSHOT",
        section: "specific",
        source: "whiteboard",
        field: "resolution",
    },
    "whiteboard.screenSize": {
        kind: "SNAPSHOT",
        unit: "in",
        section: "specific",
        source: "whiteboard",
        field: "screenSize",
    },
    "whiteboard.powerWatts": {
        kind: "MEASUREMENT",
        unit: "W",
        section: "specific",
        source: "whiteboard",
        field: "powerWatts",
    },
    "camera.resolution": {
        kind: "SNAPSHOT",
        section: "specific",
        source: "camera",
        field: "resolution",
    },
    "camera.frameRate": {
        kind: "MEASUREMENT",
        unit: "fps",
        section: "specific",
        source: "camera",
        field: "frameRate",
    },
    "camera.powerWatts": {
        kind: "MEASUREMENT",
        unit: "W",
        section: "specific",
        source: "camera",
        field: "powerWatts",
    },
    "camera.streamingBitrateKbps": {
        kind: "MEASUREMENT",
        unit: "kbps",
        section: "specific",
        source: "camera",
        field: "streamingBitrateKbps",
    },
    "accessControl.status": {
        kind: "STATE_CHANGE",
        section: "specific",
        source: "accessControl",
        field: "status",
    },
    "accessControl.powerWatts": {
        kind: "MEASUREMENT",
        unit: "W",
        section: "specific",
        source: "accessControl",
        field: "powerWatts",
    },
};

const serializeHistoryValue = (value) => {
    if (value instanceof Date) {
        return value.toISOString();
    }

    if (value === undefined) {
        return null;
    }

    if (value === null) {
        return null;
    }

    if (typeof value === "object") {
        return JSON.stringify(value);
    }

    return String(value);
};

const getTrackedFieldValue = (entity, tracker, fieldKey) => {
    if (tracker.section === "specific") {
        return entity?.[tracker.source]?.[tracker.field] ?? null;
    }

    return entity?.[fieldKey] ?? null;
};

const buildHistoryEntry = ({ deviceId, fieldKey, tracker, previousValue, currentValue }) => {
    const normalizedCurrentValue = serializeHistoryValue(currentValue);
    return {
        deviceId,
        kind: tracker.kind,
        fieldKey,
        previousValue: serializeHistoryValue(previousValue),
        currentValue: normalizedCurrentValue,
        numericValue: typeof currentValue === "number" && Number.isFinite(currentValue) ? currentValue : null,
        unit: tracker.unit ?? null,
        note: tracker.note ?? null,
    };
};

const buildDeviceHistoryEntries = ({ deviceId, currentState, generalValues = {}, specificValues = {} }) => {
    const historyEntries = [];

    for (const [fieldKey, tracker] of Object.entries(DEVICE_HISTORY_TRACKERS)) {
        const hasIncomingValue = tracker.section === "specific"
            ? Object.prototype.hasOwnProperty.call(specificValues[tracker.source] ?? {}, tracker.field)
            : Object.prototype.hasOwnProperty.call(generalValues, fieldKey);

        if (!hasIncomingValue) {
            continue;
        }

        const currentValue = tracker.section === "specific"
            ? specificValues[tracker.source]?.[tracker.field]
            : generalValues[fieldKey];

        const previousValue = currentState ? getTrackedFieldValue(currentState, tracker, fieldKey) : null;

        if (currentState && previousValue === currentValue) {
            continue;
        }

        historyEntries.push(buildHistoryEntry({
            deviceId,
            fieldKey,
            tracker,
            previousValue,
            currentValue,
        }));
    }

    return historyEntries;
};

const buildDeviceHistoryResponse = (historyEntries = []) => historyEntries.map((entry) => ({
    id: entry.id,
    kind: entry.kind,
    fieldKey: entry.fieldKey,
    previousValue: entry.previousValue,
    currentValue: entry.currentValue,
    numericValue: entry.numericValue,
    unit: entry.unit,
    note: entry.note,
    recordedAt: entry.recordedAt,
}));

const buildDeviceStatistics = (device, historyEntries = []) => {
    const estimatedDailyConsumptionKwh = (device.nominalPowerWatts * device.averageDailyUsageHours) / 1000;
    const estimatedMonthlyConsumptionKwh = estimatedDailyConsumptionKwh * 30;

    return {
        consumption: {
            electricityConsumptionKwh: device.electricityConsumption,
            nominalPowerWatts: device.nominalPowerWatts,
            averageDailyUsageHours: device.averageDailyUsageHours,
            estimatedDailyConsumptionKwh,
            estimatedMonthlyConsumptionKwh,
        },
        maintenance: {
            maintenanceIntervalDays: device.maintenanceIntervalDays,
            lastMaintenanceAt: device.lastMaintenanceAt,
        },
        lifecycle: {
            lastPowerOnAt: device.lastPowerOnAt,
            lastPowerOffAt: device.lastPowerOffAt,
            lastActivityAt: historyEntries[0]?.recordedAt ?? device.lastUpdated,
        },
        history: {
            entriesCount: historyEntries.length,
        },
    };
};

const getDeviceCreateForm = (role) => {
    const typeForms = DEVICE_TYPES.reduce((accumulator, deviceType) => {
        const requiredFieldKeys = [
            "type",
            "areaId",
            ...(REQUIRED_CREATE_FIELDS_BY_TYPE[deviceType] ?? []),
        ];

        accumulator[deviceType] = {
            requiredFieldKeys,
            supportedSpecificFields: (DEVICE_TYPE_FIELD_DEFINITIONS[deviceType] ?? []).map((field) => field.key),
            fields: buildCreateFormFields({
                entityType: deviceType,
                generalFieldDefinitions: GENERAL_FIELD_DEFINITIONS,
                entityTypeFieldDefinitions: DEVICE_TYPE_FIELD_DEFINITIONS,
                requiredFieldKeys,
                forcedEditableFieldKeys: requiredFieldKeys,
            }),
        };

        return accumulator;
    }, {});

    return {
        resource: "IOT_DEVICE",
        role,
        create: {
            method: "POST",
            endpoint: "/api/devices",
            contentType: "multipart/form-data",
            imageField: "image",
            typeOptions: DEVICE_TYPES,
            byType: typeForms,
        },
    };
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
                powerWatts: device.light?.powerWatts ?? null,
                brightness: device.light?.brightness ?? null,
                color: device.light?.color ?? null,
                colorTemperature: device.light?.colorTemperature ?? null,
                lastSwitchedOnAt: device.light?.lastSwitchedOnAt ?? null,
                lastSwitchedOffAt: device.light?.lastSwitchedOffAt ?? null,
            };
        case "SENSOR":
            return {
                value: device.sensor?.value ?? null,
                timestamp: device.sensor?.timestamp ?? null,
                samplingIntervalSeconds: device.sensor?.samplingIntervalSeconds ?? null,
                batteryLevel: device.sensor?.batteryLevel ?? null,
                lastReadingAt: device.sensor?.lastReadingAt ?? null,
            };
        case "THERMOSTAT":
            return {
                temperature: device.thermostat?.temperature ?? null,
                targetTemp: device.thermostat?.targetTemp ?? null,
                mode: device.thermostat?.mode ?? null,
                powerWatts: device.thermostat?.powerWatts ?? null,
                lastHeatingAt: device.thermostat?.lastHeatingAt ?? null,
                lastCoolingAt: device.thermostat?.lastCoolingAt ?? null,
            };
        case "WHITEBOARD":
            return {
                resolution: device.whiteboard?.resolution ?? null,
                screenSize: device.whiteboard?.screenSize ?? null,
                powerWatts: device.whiteboard?.powerWatts ?? null,
                lastSwitchedOnAt: device.whiteboard?.lastSwitchedOnAt ?? null,
                lastSwitchedOffAt: device.whiteboard?.lastSwitchedOffAt ?? null,
            };
        case "CAMERA":
            return {
                resolution: device.camera?.resolution ?? null,
                frameRate: device.camera?.frameRate ?? null,
                powerWatts: device.camera?.powerWatts ?? null,
                streamingBitrateKbps: device.camera?.streamingBitrateKbps ?? null,
                lastRecordingStartedAt: device.camera?.lastRecordingStartedAt ?? null,
                lastRecordingStoppedAt: device.camera?.lastRecordingStoppedAt ?? null,
            };
        case "ACCESS_CONTROL":
            return {
                status: device.accessControl?.status ?? null,
                powerWatts: device.accessControl?.powerWatts ?? null,
                lastOpenedAt: device.accessControl?.lastOpenedAt ?? null,
                lastClosedAt: device.accessControl?.lastClosedAt ?? null,
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
        historyEntries: {
            orderBy: {
                recordedAt: "desc",
            },
            take: 50,
        },
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

/** Builds the response object for a device, including its details and form configuration based on the user's role.
 * @param {object} device - The device object to build the response for.
 * @param {string} role - The role of the user requesting the device details (e.g., "USER", "SUPER_USER", "ADMIN").
 * @returns {object} The response object containing device details and form configuration.
 */
const buildDeviceResponse = (device, role) => {
    const historyEntries = buildDeviceHistoryResponse(device.historyEntries ?? []);

    const editableFieldKeys = getEditableFieldKeys({
        role,
        entityType: device.type,
        editableFieldKeysByRole: EDITABLE_FIELD_KEYS_BY_ROLE,
        entityTypeSupport: DEVICE_TYPE_SUPPORT,
    });

    return {
        id: device.id,
        uniqueName: device.uniqueName,
        name: device.name,
        description: device.description,
        createdAt: device.createdAt,
        brand: device.brand,
        model: device.model,
        electricityConsumption: device.electricityConsumption,
        status: device.status,
        type: device.type,
        areaId: device.areaId,
        owner: device.owner
            ? {
                id: device.owner.id,
                login: device.owner.login,
                firstName: device.owner.firstName,
                lastName: device.owner.lastName,
            }
            : null,
        ownerName: device.owner?.login ?? null,
        area: device.area
            ? {
                id: device.area.id,
                name: device.area.name,
                description: device.area.description,
                type: device.area.type,
            }
            : null,
        specific: buildDeviceSpecificPayload(device),
        statistics: buildDeviceStatistics(device, device.historyEntries ?? []),
        history: {
            count: historyEntries.length,
            entries: historyEntries,
        },
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

    const historyEntries = buildDeviceHistoryEntries({
        deviceId,
        currentState: device,
        generalValues: generalUpdates,
        specificValues: specificUpdates,
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

        if (historyEntries.length > 0) {
            await transaction.ioTDeviceHistory.createMany({
                data: historyEntries,
            });
        }
    });

    return getDeviceDetails(deviceId, role);
};

const createDevice = async ({ role, ownerId, payload, imageUrl }) => {
    await assertAdminCreator({
        role,
        ownerId,
        findUserById: (id) => prisma.user.findUnique({ where: { id }, select: { id: true } }),
    });

    const flattenedPayload = normalizeRawUpdatePayload(payload);
    const deviceType = normalizeEnumValue(flattenedPayload.type, DEVICE_TYPES, "Type");

    const { generalCreateData, specificCreateData } = validateAndBuildCreateData({
        payload,
        entityType: deviceType,
        generalFieldDefinitions: GENERAL_FIELD_DEFINITIONS,
        entityTypeFieldDefinitions: DEVICE_TYPE_FIELD_DEFINITIONS,
        validatorsByField: DEVICE_FIELD_VALIDATORS,
        requiredFieldKeys: REQUIRED_CREATE_FIELDS_BY_TYPE[deviceType],
    });

    const areaId = normalizeNumberValue(flattenedPayload.areaId, {
        min: 1,
        step: 1,
        integer: true,
        fieldName: "Zone (areaId)",
    });

    const areaExists = await prisma.area.findUnique({
        where: { id: areaId },
        select: { id: true },
    });

    if (!areaExists) {
        const error = new Error("La zone renseignee est introuvable.");
        error.statusCode = 400;
        throw error;
    }

    const uniqueNameExists = await prisma.ioTDevice.findUnique({
        where: { uniqueName: generalCreateData.uniqueName },
        select: { id: true },
    });

    if (uniqueNameExists) {
        const error = new Error("Le nom unique est deja utilise.");
        error.statusCode = 400;
        throw error;
    }

    if (imageUrl) {
        generalCreateData.imageUrl = imageUrl;
    }

    const createdDevice = await prisma.$transaction(async (transaction) => {
        const device = await transaction.ioTDevice.create({
            data: {
                ...generalCreateData,
                areaId,
                type: deviceType,
                ownerId,
            },
            select: {
                id: true,
            },
        });

        if (deviceType === "LIGHT") {
            await transaction.light.create({
                data: {
                    deviceId: device.id,
                    ...specificCreateData.light,
                },
            });
        }

        if (deviceType === "SENSOR") {
            await transaction.sensor.create({
                data: {
                    deviceId: device.id,
                    ...specificCreateData.sensor,
                },
            });
        }

        if (deviceType === "THERMOSTAT") {
            await transaction.thermostat.create({
                data: {
                    deviceId: device.id,
                    ...specificCreateData.thermostat,
                },
            });
        }

        if (deviceType === "CAMERA") {
            await transaction.camera.create({
                data: {
                    deviceId: device.id,
                    ...specificCreateData.camera,
                },
            });
        }

        if (deviceType === "WHITEBOARD") {
            await transaction.interactiveWhiteboard.create({
                data: {
                    deviceId: device.id,
                    ...specificCreateData.whiteboard,
                },
            });
        }

        if (deviceType === "ACCESS_CONTROL") {
            await transaction.accessControl.create({
                data: {
                    deviceId: device.id,
                    ...specificCreateData.accessControl,
                },
            });
        }

        const historyEntries = buildDeviceHistoryEntries({
            deviceId: device.id,
            currentState: null,
            generalValues: generalCreateData,
            specificValues: specificCreateData,
        });

        if (historyEntries.length > 0) {
            await transaction.ioTDeviceHistory.createMany({
                data: historyEntries,
            });
        }

        return device;
    });

    return getDeviceDetails(createdDevice.id, role);
};

export const deleteDevice = async (deviceId) => {
    await prisma.device.delete({
        where: { id: deviceId },
    });
};

export default {
    getDeviceCreateForm,
    getDeviceDetails,
    updateDevice,
    createDevice,
    deleteDevice,
};
