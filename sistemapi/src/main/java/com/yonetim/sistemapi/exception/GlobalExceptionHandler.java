package com.yonetim.sistemapi.exception;

import com.yonetim.sistemapi.payload.ErrorResponse;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Objects;

@ControllerAdvice
public class GlobalExceptionHandler {

    // @Valid anotasyonundan kaynaklanan hataları yakalar (örn: @NotBlank)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        String errorMessage = ex.getBindingResult().getAllErrors().get(0).getDefaultMessage();
        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                errorMessage, // Modeldeki mesajımızı direkt kullanıyoruz
                System.currentTimeMillis()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    // Veritabanındaki unique kuralı ihlal edildiğinde oluşan hatayı yakalar
    @ExceptionHandler(DuplicateKeyException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateKeyException(DuplicateKeyException ex) {
        // Hata mesajından daha anlaşılır bir sonuç çıkarmaya çalışalım
        String message = "Girilen bir değer daha önce kaydedilmiş. Lütfen kontrol ediniz.";
        if (Objects.requireNonNull(ex.getMessage()).contains("blok_kapi_unique_idx")) {
            message = "Bu blokta aynı kapı numarasına sahip başka bir daire zaten mevcut.";
        }
        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.CONFLICT.value(), // 409 Conflict daha uygun bir durum kodu
                message,
                System.currentTimeMillis()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }
}