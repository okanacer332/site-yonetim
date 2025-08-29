package com.yonetim.sistemapi.controller;

import com.yonetim.sistemapi.model.AidatKaydi;
import com.yonetim.sistemapi.model.Blok;
import com.yonetim.sistemapi.model.Daire;
import com.yonetim.sistemapi.model.FinansalIslem;
import com.yonetim.sistemapi.repository.AidatKaydiRepository;
import com.yonetim.sistemapi.repository.BlokRepository;
import com.yonetim.sistemapi.repository.DaireRepository;
import com.yonetim.sistemapi.repository.FinansalIslemRepository;
import com.yonetim.sistemapi.service.TopluBorclandirmaService; // GÜNCELLEME 1: Yeni servisi import ediyoruz.
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin
@RequestMapping("/aidatlar")
public class AidatController {

    @Autowired
    private AidatKaydiRepository aidatKaydiRepository;

    @Autowired
    private DaireRepository daireRepository;

    @Autowired
    private BlokRepository blokRepository;

    @Autowired
    private FinansalIslemRepository finansalIslemRepository;

    // GÜNCELLEME 2: Yeni asenkron servisimizi buraya enjekte ediyoruz.
    @Autowired
    private TopluBorclandirmaService topluBorclandirmaService;

    @GetMapping
    public ResponseEntity<List<AidatKaydi>> donemeGoreAidatlariGetir(@RequestParam String donem) {
        return new ResponseEntity<>(aidatKaydiRepository.findByDonem(donem), HttpStatus.OK);
    }

    @GetMapping("/daire/{daireId}")
    public ResponseEntity<List<AidatKaydi>> daireyeGoreAidatlariGetir(@PathVariable String daireId) {
        return new ResponseEntity<>(aidatKaydiRepository.findByDaireId(daireId), HttpStatus.OK);
    }

    // GÜNCELLEME 3: Metodun içini tamamen değiştiriyoruz.
    @PostMapping("/toplu-borc-olustur")
    public ResponseEntity<HttpStatus> topluAidatBorcuOlustur(@RequestParam String donem, @RequestParam BigDecimal tutar) {
        // Artık ağır veritabanı işlemini burada yapmıyoruz.
        // İşi asenkron servisimize devrediyoruz.
        topluBorclandirmaService.aidatBorcuOlusturAsync(donem, tutar);

        // Kullanıcıyı bekletmeden "İsteğiniz kabul edildi ve işleme alındı"
        // anlamına gelen 202 (ACCEPTED) durum kodunu dönüyoruz.
        return new ResponseEntity<>(HttpStatus.ACCEPTED);
    }

    /**
     * Bir aidat borcunu "Ödendi" olarak işaretler ve kasaya AÇIKLAYICI bir gelir kaydı işler.
     * @param aidatId Ödendi olarak işaretlenecek aidat kaydının ID'si.
     * @return Güncellenmiş aidat kaydı.
     */
    @PostMapping("/{aidatId}/odeme-yap")
    public ResponseEntity<AidatKaydi> odemeAl(@PathVariable String aidatId) {
        // ... (bu metodun içeriği aynı kalıyor)
        Optional<AidatKaydi> aidatData = aidatKaydiRepository.findById(aidatId);
        if (aidatData.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        AidatKaydi aidatKaydi = aidatData.get();
        if (aidatKaydi.isOdendiMi()) {
            return new ResponseEntity<>(aidatKaydi, HttpStatus.OK);
        }

        aidatKaydi.setOdendiMi(true);
        aidatKaydi.setOdemeTarihi(LocalDate.now());
        AidatKaydi guncellenmisAidat = aidatKaydiRepository.save(aidatKaydi);

        Optional<Daire> daireData = daireRepository.findById(aidatKaydi.getDaireId());
        if (daireData.isEmpty()) {
            FinansalIslem basitGelir = new FinansalIslem();
            basitGelir.setAciklama(aidatKaydi.getDonem() + " aidat ödemesi");
            finansalIslemRepository.save(basitGelir);
            return new ResponseEntity<>(guncellenmisAidat, HttpStatus.OK);
        }

        Daire daire = daireData.get();
        Optional<Blok> blokData = blokRepository.findById(daire.getBlokId());
        String blokAdi = blokData.map(Blok::getAd).orElse("");

        String oturanKisi = daire.getDurum() == Daire.DaireDurumu.KIRACI && daire.getKiraciAdi() != null && !daire.getKiraciAdi().isEmpty()
                ? daire.getKiraciAdi()
                : daire.getMulkSahibiAdi();

        String aciklama = String.format("%s - Daire %d (%s) - %s aidatı",
                blokAdi, daire.getKapiNo(), oturanKisi, aidatKaydi.getDonem());

        FinansalIslem gelirIslemi = new FinansalIslem();
        gelirIslemi.setTip(FinansalIslem.IslemTipi.GELIR);
        gelirIslemi.setAciklama(aciklama);
        gelirIslemi.setTutar(aidatKaydi.getBorcTutari());
        gelirIslemi.setTarih(LocalDate.now());
        gelirIslemi.setDaireId(aidatKaydi.getDaireId());
        gelirIslemi.setKategori("Aidat");
        finansalIslemRepository.save(gelirIslemi);

        return new ResponseEntity<>(guncellenmisAidat, HttpStatus.OK);
    }
}