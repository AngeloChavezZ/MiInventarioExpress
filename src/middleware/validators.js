const { body } = require('express-validator');

const productRules = [
  body('nombre').notEmpty().withMessage('Nombre requerido'),
  body('precio').isFloat({ gt: -0.00001 }).withMessage('Precio inválido'),
  body('descripcion').optional().isLength({ max: 500 }).withMessage('Máx 500 caracteres')
];

const loginRules = [
  body('username').notEmpty().withMessage('Usuario requerido'),
  body('password').notEmpty().withMessage('Contraseña requerida')
];

module.exports = { productRules, loginRules };
