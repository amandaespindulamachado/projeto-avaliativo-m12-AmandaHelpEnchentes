const express = require('express');
const router = express.Router();
const doacoesController = require('../controllers/doacoes.controller');
const { autenticar, autorizar } = require('../middlewares/auth');

// Rotas públicas
router.get('/', doacoesController.listar);
router.get('/:id', doacoesController.buscarPorId);

// Rotas privadas
router.post('/', autenticar, autorizar('gestor', 'voluntario'), doacoesController.criar);
router.put('/:id', autenticar, autorizar('gestor', 'voluntario'), doacoesController.atualizar);
router.patch('/:id/receber', autenticar, autorizar('gestor', 'voluntario'), doacoesController.registrarRecebimento);
router.delete('/:id', autenticar, autorizar('gestor'), doacoesController.remover);

module.exports = router;
