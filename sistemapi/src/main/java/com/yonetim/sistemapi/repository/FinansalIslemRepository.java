package com.yonetim.sistemapi.repository;

import com.yonetim.sistemapi.model.FinansalIslem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FinansalIslemRepository extends MongoRepository<FinansalIslem, String> {

    /**
     * Belirli bir tarih aralığındaki tüm finansal işlemleri bulur.
     */
    List<FinansalIslem> findByTarihBetween(LocalDate baslangicTarihi, LocalDate bitisTarihi);

    /**
     * Belirli bir daireye ait tüm finansal işlemleri bulur.
     */
    List<FinansalIslem> findByDaireId(String daireId);

    /**
     * Belirli bir bloğa ait tüm finansal işlemleri bulur.
     */
    List<FinansalIslem> findByBlokId(String blokId);

    // GÜNCELLEME: Artık MongoTemplate ile Servis katmanında yaptığımız için
    // hatalı çalışan @Aggregation metotları buradan kaldırıldı.
}