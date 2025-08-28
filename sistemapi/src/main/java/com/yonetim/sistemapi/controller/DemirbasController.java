package com.yonetim.sistemapi.controller;

import com.yonetim.sistemapi.model.Demirbas;
import com.yonetim.sistemapi.repository.DemirbasRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin
@RequestMapping("/demirbaslar")
public class DemirbasController {

    @Autowired
    private DemirbasRepository demirbasRepository;

    /**
     * Tüm demirbaşları listeler.
     * @return Demirbaşların bir listesi.
     */
    @GetMapping
    public ResponseEntity<List<Demirbas>> tumDemirbaslariGetir() {
        List<Demirbas> demirbaslar = demirbasRepository.findAll();
        return new ResponseEntity<>(demirbaslar, HttpStatus.OK);
    }

    /**
     * Yeni bir demirbaş oluşturur.
     * @param yeniDemirbas Eklenecek demirbaşın bilgileri.
     * @return Oluşturulan yeni Demirbas nesnesi.
     */
    @PostMapping
    public ResponseEntity<Demirbas> yeniDemirbasEkle(@RequestBody Demirbas yeniDemirbas) {
        Demirbas kaydedilenDemirbas = demirbasRepository.save(yeniDemirbas);
        return new ResponseEntity<>(kaydedilenDemirbas, HttpStatus.CREATED);
    }

    /**
     * Mevcut bir demirbaşı günceller.
     * @param id Güncellenecek demirbaşın ID'si.
     * @param demirbasDetaylari Yeni demirbaş bilgileri.
     * @return Güncellenmiş Demirbas nesnesi.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Demirbas> demirbasGuncelle(@PathVariable String id, @RequestBody Demirbas demirbasDetaylari) {
        Optional<Demirbas> demirbasData = demirbasRepository.findById(id);

        if (demirbasData.isPresent()) {
            Demirbas mevcutDemirbas = demirbasData.get();
            mevcutDemirbas.setAd(demirbasDetaylari.getAd());
            mevcutDemirbas.setAlinmaTarihi(demirbasDetaylari.getAlinmaTarihi());
            mevcutDemirbas.setAdet(demirbasDetaylari.getAdet());
            mevcutDemirbas.setDurum(demirbasDetaylari.getDurum());
            mevcutDemirbas.setNotlar(demirbasDetaylari.getNotlar());
            return new ResponseEntity<>(demirbasRepository.save(mevcutDemirbas), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Bir demirbaşı siler.
     * @param id Silinecek demirbaşın ID'si.
     * @return Başarılı olursa 204 No Content.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> demirbasSil(@PathVariable String id) {
        try {
            demirbasRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
