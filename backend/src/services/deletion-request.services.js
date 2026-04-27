import prisma from "../config/db.js";
import areaService from "./area.services.js";
import eventService from "./event.services.js";
import actualityService from "./actuality.services.js";
import deviceService from "./device.services.js";

const ENTITY_CONFIG = {
  AREA: {
    label: "Zone",
    route: "/areas",
    loadDetails: (entityId) => areaService.getAreaDetails(entityId, "ADMIN"),
    delete: (transaction, entityId) => transaction.area.deleteMany({ where: { id: entityId } }),
  },
  EVENT: {
    label: "Evenement",
    route: "/events",
    loadDetails: (entityId) => eventService.getEventDetails(entityId, "ADMIN"),
    delete: (transaction, entityId) => transaction.event.deleteMany({ where: { id: entityId } }),
  },
  ACTUALITY: {
    label: "Actualite",
    route: "/actualities",
    loadDetails: (entityId) => actualityService.getActualityDetails(entityId, "ADMIN"),
    delete: (transaction, entityId) => transaction.actuality.deleteMany({ where: { id: entityId } }),
  },
  IOT_DEVICE: {
    label: "Appareil",
    route: "/devices",
    loadDetails: (entityId) => deviceService.getDeviceDetails(entityId, "ADMIN"),
    delete: (transaction, entityId) => transaction.ioTDevice.deleteMany({ where: { id: entityId } }),
  },
};

const buildEntityLabel = (entityType, details) => {
  if (entityType === "AREA") {
    return details.name ?? `Zone #${details.id}`;
  }

  if (entityType === "EVENT") {
    return details.title ?? `Evenement #${details.id}`;
  }

  if (entityType === "ACTUALITY") {
    return details.title ?? `Actualite #${details.id}`;
  }

  if (entityType === "IOT_DEVICE") {
    return details.name ?? details.uniqueName ?? `Appareil #${details.id}`;
  }

  return `#${details.id}`;
};

const buildEntitySnapshot = (entityType, details) => {
  if (entityType === "AREA") {
    return {
      id: details.id,
      label: buildEntityLabel(entityType, details),
      name: details.name,
      description: details.description,
      type: details.type,
      imageUrl: details.imageUrl,
      ownerName: details.ownerName,
      parentArea: details.parentArea,
      specific: details.specific,
      route: `${ENTITY_CONFIG[entityType].route}/${details.id}`,
    };
  }

  if (entityType === "EVENT") {
    return {
      id: details.id,
      label: buildEntityLabel(entityType, details),
      title: details.title,
      description: details.description,
      type: details.type,
      imageUrl: details.imageUrl,
      ownerName: details.ownerName,
      areaId: details.areaId,
      startTime: details.startTime,
      endTime: details.endTime,
      specific: details.specific,
      route: `${ENTITY_CONFIG[entityType].route}/${details.id}`,
    };
  }

  if (entityType === "ACTUALITY") {
    return {
      id: details.id,
      label: buildEntityLabel(entityType, details),
      title: details.title,
      description: details.content,
      imageUrl: details.imageUrl,
      ownerName: details.ownerName,
      createdAt: details.createdAt,
      specific: details.specific,
      route: `${ENTITY_CONFIG[entityType].route}/${details.id}`,
    };
  }

  if (entityType === "IOT_DEVICE") {
    return {
      id: details.id,
      label: buildEntityLabel(entityType, details),
      uniqueName: details.uniqueName,
      name: details.name,
      description: details.description,
      brand: details.brand,
      model: details.model,
      status: details.status,
      type: details.type,
      imageUrl: details.imageUrl,
      ownerName: details.ownerName,
      areaId: details.areaId,
      specific: details.specific,
      route: `${ENTITY_CONFIG[entityType].route}/${details.id}`,
    };
  }

  return {
    id: details.id,
    label: buildEntityLabel(entityType, details),
    route: `${ENTITY_CONFIG[entityType].route}/${details.id}`,
  };
};

