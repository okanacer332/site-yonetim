package com.yonetim.sistemapi.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Document(collection = "demirbaslar")
@Data
public class Demirbas {

    @Id
    private String id;

    private String ad;
    private LocalDate alinmaTarihi;
    private int adet;
    private DemirbasDurumu durum;
    private String notlar; // Opsiyonel

    public enum DemirbasDurumu {
        KULLANIMDA,
        ARIZALI,
        DEPODA,
        SERVISTE,
        SATILDI,
        HURDA
    }
}
