const router = require('express').Router();
const { loginForm, login, logout, bootstrapAdmin } = require('../controllers/authController');
const { loginRules } = require('../middleware/validators');

router.get('/login', loginForm);
router.post('/login', loginRules, login);
router.post('/logout', logout);
router.get('/bootstrap-admin', bootstrapAdmin); // luego puedes comentarla

module.exports = router;
