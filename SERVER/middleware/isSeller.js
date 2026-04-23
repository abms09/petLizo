module.exports = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const roles = Array.isArray(req.user.roles)
    ? req.user.roles
    : [req.user.roles];

  if (!roles.includes("seller")) {
    return res.status(403).json({ message: "Seller access required" });
  }

  next();
};
