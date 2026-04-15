/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
    avatar:
      "https://as2.ftcdn.net/jpg/02/44/42/79/1000_F_244427911_aoHHulebtYy4wLpncBBuWqCTNFKolcCB.jpg",
  };
}
