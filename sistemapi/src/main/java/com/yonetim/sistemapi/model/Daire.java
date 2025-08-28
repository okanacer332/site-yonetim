package com.yonetim.sistemapi.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "daireler")
@Data
public class Daire {

    @Id
    private String id;

    private String blokId;

    private int kapiNo;

    // Mülk sahibi bilgileri (her zaman zorunlu)
    private String mulkSahibiAdi;
    private String mulkSahibiTelefonu;

    private DaireDurumu durum;

    // Kiracı bilgileri (sadece durum 'KIRACI' ise doldurulur)
    private String kiraciAdi;
    private String kiraciTelefonu;


    public enum DaireDurumu {
        MULK_SAHIBI, // Mülk sahibi oturuyor
        KIRACI,     // Kiracı oturuyor
        BOS         // Daire boş
    }
}
