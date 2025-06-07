// server/graphql/resolvers/sakinResolvers.js
const SakinModel = require('../../models/Sakin');
const DaireModel = require('../../models/Daire');

const sakinResolvers = {
  Query: {
    getSakinler: async () => {
      try {
        return await SakinModel.find().sort({ adSoyad: 1 });
      } catch (error) {
        throw new Error("Sakinler getirilemedi.");
      }
    },
    getSakin: async (_, { id }) => {
      try {
        const sakin = await SakinModel.findById(id);
        if (!sakin) { throw new Error("Sakin bulunamadı."); }
        return sakin;
      } catch (error) {
        throw new Error("Sakin getirilemedi.");
      }
    },
  },
  Mutation: {
    createSakin: async (_, { input }) => {
      try {
        const yeniSakin = new SakinModel(input);
        await yeniSakin.save();
        return yeniSakin;
      } catch (error) {
        throw new Error("Sakin oluşturulamadı.");
      }
    },
    updateSakin: async (_, { id, input }) => {
      try {
        const updatedSakin = await SakinModel.findByIdAndUpdate(id, input, { new: true });
        if (!updatedSakin) { throw new Error("Güncellenecek sakin bulunamadı."); }
        return updatedSakin;
      } catch (error) {
        throw new Error("Sakin güncellenemedi.");
      }
    },
    deleteSakin: async (_, { id }) => {
      try {
        // Kontrol: Bu kişi bir dairenin mal sahibi mi?
        const daire = await DaireModel.findOne({ evSahibi: id });
        if (daire) {
          throw new Error("Bu kişi bir dairenin mal sahibi olduğu için silinemez. Önce dairenin sahibini değiştirin veya daireyi silin.");
        }
        // İleride bu kişinin kiracı olduğu veya borcu olduğu da kontrol edilebilir.
        
        const deletedSakin = await SakinModel.findByIdAndDelete(id);
        if (!deletedSakin) {
          throw new Error("Silinecek sakin bulunamadı.");
        }
        return { success: true, message: `"${deletedSakin.adSoyad}" kişisi başarıyla silindi.`, id };
      } catch (error) {
        throw new Error(error.message || "Sakin silinemedi.");
      }
    }
  },
};

module.exports = sakinResolvers;