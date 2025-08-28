package com.yonetim.sistemapi.repository;

import com.yonetim.sistemapi.model.Daire;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DaireRepository extends MongoRepository<Daire, String> {

    List<Daire> findByBlokId(String blokId);

}