const buildDeletionRequestResponse = (request) => ({
  id: request.id,
  entityType: request.entityType,
  entityTypeLabel: ENTITY_CONFIG[request.entityType].label,
  entityId: request.entityId,
  entityLabel: request.entityLabel,
  entitySnapshot: request.entitySnapshot,
  entityPath: `${ENTITY_CONFIG[request.entityType].route}/${request.entityId}`,
  status: request.status,
  requestedAt: request.requestedAt,
  reviewedAt: request.reviewedAt,
  requestedBy: request.requestedBy
    ? {
        id: request.requestedBy.id,
        login: request.requestedBy.login,
        firstName: request.requestedBy.firstName,
        lastName: request.requestedBy.lastName,
      }
    : null,
  reviewedBy: request.reviewedBy
    ? {
        id: request.reviewedBy.id,
        login: request.reviewedBy.login,
        firstName: request.reviewedBy.firstName,
        lastName: request.reviewedBy.lastName,
      }
    : null,
});

const loadEntityDetails = async (entityType, entityId) => {
  const config = ENTITY_CONFIG[entityType];

  if (!config) {
    const error = new Error("Type d'entite invalide.");
    error.statusCode = 400;
    throw error;
  }

  return config.loadDetails(entityId);
};

const createDeletionRequest = async ({ entityType, entityId, requesterId }) => {
  const config = ENTITY_CONFIG[entityType];

  if (!config) {
    const error = new Error("Type d'entite invalide.");
    error.statusCode = 400;
    throw error;
  }

  const pendingRequest = await prisma.deletionRequest.findFirst({
    where: {
      entityType,
      entityId,
      status: "PENDING",
    },
    select: { id: true },
  });

  if (pendingRequest) {
    const error = new Error("Une demande de suppression est deja en attente pour cette entite.");
    error.statusCode = 409;
    throw error;
  }

  const details = await loadEntityDetails(entityType, entityId);
  const entitySnapshot = JSON.parse(JSON.stringify(buildEntitySnapshot(entityType, details)));
  const entityLabel = entitySnapshot.label;

  const createdRequest = await prisma.deletionRequest.create({
    data: {
      entityType,
      entityId,
      entityLabel,
      entitySnapshot,
      requestedById: requesterId,
    },
    include: {
      requestedBy: {
        select: {
          id: true,
          login: true,
          firstName: true,
          lastName: true,
        },
      },
      reviewedBy: {
        select: {
          id: true,
          login: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return buildDeletionRequestResponse(createdRequest);
};

const listDeletionRequests = async () => {
  const requests = await prisma.deletionRequest.findMany({
    orderBy: [
      { requestedAt: "desc" },
      { reviewedAt: "desc" },
    ],
    include: {
      requestedBy: {
        select: {
          id: true,
          login: true,
          firstName: true,
          lastName: true,
        },
      },
      reviewedBy: {
        select: {
          id: true,
          login: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return requests.map(buildDeletionRequestResponse);
};

const reviewDeletionRequest = async ({ requestId, decision, adminId }) => {
  const request = await prisma.deletionRequest.findUnique({
    where: { id: requestId },
    include: {
      requestedBy: {
        select: {
          id: true,
          login: true,
          firstName: true,
          lastName: true,
        },
      },
      reviewedBy: {
        select: {
          id: true,
          login: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!request) {
    const error = new Error("Demande de suppression introuvable.");
    error.statusCode = 404;
    throw error;
  }

  if (request.status !== "PENDING") {
    const error = new Error("Cette demande de suppression a deja ete traitee.");
    error.statusCode = 400;
    throw error;
  }

  if (decision !== "APPROVE" && decision !== "REJECT") {
    const error = new Error("Decision de moderation invalide.");
    error.statusCode = 400;
    throw error;
  }

  if (decision === "APPROVE") {
    await prisma.$transaction(async (transaction) => {
      const config = ENTITY_CONFIG[request.entityType];
      await config.delete(transaction, request.entityId);
      await transaction.deletionRequest.update({
        where: { id: requestId },
        data: {
          status: "APPROVED",
          reviewedAt: new Date(),
          reviewedById: adminId,
        },
      });
    });
  } else {
    await prisma.deletionRequest.update({
      where: { id: requestId },
      data: {
        status: "REJECTED",
        reviewedAt: new Date(),
        reviewedById: adminId,
      },
    });
  }

  return prisma.deletionRequest.findUnique({
    where: { id: requestId },
    include: {
      requestedBy: {
        select: {
          id: true,
          login: true,
          firstName: true,
          lastName: true,
        },
      },
      reviewedBy: {
        select: {
          id: true,
          login: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  }).then(buildDeletionRequestResponse);
};

export {
  ENTITY_CONFIG,
  createDeletionRequest,
  listDeletionRequests,
  reviewDeletionRequest,
};
