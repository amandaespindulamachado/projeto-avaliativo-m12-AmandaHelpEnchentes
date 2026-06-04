const express = require('express');
const router = express.Router();
const voluntariosController = require('../controllers/voluntarios.controller');
const { autenticar, autorizar } = require('../middlewares/auth');

// Rotas públicas
router.get('/', voluntariosController.listar);
router.get('/:id', voluntariosController.buscarPorId);

// Rotas privadas
router.post('/', voluntariosController.criar); // Qualquer um pode se cadastrar como voluntário
router.put('/:id', autenticar, autorizar('gestor', 'voluntario'), voluntariosController.atualizar);
router.patch('/:id/alocar', autenticar, autorizar('gestor'), voluntariosController.alocar);
router.delete('/:id', autenticar, autorizar('gestor'), voluntariosController.remover);

module.exports = router;
