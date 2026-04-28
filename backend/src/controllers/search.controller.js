import searchService from "../services/search.services.js";
import { addPoints} from "../services/points.services.js";

export const search = async (req, res, next) => {
  try {
    const results = await searchService.search(req.searchFilters);
    const buildingList = await searchService.getBuildingList(req.searchFilters);
    //if connected, add points for the search
    if (req.user) {
      await addPoints(req.user.id, 1, "Recherche effectuée");
    }
    return res.status(200).json({
      success: true,
      count: results.length,
      data: results,
      buildingList: buildingList,
      pointGained: req.user ? 1 : 0,
    });
  } catch (error) {
    return next(error);
  }
};

export const searchActualities = async (req, res, next) => {
  try {
    const results = await searchService.searchActualities(req.actualitySearchFilters);
    //if connected, add points for the search
    if (req.user) {
      await addPoints(req.user.id, 1, "Recherche d'actualités effectuée");
    }
    return res.status(200).json({
      success: true,
      count: results.length,
      data: results,
      pointGained: req.user ? 1 : 0,
    });
  } catch (error) {
    return next(error);
  }
};

export default search;
