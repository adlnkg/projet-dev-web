import areaService from "../services/area.services.js";
import { getUserRole } from "../services/user.services.js";

export const getAreaCreateForm = async (req, res, next) => {
  try {
    const role = getUserRole(req);
    const form = await areaService.getAreaCreateForm(role);

    return res.status(200).json({
      success: true,
      data: form,
    });
  } catch (error) {
    return next(error);
  }
};

export const getArea = async (req, res, next) => {
  try {
    const areaId = Number(req.params.id);

    if (!Number.isInteger(areaId)) {
      return res.status(400).json({ error: "Identifiant de zone invalide." });
    }

    const role = getUserRole(req);
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

    const role = getUserRole(req);
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

export const createArea = async (req, res, next) => {
  try {
    const role = getUserRole(req);
    const ownerId = req.user?.id;

    const area = await areaService.createArea({
      role,
      ownerId,
      payload: req.body,
      imageUrl: req.uploadedImageUrl,
    });

    return res.status(201).json({
      success: true,
      message: "Zone creee.",
      data: area,
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  getAreaCreateForm,
  getArea,
  postArea,
  createArea,
};
