import areaService from "../services/area.services.js";

export const getArea = async (req, res, next) => {
  try {
    const areaId = Number(req.params.id);

    if (!Number.isInteger(areaId)) {
      return res.status(400).json({ error: "Identifiant de zone invalide." });
    }

    const role = req.user?.role ?? "USER";
    const area = await areaService.getAreaDetails(areaId, role);

    return res.status(200).json({
      success: true,
      data: area,
    });
  } catch (error) {
    return next(error);
  }
};

export const postArea = async (req, res, next) => {
  try {
    const areaId = Number(req.params.id);

    if (!Number.isInteger(areaId)) {
      return res.status(400).json({ error: "Identifiant de zone invalide." });
    }

    const role = req.user?.role ?? "USER";
    const area = await areaService.updateArea(areaId, role, req.body);

    return res.status(200).json({
      success: true,
      message: "Zone mise a jour.",
      data: area,
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  getArea,
  postArea,
};
