import deviceService from "../services/device.services.js";
import { getUserRole } from "../services/user.services.js";


export const getDeviceCreateForm = async (req, res, next) => {
  try {
    const role = getUserRole(req);
    const form = await deviceService.getDeviceCreateForm(role);

    return res.status(200).json({
      success: true,
      data: form,
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

    return res.status(200).json({
      success: true,
      data: device,
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

    return res.status(200).json({
      success: true,
      message: "Appareil mis à jour.",
      data: device,
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

    return res.status(201).json({
      success: true,
      message: "Appareil cree.",
      data: device,
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
