package com.yonetim.sistemapi.controller;

import com.yonetim.sistemapi.model.Blok;
import com.yonetim.sistemapi.repository.BlokRepository;
import jakarta.validation.Valid; // GÜNCELLEME 1: @Valid için import eklendi.
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin
@RequestMapping("/bloklar")
public class BlokController {

    @Autowired
    private BlokRepository blokRepository;

    @GetMapping
    public ResponseEntity<List<Blok>> tumBloklariGetir() {
        List<Blok> bloklar = blokRepository.findAll();
        return new ResponseEntity<>(bloklar, HttpStatus.OK);
    }

    @PostMapping
    // GÜNCELLEME 2: @Valid anotasyonu eklendi.
    // Artık API'ye gelen 'yeniBlok' nesnesinin içindeki 'ad' alanının boş olup olmadığı kontrol edilecek.
    public ResponseEntity<Blok> yeniBlokEkle(@Valid @RequestBody Blok yeniBlok) {
        Blok kaydedilenBlok = blokRepository.save(yeniBlok);
        return new ResponseEntity<>(kaydedilenBlok, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    // GÜNCELLEME 3: @Valid anotasyonu eklendi.
    // Blok güncellenirken de 'ad' alanının boş bir değerle güncellenmesi engellendi.
    public ResponseEntity<Blok> blokGuncelle(@PathVariable String id, @Valid @RequestBody Blok blokDetaylari) {
        Optional<Blok> blokData = blokRepository.findById(id);

        if (blokData.isPresent()) {
            Blok mevcutBlok = blokData.get();
            mevcutBlok.setAd(blokDetaylari.getAd());
            return new ResponseEntity<>(blokRepository.save(mevcutBlok), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> blokSil(@PathVariable String id) {
        try {
            blokRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}