const router = require('express').Router();
const { ensureAuth } = require('../middleware/auth');
router.get('/', ensureAuth, (_req, res) => res.render('chat', { title: 'Chat' }));
module.exports = router;
