const jwt = require('jsonwebtoken');

/**
 * Middleware de Autenticação JWT
 * Valida o token JWT e anexa os dados do usuário ao req.user
 * Uso: router.post('/protected-route', requireAuth, controllerFunction
 */
const requireAuth = (req, res, next) => {
  try {
    // Extrair token do header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token não fornecido ou formato inválido. Use: Authorization: Bearer <token>',
      });
    }

    const token = authHeader.slice(7); // Remove "Bearer " (7 caracteres)

    // Verificar e decodificar o token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'sua-chave-super-secreta'
    );

    // Anexar dados do usuário ao request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido',
      });
    }

    console.error('[AUTH] Erro ao validar token:', error.message);
    res.status(500).json({
      error: 'Erro ao validar autenticação',
    });
  }
};

module.exports = requireAuth;
