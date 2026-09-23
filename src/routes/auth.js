const router = require('express').Router();
const { loginForm, login, logout, bootstrapAdmin } = require('../controllers/authController');
const { loginRules } = require('../middleware/validators');

router.get('/login', loginForm);
router.post('/login', loginRules, login);
router.post('/logout', logout);
//router.get('/bootstrap-admin', bootstrapAdmin); // Desactivada por seguridad: creaba un admin desde una URL pública. El admin ya fue creado.

module.exports = router;
