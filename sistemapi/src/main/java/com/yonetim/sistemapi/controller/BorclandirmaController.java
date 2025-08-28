package com.yonetim.sistemapi.controller;

import com.yonetim.sistemapi.model.AidatKaydi;
import com.yonetim.sistemapi.model.Daire;
import com.yonetim.sistemapi.model.FinansalIslem;
import com.yonetim.sistemapi.repository.AidatKaydiRepository;
import com.yonetim.sistemapi.repository.DaireRepository;
import com.yonetim.sistemapi.repository.FinansalIslemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/borclandirma")
public class BorclandirmaController {

    @Autowired
    private FinansalIslemRepository finansalIslemRepository;

    @Autowired
    private DaireRepository daireRepository;

    @Autowired
    private AidatKaydiRepository aidatKaydiRepository;

    /**
     * Olağanüstü bir gideri tüm dairelere borç olarak yansıtır.
     * @param giderIslemi Kasa hareketlerinden gelen gider bilgisi.
     * @return Başarılı olursa 201 Created döner.
     */
    @PostMapping("/olaganustu")
    public ResponseEntity<HttpStatus> olaganustuGiderYansit(@RequestBody FinansalIslem giderIslemi) {
        // 1. Gelen işlemi bir GİDER olarak kasaya kaydet.
        giderIslemi.setTip(FinansalIslem.IslemTipi.GIDER);
        finansalIslemRepository.save(giderIslemi);

        // 2. Sistemdeki tüm daireleri bul.
        List<Daire> tumDaireler = daireRepository.findAll();
        if (tumDaireler.isEmpty()) {
            // Daire yoksa işlem yapma.
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        // 3. Daire başına düşen borç tutarını hesapla (2 ondalık basamak hassasiyetiyle).
        BigDecimal daireSayisi = new BigDecimal(tumDaireler.size());
        BigDecimal daireBasinaBorc = giderIslemi.getTutar().divide(daireSayisi, 2, RoundingMode.HALF_UP);

        // 4. Her bir daire için yeni bir aidat/borç kaydı oluştur.
        List<AidatKaydi> yeniBorclar = new ArrayList<>();
        for (Daire daire : tumDaireler) {
            AidatKaydi borcKaydi = new AidatKaydi();
            borcKaydi.setDaireId(daire.getId());
            // Dönem olarak giderin açıklamasını kullanıyoruz, bu sayede "Çatı Tamiri Borcu" gibi görünür.
            borcKaydi.setDonem(giderIslemi.getAciklama());
            borcKaydi.setBorcTutari(daireBasinaBorc);
            borcKaydi.setOdendiMi(false);
            yeniBorclar.add(borcKaydi);
        }

        // 5. Oluşturulan tüm yeni borçları veritabanına tek seferde kaydet.
        aidatKaydiRepository.saveAll(yeniBorclar);

        return new ResponseEntity<>(HttpStatus.CREATED);
    }
}
