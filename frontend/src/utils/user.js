/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const DEFAULT_AVATAR =
  "https://as2.ftcdn.net/jpg/02/44/42/79/1000_F_244427911_aoHHulebtYy4wLpncBBuWqCTNFKolcCB.jpg";

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
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    await Promise.reject(
      new Error(
        data.error ?? "Erreur lors de la récupération de l'utilisateur",
      ),
    );
  }
  // TODO: remove
  data.birthdate = new Date();
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

export async function signin(user) {
  const response = await fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
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

export async function editUser(id, user) {
  user = Object.fromEntries(
    Object.entries(user).filter(([_, v]) => v !== null),
  );
  const token = localStorage.getItem("token");
  const response = await fetch(`http://localhost:3000/api/user/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(user),
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
