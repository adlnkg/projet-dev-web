import { log } from "node:console";
import {
    createDeletionRequest,
    listDeletionRequests,
    reviewDeletionRequest,
} from "../services/deletion-request.services.js";
import { getUserRole } from "../services/user.services.js";

const parseIntegerParam = (rawValue, errorMessage) => {
    const parsedValue = Number(rawValue);

    if (!Number.isInteger(parsedValue)) {
        const error = new Error(errorMessage);
        error.statusCode = 400;
        throw error;
    }

    return parsedValue;
};

export const requestDeletionForEntity = (entityType, entityLabel) => async (req, res, next) => {
    try {
        const entityId = parseIntegerParam(req.params.id, `Identifiant de ${entityLabel.toLowerCase()} invalide.`);
        const role = getUserRole(req);

        if (role !== "SUPER_USER" && role !== "ADMIN") {
            console.log(role + " tried to request deletion for " + entityType + " with id " + entityId);
            return res.status(403).json({ error: "Seuls les utilisateurs super users et admins peuvent demander une suppression." });
        }

        const deletionRequest = await createDeletionRequest({
            entityType,
            entityId,
            requesterId: req.user?.id,
        });

        return res.status(201).json({
            success: true,
            message: "Demande de suppression envoyee.",
            data: deletionRequest,
        });
    } catch (error) {
        return next(error);
    }
};

export const getDeletionRequests = async (req, res, next) => {
    try {
        const role = getUserRole(req);

        if (role !== "ADMIN") {
            return res.status(403).json({ error: "Seuls les admins peuvent consulter les demandes de suppression." });
        }

        const requests = await listDeletionRequests();

        return res.status(200).json({
            success: true,
            count: requests.length,
            data: requests,
        });
    } catch (error) {
        return next(error);
    }
};

export const reviewDeletionRequestController = async (req, res, next) => {
    try {
        const role = getUserRole(req);
        if (role !== "ADMIN") {
            return res.status(403).json({ error: "Seuls les admins peuvent traiter les demandes de suppression." });
        }

        const requestId = req.params.id;
        const decision = String(req.body?.decision ?? "").trim().toUpperCase();

        if (!decision) {
            return res.status(400).json({ error: "La decision est obligatoire." });
        }

        const request = await reviewDeletionRequest({
            requestId,
            decision,
            adminId: req.user?.id,
        });

        return res.status(200).json({
            success: true,
            message: decision === "APPROVE" ? "Demande acceptee." : "Demande refusee.",
            data: request,
        });
    } catch (error) {
        return next(error);
    }
};

export default {
    requestDeletionForEntity,
    getDeletionRequests,
    reviewDeletionRequestController,
};
