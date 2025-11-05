const router = require('express').Router();
const { ensureAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { productRules } = require('../middleware/validators');
const ctrl = require('../controllers/productController');

router.use(ensureAuth);
router.get('/', ctrl.list);
router.get('/new', ctrl.newForm);
router.post('/', upload.single('imagen'), productRules, ctrl.create);
router.get('/:id/edit', ctrl.editForm);
router.post('/:id', upload.single('imagen'), productRules, ctrl.update);
router.post('/:id/delete', ctrl.remove);

module.exports = router;
