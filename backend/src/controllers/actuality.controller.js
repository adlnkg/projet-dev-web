import { get } from "node:http";
import actualityService from "../services/actuality.services.js";
import { getUserRole } from "../services/user.services.js";

export const getActualityCreateForm = async (req, res, next) => {
  try {
    const role = getUserRole(req);
    const form = await actualityService.getActualityCreateForm(role);

    return res.status(200).json({
      success: true,
      data: form,
    });
  } catch (error) {
    return next(error);
  }
};

export const getActuality = async (req, res, next) => {
  try {
    const actualityId = Number(req.params.id);

    if (!Number.isInteger(actualityId)) {
      return res.status(400).json({ error: "Identifiant d'actualite invalide." });
    }

    const role = getUserRole(req);
    const actuality = await actualityService.getActualityDetails(actualityId, role);

    return res.status(200).json({
      success: true,
      data: actuality,
    });
  } catch (error) {
    return next(error);
  }
};

export const postActuality = async (req, res, next) => {
  try {
    const actualityId = Number(req.params.id);

    if (!Number.isInteger(actualityId)) {
      return res.status(400).json({ error: "Identifiant d'actualite invalide." });
    }

    const role = getUserRole(req);
    const actuality = await actualityService.updateActuality(actualityId, role, req.body);

    return res.status(200).json({
      success: true,
      message: "Actualite mise a jour.",
      data: actuality,
    });
  } catch (error) {
    return next(error);
  }
};

export const createActuality = async (req, res, next) => {
  try {
    const role = getUserRole(req);
    const ownerId = req.user?.id;

    const actuality = await actualityService.createActuality({
      role,
      ownerId,
      payload: req.body,
      imageUrl: req.uploadedImageUrl,
    });

    return res.status(201).json({
      success: true,
      message: "Actualite creee.",
      data: actuality,
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  getActualityCreateForm,
  getActuality,
  postActuality,
  createActuality,
};
