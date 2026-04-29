# Annuaire API backend

Base URL locale : `http://localhost:3000/api`

## Règles générales

- Toutes les routes sont montées sous `/api` dans `src/app.js`.
- L’authentification se fait via un header `Authorization: Bearer <token>`.
- Le token JWT est renvoyé par la route de login.
- Les réponses d’erreur suivent en général le format `{ error: "..." }` ou `{ success: false, message: "..." }`.

## Auth

### `POST /api/auth/register`

Crée un utilisateur, génère un OTP et envoie un email de vérification.

Body JSON :

```json
{
  "login": "jdoe",
  "password": "secret123",
  "email": "jdoe@example.com",
  "lastName": "Doe",
  "firstName": "John",
  "sex": "M",
  "age": 24,
  "memberType": "STUDENT",
  "avatarUrl": "https://..."
}
```

Réponse `201` :

```json
{
  "message": "Utilisateur créé. Vérifiez votre email."
}
```

### `POST /api/auth/login`

Connexion utilisateur.

**Important** : La connexion quotidienne récompense automatiquement 10 points à l'utilisateur (une seule fois par jour).

Body JSON :

```json
{
  "login": "jdoe",
  "password": "secret123"
}
```

Réponse `200` :

```json
{
  "token": "jwt-token",
  "user": {
    "login": "jdoe",
    "email": "jdoe@example.com",
    "role": "USER"
  }
}
```

### `POST /api/auth/verify-otp`

Vérifie le compte avec le code reçu par email.

Body JSON :

```json
{
  "email": "jdoe@example.com",
  "otp": "123456"
}
```

Réponse `200` :

```json
{
  "message": "Compte vérifié"
}
```

## Utilisateur


### `GET /api/user/me`

Retourne le profil de l’utilisateur connecté.

Header requis :

```http
Authorization: Bearer <token>
```

Réponse `200` : objet utilisateur sans mot de passe.

### `GET /api/user/me/points/history`

Retourne toutes les transactions de points de l’utilisateur connecté.

Header requis :

```http
Authorization: Bearer <token>
```

Réponse `200` :

```json
{
  "pointsHistory": [
    {
      "id": "uuid",
      "amount": 10,
      "reason": "Connexion journalière",
      "createdAt": "2026-04-24T08:00:00.000Z"
    }
  ]
}
```

### `GET /api/user/:id`

Retourne le profil d’un utilisateur par identifiant.

Header requis :

```http
Authorization: Bearer <token>
```

Note : L’accès à cette route n’est pas restreint par un middleware d’autorisation spécifique, tout utilisateur authentifié peut consulter le profil d’un autre utilisateur.

### `PUT /api/user/:id`

Met à jour le profil de l’utilisateur identifié par `:id`.

Header requis :

```http
Authorization: Bearer <token>
```

Seul l’utilisateur concerné ou un administrateur (`ADMIN`) peut modifier le profil. Un administrateur peut donc modifier le profil de n’importe quel utilisateur via cette route.

Body JSON (exemple) :

```json
{
  "password": "nouveaumdp",
  "firstName": "NouveauPrénom",
  "lastName": "NouveauNom",
  "age": 25,
  "sex": "F",
  "memberType": "STAFF",
  "avatarUrl": "https://..."
}
```

Réponse `200` : objet utilisateur mis à jour (sans mot de passe).

## Système de Points

Les utilisateurs peuvent accumuler des points. À partir d'un certain seuil de points, un utilisateur `USER` est automatiquement promu en `SUPER_USER`.

**Seuil de promotion** : 100 points

### Fonctionnement

- Les utilisateurs commencent avec 0 points.
- Chaque connexion quotidienne récompense **10 points** (une seule fois par jour).
- Lorsqu'un utilisateur atteint 100 points, son rôle passe automatiquement de `USER` à `SUPER_USER`.
- Les points sont tracés dans l'historique `PointHistory` avec la raison et le timestamp.

### Structure du modèle User

Le modèle `User` inclut :
- `points` (Integer) : nombre de points accumulés par l'utilisateur (défaut : 0)
- `pointHistory` (Relation) : historique des modifications de points
- `role` (Enum) : `USER`, `SUPER_USER`, `ADMIN`

### Modèle PointHistory

```json
{
  "id": "uuid",
  "userId": "uuid",
  "amount": 10,
  "reason": "Daily login",
  "createdAt": "2026-04-24T12:00:00Z"
}
```

