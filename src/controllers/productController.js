const Product = require('../models/Product');
const { validationResult } = require('express-validator');
const logger = require('../config/logger');

exports.list = async (req, res) => {
  const productos = await Product.find().sort({ createdAt: -1 }). lean();
  res.render('products/list', { title: 'Productos', productos });
};

exports.newForm = (req, res) => res.render('products/form', { title: 'Nuevo producto' });

exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('products/form', {
      title: 'Nuevo producto',
      errors: errors.array(),
      product: req.body
    });
  }
  const imagen = req.file ? `/uploads/${req.file.filename}` : undefined;
  const nuevo = await Product.create({ ...req.body, imagen});
  logger.info(`Producto CREADO: "${nuevo.nombre}" (id: ${nuevo._id}) por usuario ${req.session.userId}`);
  res.redirect('/products');
};

exports.editForm = async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.render('products/form', { title: 'Editar producto', product, edit: true });
};

exports.update = async (req, res) => {
  const errors = validationResult(req);
  const product = await Product.findById(req.params.id);
  if (!errors.isEmpty()) {
    return res.status(422).render('products/form', {
      title: 'Editar producto',
      errors: errors.array(),
      product: { ...product.toObject(), ...req.body }
    });
  }
  if (req.file) req.body.imagen = `/uploads/${req.file.filename}`;
  await Product.findByIdAndUpdate(req.params.id, req.body, { runValidators: true });
  res.redirect('/products');
};

exports.remove = async (req, res) => {
  const eliminado = await Product.findByIdAndDelete(req.params.id);
  logger.info(`Producto ELIMINADO: "${eliminado?.nombre}" (id: ${req.params.id}) por usuario ${req.session.userId}`);
  res.redirect('/products');
};
