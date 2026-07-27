package com.rateio.roleapi.dto;

import jakarta.validation.constraints.NotNull;

public record EntrarGrupoRequest(
        Long grupoId,
        String conviteCodigo,
        @NotNull Long usuarioId
) {
}
