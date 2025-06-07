// server/models/Daire.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const daireSchema = new Schema({
  blok: {
    type: Schema.Types.ObjectId,
    ref: 'Blok',
    required: [true, 'Dairenin ait olduğu blok belirtilmelidir.'],
  },
  daireNo: {
    type: String,
    required: [true, 'Daire numarası zorunludur.'],
    trim: true,
  },
  kat: {
    type: Number,
    required: [true, 'Kat numarası zorunludur.'],
  },
  // YENİ ALAN: Dairenin tapu sahibini belirtir. Bu bir 'Sakin' referansıdır.
  evSahibi: {
    type: Schema.Types.ObjectId,
    ref: 'Sakin',
    required: [true, 'Her dairenin bir mal sahibi olmalıdır.'],
  },
  // ESKİ ALANLAR KALDIRILDI: durum, sakinAdiSoyadi, sakinTelefonu, createdAt
}, { 
  timestamps: true // createdAt ve updatedAt alanlarını otomatik ekler
});

// Bir blok içinde aynı daire numarasının olmasını engeller.
daireSchema.index({ blok: 1, daireNo: 1 }, { unique: true });

const DaireModel = mongoose.model('Daire', daireSchema);

module.exports = DaireModel;