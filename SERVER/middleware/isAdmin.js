module.exports = (req, res, next) => {
  const roles = Array.isArray(req.user?.roles)
    ? req.user.roles
    : [req.user?.roles];

  if (!roles.includes("admin")) {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
};
