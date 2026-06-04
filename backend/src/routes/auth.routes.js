const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { autenticar } = require('../middlewares/auth');

/**
 * @route   POST /api/auth/login
 * @desc    Autentica usuário e retorna token JWT
 * @access  Público
 */
router.post('/login', authController.login);

/**
 * @route   POST /api/auth/registro
 * @desc    Registra novo usuário (gestor ou voluntário)
 * @access  Público
 */
router.post('/registro', authController.registro);

/**
 * @route   GET /api/auth/me
 * @desc    Retorna dados do usuário autenticado
 * @access  Privado
 */
router.get('/me', autenticar, authController.me);

module.exports = router;
