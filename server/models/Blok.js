// server/models/Blok.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blokSchema = new Schema({
  name: {
    type: String,
    required: true, // Blok adının girilmesi zorunlu
    trim: true,     // Başındaki ve sonundaki boşlukları temizler
    unique: true    // Her blok adının benzersiz olmasını sağlar (opsiyonel ama iyi bir pratik)
  },
  address: {
    type: String,
    trim: true,
    default: ''    // Adres girilmezse varsayılan olarak boş string olur
  },
  // İleride eklenebilecek diğer alanlar:
  // numberOfFloors: Number,
  // apartmentsPerFloor: Number,
  createdAt: {
    type: Date,
    default: Date.now // Kayıt oluşturulduğunda otomatik olarak tarih ekler
  }
});

// Şemadan bir model oluşturuyoruz.
// MongoDB'de 'bloks' adında bir koleksiyon oluşturacak (genellikle model adının çoğul ve küçük harfli hali).
const BlokModel = mongoose.model('Blok', blokSchema);

module.exports = BlokModel; // Modeli dışa aktarıyoruz