// server/models/Aidat.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const aidatSchema = new Schema({
  daire: {
    type: Schema.Types.ObjectId,
    ref: 'Daire',
    required: true,
  },
  // O ayki borçtan sorumlu olan 'Sakin' referansı
  borclu: {
    type: Schema.Types.ObjectId,
    ref: 'Sakin',
    required: true,
  },
  donem: {
    type: String, // Örn: "Haziran 2025"
    required: true,
  },
  tutar: {
    type: Number,
    required: true,
  },
  sonOdemeTarihi: {
    type: Date,
    required: true,
  },
  odemeDurumu: {
    type: String,
    enum: ['Ödenmedi', 'Ödendi', 'Geç Ödendi', 'Kısmi Ödendi'],
    default: 'Ödenmedi',
  },
  odemeTarihi: {
    type: Date,
  },
  aciklama: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

// Bir dairenin aynı dönem için birden fazla aidat borcu olmasını engeller
aidatSchema.index({ daire: 1, donem: 1 }, { unique: true });

const AidatModel = mongoose.model('Aidat', aidatSchema);

module.exports = AidatModel;