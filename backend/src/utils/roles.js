import { ROLE_HIERARCHY } from "./constants.js";

/**  
 * Get the full role chain for a given role, starting from the specified role up to the base role (USER).
 * For example, for "ADMIN", it will return ["GUEST", "USER", "SUPER_USER", "ADMIN"].
 * This is used to determine all the permissions that a role inherits from its parent roles.
 * @param {string} role - The role for which to get the chain (e.g., "USER", "SUPER_USER", "ADMIN").
 * @return {string[]} An array of roles in the chain, ordered from the base role to the specified role.
 * @throws {Error} If the provided role is not recognized in the hierarchy.
 */
export const getRoleChain = (role) => {
    const chain = [];
    if (!ROLE_HIERARCHY.hasOwnProperty(role)) {
        throw new Error(`Rôle inconnu: ${role}`);
    }
    let currentRole = role;

    while (currentRole) {
        chain.push(currentRole);
        currentRole = ROLE_HIERARCHY[currentRole];
    }

    return chain.reverse();
};
