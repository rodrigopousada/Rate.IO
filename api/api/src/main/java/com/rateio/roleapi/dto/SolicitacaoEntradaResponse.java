package com.rateio.roleapi.dto;

import com.rateio.roleapi.model.SolicitacaoEntradaGrupo;

import java.time.LocalDateTime;

public record SolicitacaoEntradaResponse(
        Long id,
        String status,
        LocalDateTime dataCriacao,
        UsuarioResponse usuario
) {
    public static SolicitacaoEntradaResponse from(SolicitacaoEntradaGrupo solicitacao) {
        return new SolicitacaoEntradaResponse(
                solicitacao.getId(),
                solicitacao.getStatus(),
                solicitacao.getDataCriacao(),
                UsuarioResponse.from(solicitacao.getUsuario())
        );
    }
}
