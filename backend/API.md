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
## Consultation et modification des devices

### `GET /api/devices/:id`
Retourne les détails d’un device par son identifiant.
inclus les informations liés au champs ainsi que la possibilité de faire des actions (ex: activer/désactiver un device IoT)

```http
GET /api/devices/1
```
Réponse 
```json
{
  success: true,
  data: {
    "id": 1,
    "name": "Capteur de température peu cher",
    "description": "Un capteur de température basique pour les projets étudiants",
    "etc": "...",
    "area": {
      "id": 3,
      "name": "Salle 101",
      "description": "Salle de classe 101 du bâtiment Turing",
      "type": "CLASSROOM"
    },
    "specific": {
      "value": null,
      "timestamp": null
    },
    "form": {
      "role": "USER",
      "editableFieldKeys": [],
      "fields": [
        {
          "key": "id",
          "label": "Identifiant",
          "kind": "number",
          "editableBy": [],
          "readOnly": true,
          "section": "general",
          "value": 1,
          "editable": false
        },
        {
          "key": "name",
          "label": "Nom",
          "kind": "text",
          "minLength": 1,
          "maxLength": 120,
          "editableBy": ["ADMIN"],
          "section": "general",
          "value": "Capteur de température peu cher",
          "editable": false
        },
        {"...etc": "..."}
      ],
      "suportedSpecificFields": ["sensor.value", "sensor.timestamp"]
}
```


### `POST /api/devices/:id`
Permet de modifier un device IoT (ex: activer/désactiver).
Body JSON :

```json
{
  "a tester"
}
```
*a tester*

## Schéma rapide des retours

- Login : `{ token, user }`
- Register : `{ message }`
- Verify OTP : `{ message }`
- Me : objet utilisateur
- Get user by id : objet utilisateur
- Search : `{ success, count, data }`

## Notes utiles pour le front

- La route active de recherche est `src/routes/search.routes.js` ; `src/routes/search.route.js` semble être un ancien fichier non branché.
- Le front peut s’appuyer sur `login` + `token` pour toutes les requêtes protégées.
- Les modèles utiles côté UI sont `User`, `Area`, `IoTDevice` et `Event`.
