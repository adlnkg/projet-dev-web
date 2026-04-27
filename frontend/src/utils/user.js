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
  { label: "Homme", value: "male" },
  { label: "Femme", value: "female" },
  { label: "Autre", value: "other" },
];

export async function fetchUser() {
  // TODO: only for dev
  await wait(1000);
  return {
    pseudo: "polnio",
    email: "paul.lagrange@etu.cyu.fr",
    firstname: "Paul",
    lastname: "Lagrange",
    birthdate: new Date("2005-07-07"),
    gender: "male",
    avatar: DEFAULT_AVATAR,
  };
}

export async function login(pseudo, password) {
  // TODO: only for dev
  const user = await fetchUser();
  if (pseudo === "polnio" && password === "changeme") {
    return user;
  } else {
    await Promise.reject(new Error("Identifiant ou mot de passe incorrect"));
  }
}

export async function signin(user) {
  console.log(user);
}
