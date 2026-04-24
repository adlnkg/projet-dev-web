import deviceService from "../services/device.services.js";

export const getDevice = async (req, res, next) => {
  try {
    const deviceId = Number(req.params.id);

    if (!Number.isInteger(deviceId)) {
      return res.status(400).json({ error: "Identifiant d'appareil invalide." });
    }

    const role = req.user?.role ?? "USER";
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

    const role = req.user?.role ?? "USER";
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

export default {
  getDevice,
  postDevice,
};
