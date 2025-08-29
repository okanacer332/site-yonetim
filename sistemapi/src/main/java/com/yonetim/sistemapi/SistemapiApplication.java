package com.yonetim.sistemapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync; // GÜNCELLEME 1: Async için import eklendi.

@SpringBootApplication
@EnableAsync // GÜNCELLEME 2: Spring Boot'a asenkron metodları çalıştırma yetkisi verildi.
public class SistemapiApplication {

	public static void main(String[] args) {
		SpringApplication.run(SistemapiApplication.class, args);
	}

}