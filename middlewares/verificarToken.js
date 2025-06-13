// middlewares/verificarToken.js

const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ mensaje: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    res.status(400).json({ mensaje: 'Token inválido.' });
  }
}

module.exports = verificarToken;
