const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
  username: { type: String, required: true, unique: true, trim: true },
  passwordHash: { type: String, required: true }
});

userSchema.methods.verifyPassword = function (pwd) {
  return bcrypt.compare(pwd, this.passwordHash);
};

module.exports = model('User', userSchema);
