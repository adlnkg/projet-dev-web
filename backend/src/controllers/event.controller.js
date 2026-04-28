import eventService from "../services/event.services.js";
import { getUserRole } from "../services/user.services.js";
import { addPoints} from "../services/points.services.js";

export const getEventCreateForm = async (req, res, next) => {
  try {
    const role = getUserRole(req);
    const form = await eventService.getEventCreateForm(role);
    //if connected, add points for accessing the event creation form
    if (req.user) {
      await addPoints(req.user.id, 2, "Consultation du formulaire de création d'événement");
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

export const getEvent = async (req, res, next) => {
  try {
    const eventId = Number(req.params.id);

    if (!Number.isInteger(eventId)) {
      return res.status(400).json({ error: "Identifiant d'evenement invalide." });
    }

    const role = getUserRole(req);
    const userId = req.user?.id;
    const event = await eventService.getEventDetails(eventId, role, userId);

    //if connected, add points for accessing the event details
    if (req.user) {
      await addPoints(req.user.id, 1, "Consultation d'un événement");
    }

    return res.status(200).json({
      success: true,
      data: event,
      pointGained: req.user ? 1 : 0,
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

    //if connected, add points for updating the event
    if (req.user) {
      await addPoints(req.user.id, 3, "Mise à jour d'un événement");
    }

    return res.status(200).json({
      success: true,
      message: "Evenement mis a jour.",
      data: event,
      pointGained: req.user ? 3 : 0,

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

    //if connected, add points for creating the event
    if (req.user) {
      await addPoints(req.user.id, 5, "Création d'un événement");
    }

    return res.status(201).json({
      success: true,
      message: "Evenement cree.",
      data: event,
      pointGained: req.user ? 5 : 0,
    });
  } catch (error) {
    return next(error);
  }
};

export const registerToEvent = async (req, res, next) => {
  try {
    // User must be authenticated to register to an event
    if (!req.user) {
      return res.status(401).json({ error: "Authentification requise pour s'inscrire à un événement." });
    }

    const eventId = Number(req.params.id);

    if (!Number.isInteger(eventId)) {
      return res.status(400).json({ error: "Identifiant d'evenement invalide." });
    }

    const registration = await eventService.registerToEvent(eventId, req.user.id);

    //if connected, add points for registering to the event
    if (req.user) {
      await addPoints(req.user.id, 1, "Inscription à un événement");
    }
    return res.status(201).json({
      success: true,
      message: "Inscription à l'événement réussie.",
      data: registration,
      pointGained: req.user ? 1 : 0,
    });
  } catch (error) {
    return next(error);
  }
};

export const unregisterFromEvent = async (req, res, next) => {
  try {
    // User must be authenticated to unregister from an event
    if (!req.user) {
      return res.status(401).json({ error: "Authentification requise pour se désinscrire d'un événement." });
    }

    const eventId = Number(req.params.id);

    if (!Number.isInteger(eventId)) {
      return res.status(400).json({ error: "Identifiant d'evenement invalide." });
    }

    await eventService.unregisterFromEvent(eventId, req.user.id);

    //if connected, add points for unregistering from the event
    if (req.user) {
      await addPoints(req.user.id, 1, "Désinscription d'un événement");
    }
    return res.status(200).json({
      success: true,
      message: "Désinscription de l'événement réussie.",
      pointGained: req.user ? 1 : 0,
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
  registerToEvent,
  unregisterFromEvent,
};
