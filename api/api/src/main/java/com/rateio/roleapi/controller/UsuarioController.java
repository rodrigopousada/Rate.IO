package com.rateio.roleapi.controller;

import com.rateio.roleapi.dto.LoginRequest;
import com.rateio.roleapi.model.Usuario;
import com.rateio.roleapi.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@CrossOrigin("*") // Para o celular conseguir acessar
@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioRepository repository;

    public UsuarioController(UsuarioRepository repository) {
        this.repository = repository;
    }

    @PostMapping("/login")
    public ResponseEntity<Usuario> login(@RequestBody LoginRequest request) {

        Optional<Usuario> usuarioLogado = repository.findByEmailAndSenha(request.email(), request.senha());

        if (usuarioLogado.isPresent()) {
            return ResponseEntity.ok(usuarioLogado.get()); // Devolve os dados do usuário
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // Senha ou email errados
        }
    }
}