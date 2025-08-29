package com.yonetim.sistemapi.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "bloklar")
@Data
public class Blok {

    @Id
    private String id;

    @NotBlank(message = "Blok adı boş bırakılamaz.")
    private String ad;

}