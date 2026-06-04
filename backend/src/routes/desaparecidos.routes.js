const express = require('express');
const router = express.Router();
const desaparecidosController = require('../controllers/desaparecidos.controller');
const { autenticar, autorizar } = require('../middlewares/auth');

// Rotas públicas
router.get('/', desaparecidosController.listar);
router.get('/:id', desaparecidosController.buscarPorId);

// Qualquer pessoa pode registrar um desaparecido (situação de emergência)
router.post('/', desaparecidosController.criar);

// Rotas privadas (atualização e remoção)
router.put('/:id', autenticar, autorizar('gestor', 'voluntario'), desaparecidosController.atualizar);
router.patch('/:id/status', autenticar, autorizar('gestor', 'voluntario'), desaparecidosController.atualizarStatus);
router.delete('/:id', autenticar, autorizar('gestor'), desaparecidosController.remover);

module.exports = router;
