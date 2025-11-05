const { Schema, model } = require('mongoose');

const productSchema = new Schema({
  nombre: { type: String, required: true, trim: true },
  precio: { type: Number, required: true, min: 0 },
  descripcion: { type: String, trim: true },
  imagen: { type: String }
}, { timestamps: true });

module.exports = model('Product', productSchema);
