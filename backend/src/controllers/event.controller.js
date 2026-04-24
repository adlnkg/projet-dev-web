import eventService from "../services/event.services.js";

export const getEvent = async (req, res, next) => {
  try {
    const eventId = Number(req.params.id);

    if (!Number.isInteger(eventId)) {
      return res.status(400).json({ error: "Identifiant d'evenement invalide." });
    }

    const role = req.user?.role ?? "USER";
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

    const role = req.user?.role ?? "USER";
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

export default {
  getEvent,
  postEvent,
};
