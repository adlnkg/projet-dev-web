import Fuse from 'fuse.js';
import prisma from "../config/db.js";

const AREA_HIERARCHY_DECAY = 0.55;


/** Builds a hierarchy index for areas to enable searching across parent areas.
 * @returns {Promise<{ buildHierarchyFields: function }>} An object containing the function to build hierarchy fields.
 * (e.g., { buildHierarchyFields: (areaId, prefix) => ({ areaLevel0Name: "Root", areaLevel0Type: "Building", ... }) })
 */
const getAreaHierarchyIndex = async () => {
    const allAreas = await prisma.area.findMany({
        select: {
            id: true,
            parentAreaId: true,
            name: true,
            description: true,
            type: true
        }
    });

    const areasById = new Map(allAreas.map((area) => [area.id, area]));

    const getAreaLineage = (areaId) => {
        const lineage = [];
        const visited = new Set();
        let currentId = areaId;

        while (currentId && !visited.has(currentId)) {
            visited.add(currentId);
            const area = areasById.get(currentId);
            if (!area) {
                break;
            }

            lineage.push(area);
            currentId = area.parentAreaId;
        }

        return lineage;
    };

    const buildHierarchyFields = (areaId, prefix) => {
        const lineage = getAreaLineage(areaId);
        const fields = {};

        lineage.forEach((ancestor, depth) => {
            fields[`${prefix}${depth}Name`] = ancestor.name ?? "";
            fields[`${prefix}${depth}Type`] = ancestor.type ?? "";
            fields[`${prefix}${depth}Description`] = ancestor.description ?? "";
        });

        return fields;
    };

    return { buildHierarchyFields };
};

/** Determines the maximum hierarchy depth present in the items based on the specified prefix.
 * @param {Array<Object>} items - The list of items to analyze.
 * @param {string} prefix - The prefix used for hierarchy fields (e.g., "areaLevel").
 * @returns {number} The maximum hierarchy depth found in the items.
 */
const getMaxHierarchyDepth = (items, prefix) => items.reduce((depth, item) => {
    const itemDepth = Object.keys(item).reduce((count, key) => (
        key.startsWith(prefix) && key.endsWith("Name") ? count + 1 : count
    ), 0);

    return Math.max(depth, itemDepth - 1);
}, 0);


/** Builds the keys for Fuse.js search based on the hierarchy depth and specified weights.
 * @param {number} maxDepth - The maximum hierarchy depth to consider.
 * @param {string} prefix - The prefix used for hierarchy fields (e.g., "areaLevel").
 * @param {Object} weights - An object containing the weights for name, type, and description fields.
 * @returns {Array<Object>} An array of key objects for Fuse.js search configuration (e.g., { name: "areaLevel0Name", weight: 0.2 }).
 */
const buildHierarchyFuseKeys = (maxDepth, prefix, weights) => {
    const keys = [];

    for (let depth = 0; depth <= maxDepth; depth += 1) {
        const decay = Math.pow(AREA_HIERARCHY_DECAY, depth);
        keys.push(
            { name: `${prefix}${depth}Name`, weight: weights.name * decay },
            { name: `${prefix}${depth}Type`, weight: weights.type * decay },
            { name: `${prefix}${depth}Description`, weight: weights.description * decay }
        );
    }

    return keys;
};

/** Builds the search payload for area hierarchy by enriching items with hierarchy fields and generating Fuse.js keys.
 * @param {Array<Object>} items - The list of items to enrich with hierarchy fields.
 * @param {string} areaIdField - The field name in the items that contains the area ID (e.g., "areaId").
 * @param {string} prefix - The prefix used for hierarchy fields (e.g., "areaLevel").
 * @param {Object} weights - An object containing the weights for name, type, and description fields in the hierarchy (e.g., { name: 0.2, type: 0.1, description: 0.05 }).
 * @param {Function} buildHierarchyFields - The function to build hierarchy fields for search.
 * @returns { {itemsWithHierarchy: Array<Object>, hierarchyKeys: Array<Object> }} An object containing the enriched items and Fuse.js keys
 * (e.g., { itemsWithHierarchy: [{ areaLevel0Name: "Root", areaLevel0Type: "Building", ... }], hierarchyKeys: [{ name: "areaLevel0Name", weight: 0.2 }, ...] })
 */
const buildAreaHierarchySearchPayload = (items, areaIdField, prefix, weights, buildHierarchyFields) => {

    const itemsWithHierarchy = items.map((item) => ({
        ...item,
        ...buildHierarchyFields(item[areaIdField], prefix)
    }));

    const maxDepth = getMaxHierarchyDepth(itemsWithHierarchy, prefix);
    const hierarchyKeys = buildHierarchyFuseKeys(maxDepth, prefix, weights);

    return { itemsWithHierarchy, hierarchyKeys };
};

/**
 * Search for devices, areas, and events based on keywords and building filters.
 * @param {string} keywords 
 * @param {Array<number>} areasIds 
 * @param {Function} buildHierarchyFields 
 * @returns {Promise<import('@prisma/client').IoTDevice[]>} */
