package com.yonetim.sistemapi.controller;

import com.yonetim.sistemapi.model.Daire;
import com.yonetim.sistemapi.repository.BlokRepository;
import com.yonetim.sistemapi.repository.DaireRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin
@RequestMapping("/daireler")
public class DaireController {

    @Autowired
    private DaireRepository daireRepository;

    @Autowired
    private BlokRepository blokRepository;

    @GetMapping
    public ResponseEntity<List<Daire>> tumDaireleriGetir(@RequestParam(required = false) String blokId) {
        List<Daire> daireler;
        if (blokId != null && !blokId.isEmpty()) {
            daireler = daireRepository.findByBlokId(blokId);
        } else {
            daireler = daireRepository.findAll();
        }
        return new ResponseEntity<>(daireler, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Daire> yeniDaireEkle(@RequestBody Daire yeniDaire) {
        if (!blokRepository.existsById(yeniDaire.getBlokId())) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        Daire kaydedilenDaire = daireRepository.save(yeniDaire);
        return new ResponseEntity<>(kaydedilenDaire, HttpStatus.CREATED);
    }

    /**
     * Mevcut bir daireyi günceller. (GÜNCELLENMİŞ METOD)
     * @param id Güncellenecek dairenin ID'si.
     * @param daireDetaylari Yeni daire bilgileri.
     * @return Güncellenmiş Daire nesnesi.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Daire> daireGuncelle(@PathVariable String id, @RequestBody Daire daireDetaylari) {
        Optional<Daire> daireData = daireRepository.findById(id);

        if (daireData.isPresent()) {
            Daire mevcutDaire = daireData.get();
            // Tüm alanları gelen yeni verilerle güncelle
            mevcutDaire.setBlokId(daireDetaylari.getBlokId());
            mevcutDaire.setKapiNo(daireDetaylari.getKapiNo());
            mevcutDaire.setMulkSahibiAdi(daireDetaylari.getMulkSahibiAdi());
            mevcutDaire.setMulkSahibiTelefonu(daireDetaylari.getMulkSahibiTelefonu());
            mevcutDaire.setDurum(daireDetaylari.getDurum());
            mevcutDaire.setKiraciAdi(daireDetaylari.getKiraciAdi());
            mevcutDaire.setKiraciTelefonu(daireDetaylari.getKiraciTelefonu());

            return new ResponseEntity<>(daireRepository.save(mevcutDaire), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> daireSil(@PathVariable String id) {
        try {
            daireRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
