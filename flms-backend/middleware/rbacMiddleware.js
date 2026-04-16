const authorize = (category, action) => {
  return (req, res, next) => {
    const userPermissions = req.user.permissions;

    if (req.user.role === 'admin') {
      return next();
    }

    if (!userPermissions || !userPermissions[category] || !userPermissions[category].includes(action)) {
      return res.status(403).json({
        message: `ليس لديك صلاحية ${action} في قسم ${category}`
      });
    }

    next();
  };
};

module.exports = authorize;
