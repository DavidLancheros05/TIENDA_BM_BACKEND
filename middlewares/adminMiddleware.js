const verificarAdmin = (req, res, next) => {
  if (!req.usuario) return res.status(401).json({ msg: 'No autorizado, falta token' });

  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ msg: 'Acceso denegado, solo admin' });
  }

  next();
};

module.exports = verificarAdmin;
