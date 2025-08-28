package com.yonetim.sistemapi.controller;

import com.yonetim.sistemapi.model.FinansalIslem;
import com.yonetim.sistemapi.repository.FinansalIslemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin
@RequestMapping("/kasa-hareketleri") // Endpoint adını daha anlaşılır hale getirelim
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
            mevcutIslem.setBlokId(islemDetaylari.getBlokId()); // Yeni alanı ekledik
            mevcutIslem.setKategori(islemDetaylari.getKategori());
            return new ResponseEntity<>(finansalIslemRepository.save(mevcutIslem), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> islemSil(@PathVariable String id) {
        try {
            finansalIslemRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
