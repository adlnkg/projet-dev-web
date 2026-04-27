import Fuse from 'fuse.js';
import prisma from "../config/db.js";

const AREA_HIERARCHY_DECAY = 0.875;


const getBuildingList = async () => {
    const buildings = await prisma.area.findMany({
        select: {
            name: true
        },
        where: {
            type: {
                equals: "BUILDING"
            }
        },
        distinct: ["name"]
    });
    return buildings.map((building) => building.name);
};

/** 
 * Fetches the area hierarchy based on the searched building filter and returns a list of valid areas lineage.
 * If a specific building is searched, only areas that are within that building's hierarchy will be included.
 * Each area in the result includes its lineage of parent areas up to the root, allowing for enriched search capabilities based on area hierarchy.
 * @param {string} searchedBuilding - The building filter used to determine the relevant area hierarchy (can be empty, null, or "all" for no filtering).
 * @returns {Promise<Map<number, lineage: Array<import('@prisma/client').Area> }>>} A list of valid lineage of areas with their based on the searched building filter.
 * The lineage is ordered from child to parent, so the first element is the area itself.
 */
const getAreaHierarchyInBuilding = async (searchedBuilding = "") => {

    // get the areas corresponding to the searched building (not any children for now)
    let validParentAreaIds = [];
    if (searchedBuilding !== "" && searchedBuilding !== null && searchedBuilding !== "all") {
        const areas = await prisma.area.findMany({
            select: {
                id: true,
            },
            where: {
                AND: [
                    {
                        type: {
                            equals: "BUILDING"
                        }
                    }, {
                        name: {
                            contains: searchedBuilding,
                        }
                    }
                ]
            }
        });
        validParentAreaIds = areas.map((area) => area.id);
        console.log(validParentAreaIds);
    }

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

    const getAreaLineageOrNull = (areaId, validParentAreasIds) => {
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
        // lineage is ordered from child to parent
        // keep all elem until last valid parent id is found (or keep all if no valid parent id is specified)
        if (validParentAreasIds.length > 0) {
            const validIndex = lineage.findLastIndex((area) => validParentAreasIds.includes(area.id));
            if (validIndex === -1) {
                // avoid irrelevant search results (no valid parent in lineage)
                return null;
            }
            lineage.splice(0, validIndex);
        }
        return lineage;
    };

    // const validAreasHierarchy = allAreas.map((area) =>
    //     getAreaLineageOrNull(area.id, validParentAreaIds)
    // ).filter((elem) => elem !== null);
    // create a map of area id to lineage (including itself)
    const validAreasHierarchyMap = new Map();
    allAreas.forEach((area) => {
        const lineage = getAreaLineageOrNull(area.id, validParentAreaIds);
        if (lineage) {
            validAreasHierarchyMap.set(area.id, lineage);
        }
    });

    return validAreasHierarchyMap;
};

/** Builds the hierarchy fields for a given area lineage.
 * For each area in the lineage, it creates fields for name, type, and description with a specified prefix and depth.
 * This allows for enriched search capabilities based on the area hierarchy.
 * @param {Array<import('@prisma/client').Area>} lineage - The lineage of areas ordered from child to parent.
 * @param {string} prefix - The prefix to use for the generated fields (e.g., "areaLevel").
 * @returns {Object} An object containing the generated hierarchy fields (e.g., { areaLevel0Name: "Room 101", areaLevel0Type: "CLASSROOM", ... }).
 */
const buildHierarchyFields = (lineage, prefix) => {
    if (!lineage) throw new Error("Lineage is required to build hierarchy fields, received: " + lineage);
    const fields = {};

    lineage.forEach((ancestor, depth) => {
        fields[`${prefix}${depth}Name`] = ancestor.name ?? "";
        fields[`${prefix}${depth}Type`] = ancestor.type ?? "";
        fields[`${prefix}${depth}Description`] = ancestor.description ?? "";
    });

    return fields;
};






/** Builds the search payload for area hierarchy by enriching items with hierarchy fields and generating Fuse.js keys.
 * @param {Array<Object>} items - The list of items to enrich with hierarchy fields.
 * @param {Map<number, Array<import('@prisma/client').Area>>} hierarchy - The hierarchy map containing area lineages.
 * @param {string} areaIdField - The field name in the items that contains the area ID (e.g., "areaId").
 * @param {string} prefix - The prefix used for hierarchy fields (e.g., "areaLevel").
 * @returns { {itemsWithHierarchy: Array<Object>, hierarchyKeys: Array<Object> }} An object containing the enriched items and Fuse.js keys
 * (e.g., { itemsWithHierarchy: [{ areaLevel0Name: "Root", areaLevel0Type: "Building", ... }], hierarchyKeys: [{ name: "areaLevel0Name", weight: 0.2 }, ...] })
 */
