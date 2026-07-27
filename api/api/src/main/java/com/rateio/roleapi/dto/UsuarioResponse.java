package com.rateio.roleapi.dto;

import com.rateio.roleapi.model.Usuario;

public record UsuarioResponse(
        Long id,
        String nome,
        String email
) {
    public static UsuarioResponse from(Usuario usuario) {
        return new UsuarioResponse(usuario.getId(), usuario.getNome(), usuario.getEmail());
    }
}
