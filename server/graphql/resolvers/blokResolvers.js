// server/graphql/resolvers/blokResolvers.js
const BlokModel = require('../../models/Blok');
const DaireModel = require('../../models/Daire');
const IkametModel = require('../../models/Ikamet');
const AidatModel = require('../../models/Aidat');

const blokResolvers = {
  Query: {
    getBloks: async () => {
      try {
        return await BlokModel.find().sort({ createdAt: -1 });
      } catch (error) { throw new Error("Bloklar getirilemedi."); }
    },
  },
  Mutation: {
    createBlok: async (_, { name }) => {
      try {
        const yeniBlok = new BlokModel({ name, createdAt: new Date() });
        await yeniBlok.save();
        return yeniBlok;
      } catch (error) {
        if (error.code === 11000) { throw new Error("Bu isimde bir blok zaten mevcut."); }
        throw new Error("Blok oluşturulamadı.");
      }
    },
    updateBlok: async (_, { id, name }) => {
      try {
        const existingBlokWithNewName = await BlokModel.findOne({ name: name, _id: { $ne: id } });
        if (existingBlokWithNewName) { throw new Error("Bu isimde başka bir blok zaten mevcut."); }
        const updatedBlok = await BlokModel.findByIdAndUpdate(id, { name }, { new: true });
        if (!updatedBlok) { throw new Error("Güncellenecek blok bulunamadı."); }
        return updatedBlok;
      } catch (error) { throw new Error("Blok güncellenemedi."); }
    },
    deleteBlok: async (_, { id }) => {
      try {
        const daireler = await DaireModel.find({ blok: id }).select('_id');
        const daireIds = daireler.map(d => d._id);

        if (daireIds.length > 0) {
          await IkametModel.deleteMany({ daire: { $in: daireIds } });
          await AidatModel.deleteMany({ daire: { $in: daireIds } });
        }
        
        await DaireModel.deleteMany({ blok: id });
        const deletedBlok = await BlokModel.findByIdAndDelete(id);
        if (!deletedBlok) {
          return { success: false, message: "Silinecek blok bulunamadı.", id: id };
        }
        return { success: true, message: `"${deletedBlok.name}" bloğu ve bağlı tüm kayıtlar başarıyla silindi.`, id: deletedBlok.id };
      } catch (error) {
        console.error("Blok silinirken hata:", error);
        return { success: false, message: "Blok silinirken bir hata oluştu.", id: id };
      }
    }
  },
};

module.exports = blokResolvers;