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
- `pointHistories` (Relation) : historique des modifications de points
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

### `GET /api/search`

Recherche globale sur les devices, areas et events.

Route publique : pas de token requis actuellement.

Query params :

- `keywords` : texte à rechercher, inclus le détail de la zone de la recherche (ex: "batiment turing etage 1 salle 101 camera")
- `building` : nom du bâtiment, optionnel
- `type` : `device`, `area`, `event`, `all`

Exemple :

```http
GET /api/search?keywords=projecteur&building=Turing&type=device
```

Réponse `200` :

```json
{
  "success": true,
  "count": 2,
  "data": []
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
- Le créateur est injecté automatiquement depuis l’utilisateur authentifié via `owner`.

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

## Area

### Lecture

`GET /api/areas/:id`

Réponse `200` : structure identique au contrat commun, avec `parentArea`, `owner`, `specific`, `form`.

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
      "timestamp": "2026-04-25T08:00:00.000Z"
    },
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
        },
        {
          "key": "uniqueName",
          "label": "Nom unique",
          "kind": "text",
          "minLength": 3,
          "maxLength": 120,
          "section": "general",
          "value": "temp-sensor-101",
          "editable": false
        },
        {
          "key": "status",
          "label": "Statut",
          "kind": "select",
          "options": ["ACTIVE", "INACTIVE", "DISCONNECTED", "ERROR"],
          "section": "general",
          "value": "ACTIVE",
          "editable": false
        },
        {
          "key": "sensor.value",
          "label": "Valeur",
          "kind": "number",
          "readOnly": true,
          "section": "specific",
          "value": 22.5,
          "editable": false
        }
      ],
      "supportedSpecificFields": ["sensor.value", "sensor.timestamp"]
    }
  }
}
```

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
  "electricityConsumption": 0
}
```

Champs spécifiques selon `type` :

- `LIGHT` : `light.brightness`, `light.color`
- `SENSOR` : `sensor.value`
- `THERMOSTAT` : `thermostat.temperature`, `thermostat.targetTemp`
- `CAMERA` : `camera.resolution`, `camera.frameRate`
- `ACCESS_CONTROL` : `accessControl.status`
- `WHITEBOARD` : `whiteboard.resolution`, `whiteboard.screenSize`

Champs optionnels :

- `image` : fichier image
- `status` : défaut `INACTIVE`
- `electricityConsumption` : défaut `0`
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
  "light.color": "white"
}
```

Champs modifiables :

- `SUPER_USER` : `status`, `light.brightness`, `light.color`, `thermostat.targetTemp`, `thermostat.mode`
- `ADMIN` : `name`, `description`, `brand`, `model`, `status` + droits du `SUPER_USER`

## Schéma rapide des retours

- Login : `{ token, user }`
- Register : `{ message }`
- Verify OTP : `{ message }`
- Me : objet utilisateur
- Get user by id : objet utilisateur
- Search : `{ success, count, data }`
- CRUD contenus : `{ success, data }` ou `{ success, message, data }`

## Notes utiles pour le front

- La route active de recherche est `src/routes/search.routes.js` ; `src/routes/search.route.js` semble être un ancien fichier non branché.
- Le front peut s’appuyer sur `login` + `token` pour toutes les requêtes protégées.
- Les modèles utiles côté UI sont `User`, `Area`, `IoTDevice`, `Event` et `Actuality`.
- Pour les créations avec image, envoyer un `multipart/form-data` et placer le fichier dans le champ `image`.
- Les champs du formulaire fournis par l’API doivent piloter le composant UI côté client : `kind`, `options`, `min`, `max`, `step`, `readOnly`, `editable`, `supportedSpecificFields`.
