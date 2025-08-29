package com.yonetim.sistemapi.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class FinansalRaporDto {
    private BigDecimal toplamGelir;
    private BigDecimal toplamGider;
    private BigDecimal netBakiye;
    private List<KategoriOzetDto> gelirlerByKategori;
    private List<KategoriOzetDto> giderlerByKategori;
}