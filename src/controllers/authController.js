const User = require('../models/User');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

exports.loginForm = (_req, res) => res.render('auth/login', { title: 'Iniciar sesión' });

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).render('auth/login', { errors: errors.array() });

  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await user.verifyPassword(password))) {
    return res.status(401).render('auth/login', { errors: [{ msg: 'Credenciales inválidas' }] });
  }
  req.session.userId = user._id.toString();
  res.redirect('/products');
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/auth/login'));
};

// Úsala UNA sola vez para crear el admin
exports.bootstrapAdmin = async (_req, res) => {
  const exists = await User.findOne({ username: 'admin' });
  if (exists) return res.send('Admin ya existe');
  const passwordHash = await bcrypt.hash('admin123', 10);
  await User.create({ username: 'admin', passwordHash });
  res.send('✅ Admin creado: admin / admin123');
};
