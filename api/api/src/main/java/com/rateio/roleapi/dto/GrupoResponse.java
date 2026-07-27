package com.rateio.roleapi.dto;

import com.rateio.roleapi.model.Grupo;

import java.util.List;

public record GrupoResponse(
        Long id,
        String nome,
        String conviteCodigo,
        String conviteLink,
        Boolean entradaComAprovacao,
        UsuarioResponse administrador,
        List<UsuarioResponse> membros
) {
    public static GrupoResponse from(Grupo grupo) {
        List<UsuarioResponse> membros = grupo.getMembros() == null
                ? List.of()
                : grupo.getMembros().stream().map(UsuarioResponse::from).toList();

        String conviteLink = grupo.getConviteCodigo() == null
                ? null
                : "rateio://clubes/entrar?codigo=" + grupo.getConviteCodigo();

        UsuarioResponse administrador = grupo.getAdministrador() == null
                ? null
                : UsuarioResponse.from(grupo.getAdministrador());

        return new GrupoResponse(
                grupo.getId(),
                grupo.getNome(),
                grupo.getConviteCodigo(),
                conviteLink,
                grupo.getEntradaComAprovacao(),
                administrador,
                membros
        );
    }
}
