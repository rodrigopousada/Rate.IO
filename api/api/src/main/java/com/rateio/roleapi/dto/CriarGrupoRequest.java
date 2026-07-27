package com.rateio.roleapi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CriarGrupoRequest(
        @NotBlank String nome,
        @NotNull Long criadorId,
        Boolean entradaComAprovacao,
        List<Long> membrosIds
) {
}
