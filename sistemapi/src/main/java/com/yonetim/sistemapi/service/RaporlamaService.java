package com.yonetim.sistemapi.service;

import com.yonetim.sistemapi.dto.FinansalRaporDto;
import com.yonetim.sistemapi.dto.KategoriOzetDto;
import com.yonetim.sistemapi.model.FinansalIslem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.*;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.springframework.data.mongodb.core.aggregation.Aggregation.*;

@Service
public class RaporlamaService {

    @Autowired
    private MongoTemplate mongoTemplate;

    public FinansalRaporDto getFinansalOzet(LocalDate baslangicTarihi, LocalDate bitisTarihi) {

        // --- GELİR ÖZETİ SORGUSU ---
        Aggregation gelirAggregation = newAggregation(
                match(Criteria.where("tarih").gte(baslangicTarihi).lte(bitisTarihi).and("tip").is(FinansalIslem.IslemTipi.GELIR)),
                group("kategori").sum("tutar").as("toplamTutar"),
                project("toplamTutar").and("_id").as("kategori")
        );
        AggregationResults<KategoriOzetDto> gelirSonuclari = mongoTemplate.aggregate(gelirAggregation, "finansal_islemler", KategoriOzetDto.class);
        List<KategoriOzetDto> gelirler = gelirSonuclari.getMappedResults();


        // --- GİDER ÖZETİ SORGUSU (HATANIN DÜZELTİLDİĞİ YER) ---
        Aggregation giderAggregation = newAggregation(
                // DÜZELTİLMESİ GEREKEN YER BURASI
                match(Criteria.where("tarih").gte(baslangicTarihi).lte(bitisTarihi).and("tip").is(FinansalIslem.IslemTipi.GIDER)),
                group("kategori").sum("tutar").as("toplamTutar"),
                project("toplamTutar").and("_id").as("kategori")
        );
        AggregationResults<KategoriOzetDto> giderSonuclari = mongoTemplate.aggregate(giderAggregation, "finansal_islemler", KategoriOzetDto.class);
        List<KategoriOzetDto> giderler = giderSonuclari.getMappedResults();


        // --- TOPLAMLARI HESAPLAMA ---
        BigDecimal toplamGelir = gelirler.stream().map(KategoriOzetDto::getToplamTutar).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal toplamGider = giderler.stream().map(KategoriOzetDto::getToplamTutar).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal netBakiye = toplamGelir.subtract(toplamGider);


        // --- RAPORU OLUŞTURMA ---
        FinansalRaporDto rapor = new FinansalRaporDto();
        rapor.setToplamGelir(toplamGelir);
        rapor.setToplamGider(toplamGider);
        rapor.setNetBakiye(netBakiye);
        rapor.setGelirlerByKategori(gelirler);
        rapor.setGiderlerByKategori(giderler);

        return rapor;
    }
}