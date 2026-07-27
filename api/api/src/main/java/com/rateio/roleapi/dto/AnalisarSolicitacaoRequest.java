package com.rateio.roleapi.dto;

import jakarta.validation.constraints.NotNull;

public record AnalisarSolicitacaoRequest(
        @NotNull Long administradorId,
        @NotNull Boolean aprovar
) {
}
