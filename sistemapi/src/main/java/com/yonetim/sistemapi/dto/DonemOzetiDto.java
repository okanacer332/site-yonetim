package com.yonetim.sistemapi.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DonemOzetiDto {
    // Bu sınıf, aggregation sorgusunun sonuçlarını taşımak için kullanılır.
    // Alan isimleri, sorgudaki alan isimleriyle eşleşmelidir.
    private String donem;
    private BigDecimal toplamBorc;
    private BigDecimal odenenTutar;
    private int toplamDaireSayisi;
    private int odenenDaireSayisi;
}