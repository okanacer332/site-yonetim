package com.yonetim.sistemapi.controller;

import com.yonetim.sistemapi.model.FinansalIslem;
import com.yonetim.sistemapi.repository.FinansalIslemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin
@RequestMapping("/kasa-hareketleri")
public class FinansalIslemController {

    @Autowired
    private FinansalIslemRepository finansalIslemRepository;

    @GetMapping
    public ResponseEntity<List<FinansalIslem>> tumIslemleriGetir(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate baslangicTarihi,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate bitisTarihi) {

        List<FinansalIslem> islemler;
        if (baslangicTarihi != null && bitisTarihi != null) {
            islemler = finansalIslemRepository.findByTarihBetween(baslangicTarihi, bitisTarihi);
        } else {
            islemler = finansalIslemRepository.findAll();
        }
        return new ResponseEntity<>(islemler, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<FinansalIslem> yeniIslemEkle(@RequestBody FinansalIslem yeniIslem) {
        FinansalIslem kaydedilenIslem = finansalIslemRepository.save(yeniIslem);
        return new ResponseEntity<>(kaydedilenIslem, HttpStatus.CREATED);
    }

    // GÜNCELLEME 1: YENİ İPTAL METODU
    /**
     * Bir finansal işlemi kalıcı olarak silmek yerine iptal eder.
     * Bu işlem, orijinal kaydı 'iptal edildi' olarak işaretler ve
     * orijinal işlemin tam tersi (storno) yeni bir düzeltme kaydı oluşturur.
     * Bu, tam bir denetim izi (audit trail) sağlar.
     * @param id İptal edilecek işlemin ID'si.
     * @return Güncellenmiş orijinal işlem.
     */
    @PostMapping("/{id}/iptal")
    public ResponseEntity<FinansalIslem> islemIptalEt(@PathVariable String id) {
        Optional<FinansalIslem> islemData = finansalIslemRepository.findById(id);

        if (islemData.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        FinansalIslem orijinalIslem = islemData.get();

        // Eğer işlem zaten iptal edilmişse, tekrar iptal etme.
        if (orijinalIslem.isIptalEdildi()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST); // Veya uygun bir hata kodu
        }

        // 1. Ters kaydı oluştur
        FinansalIslem tersKayit = new FinansalIslem();
        tersKayit.setTutar(orijinalIslem.getTutar());
        tersKayit.setTarih(LocalDate.now());
        tersKayit.setDaireId(orijinalIslem.getDaireId());
        tersKayit.setBlokId(orijinalIslem.getBlokId());
        tersKayit.setKategori("İptal/Düzeltme");
        tersKayit.setAciklama(String.format("[İPTAL] #%s ID'li işlemin düzeltme kaydı.", orijinalIslem.getId()));

        // İşlem tipini tersine çevir (GELIR -> GIDER, GIDER -> GELIR)
        tersKayit.setTip(orijinalIslem.getTip() == FinansalIslem.IslemTipi.GELIR ? FinansalIslem.IslemTipi.GIDER : FinansalIslem.IslemTipi.GELIR);

        FinansalIslem kaydedilenTersKayit = finansalIslemRepository.save(tersKayit);

        // 2. Orijinal kaydı güncelle
        orijinalIslem.setIptalEdildi(true);
        orijinalIslem.setDuzeltmeKaydiId(kaydedilenTersKayit.getId());

        FinansalIslem guncellenmisOrijinalIslem = finansalIslemRepository.save(orijinalIslem);

        return new ResponseEntity<>(guncellenmisOrijinalIslem, HttpStatus.OK);
    }


    @PutMapping("/{id}")
    public ResponseEntity<FinansalIslem> islemGuncelle(@PathVariable String id, @RequestBody FinansalIslem islemDetaylari) {
        Optional<FinansalIslem> islemData = finansalIslemRepository.findById(id);

        if (islemData.isPresent()) {
            FinansalIslem mevcutIslem = islemData.get();
            mevcutIslem.setTip(islemDetaylari.getTip());
            mevcutIslem.setAciklama(islemDetaylari.getAciklama());
            mevcutIslem.setTutar(islemDetaylari.getTutar());
            mevcutIslem.setTarih(islemDetaylari.getTarih());
            mevcutIslem.setDaireId(islemDetaylari.getDaireId());
            mevcutIslem.setBlokId(islemDetaylari.getBlokId());
            mevcutIslem.setKategori(islemDetaylari.getKategori());
            return new ResponseEntity<>(finansalIslemRepository.save(mevcutIslem), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}