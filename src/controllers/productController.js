const Product = require('../models/Product');
const { validationResult } = require('express-validator');

exports.list = async (req, res) => {
  const productos = await Product.find().sort({ createdAt: -1 });
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
  await Product.create({ ...req.body, imagen });
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
  await Product.findByIdAndDelete(req.params.id);
  res.redirect('/products');
};
