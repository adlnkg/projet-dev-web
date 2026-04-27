import searchService from "../services/search.services.js";

export const search = async (req, res, next) => {
  try {
    const results = await searchService.search(req.searchFilters);
    return res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    return next(error);
  }
};

export const searchActualities = async (req, res, next) => {
  try {
    const results = await searchService.searchActualities(req.actualitySearchFilters);
    return res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    return next(error);
  }
};

export default search;
