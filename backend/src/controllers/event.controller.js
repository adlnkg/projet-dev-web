import eventService from "../services/event.services.js";
import { getUserRole } from "../services/user.services.js";

export const getEventCreateForm = async (req, res, next) => {
  try {
    const role = getUserRole(req);
    const form = await eventService.getEventCreateForm(role);

    return res.status(200).json({
      success: true,
      data: form,
    });
  } catch (error) {
    return next(error);
  }
};

export const getEvent = async (req, res, next) => {
  try {
    const eventId = Number(req.params.id);

    if (!Number.isInteger(eventId)) {
      return res.status(400).json({ error: "Identifiant d'evenement invalide." });
    }

    const role = getUserRole(req);
    const event = await eventService.getEventDetails(eventId, role);

    return res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    return next(error);
  }
};

export const postEvent = async (req, res, next) => {
  try {
    const eventId = Number(req.params.id);

    if (!Number.isInteger(eventId)) {
      return res.status(400).json({ error: "Identifiant d'evenement invalide." });
    }

    const role = getUserRole(req);
    const event = await eventService.updateEvent(eventId, role, req.body);

    return res.status(200).json({
      success: true,
      message: "Evenement mis a jour.",
      data: event,
    });
  } catch (error) {
    return next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const role = getUserRole(req);
    const ownerId = req.user?.id;

    const event = await eventService.createEvent({
      role,
      ownerId,
      payload: req.body,
      imageUrl: req.uploadedImageUrl,
    });

    return res.status(201).json({
      success: true,
      message: "Evenement cree.",
      data: event,
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  getEventCreateForm,
  getEvent,
  postEvent,
  createEvent,
};
