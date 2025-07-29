const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const token = req.header('Authorization');

  if (!token || !token.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'Token inválido o mal formado.' });
  }

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    req.usuarioId = decoded.id; // ✅ solo lo necesario
    //console.log('Middleware: usuarioId obtenido', req.usuarioId);
    next();
  } catch (error) {
    //console.error('❌ Error al verificar token:', error.message);
    res.status(401).json({ mensaje: 'Token inválido.' });
  }
}

module.exports = verificarToken;
