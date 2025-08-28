package com.yonetim.sistemapi.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDate;

@Document(collection = "aidatlar")
@Data
public class AidatKaydi {

    @Id
    private String id;

    private String daireId;

    // Aidatın hangi döneme ait olduğunu belirtir (örn: 2025-08)
    private String donem;

    private BigDecimal borcTutari;

    private boolean odendiMi;

    private LocalDate odemeTarihi; // Ödeme yapıldığında bu tarih doldurulur
}
