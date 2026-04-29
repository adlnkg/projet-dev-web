import areaService from "../services/area.services.js";
import { getUserRole } from "../services/user.services.js";
import { addPoints} from "../services/points.services.js";

export const getAreaCreateForm = async (req, res, next) => {
  try {
    const role = getUserRole(req);
    const form = await areaService.getAreaCreateForm(role);

    //if connected, add points for accessing the area creation form
    if (req.user) {
      await addPoints(req.user.id, 2, "Consultation du formulaire de création de zone");
    }
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
    const area = await areaService.getAreaDetails(areaId, role, { includeIoTDevices: Boolean(req.user) });

    //if connected, add points for accessing the area details
    if (req.user) {
      await addPoints(req.user.id, 1, "Consultation d'une zone");
    }
    return res.status(200).json({
      success: true,
      data: area,
      pointGained: req.user ? 1 : 0, 
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

    //if connected, add points for updating the area
    if (req.user) {
      await addPoints(req.user.id, 3, "Mise à jour d'une zone");
    }
    return res.status(200).json({
      success: true,
      message: "Zone mise a jour.",
      data: area,
      pointGained: req.user ? 3 : 0,
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

    //if connected, add points for creating the area
    if (req.user) {
      await addPoints(req.user.id, 5, "Création d'une zone");
    }

    return res.status(201).json({
      success: true,
      message: "Zone creee.",
      data: area,
      pointGained: req.user ? 5 : 0,
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