const buildAreaHierarchySearchPayload = (items, hierarchy, areaIdField, prefix) => {

    const itemsWithHierarchy = items.map((item) => ({
        ...item,
        ...buildHierarchyFields(hierarchy.get(item[areaIdField]) || [], prefix)
    }));

    return itemsWithHierarchy;
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
const buildAreaHierarchyFuseKeys = (maxDepth, prefix, weights) => {
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

/**
 * Search for devices, areas, and events based on keywords and building filters.
 * @param {string} keywords 
 * @param {Array<number>} validAreasIds 
 * @param {Map<number, Array<import('@prisma/client').Area>>} hierarchy 
 * @returns {Promise<import('@prisma/client').IoTDevice[]>} */
const searchDevices = async (keywords, validAreasIds, hierarchy) => {
    // fetch devices with basic filtering
    const devices = await prisma.ioTDevice.findMany({
        include: {
            sensor: true,
            whiteboard: true,
            light: true,
            thermostat: true
        },
        where: validAreasIds.length > 0 ? {
            areaId: { in: validAreasIds },

        } : {}  // if empty return all devices
    });

    if (!keywords || !keywords.trim())
        return devices;

    const prefix = "areaLevel";
    const devicesWithAreaSearch = buildAreaHierarchySearchPayload(
        devices,
        hierarchy,
        "areaId",
        prefix
    );

    const maxDepth = getMaxHierarchyDepth(devicesWithAreaSearch, prefix);
    const areaHierarchyKeys = buildAreaHierarchyFuseKeys(maxDepth, prefix, { name: 0.2, type: 0.07, description: 0.04 });

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

/**
 * Search for areas based on keywords and building filters.
 * @param {string} keywords 
 * @param {Array<number>} validAreasIds 
 * @param {Map<number, Array<import('@prisma/client').Area>>} hierarchy 
 * @returns {Promise<import('@prisma/client').Area[]>} 
 **/
const searchAreas = async (keywords, validAreasIds, hierarchy) => {
    // fetch areas with basic filtering
    const areas = await prisma.area.findMany({
        where: validAreasIds.length > 0 ? {
            id: { in: validAreasIds },
        } : {},  // if empty return all areas
        select: {
            id: true,
            parentAreaId: true,
            name: true,
            description: true,
            type: true,
            imageUrl: true
        }
    });

    if (!keywords || !keywords.trim())
        return areas;

    const prefix = "areaLevel";
    const areasWithHierarchy = buildAreaHierarchySearchPayload(
        areas,
        hierarchy,
        "id",
        prefix
    );

    const maxDepth = getMaxHierarchyDepth(areasWithHierarchy, prefix);
    const areaHierarchyFuseKeys = buildAreaHierarchyFuseKeys(maxDepth, prefix, { name: 0.5, type: 0.3, description: 0.2 });

    const fuse = new Fuse(areasWithHierarchy, {
        threshold: 0.35,
        ignoreLocation: true,
        keys: areaHierarchyFuseKeys
    });

    return fuse.search(keywords).map((result) => result.item);
};

/**
 * Search for events based on keywords and building filters.
 * @param {string} keywords  the search keywords to match against event fields and associated area hierarchy.
 * @param {Array<number>} validAreasIds the list of area IDs to filter events by their associated areas (if empty, no area filtering is applied).
 * @param {Map<number, Array<import('@prisma/client').Area>>} hierarchy the hierarchy of areas for search.
 * @returns {Promise<import('@prisma/client').Event[]>} the list of events that match the search criteria, enriched with area hierarchy fields for improved search relevance.
 */
const searchEvents = async (keywords, validAreasIds, hierarchy) => {
    const events = await prisma.event.findMany({
        where: validAreasIds.length > 0 ? {
            areaId: { in: validAreasIds },
        } : {}  // if empty return all events
    });

    if (!keywords || !keywords.trim())
        return events;

    const prefix = "areaLevel";
    const searchableEvents = buildAreaHierarchySearchPayload(
        events,
        hierarchy,
        "areaId",
        prefix
    );

    const maxDepth = getMaxHierarchyDepth(searchableEvents, prefix);
    const areaHierarchyKeys = buildAreaHierarchyFuseKeys(maxDepth, prefix, { name: 0.2, type: 0.1, description: 0.05 });

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

/**
 * Search for actualities with dedicated filters.
 * @param {{ keywords: string, type: string, createdFrom: Date | null, createdTo: Date | null }} filters
 * @returns {Promise<import('@prisma/client').Actuality[]>}
 */
const searchActualities = async (filters) => {
    const {
        keywords = "",
        type = "ALL",
        createdFrom = null,
        createdTo = null,
    } = filters;

    const where = {
        ...(type && type !== "ALL" ? { type } : {}),
        ...(createdFrom || createdTo
            ? {
                createdAt: {
                    ...(createdFrom ? { gte: createdFrom } : {}),
                    ...(createdTo ? { lte: createdTo } : {}),
                },
            }
            : {}),
    };

    const isMissingActualityTypeColumnError = (error) => {
        const message = String(error?.message ?? "");
        return error?.code === "P2022" && message.includes("Actuality.type");
    };

    const buildDateWhere = () => ({
        ...(createdFrom || createdTo
            ? {
                createdAt: {
                    ...(createdFrom ? { gte: createdFrom } : {}),
                    ...(createdTo ? { lte: createdTo } : {}),
                },
            }
            : {}),
    });

    let actualities;
    try {
        actualities = await prisma.actuality.findMany({
            where,
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
            orderBy: {
                createdAt: "desc",
            },
        });
    } catch (error) {
        if (!isMissingActualityTypeColumnError(error)) {
            throw error;
        }

        // Fallback for non-migrated databases where Actuality.type is missing.
        if (type && type !== "ALL") {
            const unsupportedFilterError = new Error("Le filtre 'type' des actualites n'est pas disponible car la base n'est pas a jour (colonne 'Actuality.type' manquante).");
            unsupportedFilterError.statusCode = 400;
            throw unsupportedFilterError;
        }

        actualities = await prisma.actuality.findMany({
            where: buildDateWhere(),
            select: {
                id: true,
                title: true,
                content: true,
                imageUrl: true,
                createdAt: true,
                ownerId: true,
                owner: {
                    select: {
                        id: true,
                        login: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    if (!keywords || !keywords.trim()) {
        return actualities;
    }

    const searchableActualities = actualities.map((actuality) => ({
        ...actuality,
        ownerSearch: [
            actuality.owner?.login,
            actuality.owner?.firstName,
            actuality.owner?.lastName,
        ]
            .filter(Boolean)
            .join(" "),
    }));

    const fuse = new Fuse(searchableActualities, {
        threshold: 0.35,
        ignoreLocation: true,
        keys: [
            { name: "title", weight: 0.42 },
            { name: "content", weight: 0.28 },
            { name: "type", weight: 0.15 },
            {
                name: "createdAt",
                weight: 0.05,
                getFn: (actuality) => actuality.createdAt?.toISOString?.() ?? "",
            },
            { name: "ownerSearch", weight: 0.1 },
        ],
    });

    return fuse.search(keywords).map((result) => result.item);
};


/** * Main search function that routes to specific search functions based on filters.
 * @param {Object} filters - The search filters containing keywords, building, and type.
 * @param {string} filters.keywords - The search keywords.
 * @param {string} filters.building - The building filter (can be empty, null, or "all" for no filtering).
 * @param {string} filters.type - The type of items to search for ("device", "area", "event", or "all").
 * @returns {Promise<Array>} The search results based on the provided filters.
 */
const search = async (filters) => {
    const { keywords, building: searchedBuilding, type } = filters;


    const validAreasHierarchy = await getAreaHierarchyInBuilding(searchedBuilding);
    const validAreasIds = Array.from(validAreasHierarchy.keys());

    switch (type) {
        case "device":
            return await searchDevices(keywords, validAreasIds, validAreasHierarchy);
        case "area":
            return await searchAreas(keywords, validAreasIds, validAreasHierarchy);
        case "event":
            return await searchEvents(keywords, validAreasIds, validAreasHierarchy);
        default:
            const list = await Promise.all([
                searchDevices(keywords, validAreasIds, validAreasHierarchy),
                searchAreas(keywords, validAreasIds, validAreasHierarchy),
                searchEvents(keywords, validAreasIds, validAreasHierarchy)
            ]);
            return list.flat();
    }
};

export default { search, searchActualities, getBuildingList };

