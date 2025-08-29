package com.yonetim.sistemapi.controller;

import com.yonetim.sistemapi.dto.DonemOzetiDto;
import com.yonetim.sistemapi.repository.AidatKaydiRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/raporlar/aidat") // Raporlama endpoint'lerini bu yol altında toplayacağız.
public class AidatRaporlamaController {

    @Autowired
    private AidatKaydiRepository aidatKaydiRepository;

    /**
     * Tüm dönemlerin aidat özetini (toplam borç, ödenen tutar, tahsilat oranı vb.)
     * hesaplayıp döndürür.
     * @return Dönem özetlerini içeren bir liste.
     */
    @GetMapping("/donem-ozetleri")
    public ResponseEntity<List<DonemOzetiDto>> donemOzetleriniGetir() {
        // Repository'e eklediğimiz güçlü aggregation metodunu burada çağırıyoruz.
        List<DonemOzetiDto> ozetler = aidatKaydiRepository.getDonemOzetleri();
        return new ResponseEntity<>(ozetler, HttpStatus.OK);
    }
}