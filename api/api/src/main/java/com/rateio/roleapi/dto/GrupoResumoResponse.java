package com.rateio.roleapi.dto;

import com.rateio.roleapi.model.Grupo;

public record GrupoResumoResponse(
        Long id,
        String nome
) {
    public static GrupoResumoResponse from(Grupo grupo) {
        return new GrupoResumoResponse(grupo.getId(), grupo.getNome());
    }
}
