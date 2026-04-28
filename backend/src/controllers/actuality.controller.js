import { get } from "node:http";
import actualityService from "../services/actuality.services.js";
import { getUserRole } from "../services/user.services.js";
import { addPoints} from "../services/points.services.js";


export const getActualityCreateForm = async (req, res, next) => {
  try {
    const role = getUserRole(req);
    const form = await actualityService.getActualityCreateForm(role);

    //if connected, add points for accessing the actuality creation form
    if (req.user) {
      await addPoints(req.user.id, 2, "Consultation du formulaire de création d'actualité");
    }

    return res.status(200).json({
      success: true,
      data: form,
      pointGained: req.user ? 2 : 0,
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

    //if connected, add points for accessing the actuality details
    if (req.user) {
      await addPoints(req.user.id, 1, "Consultation d'une actualité");
    }

    return res.status(200).json({
      success: true,
      data: actuality,
      pointGained: req.user ? 1 : 0,
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
    
    //if connected, add points for updating the actuality
    if (req.user) {
      await addPoints(req.user.id, 3, "Mise à jour d'une actualité");
    }
    return res.status(200).json({
      success: true,
      message: "Actualite mise a jour.",
      data: actuality,
      pointGained: req.user ? 3 : 0,
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

    //if connected, add points for creating the actuality
    if (req.user) {
      await addPoints(req.user.id, 5, "Création d'une actualité");
    }
    return res.status(201).json({
      success: true,
      message: "Actualite creee.",
      data: actuality,
      pointGained: req.user ? 5 : 0,
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
