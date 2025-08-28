package com.yonetim.sistemapi.repository;

import com.yonetim.sistemapi.model.Blok;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BlokRepository extends MongoRepository<Blok, String> {

}
