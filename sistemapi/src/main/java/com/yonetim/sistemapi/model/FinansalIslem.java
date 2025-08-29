package com.yonetim.sistemapi.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;         // GÜNCELLEME 1: Gerekli import'lar eklendi.
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.math.BigDecimal;
import java.time.LocalDate;

@Document(collection = "finansal_islemler")
@Data
public class FinansalIslem {

    @Id
    private String id;

    // GÜNCELLEME 2: Enum tipinin veritabanına her zaman String olarak kaydedilmesini garanti altına alıyoruz.
    // Bu, sorgularımızda "GELIR" veya "GIDER" metinleriyle güvenilir bir şekilde filtreleme yapabilmemizi sağlar.
    @Field(targetType = FieldType.STRING)
    private IslemTipi tip; // GELIR veya GIDER

    private String aciklama;
    private BigDecimal tutar;
    private LocalDate tarih;

    private String daireId;
    private String blokId;
    private String kategori;

    private boolean isIptalEdildi = false;
    private String duzeltmeKaydiId;


    public enum IslemTipi {
        GELIR,
        GIDER
    }
}