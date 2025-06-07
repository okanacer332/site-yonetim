// server/models/Sakin.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sakinSchema = new Schema({
  adSoyad: {
    type: String,
    required: [true, 'Ad ve soyad zorunludur.'],
    trim: true,
  },
  telefon: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  tcNo: {
    type: String,
    trim: true,
  },
  notlar: {
    type: String,
    trim: true,
  },
}, { 
  // timestamps: true, Mongoose'un otomatik olarak createdAt ve updatedAt
  // alanları eklemesini sağlar.
  timestamps: true 
});

const SakinModel = mongoose.model('Sakin', sakinSchema);

module.exports = SakinModel;