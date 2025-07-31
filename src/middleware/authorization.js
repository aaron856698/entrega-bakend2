export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ error: "Acceso denegado. Se requiere rol de administrador." });
    }
};

export const isUser = (req, res, next) => {
    if (req.user && req.user.role === "user") {
        next();
    } else {
        res.status(403).json({ error: "Acceso denegado. Se requiere rol de usuario." });
    }
};

export const isOwnerOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === "admin" || req.user._id.toString() === req.params.id)) {
        next();
    } else {
        res.status(403).json({ error: "Acceso denegado." });
    }
}; 