const searchDevices = async (keywords, areasIds, buildHierarchyFields) => {
    // fetch devices with basic filtering
    const devices = await prisma.ioTDevice.findMany({
        include: {
            sensor: true,
            whiteboard: true,
            light: true,
            thermostat: true
        },
        where: areasIds.length > 0 ? {
            areaId: { in: areasIds },

        } : {}  // if empty return all devices
    });

    if (!keywords || !keywords.trim())
        return devices;


    const { itemsWithHierarchy: devicesWithAreaSearch, hierarchyKeys: areaHierarchyKeys } = await buildAreaHierarchySearchPayload(
        devices,
        "areaId",
        "areaLevel",
        { name: 0.2, type: 0.07, description: 0.04 },
        buildHierarchyFields
    );

    const fuse = new Fuse(devicesWithAreaSearch, {
        threshold: 0.35,
        ignoreLocation: true,
        keys: [
            { name: "name", weight: 0.35 },
            { name: "type", weight: 0.25 },
            { name: "description", weight: 0.08 },
            { name: "brand", weight: 0.06 },
            { name: "model", weight: 0.05 },
            { name: "createdAt", weight: 0.01, getFn: (device) => device.createdAt?.toISOString?.() ?? "" },
            ...areaHierarchyKeys,
        ]
    });

    return fuse.search(keywords).map((result) => result.item);
};

const searchAreas = async (keywords, areasIds, buildHierarchyFields) => {
    // fetch areas with basic filtering
    const areas = await prisma.area.findMany({
        where: areasIds.length > 0 ? {
            id: { in: areasIds },
        } : {},  // if empty return all areas
        select: {
            id: true,
            parentAreaId: true,
            name: true,
            description: true,
            type: true
        }
    });

    if (!keywords || !keywords.trim())
        return areas;

    const { itemsWithHierarchy: searchableAreas, hierarchyKeys: keys } = await buildAreaHierarchySearchPayload(
        areas,
        "id",
        "level",
        { name: 0.5, type: 0.3, description: 0.2 },
        buildHierarchyFields
    );

    const fuse = new Fuse(searchableAreas, {
        threshold: 0.35,
        ignoreLocation: true,
        keys
    });

    return fuse.search(keywords).map((result) => result.item);
};

/**
 * Search for events based on keywords and building filters.
 * @param {string} keywords  the search keywords to match against event fields and associated area hierarchy.
 * @param {Array<number>} areasIds the list of area IDs to filter events by their associated areas (if empty, no area filtering is applied).
 * @param {Function} buildHierarchyFields function to build hierarchy fields for search.
 * @returns {Promise<import('@prisma/client').Event[]>} the list of events that match the search criteria, enriched with area hierarchy fields for improved search relevance.
 */
const searchEvents = async (keywords, areasIds, buildHierarchyFields) => {
    const events = await prisma.event.findMany({
        where: areasIds.length > 0 ? {
            areaId: { in: areasIds },
        } : {}  // if empty return all events
    });

    if (!keywords || !keywords.trim())
        return events;

    const { itemsWithHierarchy: searchableEvents, hierarchyKeys: areaHierarchyKeys } = await buildAreaHierarchySearchPayload(
        events,
        "areaId",
        "areaLevel",
        { name: 0.2, type: 0.1, description: 0.05 },
        buildHierarchyFields
    );

    const fuse = new Fuse(searchableEvents, {
        threshold: 0.35,
        ignoreLocation: true,
        keys: [
            { name: "title", weight: 0.5 },
            { name: "description", weight: 0.15 },
            { name: "organizer", weight: 0.3 },
            { name: "maxParticipants", weight: 0.05 },
            { name: "startTime", weight: 0.1, getFn: (event) => event.startTime?.toISOString?.() ?? "" },
            { name: "endTime", weight: 0.1, getFn: (event) => event.endTime?.toISOString?.() ?? "" },
            { name: "createdAt", weight: 0.05, getFn: (event) => event.createdAt?.toISOString?.() ?? "" },
            ...areaHierarchyKeys
        ]
    });

    return fuse.search(keywords).map((result) => result.item);
};


/** * Main search function that routes to specific search functions based on filters.
 * @param {Object} filters - The search filters containing keywords, building, and type.
 * @param {string} filters.keywords - The search keywords.
 * @param {string} filters.building - The building filter (can be empty, null, or "all" for no filtering).
 * @param {string} filters.type - The type of items to search for ("device", "area", "events", or "all").
 * @returns {Promise<Array>} The search results based on the provided filters.
 */
const search = async (filters) => {
    const { keywords, building: searchedBuilding, type } = filters;
    // Implementation for search logic
    let areasIds = [];
    if (searchedBuilding !== "" && searchedBuilding !== null && searchedBuilding !== "all") {
        const areas = await prisma.area.findMany({
            select: { id: true },
            where: {
                AND: [
                    {
                        type: {
                            equals: "building",
                            mode: "insensitive"
                        }
                    }, {
                        name: {
                            equals: searchedBuilding,
                            mode: "insensitive"
                        }
                    }
                ]
            }
        });
        areasIds = areas.map((area) => area.id);
    }
    const { buildHierarchyFields } = await getAreaHierarchyIndex();
    switch (type) {
        case "device":
            return await searchDevices(keywords, areasIds, buildHierarchyFields);
        case "area":
            return await searchAreas(keywords, areasIds, buildHierarchyFields);
        case "events":
            return await searchEvents(keywords, areasIds, buildHierarchyFields);
        default:
            const list = await Promise.all([
                searchDevices(keywords, areasIds, buildHierarchyFields),
                searchAreas(keywords, areasIds, buildHierarchyFields),
                searchEvents(keywords, areasIds, buildHierarchyFields)
            ]);
            return list.flat();

    }
};

prisma

export default { search };

