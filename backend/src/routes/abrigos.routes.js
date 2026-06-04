const express = require('express');
const router = express.Router();
const abrigosController = require('../controllers/abrigos.controller');
const { autenticar, autorizar } = require('../middlewares/auth');

// Rotas públicas (consulta)
router.get('/', abrigosController.listar);
router.get('/:id', abrigosController.buscarPorId);

// Rotas privadas (gestão)
router.post('/', autenticar, autorizar('gestor', 'voluntario'), abrigosController.criar);
router.put('/:id', autenticar, autorizar('gestor', 'voluntario'), abrigosController.atualizar);
router.patch('/:id/ocupacao', autenticar, autorizar('gestor', 'voluntario'), abrigosController.atualizarOcupacao);
router.delete('/:id', autenticar, autorizar('gestor'), abrigosController.remover);

module.exports = router;
