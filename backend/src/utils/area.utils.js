import prisma from "../config/db.js";

//check if areaId is provided and valid in database
const normalizeAreaId = async (value) => {
    if (!value) {
        throw new Error("areaId is required");
    }
    //type is int :
    const parsed = typeof value === "number" ? value : Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new Error("areaId must be a positive integer");
    }
    const id = await prisma.area.findUnique({ where: { id: parsed } });
    if (!id) {
        throw new Error("areaId does not correspond to an existing area");
    }
    return parsed;
};

export { normalizeAreaId };