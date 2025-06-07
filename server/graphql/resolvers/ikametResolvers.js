// server/graphql/resolvers/ikametResolvers.js
const IkametModel = require('../../models/Ikamet');
const DaireModel = require('../../models/Daire');
const SakinModel = require('../../models/Sakin');
const mongoose = require('mongoose');

const ikametResolvers = {
  Query: {
    getIkametGecmisi: async (_, { daireId }) => {
      try {
        // Belirli bir dairenin tüm geçmiş ve mevcut ikamet kayıtlarını getir,
        // en yeniden eskiye doğru sırala.
        return await IkametModel.find({ daire: daireId })
          .populate('sakin')
          .populate({
            path: 'daire',
            populate: { path: 'blok evSahibi' } // Dairenin de içindeki referansları doldur
          })
          .sort({ baslangicTarihi: -1 });
      } catch (error) {
        throw new Error("İkamet geçmişi getirilemedi: " + error.message);
      }
    },
  },
  Mutation: {
    yerlesimEkle: async (_, { daireId, sakinId, rol }) => {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        // Gerekli belgelerin varlığını kontrol et
        const daire = await DaireModel.findById(daireId).session(session);
        if (!daire) throw new Error("Daire bulunamadı.");
        
        const sakin = await SakinModel.findById(sakinId).session(session);
        if (!sakin) throw new Error("Sakin bulunamadı.");
        
        // Eğer bu dairede hala oturan biri varsa (bitisTarihi null olan),
        // onun kaydını sonlandır (taşınmış yap).
        const simdi = new Date();
        await IkametModel.findOneAndUpdate(
          { daire: daireId, bitisTarihi: null },
          { bitisTarihi: simdi },
          { session }
        );

        // Yeni ikamet kaydını oluştur
        const yeniIkamet = new IkametModel({
          daire: daireId,
          sakin: sakinId,
          rol: rol,
          baslangicTarihi: simdi,
          bitisTarihi: null, // Yeni kayıt olduğu için bitiş tarihi boş
        });
        await yeniIkamet.save({ session });
        
        await session.commitTransaction();

        await yeniIkamet.populate('sakin daire');
        return yeniIkamet;
      } catch (error) {
        await session.abortTransaction();
        throw new Error("Yerleşim eklenemedi: " + error.message);
      } finally {
        session.endSession();
      }
    },
    yerlesimBitir: async (_, { ikametId, bitisTarihi }) => {
      try {
        const updatedIkamet = await IkametModel.findByIdAndUpdate(
          ikametId,
          { bitisTarihi: new Date(bitisTarihi) },
          { new: true }
        ).populate('sakin daire');

        if (!updatedIkamet) {
          throw new Error("Sonlandırılacak ikamet kaydı bulunamadı.");
        }

        return updatedIkamet;
      } catch (error) {
        throw new Error("Yerleşim sonlandırılamadı: " + error.message);
      }
    }
  },
};

module.exports = ikametResolvers;