package com.yonetim.sistemapi.repository;

import com.yonetim.sistemapi.model.Demirbas;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

/**
 * Bu arayüz, Demirbas modeli için veritabanı işlemlerini yönetir.
 * MongoRepository'den kalıtım aldığı için, temel CRUD işlemleri
 * (save, findById, findAll, delete vb.) otomatik olarak Spring tarafından sağlanır.
 */
@Repository
public interface DemirbasRepository extends MongoRepository<Demirbas, String> {
    // Bu modül için şimdilik özel bir sorguya ihtiyacımız yok.
    // Temel CRUD operasyonları yeterlidir.
}
