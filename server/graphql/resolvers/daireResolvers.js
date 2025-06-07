// server/graphql/resolvers/daireResolvers.js
const DaireModel = require('../../models/Daire');
const SakinModel = require('../../models/Sakin');
const IkametModel = require('../../models/Ikamet');
const AidatModel = require('../../models/Aidat');
const BlokModel = require('../../models/Blok');
// mongoose importu transaction için gerekli değil
// const mongoose = require('mongoose');

const daireResolvers = {
  Query: {
    getDaireler: async (_, { blokId }) => {
      try {
        const filter = blokId ? { blok: blokId } : {};
        return await DaireModel.find(filter).populate('evSahibi').populate('blok');
      } catch (error) { throw new Error(`Daireler getirilemedi: ${error.message}`); }
    },
    getDaire: async (_, { id }) => { /* ... değişiklik yok ... */ },
  },
  Mutation: {
    createDaire: async (_, { input }) => {
      try {
        const { blok, daireNo, evSahibi, durum, kiraci } = input;

        const existingDaire = await DaireModel.findOne({ blok, daireNo });
        if (existingDaire) {
          const blokDoc = await BlokModel.findById(blok);
          throw new Error(`"${blokDoc.name}" bloğunda "${daireNo}" numaralı bir daire zaten mevcut.`);
        }
        
        const yeniDaire = new DaireModel(input);
        await yeniDaire.save();

        if (durum === 'Ev Sahibi Oturuyor') {
          const evSahibiIkamet = new IkametModel({ daire: yeniDaire._id, sakin: evSahibi, rol: 'Ev Sahibi' });
          await evSahibiIkamet.save();
        } else if (durum === 'Kiracı Oturuyor') {
          if (!kiraci) throw new Error("Kiracı seçilmeden ikamet durumu 'Kiracı Oturuyor' yapılamaz.");
          const kiraciIkamet = new IkametModel({ daire: yeniDaire._id, sakin: kiraci, rol: 'Kiracı' });
          await kiraciIkamet.save();
        }
        
        const result = await DaireModel.findById(yeniDaire._id).populate('evSahibi').populate('blok');
        return result;
      } catch (error) {
        throw new Error(error.message || "Daire oluşturulamadı.");
      }
    },
    updateDaire: async (_, { id, input }) => {
      try {
        const { durum, kiraci, ...daireInput } = input;
        
        const updatedDaire = await DaireModel.findByIdAndUpdate(id, daireInput, { new: true });
        if (!updatedDaire) throw new Error("Güncellenecek daire bulunamadı.");

        // Mevcut ikameti sonlandır
        await IkametModel.findOneAndUpdate(
          { daire: id, bitisTarihi: null },
          { bitisTarihi: new Date() }
        );

        // Yeni duruma göre yeni ikamet kaydı oluştur
        if (durum === 'Ev Sahibi Oturuyor') {
          await new IkametModel({ daire: id, sakin: updatedDaire.evSahibi, rol: 'Ev Sahibi' }).save();
        } else if (durum === 'Kiracı Oturuyor') {
          if (!kiraci) throw new Error("Kiracı seçilmeden ikamet durumu 'Kiracı Oturuyor' yapılamaz.");
          await new IkametModel({ daire: id, sakin: kiraci, rol: 'Kiracı' }).save();
        }

        return await DaireModel.findById(id).populate('evSahibi').populate('blok');
      } catch (error) {
        throw new Error(`Daire güncellenemedi: ${error.message}`);
      }
    },
    deleteDaire: async (_, { id }) => {
      try {
        await IkametModel.deleteMany({ daire: id });
        await AidatModel.deleteMany({ daire: id });
        const deletedDaire = await DaireModel.findByIdAndDelete(id);
        if (!deletedDaire) { throw new Error("Silinecek daire bulunamadı."); }
        return { success: true, message: "Daire ve bağlı tüm kayıtlar silindi.", id };
      } catch (error) {
        throw new Error(`Daire silinemedi: ${error.message}`);
      }
    },
  },
  Daire: { /* ... değişiklik yok ... */ }
};

module.exports = daireResolvers;