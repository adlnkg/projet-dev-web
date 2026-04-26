import prisma from "../config/db.js";

const DEFAULT_LIMIT = 10;

const getHomepageFeed = async (actualityLimit = DEFAULT_LIMIT, eventLimit = DEFAULT_LIMIT) => {

    const actualities = await prisma.actuality.findMany({
        take: actualityLimit,
        orderBy: {
            createdAt: "desc",
        },
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
    const now = new Date();

    const events = await prisma.event.findMany({
        where: {
            startTime: {
                gte: now,
            },
        },
        orderBy: [
            { startTime: "asc" }, 
            { createdAt: "desc" }, 
        ],
        take: eventLimit,
        include: {
            area: {
                select: {
                    id: true,
                    name: true,
                    type: true,
                },
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

    return {
        actualities: actualities.map((actuality) => ({
            ...actuality,
            owner: actuality.owner ? {
                id: actuality.owner.id,
                login: actuality.owner.login,
                firstName: actuality.owner.firstName,
                lastName: actuality.owner.lastName,
            } : null,
        })),
        events: events.map((event) => ({
            ...event,
            owner: event.owner ? {
                id: event.owner.id,
                login: event.owner.login,
                firstName: event.owner.firstName,
                lastName: event.owner.lastName,
            } : null,
        })),
    };
};


export default {
    getHomepageFeed,
};
