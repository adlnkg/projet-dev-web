import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seeding...");
  let createdCount = 0;
  let skippedCount = 0;
  // AREAS - Buildings
  const areaData = [
    // Building Turing
    { id: 1, type: "BUILDING", name: "Turing", description: "Bâtiment Turing du site du parc", parentAreaId: null },
    { id: 2, type: "FLOOR", name: "RDC", description: "Rez-de-chaussée du bâtiment Turing", parentAreaId: 1 },
    { id: 3, type: "CLASSROOM", name: "Salle 101", description: "Salle de classe 101 du bâtiment Turing", parentAreaId: 2 },
    { id: 4, type: "CLASSROOM", name: "Salle 102", description: "Salle de classe 102 du bâtiment Turing", parentAreaId: 2 },
    { id: 5, type: "CLASSROOM", name: "Salle 103", description: "Salle de classe 103 du bâtiment Turing", parentAreaId: 2 },
    { id: 6, type: "FLOOR", name: "1er étage", description: "Premier étage du bâtiment Turing", parentAreaId: 1 },
    { id: 7, type: "CLASSROOM", name: "Salle 201", description: "Salle de classe 201 du bâtiment Turing", parentAreaId: 6 },
    { id: 8, type: "CLASSROOM", name: "Salle 202", description: "Salle de classe 202 du bâtiment Turing", parentAreaId: 6 },
    { id: 9, type: "FLOOR", name: "2e étage", description: "Deuxième étage du bâtiment Turing", parentAreaId: 1 },
    { id: 10, type: "CLASSROOM", name: "Salle 301", description: "Salle de classe 301 du bâtiment Turing", parentAreaId: 9 },
    { id: 11, type: "TECHNICAL_ROOM", name: "Salle technique RDC", description: "Salle technique du RDC", parentAreaId: 2 },

    // Building Cauchy
    { id: 12, type: "BUILDING", name: "Cauchy", description: "Bâtiment Cauchy du site du parc", parentAreaId: null },
    { id: 13, type: "FLOOR", name: "RDC", description: "Rez-de-chaussée du bâtiment Cauchy", parentAreaId: 12 },
    { id: 14, type: "CLASSROOM", name: "Salle 101", description: "Salle de classe 101 du bâtiment Cauchy", parentAreaId: 13 },
    { id: 15, type: "CLASSROOM", name: "Salle 102", description: "Salle de classe 102 du bâtiment Cauchy", parentAreaId: 13 },
    { id: 16, type: "FLOOR", name: "1er étage", description: "Premier étage du bâtiment Cauchy", parentAreaId: 12 },
    { id: 17, type: "CLASSROOM", name: "Salle 201", description: "Salle de classe 201 du bâtiment Cauchy", parentAreaId: 16 },
    { id: 18, type: "CLASSROOM", name: "Salle 202", description: "Salle de classe 202 du bâtiment Cauchy", parentAreaId: 16 },
    { id: 19, type: "FLOOR", name: "2e étage", description: "Deuxième étage du bâtiment Cauchy", parentAreaId: 12 },
    { id: 20, type: "CLASSROOM", name: "Salle 301", description: "Salle de classe 301 du bâtiment Cauchy", parentAreaId: 19 },
    { id: 21, type: "TECHNICAL_ROOM", name: "Salle technique 1er", description: "Salle technique du 1er étage", parentAreaId: 16 },

    // Building Newton
    { id: 22, type: "BUILDING", name: "Newton", description: "Bâtiment Newton du site du parc", parentAreaId: null },
    { id: 23, type: "FLOOR", name: "RDC", description: "Rez-de-chaussée du bâtiment Newton", parentAreaId: 22 },
    { id: 24, type: "CLASSROOM", name: "Amphi A", description: "Grand amphithéâtre A", parentAreaId: 23 },
    { id: 25, type: "CLASSROOM", name: "Amphi B", description: "Grand amphithéâtre B", parentAreaId: 23 },
    { id: 26, type: "FLOOR", name: "1er étage", description: "Premier étage du bâtiment Newton", parentAreaId: 22 },
    { id: 27, type: "CLASSROOM", name: "Salle 101", description: "Salle de classe 101 du bâtiment Newton", parentAreaId: 26 },
    { id: 28, type: "TECHNICAL_ROOM", name: "Salle technique RDC", description: "Salle technique du RDC", parentAreaId: 23 },
  ];

  for (const area of areaData) {
    await prisma.area.upsert({
      where: { id: area.id },
      update: { name: area.name, description: area.description, type: area.type, parentAreaId: area.parentAreaId },
      create: area,
    });
  }
  // BUILDINGS
  const buildings = [
    { id: 1, areaId: 1, address: "123 Rue de Turing, Cergy-Pontoise 95000" },
    { id: 2, areaId: 12, address: "456 Avenue Cauchy, Cergy-Pontoise 95000" },
    { id: 3, areaId: 22, address: "789 Chemin Newton, Cergy-Pontoise 95000" },
  ];

  for (const building of buildings) {
    await prisma.building.upsert({
      where: { id: building.id },
      update: { areaId: building.areaId, address: building.address },
      create: building,
    });
  }

  // FLOORS
  const floors = [
    { id: 1, areaId: 2, floorNumber: 0 },
    { id: 2, areaId: 6, floorNumber: 1 },
    { id: 3, areaId: 9, floorNumber: 2 },
    { id: 4, areaId: 13, floorNumber: 0 },
    { id: 5, areaId: 16, floorNumber: 1 },
    { id: 6, areaId: 19, floorNumber: 2 },
    { id: 7, areaId: 23, floorNumber: 0 },
    { id: 8, areaId: 26, floorNumber: 1 },
  ];

  for (const floor of floors) {
    await prisma.floor.upsert({
      where: { id: floor.id },
      update: { areaId: floor.areaId, floorNumber: floor.floorNumber },
      create: floor,
    });
  }

  // CLASSROOMS
  const classrooms = [
    { id: 1, areaId: 3, classroomNumber: 101 },
    { id: 2, areaId: 4, classroomNumber: 102 },
    { id: 3, areaId: 5, classroomNumber: 103 },
    { id: 4, areaId: 7, classroomNumber: 201 },
    { id: 5, areaId: 8, classroomNumber: 202 },
    { id: 6, areaId: 10, classroomNumber: 301 },
    { id: 7, areaId: 14, classroomNumber: 101 },
    { id: 8, areaId: 15, classroomNumber: 102 },
    { id: 9, areaId: 17, classroomNumber: 201 },
    { id: 10, areaId: 18, classroomNumber: 202 },
    { id: 11, areaId: 20, classroomNumber: 301 },
    { id: 12, areaId: 24, classroomNumber: 101 },
    { id: 13, areaId: 25, classroomNumber: 102 },
    { id: 14, areaId: 27, classroomNumber: 101 },
  ];

  for (const classroom of classrooms) {
    await prisma.classroom.upsert({
      where: { id: classroom.id },
      update: { areaId: classroom.areaId, classroomNumber: classroom.classroomNumber },
      create: classroom,
    });
  }

  // TECHNICAL ROOMS
  const technicalRooms = [
    { id: 1, areaId: 11, roomNumber: 1 },
    { id: 2, areaId: 21, roomNumber: 1 },
    { id: 3, areaId: 28, roomNumber: 1 },
  ];

  for (const room of technicalRooms) {
    await prisma.technicalRoom.upsert({
      where: { id: room.id },
      update: { areaId: room.areaId, roomNumber: room.roomNumber },
      create: room,
    });
  }
  // IOT DEVICES
  const iotDevices = [
    // Temperature sensors
    { id: 1, uniqueName: "temp-sensor-101", name: "Capteur température Salle 101", description: "Capteur de température", type: "SENSOR", areaId: 3, brand: "TemperatureCorp", model: "TempSensor 2.0", status: "ACTIVE", active: true },
    { id: 2, uniqueName: "temp-sensor-102", name: "Capteur température Salle 102", description: "Capteur de température", type: "SENSOR", areaId: 4, brand: "TemperatureCorp", model: "TempSensor 2.0", status: "ACTIVE", active: true },
    { id: 3, uniqueName: "temp-sensor-201", name: "Capteur température Salle 201", description: "Capteur de température", type: "SENSOR", areaId: 7, brand: "TemperatureCorp", model: "TempSensor 2.0", status: "ACTIVE", active: true },
    { id: 4, uniqueName: "temp-sensor-cauchy-101", name: "Capteur température Cauchy 101", description: "Capteur de température", type: "SENSOR", areaId: 14, brand: "TemperatureCorp", model: "TempSensor 2.0", status: "ACTIVE", active: true },
    
    // Lights
    { id: 5, uniqueName: "light-101", name: "Lumière Salle 101", description: "Éclairage LED", type: "LIGHT", areaId: 3, brand: "LightBrand", model: "LED Pro 100", status: "ACTIVE", active: true },
    { id: 6, uniqueName: "light-102", name: "Lumière Salle 102", description: "Éclairage LED", type: "LIGHT", areaId: 4, brand: "LightBrand", model: "LED Pro 100", status: "ACTIVE", active: true },
    { id: 7, uniqueName: "light-201", name: "Lumière Salle 201", description: "Éclairage LED", type: "LIGHT", areaId: 7, brand: "LightBrand", model: "LED Pro 100", status: "ACTIVE", active: true },
    { id: 8, uniqueName: "light-amphi-a", name: "Lumière Amphi A", description: "Éclairage principal", type: "LIGHT", areaId: 24, brand: "LightBrand", model: "LED Pro 200", status: "ACTIVE", active: true },
    
    // Thermostats
    { id: 9, uniqueName: "thermo-101", name: "Thermostat Salle 101", description: "Contrôle température", type: "THERMOSTAT", areaId: 3, brand: "ClimateControl", model: "SmartThermo Pro", status: "ACTIVE", active: true },
    { id: 10, uniqueName: "thermo-102", name: "Thermostat Salle 102", description: "Contrôle température", type: "THERMOSTAT", areaId: 4, brand: "ClimateControl", model: "SmartThermo Pro", status: "ACTIVE", active: true },
    { id: 11, uniqueName: "thermo-cauchy-101", name: "Thermostat Cauchy 101", description: "Contrôle température", type: "THERMOSTAT", areaId: 14, brand: "ClimateControl", model: "SmartThermo Pro", status: "ACTIVE", active: true },
    
    // Cameras
    { id: 12, uniqueName: "cam-101", name: "Caméra Salle 101", description: "Caméra surveillance", type: "CAMERA", areaId: 3, brand: "SecurityCam", model: "HD 1080p", status: "ACTIVE", active: true },
    { id: 13, uniqueName: "cam-amphi-a", name: "Caméra Amphi A", description: "Caméra surveillance", type: "CAMERA", areaId: 24, brand: "SecurityCam", model: "4K Pro", status: "ACTIVE", active: true },
    
    // Interactive Whiteboards
    { id: 14, uniqueName: "whiteboard-101", name: "Tableau blanc Salle 101", description: "Tableau interactif", type: "WHITEBOARD", areaId: 3, brand: "SmartBoard", model: "Interactive 65", status: "ACTIVE", active: true },
    { id: 15, uniqueName: "whiteboard-amphi-a", name: "Tableau blanc Amphi A", description: "Tableau interactif", type: "WHITEBOARD", areaId: 24, brand: "SmartBoard", model: "Interactive 85", status: "ACTIVE", active: true },
    
    // Access Control
    { id: 16, uniqueName: "access-tech-room-1", name: "Contrôle accès Salle technique", description: "Badge accès", type: "ACCESS_CONTROL", areaId: 11, brand: "AccessSys", model: "CardReader Pro", status: "ACTIVE", active: true },
    
    // Motion sensors
    { id: 17, uniqueName: "motion-101", name: "Détecteur mouvement Salle 101", description: "Capteur PIR", type: "SENSOR", areaId: 3, brand: "MotionTech", model: "PIR Sensor", status: "ACTIVE", active: true },
    { id: 18, uniqueName: "motion-amphi-a", name: "Détecteur mouvement Amphi A", description: "Capteur PIR", type: "SENSOR", areaId: 24, brand: "MotionTech", model: "PIR Sensor", status: "ACTIVE", active: true },
    
    // Light intensity sensors
    { id: 19, uniqueName: "lux-sensor-101", name: "Capteur luminosité Salle 101", description: "Capteur lux", type: "SENSOR", areaId: 3, brand: "LuxMeter", model: "Lux Sensor", status: "ACTIVE", active: true },
    { id: 20, uniqueName: "lux-sensor-amphi-a", name: "Capteur luminosité Amphi A", description: "Capteur lux", type: "SENSOR", areaId: 24, brand: "LuxMeter", model: "Lux Sensor", status: "ACTIVE", active: true },
  ];

  for (const device of iotDevices) {
    await prisma.ioTDevice.upsert({
      where: { id: device.id },
      update: { 
        name: device.name,
        description: device.description,
        areaId: device.areaId,
        status: device.status,
        active: device.active,
      },
      create: device,
    });
  }

  // SENSORS
  const sensorConnectData = [
    { deviceId: 1, timestamp: new Date(), value: 22.5, samplingIntervalSeconds: 60, batteryLevel: 95 },
    { deviceId: 2, timestamp: new Date(), value: 21.8, samplingIntervalSeconds: 60, batteryLevel: 92 },
    { deviceId: 3, timestamp: new Date(), value: 23.2, samplingIntervalSeconds: 60, batteryLevel: 88 },
    { deviceId: 4, timestamp: new Date(), value: 20.5, samplingIntervalSeconds: 60, batteryLevel: 97 },
    { deviceId: 17, timestamp: new Date(), value: 0, samplingIntervalSeconds: 30, batteryLevel: 99 },
    { deviceId: 18, timestamp: new Date(), value: 1, samplingIntervalSeconds: 30, batteryLevel: 96 },
    { deviceId: 19, timestamp: new Date(), value: 450, samplingIntervalSeconds: 120, batteryLevel: 94 },
    { deviceId: 20, timestamp: new Date(), value: 500, samplingIntervalSeconds: 120, batteryLevel: 91 },
  ];

  for (const sensor of sensorConnectData) {
    try {
      await prisma.sensor.upsert({
        where: { deviceId: sensor.deviceId },
        update: sensor,
        create: sensor,
      });
    } catch (e) {
      // Ignore if already exists
    }
  }

  // THERMOSTATS
  const thermostatConnectData = [
    { deviceId: 9, temperature: 22.5, targetTemp: 22.0, mode: "HEAT" },
    { deviceId: 10, temperature: 21.8, targetTemp: 22.0, mode: "HEAT" },
    { deviceId: 11, temperature: 20.5, targetTemp: 21.0, mode: "HEAT" },
  ];

  for (const thermostat of thermostatConnectData) {
    try {
      await prisma.thermostat.upsert({
        where: { deviceId: thermostat.deviceId },
        update: thermostat,
        create: thermostat,
      });
    } catch (e) {
      // Ignore if already exists
    }
  }

  // Lights
  const lightConnectData = [
    { deviceId: 5, brightness: 80, color: "white", colorTemperature: 4000 },
    { deviceId: 6, brightness: 85, color: "white", colorTemperature: 4000 },
    { deviceId: 7, brightness: 75, color: "white", colorTemperature: 4000 },
    { deviceId: 8, brightness: 90, color: "white", colorTemperature: 4500 },
  ];

  for (const light of lightConnectData) {
    try {
      await prisma.light.upsert({
        where: { deviceId: light.deviceId },
        update: light,
        create: light,
      });
    } catch (e) {
      // Ignore if already exists
    }
  }

  // Cameras
  const cameraConnectData = [
    { deviceId: 12, resolution: "1080p", frameRate: 30 },
    { deviceId: 13, resolution: "4K", frameRate: 60 },
  ];

  for (const camera of cameraConnectData) {
    try {
      await prisma.camera.upsert({
        where: { deviceId: camera.deviceId },
        update: camera,
        create: camera,
      });
    } catch (e) {
      // Ignore if already exists
    }
  }

  // Interactive Whiteboards
  const whiteboaConnectData = [
    { deviceId: 14, resolution: "1920x1080", screenSize: 65 },
    { deviceId: 15, resolution: "3840x2160", screenSize: 85 },
  ];

  for (const whiteboard of whiteboaConnectData) {
    try {
      await prisma.interactiveWhiteboard.upsert({
        where: { deviceId: whiteboard.deviceId },
        update: whiteboard,
        create: whiteboard,
      });
    } catch (e) {
      // Ignore if already exists
    }
  }

  // Access Control
  const accessControlConnectData = [
    { deviceId: 16, status: "LOCKED" },
  ];

  for (const access of accessControlConnectData) {
    try {
      await prisma.accessControl.upsert({
        where: { deviceId: access.deviceId },
        update: access,
        create: access,
      });
    } catch (e) {
      // Ignore if already exists
    }
  }

  // USERS
  const users = [
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      login: "user",
      email: "user@example.com",
      password: "$2b$10$EzIoUl3VfoY4sQzEEKYv9OSyvI.DbZMfcI6rl32cUDNix41JoNjAa",
      isVerified: true,
      firstName: "User",
      lastName: "Test",
      role: "USER",
      memberType: "STUDENT",
      sex: "M",
      age: 20,
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440002",
      login: "admin",
      email: "admin@example.com",
      password: "$2b$10$EzIoUl3VfoY4sQzEEKYv9OSyvI.DbZMfcI6rl32cUDNix41JoNjAa",
      isVerified: true,
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
      memberType: "STUDENT",
      sex: "F",
      age: 35,
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440003",
      login: "prof.smith",
      email: "prof.smith@example.com",
      password: "$2b$10$EzIoUl3VfoY4sQzEEKYv9OSyvI.DbZMfcI6rl32cUDNix41JoNjAa",
      isVerified: true,
      firstName: "John",
      lastName: "Smith",
      role: "SUPER_USER",
      memberType: "STUDENT",
      sex: "M",
      age: 45,
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440004",
      login: "student1",
      email: "student1@example.com",
      password: "$2b$10$EzIoUl3VfoY4sQzEEKYv9OSyvI.DbZMfcI6rl32cUDNix41JoNjAa",
      isVerified: true,
      firstName: "Alice",
      lastName: "Dupont",
      role: "USER",
      memberType: "STUDENT",
      sex: "F",
      age: 21,
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440005",
      login: "student2",
      email: "student2@example.com",
      password: "$2b$10$EzIoUl3VfoY4sQzEEKYv9OSyvI.DbZMfcI6rl32cUDNix41JoNjAa",
      isVerified: true,
      firstName: "Bob",
      lastName: "Martin",
      role: "USER",
      memberType: "STUDENT",
      sex: "M",
      age: 22,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: { 
        login: user.login,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      create: user,
    });
  }

  // EVENTS
  const events = [
    {
      id: 1,
      title: "Cours de mathématiques",
      description: "Cours de mathématiques pour les étudiants de première année",
      areaId: 3,
      startTime: new Date("2026-05-01T08:00:00Z"),
      endTime: new Date("2026-05-01T10:00:00Z"),
      maxParticipants: 30,
      numberOfParticipants: 25,
      organizer: "Prof. Smith",
      type: "COURSE",
      price: 0,
    },
    {
      id: 2,
      title: "Atelier de robotique",
      description: "Atelier de robotique pour les étudiants intéressés par la technologie",
      areaId: 3,
      startTime: new Date("2026-05-02T14:00:00Z"),
      endTime: new Date("2026-05-02T16:00:00Z"),
      maxParticipants: 20,
      numberOfParticipants: 15,
      organizer: "Dr. Johnson",
      type: "WORKSHOP",
      price: 10,
    },
    {
      id: 3,
      title: "Séminaire sur l'intelligence artificielle",
      description: "Séminaire sur les dernières avancées en intelligence artificielle",
      areaId: 24,
      startTime: new Date("2026-05-03T10:00:00Z"),
      endTime: new Date("2026-05-03T12:00:00Z"),
      maxParticipants: 50,
      numberOfParticipants: 40,
      organizer: "Dr. Lee",
      type: "CONFERENCE",
      price: 15,
    },
    {
      id: 4,
      title: "Cours de physique",
      description: "Cours de physique pour les étudiants de première année",
      areaId: 14,
      startTime: new Date("2026-05-04T08:00:00Z"),
      endTime: new Date("2026-05-04T10:00:00Z"),
      maxParticipants: 30,
      numberOfParticipants: 28,
      organizer: "Prof. Brown",
      type: "COURSE",
      price: 0,
    },
    {
      id: 5,
      title: "Hackathon de rentrée",
      description: "Participez à notre hackathon de rentrée pour gagner des prix !",
      areaId: 24,
      startTime: new Date("2026-05-10T18:00:00Z"),
      endTime: new Date("2026-05-11T18:00:00Z"),
      maxParticipants: 100,
      numberOfParticipants: 45,
      organizer: "Tech Club",
      type: "WORKSHOP",
      price: 20,
    },
    {
      id: 6,
      title: "Réunion d'information académique",
      description: "Information sur les parcours académiques et les inscriptions",
      areaId: 25,
      startTime: new Date("2026-05-15T15:00:00Z"),
      endTime: new Date("2026-05-15T16:30:00Z"),
      maxParticipants: 200,
      numberOfParticipants: 180,
      organizer: "Direction Pédagogique",
      type: "MEETING",
      price: 0,
    },
    {
      id: 7,
      title: "Présentation des projets étudiants",
      description: "Showcase des meilleurs projets étudiants de l'année",
      areaId: 25,
      startTime: new Date("2026-05-20T14:00:00Z"),
      endTime: new Date("2026-05-20T17:00:00Z"),
      maxParticipants: 150,
      numberOfParticipants: 120,
      organizer: "Département Informatique",
      type: "CONFERENCE",
      price: 5,
    },
  ];

  for (const event of events) {
    await prisma.event.upsert({
      where: { id: event.id },
      update: { 
        title: event.title,
        description: event.description,
        areaId: event.areaId,
        numberOfParticipants: event.numberOfParticipants,
      },
      create: event,
    });
  }

  // EVENT REGISTRATIONS
  const registrations = [
    { id: "550e8400-e29b-41d4-a716-446655550001", userId: "550e8400-e29b-41d4-a716-446655440001", eventId: 1 },
    { id: "550e8400-e29b-41d4-a716-446655550002", userId: "550e8400-e29b-41d4-a716-446655440001", eventId: 2 },
    { id: "550e8400-e29b-41d4-a716-446655550003", userId: "550e8400-e29b-41d4-a716-446655440004", eventId: 1 },
    { id: "550e8400-e29b-41d4-a716-446655550004", userId: "550e8400-e29b-41d4-a716-446655440004", eventId: 3 },
    { id: "550e8400-e29b-41d4-a716-446655550005", userId: "550e8400-e29b-41d4-a716-446655440005", eventId: 2 },
    { id: "550e8400-e29b-41d4-a716-446655550006", userId: "550e8400-e29b-41d4-a716-446655440005", eventId: 5 },
  ];

  for (const reg of registrations) {
    await prisma.eventRegistration.upsert({
      where: { id: reg.id },
      update: {},
      create: reg,
    });
  }

  // ACTUALITIES
  const actualities = [
    {
      id: 1,
      title: "Bienvenue à la plateforme IoT",
      content: "Actualité de bienvenue pour la nouvelle plateforme de gestion IoT",
      type: "ANNOUNCEMENT",
      imageUrl: "images/actualities/default-actuality.png",
    },
    {
      id: 2,
      title: "Nouveaux appareils IoT installés",
      content: "20 nouveaux capteurs et appareils IoT ont été installés dans les bâtiments Turing et Cauchy",
      type: "NEWS",
      imageUrl: "images/actualities/default-actuality.png",
    },
    {
      id: 3,
      title: "Mise à jour du système",
      content: "Mise à jour majeure du système de gestion des événements et des espaces",
      type: "UPDATE",
      imageUrl: "images/actualities/default-actuality.png",
    },
    {
      id: 4,
      title: "Horaires d'ouverture des bâtiments",
      content: "Les bâtiments sont ouverts de 7h30 à 22h en semaine, et de 9h à 18h le weekend",
      type: "ANNOUNCEMENT",
      imageUrl: "images/actualities/default-actuality.png",
    },
    {
      id: 5,
      title: "Formation IoT pour les étudiants",
      content: "Une formation gratuite sur les technologies IoT sera proposée aux étudiants intéressés",
      type: "ANNOUNCEMENT",
      imageUrl: "images/actualities/default-actuality.png",
    },
    {
      id: 6,
      title: "Compétition de programmation",
      content: "Inscrivez-vous à la compétition de programmation annuelle avec des prix à la clé",
      type: "NEWS",
      imageUrl: "images/actualities/default-actuality.png",
    },
  ];

  for (const actuality of actualities) {
    await prisma.actuality.upsert({
      where: { id: actuality.id },
      update: { 
        title: actuality.title,
        content: actuality.content,
        type: actuality.type,
      },
      create: actuality,
    });
  }

  console.log(`✅ Seeding complete!`);
  console.log(`📊 Database now contains:`);
  const stats = await Promise.all([
    prisma.area.count(),
    prisma.building.count(),
    prisma.ioTDevice.count(),
    prisma.user.count(),
    prisma.event.count(),
    prisma.eventRegistration.count(),
    prisma.actuality.count(),
  ]);
  console.log(`   - ${stats[0]} Areas`);
  console.log(`   - ${stats[1]} Buildings`);
  console.log(`   - ${stats[2]} IoT Devices`);
  console.log(`   - ${stats[3]} Users`);
  console.log(`   - ${stats[4]} Events`);
  console.log(`   - ${stats[5]} Event Registrations`);
  console.log(`   - ${stats[6]} Actualities`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
