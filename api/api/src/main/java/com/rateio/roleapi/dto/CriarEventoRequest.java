package com.rateio.roleapi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CriarEventoRequest(
        @NotBlank String nome,
        @PositiveOrZero BigDecimal metaValor,
        @NotNull LocalDate dataEvento,
        @NotNull Long grupoId
) {
}
