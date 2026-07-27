package com.rateio.roleapi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.List;

public record CriarGastoRequest(
        @NotBlank String descricao,
        @NotNull @Positive BigDecimal valor,
        String categoria,
        String comprovanteUrl,
        @NotNull Long eventoId,
        @NotNull Long pagadorId,
        List<Long> participantesIds
) {
}
