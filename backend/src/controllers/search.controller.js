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

export const searchEvents = async (req, res, next) => {
  try {
    const results = await searchService.searchEventsByFilters(req.eventSearchFilters);
    //if connected, add points for the search
    if (req.user) {
      await addPoints(req.user.id, 1, "Recherche d'événements effectuée");
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

export const searchAreas = async (req, res, next) => {
  try {
    const results = await searchService.searchAreasByFilters(req.areaSearchFilters);
    //if connected, add points for the search
    if (req.user) {
      await addPoints(req.user.id, 1, "Recherche de zones effectuée");
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

export const searchIoTDevices = async (req, res, next) => {
  try {
    const results = await searchService.searchIoTDevicesByFilters(req.iotDeviceSearchFilters);
    //if connected, add points for the search
    if (req.user) {
      await addPoints(req.user.id, 1, "Recherche de périphériques IoT effectuée");
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

export const getSearchFilters = async (req, res, next) => {
  try {
    const isAuthenticated = !!req.user;
    const filtersInfo = searchService.getSearchFiltersInfo(isAuthenticated);
    return res.status(200).json(filtersInfo);
  } catch (error) {
    return next(error);
  }
};

export default search;