- `amount` : nombre de points ajoutés (positif) ou retirés (négatif)
- `reason` : raison de la modification (ex: "Daily login", "Points awarded", etc.)

## Recherche

### `GET /api/search/info`

Récupère les métadonnées sur les filtres disponibles pour chaque type d'entité et la recherche globale.

Route publique : pas de token requis (adaptée selon l'authentification).

Réponse `200` (utilisateur non connecté) :

```json
{
  "success": true,
  "globalSearch": {
    "description": "Recherche globale unifiée",
    "requiresAuth": false,
    "filters": [
      { "name": "keywords", "type": "string", "required": false, "description": "Mots clés de recherche" },
      { "name": "building", "type": "string", "required": false, "description": "Filtre par bâtiment" },
      { "name": "type", "type": "enum", "required": false, "description": "Type d'entité", "values": ["ALL", "EVENT", "AREA", "ACTUALITY"] }
    ]
  },
  "entityTypes": {
    "event": { ... },
    "area": { ... },
    "actuality": { ... }
  }
}
```

Réponse `200` (utilisateur connecté) :

```json
{
  "success": true,
  "globalSearch": {
    "description": "Recherche globale unifiée",
    "requiresAuth": false,
    "filters": [
      { "name": "keywords", "type": "string", "required": false, "description": "Mots clés de recherche" },
      { "name": "building", "type": "string", "required": false, "description": "Filtre par bâtiment" },
      { "name": "type", "type": "enum", "required": false, "description": "Type d'entité", "values": ["ALL", "EVENT", "AREA", "ACTUALITY", "DEVICE"] }
    ]
  },
  "entityTypes": {
    "event": { ... },
    "area": { ... },
    "actuality": { ... },
    "device": { ... }
  }
}
```

### `GET /api/search`

Recherche globale unifiée sur toutes les entités (EVENT, AREA, ACTUALITY et optionnellement DEVICE).

Chaque objet de `data` inclut `entityType` afin d'identifier directement la famille de l'entité retournée (`ACTUALITY`, `EVENT`, `AREA`, `DEVICE`).

Route publique : pas de token requis.

Query params :

- `keywords` : texte à rechercher (optionnel)
- `type` : type d'entité à rechercher
  - **Non connecté** : `ALL`, `EVENT`, `AREA`, `ACTUALITY`
  - **Connecté** : `ALL`, `EVENT`, `AREA`, `ACTUALITY`, `DEVICE`
  - `ALL` : retourne tous types disponibles selon l'authentification (valeur par défaut)

Exemples :

```http
GET /api/search?keywords=formation&type=ALL
GET /api/search?keywords=camera&type=device
GET /api/search?type=event
```

Réponse `200` (non connecté) :

```json
{
  "success": true,
  "count": 15,
  "data": [
    { "id": 1, "title": "Événement", "entityType": "EVENT", ... },
    { "id": 2, "name": "Salle 101", "entityType": "AREA", ... },
    { "id": 3, "title": "Actualité", "entityType": "ACTUALITY", ... }
  ],
  "buildingList": ["Turing", "Church"],
  "pointGained": 0
}
```

Réponse `200` (connecté, incluant devices) :

```json
{
  "success": true,
  "count": 18,
  "data": [
    { "id": 1, "title": "Événement", "entityType": "EVENT", ... },
    { "id": 2, "name": "Salle 101", "entityType": "AREA", ... },
    { "id": 3, "title": "Actualité", "entityType": "ACTUALITY", ... },
    { "id": 4, "name": "Projecteur", "type": "CAMERA", "entityType": "DEVICE", ... }
  ],
  "buildingList": ["Turing", "Church"],
  "pointGained": 1
}
```

Erreurs possibles :

- `401` : Authentification requise si `type=device` et utilisateur non connecté

### `GET /api/events/search`

Recherche dédiée aux événements avec filtres spécifiques.

Route publique : pas de token requis.

Les objets retournés dans `data` contiennent aussi `entityType` pour un routage simple côté client.

Query params :

- `keywords` : texte libre recherché avec Fuse.js sur `title`, `description`, `organizer`, dates et horaires
- `building` : filtre par bâtiment, optionnel
- `type` : type d'événement (`WORKSHOP`, `CONFERENCE`, `MEETING`, `COURSE`) ou `ALL`, optionnel
- `startMin` : borne basse de date de début (ISO 8601), optionnel
- `startMax` : borne haute de date de début (ISO 8601), optionnel
- `priceMin` : prix minimum, optionnel
- `priceMax` : prix maximum, optionnel
- `spotsMin` : nombre minimum de places restantes, optionnel

Exemples :

```http
GET /api/events/search?keywords=robotique&type=WORKSHOP
GET /api/events/search?startMin=2026-05-01&startMax=2026-05-31&priceMax=50
```

Réponse `200` :

```json
{
  "success": true,
  "count": 5,
  "data": [],
  "pointGained": 0
}
```

### `GET /api/areas/search`

Recherche dédiée aux zones avec filtres spécifiques.

Route publique : pas de token requis.

Query params :

- `keywords` : texte libre recherché avec Fuse.js sur `name`, `description` et hiérarchie des zones (parents)
- `building` : filtre par bâtiment, optionnel
- `type` : type de zone (`BUILDING`, `FLOOR`, `CLASSROOM`, `TECHNICAL_ROOM`) ou `ALL`, optionnel

Exemples :

```http
GET /api/areas/search?keywords=laboratoire&building=Turing
GET /api/areas/search?type=CLASSROOM
```

Réponse `200` :

```json
{
  "success": true,
  "count": 12,
  "data": [],
  "pointGained": 0
}
```

### `GET /api/devices/search`

Recherche dédiée aux périphériques IoT avec filtres spécifiques.

Route protégée : token requis (`Authorization: Bearer <token>`).

Query params :

- `keywords` : texte libre recherché avec Fuse.js sur `name`, `brand`, `model`, `description` et hiérarchie des zones
- `building` : filtre par bâtiment, optionnel
- `type` : type de périphérique (`LIGHT`, `SENSOR`, `THERMOSTAT`, `CAMERA`, `ACCESS_CONTROL`, `WHITEBOARD`) ou `ALL`, optionnel
- `status` : statut du périphérique (`ACTIVE`, `INACTIVE`, `DISCONNECTED`, `ERROR`), optionnel
- `active` : état actif (`true` ou `false`), optionnel
- `consumptionMin` : consommation électrique minimale (en W), optionnel
- `consumptionMax` : consommation électrique maximale (en W), optionnel
- `lastPowerOnAfter` : date de dernière mise sous tension (ISO 8601), optionnel
- `lastMaintenanceAfter` : date de dernière maintenance (ISO 8601), optionnel

Exemples :

```http
GET /api/devices/search?keywords=camera&type=CAMERA&status=ACTIVE
GET /api/devices/search?building=Turing&consumptionMin=0&consumptionMax=100&lastMaintenanceAfter=2026-04-01
```

Réponse `200` :

```json
{
  "success": true,
  "count": 8,
  "data": [],
  "pointGained": 1
}
```

### `GET /api/actualities/search`

Recherche dédiée aux actualités.

Route publique : pas de token requis.

Query params :

- `keywords` : texte libre recherché avec Fuse.js sur `title`, `content`, `type`, `createdAt` et `owner`.
- `type` : type d'actualité (`NEWS`, `ANNOUNCEMENT`, `UPDATE`, `OTHER`) ou `ALL`, optionnel.
- `createdFrom` : borne basse de date de création (format date/ISO), optionnel.
- `createdTo` : borne haute de date de création (format date/ISO), optionnel.

Exemples :

```http
GET /api/actualities/search?keywords=maintenance&type=NEWS
GET /api/actualities/search?createdFrom=2026-04-01&createdTo=2026-04-30&type=ALL
```

Réponse `200` :

```json
{
  "success": true,
  "count": 3,
  "data": [],
  "pointGained": 0
}
```

## Contenus éditables

Les ressources suivantes utilisent le même contrat de lecture/modification :

- `Actuality`
- `Event`
- `Area`
- `IoTDevice`

Chaque réponse de détail contient :

```json
{
  "success": true,
  "data": {
    "id": 1,
    "owner": {
      "id": "user1",
      "login": "fanck",
      "firstName": "Fanck",
      "lastName": null
    },
    "ownerName": "fanck",
    "userIsRegistered": false,
    "specific": {},
    "form": {
      "role": "USER",
      "editableFieldKeys": [],
      "fields": [
        {
          "key": "id",
          "label": "Identifiant",
          "kind": "number",
          "readOnly": true,
          "section": "general",
          "value": 1,
          "editable": false
        }
      ],
      "supportedSpecificFields": []
    }
  }
}
```

Règles communes :

- `USER` : lecture seule.
- `SUPER_USER` : modification de certains champs métier.
- `ADMIN` : modification des champs admin + droits du `SUPER_USER`.
- La création est réservée à `ADMIN`.
- Les créations avec image utilisent `multipart/form-data` avec un champ fichier nommé `image`.
- Les images sont enregistrées dans `public/images/<ressource>/...`.
- Le créateur est injecté automatiquement depuis l’utilisateur authentifié via `owner`.- **Pour les Events uniquement** : le champ `userIsRegistered` indique si l'utilisateur connecté est inscrit à l'événement. Ce champ est `false` pour les utilisateurs non authentifiés.
## Actuality

### Lecture

`GET /api/actualities/:id`

Réponse `200` :

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Nouvelle actualité",
    "content": "Contenu de l’actualité.",
    "imageUrl": "images/actualities/news-1.png",
    "createdAt": "2026-04-25T08:00:00.000Z",
    "ownerName": "admin1",
    "owner": {
      "id": "user1",
      "login": "admin1",
      "firstName": "Admin",
      "lastName": "User"
    },
    "specific": {},
    "form": {
      "role": "USER",
      "editableFieldKeys": [],
      "fields": ["..."],
      "supportedSpecificFields": []
    }
  }
}
```
Lecture possible pour utilisateurs non connectés.

### Recherche

`GET /api/actualities/search`

Recherche dédiée aux actualités.

Route publique : pas de token requis.

Query params :

- `keywords` : texte libre recherché avec Fuse.js sur `title`, `content`, `type`, `createdAt` et `owner`.
- `type` : type d'actualité, optionnel (`NEWS`, `ANNOUNCEMENT`, `UPDATE`, `OTHER`) ou `ALL`.
- `createdFrom` : borne basse de date de création (format date/ISO), optionnel.
- `createdTo` : borne haute de date de création (format date/ISO), optionnel.

Exemples :

```http
GET /api/actualities/search?keywords=maintenance&type=NEWS
GET /api/actualities/search?createdFrom=2026-04-01&createdTo=2026-04-30&type=ALL
```

Réponse `200` :

```json
{
  "success": true,
  "count": 3,
  "data": [],
  "pointGained": 0
}
```

### Formulaire de création

`GET /api/actualities/create-form`

Accès : `ADMIN` uniquement.

Réponse `200` :

```json
{
  "success": true,
  "data": {
    "resource": "ACTUALITY",
    "role": "ADMIN",
    "create": {
      "method": "POST",
      "endpoint": "/api/actualities",
      "contentType": "multipart/form-data",
      "imageField": "image",
      "requiredFieldKeys": ["title", "content"],
      "fields": [
        {
          "key": "title",
          "label": "Titre",
          "kind": "text",
          "minLength": 3,
          "maxLength": 160,
          "section": "general",
          "required": true
        },
        {
          "key": "content",
          "label": "Contenu",
          "kind": "textarea",
          "minLength": 10,
          "maxLength": 5000,
          "section": "general",
          "required": true
        },
        {
          "key": "imageUrl",
          "label": "URL image",
          "kind": "text",
          "section": "general",
          "required": false
        }
      ]
    }
  }
}
```

### Création

`POST /api/actualities`

Body `multipart/form-data` ou `application/json` :

```json
{
  "title": "Nouveau titre",
  "content": "Texte de l’actualité"
}
```

Option image : fichier `image`.

Champs :

- `title` : obligatoire, texte.
- `content` : obligatoire, texte long.
- `image` : optionnel, fichier image.

### Modification

`POST /api/actualities/:id`

Body JSON :

```json
{
  "title": "Titre modifié",
  "content": "Contenu modifié",
  "imageUrl": "images/actualities/news-1.png"
}
```

Champs modifiables :

- `SUPER_USER` : `title`, `content`
- `ADMIN` : `imageUrl` + droits du `SUPER_USER`

## Event

### Lecture

`GET /api/events/:id`

Réponse `200` : structure identique au contrat commun, avec `area`, `owner`, `specific`, `form`.

### Formulaire de création

`GET /api/events/create-form`

Accès : `ADMIN` uniquement.

Réponse `200` :

```json
{
  "success": true,
  "data": {
    "resource": "EVENT",
    "role": "ADMIN",
    "create": {
      "method": "POST",
      "endpoint": "/api/events",
      "contentType": "multipart/form-data",
      "imageField": "image",
      "requiredFieldKeys": [
        "areaId",
        "title",
        "description",
        "organizer",
        "startTime",
        "endTime",
        "maxParticipants"
      ],
      "fields": [
        { "key": "title", "kind": "text", "required": true },
        { "key": "description", "kind": "textarea", "required": true },
        { "key": "organizer", "kind": "text", "required": true },
        { "key": "startTime", "kind": "datetime", "required": true },
        { "key": "endTime", "kind": "datetime", "required": true },
        { "key": "maxParticipants", "kind": "number", "required": true },
        { "key": "areaId", "kind": "number", "required": true },
        { "key": "type", "kind": "select", "required": false },
        { "key": "price", "kind": "number", "required": false },
        { "key": "numberOfParticipants", "kind": "number", "required": false },
        { "key": "imageUrl", "kind": "text", "required": false }
      ]
    }
  }
}
```

### Création

`POST /api/events`

Body `multipart/form-data` ou `application/json` :

```json
{
  "title": "Atelier robotique",
  "description": "Découverte de la robotique",
  "organizer": "Prof. Smith",
  "startTime": "2026-05-01T08:00:00.000Z",
  "endTime": "2026-05-01T10:00:00.000Z",
  "maxParticipants": 20,
  "areaId": 3,
  "type": "WORKSHOP",
  "price": 0,
  "numberOfParticipants": 0
}
```

Champs :

- obligatoires : `title`, `description`, `organizer`, `startTime`, `endTime`, `maxParticipants`, `areaId`
- optionnels : `type`, `price`, `numberOfParticipants`, `image`

### Modification

`POST /api/events/:id`

Body JSON :

```json
{
  "title": "Atelier robotique avancé",
  "startTime": "2026-05-01T09:00:00.000Z",
  "endTime": "2026-05-01T11:00:00.000Z",
  "maxParticipants": 30,
  "price": 10
}
```

Champs modifiables :

- `SUPER_USER` : `startTime`, `endTime`, `maxParticipants`, `type`
- `ADMIN` : `title`, `description`, `organizer`, `price`, `imageUrl` + droits du `SUPER_USER`

### Inscription

`POST /api/events/:id/register`

Route protégée : token requis (`Authorization: Bearer <token>`).

Permet à un utilisateur connecté de s'inscrire à un événement.

Réponse `201` :

```json
{
  "success": true,
  "message": "Inscription à l'événement réussie.",
  "data": {
    "id": "uuid",
    "userId": "user-uuid",
    "eventId": 5,
    "createdAt": "2026-04-27T21:45:00Z"
  }
}
```

Erreurs possibles :

- `401` : Authentification requise
- `404` : Événement introuvable
- `400` : Utilisateur déjà inscrit ou événement complet

### Désinscription

`POST /api/events/:id/unregister`

Route protégée : token requis (`Authorization: Bearer <token>`).

Permet à un utilisateur connecté de se désinscrire d'un événement.

Réponse `200` :

```json
{
  "success": true,
  "message": "Désinscription de l'événement réussie."
}
```

Erreurs possibles :

- `401` : Authentification requise
- `404` : Événement introuvable
- `400` : Utilisateur non inscrit à cet événement

## Area

### Lecture

`GET /api/areas/:id`

Connection optionnelle : les utilisateurs non connectés peuvent consulter les détails d’une zone, mais sans les informations sensibles ni la liste des appareils IoT.
Réponse `200` : structure identique au contrat commun, avec `parentArea`, `owner`, `specific`, `form`, et `iotDevices` pour les utilisateurs connectés.

Le champ `iotDevices` contient la liste des appareils rattachés à l’area via `areaId`, avec un résumé de consommation et un indicateur de maintenance :

```json
{
  "iotDevices": [
    {
      "id": 42,
      "uniqueName": "light-room-101",
      "name": "Lumière salle 101",
      "description": "Éclairage principal",
      "brand": "Philips",
      "consumption": {
        "electricityConsumptionKwh": 12.4,
        "nominalPowerWatts": 18,
        "averageDailyUsageHours": 6,
        "estimatedDailyConsumptionKwh": 0.108,
        "estimatedMonthlyConsumptionKwh": 3.24
      },
      "maintenance": {
        "maintenanceIntervalDays": 180,
        "lastMaintenanceAt": "2026-02-01T10:00:00.000Z",
        "maintenanceRequired": false
      }
    }
  ]
}
```

### Formulaire de création

`GET /api/areas/create-form`

Accès : `ADMIN` uniquement.

Réponse `200` :

```json
{
  "success": true,
  "data": {
    "resource": "AREA",
    "role": "ADMIN",
    "create": {
      "method": "POST",
      "endpoint": "/api/areas",
      "contentType": "multipart/form-data",
      "imageField": "image",
      "typeOptions": ["BUILDING", "FLOOR", "CLASSROOM", "TECHNICAL_ROOM"],
      "byType": {
        "BUILDING": {
          "requiredFieldKeys": ["type", "name", "description", "building.address"],
          "supportedSpecificFields": ["building.address"],
          "fields": [{ "key": "building.address", "kind": "text", "required": true }]
        }
      }
    }
  }
}
```

Remarque : chaque entrée de `byType.*.fields` contient aussi les champs généraux (`name`, `description`, `type`, `parentAreaId`, `imageUrl`) ; l’exemple est volontairement réduit.

### Création

`POST /api/areas`

Body `multipart/form-data` ou `application/json` :

```json
{
  "name": "Bâtiment Turing",
  "description": "Bâtiment principal",
  "type": "BUILDING",
  "building.address": "12 rue du campus",
  "parentAreaId": null
}
```

Champs par type :

- `BUILDING` : `building.address`
- `FLOOR` : `floor.floorNumber`
- `CLASSROOM` : `classroom.classroomNumber`
- `TECHNICAL_ROOM` : `technicalRoom.roomNumber`

Champs communs :

- obligatoires : `name`, `description`, `type`
- optionnels : `parentAreaId`, `image`

### Modification

`POST /api/areas/:id`

Body JSON :

```json
{
  "name": "Bâtiment Turing 2",
  "description": "Description modifiée",
  "imageUrl": "images/areas/turing-2.svg",
  "building.address": "14 rue du campus"
}
```

Champs modifiables :

- `SUPER_USER` : champs spécifiques du type (`building.address`, `floor.floorNumber`, `classroom.classroomNumber`, `technicalRoom.roomNumber`)
- `ADMIN` : `name`, `description`, `imageUrl` + droits du `SUPER_USER`

## IoTDevice

### Lecture

`GET /api/devices/:id`

Réponse `200` :

```json
{
  "success": true,
  "data": {
    "id": 1,
    "uniqueName": "temp-sensor-101",
    "name": "Capteur de température peu cher",
    "description": "Un capteur de température basique pour les projets étudiants",
    "createdAt": "2026-04-25T08:00:00.000Z",
    "brand": "Generic",
    "model": "TempSensor 1.0",
    "electricityConsumption": 0,
    "status": "ACTIVE",
    "type": "SENSOR",
    "areaId": 3,
    "ownerName": "admin1",
    "owner": {
      "id": "user1",
      "login": "admin1",
      "firstName": "Admin",
      "lastName": "User"
    },
    "area": {
      "id": 3,
      "name": "Salle 101",
      "description": "Salle de classe 101 du bâtiment Turing",
      "type": "CLASSROOM"
    },
    "specific": {
      "value": 22.5,
      "timestamp": "2026-04-25T08:00:00.000Z",
      "samplingIntervalSeconds": 60,
      "batteryLevel": 92,
      "lastReadingAt": "2026-04-25T08:05:00.000Z"
    },
    "statistics": {
      "consumption": {
        "electricityConsumptionKwh": 12.4,
        "nominalPowerWatts": 18,
        "averageDailyUsageHours": 6,
        "estimatedDailyConsumptionKwh": 0.108,
        "estimatedMonthlyConsumptionKwh": 3.24
      },
      "maintenance": {
        "maintenanceIntervalDays": 90,
        "lastMaintenanceAt": "2026-04-20T08:00:00.000Z"
      },
      "lifecycle": {
        "lastPowerOnAt": "2026-04-25T07:50:00.000Z",
        "lastPowerOffAt": null,
        "lastActivityAt": "2026-04-25T08:05:00.000Z"
      },
      "history": {
        "entriesCount": 4
      }
    },
    "history": {
      "count": 2,
      "entries": [
        {
          "id": "uuid",
          "kind": "MEASUREMENT",
          "fieldKey": "electricityConsumption",
          "previousValue": "12.0",
          "currentValue": "12.4",
          "numericValue": 12.4,
          "unit": "kWh",
          "note": null,
          "recordedAt": "2026-04-25T08:05:00.000Z"
        }
      ]
    },
    "form": {
      "role": "USER",
      "editableFieldKeys": [],
      "fields": ["..."],
      "supportedSpecificFields": ["sensor.value", "sensor.timestamp", "sensor.samplingIntervalSeconds", "sensor.batteryLevel", "sensor.lastReadingAt"]
    }
  }
}
```

### Formulaire de création

`GET /api/devices/create-form`

Accès : `ADMIN` uniquement.

Réponse `200` :

```json
{
  "success": true,
  "data": {
    "resource": "IOT_DEVICE",
    "role": "ADMIN",
    "create": {
      "method": "POST",
      "endpoint": "/api/devices",
      "contentType": "multipart/form-data",
      "imageField": "image",
      "typeOptions": ["LIGHT", "SENSOR", "THERMOSTAT", "CAMERA", "ACCESS_CONTROL", "WHITEBOARD"],
      "byType": {
        "LIGHT": {
          "requiredFieldKeys": ["type", "areaId", "uniqueName", "name", "description", "brand", "model", "light.brightness", "light.color"],
          "supportedSpecificFields": ["light.brightness", "light.color", "light.powerWatts", "light.colorTemperature", "light.lastSwitchedOnAt", "light.lastSwitchedOffAt"],
          "fields": [
            { "key": "light.brightness", "kind": "number", "required": true },
            { "key": "light.color", "kind": "text", "required": true }
          ]
        }
      }
    }
  }
}
```

Remarque : chaque entrée de `byType.*.fields` contient aussi les champs généraux (`uniqueName`, `name`, `description`, `brand`, `model`, `type`, `areaId`, `status`, `electricityConsumption`, `nominalPowerWatts`, `averageDailyUsageHours`, `maintenanceIntervalDays`, `imageUrl`) ; l’exemple est volontairement réduit.

Le bloc `form.fields` expose aussi les champs de suivi en lecture seule lors de la consultation, comme `lastPowerOnAt`, `lastPowerOffAt`, `lastMaintenanceAt` et les timestamps spécifiques du type.

### Création

`POST /api/devices`

Body `multipart/form-data` ou `application/json`.

Champs communs :

```json
{
  "uniqueName": "light-001",
  "name": "Lampe bureau",
  "description": "Lampe connectée",
  "brand": "Generic",
  "model": "Lamp X",
  "areaId": 3,
  "type": "LIGHT",
  "status": "INACTIVE",
  "electricityConsumption": 0,
  "nominalPowerWatts": 18,
  "averageDailyUsageHours": 6,
  "maintenanceIntervalDays": 90,
  "light.powerWatts": 18,
  "light.colorTemperature": 4000
}
```

Champs spécifiques selon `type` :

- `LIGHT` : `light.brightness`, `light.color`, `light.powerWatts`, `light.colorTemperature`
- `SENSOR` : `sensor.value`, `sensor.samplingIntervalSeconds`
- `THERMOSTAT` : `thermostat.temperature`, `thermostat.targetTemp`, `thermostat.powerWatts`
- `CAMERA` : `camera.resolution`, `camera.frameRate`, `camera.powerWatts`, `camera.streamingBitrateKbps`
- `ACCESS_CONTROL` : `accessControl.status`, `accessControl.powerWatts`
- `WHITEBOARD` : `whiteboard.resolution`, `whiteboard.screenSize`, `whiteboard.powerWatts`

Champs optionnels :

- `image` : fichier image
- `status` : défaut `INACTIVE`
- `electricityConsumption` : défaut `0`
- `nominalPowerWatts` : puissance nominale du device en watts
- `averageDailyUsageHours` : durée d’utilisation moyenne par jour
- `maintenanceIntervalDays` : intervalle recommandé entre deux maintenances
- `thermostat.mode` : défaut `OFF`
- `numberOfParticipants` n’existe pas sur ce modèle

### Modification

`POST /api/devices/:id`

Body JSON :

```json
{
  "name": "Lampe de bureau",
  "description": "Description modifiée",
  "brand": "NewBrand",
  "model": "Lamp Y",
  "status": "ACTIVE",
  "light.brightness": 80,
  "light.color": "white",
  "light.powerWatts": 18,
  "light.colorTemperature": 4000
}
```

Champs modifiables :

- `SUPER_USER` : `status`, `light.brightness`, `light.color`, `thermostat.targetTemp`, `thermostat.mode`
- `ADMIN` : `name`, `description`, `brand`, `model`, `status`, `nominalPowerWatts`, `averageDailyUsageHours`, `maintenanceIntervalDays`, `light.powerWatts`, `light.colorTemperature`, `sensor.samplingIntervalSeconds`, `thermostat.powerWatts`, `camera.powerWatts`, `camera.streamingBitrateKbps`, `whiteboard.powerWatts`, `accessControl.powerWatts` + droits du `SUPER_USER`

Le détail renvoyé par `GET /api/devices/:id` inclut désormais les 50 dernières entrées d’historique dans `history.entries` et un résumé calculé dans `statistics`, ce qui permet d’alimenter des rapports d’usage et de consommation côté front ou côté batch.

## Demandes de suppression

Les utilisateurs ayant le rôle `SUPER_USER` peuvent demander la suppression d'une entité depuis sa page de détail. La suppression réelle n'est effectuée qu'après validation par un `ADMIN`.

### Création d'une demande

`POST /api/areas/:id/deletion-request`

`POST /api/events/:id/deletion-request`

`POST /api/actualities/:id/deletion-request`

`POST /api/devices/:id/deletion-request`

Accès : `SUPER_USER` uniquement.

Réponse `201` :

```json
{
  "success": true,
  "message": "Demande de suppression envoyee.",
  "data": {
    "id": "uuid",
    "entityType": "AREA",
    "entityTypeLabel": "Zone",
    "entityId": 2,
    "entityLabel": "Bâtiment Turing",
    "entityPath": "/areas/2",
    "status": "PENDING",
    "requestedAt": "2026-04-27T08:00:00.000Z",
    "reviewedAt": null,
    "requestedBy": {
      "id": "user1",
      "login": "super1",
      "firstName": "Super",
      "lastName": "User"
    },
    "reviewedBy": null,
    "entitySnapshot": {}
  }
}
```

Règles :

- une seule demande `PENDING` peut exister à la fois pour une même entité ;
- les snapshots servent à afficher la demande côté admin même si l'entité évolue entre-temps ;
- l'entité doit exister au moment de la création de la demande.

### Liste des demandes

`GET /api/deletion-requests`

Accès : `ADMIN` uniquement.

Réponse `200` :

```json
{
  "success": true,
  "count": 2,
  "data": []
}
```

### Validation ou refus

`PATCH /api/deletion-requests/:id`

Accès : `ADMIN` uniquement.

Body JSON :

```json
{
  "decision": "APPROVE"
}
```

Valeurs possibles :

- `APPROVE` : l'entité est supprimée puis la demande passe à `APPROVED` ;
- `REJECT` : la demande passe à `REJECTED` sans suppression.

Réponse `200` :

```json
{
  "success": true,
  "message": "Demande acceptee.",
  "data": {
    "id": "uuid",
    "status": "APPROVED"
  }
}
```

## Home
### `GET /api/home`
Retourne les données d’accueil : actualités récentes et événements à venir.
```json
{
  "success": true,
  "data": {
    "actualities": [
      {
        "id": 1,
        "title": "first actuality",
        "content": "Actualité test, elle démontre les capacités du modèle",
        "imageUrl": "images/actualities/default-actuality.png",
        "createdAt": "2026-04-26T19:52:37.000Z",
        "ownerId": null,
        "owner": null
      }
    ],
    "events":[]
  }
}```

## Schéma rapide des retours

- Login : `{ token, user }`
- Register : `{ message }`
- Verify OTP : `{ message }`
- Me : objet utilisateur
- Get user by id : objet utilisateur
- Search : `{ success, count, data }`
- Demande de suppression : `{ success, message, data }`
- Liste des demandes de suppression : `{ success, count, data }`
- CRUD contenus : `{ success, data }` ou `{ success, message, data }`

## Notes utiles pour le front

- La route active de recherche est `src/routes/search.routes.js` ; `src/routes/search.route.js` semble être un ancien fichier non branché.
- Le front peut s’appuyer sur `login` + `token` pour toutes les requêtes protégées.
- Les modèles utiles côté UI sont `User`, `Area`, `IoTDevice`, `Event` et `Actuality`.
- Pour les créations avec image, envoyer un `multipart/form-data` et placer le fichier dans le champ `image`.
- Les champs du formulaire fournis par l’API doivent piloter le composant UI côté client : `kind`, `options`, `min`, `max`, `step`, `readOnly`, `editable`, `supportedSpecificFields`.
- Les pages de détail exposent désormais les routes frontend `/areas/:id`, `/events/:id`, `/actualities/:id` et `/devices/:id`.
- La page d'administration des demandes de suppression se trouve sur `/admin/deletion-requests`.
