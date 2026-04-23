const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userRoles = (req.user.roles || []).map((r) => r.toLowerCase().trim());

    const allowed = allowedRoles.map((r) => r.toLowerCase().trim());

    const hasRole = userRoles.some((r) => allowed.includes(r));

    console.log("USER ROLES:", userRoles);
    console.log("ALLOWED ROLES:", allowed);
    console.log("HAS ROLE:", hasRole);

    if (!hasRole) {
      return res.status(403).json({ message: "Admin access required" });
    }

    next();
  };
};

module.exports = authorizeRoles;
