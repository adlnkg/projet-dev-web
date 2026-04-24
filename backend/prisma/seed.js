import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

// building: { id: 1, parentAreaId: null, name: "Building A", description: "Main building", type: "building" },
// floor:    { id: 2, parentAreaId: 1,    name: "Floor 1",    description: "First floor",   type: "floor" },
// classroom:{ id: 3, parentAreaId: 2,    name: "Room 101",   description: "Classroom 101",  type: "classroom" }
async function main() {
  await prisma.user.deleteMany();
  await prisma.event.deleteMany();
  await prisma.ioTDevice.deleteMany();
  await prisma.area.deleteMany();
  await prisma.area.createMany({
    data: [
      {
        id: 1,
        type: "BUILDING",
        name: "Turing",
        description: "Bâtiment Turing du site du parc",
        parentAreaId: null,
      },
      {
        id: 2,
        type: "FLOOR",
        name: "RDC",
        description: "Rez-de-chaussée du bâtiment Turing",
        parentAreaId: 1,
      },
      {
        id: 3,
        type: "CLASSROOM",
        name: "Salle 101",
        description: "Salle de classe 101 du bâtiment Turing",
        parentAreaId: 2,
      },
      {
        id: 4,
        type: "BUILDING",
        name: "Cauchy",
        description: "Bâtiment Cauchy du site du parc",
        parentAreaId: null,
      },
      {
        id: 5,
        type: "FLOOR",
        name: "1er étage",
        description: "Premier étage du bâtiment Cauchy",
        parentAreaId: 4,
      },
      {
        id: 6,
        type: "CLASSROOM",
        name: "Salle 106",
        description: "Salle de classe 106 du bâtiment Cauchy",
        parentAreaId: 5,
      },
    ],
  });
  await prisma.ioTDevice.createMany({
    data: [
      {
        id: 1,
        name: "Capteur de température peu cher",
        description:
          "Un capteur de température basique pour les projets étudiants",
        type: "SENSOR",
        areaId: 3,
        brand: "Generic",
        model: "TempSensor 1.0",
        status: "ACTIVE",
        uniqueName: "temp-sensor-101",
      },
      {
        id: 2,
        name: "Caméra de surveillance basique",
        description:
          "Une caméra de surveillance simple pour les projets étudiants",
        type: "CAMERA",
        areaId: 3,
        brand: "Generic",
        model: "CamBasic 1.0",
        status: "INACTIVE",
        uniqueName: "cam-basic-101",
        imageUrl: "images/devices/cam-basic-101.png",
      },
      {
        id: 3,
        name: "Thermostat intelligent d'entrée de gamme",
        description:
          "Un thermostat intelligent abordable pour les projets étudiants",
        type: "THERMOSTAT",
        areaId: 3,
        brand: "Generic",
        model: "SmartThermo 1.0",
        status: "ACTIVE",
        uniqueName: "smart-thermo-101",
      },
      {
        id: 4,
        name: "Contrôleur d'accès basique",
        description: "Un contrôleur d'accès simple pour les projets étudiants",
        type: "ACCESS_CONTROL",
        areaId: 3,
        brand: "Generic",
        model: "AccessControl 1.0",
        status: "INACTIVE",
        uniqueName: "access-control-101",
      },
      {
        id: 5,
        name: "Tableau blanc interactif basique",
        description:
          "Un tableau blanc interactif simple pour les projets étudiants",
        type: "WHITEBOARD",
        areaId: 3,
        brand: "Generic",
        model: "WhiteboardBasic 1.0",
        status: "ACTIVE",
        uniqueName: "whiteboard-basic-101",
      },
      {
        id: 6,
        name: "Capteur de mouvement basique",
        description:
          "Un capteur de mouvement simple pour les projets étudiants",
        type: "SENSOR",
        areaId: 3,
        brand: "Generic",
        model: "MotionSensor 1.0",
        status: "INACTIVE",
        uniqueName: "motion-sensor-101",
      },
      {
        id: 7,
        name: "Capteur de luminosité basique",
        description:
          "Un capteur de luminosité simple pour les projets étudiants",
        type: "SENSOR",
        areaId: 3,
        brand: "Generic",
        model: "LightSensor 1.0",
        status: "ACTIVE",
        uniqueName: "light-sensor-101",
      },
    ],
  });

  await prisma.event.createMany({
    data: [
      {
        id: 1,
        title: "Cours de mathématiques",
        description:
          "Cours de mathématiques pour les étudiants de première année",
        areaId: 3,
        startTime: new Date("2024-09-01T08:00:00Z"),
        endTime: new Date("2024-09-01T10:00:00Z"),
        maxParticipants: 30,
        numberOfParticipants: 25,
        organizer: "Prof. Smith",
      },
      {
        id: 2,
        title: "Atelier de robotique",
        description:
          "Atelier de robotique pour les étudiants intéressés par la technologie",
        areaId: 3,
        startTime: new Date("2024-09-02T14:00:00Z"),
        endTime: new Date("2024-09-02T16:00:00Z"),
        maxParticipants: 20,
        numberOfParticipants: 15,
        organizer: "Dr. Johnson",
      },
      {
        id: 3,
        title: "Séminaire sur l'intelligence artificielle",
        description:
          "Séminaire sur les dernières avancées en intelligence artificielle",
        areaId: 3,
        startTime: new Date("2024-09-03T10:00:00Z"),
        endTime: new Date("2024-09-03T12:00:00Z"),
        maxParticipants: 50,
        numberOfParticipants: 40,
        organizer: "Dr. Lee",
      },
      {
        id: 4,
        title: "Cours de physique",
        description: "Cours de physique pour les étudiants de première année",
        areaId: 6,
        startTime: new Date("2024-09-04T08:00:00Z"),
        endTime: new Date("2024-09-04T10:00:00Z"),
        maxParticipants: 30,
        numberOfParticipants: 28,
        organizer: "Prof. Brown",
      },
    ],
  });

  await prisma.user.createMany({
    data: [
      {
        // password:user
        id: "550e8400-e29b-41d4-a716-446655440001",
        createdAt: new Date("2026-04-24T00:00:00.000Z"),
        firstName: "User",
        login: "user",
        memberType: "STUDENT",
        password:
          "$2b$10$EzIoUl3VfoY4sQzEEKYv9OSyvI.DbZMfcI6rl32cUDNix41JoNjAa",
        role: "USER",
        sex: "M",
        email: "user@example.com",
        isVerified: true,
      },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
