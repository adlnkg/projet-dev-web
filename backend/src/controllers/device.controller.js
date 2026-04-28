import deviceService from "../services/device.services.js";
import { getUserRole } from "../services/user.services.js";
import { addPoints} from "../services/points.services.js";


export const getDeviceCreateForm = async (req, res, next) => {
  try {
    const role = getUserRole(req);
    const form = await deviceService.getDeviceCreateForm(role);

    //if connected, add points for accessing the device creation form
    if (req.user) {
      await addPoints(req.user.id, 2, "Consultation du formulaire de création d'appareil");
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

export const getDevice = async (req, res, next) => {
  try {
    const deviceId = Number(req.params.id);

    if (!Number.isInteger(deviceId)) {
      return res.status(400).json({ error: "Identifiant d'appareil invalide." });
    }

    const role = getUserRole(req);
    const device = await deviceService.getDeviceDetails(deviceId, role);

    //if connected, add points for accessing the device details
    if (req.user) {
      await addPoints(req.user.id, 1, "Consultation d'un appareil");
    }
    return res.status(200).json({
      success: true,
      data: device,
      pointGained: req.user ? 1 : 0,
    });
  } catch (error) {
    return next(error);
  }
};

export const postDevice = async (req, res, next) => {
  try {
    const deviceId = Number(req.params.id);

    if (!Number.isInteger(deviceId)) {
      return res.status(400).json({ error: "Identifiant d'appareil invalide." });
    }

    const role = getUserRole(req);
    const device = await deviceService.updateDevice(deviceId, role, req.body);

    //if connected, add points for updating the device
    if (req.user) {
      await addPoints(req.user.id, 3, "Mise à jour d'un appareil");
    }
    return res.status(200).json({
      success: true,
      message: "Appareil mis à jour.",
      data: device,
      pointGained: req.user ? 3 : 0,
    });
  } catch (error) {
    return next(error);
  }
};

export const createDevice = async (req, res, next) => {
  try {
    const role = getUserRole(req);
    const ownerId = req.user?.id;

    const device = await deviceService.createDevice({
      role,
      ownerId,
      payload: req.body,
      imageUrl: req.uploadedImageUrl,
    });

    //if connected, add points for creating the device
    if (req.user) {
      await addPoints(req.user.id, 5, "Création d'un appareil");
    }

    return res.status(201).json({
      success: true,
      message: "Appareil cree.",
      data: device,
      pointGained: req.user ? 5 : 0,
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  getDeviceCreateForm,
  getDevice,
  postDevice,
  createDevice,
};
