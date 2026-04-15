import prisma from "../config/db";




export const searchDevices = async (req, res) => {
    try {
        const { query } = req.query;
        const { filters} = req.filters;

        if (!query) {
            return res.status(400).json({ error: "Query parameter is required." });
        }
        if (!filters) {
            return res.status(400).json({ error: "Filters parameter is required." });
        }
        
        // format query 
        const formattedQuery = query.trim();
        formattedQuery.replace(/\s+/g, " "); // replace multiple spaces with a single space
        formattedQuery.toLowerCase(); // convert to lowercase for case-insensitive search

        const devices = await prisma.device.findMany({
            where: {
                name: {
                    contains: formattedQuery,
                    mode: "insensitive",
                },
            },
        });

        res.json(devices);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error." });
    }
};

export default router;
