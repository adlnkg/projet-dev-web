# Annuaire API backend

Base URL locale : `http://localhost:3000/api`

## Règles générales

- Toutes les routes sont montées sous `/api` dans `src/app.js`.
- L’authentification se fait via un header `Authorization: Bearer <token>`.
- Le token JWT est renvoyé par la route de login.
- Les réponses d’erreur suivent en général le format `{ error: "..." }`.

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

### `GET /api/user/get/:id`

Retourne le profil d’un utilisateur par identifiant.

Header requis :

```http
Authorization: Bearer <token>
```

Accès limité aux rôles autorisés par le middleware `authorizeMiddleware("USER")`.

## Recherche

### `GET /api/search`

Recherche globale sur les devices, areas et events.

Route publique : pas de token requis actuellement.

Query params :

- `keywords` : texte à rechercher
- `building` : nom du bâtiment, optionnel
- `type` : `device`, `area`, `event`, `all`

Exemple :

```http
GET /api/search?keywords=projecteur&building=main&type=device
```

Réponse `200` :

```json
{
  "success": true,
  "count": 2,
  "data": []
}
```

Note : la validation autorise `event`, mais le service de recherche contient aussi un cas `events` côté code. Pour le front, utilise `event` ou `all`.

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
