package com.yonetim.sistemapi.repository;

import com.yonetim.sistemapi.model.AidatKaydi;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AidatKaydiRepository extends MongoRepository<AidatKaydi, String> {

    /**
     * Belirli bir döneme ait tüm aidat kayıtlarını bulur.
     * @param donem Ay ve yıl bilgisi (örn: "2025-08").
     * @return Belirtilen döneme ait aidat kayıtlarının listesi.
     */
    List<AidatKaydi> findByDonem(String donem);

    /**
     * Belirli bir dairenin belirli bir dönemdeki aidat kaydını bulur.
     * @param daireId Dairenin ID'si.
     * @param donem Ay ve yıl bilgisi (örn: "2025-08").
     * @return İlgili aidat kaydını içeren bir Optional nesnesi.
     */
    Optional<AidatKaydi> findByDaireIdAndDonem(String daireId, String donem);

    /**
     * Belirli bir daireye ait tüm aidat kayıtlarını bulur.
     * @param daireId Dairenin ID'si.
     * @return Belirtilen daireye ait aidat kayıtlarının listesi.
     */
    List<AidatKaydi> findByDaireId(String daireId);
}
