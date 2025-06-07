// server/models/Ikamet.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ikametSchema = new Schema({
  daire: {
    type: Schema.Types.ObjectId,
    ref: 'Daire',
    required: true,
  },
  sakin: {
    type: Schema.Types.ObjectId,
    ref: 'Sakin',
    required: true,
  },
  rol: {
    type: String,
    required: true,
    enum: ['Ev Sahibi', 'Kiracı'],
  },
  baslangicTarihi: {
    type: Date,
    required: true,
    default: Date.now,
  },
  // Bu tarih boş (null) ise, kişi hala o dairede oturuyor demektir.
  bitisTarihi: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

// Bir dairede aynı anda sadece bir kişinin ikamet etmesini sağlar
// (bitisTarihi null olan sadece 1 kayıt olabilir)
ikametSchema.index({ daire: 1, bitisTarihi: 1 });

const IkametModel = mongoose.model('Ikamet', ikametSchema);

module.exports = IkametModel;