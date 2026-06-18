const express = require('express');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

/**
 * RATE LIMITING: Proteção contra força bruta
 * Máximo 5 tentativas de login a cada 15 minutos por IP
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 requisições por janela
  standardHeaders: true, 
  legacyHeaders: false,
  // O handler substitui o skip e captura o momento exato do bloqueio
  handler: (req, res, next, options) => {
    console.warn(`[SEGURANÇA] Tentativa de força bruta bloqueada do IP: ${req.ip}`);
    
    return res.status(429).json({
      error: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
    });
  },
});

/**
 * POST /api/login
 * Autenticação de usuário com email e senha
 * Retorna token JWT se credenciais válida
 */
router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // VALIDAÇÃO
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email e senha são obrigatórios',
      });
    }

    // Sanitização básica: trim e lowercase do email
    const sanitizedEmail = String(email).toLowerCase().trim();

    // Validação de formato de email
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return res.status(400).json({
        error: 'Formato de email inválido',
      });
    }

    // Validação de comprimento de senha
    if (typeof password !== 'string' || password.length < 1) {
      return res.status(400).json({
        error: 'Senha inválida',
      });
    }

    // BUSCA DO USUÁRIO
    // Usar select('+password')
    const user = await User.findOne({ email: sanitizedEmail }).select('+password');

    if (!user) {
      console.warn(`[LOGIN] Tentativa de login com email não registrado: ${sanitizedEmail}`);
      return res.status(401).json({
        error: 'Email ou senha incorretos',
      });
    }

    // Verificar se usuário está ativo
    if (!user.isActive) {
      console.warn(`[LOGIN] Tentativa de login com usuário inativo: ${sanitizedEmail}`);
      return res.status(403).json({
        error: 'Usuário desativado',
      });
    }

    
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      console.warn(`[LOGIN] Senha incorreta para email: ${sanitizedEmail}`);
      return res.status(401).json({
        error: 'Email ou senha incorretos',
      });
    }

    
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      process.env.JWT_SECRET || 'sua-chave-super-secreta',
      {
        expiresIn: process.env.JWT_EXPIRE || '7d',
      }
    );


    console.log(`[LOGIN] Usuário autenticado com sucesso: ${sanitizedEmail}`);

    res.status(200).json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[LOGIN] Erro ao processar login:', error.message);
    next(error);
  }
});

/**
 * POST /api/logout
 * Endpoint informativo (token é stateless, logout é client-side)
 */
router.post('/logout', (req, res) => {
  res.status(200).json({
    message: 'Logout realizado. Token descartado no cliente.',
  });
});

/**
 * POST /api/register
 * usuários devem ser inseridos no banco via seed/admin, essa rota só informa sobre o cadastro de usuários
 * 
 */
router.post('/register', (req, res) => {
  res.status(403).json({
    error: 'Cadastro de novos usuários não está disponível.',
  });
});

module.exports = router;
