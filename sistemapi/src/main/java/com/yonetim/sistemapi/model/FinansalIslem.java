package com.yonetim.sistemapi.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDate;

@Document(collection = "finansal_islemler")
@Data
public class FinansalIslem {

    @Id
    private String id;

    private IslemTipi tip; // GELIR veya GIDER
    private String aciklama;
    private BigDecimal tutar;
    private LocalDate tarih;

    // Opsiyonel: Eğer işlem bir daire ile ilgiliyse (aidat ödemesi, özel bir gelir vb.)
    private String daireId;

    // Opsiyonel: Eğer işlem bir blok ile ilgiliyse (asansör tamiri vb.)
    private String blokId;

    // Giderler için bir kategori
    private String kategori;


    public enum IslemTipi {
        GELIR,
        GIDER
    }
}
