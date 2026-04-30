/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const DEFAULT_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/266/266033.png";

export async function fetchDefaultAvatar() {
  const response = await fetch(DEFAULT_AVATAR);
  const data = await response.blob();
  return new File([data], "avatar.jpg", { type: "image/jpeg" });
}

export function fixUser(user) {
  user.avatarUrl ||= DEFAULT_AVATAR;
  if (!user.avatarUrl.startsWith('http')) {
    user.avatarUrl = `http://localhost:3000/${user.avatarUrl}`;
  }
  console.log(user.avatarUrl);

  // TODO: remove
  user.birthdate = new Date();
  return user;
}

export const SELECT_GENDER = [
  { label: "Homme", value: "M" },
  { label: "Femme", value: "F" },
  { label: "Autre", value: "O" },
];

export async function getMe() {
  const token = localStorage.getItem("token");
  const response = await fetch("http://localhost:3000/api/user/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) {
    await Promise.reject(
      new Error(
        data.error ?? "Erreur lors de la récupération de l'utilisateur",
      ),
    );
  }
  fixUser(data);
  console.log(data);
  return data;
}

export async function login(pseudo, password) {
  const response = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      login: pseudo,
      password: password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    await Promise.reject(
      new Error(data.error ?? "Identifiant ou mot de passe incorrect"),
    );
    return;
  }

  localStorage.setItem("token", data.token);
  localStorage.setItem("email", data.user.email);

  return data.user;
}

export async function signin(user, avatar) {
  const formData = new FormData();
  for (const key in user) {
    formData.append(key, user[key]);
  }
  formData.append("image", avatar);
  const response = await fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    const data = await response.json();
    await Promise.reject(
      new Error(data.error ?? "Erreur lors de la connexion"),
    );
  }
  localStorage.setItem("email", user.email);
}

export async function checkOTP(email, otp) {
  const response = await fetch("http://localhost:3000/api/auth/verify-otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, otp }),
  });
  if (!response.ok) {
    const data = await response.json();
    await Promise.reject(
      new Error(data.error ?? "Erreur lors de la verification du code OTP"),
    );
    return false;
  }
  return true;
}

export async function editUser(id, user, avatar) {
  const formData = new FormData();
  for (const key in user) {
    if (user[key] === null) continue;
    formData.append(key, user[key]);
  }
  formData.append("image", avatar);
  const token = localStorage.getItem("token");
  const response = await fetch(`http://localhost:3000/api/user/id/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
    body: formData,
  });
  if (!response.ok) {
    const data = await response.json();
    await Promise.reject(
      new Error(data.error ?? "Erreur lors de la connexion"),
    );
    return false;
  }
  return true;
}
