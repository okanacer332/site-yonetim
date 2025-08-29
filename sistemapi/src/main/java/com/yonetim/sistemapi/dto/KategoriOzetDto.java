package com.yonetim.sistemapi.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class KategoriOzetDto {
    // Bu sınıf, bir kategoriye ait toplam tutarı taşır.
    // Örn: kategori="Elektrik", toplamTutar=5500.75
    private String kategori;
    private BigDecimal toplamTutar;
}