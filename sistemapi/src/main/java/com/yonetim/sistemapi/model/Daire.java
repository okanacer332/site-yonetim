package com.yonetim.sistemapi.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

// GÜNCELLEME 1: @CompoundIndex anotasyonu eklendi.
// Bu anotasyon, veritabanı seviyesinde 'blokId' ve 'kapiNo' alanlarının kombinasyonunun
// benzersiz (unique) olmasını zorunlu kılar. Bu sayede aynı bloğa aynı kapı numarasına
// sahip ikinci bir dairenin kaydedilmesini engeller.
@Document(collection = "daireler")
@CompoundIndex(name = "blok_kapi_unique_idx", def = "{'blokId' : 1, 'kapiNo' : 1}", unique = true)
@Data
public class Daire {

    @Id
    private String id;

    // GÜNCELLEME 2: Alanlara doğrulama (validation) anotasyonları eklendi.
    // Bu kurallar, API'ye bir Daire nesnesi kaydedilmek istendiğinde otomatik olarak
    // kontrol edilecek ve uyulmadığı takdirde hata döndürecektir.
    @NotBlank(message = "Daire bir bloğa ait olmalıdır.")
    private String blokId;

    @Min(value = 1, message = "Kapı numarası 1'den küçük olamaz.")
    private int kapiNo;

    // Mülk sahibi bilgileri (her zaman zorunlu)
    @NotBlank(message = "Mülk sahibi adı boş bırakılamaz.")
    private String mulkSahibiAdi;

    @NotBlank(message = "Mülk sahibi telefonu boş bırakılamaz.")
    private String mulkSahibiTelefonu;

    @NotNull(message = "Dairenin durumu (Mülk Sahibi/Kiracı/Boş) belirtilmelidir.")
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