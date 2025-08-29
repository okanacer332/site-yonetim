package com.yonetim.sistemapi.repository;

import com.yonetim.sistemapi.dto.DonemOzetiDto; // GÜNCELLEME 1: Yeni DTO'yu import ediyoruz.
import com.yonetim.sistemapi.model.AidatKaydi;
import org.springframework.data.mongodb.repository.Aggregation; // GÜNCELLEME 2: Aggregation importu.
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AidatKaydiRepository extends MongoRepository<AidatKaydi, String> {

    List<AidatKaydi> findByDonem(String donem);

    Optional<AidatKaydi> findByDaireIdAndDonem(String daireId, String donem);

    List<AidatKaydi> findByDaireId(String daireId);

    // GÜNCELLEME 3: DÖNEM BAZINDA ÖZET GETİREN AGGREGATION SORGUSU
    /**
     * Tüm aidat kayıtlarını döneme göre gruplayarak finansal bir özet oluşturur.
     * Bu sorgu, veritabanı seviyesinde çalıştığı için çok performanslıdır.
     * @return Her bir dönemin özetini içeren bir liste döner.
     */
    @Aggregation(pipeline = {
            // 1. Aşama: 'donem' alanına göre grupla ve hesaplamaları yap
            "{ $group: { " +
                    "_id: '$donem', " +
                    "toplamBorc: { $sum: '$borcTutari' }, " +
                    "odenenTutar: { $sum: { $cond: [ '$odendiMi', '$borcTutari', 0 ] } }, " +
                    "toplamDaireSayisi: { $sum: 1 }, " +
                    "odenenDaireSayisi: { $sum: { $cond: [ '$odendiMi', 1, 0 ] } } " +
                    "} }",
            // 2. Aşama: Sonuçları döneme göre tersten sırala (en yeni en üstte)
            "{ $sort: { _id: -1 } }",
            // 3. Aşama: Alan isimlerini DTO ile uyumlu hale getir
            "{ $project: { " +
                    "_id: 0, " +
                    "donem: '$_id', " +
                    "toplamBorc: 1, " +
                    "odenenTutar: 1, " +
                    "toplamDaireSayisi: 1, " +
                    "odenenDaireSayisi: 1 " +
                    "} }"
    })
    List<DonemOzetiDto> getDonemOzetleri();
}