// server/graphql/resolvers/aidatResolvers.js
const AidatModel = require('../../models/Aidat');
const DaireModel = require('../../models/Daire');
const IkametModel = require('../../models/Ikamet');

const aidatResolvers = {
  Query: {
    getAidatlar: async (_, { donem, blokId, odemeDurumu }) => {
      try {
        const filter = {};
        if (donem) filter.donem = donem;
        if (odemeDurumu) filter.odemeDurumu = odemeDurumu;

        // Eğer blokId filtresi varsa, önce o bloktaki dairelerin ID'lerini bulmalıyız
        if (blokId) {
          const daireler = await DaireModel.find({ blok: blokId }).select('_id');
          const daireIds = daireler.map(d => d._id);
          filter.daire = { $in: daireIds };
        }

        return await AidatModel.find(filter)
          .populate({
            path: 'daire',
            populate: { path: 'blok evSahibi' }
          })
          .populate('borclu')
          .sort({ 'daire.blok.name': 1, 'daire.daireNo': 1 }); // Sıralama karmaşık olabilir, şimdilik basit tutalım

      } catch (error) {
        throw new Error("Aidatlar getirilemedi: " + error.message);
      }
    },
  },
  Mutation: {
    donemAidatiOlustur: async (_, { donem, tutar, sonOdemeTarihi }) => {
      try {
        // Bu dönem için daha önce aidat oluşturulmuş mu kontrol et
        const existingAidat = await AidatModel.findOne({ donem });
        if (existingAidat) {
          throw new Error(`"${donem}" dönemi için aidatlar zaten oluşturulmuş.`);
        }
        
        // Tüm daireleri getir
        const tumDaireler = await DaireModel.find();
        const yeniAidatKayitlari = [];

        for (const daire of tumDaireler) {
          let borcluId = daire.evSahibi; // Varsayılan borçlu ev sahibidir
          
          // Dairede o an oturan birini bul
          const mevcutIkamet = await IkametModel.findOne({ daire: daire.id, bitisTarihi: null });
          
          // Eğer oturan kişi kiracı ise, borçlu kiracıdır
          if (mevcutIkamet && mevcutIkamet.rol === 'Kiracı') {
            borcluId = mevcutIkamet.sakin;
          }

          yeniAidatKayitlari.push({
            daire: daire.id,
            borclu: borcluId,
            donem: donem,
            tutar: tutar,
            sonOdemeTarihi: new Date(sonOdemeTarihi),
          });
        }

        if (yeniAidatKayitlari.length === 0) {
          throw new Error("Aidat oluşturulacak kayıtlı daire bulunamadı.");
        }

        // Tüm yeni aidat kayıtlarını veritabanına tek seferde ekle
        const olusturulanAidatlar = await AidatModel.insertMany(yeniAidatKayitlari);
        return olusturulanAidatlar;

      } catch (error) {
        throw new Error("Dönem aidatı oluşturulamadı: " + error.message);
      }
    },
    aidatOdemesiYap: async (_, { aidatId, odemeTarihi }) => {
      try {
        const updatedAidat = await AidatModel.findByIdAndUpdate(
          aidatId,
          {
            odemeDurumu: 'Ödendi',
            odemeTarihi: new Date(odemeTarihi)
          },
          { new: true }
        ).populate({ path: 'daire', populate: { path: 'blok' } }).populate('borclu');

        if (!updatedAidat) {
          throw new Error("Ödeme yapılacak aidat kaydı bulunamadı.");
        }
        return updatedAidat;
      } catch (error) {
        throw new Error("Aidat ödemesi işlenemedi: " + error.message);
      }
    },
  },
};

module.exports = aidatResolvers;