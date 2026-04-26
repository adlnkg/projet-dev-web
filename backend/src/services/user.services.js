/**
 * Get the user's role from the request, defaulting to "GUEST" if not authenticated.
 */
const getUserRole = (req) => {
  return req.user?.role ?? "GUEST";
};


export { getUserRole };