import { DeviceType, DeviceStatus, AreaType, EventType, ThermostatMode } from "@prisma/client";


export const LIMITS = {
    DEFAULT_STRING: 200,
    NAME: 100,
    EMAIL: 254,
    PASSWORD: 128,
    DESCRIPTION: 1000,
};

export const ROLE_HIERARCHY = {
    GUEST: null,
    USER: "GUEST",
    SUPER_USER: "USER",
    ADMIN: "SUPER_USER",
};



export const ALLOWED_SEARCH_TYPES = ["device", "area", "event", "all"]; //DO NOT RENAME

//TODO stop using this (use enums imported from prisma instead)
export const DEVICE_STATUS_VALUES = Array.from(Object.values(DeviceStatus));
export const DEVICE_TYPES = Array.from(Object.values(DeviceType));
export const THERMOSTAT_MODE_VALUES = Array.from(Object.values(ThermostatMode));
export const AREA_TYPES = Array.from(Object.values(AreaType));
export const EVENT_TYPES = Array.from(Object.values(EventType));