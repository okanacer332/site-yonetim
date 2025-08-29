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

    // GÜNCELLEME 1: İşlemin iptal durumunu tutan alan.
    // Bu alan 'true' ise, işlem iptal edilmiş ve etkisi bir ters kayıtla sıfırlanmıştır.
    // Arayüzde bu tür kayıtları gri veya üstü çizili gösterebiliriz.
    private boolean isIptalEdildi = false;

    // GÜNCELLEME 2: Düzeltme kaydının ID'sini tutan alan.
    // Bir işlem iptal edildiğinde, onu düzelten ters kaydın ID'si buraya yazılır.
    // Bu, orijinal işlem ile düzeltme işlemi arasında doğrudan bir bağ kurar.
    private String duzeltmeKaydiId;


    public enum IslemTipi {
        GELIR,
        GIDER
    }
}