const router = require('express').Router();
router.get('/', (_req, res) => res.redirect('/products'));
module.exports = router;
