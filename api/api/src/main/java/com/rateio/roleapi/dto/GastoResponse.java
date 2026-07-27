package com.rateio.roleapi.dto;

import com.rateio.roleapi.model.Gasto;

import java.math.BigDecimal;
import java.util.List;

public record GastoResponse(
        Long id,
        String descricao,
        BigDecimal valor,
        String categoria,
        String comprovanteUrl,
        Boolean ativo,
        Long eventoId,
        UsuarioResponse quemPagou,
        List<UsuarioResponse> participantes
) {
    public static GastoResponse from(Gasto gasto) {
        List<UsuarioResponse> participantes = gasto.getParticipantes() == null
                ? List.of()
                : gasto.getParticipantes().stream().map(UsuarioResponse::from).toList();

        return new GastoResponse(
                gasto.getId(),
                gasto.getDescricao(),
                gasto.getValor(),
                gasto.getCategoria(),
                gasto.getComprovanteUrl(),
                gasto.getAtivo(),
                gasto.getEvento().getId(),
                UsuarioResponse.from(gasto.getQuemPagou()),
                participantes
        );
    }
}
