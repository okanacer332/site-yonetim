package com.yonetim.sistemapi.service;

import com.yonetim.sistemapi.model.AidatKaydi;
import com.yonetim.sistemapi.model.Daire;
import com.yonetim.sistemapi.repository.AidatKaydiRepository;
import com.yonetim.sistemapi.repository.DaireRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TopluBorclandirmaService {

    @Autowired
    private AidatKaydiRepository aidatKaydiRepository;

    @Autowired
    private DaireRepository daireRepository;

    // Bu @Async anotasyonu sayesinde, bu metot çağrıldığı anda
    // Spring tarafından ayrı bir thread'de çalıştırılır.
    // Metodu çağıran (Controller) ise bu metodun bitmesini beklemeden
    // kendi işine devam eder ve kullanıcıya anında cevap döner.
    @Async
    public void aidatBorcuOlusturAsync(String donem, BigDecimal tutar) {
        System.out.println("Asenkron toplu borçlandırma işlemi başlatıldı. Thread: " + Thread.currentThread().getName());

        List<Daire> tumDaireler = daireRepository.findAll();
        List<AidatKaydi> yeniAidatKayitlari = new ArrayList<>();

        for (Daire daire : tumDaireler) {
            Optional<AidatKaydi> mevcutKayit = aidatKaydiRepository.findByDaireIdAndDonem(daire.getId(), donem);
            if (mevcutKayit.isEmpty()) {
                AidatKaydi yeniKayit = new AidatKaydi();
                yeniKayit.setDaireId(daire.getId());
                yeniKayit.setDonem(donem);
                yeniKayit.setBorcTutari(tutar);
                yeniKayit.setOdendiMi(false);
                yeniAidatKayitlari.add(yeniKayit);
            }
        }

        if (!yeniAidatKayitlari.isEmpty()) {
            aidatKaydiRepository.saveAll(yeniAidatKayitlari);
            System.out.println(donem + " dönemi için " + yeniAidatKayitlari.size() + " adet daireye borç kaydı oluşturuldu.");
        }
        System.out.println("Asenkron toplu borçlandırma işlemi tamamlandı.");
    }
}