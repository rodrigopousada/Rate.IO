package com.rateio.roleapi.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CadastroUsuarioRequest(
        @NotBlank String nome,
        @Email @NotBlank String email,
        @Size(min = 6, message = "A senha deve ter pelo menos 6 caracteres") String senha
) {
}
