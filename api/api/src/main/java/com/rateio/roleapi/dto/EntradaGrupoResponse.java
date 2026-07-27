package com.rateio.roleapi.dto;

public record EntradaGrupoResponse(
        String status,
        String mensagem,
        GrupoResponse grupo
) {
}
