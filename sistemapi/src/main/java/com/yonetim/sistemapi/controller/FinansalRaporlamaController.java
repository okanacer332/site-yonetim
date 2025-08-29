package com.yonetim.sistemapi.controller;

import com.yonetim.sistemapi.dto.FinansalRaporDto;
import com.yonetim.sistemapi.service.RaporlamaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@CrossOrigin
@RequestMapping("/raporlar/finansal")
public class FinansalRaporlamaController {

    @Autowired
    private RaporlamaService raporlamaService;

    @GetMapping("/ozet")
    public ResponseEntity<FinansalRaporDto> getFinansalOzet(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate baslangicTarihi,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate bitisTarihi) {

        FinansalRaporDto rapor = raporlamaService.getFinansalOzet(baslangicTarihi, bitisTarihi);
        return new ResponseEntity<>(rapor, HttpStatus.OK);
    }
}